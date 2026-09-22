'use client';

import { layerTransform, type Camera, type FilmState, type LayerXf, type Viewport } from '@/lib/prototype/camera';
import { BEAT5_TEXTS, CTA } from '@/lib/prototype/chapter5/content';
import { QR_CELL_BASE, getFinalQr } from '@/lib/prototype/chapter5/finalQr';
import { CONTACT_HREF } from '@/lib/site/config';
import { scrollToContact } from '@/components/site/scrollTo';
import G from '@/lib/prototype/chapter5/geometry.json';

/**
 * Chapter 5 DOM layers — Return to Kerinti + corporate finale.
 *
 *   <Chapter5Veil>   inside World B, AFTER the Chapter 4 world and BEFORE the Chapter 5 plates: turns the
 *                    restaurant and its street to night. The restaurant's own cut-away is veiled more lightly,
 *                    so its interior stays the warmest light in the city. The Chapter 5 plates, drawn after it,
 *                    are painted at night already and are never veiled.
 *   <Chapter5World>  world-space layers of the Kerinti tower and studio: the sign on the tower, the studio's
 *                    screens (crisp DOM), lamps, the team, gold modules running between systems, the QR card.
 *   <Chapter5Grade>  the navy night vignette (screen space).
 *   <Chapter5Text>   the four beats of copy and the call to action (the only interactive element of the film).
 *
 * Story state comes from FilmState (scroll); ambient life (screen pulses, runners, breathing) from the ticker.
 */

const SPR = '/prototype-assets/05-kerinti/sprites';
const SCREEN = 'font-sans text-[#e8f1ee]';
const GOLD = '#d80017';
const INK = '#16264f';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pulse = (time: number, speed: number, phase = 0) => 0.5 + 0.5 * Math.sin(time * speed + phase);

const S = G.studio;
/** the card's side for a 25×25 code; the real code (built on the client) keeps this physical size */
const QR_CELL = QR_CELL_BASE;
const QR_FULL = (25 + 2 * G.qr.quiet) * QR_CELL;

const FIG = {
  e1: { src: 'engineer-a', w: 300, h: 360, at: S.engineers.e1 },
  e2: { src: 'engineer-b', w: 300, h: 520, at: S.engineers.e2 },
  e3: { src: 'engineer-c', w: 300, h: 360, at: S.engineers.e3 },
} as const;

function Prop({ id, w, h, children, style }: { id: string; w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div data-ch5 data-prop5={id} className="pointer-events-none absolute left-0 top-0" style={{ width: w, height: h, visibility: 'hidden', transformOrigin: '50% 50%', ...style }}>
      {children}
    </div>
  );
}
function Glow({ id, w, h, color }: { id: string; w: number; h: number; color: string }) {
  return <Prop id={id} w={w} h={h} style={{ background: `radial-gradient(ellipse at 50% 50%, ${color}, rgba(0,0,0,0) 70%)`, mixBlendMode: 'screen' }} />;
}
/** text that ?hideText=2 removes */
function T({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span data-ui-text className={className} style={style}>
      {children}
    </span>
  );
}
/** the Kerinti mark: a 3×3 gold core inside a square — Chapter 1's portal finder, as a logo */
function Mark({ size }: { size: number }) {
  const c = size / 7;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size, boxShadow: `inset 0 0 0 ${c}px ${GOLD}` }}>
      <span className="absolute" style={{ left: 2 * c, top: 2 * c, width: 3 * c, height: 3 * c, background: GOLD }} />
    </span>
  );
}

// ------------------------------------------------------------------ veil (inside World B)

