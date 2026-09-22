// ARTWORK P-01 — Window View (the crossing painting)
//
// Contract (ARTWORK_REPLACEMENT_CONTRACT.md §2, §3.1):
//   file     public/prototype-assets/02-portal/window-view.webp
//   design   2400 × 1800 at origin (−580, −500), World B space, depth +2.2, opaque
//   export   3000 × 2250 (k = 1.25) · master 4800 × 3600 (k = 2)
//   zones    glimpse x 840–1000 y 260–400 (brightest, soft)
//            gold readability x 700–1010 y 380–640 (mid-value, cool; no gold/ochre/cream)
//            crossing frame x 178–1530 y 116–876 (complete landscape, horizon ≈ y 520–600)
//            window zone x 300–820 y 160–600 (sky above, rooftops/trees in the lower third)
//
// Usage: node scripts/art/window-view.mjs --blockout | --final

import path from 'node:path';
import {
  Plate, blendAngles, blob, canvasTooth, clamp, inRect, mulberry32, paintStrokes, poly, radial,
  resample, reviewOverlay, smooth, vgrad, writeFile,
} from './engine.mjs';

const MODE = process.argv.includes('--final') ? 'final' : 'blockout';
const plate = new Plate({ name: 'window-view', x: -580, y: -500, w: 2400, h: 1800, k: 2 });
const EXPORT = { w: 3000, h: 2250 };
const OUT_PUBLIC = path.resolve('public/prototype-assets/02-portal/window-view.webp');

const X0 = plate.x;
const X1 = plate.x + plate.w;
const Y1 = plate.y + plate.h;

const ZONES = {
  glimpse: { x0: 840, y0: 260, x1: 1000, y1: 400 },
  gold: { x0: 700, y0: 380, x1: 1010, y1: 640 },
  crossing: { x0: 178, y0: 116, x1: 1530, y1: 876 },
  window: { x0: 300, y0: 160, x1: 820, y1: 600 },
};

// ------------------------------------------------------------------ composition (design units)

const farHill = (x) => 506 + 20 * Math.sin(x / 210 + 1.1) + 9 * Math.sin(x / 71 + 0.4);
const midHill = (x) => 552 + 24 * Math.sin(x / 265 + 2.3) + 8 * Math.sin(x / 57);
const meadowTop = (x) => 604 + 12 * Math.sin(x / 300 + 0.7);

