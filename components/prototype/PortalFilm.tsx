'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  cameraFor,
  initialFilmState,
  layerTransform,
  portalCovers,
  viewportFor,
  type FilmState,
  type LayerXf,
} from '@/lib/prototype/camera';
import { ModuleField } from '@/lib/prototype/moduleField';
import { DAB_ATLAS, DESIGN, PLATES, SHARED, TEXT_BOXES, fitPlate, type WorldId } from '@/lib/prototype/sceneConfig';
import { ACT1, ACT2, NEXA_VH, RAIL, trackVh } from '@/lib/prototype/acts';
import { buildFilm } from '@/lib/prototype/timeline';
import { CH4_LABELS } from '@/lib/prototype/chapter4/timeline';
import { CH5_LABELS } from '@/lib/prototype/chapter5/timeline';
import { Chapter4Grade, Chapter4Portal, Chapter4Surface, Chapter4Text, Chapter4World, createChapter4Updater } from './Chapter4Layers';
import { Chapter5Grade, Chapter5Text, Chapter5Veil, Chapter5World, createChapter5Updater } from './Chapter5Layers';

/** debug freeze labels (?t=<label>): Chapter 4 and Chapter 5 — development builds only */
const LABELS: Record<string, number> = { ...CH4_LABELS, ...CH5_LABELS };
/**
 * Review tools (?t= freeze, ?debug overlay, window.__film) exist in development only; a production build
 * compiles them out, so a visitor can never freeze or inspect the film through the URL.
 */
const DEV = process.env.NODE_ENV !== 'production';

gsap.registerPlugin(useGSAP);

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// brushy outline of the portal aperture (normalised, pushed outward only so it hides under the frame dabs)
const APERTURE = (() => {
  const pts: [number, number][] = [];
  const per = 9;
  const corners: [number, number][] = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let s = 0; s < 4; s++) {
    const [ax, ay] = corners[s];
    const [bx, by] = corners[(s + 1) % 4];
    for (let i = 0; i < per; i++) {
      const t = i / per;
      const out = 1 + rnd() * 0.07;
      pts.push([(ax + (bx - ax) * t) * out, (ay + (by - ay) * t) * out]);
    }
  }
  return pts;
})();

function textStyle(el: HTMLElement | null, v: number) {
  if (!el) return;
  if (v <= 0.001 || v >= 1.999) {
    el.style.visibility = 'hidden';
    return;
  }
  el.style.visibility = 'visible';
  if (v <= 1) {
    const e = v;
    el.style.opacity = String(Math.min(1, e * 1.6));
    el.style.transform = `translate3d(0, ${(1 - e) * 16}px, 0)`;
    el.style.setProperty('--wipe', `${(1 - e) * 100}%`);
  } else {
    const e = v - 1;
    el.style.opacity = String(1 - e);
    el.style.transform = `translate3d(0, ${-e * 22}px, 0)`;
    el.style.setProperty('--wipe', '0%');
  }
}

/**
 * The film, scrolled in two acts (lib/prototype/acts.ts). `children` are the ordinary page sections between
 * them: they must contain one `[data-film-cover]` block that fully covers the stage — the playhead jumps from
 * Act 1 to Act 2 only while that block covers the whole viewport.
 */
