# syntax=docker/dockerfile:1
#
# Kerinti Soft website: Next.js standalone production image.
#   deps     npm ci from the lockfile (deterministic)
#   builder  next build → .next/standalone + .next/static
#   runner   only the standalone server, static files and public/ — non-root, port 3020
#
# The homepage is prerendered at BUILD time, so the NEXT_PUBLIC_* values below are baked into the HTML and the
# browser bundle when the image is built (docker compose passes them from .env as build args).
# They are public by definition: never pass a secret here.

ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund


FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_SITE_URL=""
ARG NEXT_PUBLIC_CONTACT_EMAIL=""
ARG NEXT_PUBLIC_CONTACT_PHONE=""
ARG NEXT_PUBLIC_CONTACT_ADDRESS=""
ARG NEXT_PUBLIC_CONTACT_FORM_ENDPOINT=""
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_CONTACT_EMAIL=${NEXT_PUBLIC_CONTACT_EMAIL} \
    NEXT_PUBLIC_CONTACT_PHONE=${NEXT_PUBLIC_CONTACT_PHONE} \
    NEXT_PUBLIC_CONTACT_ADDRESS=${NEXT_PUBLIC_CONTACT_ADDRESS} \
    NEXT_PUBLIC_CONTACT_FORM_ENDPOINT=${NEXT_PUBLIC_CONTACT_FORM_ENDPOINT}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


FROM ${NODE_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3020

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3020
CMD ["node", "server.js"]
