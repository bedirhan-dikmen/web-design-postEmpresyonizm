import { SITE } from './config';

/**
 * THE integration point for the contact form. Nothing else in the site sends form data.
 *
 * No backend exists in this project yet. While NEXT_PUBLIC_CONTACT_FORM_ENDPOINT is empty the form cannot be sent
 * (`isContactFormReady()` is false, the UI says so and disables sending) — a submission is never faked.
 * To connect a backend: set NEXT_PUBLIC_CONTACT_FORM_ENDPOINT (public — no secrets in it) to an HTTPS URL that accepts the JSON below and answers 2xx,
 * or replace the body of `submitContact` with the provider's client (keep the same result contract).
 */

export const TOPICS = ['NeXa', 'Genel Bilgi', 'İş Birliği'] as const;
export type Topic = (typeof TOPICS)[number];

export interface ContactPayload {
  name: string;
  company: string;
  phone: string;
  email: string;
  topic: Topic;
  message: string;
  consent: boolean;
}

export type SubmitResult = { ok: true } | { ok: false; reason: 'not-configured' | 'network' | 'rejected'; status?: number };

export const isContactFormReady = () => Boolean(SITE.form.endpoint);

export async function submitContact(payload: ContactPayload): Promise<SubmitResult> {
  const endpoint = SITE.form.endpoint;
  if (!endpoint) return { ok: false, reason: 'not-configured' };
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok ? { ok: true } : { ok: false, reason: 'rejected', status: res.status };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/** field checks shared by the form (kept here so a backend can mirror them) */
export function validateContact(p: ContactPayload): Partial<Record<keyof ContactPayload, string>> {
  const errors: Partial<Record<keyof ContactPayload, string>> = {};
  if (p.name.trim().length < 2) errors.name = 'Lütfen adınızı ve soyadınızı yazın.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) errors.email = 'Geçerli bir e-posta adresi yazın.';
  if (p.phone.trim() && !/^[+()\d\s-]{7,20}$/.test(p.phone.trim())) errors.phone = 'Telefon numarası yalnızca rakam, boşluk ve + ( ) - içerebilir.';
  if (p.message.trim().length < 10) errors.message = 'Mesajınız en az 10 karakter olsun.';
  if (!p.consent) errors.consent = 'Devam etmek için onay vermeniz gerekiyor.';
  return errors;
}
