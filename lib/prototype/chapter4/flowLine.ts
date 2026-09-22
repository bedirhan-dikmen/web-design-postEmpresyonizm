import type { LayerXf, Viewport } from '../camera';
import { samples } from './flowPath';

/**
 * The painted flow line: a soft ribbon of three brush tracks (wide wash, body, dry bristles)
 * that is revealed up to arc length `upTo`. Drawn on the Module Field canvas, under the modules.
 */
export function drawFlowLine(ctx: CanvasRenderingContext2D, upTo: number, xf: LayerXf, vp: Viewport, dpr: number, day: number) {
  if (!xf.ok || upTo <= 0) return;
  const { xs, ys, lens } = samples();
  const K = vp.b * dpr;
  const sx = (x: number) => ((x * xf.m + xf.tx) * vp.b + vp.ox) * dpr;
  const sy = (y: number) => ((y * xf.m + xf.ty) * vp.b + vp.oy) * dpr;
  const unit = xf.m * K; // design unit → device px

  // warm ochre in daylight, deepening towards terracotta at sunset
  const r = Math.round(201 + (214 - 201) * day);
  const g = Math.round(154 + (122 - 154) * day);
  const b = Math.round(85 + (84 - 85) * day);

  const tracks = [
    { width: 30, alpha: 0.1, offset: 0 },
    { width: 11, alpha: 0.28, offset: 0 },
    { width: 3, alpha: 0.32, offset: 7 },
    { width: 2.5, alpha: 0.26, offset: -8 },
  ];

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const t of tracks) {
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < xs.length; i++) {
      if (lens[i] > upTo) break;
      // perpendicular offset + slow wobble so the bristle tracks feel hand-made
      let ox = 0;
      let oy = 0;
      if (t.offset) {
        const j = Math.min(xs.length - 1, i + 1);
        const k0 = Math.max(0, i - 1);
        const dx = xs[j] - xs[k0];
        const dy = ys[j] - ys[k0];
        const l = Math.hypot(dx, dy) || 1;
        const wob = t.offset * (1 + 0.35 * Math.sin(lens[i] / 90));
        ox = (-dy / l) * wob;
        oy = (dx / l) * wob;
      }
      const px = sx(xs[i] + ox);
      const py = sy(ys[i] + oy);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = `rgba(${r},${g},${b},${t.alpha})`;
    ctx.lineWidth = Math.max(1, t.width * unit);
    ctx.stroke();
  }
  ctx.restore();
}
