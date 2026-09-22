import type { gsap } from 'gsap';
import type { FilmState } from '../camera';
import { CH4, pathAt, shotVars } from '../chapter4/timeline';
import G4 from '../chapter4/geometry.json';
import G from './geometry.json';

/**
 * CHAPTER 5 — Return to Kerinti + corporate finale. Appended after Chapter 4 (1 unit = 100vh).
 *
 * No portal. The film returns home by TRANSFORMATION and CAMERA TRAVEL inside the same world:
 *
 *   k1  5.1 FROM NEXA TO KERINTI   the manager's panel dissolves into square dabs; the camera pulls out of the
 *                                   office over the night city while evening turns to Kerinti night; the operational
 *                                   modules rise off the monitor into the Kerinti sky — Kerinti.
 *   k2  5.2 COMPANY                a controlled diagonal descent down the Kerinti tower into its cut-away studio.
 *   k3  5.3 TEAM                   a closer, human-scale push to the team at the desk.
 *   k4  5.4 FINAL CTA / QR         back up the tower into a calm sky; the same modules that were Chapter 1's stars,
 *                                   Chapter 3's table QR and Chapter 4's order assemble into a real, scannable QR.
 *
 * Camera language gets calmer beat by beat: pull-back → diagonal descent → small push → settle.
 * Copy follows the Chapter 4 rule: ARRIVE → SETTLE → TEXT → HOLD → TEXT LEAVES → CAMERA CONTINUES.
 */

export const CH5_START = CH4.end;

const DURATIONS = { k1: 2.0, k2: 1.25, k3: 0.9, k4: 1.5 } as const;
export type Beat5 = keyof typeof DURATIONS;

const BEATS = (() => {
  let t = CH5_START;
  const out = {} as Record<Beat5, { start: number; dur: number }>;
  for (const k of Object.keys(DURATIONS) as Beat5[]) {
    out[k] = { start: t, dur: DURATIONS[k] };
    t += DURATIONS[k];
  }
  return out;
})();

export const CH5 = {
  start: CH5_START,
  beats: Object.fromEntries(Object.entries(BEATS).map(([k, v]) => [k, +v.start.toFixed(3)])) as Record<Beat5, number>,
  end: +(BEATS.k4.start + BEATS.k4.dur).toFixed(3),
};

const at = (b: Beat5, f: number) => +(BEATS[b].start + BEATS[b].dur * f).toFixed(3);

export const CH5_LABELS = {
  'ch5-start': CH5_START,
  'to-night': at('k1', 0.3),
  'city-night': at('k1', 0.45),
  /** the page re-enters the film here (see lib/prototype/acts.ts): the camera has settled over the Kerinti sky,
   *  the night is complete, and "NEXA'NIN ARKASINDA · Kerinti." is about to come in */
  reentry: at('k1', 0.62),
  kerinti: at('k1', 0.9),
  'to-studio': at('k2', 0.3),
  company: at('k2', 0.85),
  team: at('k3', 0.85),
  'to-sky': at('k4', 0.3),
  assemble: at('k4', 0.55),
  cta: at('k4', 0.95),
  'ch5-end': CH5.end,
} as const;

type Shot5 = keyof typeof G.camera;
const SHOT: Record<string, number[]> = { ...(G4.camera as unknown as Record<string, number[]>), ...(G.camera as unknown as Record<string, number[]>) };

export function buildChapter5(tl: gsap.core.Timeline, st: FilmState) {
  const len = (b: Beat5, d: number) => BEATS[b].dur * d;
  const pos = (b: Beat5, f: number) => BEATS[b].start + BEATS[b].dur * f;
  const to = (b: Beat5, f: number, d: number, vars: gsap.TweenVars, ease = 'none') =>
    tl.to(st, { ...vars, duration: len(b, d), ease }, pos(b, f));
  const look = (b: Beat5, f: number, d: number, shot: Shot5, ease = 'sine.inOut') => to(b, f, d, shotVars(SHOT[shot]), ease);
  /** continuous camera travel through waypoints (same sampling as Chapter 4's travel) */
  const travel = (b: Beat5, f: number, d: number, keys: string[], N = 24) => {
    const shots = keys.map((k) => SHOT[k]);
    const frames = Array.from({ length: N }, (_, i) => {
      const u = (i + 1) / N;
      return { ...shotVars(pathAt(shots, u * u * (3 - 2 * u))), duration: len(b, d) / N, ease: 'none' };
    });
    tl.to(st, { keyframes: frames }, pos(b, f));
  };
  const text = (b: Beat5, key: string, inF: number, outBeat?: Beat5, outF = 0) => {
    tl.to(st, { [key]: 1, duration: 0.1, ease: 'power1.out' }, pos(b, inF));
    if (outBeat) tl.to(st, { [key]: 2, duration: 0.07, ease: 'power1.in' }, pos(outBeat, outF));
  };

  tl.set(st, { ch5: 1 }, CH5_START + 0.001);

  // ══ 5.1 · FROM NEXA TO KERINTI ═══════════════════════════════════════════════════════
  // SOURCE: Chapter 4's final frame. The closing line and the panel leave first, the panel dissolving into
  // the square dabs it is made of; only then does the camera move.
  to('k1', 0.0, 0.05, { textCloser: 2 }, 'power1.in');
  to('k1', 0.02, 0.2, { mgmt: 0, dissolve: 1 }, 'sine.inOut');
  travel('k1', 0.06, 0.6, ['officeLife', 'cityPull', 'skyKerinti']);
  to('k1', 0.06, 0.46, { night: 1 }, 'sine.inOut'); // warm ochre recedes, cobalt returns
  to('k1', 0.12, 0.56, { k5: 1 }, 'sine.inOut'); // the operational modules rise into the Kerinti sky
  text('k1', 't5Kerinti', 0.68, 'k2', 0.03);

  // ══ 5.2 · COMPANY — a controlled diagonal descent into the Kerinti studio ═════════════
  travel('k2', 0.06, 0.4, ['skyKerinti', 'towerFace', 'studioWide']);
  to('k2', 0.1, 0.3, { markDim: 1 }, 'sine.inOut'); // the finder mark steps back while we are with the team
  text('k2', 't5Company', 0.5, 'k3', 0.03);

  // ══ 5.3 · TEAM — closer, human scale ══════════════════════════════════════════════════
  look('k3', 0.05, 0.35, 'teamDesk');
  text('k3', 't5Team', 0.44, 'k4', 0.02);

  // ══ 5.4 · FINAL CTA / QR — back into a calm sky; the modules become the QR ════════════
  travel('k4', 0.05, 0.42, ['teamDesk', 'studioWide', 'towerRise', 'finalSky']);
  to('k4', 0.04, 0.2, { markDim: 0 }, 'sine.inOut');
  to('k4', 0.24, 0.36, { k5: 2 }, 'sine.inOut'); // assemble (the camera has settled by 0.47)
  to('k4', 0.38, 0.26, { qr: 1 }, 'sine.inOut'); // the card and the crisp code come up; the paint settles into it
  to('k4', 0.42, 0.32, { calm: 1 }, 'sine.inOut');
  text('k4', 't5Cta', 0.58); // stays to the end — and beyond, while the page footer scrolls over the still frame
  tl.to({}, { duration: CH5.end - at('k4', 0.74) }, at('k4', 0.74)); // stable final frame
}