function drawGuide(ctx) {
  const rand = mulberry32(2027);

  // sky: cool blue above, pale aqua haze low — mid-value behind the gold modules
  vgrad(ctx, X0, plate.y, X1, 700, [
    [0, '#5b90bf'], [0.22, '#78aad0'], [0.45, '#a3c8dc'], [0.62, '#b8d5dc'],
    [0.76, '#a6c6cb'], [0.86, '#98bbbf'], [1, '#93b3b3'],
  ]);
  // morning sun off-frame upper left
  radial(ctx, -320, -440, 1550, [
    [0, 'rgba(255,244,218,0.8)'], [0.3, 'rgba(255,234,190,0.45)'], [0.62, 'rgba(252,228,184,0.14)'], [1, 'rgba(252,228,184,0)'],
  ]);

  // high cloud ribbons
  const ribbons = [
    [-120, -300, 520, 38, '#eef1ec'], [980, -210, 600, 34, '#e9eff0'], [300, -80, 460, 30, '#f3efe3'],
    [1420, -20, 420, 28, '#e8eeee'],
  ];
  for (const [x, y, rx, ry, c] of ribbons) blob(ctx, x, y, rx, ry, c, rand, 9, 0.55);

  // cloud band A (left, sunlit)
  blob(ctx, 250, 96, 380, 32, '#c4d2da', rand, 8, 0.7); // underside
  blob(ctx, 230, 66, 420, 52, '#f6efdf', rand, 11, 0.8);
  blob(ctx, 170, 48, 260, 34, '#fff6e3', rand, 7, 0.75);
  // cloud band B (right)
  blob(ctx, 1460, 206, 360, 28, '#bfcfd9', rand, 8, 0.7);
  blob(ctx, 1450, 180, 380, 46, '#eef0ea', rand, 10, 0.78);

  // the bloom: a sunlit cloud bank that glows through the finder square first
  radial(ctx, 905, 318, 420, [[0, 'rgba(255,250,238,0.75)'], [0.5, 'rgba(252,244,228,0.3)'], [1, 'rgba(252,244,228,0)']], 1, 0.5);
  blob(ctx, 950, 378, 280, 24, '#bcc5d1', rand, 10, 0.8); // cool underside keeps the gold zone clean
  blob(ctx, 960, 352, 250, 40, '#dcdce0', rand, 10, 0.85); // shaded belly
  for (const [cx, cy, rx, ry] of [[860, 322, 120, 62], [950, 300, 130, 72], [1050, 326, 110, 52], [900, 272, 90, 48], [1000, 262, 80, 42]]) {
    blob(ctx, cx + 8, cy + 10, rx, ry, '#e9e3d8', rand, 6, 0.95); // turned-away side
    blob(ctx, cx - 10, cy - 6, rx * 0.85, ry * 0.8, '#fbf6ec', rand, 6, 1); // sunlit side
  }
  blob(ctx, 902, 292, 120, 46, '#fffdf7', rand, 8, 1); // luminous heart = glimpse zone
  blob(ctx, 842, 280, 70, 30, '#fbe8c6', rand, 5, 0.75); // faint warm rim toward the sun
  blob(ctx, 1110, 318, 120, 34, '#f1ece0', rand, 6, 0.8);
  blob(ctx, 700, 352, 96, 26, '#eceee6', rand, 5, 0.7);

  // distant hills (atmospheric perspective)
  const ridge = (fn, color, base = 760) => {
    const pts = [[X0, base]];
    for (let x = X0; x <= X1; x += 12) pts.push([x, fn(x)]);
    pts.push([X1, base]);
    poly(ctx, pts, color);
  };
  ridge(farHill, '#a5b9bd');
  ridge(midHill, '#86a19f');
  // sunlit left flanks on the middle ridge
  for (let x = X0; x < X1; x += 180 + rand() * 120) {
    blob(ctx, x, midHill(x) + 14, 70, 14, '#a3b391', rand, 3, 0.45);
  }

  // valley meadow opening into the distance behind the gold modules
  {
    const pts = [[X0, Y1]];
    for (let x = X0; x <= X1; x += 12) pts.push([x, meadowTop(x)]);
    pts.push([X1, Y1]);
    const g = ctx.createLinearGradient(0, 600, 0, Y1);
    g.addColorStop(0, '#9ea978');
    g.addColorStop(0.3, '#8d9a62');
    g.addColorStop(1, '#6d7b49');
    poly(ctx, pts, g);
  }
  // a pale lane winding into the valley (depth cue, below the gold zone)
  ctx.save();
  ctx.strokeStyle = 'rgba(221,212,178,0.85)';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(760, 1320);
  ctx.bezierCurveTo(980, 1060, 760, 900, 905, 690);
  ctx.lineWidth = 44;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(905, 690);
  ctx.bezierCurveTo(925, 670, 915, 664, 930, 654);
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.restore();
  // soft tree lines in the valley
  for (let i = 0; i < 26; i++) {
    const x = 640 + rand() * 480;
    const y = 628 + rand() * 60;
    blob(ctx, x, y, 22 + rand() * 18, 12 + rand() * 8, rand() < 0.5 ? '#6f8660' : '#7d9168', rand, 3, 0.9);
  }

  // towns: left cluster (x ≤ 700) and right cluster (x ≥ 1030)
  const house = (x, base, w, wallH, roofH, ochre) => {
    const wall = ['#dccdb2', '#e2d4ba', '#d3c2a6'][(rand() * 3) | 0];
    ctx.fillStyle = wall;
    ctx.fillRect(x, base - wallH, w, wallH);
    ctx.fillStyle = '#c9b9a3';
    ctx.fillRect(x + w * 0.74, base - wallH, w * 0.26, wallH); // shaded side (light from upper left)
    const lit = ochre ? '#d4a257' : '#c77553';
    const shade = ochre ? '#a98241' : '#97563f';
    poly(ctx, [[x - 6, base - wallH], [x + w * 0.5, base - wallH - roofH], [x + w * 0.5, base - wallH]], lit);
    poly(ctx, [[x + w * 0.5, base - wallH - roofH], [x + w + 6, base - wallH], [x + w * 0.5, base - wallH]], shade);
    if (rand() < 0.5) {
      ctx.fillStyle = '#8f4a33';
      ctx.fillRect(x + w * 0.66, base - wallH - roofH * 0.8, w * 0.07, roofH * 0.45);
    }
    if (wallH < 90) return; // distant houses: no windows, just planes of light
    const winRows = Math.max(1, Math.floor(wallH / 44));
    for (let r = 0; r < winRows; r++)
      for (let c = 0; c < Math.max(1, Math.floor(w / 36)); c++) {
        if (rand() < 0.7) continue;
        ctx.fillStyle = rand() < 0.4 ? '#8c9a7c' : '#9a8a78';
        ctx.fillRect(x + 12 + c * 40, base - wallH + 16 + r * 42, 12, 16);
      }
  };
  const trees = (x0, x1, y0, y1, n, scale) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + rand() * (x1 - x0);
      const y = y0 + rand() * (y1 - y0);
      const r = (18 + rand() * 20) * scale;
      blob(ctx, x, y, r, r * 0.85, rand() < 0.5 ? '#6e8458' : '#7a8f5c', rand, 4, 0.95);
      blob(ctx, x - r * 0.3, y - r * 0.35, r * 0.55, r * 0.45, '#a7ad70', rand, 3, 0.7);
    }
  };
  const rowOf = (x0, x1, base, wR, wallR, roofR) => {
    let x = x0;
    while (x < x1) {
      const w = wR[0] + rand() * (wR[1] - wR[0]);
      if (x + w > x1) break;
      if (rand() < 0.72) house(x, base + (rand() - 0.5) * 24, w, wallR[0] + rand() * (wallR[1] - wallR[0]), roofR[0] + rand() * (roofR[1] - roofR[0]), rand() < 0.28);
      x += w * (0.55 + rand() * 0.5) + rand() * 70;
    }
  };

  // left
  trees(420, 700, 470, 560, 10, 1.6); // tall trees rising into the window's lower third
  trees(X0, 700, 560, 620, 22, 0.9);
  rowOf(X0 + 10, 690, 640, [56, 90], [34, 48], [24, 34]);
  trees(X0, 700, 628, 660, 18, 0.8); // foliage in front of the distant roofs
  trees(X0, 660, 600, 700, 26, 1.2);
  rowOf(X0 + 30, 660, 720, [90, 140], [66, 90], [40, 56]);
  trees(X0, 640, 740, 880, 24, 1.5);
  rowOf(X0 - 20, 620, 910, [140, 210], [104, 140], [58, 80]);
  trees(X0, 700, 940, 1100, 14, 1.9);
  rowOf(X0 - 40, 560, 1180, [200, 280], [150, 190], [80, 110]);

  // right
  trees(1030, X1, 600, 650, 16, 0.9);
  rowOf(1040, X1, 668, [58, 94], [34, 50], [24, 34]);
  trees(1030, X1, 660, 690, 14, 0.8);
  trees(1060, X1, 650, 780, 24, 1.2);
  rowOf(1080, X1, 770, [96, 150], [70, 94], [42, 58]);
  trees(1100, X1, 790, 950, 22, 1.5);
  rowOf(1150, X1, 960, [150, 220], [108, 146], [60, 84]);
  trees(1150, X1, 1000, 1200, 12, 1.9);
  rowOf(1250, X1, 1240, [210, 290], [150, 200], [82, 112]);

  // foreground garden greens in the lowest bleed
  trees(X0, X1, 1220, Y1, 26, 2.4);
}

