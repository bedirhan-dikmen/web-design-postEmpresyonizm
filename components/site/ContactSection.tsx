import { SITE, missingSiteConfig } from '@/lib/site/config';
import ContactForm from './ContactForm';

/**
 * İLETİŞİM — the first normal section after the film. It rises over the film's final, settled frame through a
 * short fade into night, so the story ends and the page simply continues. Contact details come only from
 * lib/site/config.ts (site.json + NEXT_PUBLIC_* env); a missing value renders nothing (in development a notice lists what is missing).
 */
/** `bridge`: fade in over the film's last frame (the NeXa page); off where the section follows ordinary page content */
export default function ContactSection({ bridge = true }: { bridge?: boolean }) {
  const { phone, email, address } = SITE.contact;
  const linkedin = SITE.social.linkedin;
  const hasDetails = Boolean(phone || email || address || linkedin);
  const missing = process.env.NODE_ENV !== 'production' ? missingSiteConfig() : [];
  return (
    <section id={SITE.contactAnchor} aria-labelledby="iletisim-baslik" className="relative z-20 scroll-mt-0">
      {/* the film settles into the page: its last frame fades into the section's night */}
      {bridge && <div aria-hidden className="h-[28vh]" style={{ background: 'linear-gradient(to bottom, rgba(5,11,30,0) 0%, rgba(5,11,30,0.82) 52%, #050b1e 80%)' }} />}
      {/* -mt-px / pb-px: overlap the neighbouring blocks by a pixel, so no sub-pixel seam lets the film show through */}
      <div className={`page-gutter -mt-px bg-[#050b1e] pb-24 lg:pb-32 ${bridge ? 'pt-6' : 'pt-20 lg:pt-28'}`}>
        <div className="mx-auto grid max-w-[1560px] gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-2.5 text-xs text-[#9cc7e0] sm:text-sm">
              <span aria-hidden className="relative inline-block h-3.5 w-3.5 shadow-[inset_0_0_0_2px_#d80017]">
                <span className="absolute left-[4px] top-[4px] h-1.5 w-1.5 bg-[#d80017]" />
              </span>
              İletişim
            </p>
            <h2 id="iletisim-baslik" tabIndex={-1} className="display mt-4 text-4xl leading-tight text-[#eaf0f7] focus:outline-none sm:text-5xl">
              Birlikte konuşalım.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-[#b9cbe3]">
              NeXa, işletmeniz veya Kerinti çözümleri hakkında bilgi almak için bize ulaşabilirsiniz.
            </p>

            {hasDetails && (
              <dl className="mt-10 space-y-5 text-base">
                {phone && (
                  <div>
                    <dt className="text-sm font-semibold text-[#9cc7e0]">Telefon</dt>
                    <dd className="mt-1">
                      <a href={`tel:${phone.tel}`} className="site-link">
                        {phone.display}
                      </a>
                    </dd>
                  </div>
                )}
                {email && (
                  <div>
                    <dt className="text-sm font-semibold text-[#9cc7e0]">E-posta</dt>
                    <dd className="mt-1">
                      <a href={`mailto:${email}`} className="site-link">
                        {email}
                      </a>
                    </dd>
                  </div>
                )}
                {address && (
                  <div>
                    <dt className="text-sm font-semibold text-[#9cc7e0]">Adres</dt>
                    <dd className="mt-1 not-italic text-[#dbe5f2]">
                      <address className="not-italic">
                        {address.map((l) => (
                          <span key={l} className="block">
                            {l}
                          </span>
                        ))}
                      </address>
                    </dd>
                  </div>
                )}
                {linkedin && (
                  <div>
                    <dt className="text-sm font-semibold text-[#9cc7e0]">Sosyal</dt>
                    <dd className="mt-1">
                      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="site-link">
                        LinkedIn<span className="sr-only"> (yeni sekmede açılır)</span>
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            )}

            {missing.length > 0 && (
              <div role="note" className="mt-10 rounded-xl border border-dashed border-[#d80017]/50 bg-[#d80017]/5 p-4 text-sm text-[#f0dcae]">
                <p className="font-semibold">Yalnızca geliştirme ortamında görünür — yayından önce doldurulması gerekenler:</p>
                <p className="mt-1 text-[#d9c89f]">{missing.join(' · ')}</p>
                <p className="mt-1 text-[#bfae86]">.env · lib/site/site.json</p>
              </div>
            )}
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
