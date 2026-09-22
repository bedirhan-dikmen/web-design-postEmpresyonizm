'use client';

import { useEffect, useRef, useState } from 'react';
import { CONTACT_HREF, SITE } from '@/lib/site/config';
import { scrollToAnchor } from './scrollTo';

/**
 * Site chrome, over the film and the page alike:
 *   top left    the Kerinti logo (back to the start)
 *   left edge   a thin line: the page's scroll progress, with one marker per destination (label on hover/focus)
 * Only destinations that exist on the current page. On the homepage the hero already shows the big logo, so the
 * header logo only comes in once the hero has scrolled away.
 */
export type SitePage = 'home' | 'nexa';

const MARKS_BY_PAGE: Record<SitePage, { href: string; label: string }[]> = {
  home: [
    { href: '#ust', label: 'Başlangıç' },
    { href: '#hakkimizda', label: 'Hakkımızda' },
    { href: '#misyon-vizyon', label: 'Misyon & Vizyon' },
    { href: '#urunumuz', label: SITE.product },
    { href: CONTACT_HREF, label: 'İletişim' },
  ],
  nexa: [
    { href: '#ust', label: 'Başlangıç' },
    { href: '#nexa', label: SITE.product },
    { href: '#bolum-1', label: 'Bölümler' },
    { href: '#kerinti', label: 'Kerinti' },
    { href: CONTACT_HREF, label: 'İletişim' },
  ],
};

export default function SiteHeader({ page }: { page: SitePage }) {
  const MARKS = MARKS_BY_PAGE[page];
  const fill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [pastHero, setPastHero] = useState(page !== 'home');

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (page === 'home') setPastHero(window.scrollY > window.innerHeight * 0.55);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      fill.current?.style.setProperty('--p', String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
      // the active mark: the last destination whose top has passed the middle of the screen
      const mid = window.innerHeight / 2;
      let a = 0;
      MARKS.forEach((m, i) => {
        const el = document.getElementById(m.href.slice(1));
        if (el && el.getBoundingClientRect().top <= mid) a = i;
      });
      setActive(a);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [MARKS, page]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start px-4 pt-4 sm:px-7 sm:pt-6">
        {/* white knockout of the kerinti.com.tr logo (the band's lettering is cut out); a soft shadow keeps it
            legible over the restaurant's light scenes */}
        {/* home: back to the top of the page; NeXa: back to the homepage (a full load, the film is left cleanly) */}
        <a
          href={page === 'home' ? '#ust' : '/'}
          onClick={page === 'home' ? scrollToAnchor : undefined}
          aria-hidden={!pastHero}
          tabIndex={pastHero ? undefined : -1}
          className={`block rounded-lg transition-opacity duration-500 ${pastHero ? 'pointer-events-auto opacity-100' : 'opacity-0'}`}
          aria-label={page === 'home' ? `${SITE.name} — sayfanın başı` : `${SITE.name} — ana sayfa`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/kerinti-logo-white.png"
            alt="Kerinti"
            width={1408}
            height={642}
            className="h-10 w-auto opacity-90 drop-shadow-[0_2px_8px_rgba(2,6,20,0.45)] sm:h-12"
          />
        </a>
      </header>

      <nav aria-label="Sayfa içi gezinme" className="fixed bottom-[12vh] left-5 top-[22vh] z-30 hidden w-6 sm:block lg:left-8">
        {/* the line, and the scroll progress filling it */}
        <span aria-hidden className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-[#eaf0f7]/40 shadow-[0_0_3px_rgba(5,11,30,0.55)]" />
        <span
          ref={fill}
          aria-hidden
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 origin-top bg-[#d80017]"
          style={{ transform: 'scaleY(var(--p, 0))' }}
        />
        <ul className="relative flex h-full flex-col justify-between">
          {MARKS.map((m, i) => (
            <li key={m.href} className="group relative flex h-6 items-center justify-center">
              <a
                href={m.href}
                onClick={scrollToAnchor}
                aria-current={i === active ? 'location' : undefined}
                className="peer flex h-6 w-6 items-center justify-center rounded-full"
              >
                <span
                  aria-hidden
                  className={`block transition-all duration-300 ${
                    i === active ? 'h-2.5 w-2.5 bg-[#d80017] shadow-[0_0_10px_rgba(216,0,23,0.7)]' : 'h-1.5 w-1.5 bg-[#eaf0f7]/70 shadow-[0_0_3px_rgba(5,11,30,0.6)] group-hover:bg-[#eaf0f7]'
                  }`}
                />
                <span className="sr-only">{m.label}</span>
              </a>
              <span
                aria-hidden
                className="pointer-events-none absolute left-8 whitespace-nowrap rounded-md bg-[#050b1e]/75 px-2.5 py-1 text-xs font-medium text-[#eaf0f7] opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 peer-focus-visible:opacity-100"
              >
                {m.label}
              </span>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
