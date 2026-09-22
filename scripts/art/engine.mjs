// Painting engine for final artwork plates (Phase 2.7 pilot).
//
// A plate is authored in DESIGN coordinates (the same units as lib/prototype/sceneConfig.ts)
// and rendered to a master canvas at `k` pixels per design unit. Painting happens in three layers:
//   1. guide   — flat composition blockout (shapes, gradients, light) = Step A deliverable
//   2. strokes — bristle brush strokes re-paint the guide: block-in → form → detail → impasto
//   3. surface — subtle canvas tooth
// Exports are resampled from the master to the delivery density required by the contract.

import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import path from 'node:path';

// ------------------------------------------------------------------ math & colour

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** 1 inside the rectangle, fading to 0 over `f` units outside it. */
export const inRect = (x, y, x0, y0, x1, y1, f = 0) => {
  if (f <= 0) return x >= x0 && x <= x1 && y >= y0 && y <= y1 ? 1 : 0;
  const dx = Math.max(x0 - x, 0, x - x1);
  const dy = Math.max(y0 - y, 0, y - y1);
  return 1 - smooth(0, f, Math.hypot(dx, dy));
};

export function hex(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

export function hslToRgb([h, s, l]) {
  h = ((h % 360) + 360) % 360 / 360;
  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

const css = ([r, g, b]) => `rgb(${r | 0},${g | 0},${b | 0})`;

/** Weighted average of orientations (angles mod π). */
export function blendAngles(list) {
  let x = 0;
  let y = 0;
  for (const [a, w] of list) {
    x += Math.cos(2 * a) * w;
    y += Math.sin(2 * a) * w;
  }
  return Math.atan2(y, x) / 2;
}

// ------------------------------------------------------------------ plate

export class Plate {
  /**
   * @param {object} o
   * @param {string} o.name
   * @param {number} o.x design origin x
   * @param {number} o.y design origin y
   * @param {number} o.w design width
   * @param {number} o.h design height
   * @param {number} o.k master pixels per design unit
   */
  constructor(o) {
    Object.assign(this, o);
    this.pw = Math.round(o.w * o.k);
    this.ph = Math.round(o.h * o.k);
  }

  canvas() {
    return createCanvas(this.pw, this.ph);
  }

  /** 2D context whose drawing units are design units. */
  designCtx(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.setTransform(this.k, 0, 0, this.k, -this.x * this.k, -this.y * this.k);
    return ctx;
  }

  toDesign(px, py) {
    return [px / this.k + this.x, py / this.k + this.y];
  }
}

// ------------------------------------------------------------------ guide helpers (design units)

export function poly(ctx, pts, fill) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function radial(ctx, x, y, r, stops, sx = 1, sy = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
}

export function vgrad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}

export function hgrad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}

/** Soft blob made of stacked radial gradients — organic masses (clouds, foliage). */
export function blob(ctx, x, y, rx, ry, color, rand, parts = 7, alpha = 0.9) {
  const [r, g, b] = hex(color);
  for (let i = 0; i < parts; i++) {
    const px = x + (rand() - 0.5) * rx * 1.2;
    const py = y + (rand() - 0.5) * ry * 1.0;
    const rr = Math.max(rx, ry) * (0.45 + rand() * 0.4);
    radial(
      ctx, px, py, rr,
      [[0, `rgba(${r},${g},${b},${alpha})`], [0.62, `rgba(${r},${g},${b},${alpha * 0.85})`], [1, `rgba(${r},${g},${b},0)`]],
      1, ry / rx,
    );
  }
}

// ------------------------------------------------------------------ brush

