// Paints placeholder painterly plates for the Phase 2 prototype.
//
// Every plate is produced in two steps:
//   1. a flat "guide" image (shapes + gradients) drawn in design coordinates
//   2. a stroke-based painter that re-paints the guide with directional,
//      bristled brush strokes (large → small brushes, detail only where needed)
//
// Output: public/prototype-assets/**  — see public/prototype-assets/README.md
// for the replacement contract (sizes, design origins, depths).
//
// Usage: npm run paint            (all plates)
//        npm run paint -- sky wall (only matching plates)

import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('public/prototype-assets');
const only = process.argv.slice(2);

// ---------------------------------------------------------------- utilities

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Average orientations (mod π) with weights. */
function blendAngles(list) {
  let x = 0;
  let y = 0;
  for (const [a, w] of list) {
    x += Math.cos(2 * a) * w;
    y += Math.sin(2 * a) * w;
  }
  return Math.atan2(y, x) / 2;
}

function swirl(x, y, cx, cy, R, w, inward = 0.2) {
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.hypot(dx, dy);
  return [Math.atan2(dy, dx) + Math.PI / 2 + inward, w * Math.exp(-((d / R) ** 2))];
}

// Plates that have final artwork (scripts/art/). The placeholder painter must never overwrite
// them, so their placeholders are written to public/prototype-assets/_placeholder/ instead.
const FINAL_ART = new Set(['02-portal/window-view.webp', '03-nexa-morning/room-wall.webp']);

