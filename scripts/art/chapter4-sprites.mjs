// Chapter 4 sprites (Phase 4.2): gestural figures with pose variants, painted device bodies,
// foreground parallax layers and ambient elements. WebP with alpha, painted at 1.5× design size.
//
// Figures are silhouettes with warm rim light — no faces. Device bodies are painted; their screens
// stay dark here because the product UI is drawn crisp in the DOM on top (Chapter4Layers.tsx).
//
// Usage: node scripts/art/chapter4-sprites.mjs [name…]

import path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { Plate, blob, hgrad, mulberry32, paintStrokes, poly, radial, vgrad, writeFile } from './engine.mjs';

const OUT = path.resolve('public/prototype-assets/04-journey/sprites');
const only = process.argv.slice(2);

const FIG = [
  { r: 5, step: 4, len: [7, 16], alpha: 0.82, hueJ: 6, satJ: 0.06, lumJ: 0.07, taper: 0.5 },
  { r: 2.4, step: 2.2, len: [4, 9], alpha: 0.8, thresh: 18, texture: () => 0.2, hueJ: 5, satJ: 0.05, lumJ: 0.06, impasto: 0.5 },
];
const DEVICE = [{ r: 2.6, step: 2.4, len: [4, 10], alpha: 0.55, hueJ: 3, satJ: 0.03, lumJ: 0.04, taper: 0.5 }];
const DARK = [{ r: 7, step: 6, len: [10, 26], alpha: 0.85, hueJ: 6, satJ: 0.05, lumJ: 0.06, taper: 0.5 }];

/** paint a sprite and keep its silhouette readable (clip to the slightly grown guide alpha) */
async function sprite(name, w, h, draw, { k = 1.5, passes = FIG, field = () => -1.2, seed = 5 } = {}) {
  const p = new Plate({ name, x: 0, y: 0, w, h, k });
  const guide = p.canvas();
  draw(p.designCtx(guide), mulberry32(seed));
  const painted = paintStrokes(p, guide, { field, passes, edgeFollow: () => 0.95, jitter: () => 1, impastoMap: () => 0.35, seed });
  const mask = createCanvas(p.pw, p.ph);
  const m = mask.getContext('2d');
  for (const [dx, dy] of [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]]) m.drawImage(guide, dx, dy);
  const c = painted.getContext('2d');
  c.globalCompositeOperation = 'destination-in';
  c.drawImage(mask, 0, 0);
  await writeFile(path.join(OUT, `${name}.webp`), await painted.encode('webp', 88));
}

// primitives (sprite-local design units) ---------------------------------------
/** contact shadow under a standing/seated figure (drawn first, so it reads as floor contact) */
const ground = (ctx, x, y, rx, alpha = 0.3) => {
  radial(ctx, x, y, rx, [[0, `rgba(26,16,10,${alpha})`], [0.55, `rgba(26,16,10,${alpha * 0.5})`], [1, 'rgba(26,16,10,0)']], 1, 0.26);
};
const limb = (ctx, pts, w, color, alpha = 1) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
  ctx.restore();
};
const ell = (ctx, x, y, rx, ry, color, rot = 0) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
};
const rrect = (ctx, x0, y0, x1, y1, r, fill) => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x0, y0, x1 - x0, y1 - y0, r);
  ctx.fill();
};
/** head seen 3/4 from behind: hair mass on the back side, a sliver of face toward `dir` (−1 left, 1 right) */
const head = (ctx, x, y, r, dir, skin, hair, rim) => {
  ell(ctx, x, y, r * 0.9, r * 1.1, skin);
  ell(ctx, x - dir * r * 0.28, y - r * 0.22, r * 0.95, r * 1.0, hair);
  ell(ctx, x + dir * r * 0.45, y + r * 0.12, r * 0.42, r * 0.72, skin);
  if (rim) limb(ctx, [[x + dir * r * 0.2, y - r * 1.05], [x + dir * r * 0.85, y - r * 0.4], [x + dir * r * 0.88, y + r * 0.4]], r * 0.14, rim, 0.8);
};

// ── figures ────────────────────────────────────────────────────────────────────
const SKIN = { a: '#b98464', b: '#9c6a4e', c: '#c49070', d: '#8a5b42' };

