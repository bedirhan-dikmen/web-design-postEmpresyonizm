// ARTWORK B-01 — Restaurant Wall (architecture, window, kitchen pass)
//
// Contract (ARTWORK_REPLACEMENT_CONTRACT.md §2, §3.1, §3.2; ARTWORK_COMPOSITIONS.md §C.2):
//   file     public/prototype-assets/03-nexa-morning/room-wall.webp
//   design   2600 × 1500 at origin (−340, −210), World B portal plane, depth 0
//   export   3250 × 1875 (k = 1.25) · master 5200 × 3000 (k = 2)
//   glass    x 440–800, y 220–580 → alpha exactly 0 (the portal)
//   band     x 368–872, y 148–652 plain light plaster (≈ #F1E4C8); code draws 24 blue dabs here
//   beam     x 600–920, y 380–660 calm, no dark accents
//   text T4  x 1220–1840, y 170–570 plain sunlit plaster — no objects, lamps, cords, strong strokes
//   pass     x 1420–2200, y 590–800 (top edge ≥ 590), two gestural cooks, no faces
//   shelf    x 930–1180, y 320–420 · plant x 120–340 · curtains 300–368 / 872–940 · sill 340–900 × 652–690
//
// Usage: node scripts/art/restaurant-wall.mjs --blockout | --final

import path from 'node:path';
import {
  Plate, blendAngles, blob, canvasTooth, clamp, hgrad, inRect, mulberry32, paintStrokes, poly, radial,
  resample, reviewOverlay, smooth, vgrad, writeFile,
} from './engine.mjs';

const MODE = process.argv.includes('--final') ? 'final' : 'blockout';
const plate = new Plate({ name: 'room-wall', x: -340, y: -210, w: 2600, h: 1500, k: 2 });
const EXPORT = { w: 3250, h: 1875 };
const OUT_PUBLIC = path.resolve('public/prototype-assets/03-nexa-morning/room-wall.webp');

const X0 = plate.x;
const X1 = plate.x + plate.w;
const Y0 = plate.y;
const Y1 = plate.y + plate.h;

const GLASS = { x0: 440, y0: 220, x1: 800, y1: 580 };
const BAND = { x0: 368, y0: 148, x1: 872, y1: 652 };
const TEXT = { x0: 1220, y0: 170, x1: 1840, y1: 570 };
const BEAM = { x0: 600, y0: 380, x1: 920, y1: 660 };
const PASS = { x0: 1420, y0: 590, x1: 2200, y1: 800 };
const SHELF = { x0: 930, y0: 320, x1: 1180, y1: 420 };
const VP = { x: 960, y: 520 };
const WAINSCOT = { top: 700, floor: 840 };

// ------------------------------------------------------------------ composition (design units)