export function Chapter5Veil() {
  return (
    <>
      {/* the city and street at night: cobalt multiply, then a little crush */}
      {/* the hole over the building is four frame rects, not a clip-path: Chrome drops a multiply layer's blend
          where it is clipped by a path(), and the evening exterior flashed through during the pull-back */}
      <div data-ch5 data-veil5="out" className="pointer-events-none absolute" style={{ inset: '-30%', mixBlendMode: 'multiply', opacity: 0, visibility: 'hidden' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} data-veil5-part className="absolute" style={{ background: '#3a4c86', left: 0, top: 0, width: i === 0 ? '100%' : 0, height: i === 0 ? '100%' : 0 }} />
        ))}
      </div>
      <div data-ch5 data-veil5="crush" className="pointer-events-none absolute" style={{ inset: '-30%', background: '#050b1e', opacity: 0, visibility: 'hidden' }} />
      {/* the restaurant's own cut-away: veiled lightly, so it stays the warmest light in the night */}
      <div data-ch5 data-veil5="in" className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: 1, height: 1, background: '#8f95c4', mixBlendMode: 'multiply', opacity: 0, visibility: 'hidden' }} />
    </>
  );
}

// ------------------------------------------------------------------ world

const codeRows = [[0.42, '#9cc7e0'], [0.7, '#e8f1ee'], [0.55, GOLD], [0.3, '#9cc7e0'], [0.62, '#e8f1ee'], [0.48, '#7dffb0'], [0.36, '#e8f1ee'], [0.58, '#9cc7e0']] as const;

