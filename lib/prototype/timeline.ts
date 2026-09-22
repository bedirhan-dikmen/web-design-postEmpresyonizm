import { gsap } from 'gsap';
import type { FilmState } from './camera';
import { PORTAL } from './sceneConfig';
import { buildChapter4 } from './chapter4/timeline';
import { buildChapter5 } from './chapter5/timeline';

const L = Math.log;

/**
 * The movie. 1 timeline second = 100vh of scroll.
 *
 *   0.00 ─ 1.80  Chapter 1  Kerinti night: stars assemble into the QR, camera leans in
 *   1.80 ─ 3.00  Chapter 2  dive into the top-left finder, pass through, settle back in the restaurant
 *   3.00 ─ 4.40  Chapter 3  NeXa morning: gold + dust drift down the sunbeam and become the table QR
 *
 * World switch happens at WORLD_SWITCH, when the portal square is ~7000 units wide and
 * covers the screen entirely — both worlds render the identical frame there.
 */
export const WORLD_SWITCH = 2.58;
export const PEAK_SIZE = 7000;

export const LABELS = { kerinti: 0, portal: 1.8, nexa: 3.0, end: 4.4 } as const;

export function buildFilm(st: FilmState): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  Object.entries(LABELS).forEach(([k, v]) => tl.addLabel(k, v));

  // ── Chapter 1 — Kerinti intro ────────────────────────────────────────────
  tl.to(st, { textIntro: 2, duration: 0.42, ease: 'power1.in' }, 0.1);
  tl.to(st, { assemble: 1, duration: 1.3 }, 0.12);
  // slow lean toward the top-left finder
  tl.to(st, { logS: L(PORTAL.A.size * 1.16), px: PORTAL.A.cx - 40, py: PORTAL.A.cy + 34, duration: 1.8, ease: 'sine.inOut' }, 0);
  tl.to(st, { glow: 0.6, duration: 0.7, ease: 'sine.inOut' }, 1.1);
  // the eye starts to open: light leaks between the gold core modules
  tl.to(st, { aperture: 0.42, duration: 0.5, ease: 'sine.inOut' }, 1.3);
  tl.to(st, { textSmall: 1, duration: 0.28, ease: 'power1.out' }, 1.02);
  tl.to(st, { textSmall: 2, duration: 0.24, ease: 'power1.in' }, 1.5);

  // ── Chapter 2 — Portal ───────────────────────────────────────────────────
  tl.to(st, { logS: L(PEAK_SIZE), duration: WORLD_SWITCH - 1.8, ease: 'power2.inOut' }, 1.8);
  tl.to(st, { px: 960, py: 540, duration: 0.6, ease: 'power2.inOut' }, 1.8);
  tl.to(st, { glow: 1, duration: 0.4, ease: 'sine.in' }, 1.8);
  tl.to(st, { aperture: 1, duration: 0.3, ease: 'power1.inOut' }, 1.8);
  tl.to(st, { goldCarry: 1, duration: 0.42, ease: 'sine.inOut' }, 1.9);
  tl.to(st, { flicks: 1, duration: 0.32, ease: 'power1.in' }, 2.02);
  tl.to(st, { flare: 1, duration: 0.2, ease: 'power2.in' }, 2.38);
  tl.set(st, { world: 1 }, WORLD_SWITCH);
  tl.to(st, { flicks: 0, duration: 0.34, ease: 'power1.out' }, WORLD_SWITCH);
  tl.to(st, { flare: 0, duration: 0.38, ease: 'power1.out' }, WORLD_SWITCH);
  // settle back: the square we flew through is the restaurant window
  tl.to(st, { logS: L(PORTAL.B.size), px: PORTAL.B.cx, py: PORTAL.B.cy, duration: 0.74, ease: 'power2.inOut' }, WORLD_SWITCH);

  // ── Chapter 3 — NeXa intro ───────────────────────────────────────────────
  tl.to(st, { goldLand: 1, duration: 0.5, ease: 'sine.inOut' }, 3.12);
  tl.to(st, { logS: L(PORTAL.B.size * 1.14), px: 470, py: 360, duration: 1.0, ease: 'sine.inOut' }, 3.32);
  tl.to(st, { settle: 1, duration: 0.85 }, 3.4);
  tl.to(st, { goldLand: 2, duration: 0.55, ease: 'sine.inOut' }, 3.66);
  tl.to(st, { textNexa: 1, duration: 0.34, ease: 'power1.out' }, 3.92);
  tl.to({}, { duration: LABELS.end - 4.26 }, 4.26); // hold on the final frame

  // ── Chapter 4 — One Order, One Day (appended; Chapters 1–3 above are unchanged) ──
  buildChapter4(tl, st);

  // ── Chapter 5 — Return to Kerinti + corporate finale (appended; everything above is unchanged) ──
  buildChapter5(tl, st);

  return tl;
}
