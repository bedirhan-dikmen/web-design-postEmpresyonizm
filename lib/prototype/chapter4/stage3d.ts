import { layerTransform, type Camera, type FilmState, type LayerXf, type Viewport } from '../camera';

/**
 * Phase 4.9 camera orientation.
 *
 * The Chapter 4 world is a painted cross-section (one wall plane with depth layers). Until 4.7 the camera
 * could only pan and zoom across it, so every room was seen from the same square-on angle. Here the whole
 * section is treated as a rigid plane in 3D and the camera may turn relative to it:
 *
 *   yaw / pitch / roll   the camera's own orientation — the warm human-height table, the three-quarter
 *                        cashier from the street side, the deeper side-on kitchen, the low tracking shot
 *                        beside the waiter, the three-quarter management workstation.
 *
 * (Phase 4.8 also had an `orbit` channel that tipped the whole building away and swung a bird's-eye floor
 * plan up under the camera. That ending was removed in 4.9: Chapter 4 never leaves the dimensional world.)
 *
 * Everything is one projective matrix per plane, shared by the DOM (as matrix3d) and by the canvas modules
 * (projected point by point), so plates, props and paint dabs stay registered to each other.
 * All matrices are column-major (CSS matrix3d order) and act on device-pixel screen coordinates.
 */

export type Mat4 = Float64Array;

const ident = (): Mat4 => {
  const m = new Float64Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
};
function mul(a: Mat4, b: Mat4): Mat4 {
  const o = new Float64Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
}
const tr = (x: number, y: number): Mat4 => {
  const m = ident();
  m[12] = x;
  m[13] = y;
  return m;
};
const rx = (deg: number): Mat4 => {
  const a = (deg * Math.PI) / 180;
  const m = ident();
  m[5] = Math.cos(a); m[6] = Math.sin(a); m[9] = -Math.sin(a); m[10] = Math.cos(a);
  return m;
};
const ry = (deg: number): Mat4 => {
  const a = (deg * Math.PI) / 180;
  const m = ident();
  m[0] = Math.cos(a); m[2] = -Math.sin(a); m[8] = Math.sin(a); m[10] = Math.cos(a);
  return m;
};
const rz = (deg: number): Mat4 => {
  const a = (deg * Math.PI) / 180;
  const m = ident();
  m[0] = Math.cos(a); m[1] = Math.sin(a); m[4] = -Math.sin(a); m[5] = Math.cos(a);
  return m;
};
const persp = (d: number): Mat4 => {
  const m = ident();
  m[11] = -1 / d;
  return m;
};

export interface Orient {
  yaw: number;
  pitch: number;
  roll: number;
}

export interface Stage {
  /** false = identity (Chapters 1–3, or a square-on Chapter 4 shot): nothing is transformed */
  on: boolean;
  wall: Mat4;
  /** CSS for the wall group ('none' when identity) */
  wallCss: string;
  /** kept at 1: the section is always drawn in Chapter 4 (the 4.8 bird's-eye fade is gone) */
  wallVis: number;
  m: number;
  tx: number;
  ty: number;
}

const css = (m: Mat4) => `matrix3d(${Array.from(m, (v) => (Math.abs(v) < 1e-12 ? 0 : +v.toPrecision(9))).join(',')})`;

const xf: LayerXf = { m: 1, tx: 0, ty: 0, ok: true };

export function orientOf(st: FilmState): Orient {
  if (st.ch4 < 0.5) return { yaw: 0, pitch: 0, roll: 0 };
  return { yaw: st.yaw, pitch: st.pitch, roll: st.roll };
}

/**
 * Build the stage matrix for an orientation. `camB` is the World B camera (pan/zoom); the rotation happens
 * about the centre of the screen, so the shot's aim point stays where the camera put it.
 */
export function stageFor(o: Orient, camB: Camera, vp: Viewport): Stage {
  layerTransform(camB, 0, xf);
  const on = Math.abs(o.yaw) > 1e-4 || Math.abs(o.pitch) > 1e-4 || Math.abs(o.roll) > 1e-4;
  const base = { wallVis: 1, m: xf.m, tx: xf.tx, ty: xf.ty };
  if (!on) {
    const I = ident();
    return { on, wall: I, wallCss: 'none', ...base };
  }
  const cx = vp.vw / 2;
  const cy = vp.vh / 2;
  const P = 2300 * vp.b;
  const C = tr(cx, cy);
  const Ci = tr(-cx, -cy);
  const orient = mul(mul(C, mul(rx(o.pitch), mul(ry(o.yaw), rz(o.roll)))), Ci);
  const view = mul(mul(C, persp(P)), Ci);
  const wall = mul(view, orient);
  return { on, wall, wallCss: css(wall), ...base };
}

/** project a screen point (px) through a stage matrix; s = local scale factor */
export function project(m: Mat4, x: number, y: number) {
  const X = m[0] * x + m[4] * y + m[12];
  const Y = m[1] * x + m[5] * y + m[13];
  const W = m[3] * x + m[7] * y + m[15];
  const iw = 1 / W;
  const px = X * iw;
  const py = Y * iw;
  // local area scale (Jacobian of the projective map), used for sizes
  const ax = (m[0] - px * m[3]) * iw;
  const ay = (m[1] - py * m[3]) * iw;
  const bx = (m[4] - px * m[7]) * iw;
  const by = (m[5] - py * m[7]) * iw;
  const s = Math.sqrt(Math.abs(ax * by - ay * bx));
  return { x: px, y: py, s, w: W };
}