function brushStroke(ctx, pts, width, rgb, alpha, rand, o) {
  const n = pts.length;
  const normals = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    normals[i] = [-dy / l, dx / l];
  }
  const [h, s, l] = rgbToHsl(rgb);

  const trace = (off, i0, i1, wob) => {
    ctx.beginPath();
    const p = (i) => [pts[i][0] + normals[i][0] * (off + wob * Math.sin(i * 1.7)), pts[i][1] + normals[i][1] * (off + wob * Math.sin(i * 1.7))];
    let prev = p(i0);
    ctx.moveTo(prev[0], prev[1]);
    for (let i = i0 + 1; i < i1; i++) {
      const cur = p(i);
      const mx = (prev[0] + cur[0]) / 2;
      const my = (prev[1] + cur[1]) / 2;
      ctx.quadraticCurveTo(prev[0], prev[1], mx, my);
      prev = cur;
    }
    ctx.lineTo(prev[0], prev[1]);
  };

  // body: a slightly narrower loaded stroke so bristle gaps never show raw ground
  ctx.globalAlpha = alpha * 0.7;
  ctx.strokeStyle = css(rgb);
  ctx.lineWidth = width * 0.78;
  trace(0, 0, n, 0);
  ctx.stroke();

  // bristles: parallel tracks with their own value, hue and length (dry-brush ends)
  const bristles = clamp(Math.round(width / 2.6), 3, 13);
  for (let b = 0; b < bristles; b++) {
    const off = ((b + 0.5) / bristles - 0.5) * width * (0.92 + rand() * 0.16);
    const i0 = rand() < o.taper ? Math.floor(rand() * n * 0.3) : 0;
    const i1 = n - (rand() < o.taper ? Math.floor(rand() * n * 0.35) : 0);
    if (i1 - i0 < 2) continue;
    const c = hslToRgb([h + (rand() - 0.5) * o.bristleHue, s * (0.9 + rand() * 0.2), l + (rand() - 0.5) * o.bristleLum]);
    ctx.globalAlpha = alpha * (0.45 + rand() * 0.5);
    ctx.strokeStyle = css(c);
    ctx.lineWidth = Math.max(0.8, (width / bristles) * (1.3 + rand() * 0.9));
    trace(off, i0, i1, width * 0.04);
    ctx.stroke();
  }

  // impasto: a lit ridge on the side facing the light and a faint shadow on the other side
  if (o.impasto > 0.02) {
    const mid = Math.floor(n / 2);
    const side = normals[mid][0] * o.light[0] + normals[mid][1] * o.light[1] > 0 ? 1 : -1;
    ctx.globalAlpha = alpha * o.impasto * 0.55;
    ctx.strokeStyle = css(hslToRgb([h - 4, s * 0.8, l + 0.13]));
    ctx.lineWidth = Math.max(0.8, width * 0.14);
    trace(side * width * 0.32, Math.floor(n * 0.15), n - Math.floor(n * 0.2), 0);
    ctx.stroke();
    ctx.globalAlpha = alpha * o.impasto * 0.3;
    ctx.strokeStyle = css(hslToRgb([h + 8, s, l - 0.12]));
    ctx.lineWidth = Math.max(0.8, width * 0.1);
    trace(-side * width * 0.42, Math.floor(n * 0.2), n - Math.floor(n * 0.15), 0);
    ctx.stroke();
  }
}

/**
 * Re-paint a guide with brush strokes.
 * @param {Plate} plate
 * @param {import('@napi-rs/canvas').Canvas} guide
 * @param {object} o
 * @param {(x:number,y:number)=>number} o.field stroke orientation (design coords)
 * @param {Array} o.passes [{ r, step, len:[a,b], alpha, thresh?, detail?, texture?, impasto?, hueJ, satJ, lumJ }]
 *   r/step/len are in DESIGN units; thresh = colour distance gate; detail = uses o.detail(x,y) as probability;
 *   texture = probability of painting even where the guide is already matched (keeps calm areas brushed)
 * @param {(x:number,y:number)=>number} [o.detail] 0..1 focal map
 * @param {(x:number,y:number)=>number} [o.jitter] colour-variation scale map
 * @param {(x:number,y:number)=>number} [o.impastoMap] 0..1
 * @param {(x:number,y:number)=>number} [o.edgeFollow] 0..1 how strongly strokes follow guide contours
 * @param {[number,number]} [o.light] direction towards the light (unit vector, screen space)
 */