async function save(canvas, rel, format = 'webp') {
  if (FINAL_ART.has(rel)) rel = path.join('_placeholder', rel);
  const file = path.join(OUT, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const buf = format === 'png' ? await canvas.encode('png') : await canvas.encode('webp', 88);
  await fs.writeFile(file, buf);
  console.log(`  wrote ${rel} (${(buf.length / 1024).toFixed(0)} KB)`);
}

// ---------------------------------------------------------------- painter

/**
 * @param {object} o
 * @param {import('@napi-rs/canvas').Canvas} o.guide
 * @param {number} o.ox design x of the plate's left edge
 * @param {number} o.oy design y of the plate's top edge
 * @param {(x:number,y:number)=>number} o.field fallback stroke orientation (design coords)
 * @param {Array} o.passes brush passes, large → small
 * @param {boolean} [o.underpaint] draw the guide first (opaque plates)
 * @param {boolean} [o.alphaFromGuide] stroke alpha follows guide alpha (glows, beams)
 * @param {number} [o.edgeFollow] how strongly strokes follow guide contours
 */
function paint(o) {
  const { guide, ox, oy, field, passes } = o;
  const w = guide.width;
  const h = guide.height;
  const out = createCanvas(w, h);
  const ctx = out.getContext('2d');
  const g = guide.getContext('2d').getImageData(0, 0, w, h).data;
  const rand = mulberry32(o.seed ?? 7);
  const edgeFollow = o.edgeFollow ?? 1;

  if (o.underpaint) ctx.drawImage(guide, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const lum = (i) => g[i] * 0.3 + g[i + 1] * 0.59 + g[i + 2] * 0.11;
  const at = (x, y) => (clamp(y | 0, 0, h - 1) * w + clamp(x | 0, 0, w - 1)) * 4;

  const angleAt = (x, y, k) => {
    const gx = lum(at(x + k, y)) - lum(at(x - k, y));
    const gy = lum(at(x, y + k)) - lum(at(x, y - k));
    const mag = Math.hypot(gx, gy);
    const base = field(x + ox, y + oy);
    if (mag < 4 || edgeFollow === 0) return base;
    return blendAngles([
      [base, 1],
      [Math.atan2(gy, gx) + Math.PI / 2, clamp(mag / 50, 0, 1) * 2.2 * edgeFollow],
    ]);
  };

  for (const pass of passes) {
    const cur = ctx.getImageData(0, 0, w, h).data;
    const { r, step } = pass;
    const cols = Math.ceil(w / step);
    const rows = Math.ceil(h / step);
    const order = new Uint32Array(cols * rows);
    for (let i = 0; i < order.length; i++) order[i] = i;
    for (let i = order.length - 1; i > 0; i--) {
      const j = (rand() * (i + 1)) | 0;
      const t = order[i];
      order[i] = order[j];
      order[j] = t;
    }

    for (let n = 0; n < order.length; n++) {
      const cell = order[n];
      const x = ((cell % cols) + rand()) * step;
      const y = (((cell / cols) | 0) + rand()) * step;
      const i = at(x, y);
      const ga = g[i + 3];
      if (o.alphaFromGuide ? ga < 6 : ga < 128) continue;

      if (pass.thresh) {
        const d =
          Math.abs(g[i] - cur[i]) + Math.abs(g[i + 1] - cur[i + 1]) + Math.abs(g[i + 2] - cur[i + 2]) +
          Math.abs(ga - cur[i + 3]);
        if (d < pass.thresh) continue;
      }

      const j = pass.jitter ?? 14;
      const l = (rand() - 0.5) * j;
      const cr = clamp(g[i] + l + (rand() - 0.5) * j * 0.6, 0, 255) | 0;
      const cg = clamp(g[i + 1] + l + (rand() - 0.5) * j * 0.6, 0, 255) | 0;
      const cb = clamp(g[i + 2] + l + (rand() - 0.5) * j * 0.6, 0, 255) | 0;
      const alpha = pass.alpha * (o.alphaFromGuide ? ga / 255 : 1);

      const len = pass.len[0] + rand() * (pass.len[1] - pass.len[0]);
      const segs = 4;
      const seg = len / segs;
      const k = Math.max(2, r * 0.7);
      const pts = [[x, y]];
      let px = x;
      let py = y;
      for (let s = 0; s < segs / 2; s++) {
        const a = angleAt(px, py, k);
        px -= Math.cos(a) * seg;
        py -= Math.sin(a) * seg;
        pts.unshift([px, py]);
      }
      px = x;
      py = y;
      let lastA = 0;
      for (let s = 0; s < segs / 2; s++) {
        const a = angleAt(px, py, k);
        lastA = a;
        px += Math.cos(a) * seg;
        py += Math.sin(a) * seg;
        pts.push([px, py]);
      }

      const width = r * (0.75 + rand() * 0.5);
      const path = (offX, offY) => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0] + offX, pts[0][1] + offY);
        for (let p = 1; p < pts.length; p++) ctx.lineTo(pts[p][0] + offX, pts[p][1] + offY);
      };

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
      ctx.lineWidth = width;
      path(0, 0);
      ctx.stroke();

      // bristles + impasto ridge: gives the stroke its brushed, textured body
      if (r >= 4) {
        const nx = -Math.sin(lastA);
        const ny = Math.cos(lastA);
        const bristles = r >= 12 ? 3 : 2;
        for (let b = 0; b < bristles; b++) {
          const off = (rand() - 0.5) * width * 0.7;
          const shade = (rand() - 0.5) * 46;
          ctx.globalAlpha = alpha * 0.4;
          ctx.strokeStyle = `rgb(${clamp(cr + shade, 0, 255) | 0},${clamp(cg + shade, 0, 255) | 0},${clamp(cb + shade * 0.9, 0, 255) | 0})`;
          ctx.lineWidth = Math.max(1, width * (0.12 + rand() * 0.12));
          path(nx * off, ny * off);
          ctx.stroke();
        }
        ctx.globalAlpha = alpha * 0.22;
        ctx.strokeStyle = `rgb(${clamp(cr + 40, 0, 255) | 0},${clamp(cg + 40, 0, 255) | 0},${clamp(cb + 36, 0, 255) | 0})`;
        ctx.lineWidth = Math.max(1, width * 0.18);
        path(-nx * width * 0.25, -ny * width * 0.25);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  return out;
}

const PASSES = {
  opaque: [
    { r: 30, step: 18, len: [80, 190], alpha: 0.95, jitter: 34 },
    { r: 15, step: 10, len: [40, 100], alpha: 0.9, jitter: 28, thresh: 18 },
    { r: 7, step: 5.5, len: [18, 46], alpha: 0.85, jitter: 14, thresh: 22 },
    { r: 3.4, step: 3, len: [8, 20], alpha: 0.8, jitter: 12, thresh: 48 },
  ],
  object: [
    { r: 16, step: 9, len: [26, 70], alpha: 0.95, jitter: 16 },
    { r: 8, step: 5, len: [16, 40], alpha: 0.92, jitter: 14 },
    { r: 4, step: 3, len: [8, 20], alpha: 0.88, jitter: 12, thresh: 28 },
    { r: 2.2, step: 2, len: [5, 11], alpha: 0.85, jitter: 10, thresh: 40 },
  ],
  glow: [
    { r: 30, step: 16, len: [60, 140], alpha: 0.5, jitter: 10 },
    { r: 14, step: 9, len: [30, 80], alpha: 0.45, jitter: 10 },
    { r: 6, step: 6, len: [14, 36], alpha: 0.35, jitter: 12 },
  ],
};

function guideCanvas(w, h, ox, oy) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.translate(-ox, -oy);
  return { c, ctx };
}

function poly(ctx, pts, fill) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function radial(ctx, x, y, r, stops) {
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  ctx.fillStyle = gr;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Integrate a long ribbon through a flow field and stroke it into a guide. */
function ribbon(ctx, field, x, y, steps, stepLen, width, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  let dir = 1;
  let prev = field(x, y);
  for (let i = 0; i < steps; i++) {
    let a = field(x, y);
    // keep direction consistent (orientation field is mod π)
    if (Math.cos(a - prev) < 0) a += Math.PI;
    prev = a;
    x += Math.cos(a) * stepLen * dir;
    y += Math.sin(a) * stepLen * dir;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

// ---------------------------------------------------------------- design constants
// Must match lib/prototype/sceneConfig.ts
const A_FINDER = { x: 1102, y: 302 }; // centre of the QR top-left finder aperture (World A)
const B_GLASS = { x0: 440, y0: 220, x1: 800, y1: 580 }; // window glass (World B)
const B_TENT = { x0: 1180, y0: 650, x1: 1310, y1: 780 }; // table tent face (World B)

// ---------------------------------------------------------------- plates

const plates = {
  // ------------------------------------------------ 00 shared
  async dabs() {
    // must match DAB_ATLAS in lib/prototype/sceneConfig.ts (cell 256 × count 8)
    const size = 256;
    const count = 8;
    const c = createCanvas(size * count, size);
    const ctx = c.getContext('2d');
    const rand = mulberry32(11);
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      ctx.save();
      ctx.translate(i * size + size / 2, size / 2);
      ctx.scale(size / 128, size / 128); // shapes below are authored in 128-px cell units
      ctx.rotate((rand() - 0.5) * 0.12);
      const half = 44 + rand() * 6;
      // ragged square body
      const pts = [];
      const per = 7;
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (let s = 0; s < 4; s++) {
        const [ax, ay] = corners[s];
        const [bx, by] = corners[(s + 1) % 4];
        for (let p = 0; p < per; p++) {
          const t = p / per;
          const j = (rand() - 0.5) * 7;
          pts.push([(ax + (bx - ax) * t) * half + j, (ay + (by - ay) * t) * half + (rand() - 0.5) * 7]);
        }
      }
      poly(ctx, pts, 'rgb(226,226,226)');
      // brush body: strokes in one dominant direction, a few across
      const dom = rand() < 0.5 ? 0 : Math.PI / 2;
      for (let s = 0; s < 46; s++) {
        const a = dom + (rand() - 0.5) * 0.35 + (s > 38 ? Math.PI / 2 : 0);
        const cx = (rand() - 0.5) * half * 1.7;
        const cy = (rand() - 0.5) * half * 1.7;
        const len = 20 + rand() * 50;
        const v = 175 + rand() * 80;
        ctx.strokeStyle = `rgba(${v | 0},${v | 0},${v | 0},${0.55 + rand() * 0.4})`;
        ctx.lineWidth = 3 + rand() * 11;
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(a) * len / 2, cy - Math.sin(a) * len / 2);
        ctx.lineTo(cx + Math.cos(a) * len / 2, cy + Math.sin(a) * len / 2);
        ctx.stroke();
      }
      // impasto highlight ridge
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-half * 0.8, -half * 0.55 + rand() * 10);
      ctx.lineTo(half * 0.6, -half * 0.7 + rand() * 10);
      ctx.stroke();
      ctx.restore();
    }
    await save(c, '00-shared/dabs.png', 'png');
  },

  async grain() {
    const s = 512;
    const c = createCanvas(s, s);
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(s, s);
    const rand = mulberry32(5);
    for (let i = 0; i < s * s; i++) {
      const v = 128 + (rand() - 0.5) * 70;
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // canvas weave
    for (let y = 0; y < s; y += 3) {
      ctx.fillStyle = `rgba(${rand() < 0.5 ? '0,0,0' : '255,255,255'},0.05)`;
      ctx.fillRect(0, y, s, 1);
    }
    for (let x = 0; x < s; x += 3) {
      ctx.fillStyle = `rgba(${rand() < 0.5 ? '0,0,0' : '255,255,255'},0.05)`;
      ctx.fillRect(x, 0, 1, s);
    }
    await save(c, '00-shared/grain.png', 'png');
  },

  // ------------------------------------------------ 01 Kerinti nocturnal world
  async sky() {
    const W = 2880, H = 1800, ox = -480, oy = -360;
    const field = (x, y) => {
      const base =
        -0.06 + 0.3 * Math.sin(x / 610 + Math.sin(y / 340) * 1.2) + 0.12 * Math.sin(y / 180 + x / 1300);
      const flat = smooth(760, 920, y);
      return blendAngles([
        [base * (1 - flat), 1],
        swirl(x, y, A_FINDER.x, A_FINDER.y, 700, 0.55, 1.05),
        swirl(x, y, 330, 170, 250, 0.25, 0.9),
        swirl(x, y, 1760, 120, 230, 0.2, 0.9),
        swirl(x, y, 700, 610, 300, 0.15, 0.9),
      ]);
    };
    const { c, ctx } = guideCanvas(W, H, ox, oy);
    const bg = ctx.createLinearGradient(0, oy, 0, oy + H);
    bg.addColorStop(0, '#040a1c');
    bg.addColorStop(0.3, '#0a1a3c');
    bg.addColorStop(0.58, '#13295a');
    bg.addColorStop(0.7, '#27457d');
    bg.addColorStop(0.8, '#1a3260');
    bg.addColorStop(1, '#0b1834');
    ctx.fillStyle = bg;
    ctx.fillRect(ox, oy, W, H);

    const rand = mulberry32(21);
    const ribbonColors = ['rgba(42,75,155,0.45)', 'rgba(111,147,201,0.28)', 'rgba(20,45,100,0.5)', 'rgba(156,199,224,0.16)'];
    for (let i = 0; i < 26; i++) {
      ribbon(ctx, field, ox + rand() * W, oy + rand() * 1150, 90, 26, 30 + rand() * 90, ribbonColors[i % 4]);
    }
    // low horizon mist
    radial(ctx, 900, 820, 900, [[0, 'rgba(111,147,201,0.35)'], [1, 'rgba(111,147,201,0)']]);
    // painted stars (small, scattered, not a composition)
    for (let i = 0; i < 12; i++) {
      const x = ox + rand() * W;
      const y = oy + rand() * 1100;
      const r = 10 + rand() * 20;
      radial(ctx, x, y, r, [[0, 'rgba(234,240,247,0.9)'], [0.18, 'rgba(156,199,224,0.55)'], [1, 'rgba(156,199,224,0)']]);
    }
    const out = paint({ guide: c, ox, oy, field, passes: PASSES.opaque, underpaint: true, seed: 3, edgeFollow: 0.35 });
    await save(out, '01-kerinti-night/sky.webp');
  },

  async horizon() {
    const W = 2880, H = 800, ox = -480, oy = 700;
    const field = (x, y) => 0.08 * Math.sin(x / 140) + 0.05;
    const { c, ctx } = guideCanvas(W, H, ox, oy);
    const rand = mulberry32(31);
    // far hills
    const far = [[ox, oy + H]];
    for (let x = ox; x <= ox + W; x += 40) far.push([x, 860 + Math.sin(x / 330) * 34 + Math.sin(x / 97) * 8]);
    far.push([ox + W, oy + H]);
    poly(ctx, far, '#10244d');
    // near ridge with low rooftops
    const near = [[ox, oy + H]];
    for (let x = ox; x <= ox + W; x += 30) near.push([x, 950 + Math.sin(x / 510 + 2) * 40 + Math.sin(x / 120) * 6]);
    near.push([ox + W, oy + H]);
    poly(ctx, near, '#08142e');
    const houses = [];
    for (let x = -300; x < 2300; x += 70 + rand() * 120) {
      if (rand() < 0.35) continue;
      const w = 50 + rand() * 90;
      const hgt = 30 + rand() * 60;
      const base = 960 + Math.sin(x / 510 + 2) * 40;
      houses.push([x, w, hgt, base]);
      poly(ctx, [[x, base], [x, base - hgt * 0.55], [x + w, base - hgt * 0.62], [x + w, base]], rand() < 0.5 ? '#0a1838' : '#0d1d40');
    }
    for (const [x, w, hgt, base] of houses) {
      if (rand() < 0.45) continue;
      ctx.fillStyle = rand() < 0.7 ? 'rgba(232,198,106,0.9)' : 'rgba(224,120,74,0.85)';
      ctx.fillRect(x + w * (0.25 + rand() * 0.4), base - hgt * (0.35 + rand() * 0.3), 7, 10);
    }
    const out = paint({ guide: c, ox, oy, field, passes: PASSES.object, seed: 4, edgeFollow: 0.5 });
    await save(out, '01-kerinti-night/horizon.webp');
  },

  // ------------------------------------------------ 02 portal transition state

  async windowView() {
    // What lies beyond the portal / window: the NeXa morning.
    const W = 2400, H = 1800, ox = -580, oy = -500;
    const sun = { x: 400, y: 150 };
    const field = (x, y) =>
      blendAngles([
        [0.12 * Math.sin(x / 260 + y / 400), 1],
        swirl(x, y, sun.x, sun.y, 280, 1.6, 0),
        [y > 470 ? -0.5 + 0.4 * Math.sin(x / 50) : 0, y > 470 ? 1.2 : 0],
      ]);
    const { c, ctx } = guideCanvas(W, H, ox, oy);
    const bg = ctx.createLinearGradient(0, oy, 0, 620);
    bg.addColorStop(0, '#79acd2');
    bg.addColorStop(0.45, '#a9cfe0');
    bg.addColorStop(0.75, '#e7e2c6');
    bg.addColorStop(1, '#f6d9a0');
    ctx.fillStyle = bg;
    ctx.fillRect(ox, oy, W, H);
    radial(ctx, sun.x, sun.y, 520, [[0, 'rgba(255,248,225,1)'], [0.2, 'rgba(255,236,190,0.9)'], [1, 'rgba(255,236,190,0)']]);
    const rand = mulberry32(41);
    for (let i = 0; i < 14; i++) {
      const cx = ox + 200 + rand() * (W - 400);
      const cy = oy + 250 + rand() * 520;
      for (let k = 0; k < 6; k++) {
        radial(ctx, cx + (rand() - 0.5) * 220, cy + (rand() - 0.5) * 50, 60 + rand() * 80, [[0, 'rgba(255,250,238,0.75)'], [1, 'rgba(255,250,238,0)']]);
      }
    }
    // distant hills, rooftops, trees
    const hills = [[ox, oy + H]];
    for (let x = ox; x <= ox + W; x += 40) hills.push([x, 500 + Math.sin(x / 260) * 22]);
    hills.push([ox + W, oy + H]);
    poly(ctx, hills, '#9fb38a');
    for (let x = ox; x < ox + W; x += 40 + rand() * 60) {
      const y = 540 + rand() * 60;
      const w = 60 + rand() * 80;
      poly(ctx, [[x, y + 200], [x, y], [x + w / 2, y - 30], [x + w, y], [x + w, y + 200]], rand() < 0.6 ? '#c8643b' : '#e3a83b');
      ctx.fillStyle = '#f4ead5';
      ctx.fillRect(x + 6, y + 8, w - 12, 190);
    }
    for (let i = 0; i < 60; i++) {
      const x = ox + rand() * W;
      const y = 520 + rand() * 180;
      radial(ctx, x, y, 30 + rand() * 40, [[0, 'rgba(110,135,80,0.95)'], [0.7, 'rgba(138,154,91,0.9)'], [1, 'rgba(138,154,91,0)']]);
    }
    const lower = ctx.createLinearGradient(0, 680, 0, oy + H);
    lower.addColorStop(0, '#a8b37f');
    lower.addColorStop(1, '#7f8f58');
    ctx.fillStyle = lower;
    ctx.fillRect(ox, 700, W, oy + H - 700);
    const out = paint({ guide: c, ox, oy, field, passes: PASSES.opaque, underpaint: true, seed: 9, edgeFollow: 0.4 });
    await save(out, '02-portal/window-view.webp');
  },

  // ------------------------------------------------ 03 NeXa restaurant morning
  async wall() {
    const W = 2600, H = 1500, ox = -340, oy = -210;
    const VP = { x: 960, y: 520 };
    const field = (x, y) => {
      if (y > 840) return Math.atan2(y - VP.y, x - VP.x);
      if (y > 700) return 0.03 * Math.sin(x / 90);
      if (y < 30) return 0.02;
      if (x > 1540 && x < 2200 && y > 340 && y < 660) return Math.PI / 2;
      return -0.85 + 0.28 * Math.sin(x / 210 + y / 170);
    };
    const { c, ctx } = guideCanvas(W, H, ox, oy);
    const rand = mulberry32(51);
    // plaster wall
    const wall = ctx.createLinearGradient(ox, 0, ox + W, 0);
    wall.addColorStop(0, '#e9d6ae');
    wall.addColorStop(0.35, '#f4e7cc');
    wall.addColorStop(0.75, '#ead3a6');
    wall.addColorStop(1, '#d6b584');
    ctx.fillStyle = wall;
    ctx.fillRect(ox, oy, W, 910);
    // ceiling beams
    ctx.fillStyle = '#6b4a2e';
    ctx.fillRect(ox, oy, W, 190);
    for (let x = ox; x < ox + W; x += 260) {
      ctx.fillStyle = '#5a3c24';
      ctx.fillRect(x, -30, 60, 60);
    }
    ctx.fillStyle = '#7d5a3a';
    ctx.fillRect(ox, -30, W, 24);
    // wainscot
    ctx.fillStyle = '#b8603a';
    ctx.fillRect(ox, 700, W, 140);
    ctx.fillStyle = '#e0b680';
    ctx.fillRect(ox, 692, W, 12);
    for (let x = ox; x < ox + W; x += 150) {
      ctx.fillStyle = 'rgba(120,52,30,0.55)';
      ctx.fillRect(x, 730, 110, 86);
    }
    // wooden floor with perspective planks
    const floor = ctx.createLinearGradient(0, 840, 0, oy + H);
    floor.addColorStop(0, '#b98247');
    floor.addColorStop(1, '#8a5a31');
    ctx.fillStyle = floor;
    ctx.fillRect(ox, 840, W, oy + H - 840);
    ctx.strokeStyle = 'rgba(90,55,28,0.6)';
    ctx.lineWidth = 3;
    for (let x = -2400; x < 4400; x += 120) {
      ctx.beginPath();
      ctx.moveTo(VP.x + (x - VP.x) * ((840 - VP.y) / (1300 - VP.y)), 840);
      ctx.lineTo(x, 1300);
      ctx.stroke();
    }

    // window: curtains, sill, inner wooden edge (the dab ring is drawn at runtime)
    for (const [x0, x1] of [[300, 372], [868, 940]]) {
      const cur = ctx.createLinearGradient(x0, 0, x1, 0);
      cur.addColorStop(0, '#f7efe0');
      cur.addColorStop(0.5, '#fffaf0');
      cur.addColorStop(1, '#eadcc2');
      ctx.fillStyle = cur;
      ctx.fillRect(x0, 110, x1 - x0, 590);
    }
    ctx.fillStyle = '#a57446';
    ctx.fillRect(B_GLASS.x0 - 14, B_GLASS.y0 - 14, B_GLASS.x1 - B_GLASS.x0 + 28, B_GLASS.y1 - B_GLASS.y0 + 28);
    ctx.fillStyle = '#d9b27c';
    ctx.fillRect(340, 652, 560, 30);
    ctx.fillStyle = '#9a5a36';
    ctx.fillRect(342, 682, 556, 10);
    // herb pot on the sill
    poly(ctx, [[760, 652], [752, 612], [812, 612], [804, 652]], '#c8643b');
    radial(ctx, 782, 590, 40, [[0, 'rgba(110,135,80,1)'], [0.8, 'rgba(138,154,91,0.95)'], [1, 'rgba(138,154,91,0)']]);
    // shelf with jars
    ctx.fillStyle = '#7d5a3a';
    ctx.fillRect(990, 392, 440, 16);
    const jarColors = ['#c8643b', '#e3a83b', '#8a9a5b', '#f4ead5', '#5b7aa8', '#a3542f'];
    for (let x = 1005; x < 1410; x += 34 + rand() * 18) {
      const h = 34 + rand() * 50;
      const w = 22 + rand() * 12;
      ctx.fillStyle = jarColors[(rand() * jarColors.length) | 0];
      ctx.fillRect(x, 392 - h, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + 4, 392 - h + 6, 4, h - 12);
    }
    // kitchen pass
    ctx.fillStyle = '#5b3f2a';
    ctx.fillRect(1530, 330, 680, 340);
    ctx.fillStyle = '#35261c';
    ctx.fillRect(1556, 356, 628, 290);
    radial(ctx, 1870, 380, 300, [[0, 'rgba(255,190,110,0.55)'], [1, 'rgba(255,190,110,0)']]);
    for (let i = 0; i < 6; i++) {
      const x = 1600 + i * 95;
      ctx.strokeStyle = '#2a1d15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 356);
      ctx.lineTo(x, 400);
      ctx.stroke();
      radial(ctx, x, 425 + (i % 2) * 12, 26, [[0, '#e0925a'], [0.8, '#b8693a'], [1, 'rgba(184,105,58,0)']]);
    }
    // chef, gestural
    ctx.fillStyle = '#f6efe2';
    ctx.beginPath();
    ctx.ellipse(1905, 590, 58, 90, 0, 0, Math.PI * 2);
    ctx.fill();
    radial(ctx, 1905, 478, 30, [[0, '#c99a7a'], [0.9, '#b8866a'], [1, 'rgba(184,134,106,0)']]);
    ctx.fillStyle = '#fbf6ec';
    ctx.fillRect(1880, 424, 50, 36);
    // counter
    ctx.fillStyle = '#e8d8bc';
    ctx.fillRect(1500, 640, 740, 46);
    ctx.fillStyle = '#9a6a45';
    ctx.fillRect(1500, 686, 740, 150);
    // standing plant, left
    poly(ctx, [[160, 840], [150, 740], [300, 740], [290, 840]], '#b8603a');
    for (let i = 0; i < 18; i++) {
      const a = -Math.PI / 2 + (rand() - 0.5) * 2.2;
      const l = 120 + rand() * 180;
      radial(ctx, 225 + Math.cos(a) * l * 0.8, 730 + Math.sin(a) * l, 46 + rand() * 30, [[0, 'rgba(96,122,70,1)'], [0.7, 'rgba(138,154,91,0.9)'], [1, 'rgba(138,154,91,0)']]);
    }

    let out = paint({ guide: c, ox, oy, field, passes: PASSES.opaque, underpaint: true, seed: 12, edgeFollow: 1 });
    // punch the glass hole (the window view plate lives behind this plate)
    const octx = out.getContext('2d');
    octx.globalCompositeOperation = 'destination-out';
    octx.fillStyle = '#000';
    octx.fillRect(B_GLASS.x0 - ox, B_GLASS.y0 - oy, B_GLASS.x1 - B_GLASS.x0, B_GLASS.y1 - B_GLASS.y0);
    octx.globalCompositeOperation = 'source-over';
    await save(out, '03-nexa-morning/room-wall.webp');
  },

  async mid() {
    const W = 2600, H = 1500, ox = -340, oy = -210;
    const field = (x, y) => (y > 820 ? Math.PI / 2 : 0.05);
    const { c, ctx } = guideCanvas(W, H, ox, oy);
    const table = (cx, cy, rx, ry, top, rim) => {
      ctx.fillStyle = '#6e4a2c';
      ctx.fillRect(cx - rx * 0.7, cy, 14, 190);
      ctx.fillRect(cx + rx * 0.7 - 14, cy, 14, 190);
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = top;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    const chair = (x, y, flip) => {
      ctx.fillStyle = '#5a3c24';
      ctx.fillRect(x, y, 12, 170);
      ctx.fillRect(x + 70 * flip, y + 60, 12, 110);
      ctx.fillStyle = '#7d5a3a';
      ctx.fillRect(Math.min(x, x + 70 * flip), y + 70, 82, 14);
      for (let k = 0; k < 3; k++) ctx.fillRect(x - 3, y + 8 + k * 22, 18, 8);
    };
    chair(40, 820, 1);
    chair(470, 820, -1);
    table(260, 890, 180, 40, '#f3e6cc', '#caa878');
    radial(ctx, 230, 870, 24, [[0, '#fbf6ec'], [1, 'rgba(251,246,236,0)']]);
    chair(640, 840, 1);
    table(830, 910, 150, 34, '#e7c89a', '#a87b4c');
    // pendant lamps
    // one lamp only, left of the text zone x 1220–1840 (ARTWORK_COMPOSITIONS.md §C.2)
    for (const [x, col] of [[1060, '#6f8250']]) {
      ctx.strokeStyle = '#2a1d15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, -210);
      ctx.lineTo(x, 150);
      ctx.stroke();
      radial(ctx, x, 200, 150, [[0, 'rgba(255,226,160,0.8)'], [1, 'rgba(255,226,160,0)']]);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, 190, 80, 55, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fff1cf';
      ctx.beginPath();
      ctx.ellipse(x, 190, 70, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const out = paint({ guide: c, ox, oy, field, passes: PASSES.object, seed: 13, edgeFollow: 1.2 });
    await save(out, '03-nexa-morning/room-mid.webp');
  },

  async near() {
    const W = 2600, H = 1500, ox = -340, oy = -210;
    const field = (x, y) => (y > 860 ? Math.PI / 2 : 0.04);
    const { c, ctx } = guideCanvas(W, H, ox, oy);
    // chair back at the right edge
    ctx.fillStyle = '#4e3320';
    ctx.fillRect(1760, 560, 26, 760);
    ctx.fillRect(2000, 560, 26, 760);
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = k % 2 ? '#6b4a2e' : '#5a3c24';
      ctx.fillRect(1760, 590 + k * 70, 266, 30);
    }
    // hero table
    ctx.fillStyle = '#5a3c24';
    ctx.fillRect(1000, 860, 34, 460);
    ctx.fillRect(1620, 860, 34, 460);
    ctx.fillStyle = '#e8d6b4';
    ctx.beginPath();
    ctx.ellipse(1330, 815, 460, 104, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8d6b4';
    ctx.fillRect(870, 800, 920, 110);
    ctx.fillStyle = '#d7bf95';
    ctx.beginPath();
    ctx.ellipse(1330, 910, 460, 60, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#fbf3e3';
    ctx.beginPath();
    ctx.ellipse(1330, 800, 450, 98, 0, 0, Math.PI * 2);
    ctx.fill();
    // light pool on the table
    radial(ctx, 1230, 790, 300, [[0, 'rgba(255,238,200,0.9)'], [1, 'rgba(255,238,200,0)']]);
    // table tent (folded card) — its QR is drawn at runtime
    poly(ctx, [[B_TENT.x0 - 6, B_TENT.y1 + 20], [B_TENT.x0 + 4, B_TENT.y0 - 8], [B_TENT.x1 - 4, B_TENT.y0 - 8], [B_TENT.x1 + 6, B_TENT.y1 + 20]], '#c9b48e');
    poly(ctx, [[B_TENT.x0, B_TENT.y1 + 14], [B_TENT.x0 + 6, B_TENT.y0], [B_TENT.x1 - 6, B_TENT.y0], [B_TENT.x1, B_TENT.y1 + 14]], '#fbf6ec');
    // cup and small vase
    ctx.fillStyle = '#f4ead5';
    ctx.fillRect(1440, 760, 58, 48);
    ctx.fillStyle = '#c8643b';
    ctx.beginPath();
    ctx.ellipse(1469, 808, 46, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    poly(ctx, [[1560, 800], [1548, 740], [1590, 740], [1578, 800]], '#5b7aa8');
    for (const [dx, dy, col] of [[-20, -30, '#e0784a'], [8, -52, '#e8c66a'], [30, -26, '#c8643b'], [0, -12, '#8a9a5b']]) {
      radial(ctx, 1569 + dx, 730 + dy, 20, [[0, col], [0.8, col], [1, 'rgba(0,0,0,0)']]);
    }
    const out = paint({ guide: c, ox, oy, field, passes: PASSES.object, seed: 14, edgeFollow: 1.2 });
    await save(out, '03-nexa-morning/table-near.webp');
  },

  async beam() {
    const W = 2600, H = 1500, ox = -340, oy = -210;
    const dir = Math.atan2(790 - 400, 1245 - 620);
    const field = () => dir;
    const { c, ctx } = guideCanvas(W, H, ox, oy);
    const gr = ctx.createLinearGradient(620, 400, 1400, 1000);
    gr.addColorStop(0, 'rgba(255,236,190,0.95)');
    gr.addColorStop(0.6, 'rgba(255,226,170,0.55)');
    gr.addColorStop(1, 'rgba(255,226,170,0)');
    poly(ctx, [[B_GLASS.x0 + 40, B_GLASS.y0], [B_GLASS.x1, B_GLASS.y0 + 20], [1560, 780], [1300, 1100], [B_GLASS.x0 + 20, B_GLASS.y1]], gr);
    // feather the beam edges: downsample + upsample is a cheap wide blur
    const small = createCanvas(W / 16, H / 16);
    small.getContext('2d').drawImage(c, 0, 0, W / 16, H / 16);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(small, 0, 0, W, H);
    const out = paint({ guide: c, ox, oy, field, passes: PASSES.glow, alphaFromGuide: true, seed: 15, edgeFollow: 0 });
    await save(out, '03-nexa-morning/light-beam.webp');
  },
};

for (const [name, fn] of Object.entries(plates)) {
  if (only.length && !only.some((o) => name.toLowerCase().includes(o.toLowerCase()))) continue;
  const t = Date.now();
  console.log(`painting ${name}…`);
  await fn();
  console.log(`  ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