/** 4.1 seated guest (dining chair, facing the table on the left). Anchor: bottom centre = feet. */
function guest(ctx, reach) {
  ground(ctx, 150, 556, 120);
  const coat = '#8c3f2b';
  const coatShade = '#5a281b';
  const trousers = '#2c3244';
  const rim = '#f6c995';
  limb(ctx, [[238, 398], [128, 410]], 62, trousers);
  limb(ctx, [[128, 410], [122, 536]], 48, '#252a39');
  ell(ctx, 104, 548, 40, 13, '#1b1816');
  limb(ctx, [[238, 398], [140, 408]], 10, 'rgba(255,214,160,0.25)');
  poly(ctx, [[172, 176], [262, 182], [286, 300], [284, 412], [178, 412], [164, 300]], coat);
  poly(ctx, [[232, 182], [262, 182], [286, 300], [284, 412], [242, 412]], coatShade);
  limb(ctx, [[164, 186], [160, 300], [176, 405]], 7, rim, 0.75);
  limb(ctx, [[206, 150], [210, 182]], 28, SKIN.d);
  ctx.save();
  poly(ctx, [[176, 176], [236, 176], [224, 206], [186, 206]], '#3e6d6a'); // scarf (teal, no gold)
  ctx.restore();
  head(ctx, 204, 116, 42, -1, SKIN.a, '#2a1f1a', rim);
  if (reach) {
    limb(ctx, [[198, 206], [120, 262], [44, 250]], 40, coat);
    limb(ctx, [[198, 214], [122, 270], [48, 258]], 6, rim, 0.6);
    ell(ctx, 30, 248, 20, 15, SKIN.a);
  } else {
    limb(ctx, [[200, 206], [176, 318], [148, 386]], 40, coat);
    ell(ctx, 142, 394, 17, 14, SKIN.a);
  }
}

/** 4.3–4.4 chef behind the pass (cut at the pass shelf). Anchor: bottom centre = pass shelf top. */
function chef(ctx, pose) {
  const jacket = '#ece4d4';
  const shade = '#b9ad98';
  const apron = '#2f3337';
  const hat = '#f6f1e6';
  const rim = '#ffc877';
  const dir = pose === 'look' ? -1 : 1;
  poly(ctx, [[100, 206], [220, 206], [242, 470], [82, 470]], jacket);
  poly(ctx, dir > 0 ? [[170, 206], [220, 206], [242, 470], [175, 470]] : [[100, 206], [150, 206], [140, 470], [82, 470]], shade);
  poly(ctx, [[116, 300], [224, 300], [236, 470], [106, 470]], apron);
  for (let y = 236; y < 300; y += 26) ell(ctx, 160 + dir * 26, y, 5, 5, '#8b8f93');
  limb(ctx, [[150, 170], [158, 206]], 30, SKIN.d);
  const hx = pose === 'look' ? 150 : 166;
  const hy = pose === 'look' ? 118 : 126;
  head(ctx, hx, hy, 40, dir, SKIN.c, '#2b211b', rim);
  // toque
  poly(ctx, [[hx - 38, hy - 88], [hx + 38, hy - 88], [hx + 32, hy - 32], [hx - 32, hy - 32]], hat);
  ell(ctx, hx, hy - 90, 56, 36, hat);
  limb(ctx, [[hx - 34, hy - 40], [hx + 34, hy - 40]], 6, '#d5ccba');
  if (pose === 'work') {
    limb(ctx, [[212, 226], [268, 316], [306, 292]], 44, jacket);
    ell(ctx, 312, 290, 16, 13, SKIN.c);
    limb(ctx, [[112, 226], [96, 340], [120, 440]], 42, shade);
  } else if (pose === 'look') {
    limb(ctx, [[112, 226], [62, 176], [48, 112]], 42, jacket);
    ell(ctx, 46, 102, 16, 14, SKIN.c);
    rrect(ctx, 20, 40, 76, 96, 3, '#f6eedc'); // the order slip in hand
    limb(ctx, [[210, 226], [230, 340], [206, 440]], 42, shade);
  } else {
    limb(ctx, [[206, 228], [274, 330], [318, 382]], 44, jacket);
    limb(ctx, [[118, 228], [190, 346], [298, 398]], 42, shade);
    ell(ctx, 320, 384, 16, 13, SKIN.c);
    ell(ctx, 300, 400, 16, 13, SKIN.c);
  }
  limb(ctx, [[82, 470], [100, 206]], 6, rim, 0.55);
}