export function paintStrokes(plate, guide, o) {
  const { pw, ph, k } = plate;
  const out = plate.canvas();
  const ctx = out.getContext('2d');
  const g = guide.getContext('2d').getImageData(0, 0, pw, ph).data;
  const rand = mulberry32(o.seed ?? 1);
  const light = o.light ?? [-0.7, -0.7];

  // smoothed luminance field (1/8 res) for contour following
  const ds = 8;
  const lw = Math.ceil(pw / ds);
  const lh = Math.ceil(ph / ds);
  const lum = new Float32Array(lw * lh);
  for (let y = 0; y < lh; y++)
    for (let x = 0; x < lw; x++) {
      const i = (Math.min(ph - 1, y * ds + 4) * pw + Math.min(pw - 1, x * ds + 4)) * 4;
      lum[y * lw + x] = g[i] * 0.3 + g[i + 1] * 0.59 + g[i + 2] * 0.11;
    }
  const blurred = new Float32Array(lw * lh);
  for (let y = 0; y < lh; y++)
    for (let x = 0; x < lw; x++) {
      let sum = 0;
      let cnt = 0;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= lw || yy >= lh) continue;
          sum += lum[yy * lw + xx];
          cnt++;
        }
      blurred[y * lw + x] = sum / cnt;
    }
  const L = (x, y) => blurred[clamp(Math.round(y / ds), 0, lh - 1) * lw + clamp(Math.round(x / ds), 0, lw - 1)];

  const angleAt = (px, py) => {
    const [dx, dy] = plate.toDesign(px, py);
    const base = o.field(dx, dy);
    const follow = o.edgeFollow ? o.edgeFollow(dx, dy) : 0.6;
    if (follow <= 0) return base;
    const e = ds * 1.5;
    const gx = L(px + e, py) - L(px - e, py);
    const gy = L(px, py + e) - L(px, py - e);
    const mag = Math.hypot(gx, gy);
    if (mag < 3) return base;
    return blendAngles([[base, 1], [Math.atan2(gy, gx) + Math.PI / 2, clamp(mag / 40, 0, 1) * 2.5 * follow]]);
  };

  ctx.drawImage(guide, 0, 0); // thin underpainting
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const pass of o.passes) {
    const t0 = Date.now();
    const cur = ctx.getImageData(0, 0, pw, ph).data;
    const step = pass.step * k;
    const cols = Math.ceil(pw / step);
    const rows = Math.ceil(ph / step);
    const order = new Uint32Array(cols * rows);
    for (let i = 0; i < order.length; i++) order[i] = i;
    for (let i = order.length - 1; i > 0; i--) {
      const j = (rand() * (i + 1)) | 0;
      const t = order[i];
      order[i] = order[j];
      order[j] = t;
    }
    let painted = 0;
    for (let n = 0; n < order.length; n++) {
      const cell = order[n];
      const px = ((cell % cols) + rand()) * step;
      const py = (((cell / cols) | 0) + rand()) * step;
      if (px >= pw || py >= ph) continue;
      const idx = ((py | 0) * pw + (px | 0)) * 4;
      if (g[idx + 3] < 200) continue;
      const [dx, dy] = plate.toDesign(px, py);

      if (pass.detail && o.detail && rand() > o.detail(dx, dy)) continue;
      if (pass.thresh) {
        const diff = Math.abs(g[idx] - cur[idx]) + Math.abs(g[idx + 1] - cur[idx + 1]) + Math.abs(g[idx + 2] - cur[idx + 2]);
        const texture = pass.texture ? pass.texture(dx, dy) : 0;
        if (diff < pass.thresh && rand() > texture) continue;
      }

      const jit = o.jitter ? o.jitter(dx, dy) : 1;
      const [h, s, l] = rgbToHsl([g[idx], g[idx + 1], g[idx + 2]]);
      const rgb = hslToRgb([
        h + (rand() - 0.5) * pass.hueJ * jit,
        s + (rand() - 0.5) * pass.satJ * jit,
        l + (rand() - 0.5) * pass.lumJ * jit,
      ]);

      const len = (pass.len[0] + rand() * (pass.len[1] - pass.len[0])) * k;
      const segs = 7;
      const seg = len / (segs - 1);
      const pts = [[px, py]];
      let x = px;
      let y = py;
      let prevA = angleAt(x, y);
      let dirX = Math.cos(prevA);
      let dirY = Math.sin(prevA);
      const fwd = [];
      const back = [];
      for (const [list, sign] of [[fwd, 1], [back, -1]]) {
        x = px; y = py;
        let vx = dirX * sign;
        let vy = dirY * sign;
        for (let sIdx = 0; sIdx < (segs - 1) / 2; sIdx++) {
          const a = angleAt(x, y);
          let nx = Math.cos(a);
          let ny = Math.sin(a);
          if (nx * vx + ny * vy < 0) { nx = -nx; ny = -ny; }
          vx = nx; vy = ny;
          x += nx * seg;
          y += ny * seg;
          list.push([x, y]);
        }
      }
      const path = [...back.reverse(), ...pts, ...fwd];
      const width = pass.r * k * (0.75 + rand() * 0.5);
      const imp = pass.impasto && o.impastoMap ? o.impastoMap(dx, dy) * pass.impasto : 0;
      brushStroke(ctx, path, width, rgb, pass.alpha, rand, {
        taper: pass.taper ?? 0.6,
        bristleHue: pass.hueJ * 0.5 * jit,
        bristleLum: pass.lumJ * 0.9 * jit,
        impasto: imp,
        light,
      });
      painted++;
    }
    console.log(`    pass r=${pass.r}: ${painted} strokes in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  ctx.globalAlpha = 1;
  return out;
}

/** Subtle canvas tooth baked into the painting (the runtime adds its own grain on top). */
export function canvasTooth(canvas, strength = 0.035, seed = 3) {
  const w = canvas.width;
  const h = canvas.height;
  const tile = createCanvas(256, 256);
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(256, 256);
  const rand = mulberry32(seed);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const weave = (Math.sin(x * 1.9) * 0.5 + Math.sin(y * 1.9) * 0.5) * 18;
      const v = clamp(128 + weave + (rand() - 0.5) * 50, 0, 255);
      const i = (y * 256 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  tctx.putImageData(img, 0, 0);
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = strength;
  for (let y = 0; y < h; y += 256) for (let x = 0; x < w; x += 256) ctx.drawImage(tile, x, y);
  ctx.restore();
}

// ------------------------------------------------------------------ output

export async function writeFile(file, buf) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, buf);
  console.log(`  wrote ${path.relative(process.cwd(), file)} (${(buf.length / 1024).toFixed(0)} KB)`);
}

/** Resample a master to an export size. */
export function resample(src, w, h) {
  const out = createCanvas(w, h);
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // two-step downscale for large ratios keeps brush texture crisp without aliasing
  if (src.width / w > 1.9) {
    const mid = createCanvas(Math.round(src.width / 1.5), Math.round(src.height / 1.5));
    const mctx = mid.getContext('2d');
    mctx.imageSmoothingQuality = 'high';
    mctx.drawImage(src, 0, 0, mid.width, mid.height);
    ctx.drawImage(mid, 0, 0, w, h);
  } else {
    ctx.drawImage(src, 0, 0, w, h);
  }
  return out;
}

/** Review overlay: plate at reduced scale with labelled design-space rectangles. */
export function reviewOverlay(plate, image, rects, scale = 0.25) {
  const w = Math.round(plate.w * scale);
  const h = Math.round(plate.h * scale);
  const out = createCanvas(w, h);
  const ctx = out.getContext('2d');
  ctx.drawImage(image, 0, 0, w, h);
  ctx.setTransform(scale, 0, 0, scale, -plate.x * scale, -plate.y * scale);
  for (const r of rects) {
    ctx.strokeStyle = r.color;
    ctx.lineWidth = (r.width ?? 3) / scale;
    if (r.dash) ctx.setLineDash(r.dash.map((d) => d / scale));
    else ctx.setLineDash([]);
    ctx.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
    ctx.fillStyle = r.color;
    ctx.font = `${12 / scale}px sans-serif`;
    ctx.fillText(r.label, r.x0 + 6 / scale, r.y0 + 16 / scale);
  }
  return out;
}