// ------------------------------------------------------------------ brush behaviour

const isSky = (x, y) => y < farHill(x) - 4;

const field = (x, y) => {
  if (isSky(x, y)) {
    const base = 0.025 + 0.05 * Math.sin(x / 260 + y / 500);
    const bx = (x - 905) / 440;
    const by = (y - 322) / 210;
    const bloom = [Math.atan2(y - 322, x - 905), 0.5 * Math.exp(-(bx * bx + by * by))];
    const sd = Math.hypot(x + 320, y + 440);
    const sun = [Math.atan2(y + 440, x + 320), 0.4 * Math.exp(-((sd / 1300) ** 2))];
    return blendAngles([[base, 1], bloom, sun]);
  }
  if (y < meadowTop(x) + 6) return 0.04 * Math.sin(x / 90);
  const toVp = Math.atan2(y - 610, x - 900);
  return blendAngles([[toVp, 0.7], [-0.55, 0.5]]);
};

const goldZone = (x, y) => inRect(x, y, ZONES.gold.x0, ZONES.gold.y0, ZONES.gold.x1, ZONES.gold.y1, 60);
const glimpse = (x, y) => inRect(x, y, ZONES.glimpse.x0, ZONES.glimpse.y0, ZONES.glimpse.x1, ZONES.glimpse.y1, 80);