/** 4.4 cashier behind the counter, facing the guest on the right (cut at the counter top). */
function cashier(ctx, hand) {
  const shirt = '#e8dcc6';
  const vest = '#2e4a3f';
  const rim = '#ffe0b0';
  poly(ctx, [[92, 150], [208, 150], [224, 380], [78, 380]], shirt);
  poly(ctx, [[96, 164], [142, 160], [150, 380], [80, 380]], vest);
  poly(ctx, [[160, 160], [206, 164], [222, 380], [170, 380]], vest);
  limb(ctx, [[146, 118], [150, 150]], 26, SKIN.d);
  head(ctx, 150, 88, 38, 1, SKIN.b, '#1f1814', rim);
  limb(ctx, [[98, 172], [86, 280], [108, 370]], 40, '#cfc2aa');
  if (hand) {
    limb(ctx, [[204, 172], [256, 226], [300, 236]], 40, shirt);
    ell(ctx, 304, 236, 15, 12, SKIN.b);
  } else {
    limb(ctx, [[204, 172], [232, 282], [246, 372]], 40, shirt);
  }
  limb(ctx, [[208, 150], [224, 380]], 6, rim, 0.6);
}

/** 4.4 paying guest standing at the counter, back 3/4 view, facing the reader on the left. */
function payer(ctx, up) {
  ground(ctx, 196, 540, 105);
  const coat = '#34495e';
  const coatShade = '#243344';
  const trousers = '#2a2622';
  const rim = '#ffd9a8';
  limb(ctx, [[172, 330], [164, 528]], 50, trousers);
  limb(ctx, [[222, 330], [232, 528]], 50, '#221f1c');
  ell(ctx, 158, 534, 30, 11, '#171412');
  ell(ctx, 240, 534, 30, 11, '#171412');
  poly(ctx, [[136, 122], [246, 128], [268, 352], [126, 346]], coat);
  poly(ctx, [[200, 126], [246, 128], [268, 352], [210, 350]], coatShade);
  head(ctx, 192, 72, 38, -1, SKIN.a, '#6b4a2e', rim);
  limb(ctx, [[244, 148], [258, 252], [252, 332]], 38, coatShade);
  if (up) {
    limb(ctx, [[142, 142], [88, 200], [48, 188]], 38, coat);
    ell(ctx, 44, 186, 15, 12, SKIN.a);
    rrect(ctx, 18, 150, 50, 206, 6, '#1d2023');
    rrect(ctx, 22, 156, 46, 198, 3, '#bfe7e0');
  } else {
    limb(ctx, [[140, 142], [124, 252], [132, 332]], 38, coat);
    ell(ctx, 132, 342, 14, 12, SKIN.a);
  }
  limb(ctx, [[126, 346], [136, 122]], 6, rim, 0.6);
}

/**
 * 4.3 waiter, facing left. The waiter never holds a notepad: idle with an empty tray under the arm,
 * or walking with the prepared plate raised on the tray. Anchor: bottom centre = feet.
 */