export function Chapter5World() {
  const [d0, d1, d2, d3] = S.display;
  const dw = d2 - d0;
  const dh = d3 - d1;
  return (
    <div data-ch5 data-ch5-world lang="tr" className="pointer-events-none absolute inset-0">
      {/* light */}
      {S.lamps.map((x, i) => (
        <Glow key={x} id={`lamp${i}`} w={520} h={440} color="rgba(240,200,130,0.5)" />
      ))}
      {S.monitors.map((_, i) => (
        <Glow key={i} id={`monGlow${i}`} w={560} h={420} color="rgba(150,190,240,0.34)" />
      ))}
      <Glow id="displayGlow" w={900} h={1000} color="rgba(120,170,230,0.3)" />
      <Glow id="signGlow" w={2600} h={700} color="rgba(216,0,23,0.4)" />
      <Glow id="qrHalo" w={QR_FULL * 1.9} h={QR_FULL * 1.9} color="rgba(156,199,224,0.3)" />

      {/* the Kerinti tower's sign */}
      <Prop id="sign" w={1800} h={260}>
        <div className="flex h-full items-center justify-center gap-[60px]">
          <Mark size={170} />
          <T className="font-sans text-[150px] font-bold tracking-[0.2em] text-[#f3e3b8]" style={{ textShadow: '0 0 40px rgba(216,0,23,0.6)' }}>KERİNTİ</T>
        </div>
      </Prop>

      {/* the team, behind the desk (sprites cut at desk height) */}
      {(Object.keys(FIG) as (keyof typeof FIG)[]).map((k) => (
        <Prop key={k} id={`fig-${k}`} w={FIG[k].w} h={FIG[k].h}>
          <div data-breathe5 className="absolute inset-0" style={{ transformOrigin: '50% 100%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-lazy-src={`${SPR}/${FIG[k].src}.webp`} alt="" width={FIG[k].w} height={FIG[k].h} draggable={false} className="absolute left-0 top-0 block max-w-none select-none" style={{ width: FIG[k].w, height: FIG[k].h }} />
          </div>
        </Prop>
      ))}

      {/* three screens on the desk: code, the product itself, and its architecture */}
      {S.monitors.map((_, i) => (
        <Prop key={i} id={`mon${i}`} w={270} h={240}>
          <div className="absolute left-[117px] top-[176px] h-[50px] w-[36px] bg-[#0c1120]" />
          <div className="absolute left-[80px] top-[222px] h-[14px] w-[110px] rounded-[4px] bg-[#0c1120]" />
          <div className="absolute inset-x-0 top-0 h-[180px] overflow-hidden rounded-[8px] bg-[#0b1426]" style={{ boxShadow: 'inset 0 0 0 7px #05080f' }}>
            {i === 0 && (
              <div className="absolute inset-[16px]">
                {codeRows.map(([w, c], r) => (
                  <div key={r} className="mb-[8px] flex gap-[6px]" style={{ paddingLeft: (r % 3) * 14 }}>
                    <span className="h-[8px] rounded-[2px]" style={{ width: `${w * 100}%`, background: c, opacity: 0.8 }} />
                  </div>
                ))}
                <span data-caret className="absolute h-[10px] w-[5px] bg-[#d80017]" style={{ left: 120, top: 120 }} />
              </div>
            )}
            {i === 1 && (
              <div className="absolute inset-[14px]">
                <T className={`${SCREEN} block text-[12px] font-semibold opacity-80`}>NeXa · Masalar</T>
                <div className="mt-[6px] grid grid-cols-4 gap-[5px]">
                  {['#8fa3a0', '#9fc9c2', '#9fc9c2', '#8fa3a0', '#e3a83b', '#d80017', '#7dffb0', '#8fa3a0', '#d80017', '#9fc9c2', '#8fa3a0', '#d80017'].map((c, t) => (
                    <span key={t} className="h-[26px] rounded-[3px]" style={{ background: 'rgba(255,255,255,0.06)', boxShadow: `inset 0 -4px 0 ${c}` }} />
                  ))}
                </div>
              </div>
            )}
            {i === 2 && (
              <svg viewBox="0 0 240 150" className="absolute inset-[14px] h-[150px] w-[240px]">
                <g fill="none" stroke="#9cc7e0" strokeWidth="2" opacity="0.8">
                  <rect x="8" y="10" width="60" height="30" rx="4" />
                  <rect x="8" y="60" width="60" height="30" rx="4" />
                  <rect x="8" y="110" width="60" height="30" rx="4" />
                  <rect x="150" y="55" width="80" height="40" rx="6" stroke={GOLD} />
                  <path d="M68 25 C110 25 110 75 150 75 M68 75 H150 M68 125 C110 125 110 75 150 75" />
                </g>
              </svg>
            )}
          </div>
        </Prop>
      ))}

      {/* the systems wall: what NeXa is made of, as the studio sees it */}
      <Prop id="display" w={dw} h={dh}>
        <div className="absolute inset-[18px]">
          <T className={`${SCREEN} block text-[20px] font-semibold tracking-[0.16em] text-[#9cc7e0]`}>SİSTEM</T>
          <svg viewBox="0 0 394 470" className="absolute left-0 top-[40px] h-[470px] w-[394px]">
            <g fill="none" stroke="#9cc7e0" strokeWidth="2.5">
              {[0, 1, 2, 3].map((r) => (
                <rect key={r} x="6" y={20 + r * 100} width="130" height="56" rx="8" />
              ))}
              <rect x="240" y="150" width="140" height="96" rx="12" stroke={GOLD} strokeWidth="3.5" />
              {[0, 1, 2, 3].map((r) => (
                <path key={r} d={`M136 ${48 + r * 100} C190 ${48 + r * 100} 190 198 240 198`} stroke="rgba(156,199,224,0.55)" />
              ))}
            </g>
          </svg>
          {['Masa · QR', 'Kasa', 'Mutfak', 'Yönetim'].map((l, r) => (
            <T key={l} className={`${SCREEN} absolute left-[14px] text-[17px] font-semibold`} style={{ top: 40 + 20 + r * 100 + 17 }}>
              {l}
            </T>
          ))}
          <T className="absolute left-[258px] top-[226px] font-sans text-[22px] font-bold text-[#f3e3b8]">NeXa</T>
          <div className="absolute bottom-[4px] left-0 right-0 flex flex-wrap gap-[6px]">
            {['Web', 'Masaüstü', 'Sunucu', 'Veri'].map((l) => (
              <span key={l} className="rounded-[4px] px-[7px] py-[3px]" style={{ background: 'rgba(216,0,23,0.14)', boxShadow: 'inset 0 0 0 1px rgba(216,0,23,0.4)' }}>
                <T className="font-sans text-[14px] font-semibold text-[#f0dcae]">{l}</T>
              </span>
            ))}
          </div>
        </div>
      </Prop>

      {/* rack status lights */}
      <Prop id="rack" w={S.rack[2] - S.rack[0]} h={S.rack[3] - S.rack[1]}>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} data-led5={i} className="absolute h-[8px] w-[8px]" style={{ left: 40 + (i % 2) * 40, top: 40 + Math.floor(i / 2) * 44, background: i % 3 ? '#7dffb0' : GOLD, boxShadow: '0 0 10px 3px rgba(125,255,176,0.5)' }} />
        ))}
      </Prop>

      {/* gold modules running between the systems */}
      {Array.from({ length: 5 }, (_, i) => (
        <Prop key={i} id={`run${i}`} w={30} h={30} style={{ background: GOLD, boxShadow: '0 0 18px 6px rgba(216,0,23,0.55)' }} />
      ))}

      {/* the final QR: a cream card with a gold rim, and the crisp, scannable code UNDER the painted modules */}
      <Prop id="qrCard" w={QR_FULL} h={QR_FULL} style={{ background: '#f4ecd8', borderRadius: QR_CELL * 1.2, boxShadow: `inset 0 0 0 ${QR_CELL * 0.35}px ${GOLD}, 0 ${QR_CELL}px ${QR_CELL * 3}px rgba(2,6,20,0.55)` }}>
        {/* the modules are written on the client (createChapter5Updater): the code encodes the origin the page is served from */}
        <svg data-qr-crisp role="img" aria-label="İletişim bölümüne giden QR kod" shapeRendering="crispEdges" className="absolute" style={{ left: G.qr.quiet * QR_CELL, top: G.qr.quiet * QR_CELL, width: 25 * QR_CELL, height: 25 * QR_CELL, opacity: 0 }}>
          <path data-qr-path fill={INK} />
        </svg>
      </Prop>
    </div>
  );
}

