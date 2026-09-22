// Chapter 5 sprites (Phase 5): the Kerinti team, gestural and faceless, in the same brush language as the
// Chapter 4 figures (scripts/art/chapter4-sprites.mjs) — but lit by the night: a cool cream rim from the
// window and the screens, a little warmth from the pendant lamps.
//
// Each figure is seen from behind the desk, so the sprite is cut at desk height (like Chapter 4's cashier
// and chef): its bottom edge sits on the desk top (geometry.json → studio.desk). These are placeholders for
// real team photography later: keep the anchors (bottom centre on the desk line) and sizes.
//
// Usage: node scripts/art/chapter5-sprites.mjs [name…]

import path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { Plate, mulberry32, paintStrokes, poly } from './engine.mjs';
import { writeFile } from './engine.mjs';

const OUT = path.resolve('public/prototype-assets/05-kerinti/sprites');
const only = process.argv.slice(2);

const FIG = [
  { r: 5, step: 4, len: [7, 16], alpha: 0.82, hueJ: 6, satJ: 0.06, lumJ: 0.07, taper: 0.5 },
  { r: 2.4, step: 2.2, len: [4, 9], alpha: 0.8, thresh: 18, texture: () => 0.2, hueJ: 5, satJ: 0.05, lumJ: 0.06, impasto: 0.5 },
];

async function sprite(name, w, h, draw, { k = 1.5, seed = 5 } = {}) {
  const p = new Plate({ name, x: 0, y: 0, w, h, k });
  const guide = p.canvas();
  draw(p.designCtx(guide));
  const painted = paintStrokes(p, guide, { field: () => -1.2, passes: FIG, edgeFollow: () => 0.95, jitter: () => 1, impastoMap: () => 0.35, seed });
  const mask = createCanvas(p.pw, p.ph);
  const m = mask.getContext('2d');
  for (const [dx, dy] of [[0, 0], [1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]]) m.drawImage(guide, dx, dy);
  const c = painted.getContext('2d');
  c.globalCompositeOperation = 'destination-in';
  c.drawImage(mask, 0, 0);
  await writeFile(path.join(OUT, `${name}.webp`), await painted.encode('webp', 88));
}

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
const ell = (ctx, x, y, rx, ry, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
};
/** head seen 3/4 from behind: hair on the back side, a sliver of face toward `dir` (−1 left, 1 right) */
const head = (ctx, x, y, r, dir, skin, hair, rim) => {
  ell(ctx, x, y, r * 0.9, r * 1.1, skin);
  ell(ctx, x - dir * r * 0.28, y - r * 0.22, r * 0.95, r * 1.0, hair);
  ell(ctx, x + dir * r * 0.45, y + r * 0.12, r * 0.42, r * 0.72, skin);
  limb(ctx, [[x + dir * r * 0.2, y - r * 1.05], [x + dir * r * 0.85, y - r * 0.4], [x + dir * r * 0.88, y + r * 0.4]], r * 0.14, rim, 0.85);
};

const RIM = '#e6eefa'; // the screens' cool cream light
const SKIN = { a: '#b98464', b: '#9c6a4e', c: '#c49070' };

/** e1 — seated, working at the left monitor, turned right (toward it). 300 × 360, cut at the desk. */
function seatedRight(ctx) {
  const sweater = '#2a3a63';
  const shade = '#1c2849';
  poly(ctx, [[96, 150], [212, 146], [236, 360], [70, 360]], sweater);
  poly(ctx, [[176, 150], [212, 146], [236, 360], [190, 360]], shade);
  limb(ctx, [[150, 116], [154, 150]], 26, SKIN.b);
  head(ctx, 152, 86, 40, 1, SKIN.b, '#1b1512', RIM);
  limb(ctx, [[206, 176], [252, 272], [296, 330]], 38, sweater); // forearm reaching for the keyboard
  limb(ctx, [[98, 176], [110, 290], [150, 344]], 38, shade);
  limb(ctx, [[212, 148], [236, 356]], 6, RIM, 0.65);
}

/** e2 — standing behind the desk between the screens, pointing at one: the collaborator. 300 × 520. */
function standingPoint(ctx) {
  const shirt = '#d9dde6';
  const shade = '#aeb6c6';
  const jacket = '#233152';
  poly(ctx, [[98, 168], [206, 164], [226, 520], [78, 520]], jacket);
  poly(ctx, [[134, 170], [172, 168], [178, 520], [128, 520]], shirt);
  poly(ctx, [[154, 170], [172, 168], [178, 520], [158, 520]], shade);
  limb(ctx, [[150, 128], [152, 168]], 26, SKIN.a);
  head(ctx, 150, 94, 40, -1, SKIN.a, '#3a2a20', RIM);
  limb(ctx, [[104, 190], [60, 290], [22, 330]], 36, jacket); // pointing at the screen on the left
  ell(ctx, 20, 332, 13, 10, SKIN.a);
  limb(ctx, [[204, 192], [220, 320], [206, 420]], 36, '#1a2644');
  limb(ctx, [[98, 170], [78, 518]], 6, RIM, 0.6);
}

/** e3 — seated at the right monitor, turned left toward the others, listening. 300 × 360. */
function seatedLeft(ctx) {
  const top = '#5a4a3a';
  const shade = '#3e3328';
  poly(ctx, [[88, 150], [204, 154], [230, 360], [64, 360]], top);
  poly(ctx, [[88, 150], [124, 152], [110, 360], [64, 360]], shade);
  limb(ctx, [[146, 116], [148, 152]], 26, SKIN.c);
  head(ctx, 146, 84, 40, -1, SKIN.c, '#2a1c14', RIM);
  limb(ctx, [[94, 176], [46, 270], [8, 318]], 38, top);
  limb(ctx, [[200, 178], [214, 290], [180, 346]], 38, shade);
  limb(ctx, [[88, 152], [64, 356]], 6, RIM, 0.65);
}

const SPRITES = {
  'engineer-a': () => sprite('engineer-a', 300, 360, seatedRight, { seed: 11 }),
  'engineer-b': () => sprite('engineer-b', 300, 520, standingPoint, { seed: 12 }),
  'engineer-c': () => sprite('engineer-c', 300, 360, seatedLeft, { seed: 13 }),
};

for (const [name, fn] of Object.entries(SPRITES)) {
  if (only.length && !only.includes(name)) continue;
  await fn();
  console.log(`  ${name}`);
}
void mulberry32;