const detail = (x, y) => {
  if (isSky(x, y)) return 0.18 + 0.4 * smooth(420, 0, Math.hypot((x - 905) * 0.6, y - 322)) * (1 - glimpse(x, y) * 0.8);
  if (y < meadowTop(x)) return 0.45;
  return clamp(0.9 - goldZone(x, y) * 0.5, 0, 1);
};
const jitter = (x, y) => (isSky(x, y) ? 0.75 : 1.15) * (1 - goldZone(x, y) * 0.35) * (1 - glimpse(x, y) * 0.5);
const impastoMap = (x, y) => (isSky(x, y) ? 0.25 + 0.6 * glimpse(x, y) * 0 + 0.5 * smooth(300, 0, Math.hypot(x - 880, (y - 300) * 1.6)) : 0.85);
const edgeFollow = (x, y) => (isSky(x, y) ? 0.25 : 0.95);

const PASSES = [
  { r: 20, step: 14, len: [50, 120], alpha: 0.9, hueJ: 10, satJ: 0.08, lumJ: 0.07, taper: 0.4 },
  { r: 11, step: 8, len: [26, 64], alpha: 0.9, thresh: 16, texture: (x, y) => (isSky(x, y) ? 0.32 : 0.22), hueJ: 9, satJ: 0.08, lumJ: 0.06, impasto: 0.6 },
  { r: 6, step: 4.5, len: [12, 30], alpha: 0.88, thresh: 18, texture: () => 0.14, detail: true, hueJ: 8, satJ: 0.07, lumJ: 0.06, impasto: 0.8 },
  { r: 3, step: 2.6, len: [6, 15], alpha: 0.85, thresh: 30, detail: true, hueJ: 6, satJ: 0.06, lumJ: 0.05, impasto: 1 },
];

// ------------------------------------------------------------------ run

const REVIEW_RECTS = [
  { ...ZONES.crossing, color: '#ff2d55', label: 'crossing frame (t 2.28–2.8)', width: 4 },
  { ...ZONES.window, color: '#0a84ff', label: 'window zone', width: 3 },
  { x0: 440, y0: 220, x1: 800, y1: 580, color: '#5ac8fa', label: 'glass @ rest t3.32', dash: [10, 6] },
  { x0: 320, y0: 175, x1: 714, y1: 570, color: '#64d2ff', label: 'glass @ final t4.4', dash: [4, 4] },
  { ...ZONES.gold, color: '#ffd60a', label: 'gold readability', width: 3 },
  { ...ZONES.glimpse, color: '#ff9f0a', label: 'glimpse', width: 3 },
  { x0: 882, y0: 314, x1: 966, y1: 398, color: '#bf5af2', label: 't1.8', dash: [4, 4] },
  { x0: 723, y0: 261, x1: 1054, y1: 591, color: '#bf5af2', label: 't2.1', dash: [8, 4] },
];

const t0 = Date.now();
console.log(`window-view — ${MODE} — master ${plate.pw}×${plate.ph}`);
const guide = plate.canvas();
drawGuide(plate.designCtx(guide));

let master = guide;
if (MODE === 'final') {
  master = paintStrokes(plate, guide, { field, passes: PASSES, detail, jitter, impastoMap, edgeFollow, light: [-0.7, -0.7], seed: 91 });
  canvasTooth(master, 0.04);
  await writeFile(path.resolve('art-src/masters/window-view@2x.png'), await master.encode('png'));
}
const exported = resample(master, EXPORT.w, EXPORT.h);
await writeFile(OUT_PUBLIC, await exported.encode('webp', MODE === 'final' ? 84 : 80));
await writeFile(path.resolve(`art-src/review/window-view-${MODE}.png`), await reviewOverlay(plate, master, REVIEW_RECTS).encode('png'));
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