// ------------------------------------------------------------------ screen space

export function Chapter5Grade() {
  return (
    <div
      data-ch5
      data-vignette5
      className="pointer-events-none absolute inset-0"
      style={{ opacity: 0, background: 'radial-gradient(ellipse at 50% 46%, rgba(4,10,28,0) 48%, rgba(4,10,28,0.72) 100%)' }}
    />
  );
}

export function Chapter5Text({ textClass }: { textClass: string }) {
  return (
    <>
      {BEAT5_TEXTS.map((t) => (
        // the soft pool of night behind the copy is a SIBLING of the text, not a child: `film-text`'s wipe mask
        // clips its children to the text box, which is what drew a hard rectangle into the calm sky
        <div
          key={`pool-${t.key}`}
          aria-hidden
          data-ch5
          data-pool5={t.key}
          className="pointer-events-none absolute"
          style={{
            left: t.box.x - 130,
            top: t.box.y - 90,
            width: t.box.w + 260,
            height: t.key === 't5Cta' ? 460 : 360,
            opacity: 0,
            background: 'radial-gradient(closest-side at 50% 50%, rgba(4,10,28,0.5), rgba(4,10,28,0.28) 55%, rgba(4,10,28,0) 100%)',
          }}
        />
      ))}
      {BEAT5_TEXTS.map((t) => (
        <div key={t.key} data-ch5 data-text5={t.key} lang="tr" className={`${textClass} absolute`} style={{ left: t.box.x, top: t.box.y, width: t.box.w, visibility: 'hidden' }}>
          <p className="eyebrow flex items-center gap-[10px] text-[13px] text-[#9cc7e0]">
            {(t.key === 't5Kerinti' || t.key === 't5Cta') && <Mark size={14} />}
            {t.eyebrow}
          </p>
          <h2 className={`display mt-[12px] leading-[1.06] text-[#eaf0f7] ${t.key === 't5Kerinti' ? 'text-[64px]' : 'text-[46px]'}`}>{t.heading}</h2>
          <p className="mt-[16px] text-[21px] leading-[1.5] text-[#b9cbe3]">{t.line}</p>
          {t.key === 't5Cta' && (
            <>
              <div className="mt-[30px]">
                <a
                  href={CONTACT_HREF}
                  onClick={scrollToContact}
                  className="cta-primary pointer-events-auto inline-flex items-center gap-[12px] rounded-[12px] px-[30px] py-[16px] font-sans text-[19px] font-bold text-white"
                >
                  {CTA.label}
                  <span aria-hidden>↓</span>
                </a>
              </div>
              <p className="mt-[22px] flex items-center gap-[10px] font-sans text-[15px] text-[#9cc7e0]">
                <span aria-hidden>→</span>
                {CTA.qrHint}
              </p>
            </>
          )}
        </div>
      ))}
    </>
  );
}

