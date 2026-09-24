# Kerinti Soft website — deployment

Path to production: **GitHub → Ubuntu server (CasaOS) → Docker Compose → Cloudflare Tunnel → kerinti.com.tr**.

The site is one Next.js container (`kerinti-empresyonizm`) that serves HTTP on port 3020. It uses no database, no reverse proxy
and no other services. Cloudflare Tunnel runs separately and is **not** part of this repository.

| File | Purpose |
|---|---|
| `Dockerfile` | multi-stage build (Node 22 Alpine, `npm ci` → `next build` → standalone runtime, non-root) |
| `docker-compose.yml` | the `kerinti-empresyonizm` service: port, healthcheck, restart policy, build args |
| `.env.example` | every setting the site reads; copy it to `.env` on the server |
| `.dockerignore` | keeps `.git`, `.env`, `node_modules`, art sources, docs and scratch out of the image |

## Settings (`.env`)

`cp .env.example .env`, then fill it in. `.env` is ignored by Git and by Docker, so it never leaves the server.

| Variable | Needed | Meaning |
|---|---|---|
| `APP_PORT` | optional (default `3020`) | host port the site is published on. Change it if 3020 is taken on the server. |
| `NEXT_PUBLIC_SITE_URL` | optional | canonical origin. Leave it empty for `https://kerinti.com.tr` (set in `lib/site/site.json`). The final QR encodes `<origin>/#iletisim`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | for launch | e-mail shown in the contact section and the footer |
| `NEXT_PUBLIC_CONTACT_PHONE` | for launch | e.g. `+90 212 000 00 00` |
| `NEXT_PUBLIC_CONTACT_ADDRESS` | for launch | address lines separated by `\|` |
| `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` | for the form | HTTPS URL the form POSTs JSON to (must answer 2xx). While empty, the form says online sending is not active and sends nothing. |

**Important:**
- **`NEXT_PUBLIC_*` values are public.** They are written into the page and the browser bundle, so never put a password,
  token or API key in them.
- **They are baked in when the image is built.** After editing `.env`, rebuild with `docker compose up -d --build`. A
  plain `docker compose restart` does not pick up the change.
- An empty value is simply not shown. A malformed value (for example an endpoint that doesn't start with `https://`)
  stops the build with a clear message.

`npm run check:launch` lists everything that is still empty.

## First deployment

```bash
git clone https://github.com/bedirhan-dikmen/web-design-postEmpresyonizm.git
cd web-design-postEmpresyonizm

cp .env.example .env
nano .env

docker compose up -d --build
```

Then check it:

```bash
docker compose ps                  # STATUS should become "Up … (healthy)" within ~30 s
docker compose logs -f --tail=100
```

Local access: `http://SERVER_IP:3020` (or the `APP_PORT` you set).

## Future updates

```bash
cd web-design-postEmpresyonizm
git pull
docker compose up -d --build
```

Optional cleanup of old image layers:

```bash
docker image prune -f
```

## Stop

```bash
docker compose down
```

## Restart

```bash
docker compose restart
```

## Healthcheck

Compose requests `http://127.0.0.1:3020/` inside the container every 30 s. The container's own Node.js runtime makes
the request, so no extra tools are installed. Three failures in a row mark it `unhealthy`. `restart: unless-stopped`
brings the container back after a crash or a server reboot.

## CasaOS

This is a standard Compose project. No CasaOS-specific configuration is required. There are two ways to run it:

1. **Terminal (recommended).** SSH into the server, or open CasaOS's terminal, and use the commands above in the
   cloned repository. This is the simplest route because the image is built from the repository's `Dockerfile`.
2. **CasaOS custom app.** Use *App Store → Custom Install → Import* and paste `docker-compose.yml`. CasaOS's importer
   is designed for pre-built images and may not build from a local `Dockerfile`, so build the image in the
   repository first with `docker compose build`. That creates `kerinti-empresyonizm:latest`. Then import. Enter the `.env`
   values as build args or rebuild from the terminal after any change, because the `NEXT_PUBLIC_*` values are baked in
   at build time.

Either way the container is named `kerinti-empresyonizm` and listens on `APP_PORT` (default 3020).

## Cloudflare Tunnel

`cloudflared` runs separately: as a CasaOS app, its own container, or a system service. Its credentials and tunnel
token stay on the server, never in this repository and never in `docker-compose.yml`.

In the Cloudflare Zero Trust dashboard, add a **public hostname**:

| Public hostname | Service |
|---|---|
| `kerinti.com.tr` | `http://SERVER_IP:3020` |
| `www.kerinti.com.tr` (optional) | the same service, or a Cloudflare redirect rule to `https://kerinti.com.tr` |

The service address depends on where `cloudflared` runs:

| `cloudflared` runs … | Service URL |
|---|---|
| on the host (system service) | `http://localhost:3020` |
| in a container on the same server | `http://SERVER_IP:3020` (the server's LAN IP), or attach the `cloudflared` container to the `kerinti-empresyonizm_default` network and use `http://kerinti-empresyonizm:3020` |
| on another machine in the LAN | `http://SERVER_IP:3020` |

Cloudflare terminates HTTPS. The container itself only speaks HTTP. If the tunnel is the only way in, the server's
firewall does not need to open port 3020 to the internet.

After the domain is live, open `https://kerinti.com.tr`. Then scan the final QR at the end of the film with a phone.
It leads to `https://kerinti.com.tr/#iletisim`.

## Before going public

Read `LAUNCH_CHECKLIST.md`. Open items include the contact channels, the form endpoint, the KVKK text and the mobile
version of the film.