export default function PortalFilm({ children }: { children?: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    if (DEV) setDebug(new URLSearchParams(window.location.search).has('debug'));
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      const st: FilmState = initialFilmState();
      const field = new ModuleField();
      const canvas = el.querySelector<HTMLCanvasElement>('[data-motif]')!;
      const ctx = canvas.getContext('2d')!;
      const worldA = el.querySelector<HTMLElement>('[data-world="A"]')!;
      const worldB = el.querySelector<HTMLElement>('[data-world="B"]')!;
      const glow = el.querySelector<HTMLElement>('[data-glow]')!;
      const flare = el.querySelector<HTMLElement>('[data-flare]')!;
      const debugEl = el.querySelector<HTMLElement>('[data-debug]');
      const rail = Array.from(el.querySelectorAll<HTMLElement>('[data-rail]'));
      const textFrame = el.querySelector<HTMLElement>('[data-text-frame]')!;
      let textFrameXf = '';
      const texts = {
        intro: el.querySelector<HTMLElement>('[data-text="intro"]'),
        small: el.querySelector<HTMLElement>('[data-text="small"]'),
        nexa: el.querySelector<HTMLElement>('[data-text="nexa"]'),
      };
      const plates = PLATES.map((p) => ({ def: p, el: el.querySelector<HTMLImageElement>(`[data-plate="${p.id}"]`)! }));
      const xf: LayerXf = { m: 1, tx: 0, ty: 0, ok: true };
      const updateChapter4 = createChapter4Updater(el);
      const updateChapter5 = createChapter5Updater(el);
      const track1 = el.querySelector<HTMLElement>('[data-track="1"]')!;
      const track2 = el.querySelector<HTMLElement>('[data-track="2"]')!;
      const cover = el.querySelector<HTMLElement>('[data-film-cover]');
      /** the page sections cover the whole stage: skip the film's render (the last frame stays, nothing is cleared) */
      const covered = () => {
        if (!cover) return false;
        const r = cover.getBoundingClientRect();
        return r.top <= 0 && r.bottom >= window.innerHeight;
      };
      /** scroll → timeline time. Act 1 on the first track, Act 2 on the second; between them the page holds the
       *  end of Act 1 until the middle of the cover, then the start of Act 2 (a settled frame, ready to be revealed). */
      const timeAt = () => {
        const vh = window.innerHeight;
        const r2 = track2.getBoundingClientRect();
        if (r2.top <= 0) return ACT2.t0 + clamp01(-r2.top / Math.max(1, r2.height - vh)) * (ACT2.t1 - ACT2.t0);
        if (cover) {
          const c = cover.getBoundingClientRect();
          if (c.top + c.height / 2 < vh / 2) return ACT2.t0;
        }
        const r1 = track1.getBoundingClientRect();
        return ACT1.t0 + clamp01(-r1.top / Math.max(1, r1.height - vh)) * (ACT1.t1 - ACT1.t0);
      };
      // Chapter 4 art loads lazily once late Chapter 3 is reached
      let ch4Loading = false;
      const loadChapter4 = () => {
        if (ch4Loading) return;
        ch4Loading = true;
        el.querySelectorAll<HTMLImageElement>('img[data-lazy-src]').forEach((img) => {
          img.src = img.dataset.lazySrc!;
          img.decode().catch(() => undefined);
        });
      };

      const film = buildFilm(st);
      let alive = true;

      // ---------------------------------------------------------------- render
      const render = (time: number) => {
        if (covered()) return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const vp = viewportFor(vw, vh);
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        if (canvas.width !== Math.round(vw * dpr) || canvas.height !== Math.round(vh * dpr)) {
          canvas.width = Math.round(vw * dpr);
          canvas.height = Math.round(vh * dpr);
        }

        const inB = st.world >= 0.5;
        const covers = portalCovers(st, vp);
        const cams: Record<WorldId, ReturnType<typeof cameraFor>> = { A: cameraFor('A', st), B: cameraFor('B', st) };

        // plates
        for (const { def, el: img } of plates) {
          const world: WorldId = def.world === 'A' ? 'A' : 'B';
          layerTransform(cams[world], def.depth, xf);
          let opacity = def.opacity ?? 1;
          let show = xf.ok;
          if (def.chapter === 4 && st.ch4 < 0.5) show = false;
          if (def.chapter === 5 && st.ch5 < 0.5) show = false;
          if (def.id === 'ch5-sky') opacity *= Math.min(1, st.night * 1.25); // night falls over the city
          if (def.world === 'A' && (inB || covers)) show = false;
          if (def.world === 'B' && (!inB || covers)) show = false;
          if (show && def.depth < 0) opacity *= Math.min(1, Math.max(0, (7 - xf.m) / 3.2));
          if (!show || opacity <= 0.001) {
            if (img.style.visibility !== 'hidden') img.style.visibility = 'hidden';
            continue;
          }
          const k = xf.m * vp.b;
          const [fx, fy] = fitPlate(img, def);
          const x = (def.x * xf.m + xf.tx) * vp.b + vp.ox;
          const y = (def.y * xf.m + xf.ty) * vp.b + vp.oy;
          img.style.visibility = 'visible';
          img.style.opacity = String(opacity);
          img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k * fx}, ${k * fy})`;
        }

        // World A container: a hole punched exactly at the portal square
        // children set their own visibility, so the containers toggle display
        const showA = inB || covers ? 'none' : 'block';
        const showB = inB && !covers ? 'block' : 'none';
        if (worldA.style.display !== showA) worldA.style.display = showA;
        if (worldB.style.display !== showB) worldB.style.display = showB;
        if (!inB && !covers) {
          const s = Math.exp(st.logS) * vp.b;
          const cx = st.px * vp.b + vp.ox;
          const cy = st.py * vp.b + vp.oy;
          const hs = s * st.aperture;
          const hole = APERTURE.map(([u, v], i) => `${i ? "L" : "M"}${(cx + u * hs).toFixed(1)} ${(cy + v * hs).toFixed(1)}`).join(" ");
          worldA.style.clipPath = hs > 0.5 ? `path(evenodd, "M0 0H${vw}V${vh}H0Z ${hole}Z")` : "none";
          const gs = Math.max(s * 7, 1100 * vp.b);
          glow.style.opacity = String(st.glow * Math.max(0, Math.min(1, (3000 - s) / 1600)));
          glow.style.transform = `translate3d(${cx - gs / 2}px, ${cy - gs / 2}px, 0) scale(${gs / 1024})`;
        }

        flare.style.opacity = String(st.flare * 0.8);

        field.draw(ctx, st, vp, dpr, time);

        // text lives in design space: same cover mapping as the plates (only rewritten on resize)
        const frameXf = `translate(${vp.ox}px, ${vp.oy}px) scale(${vp.b})`;
        if (frameXf !== textFrameXf) {
          textFrame.style.transform = frameXf;
          textFrameXf = frameXf;
        }
        textStyle(texts.intro, st.textIntro);
        textStyle(texts.small, st.textSmall);
        textStyle(texts.nexa, st.textNexa);
        const now = film.time();
        updateChapter4(st, cams.B, vp, time, textStyle, now);
        updateChapter5(st, cams.B, vp, time, textStyle);
        if (now > 3) loadChapter4();
        rail.forEach((r, i) => {
          const { t0, t1 } = RAIL[i];
          r.style.setProperty('--fill', String(clamp01((now - t0) / (t1 - t0))));
        });

        if (debugEl) {
          const camB = cams.B;
          debugEl.textContent =
            `t ${now.toFixed(3)}  world ${inB ? 'B' : 'A'}  covers ${covers}\n` +
            `portal ${st.px.toFixed(0)},${st.py.toFixed(0)}  size ${Math.exp(st.logS).toFixed(0)}\n` +
            `dA ${cams.A.d.toFixed(3)}  dB ${camB.d.toFixed(3)}\n` +
            `assemble ${st.assemble.toFixed(2)} carry ${st.goldCarry.toFixed(2)} land ${st.goldLand.toFixed(2)} settle ${st.settle.toFixed(2)}\n` +
            `ch4 ${label(now)}  form ${st.form.toFixed(2)}  order ${st.orderS.toFixed(0)}  day ${st.day.toFixed(2)}`;
        }
      };

      const label = (t: number) => {
        let name = t < CH4_LABELS['ch4-start'] ? '—' : 'ch4-start';
        for (const [k, v] of Object.entries(LABELS).sort((a, b) => a[1] - b[1])) if (t >= v - 1e-6) name = k;
        return name;
      };

      const tick = (time: number) => {
        if (alive) render(time);
      };

      // ---------------------------------------------------------------- scroll → playhead
      // Eased catch-up inside an act (like a 0.7s scrub); an instant cut when the target lies in the other act.
      // That only happens under the full cover, so the skipped Chapter 4 is never played through on screen.
      const play = { t: 0 };
      let reduced = false;
      const inAct2 = (t: number) => t > ACT1.t1 + 1e-3;
      const seek = (instant = false) => {
        const target = timeAt();
        if (instant || reduced || inAct2(target) !== inAct2(play.t)) {
          gsap.killTweensOf(play);
          play.t = target;
          film.time(target);
          return;
        }
        gsap.to(play, { t: target, duration: 0.7, ease: 'power3.out', overwrite: true, onUpdate: () => void film.time(play.t) });
      };
      const onScroll = () => seek();
      let listening = false;

      // ---------------------------------------------------------------- load
      const imgs = [
        ...plates.filter((p) => p.def.chapter !== 4).map((p) => p.el),
        el.querySelector<HTMLImageElement>('[data-atlas]')!,
      ];
      // decode everything up front so World B already exists before the portal opens
      // (decode() can stall in background tabs, hence the timeout)
      const settle = (i: HTMLImageElement) =>
        Promise.race([
          (i.complete ? Promise.resolve() : new Promise<void>((r) => { i.onload = i.onerror = () => r(); })).then(() => i.decode().catch(() => undefined)),
          new Promise<void>((r) => setTimeout(r, 2500)),
        ]);
      Promise.all(imgs.map(settle)).then(() => {
        if (!alive) return;
        field.setAtlas(el.querySelector<HTMLImageElement>('[data-atlas]')!);

        // DEV only: ?t=2.4 freezes the film at a timeline time (frame inspection); otherwise scroll is the playhead
        // ?t=menu (any Chapter 4/5 checkpoint label) also works
        const frozen = DEV ? new URLSearchParams(window.location.search).get('t') : null;
        // with reduced motion the film follows the scrollbar exactly, without the eased catch-up
        reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (frozen !== null) {
          const named = LABELS[frozen];
          const t = named ?? parseFloat(frozen);
          if (t > 3) loadChapter4();
          film.time(t);
        } else {
          seek(true);
          window.addEventListener('scroll', onScroll, { passive: true });
          window.addEventListener('resize', onScroll);
          listening = true;
        }
        if (DEV) {
          (window as unknown as { __film: unknown; __ch4labels: unknown }).__film = { film, st, field, render: (time?: number) => render(time ?? gsap.ticker.time) };
          (window as unknown as { __ch4labels: unknown }).__ch4labels = LABELS;
        }
        gsap.ticker.add(tick);
        render(gsap.ticker.time);
        setReady(true);
      });

      return () => {
        alive = false;
        gsap.ticker.remove(tick);
        gsap.killTweensOf(play);
        if (listening) {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
        }
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      {/* ── fixed stage ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden bg-[#050b1e]" aria-hidden="true">
        {/* Chapter 4 turns this group in 3D (the camera's orientation in each room); identity before it */}
        <div data-wall className="absolute inset-0" style={{ transformOrigin: '0 0' }}>
          {PLATES.filter((p) => p.world === 'view').map((p) => (
            <Plate key={p.id} id={p.id} src={p.src} w={p.w} h={p.h} blend={p.blend} />
          ))}
          <div data-world="B" className="absolute inset-0" style={{ display: 'none' }}>
            {PLATES.filter((p) => p.world === 'B' && p.chapter !== 5).map((p) => (
              <Plate key={p.id} id={p.id} src={p.src} w={p.w} h={p.h} blend={p.blend} lazy={p.chapter === 4} />
            ))}
            <Chapter4World />
            {/* Chapter 5: the night veil darkens everything above; the Kerinti plates and world come after it */}
            <Chapter5Veil />
            {PLATES.filter((p) => p.chapter === 5).map((p) => (
              <Plate key={p.id} id={p.id} src={p.src} w={p.w} h={p.h} blend={p.blend} lazy />
            ))}
            <Chapter5World />
          </div>
        </div>
        <Chapter4Portal />
        <div data-world="A" className="absolute inset-0">
          {PLATES.filter((p) => p.world === 'A').map((p) => (
            <Plate key={p.id} id={p.id} src={p.src} w={p.w} h={p.h} blend={p.blend} />
          ))}
          <div
            data-glow
            className="pointer-events-none absolute left-0 top-0 origin-top-left"
            style={{
              mixBlendMode: "screen",
              opacity: 0,
              width: 1024,
              height: 1024,
              background: "radial-gradient(circle at 50% 50%, rgba(255,236,190,0.55) 0%, rgba(246,199,122,0.28) 18%, rgba(224,150,90,0.1) 38%, rgba(224,150,90,0) 62%)",
            }}
          />
        </div>
        <canvas data-motif className="absolute inset-0 h-full w-full" />
        <Chapter4Grade />
        <Chapter5Grade />
        {/* Chapter 4 THROUGH surface: above the modules, below the text */}
        <Chapter4Surface />
        <div
          data-flare
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0,
            mixBlendMode: 'screen',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(255,244,214,0.95) 0%, rgba(255,214,150,0.55) 40%, rgba(255,190,120,0) 75%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{ backgroundImage: `url(${SHARED.grain})`, mixBlendMode: 'soft-light' }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-atlas src={DAB_ATLAS.src} alt="" className="hidden" />
      </div>

      {/* ── story text ────────────────────────────────────────────────
           Laid out in the 1920×1080 design frame (px below = design units) and cover-fitted
           exactly like the artwork, so each box stays inside its painted safe zone.
           Boxes: TEXT_BOXES in sceneConfig.ts. TODO(mobile-phase): portrait layout. */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <div data-text-frame className="absolute left-0 top-0 origin-top-left" style={{ width: DESIGN.w, height: DESIGN.h }}>
          <div
            data-text="intro"
            className="film-text absolute"
            style={{ left: TEXT_BOXES.intro.x, top: TEXT_BOXES.intro.y, width: TEXT_BOXES.intro.w }}
          >
            <p className="eyebrow text-[14px] text-[#9cc7e0]">Kerinti</p>
            <h1 className="display mt-[18px] text-[60px] leading-[1.04] text-[#eaf0f7]">
              Restoran operasyonunu sadeleştiriyoruz.
            </h1>
            <p className="mt-[24px] text-[21px] leading-[1.5] text-[#b9cbe3]">
              Servis akışından raporlamaya kadar karmaşayı netliğe dönüştüren dijital sistemler geliştiriyoruz.
            </p>
          </div>

          <div
            data-text="small"
            className="film-text absolute"
            style={{ left: TEXT_BOXES.small.x, top: TEXT_BOXES.small.y, width: TEXT_BOXES.small.w, visibility: 'hidden' }}
          >
            <p className="display text-[40px] leading-[1.1] text-[#eaf0f7]">Her şey küçük bir şeyle başlar.</p>
          </div>

          <div
            className="absolute"
            style={{ left: TEXT_BOXES.nexa.x - 32, top: TEXT_BOXES.nexa.y - 32, width: TEXT_BOXES.nexa.w + 64, padding: 32 }}
          >
            <div data-text="nexa" className="film-text relative" style={{ visibility: 'hidden' }}>
              <p className="eyebrow text-[13px] text-[#8a5a31]">NeXa Restoran Sipariş Yönetimi</p>
              <h2 className="display mt-[12px] text-[48px] leading-[1.06] text-[#1e2430]">
                Her masa, her sipariş, her ödeme tek sistemde.
              </h2>
              <ul className="mt-[22px] space-y-[8px] text-[18px] leading-[1.45] text-[#3b3328]">
                <li><strong className="font-semibold text-[#1e2430]">QR ile sipariş</strong> — misafir menüyü masadan açar, siparişini kendisi verir.</li>
                <li><strong className="font-semibold text-[#1e2430]">Mutfaktan kasaya</strong> — sipariş bir kez girilir, kimse yeniden yazmaz.</li>
                <li><strong className="font-semibold text-[#1e2430]">Anlık takip</strong> — işletmede olanı, olduğu anda görün.</li>
              </ul>
            </div>
          </div>

          <Chapter4Text textClass="film-text" />
          <Chapter5Text textClass="film-text" />
        </div>
      </div>

      {/* chapter rail */}
      <div className="fixed right-5 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3" aria-hidden="true">
        {RAIL.map((c) => (
          <span key={c.id} data-rail className="rail-dot" title={c.label} />
        ))}
      </div>

      {DEV && debug && (
        <pre data-debug className="fixed bottom-3 left-3 z-30 whitespace-pre rounded bg-black/70 px-3 py-2 font-mono text-[11px] leading-4 text-lime-300" />
      )}

      <div
        className={`pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[#050b1e] transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
      >
        <span className="eyebrow text-[0.8rem] text-[#9cc7e0]">Kerinti</span>
      </div>

      {/* ── scroll tracks: the scroll position is the playhead ────────
           The anchors sit ON a track, so navigating to them simply moves the playhead (#ust = the start,
           #nexa = the product story); the film is never restarted or replayed. */}
      <div data-track="1" className="relative" style={{ height: `${trackVh(ACT1)}vh` }}>
        <span id="ust" tabIndex={-1} className="absolute left-0 top-0 h-px w-px focus:outline-none" aria-label="Sayfanın başı" />
        <span id="nexa" tabIndex={-1} className="absolute left-0 h-px w-px focus:outline-none" style={{ top: `${NEXA_VH}vh` }} aria-label="NeXa" />
      </div>

      {/* the standard site between the two acts (it covers the stage) */}
      {children}

      {/* Act 2: Kerinti → team → the final QR and the call to action */}
      <div data-track="2" className="relative" style={{ height: `${trackVh(ACT2)}vh` }}>
        <span id="kerinti" tabIndex={-1} className="absolute left-0 top-0 h-px w-px focus:outline-none" aria-label="Kerinti" />
      </div>
    </div>
  );
}

function Plate({ id, src, w, h, blend, lazy }: { id: string; src: string; w: number; h: number; blend?: string; lazy?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-plate={id}
      data-ch4={lazy ? '1' : undefined}
      src={lazy ? undefined : src}
      data-lazy-src={lazy ? src : undefined}
      alt=""
      width={w}
      height={h}
      draggable={false}
      className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left select-none"
      style={{ width: w, height: h, mixBlendMode: blend as React.CSSProperties['mixBlendMode'], visibility: 'hidden', willChange: 'transform' }}
    />
  );
}
