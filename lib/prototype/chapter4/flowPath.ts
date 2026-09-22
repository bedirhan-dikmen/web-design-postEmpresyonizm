import G from './geometry.json';

/**
 * The operational flow line: one smooth path through the building, sampled by arc length.
 * The order (ticket → receipt → stock → ledger → report) always travels along it.
 */

export interface PathPoint {
  x: number;
  y: number;
  /** tangent angle */
  a: number;
}

const CONTROL = G.flowPath as [number, number][];
const SAMPLES_PER_SEGMENT = 24;

function catmullRom(p0: number[], p1: number[], p2: number[], p3: number[], t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (i: number) =>
    0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3);
  return [f(0), f(1)];
}

const xs: number[] = [];
const ys: number[] = [];
const lens: number[] = [];
/** arc length at each control point */
const controlLen: number[] = [];

(() => {
  let total = 0;
  for (let i = 0; i < CONTROL.length - 1; i++) {
    const p0 = CONTROL[Math.max(0, i - 1)];
    const p1 = CONTROL[i];
    const p2 = CONTROL[i + 1];
    const p3 = CONTROL[Math.min(CONTROL.length - 1, i + 2)];
    for (let s = 0; s < SAMPLES_PER_SEGMENT; s++) {
      const [x, y] = catmullRom(p0, p1, p2, p3, s / SAMPLES_PER_SEGMENT);
      if (xs.length) total += Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]);
      xs.push(x);
      ys.push(y);
      lens.push(total);
      // arc length AT the control point (the first sample of its segment), so anchors land exactly on it
      if (s === 0) controlLen[i] = total;
    }
  }
  const last = CONTROL[CONTROL.length - 1];
  total += Math.hypot(last[0] - xs[xs.length - 1], last[1] - ys[ys.length - 1]);
  xs.push(last[0]);
  ys.push(last[1]);
  lens.push(total);
  controlLen[CONTROL.length - 1] = total;
})();

export const PATH_LENGTH = lens[lens.length - 1];

/** Arc length of a named anchor (see geometry.json anchors). */
export const ANCHOR_S = Object.fromEntries(
  Object.entries(G.anchors).map(([k, idx]) => [k, controlLen[idx as number]]),
) as Record<keyof typeof G.anchors, number>;

export function pointAt(s: number, out: PathPoint = { x: 0, y: 0, a: 0 }): PathPoint {
  const t = Math.max(0, Math.min(PATH_LENGTH, s));
  let lo = 0;
  let hi = lens.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (lens[mid] <= t) lo = mid;
    else hi = mid;
  }
  const span = lens[hi] - lens[lo] || 1;
  const f = (t - lens[lo]) / span;
  out.x = xs[lo] + (xs[hi] - xs[lo]) * f;
  out.y = ys[lo] + (ys[hi] - ys[lo]) * f;
  out.a = Math.atan2(ys[hi] - ys[lo], xs[hi] - xs[lo]);
  return out;
}

/** Sampled polyline for drawing (every n-th sample). */
export function samples(): { xs: number[]; ys: number[]; lens: number[] } {
  return { xs, ys, lens };
}