function waiter(ctx, pose) {
  ground(ctx, 156, 540, 110);
  const shirt = '#efe7d8';
  const shade = '#c9bfad';
  const apron = '#1f2226';
  const rim = '#ffd49a';
  const stride = pose === 'walk-a' ? 1 : pose === 'walk-b' ? -1 : 0;
  // legs
  limb(ctx, [[140, 330], [140 - 26 * stride, 430], [132 - 40 * stride, 528]], 46, '#26282c');
  limb(ctx, [[176, 330], [176 + 22 * stride, 430], [184 + 36 * stride, 528]], 46, '#1d1f22');
  ell(ctx, 124 - 40 * stride, 536, 30, 11, '#131313');
  ell(ctx, 192 + 36 * stride, 536, 30, 11, '#131313');
  // shirt + long bistro apron
  poly(ctx, [[104, 136], [214, 140], [230, 350], [92, 346]], shirt);
  poly(ctx, [[170, 140], [214, 140], [230, 350], [176, 348]], shade);
  poly(ctx, [[98, 250], [224, 252], [238, 470], [88, 466]], apron);
  limb(ctx, [[108, 252], [220, 254]], 8, '#3a3e44');
  head(ctx, 156, 84, 38, -1, SKIN.c, '#2e241d', rim);
  limb(ctx, [[152, 116], [156, 140]], 26, SKIN.d);
  // far arm
  limb(ctx, [[204, 156], [222, 250], [214, 318]], 36, shade);
  if (pose === 'idle') {
    limb(ctx, [[112, 156], [96, 250], [108, 320]], 36, shirt);
    ell(ctx, 110, 328, 14, 12, SKIN.c);
    ell(ctx, 132, 300, 12, 58, '#8e9498', 0.25); // empty round tray held against the leg
  } else {
    // forearm raised, palm up, carrying the tray — the dish itself is placed on it by the engine
    limb(ctx, [[112, 156], [58, 206], [34, 168]], 36, shirt);
    ell(ctx, 32, 156, 16, 13, SKIN.c);
    ell(ctx, 30, 144, 74, 13, '#8f979b'); // tray
    ell(ctx, 30, 139, 74, 7, '#b9c0c3'); // tray rim highlight
  }
  limb(ctx, [[92, 346], [104, 136]], 6, rim, 0.6);
}

/** 4.5 storekeeper holding a tablet (the tablet UI is DOM), facing the bins on the left. */
function keeper(ctx) {
  ground(ctx, 150, 552, 105);
  const shirt = '#c9d2c4';
  const apron = '#6d5a44';
  const rim = '#ffcf8a';
  limb(ctx, [[128, 340], [120, 540]], 50, '#2b2723');
  limb(ctx, [[176, 340], [184, 540]], 50, '#24211d');
  ell(ctx, 114, 548, 30, 11, '#171412');
  ell(ctx, 190, 548, 30, 11, '#171412');
  poly(ctx, [[96, 150], [206, 156], [224, 360], [86, 356]], shirt);
  poly(ctx, [[104, 220], [200, 222], [216, 420], [94, 416]], apron);
  head(ctx, 146, 96, 38, -1, SKIN.b, '#2a2019', rim);
  poly(ctx, [[108, 78], [186, 74], [180, 50], [118, 52]], '#8a3d2c'); // beanie
  ell(ctx, 148, 56, 42, 22, '#8a3d2c');
  limb(ctx, [[104, 176], [86, 252], [70, 236]], 34, shirt);
  limb(ctx, [[196, 180], [158, 262], [84, 250]], 34, '#b3bcae');
  ell(ctx, 70, 236, 13, 11, SKIN.b);
  limb(ctx, [[86, 356], [96, 150]], 6, rim, 0.6);
}

/** 4.6 manager seated at the desk, 3/4 back view, facing the monitor on the right. */
function manager(ctx, lean) {
  const chair = '#232327';
  const blazer = '#3c3a48';
  const rim = '#ffc98f';
  poly(ctx, [[60, 150], [140, 138], [152, 362], [70, 372]], chair);
  poly(ctx, [[70, 360], [272, 350], [272, 392], [70, 402]], chair);
  limb(ctx, [[172, 400], [172, 476]], 18, chair);
  limb(ctx, [[92, 506], [252, 506]], 14, chair);
  for (const x of [98, 172, 246]) ell(ctx, x, 512, 11, 9, '#111');
  limb(ctx, [[184, 362], [302, 360]], 58, '#26242a');
  limb(ctx, [[302, 362], [312, 496]], 46, '#26242a');
  ell(ctx, 330, 504, 38, 12, '#161416');
  if (lean) {
    poly(ctx, [[162, 176], [262, 190], [258, 372], [140, 372]], blazer);
    head(ctx, 262, 122, 40, 1, SKIN.a, '#4a3a2e', rim);
    limb(ctx, [[248, 196], [326, 272], [396, 292]], 38, blazer);
    ell(ctx, 402, 292, 15, 12, SKIN.a);
    limb(ctx, [[166, 206], [232, 296], [346, 314]], 36, '#2c2a36');
  } else {
    poly(ctx, [[130, 160], [236, 166], [252, 362], [140, 366]], blazer);
    head(ctx, 212, 100, 40, 1, SKIN.a, '#4a3a2e', rim);
    limb(ctx, [[226, 186], [300, 272], [362, 300]], 38, blazer);
    ell(ctx, 368, 302, 15, 12, SKIN.a);
    limb(ctx, [[150, 192], [212, 288], [330, 312]], 36, '#2c2a36');
  }
  poly(ctx, [[196, 160], [226, 162], [220, 200]], '#e9e4da');
  limb(ctx, [[140, 366], [130, 160]], 6, rim, 0.5);
}

