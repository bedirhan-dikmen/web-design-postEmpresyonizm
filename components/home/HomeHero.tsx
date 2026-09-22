'use client';

import { useEffect, useRef, useState } from 'react';
import { LOGO_FORMED_AT, LogoField } from '@/lib/home/logoField';
import { DAB_ATLAS, SHARED } from '@/lib/prototype/sceneConfig';
import { CONTACT_HREF } from '@/lib/site/config';
import { scrollToAnchor } from '@/components/site/scrollTo';

const NIGHT = '/prototype-assets/01-kerinti-night';

/**
 * The homepage hero. The film's opening world — the painted Kerinti night, its horizon, the drifting square
 * stars — greets the visitor, and on load the squares assemble the Kerinti logo (lib/home/logoField.ts).
 * Company identity and a short introduction on the left; scrolling continues into an ordinary page.
 */
export default function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const canvas = el.querySelector<HTMLCanvasElement>('[data-logo-canvas]')!;
    const slotEl = el.querySelector<HTMLElement>('[data-logo-slot]')!;
    const crisp = el.querySelector<HTMLElement>('[data-logo-crisp]')!;
    const ctx = canvas.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // DEV only: ?logo=1.2 freezes the formation at 1.2 s (frame inspection)
    const frozen = process.env.NODE_ENV !== 'production' ? new URLSearchParams(window.location.search).get('logo') : null;
    let alive = true;
    let raf = 0;
    let visible = true;
    let field: LogoField | null = null;
    let start = 0;

    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve(img);
        img.src = src;
      });
    // a stalled decode (background tab) must never keep the page from greeting the visitor
    const timeout = new Promise<null>((r) => setTimeout(() => r(null), 2500));

    const frame = (now: number) => {
      raf = 0;
      if (!alive || !field) return;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.round(r.width * dpr);
      const H = Math.round(r.height * dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      const s = slotEl.getBoundingClientRect();
      const slot = { x: s.left - r.left, y: s.top - r.top, w: s.width, h: s.height };
      const elapsed = frozen !== null ? parseFloat(frozen) : reduced ? Infinity : (now - start) / 1000;
      field.draw(ctx, r.width, r.height, dpr, slot, elapsed, now / 1000, reduced);
      crisp.style.opacity = String(field.settle(elapsed));
      if (visible && !reduced) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && alive) raf = requestAnimationFrame(frame);
    };

    Promise.race([Promise.all([load(DAB_ATLAS.src), load('/brand/kerinti-logo-mask.png')]), timeout]).then((imgs) => {
      if (!alive) return;
      if (imgs && imgs[0].naturalWidth && imgs[1].naturalWidth) {
        const small = window.innerWidth < 768;
        field = new LogoField(imgs[0], imgs[1], small ? 70 : 150);
      } else {
        crisp.style.opacity = '1'; // no atlas: show the logo itself
      }
      start = performance.now() + 250; // a short beat of stars before they move
      setReady(true);
      kick();
    });

    // stop drawing while the hero is scrolled away; resume where the clock is
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(el);
    window.addEventListener('resize', kick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', kick);
    };
  }, []);

  // the copy follows the logo: it comes in while the modules are still settling
  const reveal =
    `transition-[opacity,transform] duration-[900ms] ease-out motion-reduce:transition-none ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`;
  const delayStyle = (s: number) => ({ transitionDelay: ready ? `${s}s` : '0s' });

  return (
    <section ref={root} id="ust" tabIndex={-1} aria-labelledby="hero-baslik" className="relative isolate flex min-h-[640px] items-center overflow-hidden bg-[#050b1e] focus:outline-none h-[100svh]">
      {/* the painted Kerinti night, as in the film's opening */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${NIGHT}/sky.webp`} alt="" className="hero-sky absolute inset-0 h-full w-full object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${NIGHT}/horizon.webp`} alt="" className="absolute top-[64%] left-1/2 w-[max(150%,1100px)] max-w-none -translate-x-1/2" />
        <canvas data-logo-canvas className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 opacity-[0.13]" style={{ backgroundImage: `url(${SHARED.grain})`, mixBlendMode: 'soft-light' }} />
        {/* the night settles into the page below */}
        <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: 'linear-gradient(to bottom, rgba(5,11,30,0), #050b1e)' }} />
      </div>

      <div className="page-gutter w-full">
      <div className="mx-auto grid max-w-[1560px] items-center gap-10 pt-24 pb-20 md:grid-cols-[1fr_1.15fr] md:gap-12 xl:gap-16">
        <div className="order-2 md:order-1">
          <p className={`eyebrow flex items-center gap-2.5 text-xs text-[#9cc7e0] sm:text-sm ${reveal}`} style={delayStyle(LOGO_FORMED_AT - 0.9)}>
            <span aria-hidden className="relative inline-block h-3.5 w-3.5 shadow-[inset_0_0_0_2px_#d80017]">
              <span className="absolute left-[4px] top-[4px] h-1.5 w-1.5 bg-[#d80017]" />
            </span>
            Kerinti Yazılım
          </p>
          <h1 id="hero-baslik" className={`display mt-4 text-[2.4rem] leading-[1.06] text-[#eaf0f7] sm:text-5xl lg:text-[3.6rem] xl:text-[4.1rem] ${reveal}`} style={delayStyle(LOGO_FORMED_AT - 0.7)}>
            İşletmelerin gündelik işini sadeleştiren yazılımlar.
          </h1>
          <p className={`mt-5 max-w-xl text-lg leading-relaxed xl:text-xl text-[#b9cbe3] ${reveal}`} style={delayStyle(LOGO_FORMED_AT - 0.5)}>
            Kerinti, işletmelerin gerçek ihtiyaçlarını analiz eder ve onları kolay kullanılan, sürdürülebilir yazılımlara
            dönüştürür. Restoranlar için geliştirdiğimiz NeXa ile siparişten yönetime tüm operasyon tek sistemde.
          </p>
          <div className={`mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 ${reveal}`} style={delayStyle(LOGO_FORMED_AT - 0.3)}>
            <a href="/nexa" className="cta-primary inline-flex items-center rounded-xl px-6 py-3.5 text-base font-bold text-white">
              NeXa&apos;yı tanıyın
            </a>
            <a href={CONTACT_HREF} onClick={scrollToAnchor} className="site-link text-base font-semibold">
              İletişime geçin
            </a>
          </div>
        </div>

        <div className="order-1 md:order-2">
          {/* the logo's box: the modules assemble exactly here, then the crisp logo settles in */}
          <div data-logo-slot className="relative mx-auto aspect-[1408/642] w-[82%] max-w-[820px] md:w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-logo-crisp src="/brand/kerinti-logo-color.png" alt="Kerinti — bu işler bitecek" width={1408} height={642} className="absolute inset-0 h-full w-full" style={{ opacity: 0 }} />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
