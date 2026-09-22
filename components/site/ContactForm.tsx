'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { SITE } from '@/lib/site/config';
import { TOPICS, isContactFormReady, submitContact, validateContact, type ContactPayload, type Topic } from '@/lib/site/contact';

type Errors = Partial<Record<keyof ContactPayload, string>>;
type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; text: string };

const EMPTY: ContactPayload = { name: '', company: '', phone: '', email: '', topic: 'NeXa', message: '', consent: false };

/**
 * The contact form. Sending goes through lib/site/contact.ts only. While no endpoint is configured the form
 * says so and cannot be sent — it never reports a success that did not happen.
 */
export default function ContactForm() {
  const id = useId();
  const ready = isContactFormReady();
  const [data, setData] = useState<ContactPayload>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const trap = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ContactPayload>(k: K, v: ContactPayload[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateContact(data);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    if (trap.current?.value) return; // a bot filled the hidden field: drop silently
    setStatus({ kind: 'sending' });
    const result = await submitContact(data);
    if (result.ok) {
      setStatus({ kind: 'sent' });
      setData(EMPTY);
    } else {
      setStatus({
        kind: 'error',
        text:
          result.reason === 'not-configured' ? 'Form gönderimi henüz etkin değil; mesajınız gönderilmedi.'
          : result.reason === 'network' ? 'Bağlantı kurulamadı; mesajınız gönderilmedi. Lütfen tekrar deneyin.'
          : 'Mesajınız şu anda gönderilemedi. Lütfen daha sonra tekrar deneyin.',
      });
    }
  }

  const field = 'mt-2 block w-full rounded-xl border border-white/15 bg-[#0a1733] px-4 py-3 text-base text-[#eaf0f7] placeholder:text-[#7f93b3] focus:border-[#d80017] focus:outline-none focus:ring-2 focus:ring-[#d80017]/40 aria-[invalid=true]:border-[#e38a6a]';
  const label = 'block text-sm font-semibold text-[#cfdcee]';
  const err = (k: keyof ContactPayload) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="mt-1.5 text-sm text-[#f2a98f]">
        {errors[k]}
      </p>
    ) : null;
  const a11y = (k: keyof ContactPayload) => ({ id: `${id}-${k}`, 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `${id}-${k}-err` : undefined });

  return (
    <form noValidate onSubmit={onSubmit} aria-label="İletişim formu" className="rounded-2xl border border-white/10 bg-[#081330]/80 p-6 shadow-[0_24px_60px_rgba(2,6,20,0.45)] sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={label}>
            Ad Soyad <span aria-hidden className="text-[#d80017]">*</span>
          </label>
          <input {...a11y('name')} name="name" autoComplete="name" required value={data.name} onChange={(e) => set('name', e.target.value)} className={field} />
          {err('name')}
        </div>
        <div>
          <label htmlFor={`${id}-company`} className={label}>
            İşletme / Firma
          </label>
          <input {...a11y('company')} name="company" autoComplete="organization" value={data.company} onChange={(e) => set('company', e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={label}>
            Telefon
          </label>
          <input {...a11y('phone')} name="phone" type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} className={field} />
          {err('phone')}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={label}>
            E-posta <span aria-hidden className="text-[#d80017]">*</span>
          </label>
          <input {...a11y('email')} name="email" type="email" inputMode="email" autoComplete="email" required value={data.email} onChange={(e) => set('email', e.target.value)} className={field} />
          {err('email')}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-topic`} className={label}>
            Konu
          </label>
          <select {...a11y('topic')} name="topic" value={data.topic} onChange={(e) => set('topic', e.target.value as Topic)} className={field}>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className={label}>
            Mesaj <span aria-hidden className="text-[#d80017]">*</span>
          </label>
          <textarea {...a11y('message')} name="message" rows={5} required value={data.message} onChange={(e) => set('message', e.target.value)} className={`${field} resize-y`} />
          {err('message')}
        </div>
        {/* spam trap: invisible to people, tempting to bots */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Web sitesi
            <input ref={trap} tabIndex={-1} autoComplete="off" name="website" />
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm leading-relaxed text-[#b9cbe3]">
            <input
              {...a11y('consent')}
              type="checkbox"
              name="consent"
              checked={data.consent}
              onChange={(e) => set('consent', e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-white/30 bg-[#0a1733] accent-[#d80017] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d80017]"
            />
            <span>
              Kişisel verilerimin bu talep kapsamında benimle iletişime geçilmesi amacıyla işlenmesini kabul ediyorum.
              {SITE.legal.kvkk && (
                <>
                  {' '}
                  <a href={SITE.legal.kvkk} className="underline decoration-[#d80017]/60 underline-offset-2 hover:text-[#eaf0f7]">
                    KVKK Aydınlatma Metni
                  </a>
                </>
              )}
            </span>
          </label>
          {err('consent')}
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={!ready || status.kind === 'sending'}
          aria-disabled={!ready || status.kind === 'sending'}
          className="cta-primary inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.kind === 'sending' ? 'Gönderiliyor…' : 'Gönder'}
        </button>
        <p role="status" aria-live="polite" className="text-sm text-[#b9cbe3]">
          {!ready && status.kind === 'idle' && 'İletişim formu henüz etkin değil. Form bağlandığında buradan mesaj gönderebileceksiniz.'}
          {status.kind === 'sent' && <span className="text-[#9fe0bd]">Mesajınız iletildi. En kısa sürede size dönüş yapacağız.</span>}
          {status.kind === 'error' && <span className="text-[#f2a98f]">{status.text}</span>}
        </p>
      </div>
    </form>
  );
}
