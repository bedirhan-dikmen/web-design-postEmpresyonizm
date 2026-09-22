import RAW from './site.json';

/**
 * Typed access to the site's business data — the one place it is assembled.
 *
 *   lib/site/site.json      brand data, legal paths, the canonical URL
 *   NEXT_PUBLIC_* env vars  deployment values: contact channels, the form endpoint, a URL override
 *
 * NEXT_PUBLIC_* values are PUBLIC: Next.js inlines them into the page and the browser bundle at BUILD time
 * (in Docker they are build args, see docker-compose.yml). Never put a secret in them.
 * An empty or missing value is a placeholder: components render nothing for it, never a made-up value.
 */

export interface Phone {
  display: string;
  tel: string;
}

export interface SiteConfig {
  name: string;
  description: string;
  product: string;
  url: string | null;
  contactAnchor: string;
  contact: { phone: Phone | null; email: string | null; address: string[] | null };
  social: { linkedin: string | null };
  form: { endpoint: string | null };
  legal: { kvkk: string | null; privacy: string | null; cookies: string | null };
}

const value = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

/** a malformed deployment value fails the build loudly instead of shipping a broken link */
function checked(name: string, v: string | null, ok: (v: string) => boolean, hint: string): string | null {
  if (v !== null && !ok(v)) throw new Error(`${name}="${v}" geçersiz: ${hint}`);
  return v;
}

// each variable is read by its literal name, so Next.js can inline it
const ENV = {
  url: checked('NEXT_PUBLIC_SITE_URL', value(process.env.NEXT_PUBLIC_SITE_URL), (v) => /^https?:\/\/[^/\s]+\/?$/.test(v), 'yalnızca köken, ör. https://kerinti.com.tr'),
  email: checked('NEXT_PUBLIC_CONTACT_EMAIL', value(process.env.NEXT_PUBLIC_CONTACT_EMAIL), (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'bir e-posta adresi olmalı'),
  phone: checked('NEXT_PUBLIC_CONTACT_PHONE', value(process.env.NEXT_PUBLIC_CONTACT_PHONE), (v) => /^\+?[\d\s()-]{7,20}$/.test(v), 'ör. +90 212 000 00 00'),
  address: value(process.env.NEXT_PUBLIC_CONTACT_ADDRESS),
  endpoint: checked('NEXT_PUBLIC_CONTACT_FORM_ENDPOINT', value(process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT), (v) => /^https:\/\/\S+$/.test(v), 'https:// ile başlayan bir adres olmalı'),
};

export const SITE: SiteConfig = {
  name: RAW.name,
  description: RAW.description,
  product: RAW.product,
  url: (ENV.url ?? RAW.url)?.replace(/\/$/, '') ?? null,
  contactAnchor: RAW.contactAnchor,
  contact: {
    phone: ENV.phone ? { display: ENV.phone, tel: ENV.phone.replace(/[^\d+]/g, '') } : null,
    email: ENV.email,
    // address lines are separated by "|" in the variable
    address: ENV.address ? ENV.address.split('|').map((l) => l.trim()).filter(Boolean) : null,
  },
  social: RAW.social,
  form: { endpoint: ENV.endpoint },
  legal: RAW.legal,
};

export const CONTACT_HREF = `#${SITE.contactAnchor}`;

/** where the final QR leads: the contact section on the canonical origin, else on the origin actually serving the page */
export function qrTarget(): string | null {
  const origin = SITE.url ?? (typeof window !== 'undefined' ? window.location.origin : null);
  return origin ? `${origin}/${CONTACT_HREF}` : null;
}

/** every placeholder still open, for the dev-only notice */
export function missingSiteConfig(): string[] {
  const out: string[] = [];
  if (!SITE.url) out.push('site.json → url');
  if (!SITE.contact.phone) out.push('NEXT_PUBLIC_CONTACT_PHONE');
  if (!SITE.contact.email) out.push('NEXT_PUBLIC_CONTACT_EMAIL');
  if (!SITE.contact.address) out.push('NEXT_PUBLIC_CONTACT_ADDRESS');
  if (!SITE.form.endpoint) out.push('NEXT_PUBLIC_CONTACT_FORM_ENDPOINT');
  if (!SITE.social.linkedin) out.push('site.json → social.linkedin');
  if (!SITE.legal.kvkk) out.push('site.json → legal.kvkk');
  if (!SITE.legal.privacy) out.push('site.json → legal.privacy');
  if (!SITE.legal.cookies) out.push('site.json → legal.cookies');
  return out;
}