// ------------------------------------------------------------------ update

export type TextStyleFn = (el: HTMLElement | null, v: number) => void;

export function createChapter5Updater(root: HTMLElement) {
  const q = (sel: string) => (root.querySelector(sel) as HTMLElement | null) ?? document.createElement('div');
  const qa = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
  const hideText = process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('hideText') ?? 0) : 0;
  if (hideText >= 2) qa('[data-ch5-world] [data-ui-text]').forEach((el) => (el.style.visibility = 'hidden'));
  const veilOut = q('[data-veil5="out"]');
  const veilCrush = q('[data-veil5="crush"]');
  const veilIn = q('[data-veil5="in"]');
  const veilParts = qa('[data-veil5-part]');
  /** the outer veil as a frame around the hole [x0, y0, x1, y1] (veil box px); no hole = one rect covering all */
  const frameVeil = (W: number, H: number, hole: [number, number, number, number] | null) => {
    const clampX = (x: number) => Math.round(Math.min(W, Math.max(0, x)));
    const clampY = (y: number) => Math.round(Math.min(H, Math.max(0, y)));
    const rects: [number, number, number, number][] = hole
      ? (() => {
          const [x0, y0, x1, y1] = [clampX(hole[0]), clampY(hole[1]), clampX(hole[2]), clampY(hole[3])];
          return [
            [0, 0, W, y0],
            [0, y1, W, H - y1],
            [0, y0, x0, y1 - y0],
            [x1, y0, W - x1, y1 - y0],
          ];
        })()
      : [[0, 0, W, H], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    veilParts.forEach((el, i) => {
      const [x, y, w, h] = rects[i];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.width = `${Math.max(0, w)}px`;
      el.style.height = `${Math.max(0, h)}px`;
    });
  };
  const vignette = q('[data-vignette5]');
  const world = q('[data-ch5-world]');
  const crisp = q('[data-qr-crisp]');
  const qrPath = root.querySelector<SVGPathElement>('[data-qr-path]');
  let qrBuilt = false;
  /** write the real code into the card once (client only: its URL is the origin serving the page) */
  const buildQr = () => {
    const fq = getFinalQr();
    if (!fq || !qrPath) return;
    const n = fq.code.size;
    crisp.setAttribute('viewBox', `0 0 ${n} ${n}`);
    const quiet = G.qr.quiet * fq.cell;
    Object.assign(crisp.style, { left: `${quiet}px`, top: `${quiet}px`, width: `${n * fq.cell}px`, height: `${n * fq.cell}px` });
    qrPath.setAttribute('d', fq.code.modules.flatMap((row, r) => row.map((dark, c) => (dark ? `M${c} ${r}h1v1h-1z` : ''))).join(''));
    const card = props.get('qrCard');
    if (card) {
      card.style.width = card.style.height = `${fq.full}px`;
      sizes.set(card, [fq.full, fq.full]);
    }
    qrBuilt = true;
  };
  const texts = BEAT5_TEXTS.map((t) => ({ key: t.key, el: q(`[data-text5="${t.key}"]`), pool: q(`[data-pool5="${t.key}"]`) }));
  /** the pool follows its text's own fade (same curve as PortalFilm's textStyle) */
  const poolOpacity = (v: number) => (v <= 0.001 || v >= 1.999 ? 0 : v <= 1 ? Math.min(1, v * 1.6) : 1 - (v - 1));
  const props = new Map<string, HTMLElement>();
  qa('[data-prop5]').forEach((el) => props.set(el.dataset.prop5!, el));
  const sizes = new Map<HTMLElement, [number, number]>();
  for (const el of props.values()) sizes.set(el, [parseFloat(el.style.width), parseFloat(el.style.height)]);
  const breathe = new Map<string, HTMLElement>();
  for (const [id, el] of props) {
    const b = el.querySelector<HTMLElement>('[data-breathe5]');
    if (b) breathe.set(id, b);
  }
  const leds = qa('[data-led5]');
  const caret = q('[data-caret]');
  const xf: LayerXf = { m: 1, tx: 0, ty: 0, ok: true };
  let cam: Camera;
  let vp: Viewport;

  const vis = (el: HTMLElement, show: boolean) => {
    const v = show ? 'visible' : 'hidden';
    if (el.style.visibility !== v) el.style.visibility = v;
  };
  const setOpacity = (el: HTMLElement, v: number) => {
    const s = clamp01(v).toFixed(3);
    if (el.style.opacity !== s) el.style.opacity = s;
  };
  /** a world-space prop centred on (wx, wy) on the wall plane; culled off screen (with a margin for the 3D turn) */
  const place = (id: string, wx: number, wy: number, opacity: number, opts: { rot?: number; s?: number } = {}) => {
    const el = props.get(id);
    if (!el) return;
    if (opacity <= 0.002) return vis(el, false);
    layerTransform(cam, 0, xf);
    if (!xf.ok) return vis(el, false);
    const [w, h] = sizes.get(el)!;
    const k = xf.m * vp.b * (opts.s ?? 1);
    const cx = (wx * xf.m + xf.tx) * vp.b + vp.ox;
    const cy = (wy * xf.m + xf.ty) * vp.b + vp.oy;
    const pad = Math.max(vp.vw, vp.vh) * 0.35;
    if (cx + (w / 2) * k < -pad || cy + (h / 2) * k < -pad || cx - (w / 2) * k > vp.vw + pad || cy - (h / 2) * k > vp.vh + pad) return vis(el, false);
    vis(el, true);
    el.style.opacity = String(Math.min(1, opacity));
    el.style.transform = `translate3d(${cx - w / 2}px, ${cy - h / 2}px, 0) scale(${k}) rotate(${opts.rot ?? 0}rad)`;
  };
  const hideAll = () => {
    for (const el of props.values()) vis(el, false);
    for (const el of [veilOut, veilCrush, veilIn]) vis(el, false);
    setOpacity(vignette, 0);
  };

  /** runner position along the studio's system path at phase u ∈ [0, 1) */
  const R = S.runners;
  const runnerAt = (u: number) => {
    const n = R.length - 1;
    const t = u * n;
    const i = Math.min(n - 1, Math.floor(t));
    const f = t - i;
    return [lerp(R[i][0], R[i + 1][0], f), lerp(R[i][1], R[i + 1][1], f) - Math.sin(Math.PI * f) * 90];
  };

  return function update(st: FilmState, camB: Camera, v: Viewport, time: number, textStyle: TextStyleFn) {
    const active = st.ch5 >= 0.5;
    for (const t of texts) {
      const v = active && !hideText ? st[t.key] : 0;
      textStyle(t.el, v);
      setOpacity(t.pool, poolOpacity(v));
    }
    world.style.display = active ? 'block' : 'none';
    if (!active) return hideAll();
    cam = camB;
    vp = v;

    // ── night: the restaurant and its street turn to Kerinti night; its interior stays the warm light ──
    const night = st.night;
    vis(veilOut, night > 0.002);
    vis(veilCrush, night > 0.002);
    setOpacity(veilOut, night);
    setOpacity(veilCrush, 0.3 * night);
    layerTransform(camB, 0, xf);
    const [bx0, by0, bx1, by1] = G.building.rect;
    const sx = (x: number) => (x * xf.m + xf.tx) * vp.b + vp.ox;
    const sy = (y: number) => (y * xf.m + xf.ty) * vp.b + vp.oy;
    const r = { x: sx(bx0), y: sy(by0), w: sx(bx1) - sx(bx0), h: sy(by1) - sy(by0) };
    const onScreen = r.x < vp.vw * 1.4 && r.x + r.w > -vp.vw * 0.4 && r.y < vp.vh * 1.4 && r.y + r.h > -vp.vh * 0.4;
    if (night > 0.002 && onScreen) {
      // the outer veils get a hole where the building is; the inner veil fills that hole, lighter
      // (the veils sit inside the stage group, so they are in the same pre-turn screen space as the plates)
      const W = vp.vw * 1.6;
      const H = vp.vh * 1.6;
      const ox = vp.vw * 0.3;
      const oy = vp.vh * 0.3;
      const hole = `path(evenodd, "M0 0H${W.toFixed(0)}V${H.toFixed(0)}H0Z M${(r.x + ox).toFixed(1)} ${(r.y + oy).toFixed(1)}H${(r.x + r.w + ox).toFixed(1)}V${(r.y + r.h + oy).toFixed(1)}H${(r.x + ox).toFixed(1)}Z")`;
      frameVeil(W, H, [r.x + ox, r.y + oy, r.x + r.w + ox, r.y + r.h + oy]);
      veilCrush.style.clipPath = hole;
      vis(veilIn, true);
      setOpacity(veilIn, 0.62 * night);
      veilIn.style.transform = `translate3d(${r.x}px, ${r.y}px, 0) scale(${r.w}, ${r.h})`;
    } else {
      frameVeil(vp.vw * 1.6, vp.vh * 1.6, null);
      veilCrush.style.clipPath = '';
      vis(veilIn, false);
    }
    setOpacity(vignette, 0.75 * night + 0.2 * st.calm);

    // ── the Kerinti tower and its studio ──
    const calm = 1 - 0.8 * st.calm;
    place('sign', G.tower.sign[0], G.tower.sign[1], night * (0.9 + 0.1 * pulse(time, 0.8)));
    place('signGlow', G.tower.sign[0], G.tower.sign[1], night * (0.75 + 0.2 * pulse(time, 0.8)));
    S.lamps.forEach((x, i) => place(`lamp${i}`, x, -1450, 0.8 + 0.12 * pulse(time, 1.7, i)));
    S.monitors.forEach(([x, y], i) => {
      place(`monGlow${i}`, x, y - 60, 0.7 + 0.2 * pulse(time, 1.1, i * 2));
      place(`mon${i}`, x, y, 1);
    });
    place('display', (S.display[0] + S.display[2]) / 2, (S.display[1] + S.display[3]) / 2, 1);
    place('displayGlow', (S.display[0] + S.display[2]) / 2, (S.display[1] + S.display[3]) / 2, 0.7 + 0.2 * pulse(time, 0.9));
    place('rack', (S.rack[0] + S.rack[2]) / 2, (S.rack[1] + S.rack[3]) / 2, 1);
    leds.forEach((el, i) => setOpacity(el, 0.35 + 0.65 * (Math.sin(time * (2 + (i % 5) * 0.7) + i * 1.9) > 0.2 ? 1 : 0.3)));
    setOpacity(caret, Math.sin(time * 6) > 0 ? 1 : 0);
    (Object.keys(FIG) as (keyof typeof FIG)[]).forEach((k, i) => {
      const f = FIG[k];
      place(`fig-${k}`, f.at[0], f.at[1] - f.h / 2, 1);
      const b = breathe.get(`fig-${k}`);
      if (b) b.style.transform = `scale(${1 + 0.006 * Math.sin(time * 0.9 + i)}, ${1 + 0.012 * Math.sin(time * 1.4 + i * 1.7)}) rotate(${0.01 * Math.sin(time * 0.5 + i) * (k === 'e2' ? 2 : 1)}rad)`;
    });
    for (let i = 0; i < 5; i++) {
      const [rx, ry] = runnerAt((time * 0.06 + i / 5) % 1);
      place(`run${i}`, rx, ry, 0.9 * calm);
    }

    // ── the final QR card ──
    const qv = clamp01(st.qr);
    const [qx, qy] = G.qr.center;
    place('qrHalo', qx, qy, 0.25 + 0.5 * qv);
    if (!qrBuilt && st.k5 > 0.5) buildQr();
    place('qrCard', qx, qy, qv, { s: lerp(0.94, 1, qv) });
    setOpacity(crisp, clamp01((qv - 0.45) / 0.55));
  };
}
