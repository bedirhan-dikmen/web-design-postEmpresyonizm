# Kerinti Soft homepage — launch checklist

Run `npm run check:launch`. It lists every open item below and fails (exit 1) until they are all resolved. It also
scans `app/`, `components/` and `lib/` for `localhost`, `127.0.0.1` and example domains.

## 1. Business data — `.env` (deployment values) + `lib/site/site.json` (brand data)

`lib/site/config.ts` assembles both. An empty value is a placeholder: the site renders **nothing** for it, and no fake
phone number, address or link is ever published. In development, the contact section shows a dashed notice listing
what is still missing. That notice is compiled out of production builds. `NEXT_PUBLIC_*` values are public and baked in
at build time, so a change needs a rebuild (`docker compose up -d --build`). See DEPLOYMENT.md.

| Setting | Where | Now | Effect while missing |
|---|---|---|---|
| canonical URL | `site.json → url` (override: `NEXT_PUBLIC_SITE_URL`) | `https://kerinti.com.tr` | — (the final QR encodes `https://kerinti.com.tr/#iletisim`) |
| phone | `NEXT_PUBLIC_CONTACT_PHONE` | empty | row omitted (contact section, footer) |
| e-mail | `NEXT_PUBLIC_CONTACT_EMAIL` | empty | row omitted |
| address | `NEXT_PUBLIC_CONTACT_ADDRESS` (lines separated by `|`) | empty | row omitted |
| form endpoint | `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` | empty | the form is visible but **cannot be sent**, and says so ("İletişim formu henüz etkin değil…") |
| LinkedIn | `site.json → social.linkedin` | `null` | row omitted (if there is no account, leave `null` and remove the check in `scripts/check-launch.mjs`) |
| KVKK / privacy / cookies | `site.json → legal.*` | `null` | no link rendered |

A malformed value (e.g. a form endpoint that is not `https://`) fails the build with a clear message instead of shipping.

## 2. Blockers before a public launch

1. **Contact channels.** Today a visitor has no way to reach the company: no phone, e-mail or address is
   configured, and the form has no endpoint. At least one channel must be filled in.
2. **Form backend.** Set `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` (public: no secret API key in it). It must be an HTTPS URL that accepts
   `POST application/json { name, company, phone, email, topic, message, consent }` and answers 2xx. The integration
   point is `lib/site/contact.ts → submitContact`. Nothing else sends form data, and a failure is always reported as
   a failure.
3. **KVKK.** The form collects personal data (name, phone, e-mail), so a KVKK aydınlatma metni is legally required.
   Publish the page and set `site.json → legal.kvkk`; the consent line then links to it automatically. Legal text must come from
   Kerinti.
4. **Mobile film.** The film is still desktop-first. In portrait the design frame crops to x ≈ 710–1210, so the
   Chapter 1–5 copy is cut off on phones: Chapter 1's intro is entirely off-screen at 390 px. The navigation, CTA
   target, contact section and footer are fully responsive. The film itself needs the planned mobile compositions
   (CHAPTER4_ARTWORK.md §4, CHAPTER5_NOTES.md → Mobile) before a mobile launch.
5. **Physical phone scan of the final QR** on the real domain: an iPhone Camera, an Android Camera / Google Lens and
   one in-app scanner, from ~30 cm and ~1 m. Emulated tests pass (below), but a real device has not scanned it.

## 3. What is verified (Docker production container, see DEPLOYMENT.md)

| Check | Result |
|---|---|
| TypeScript / `next build` | pass |
| Review tools (`?t=`, `?debug`, `?hideText`, `window.__film`) | compiled out: the URL parameters are ignored, no hook is exposed |
| Dev-only placeholder notice | not present |
| Console | no errors or warnings on load or while scrolling |
| Network | 0 failed requests, 0 broken images |
| `localhost` / `example.com` in source or rendered HTML | none |
| `<html lang>` / title | `tr` / "Kerinti Soft — NeXa ile restoran operasyonu tek yerden" |
| Final CTA | one button, **İletişime Geç** → `#iletisim`; smooth scroll (instant with reduced motion); focus moves to the "Birlikte konuşalım." heading; the film is not restarted |
| Final QR | encodes `https://kerinti.com.tr/#iletisim`; decoded by jsQR, ZXing and zxing-cpp from the real rendered frame (Docker production container) under 16 simulated camera conditions: 45/48, zxing-cpp 16/16, 0 wrong reads |
| Navigation | Kerinti Soft / Ana Sayfa → `#ust`, NeXa → `#nexa` (the product story), İletişim → `#iletisim`. Only existing destinations |
| Footer | brand + description, Ürün (NeXa, İletişim), contact/social/legal only when configured, `© <current year> Kerinti Soft. Tüm hakları saklıdır.` (year computed in the browser) |
| Responsive (contact + footer) | 390, 768 and 2560 px: no horizontal overflow, inputs 50 px, button 52 px, nav collapses to NeXa · İletişim on phones |
| Film regression | Chapters 1–4 identical to `chapter4-lock`; Chapter 5 path-independent forward/reverse/fast/fling; no camera cut |

## 4. Not built on purpose (no dead links)

Hakkımızda and Ekibimiz pages, and the KVKK, Gizlilik and Çerez pages, do not exist. They are **not linked
anywhere**. Add the page, then add its link (legal pages: set the path in `site.json`).