function drawGuide(ctx) {
  const rand = mulberry32(4051);

  // ---- plaster wall: evenly lit, warm; soft shade toward the ceiling and the far edges
  vgrad(ctx, X0, Y0, X1, WAINSCOT.top, [[0, '#cdb48f'], [0.18, '#e2cfab'], [0.32, '#efe1c5'], [0.7, '#f1e4c9'], [1, '#e9dabd']]);
  hgrad(ctx, X0, Y0, X1, WAINSCOT.top, [
    [0, 'rgba(196,172,140,0.55)'], [0.16, 'rgba(196,172,140,0.12)'], [0.3, 'rgba(0,0,0,0)'],
    [0.86, 'rgba(0,0,0,0)'], [1, 'rgba(190,160,120,0.45)'],
  ]);
  // sunlit plaster right of the window, fading before x 1200
  radial(ctx, 960, 430, 300, [[0, 'rgba(255,246,226,0.75)'], [0.6, 'rgba(255,244,222,0.3)'], [1, 'rgba(255,244,222,0)']], 1, 0.9);
  // the NeXa text zone: a very soft, even side light (calm, nothing else)
  radial(ctx, 1480, 360, 520, [[0, 'rgba(250,240,219,0.55)'], [1, 'rgba(250,240,219,0)']], 1, 0.62);

  // ---- ceiling beam and its soft shadow
  vgrad(ctx, X0, Y0, X1, -80, [[0, '#6a4a31'], [1, '#7e5a3b']]);
  vgrad(ctx, X0, -80, X1, -62, [[0, '#9a7450'], [1, '#6e4d33']]);
  vgrad(ctx, X0, -62, X1, 70, [[0, 'rgba(120,88,58,0.5)'], [1, 'rgba(120,88,58,0)']]);

  // ---- window: lintel shadow, plain band, wood reveal, sill, curtains
  vgrad(ctx, BAND.x0 - 14, BAND.y0 - 26, BAND.x1 + 14, BAND.y0, [[0, 'rgba(170,140,104,0)'], [1, 'rgba(170,140,104,0.35)']]);
  ctx.fillStyle = '#f1e4c8';
  ctx.fillRect(BAND.x0, BAND.y0, BAND.x1 - BAND.x0, BAND.y1 - BAND.y0);
  // warm wood reveal just outside the glass (glass itself becomes transparent)
  ctx.fillStyle = '#9b6c45';
  ctx.fillRect(GLASS.x0 - 12, GLASS.y0 - 12, GLASS.x1 - GLASS.x0 + 24, GLASS.y1 - GLASS.y0 + 24);
  ctx.fillStyle = '#c0925f'; // lit inner edges (light comes through the glass)
  ctx.fillRect(GLASS.x0 - 12, GLASS.y1, GLASS.x1 - GLASS.x0 + 24, 5);
  ctx.fillRect(GLASS.x1, GLASS.y0 - 12, 5, GLASS.y1 - GLASS.y0 + 24);
  // sill
  ctx.fillStyle = '#e9d3a7';
  ctx.fillRect(340, 652, 560, 16);
  vgrad(ctx, 340, 668, 900, 690, [[0, '#b98a5b'], [1, '#9c7148']]);
  vgrad(ctx, 330, 690, 910, 712, [[0, 'rgba(140,110,80,0.35)'], [1, 'rgba(140,110,80,0)']]);
  // curtain rod + sheer curtains (pale, soft folds)
  ctx.fillStyle = '#7b5738';
  ctx.fillRect(286, 100, 668, 6);
  for (const [cx0, cx1] of [[300, 368], [872, 940]]) {
    hgrad(ctx, cx0, 106, cx1, 700, [[0, '#e6dcc6'], [0.18, '#f8f1e3'], [0.34, '#e9dfcb'], [0.52, '#faf4e8'], [0.7, '#e7ddc8'], [0.86, '#f7f0e2'], [1, '#e2d7c0']]);
    vgrad(ctx, cx0, 640, cx1, 700, [[0, 'rgba(210,196,170,0)'], [1, 'rgba(210,196,170,0.5)']]);
  }

  // ---- shelf with jars (x 930–1180)
  vgrad(ctx, SHELF.x0 + 4, 420, SHELF.x1 + 10, 446, [[0, 'rgba(150,118,84,0.35)'], [1, 'rgba(150,118,84,0)']]);
  ctx.fillStyle = '#7a5234';
  ctx.fillRect(SHELF.x0, 404, SHELF.x1 - SHELF.x0, 16);
  ctx.fillStyle = '#a57a4f';
  ctx.fillRect(SHELF.x0, 404, SHELF.x1 - SHELF.x0, 4);
  const jars = [
    [944, 30, 58, '#c8643b'], [982, 22, 70, '#8a9a5b'], [1012, 34, 46, '#efe2c4'], [1054, 26, 62, '#dca64d'],
    [1088, 30, 40, '#7fa3bf'], [1126, 22, 54, '#b35b36'], [1152, 22, 34, '#e9dcc1'],
  ];
  for (const [x, w, h, c] of jars) {
    ctx.fillStyle = c;
    ctx.fillRect(x, 404 - h, w, h);
    ctx.fillStyle = 'rgba(255,248,232,0.45)';
    ctx.fillRect(x + 3, 404 - h + 4, Math.max(3, w * 0.18), h - 8);
    ctx.fillStyle = 'rgba(80,50,30,0.18)';
    ctx.fillRect(x + w * 0.72, 404 - h, w * 0.28, h);
  }

  // ---- potted plant left of the window (x 120–340, y 420–840)
  vgrad(ctx, 100, 815, 330, 850, [[0, 'rgba(120,90,60,0)'], [1, 'rgba(120,90,60,0.3)']]);
  poly(ctx, [[176, 840], [166, 752], [292, 752], [282, 840]], '#b85f3a');
  ctx.fillStyle = '#d27a4f';
  ctx.fillRect(160, 744, 140, 12);
  const leaves = 22;
  for (let i = 0; i < leaves; i++) {
    const a = -Math.PI / 2 + (rand() - 0.5) * 2.3;
    const len = 110 + rand() * 230;
    const lx = 230 + Math.cos(a) * len * 0.62;
    const ly = 744 + Math.sin(a) * len;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(a + Math.PI / 2 + (rand() - 0.5) * 0.4);
    ctx.fillStyle = rand() < 0.5 ? '#5f7a4c' : '#6f8757';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 + rand() * 12, 44 + rand() * 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(176,186,118,0.55)'; // lit from the window (right)
    ctx.beginPath();
    ctx.ellipse(6, -4, 7, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- wainscot (terracotta panels) left of the pass and right of it
  const wainscot = (x0, x1) => {
    vgrad(ctx, x0, WAINSCOT.top, x1, WAINSCOT.floor, [[0, '#c46a44'], [1, '#ad5636']]);
    ctx.fillStyle = '#dcb582';
    ctx.fillRect(x0, WAINSCOT.top - 8, x1 - x0, 12);
    for (let x = x0 + 14; x < x1 - 60; x += 150) {
      ctx.fillStyle = 'rgba(130,56,32,0.45)';
      ctx.fillRect(x, 730, Math.min(118, x1 - 14 - x), 84);
      ctx.fillStyle = 'rgba(230,150,110,0.25)';
      ctx.fillRect(x, 730, Math.min(118, x1 - 14 - x), 4);
    }
    ctx.fillStyle = '#6f3f26';
    ctx.fillRect(x0, WAINSCOT.floor - 10, x1 - x0, 10);
  };
  wainscot(X0, PASS.x0 - 16);
  wainscot(PASS.x1 + 16, X1);

  // ---- kitchen pass (x 1420–2200, y 590–800): a warm, darker opening with two cooks
  ctx.fillStyle = '#7d5638'; // wooden casing
  // casing sits inside the contract rectangle so the pass never rises above y 590
  ctx.fillRect(PASS.x0, PASS.y0, PASS.x1 - PASS.x0, 16);
  ctx.fillRect(PASS.x0, PASS.y0, 16, WAINSCOT.floor - PASS.y0);
  ctx.fillRect(PASS.x1 - 16, PASS.y0, 16, WAINSCOT.floor - PASS.y0);
  vgrad(ctx, PASS.x0 + 16, PASS.y0 + 16, PASS.x1 - 16, 782, [[0, '#3f2c20'], [0.5, '#5a3f2c'], [1, '#6c4d35']]);
  // back wall tiles hint + heat-lamp light
  for (let x = PASS.x0 + 20; x < PASS.x1 - 20; x += 44)
    for (let y = PASS.y0 + 40; y < 760; y += 30) {
      ctx.fillStyle = `rgba(210,180,140,${0.05 + rand() * 0.06})`;
      ctx.fillRect(x, y, 40, 26);
    }
  for (const lx of [1590, 1880]) {
    // kept inside the pass: the glow must not tint the NeXa text zone above y 590
    ctx.save();
    ctx.beginPath();
    ctx.rect(PASS.x0, PASS.y0, PASS.x1 - PASS.x0, WAINSCOT.floor - PASS.y0);
    ctx.clip();
    radial(ctx, lx, PASS.y0 + 30, 190, [[0, 'rgba(255,196,120,0.7)'], [0.5, 'rgba(240,160,90,0.25)'], [1, 'rgba(240,160,90,0)']], 1, 0.75);
    ctx.restore();
    ctx.fillStyle = '#9a7448';
    ctx.fillRect(lx - 30, PASS.y0 + 16, 60, 5);
    ctx.fillStyle = 'rgba(255,220,160,0.8)';
    ctx.fillRect(lx - 24, PASS.y0 + 21, 48, 3);
  }
  // copper pans on the right
  for (const [px, pr] of [[2040, 18], [2098, 22], [2156, 16]]) {
    ctx.fillStyle = '#2e2018';
    ctx.fillRect(px - 1, PASS.y0 + 16, 2, 18);
    radial(ctx, px, PASS.y0 + 34 + pr, pr, [[0, '#e0925a'], [0.75, '#b8693a'], [1, 'rgba(184,105,58,0)']]);
  }
  // cooks (gestural, turned away / profile, no facial features)
  const cook = (cx, headY, lean) => {
    ctx.save();
    ctx.translate(cx, 0);
    ctx.rotate(lean);
    poly(ctx, [[-58, 782], [-56, headY + 66], [-40, headY + 44], [-12, headY + 36], [16, headY + 38], [44, headY + 50], [58, headY + 74], [62, 782]], '#d9cdb9');
    poly(ctx, [[14, headY + 40], [44, headY + 50], [58, headY + 74], [62, 782], [26, 782]], '#b4a690'); // shaded side
    radial(ctx, -20, headY + 60, 60, [[0, 'rgba(255,214,150,0.35)'], [1, 'rgba(255,214,150,0)']]); // heat-lamp rim light
    ctx.fillStyle = '#5a3c2c'; // back of the head, turned away
    ctx.beginPath();
    ctx.ellipse(0, headY + 10, 15, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d8cfbf'; // cap, muted by the kitchen shade
    ctx.beginPath();
    ctx.ellipse(-2, headY - 6, 17, 10, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  cook(1600, 664, -0.03);
  cook(1790, 672, 0.06);
  // arm reaching to the pass and a little steam
  poly(ctx, [[1818, 722], [1860, 744], [1900, 774], [1886, 782], [1842, 758], [1806, 740]], '#cfc3ae');
  for (let i = 0; i < 5; i++) blob(ctx, 1700 + rand() * 60, 640 + rand() * 60, 14, 26, '#d8cbb6', rand, 2, 0.35);
  // counter ledge with dishes waiting to go out
  ctx.fillStyle = '#e6d9c0';
  ctx.fillRect(PASS.x0 - 16, 782, PASS.x1 - PASS.x0 + 32, 18);
  ctx.fillStyle = '#fbf6ec';
  ctx.fillRect(PASS.x0 - 16, 782, PASS.x1 - PASS.x0 + 32, 4);
  for (const dx of [1520, 1706, 1960]) {
    ctx.fillStyle = '#fbf6ec';
    ctx.beginPath();
    ctx.ellipse(dx, 780, 36, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rand() < 0.5 ? '#c8643b' : '#8a9a5b';
    ctx.beginPath();
    ctx.ellipse(dx, 774, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  vgrad(ctx, PASS.x0 - 16, 800, PASS.x1 + 16, WAINSCOT.floor, [[0, '#8e6040'], [1, '#76492e']]);

  // ---- floor: honey planks converging to the vanishing point, sun strip along the beam
  vgrad(ctx, X0, WAINSCOT.floor, X1, Y1, [[0, '#b27a45'], [0.35, '#c48f58'], [1, '#a8723f']]);
  vgrad(ctx, X0, WAINSCOT.floor, X1, WAINSCOT.floor + 26, [[0, 'rgba(80,50,28,0.45)'], [1, 'rgba(80,50,28,0)']]);
  ctx.save();
  ctx.strokeStyle = 'rgba(112,72,40,0.55)';
  ctx.lineWidth = 3;
  for (let x = -3200; x < 5200; x += 120) {
    const t = (WAINSCOT.floor - VP.y) / (Y1 - VP.y);
    ctx.beginPath();
    ctx.moveTo(VP.x + (x - VP.x) * t, WAINSCOT.floor);
    ctx.lineTo(x, Y1);
    ctx.stroke();
  }
  ctx.restore();
  poly(ctx, [[860, 846], [1150, 846], [1720, Y1], [1030, Y1]], 'rgba(240,196,128,0.34)');
  poly(ctx, [[930, 846], [1080, 846], [1480, Y1], [1170, Y1]], 'rgba(252,214,150,0.28)');
}

// ------------------------------------------------------------------ brush behaviour

const inText = (x, y, f = 0) => inRect(x, y, TEXT.x0, TEXT.y0, TEXT.x1, TEXT.y1, f);
const inBand = (x, y, f = 0) => inRect(x, y, BAND.x0, BAND.y0, BAND.x1, BAND.y1, f);
const inPass = (x, y) => inRect(x, y, PASS.x0 - 16, PASS.y0 - 16, PASS.x1 + 16, WAINSCOT.floor);
const isFloor = (x, y) => y > WAINSCOT.floor;
const isWainscot = (x, y) => y > WAINSCOT.top - 8 && y <= WAINSCOT.floor && !inPass(x, y);
const isCurtain = (x, y) => y > 106 && y < 700 && ((x > 300 && x < 368) || (x > 872 && x < 940));
const isPlant = (x, y) => x > 100 && x < 360 && y > 380 && y < 845;

const field = (x, y) => {
  if (y < -62) return 0.02;
  if (isFloor(x, y)) return Math.atan2(y - VP.y, x - VP.x);
  if (isWainscot(x, y)) return 0.02 * Math.sin(x / 80);
  if (inPass(x, y)) return Math.PI / 2 + 0.08 * Math.sin(x / 40);
  if (isCurtain(x, y)) return Math.PI / 2;
  const hatch = -0.86 + 0.22 * Math.sin(x / 210 + y / 170);
  // inside the text zone the hatch settles into one calm direction
  return blendAngles([[hatch, 1 - inText(x, y, 60) * 0.8], [-0.8, inText(x, y, 60) * 0.8 + 0.001]]);
};

const detail = (x, y) => {
  if (inText(x, y, 40)) return 0.55; // fine, low-contrast texture only (see jitter)
  if (inBand(x, y, 10)) return 0.5;
  if (inPass(x, y) || isPlant(x, y) || inRect(x, y, SHELF.x0, SHELF.y0 - 80, SHELF.x1, SHELF.y1 + 20)) return 1;
  if (inRect(x, y, 280, 90, 960, 720, 60)) return 0.9; // window surround — first seen at 5×
  return 0.6;
};

const jitter = (x, y) => {
  const calm = Math.max(inText(x, y, 80) * 0.65, inBand(x, y, 20) * 0.55, inRect(x, y, BEAM.x0, BEAM.y0, BEAM.x1, BEAM.y1, 40) * 0.35);
  return (inPass(x, y) ? 1.25 : 1) * (1 - calm);
};

const impastoMap = (x, y) => {
  if (inText(x, y, 60) || inBand(x, y)) return 0.1;
  if (inRect(x, y, 330, 648, 910, 692) || isPlant(x, y)) return 1;
  if (inPass(x, y)) return 0.8;
  return 0.45;
};

const edgeFollow = (x, y) => (inText(x, y, 40) || inBand(x, y) ? 0.1 : isFloor(x, y) ? 0.35 : 0.85);

const PASSES = [
  { r: 20, step: 14, len: [46, 110], alpha: 0.9, hueJ: 8, satJ: 0.07, lumJ: 0.06, taper: 0.4 },
  { r: 11, step: 8, len: [24, 58], alpha: 0.88, thresh: 16, texture: (x, y) => (inText(x, y) || inBand(x, y) ? 0.35 : 0.25), hueJ: 8, satJ: 0.07, lumJ: 0.05, impasto: 0.5 },
  { r: 6, step: 4.5, len: [12, 28], alpha: 0.86, thresh: 18, texture: (x, y) => (inText(x, y, 40) ? 0.3 : 0.14), detail: true, hueJ: 7, satJ: 0.06, lumJ: 0.05, impasto: 0.8 },
  { r: 3, step: 2.6, len: [6, 14], alpha: 0.84, thresh: 30, detail: true, hueJ: 6, satJ: 0.05, lumJ: 0.045, impasto: 1 },
];

// ------------------------------------------------------------------ run

const REVIEW_RECTS = [
  { x0: 0, y0: 0, x1: 1920, y1: 1080, color: '#ffffff', label: 'rest frame t3.32', dash: [12, 8] },
  { x0: 208, y0: 84, x1: 1892, y1: 1032, color: '#aaaaaa', label: 'final hold t4.4', dash: [6, 6] },
  { ...GLASS, color: '#5ac8fa', label: 'glass hole (alpha 0)', width: 4 },
  { ...BAND, color: '#0a84ff', label: 'dab frame band', width: 2 },
  { ...TEXT, color: '#ff2d55', label: 'T4 NeXa text zone', width: 4 },
  { x0: 1220, y0: 200, x1: 1620, y1: 528, color: '#ff375f', label: 'placed text box', dash: [6, 4] },
  { ...BEAM, color: '#ffd60a', label: 'beam path', width: 3 },
  { ...PASS, color: '#ff9f0a', label: 'kitchen pass', width: 3 },
  { ...SHELF, color: '#30d158', label: 'shelf', width: 2 },
];

const t0 = Date.now();
console.log(`room-wall — ${MODE} — master ${plate.pw}×${plate.ph}`);
const guide = plate.canvas();
drawGuide(plate.designCtx(guide));

let master = guide;
if (MODE === 'final') {
  master = paintStrokes(plate, guide, { field, passes: PASSES, detail, jitter, impastoMap, edgeFollow, light: [-0.8, -0.6], seed: 57 });
  canvasTooth(master, 0.035);
}

// punch the glass hole at master resolution (exact design rectangle)
const cut = (canvas, k, ox, oy) => {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); // pixel space (the guide context left a design transform)
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  ctx.fillRect((GLASS.x0 - ox) * k, (GLASS.y0 - oy) * k, (GLASS.x1 - GLASS.x0) * k, (GLASS.y1 - GLASS.y0) * k);
  ctx.restore();
};
cut(master, plate.k, plate.x, plate.y);
if (MODE === 'final') await writeFile(path.resolve('art-src/masters/room-wall@2x.png'), await master.encode('png'));

const exported = resample(master, EXPORT.w, EXPORT.h);
cut(exported, EXPORT.w / plate.w, plate.x, plate.y); // re-cut after resampling so no painted pixel bleeds into the glass
await writeFile(OUT_PUBLIC, await exported.encode('webp', MODE === 'final' ? 84 : 80));
await writeFile(path.resolve(`art-src/review/room-wall-${MODE}.png`), await reviewOverlay(plate, master, REVIEW_RECTS).encode('png'));
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