// ── devices (bodies only; screens are DOM) ─────────────────────────────────────
const SPRITES = {
  'guest-rest': [380, 560, (ctx) => guest(ctx, false)],
  'guest-reach': [380, 560, (ctx) => guest(ctx, true)],
  'chef-work': [340, 470, (ctx) => chef(ctx, 'work')],
  'chef-look': [340, 470, (ctx) => chef(ctx, 'look')],
  'chef-pass': [340, 470, (ctx) => chef(ctx, 'pass')],
  'cashier-idle': [320, 380, (ctx) => cashier(ctx, false)],
  'cashier-hand': [320, 380, (ctx) => cashier(ctx, true)],
  'payer-down': [300, 560, (ctx) => payer(ctx, false)],
  'payer-up': [300, 560, (ctx) => payer(ctx, true)],
  keeper: [300, 560, keeper],
  'waiter-idle': [300, 560, (ctx) => waiter(ctx, 'idle')],
  'waiter-walk-a': [300, 560, (ctx) => waiter(ctx, 'walk-a')],
  'waiter-walk-b': [300, 560, (ctx) => waiter(ctx, 'walk-b')],
  'manager-idle': [420, 520, (ctx) => manager(ctx, false)],
  'manager-lean': [420, 520, (ctx) => manager(ctx, true)],

  printer: [220, 150, (ctx) => {
    rrect(ctx, 10, 42, 210, 140, 12, '#34383b');
    poly(ctx, [[22, 42], [198, 42], [186, 20], [34, 20]], '#4c5256');
    rrect(ctx, 56, 26, 164, 36, 3, '#15181a');
    rrect(ctx, 26, 70, 150, 118, 6, '#2a2d30');
    rrect(ctx, 20, 132, 200, 140, 3, '#1c1e20');
    limb(ctx, [[22, 44], [198, 44]], 3, 'rgba(255,255,255,0.35)');
  }, DEVICE],
  kds: [640, 390, (ctx) => {
    rrect(ctx, 0, 0, 640, 390, 16, '#1b1f22');
    rrect(ctx, 18, 18, 622, 372, 6, '#0f1f22');
    vgrad(ctx, 18, 18, 622, 90, [[0, 'rgba(255,255,255,0.08)'], [1, 'rgba(255,255,255,0)']]);
    limb(ctx, [[8, 8], [632, 8]], 3, 'rgba(255,255,255,0.25)');
  }, DEVICE],
  pos: [260, 230, (ctx) => {
    rrect(ctx, 44, 172, 216, 226, 10, '#34383b');
    limb(ctx, [[130, 120], [130, 176]], 26, '#26292b');
    poly(ctx, [[18, 22], [242, 6], [238, 136], [24, 150]], '#202427');
    poly(ctx, [[32, 32], [228, 18], [224, 126], [36, 138]], '#10262a');
    limb(ctx, [[20, 24], [240, 8]], 3, 'rgba(255,255,255,0.3)');
    rrect(ctx, 188, 150, 246, 182, 4, '#23272a'); // receipt printer head
    rrect(ctx, 196, 150, 238, 156, 2, '#0e1011');
  }, DEVICE],
  reader: [110, 170, (ctx) => {
    rrect(ctx, 30, 138, 80, 170, 6, '#2b2f33');
    rrect(ctx, 16, 8, 94, 150, 12, '#2b2f33');
    rrect(ctx, 26, 22, 84, 70, 4, '#10262a');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) rrect(ctx, 30 + c * 18, 84 + r * 18, 42 + c * 18, 96 + r * 18, 3, '#4a4f54');
  }, DEVICE],
  monitor: [680, 520, (ctx) => {
    rrect(ctx, 30, 10, 650, 390, 12, '#1d2023');
    rrect(ctx, 40, 20, 640, 380, 4, '#0e1c20');
    vgrad(ctx, 40, 20, 640, 90, [[0, 'rgba(255,255,255,0.07)'], [1, 'rgba(255,255,255,0)']]);
    poly(ctx, [[312, 390], [368, 390], [376, 470], [304, 470]], '#2a2d30');
    ell(ctx, 340, 482, 130, 18, '#202326');
  }, DEVICE],
  tablet: [150, 210, (ctx) => {
    rrect(ctx, 0, 0, 150, 210, 14, '#1c1f22');
    rrect(ctx, 10, 12, 140, 198, 6, '#10262a');
  }, DEVICE],

  // ── ambient elements ───────────────────────────────────────────────────────────
  pendant: [140, 440, (ctx) => {
    limb(ctx, [[70, 0], [70, 340]], 5, '#2a2420');
    poly(ctx, [[18, 402], [122, 402], [98, 340], [42, 340]], '#2f4a3e');
    ell(ctx, 70, 404, 50, 8, '#ffe2a8');
  }, DEVICE],
  bulb: [80, 380, (ctx) => {
    limb(ctx, [[40, 0], [40, 330]], 4, '#241c16');
    rrect(ctx, 30, 322, 50, 346, 3, '#3a2e24');
    ell(ctx, 40, 360, 20, 24, '#fff1c8');
  }, DEVICE],
  'cloud-a': [1000, 260, (ctx, rand) => {
    for (let i = 0; i < 9; i++) blob(ctx, 160 + i * 90, 150 + (rand() - 0.5) * 50, 150, 55, i % 2 ? '#e39a86' : '#c97b8e', rand, 5, 0.75);
  }, [{ r: 10, step: 8, len: [20, 50], alpha: 0.6, hueJ: 6, satJ: 0.05, lumJ: 0.05, taper: 0.6 }]],
  'cloud-b': [760, 200, (ctx, rand) => {
    for (let i = 0; i < 7; i++) blob(ctx, 120 + i * 88, 110 + (rand() - 0.5) * 40, 120, 44, i % 2 ? '#f1b68a' : '#d98c86', rand, 5, 0.7);
  }, [{ r: 10, step: 8, len: [20, 50], alpha: 0.6, hueJ: 6, satJ: 0.05, lumJ: 0.05, taper: 0.6 }]],

  // ── foreground parallax layers (dark, rim-lit) ──────────────────────────────────
  'fg-hatch': [420, 1900, (ctx) => {
    vgrad(ctx, 90, 0, 330, 1900, [[0, '#241a14'], [1, '#1a130f']]);
    limb(ctx, [[330, 0], [330, 1900]], 8, 'rgba(255,196,130,0.55)');
    poly(ctx, [[60, 760], [360, 760], [360, 790], [60, 790]], '#3a2a20');
    for (const [x, h] of [[120, 120], [190, 90], [260, 140]]) limb(ctx, [[x, 790], [x, 790 + h]], 10, '#2b1f18');
    ell(ctx, 260, 950, 54, 30, '#3b2a1f');
  }, DARK],
  'fg-rail': [1600, 300, (ctx) => {
    limb(ctx, [[0, 40], [1600, 40]], 14, '#1e1814');
    for (let i = 0; i < 9; i++) {
      const x = 90 + i * 175;
      limb(ctx, [[x, 40], [x, 150 + (i % 3) * 30]], 8, '#231c17');
      if (i % 2) ell(ctx, x, 190 + (i % 3) * 30, 44, 44, '#2a211b');
      else ell(ctx, x, 168 + (i % 3) * 30, 20, 12, '#2a211b');
      limb(ctx, [[x + 8, 44], [x + 8, 140 + (i % 3) * 30]], 3, 'rgba(255,190,120,0.5)');
    }
  }, DARK],
  'fg-stools': [1000, 360, (ctx) => {
    for (const x of [220, 700]) {
      ell(ctx, x, 60, 110, 26, '#231a14');
      limb(ctx, [[x - 60, 70], [x - 90, 360]], 16, '#1d1611');
      limb(ctx, [[x + 60, 70], [x + 90, 360]], 16, '#1d1611');
      limb(ctx, [[x - 80, 220], [x + 80, 220]], 10, '#1d1611');
      limb(ctx, [[x - 100, 52], [x + 100, 52]], 4, 'rgba(255,200,140,0.45)');
    }
  }, DARK],
  'fg-slab': [3000, 240, (ctx) => {
    vgrad(ctx, 0, 0, 3000, 240, [[0, '#2e241d'], [1, '#1d1712']]);
    limb(ctx, [[0, 6], [3000, 6]], 8, 'rgba(255,200,150,0.35)');
    for (const y of [70, 150]) limb(ctx, [[0, y], [3000, y]], 30, '#14100d');
    for (let x = 200; x < 3000; x += 420) rrect(ctx, x, 50, x + 40, 180, 6, '#3a2e25');
  }, DARK],
  'fg-crates': [700, 520, (ctx, rand) => {
    rrect(ctx, 20, 220, 360, 520, 6, '#2a1d15');
    rrect(ctx, 300, 300, 680, 520, 6, '#231812');
    for (const [x, y] of [[40, 240], [320, 320]]) for (let i = 0; i < 3; i++) limb(ctx, [[x, y + 40 + i * 70], [x + 320, y + 40 + i * 70]], 8, '#3a2a1e');
    blob(ctx, 170, 180, 120, 90, '#33261c', rand, 5, 1);
    limb(ctx, [[22, 222], [358, 222]], 5, 'rgba(255,190,120,0.5)');
  }, DARK],
  // Phase 4.8: a dining chair the tracking camera passes during the waiter's walk
  'fg-chair': [520, 700, (ctx) => {
    rrect(ctx, 90, 40, 430, 90, 14, '#221812');
    for (const x of [110, 410]) limb(ctx, [[x, 60], [x - 10, 700]], 26, '#1d1510');
    for (const y of [160, 280]) limb(ctx, [[110, y], [410, y]], 14, '#241a13');
    rrect(ctx, 40, 400, 480, 460, 12, '#2a1e16');
    for (const x of [70, 450]) limb(ctx, [[x, 460], [x + (x < 200 ? -20 : 20), 700]], 24, '#1d1510');
    limb(ctx, [[92, 44], [428, 44]], 5, 'rgba(255,196,130,0.5)');
    limb(ctx, [[44, 402], [476, 402]], 5, 'rgba(255,196,130,0.45)');
  }, DARK],
  // Phase 4.8: the near edge of the counter in the three-quarter cashier shot (a bell, a cup, a menu stand)
  'fg-counter': [1400, 340, (ctx) => {
    rrect(ctx, 0, 90, 1400, 340, 10, '#1f1510');
    limb(ctx, [[0, 94], [1400, 94]], 8, 'rgba(230,175,100,0.6)');
    ell(ctx, 300, 70, 70, 24, '#2a1d15');
    ell(ctx, 300, 40, 44, 34, '#3a2a1e');
    limb(ctx, [[300, 8], [300, 22]], 8, '#3a2a1e');
    rrect(ctx, 820, 10, 900, 92, 8, '#2b1e16');
    ell(ctx, 1120, 70, 60, 20, '#2a1d15');
    rrect(ctx, 1080, 10, 1160, 72, 10, '#33251b');
    limb(ctx, [[1084, 14], [1156, 14]], 4, 'rgba(255,200,140,0.45)');
  }, DARK],
  'fg-plant': [560, 760, (ctx, rand) => {
    rrect(ctx, 180, 560, 380, 760, 18, '#2b1d15');
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (rand() - 0.5) * 2.6;
      const r = 200 + rand() * 250;
      const x = 280 + Math.cos(a) * r;
      const y = 560 + Math.sin(a) * r;
      limb(ctx, [[280, 560], [(280 + x) / 2, (560 + y) / 2 - 30], [x, y]], 12, '#16261b');
      ell(ctx, x, y, 60, 22, '#1c3324', a);
    }
  }, DARK],
};

for (const [name, [w, h, draw, passes]] of Object.entries(SPRITES)) {
  if (only.length && !only.includes(name)) continue;
  const t = Date.now();
  await sprite(name, w, h, draw, { passes: passes ?? FIG, seed: name.length * 7 + 3 });
  console.log(`  ${name} ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
