import { SITE, CONTACT_HREF } from '@/lib/site/config';
import BackToTop from './BackToTop';
import CurrentYear from './CurrentYear';

/**
 * The footer, shared by the homepage and the NeXa page: the brand (logo + name), the site's destinations, the
 * contact details and a closing bar. Only what exists is rendered: contact lines without a configured value and
 * legal pages without a route are left out rather than linked to nowhere. Links are written to work from either
 * page (/#section goes home, #iletisim stays on the current page).
 */

const NAV: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Kurumsal',
    links: [
      { href: '/', label: 'Ana Sayfa' },
      { href: '/#hakkimizda', label: 'Hakkımızda' },
      { href: '/#misyon-vizyon', label: 'Misyon & Vizyon' },
      { href: CONTACT_HREF, label: 'İletişim' },
    ],
  },
  {
    title: 'Ürün',
    links: [
      { href: '/nexa', label: `${SITE.product}'yı tanıyın` },
      { href: '/#urunumuz', label: `${SITE.product} özellikleri` },
    ],
  },
];

const icon = 'mt-0.5 h-4 w-4 shrink-0 text-[#9cc7e0]';
const Phone = () => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={icon}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
const Mail = () => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={icon}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
const Pin = () => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={icon}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export default function SiteFooter() {
  const { phone, email, address } = SITE.contact;
  const legal = [
    ['KVKK', SITE.legal.kvkk],
    ['Gizlilik Politikası', SITE.legal.privacy],
    ['Çerez Politikası', SITE.legal.cookies],
  ].filter((l): l is [string, string] => Boolean(l[1]));
  const hasContact = Boolean(phone || email || address || SITE.social.linkedin);
  const heading = 'eyebrow text-xs text-[#9cc7e0]';
  const link = 'text-[#b9cbe3] transition-colors hover:text-white';
  return (
    <footer className="relative z-20 -mt-px bg-[#040918] text-[#b9cbe3]" aria-labelledby="footer-baslik">
      <h2 id="footer-baslik" className="sr-only">
        Site alt bilgisi
      </h2>
      {/* a hairline of the logo's red where the page ends */}
      <div aria-hidden className="h-px bg-[linear-gradient(to_right,transparent,rgba(216,0,23,0.55)_30%,rgba(216,0,23,0.55)_70%,transparent)]" />

      <div className="page-gutter pb-8 pt-16 lg:pt-20">
        <div className="mx-auto max-w-[1560px]">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr] lg:gap-10">
            {/* the brand: the logo, left of the name */}
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="/" className="inline-flex items-center gap-4 rounded-lg" aria-label={`${SITE.name} Yazılım — ana sayfa`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/kerinti-logo-color.png" alt="" width={1408} height={642} loading="lazy" className="h-12 w-auto" />
                <span className="border-l border-white/15 pl-4 text-lg font-semibold leading-tight text-[#eaf0f7]">
                  {SITE.name}
                  <span className="block text-sm font-normal text-[#8ea3c2]">Yazılım</span>
                </span>
              </a>
              <p className="mt-6 max-w-sm leading-relaxed">{SITE.description}</p>
              <p className="mt-4 text-sm text-[#8ea3c2]">
                {SITE.product}, bir {SITE.name} ürünüdür.
              </p>
            </div>

            {NAV.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className={heading}>{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className={link}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            {hasContact && (
              <div>
                <p className={heading}>İletişim</p>
                <ul className="mt-5 space-y-4">
                  {phone && (
                    <li className="flex gap-3">
                      <Phone />
                      <a href={`tel:${phone.tel}`} className={link}>
                        {phone.display}
                      </a>
                    </li>
                  )}
                  {email && (
                    <li className="flex gap-3">
                      <Mail />
                      <a href={`mailto:${email}`} className={link}>
                        {email}
                      </a>
                    </li>
                  )}
                  {address && (
                    <li className="flex gap-3">
                      <Pin />
                      <div>
                        <address className="not-italic leading-relaxed">
                          {address.map((l) => (
                            <span key={l} className="block">
                              {l}
                            </span>
                          ))}
                        </address>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.join(', '))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="site-link mt-2 inline-block text-sm"
                        >
                          Haritada aç<span className="sr-only"> (yeni sekmede açılır)</span>
                        </a>
                      </div>
                    </li>
                  )}
                  {SITE.social.linkedin && (
                    <li>
                      <a href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer" className={link}>
                        LinkedIn<span className="sr-only"> (yeni sekmede açılır)</span>
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[#8ea3c2] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © <CurrentYear /> {SITE.name} Yazılım. Tüm hakları saklıdır.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {legal.length > 0 && (
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {legal.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className={link}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <BackToTop />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
