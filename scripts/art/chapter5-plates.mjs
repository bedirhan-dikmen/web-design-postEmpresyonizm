// Chapter 5 placeholder plates — the Kerinti night (Phase 5).
//
// The film returns to World A's language without leaving World B's space: these plates sit above and to the
// right of the Chapter 4 restaurant, so the camera can travel to them. The palette, the ribbon-and-swirl sky
// and the lit-window rooftops are the recipes of Chapter 1's sky.webp / horizon.webp
// (scripts/paint-prototype-assets.mjs), re-used at this scale:
//
//   sky     the Kerinti night. Its big swirl is centred on the final QR, exactly as Chapter 1's swirl was
//           centred on the portal finder — the site ends where it began.
//   city    the night city beside the restaurant and the Kerinti tower, with its cut-away studio floor.
//   studio  the studio floor itself (company + team scenes): window band, collaborative desk, whiteboard
//           sketches, systems display, rack. Screens stay dark here; their content is DOM (Chapter5Layers.tsx).
//
// All coordinates come from lib/prototype/chapter5/geometry.json. Usage: node scripts/art/chapter5-plates.mjs [name…]

import path from 'node:path';
import G from '../../lib/prototype/chapter5/geometry.json' with { type: 'json' };
import { Plate, blendAngles, blob, canvasTooth, hgrad, mulberry32, paintStrokes, poly, radial, vgrad, writeFile } from './engine.mjs';

const OUT = path.resolve('public/prototype-assets/05-kerinti');
const only = process.argv.slice(2);

const PASSES = [
  { r: 15, step: 12, len: [26, 70], alpha: 0.86, hueJ: 6, satJ: 0.06, lumJ: 0.06, taper: 0.4 },
  { r: 7, step: 6, len: [12, 30], alpha: 0.85, thresh: 22, texture: () => 0.14, hueJ: 5, satJ: 0.05, lumJ: 0.05, impasto: 0.6 },
];
const SOFT = [
  { r: 22, step: 16, len: [40, 110], alpha: 0.8, hueJ: 5, satJ: 0.05, lumJ: 0.05, taper: 0.4 },
  { r: 10, step: 8, len: [18, 44], alpha: 0.7, thresh: 14, texture: () => 0.1, hueJ: 4, satJ: 0.04, lumJ: 0.04 },
];

const plateOf = (name) => {
  const { rect, k } = G.plates[name];
  const [x, y, w, h] = rect;
  return new Plate({ name, x, y, w, h, k });
};

async function brush(plate, drawGuide, { passes = PASSES, field = () => -0.85, alpha = null, quality = 84, edgeFollow = 0.85 } = {}) {
  const guide = plate.canvas();
  drawGuide(plate.designCtx(guide));
  const painted = paintStrokes(plate, guide, { field, passes, edgeFollow: () => edgeFollow, jitter: () => 1, impastoMap: () => 0.5, seed: 29 });
  canvasTooth(painted, 0.03);
  if (alpha) alpha(painted);
  await writeFile(path.join(OUT, `${plate.name}.webp`), await painted.encode('webp', quality));
}

/** fade the plate's alpha to 0 along one edge over `d` design units */
const fadeEdge = (plate, side, d) => (canvas) => {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  const px = d * plate.k;
  const g =
    side === 'bottom' ? ctx.createLinearGradient(0, plate.ph - px, 0, plate.ph)
    : side === 'top' ? ctx.createLinearGradient(0, px, 0, 0)
    : ctx.createLinearGradient(px, 0, 0, 0);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, plate.pw, plate.ph);
  ctx.restore();
};
const chain = (...fns) => (canvas) => fns.forEach((fn) => fn(canvas));

const rect = (ctx, x0, y0, x1, y1, fill) => {
  ctx.fillStyle = fill;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
};
function swirl(x, y, cx, cy, R, w, inward = 0.2) {
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.hypot(dx, dy);
  return [Math.atan2(dy, dx) + Math.PI / 2 + inward, w * Math.exp(-((d / R) ** 2))];
}
function ribbon(ctx, field, x, y, steps, stepLen, width, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  let prev = field(x, y);
  for (let i = 0; i < steps; i++) {
    let a = field(x, y);
    if (Math.cos(a - prev) < 0) a += Math.PI;
    prev = a;
    x += Math.cos(a) * stepLen;
    y += Math.sin(a) * stepLen;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}
/** a tower silhouette with a sparse grid of lit windows (Chapter 1's rooftops, grown up) */
function towerBlock(ctx, rand, x0, x1, top, base, body, lit = 0.22) {
  rect(ctx, x0, top, x1, base, body);
  rect(ctx, x0, top, x1, top + 8, 'rgba(156,199,224,0.18)');
  for (let y = top + 90; y < base - 120; y += 150)
    for (let x = x0 + 50; x < x1 - 70; x += 120) {
      const r = rand();
      if (r < lit) rect(ctx, x, y, x + 46, y + 64, r < lit * 0.72 ? 'rgba(232,198,106,0.85)' : 'rgba(255,241,207,0.7)');
      else rect(ctx, x, y, x + 46, y + 64, 'rgba(8,18,44,0.55)');
    }
}

// the Kerinti night palette (Chapter 1: scripts/paint-prototype-assets.mjs → sky / horizon)
const NIGHT = { top: '#040a1c', high: '#0a1a3c', mid: '#13295a', glow: '#1f3a6e', low: '#15264d', hill: '#10244d', ridge: '#08142e' };
const RIBBONS = ['rgba(42,75,155,0.45)', 'rgba(111,147,201,0.26)', 'rgba(20,45,100,0.5)', 'rgba(156,199,224,0.14)'];

const PLATES = {
  /** the Kerinti night sky over the whole city; its swirl turns around the final QR */
  async sky() {
    const p = plateOf('sky');
    const [qx, qy] = G.qr.center;
    const field = (x, y) =>
      blendAngles([
        [-0.05 + 0.28 * Math.sin(x / 1900 + Math.sin(y / 1100) * 1.2) + 0.1 * Math.sin(y / 600 + x / 4200), 1],
        swirl(x, y, qx, qy, 2300, 0.6, 1.05),
        swirl(x, y, 4200, -8200, 1500, 0.3, 0.9),
        swirl(x, y, 9000, -10400, 1300, 0.22, 0.9),
      ]);
    await brush(p, (ctx) => {
      const rand = mulberry32(51);
      vgrad(ctx, p.x, p.y, p.x + p.w, p.y + p.h, [[0, NIGHT.top], [0.22, NIGHT.high], [0.46, NIGHT.mid], [0.64, NIGHT.glow], [1, '#1a2f5c']]);
      for (let i = 0; i < 70; i++) ribbon(ctx, field, p.x + rand() * p.w, p.y + rand() * p.h * 0.9, 90, 80, 90 + rand() * 260, RIBBONS[i % 4]);
      // a soft glow held behind the final QR, and low mist over the city
      radial(ctx, qx, qy, 1500, [[0, 'rgba(111,147,201,0.22)'], [1, 'rgba(111,147,201,0)']]);
      radial(ctx, 9000, -4900, 5200, [[0, 'rgba(111,147,201,0.22)'], [1, 'rgba(111,147,201,0)']], 1, 0.35);
      for (let i = 0; i < 46; i++) {
        const x = p.x + rand() * p.w;
        const y = p.y + rand() * (p.h - 3200);
        const r = 30 + rand() * 60;
        radial(ctx, x, y, r, [[0, 'rgba(234,240,247,0.9)'], [0.18, 'rgba(156,199,224,0.55)'], [1, 'rgba(156,199,224,0)']]);
      }
    }, { passes: SOFT, field, edgeFollow: 0.35, alpha: fadeEdge(p, 'bottom', 250) });
  },

  /** the night city beside the restaurant, and the Kerinti tower with its cut-away studio floor */
  async city() {
    const p = plateOf('city');
    const T = G.tower;
    const S = G.studio;
    // what stays opaque: every building, and the sky below y −2450 (softly), so the sky plate carries on above
    const silhouette = (canvas) => {
      const m = p.canvas();
      const c = p.designCtx(m);
      const g = c.createLinearGradient(0, -2450, 0, -2200);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(255,255,255,1)');
      c.fillStyle = g;
      c.fillRect(p.x, -2450, p.w, p.y + p.h + 2450);
      c.fillStyle = '#fff';
      for (const [x0, x1, top] of [...T.neighbours, [T.x[0], T.x[1], T.top - 170]]) c.fillRect(x0 - 10, top - 10, x1 - x0 + 20, 900 - top);
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(m, 0, 0);
      ctx.restore();
    };
    await brush(p, (ctx) => {
      const rand = mulberry32(61);
      // sky continuing the sky plate's lowest band, then the ground
      vgrad(ctx, p.x, p.y, p.x + p.w, 840, [[0, '#1a2f5c'], [0.47, '#1a2f5c'], [1, '#22386a']]);
      radial(ctx, 15000, 200, 3600, [[0, 'rgba(111,147,201,0.2)'], [1, 'rgba(111,147,201,0)']], 1, 0.4);
      // far skyline: Chapter 1's hills and rooftops, grown into a city
      const far = [[p.x, 840]];
      for (let x = p.x; x <= p.x + p.w; x += 90) far.push([x, -900 + Math.sin(x / 800) * 160 + Math.sin(x / 230) * 40 - (rand() < 0.3 ? rand() * 700 : 0)]);
      far.push([p.x + p.w, 840]);
      poly(ctx, far, NIGHT.hill);
      for (let x = p.x + 60; x < p.x + p.w; x += 70 + rand() * 90) if (rand() < 0.4) rect(ctx, x, -700 + rand() * 1300, x + 22, -670 + rand() * 1300, rand() < 0.7 ? 'rgba(232,198,106,0.7)' : 'rgba(224,120,74,0.6)');
      for (const [x0, x1, top] of T.neighbours) towerBlock(ctx, rand, x0, x1, top, 840, '#0d1936', 0.24);
      // the Kerinti tower
      const [tx0, tx1] = T.x;
      towerBlock(ctx, rand, tx0, tx1, T.top, 840, '#101c3a', 0.3);
      // floor slabs, and the crown with its sign band
      for (const y of T.floors) { rect(ctx, tx0, y - 14, tx1, y + 14, '#1c2a4e'); rect(ctx, tx0, y - 14, tx1, y - 10, 'rgba(156,199,224,0.25)'); }
      rect(ctx, tx0 + 300, T.top - 160, tx1 - 300, T.top, '#0b1531');
      rect(ctx, T.sign[0] - 900, T.sign[1] - 130, T.sign[0] + 900, T.sign[1] + 130, '#0a1330');
      radial(ctx, T.sign[0], T.sign[1], 1100, [[0, 'rgba(232,198,106,0.2)'], [1, 'rgba(232,198,106,0)']], 1, 0.5);
      // the studio floor is cut away: its section edges, and a warm spill onto the slabs above and below
      rect(ctx, tx0, S.ceiling, tx1, S.floor + 80, '#070e22');
      radial(ctx, (tx0 + tx1) / 2, (S.ceiling + S.floor) / 2, 2200, [[0, 'rgba(232,198,106,0.12)'], [1, 'rgba(232,198,106,0)']], 1, 0.45);
      // street, kerb, lamps and earth
      vgrad(ctx, p.x, 840, p.x + p.w, 1290, [[0, '#1c2440'], [1, '#141a30']]);
      rect(ctx, p.x, 1290, p.x + p.w, 1330, '#0a0f20');
      vgrad(ctx, p.x, 1330, p.x + p.w, p.y + p.h, [[0, '#0d1428'], [1, '#060a16']]);
      for (let x = p.x + 400; x < p.x + p.w; x += 1100) {
        rect(ctx, x - 8, 380, x + 8, 840, '#0a0f20');
        radial(ctx, x, 380, 220, [[0, 'rgba(255,214,150,0.6)'], [1, 'rgba(255,214,150,0)']]);
        radial(ctx, x, 860, 420, [[0, 'rgba(232,198,106,0.18)'], [1, 'rgba(232,198,106,0)']], 1, 0.3);
      }
    }, { passes: PASSES, alpha: chain(silhouette, fadeEdge(p, 'left', 520)) });
  },

  /** the Kerinti studio: product, engineering and systems in one room, at night */
  async studio() {
    const p = plateOf('studio');
    const S = G.studio;
    await brush(p, (ctx) => {
      const rand = mulberry32(71);
      // back wall: deep midnight, a line of restrained gold under the ceiling
      vgrad(ctx, p.x, S.ceiling, p.x + p.w, S.floor, [[0, '#0a1430'], [0.6, '#0f1d3f'], [1, '#0c1733']]);
      rect(ctx, p.x, S.ceiling, p.x + p.w, S.ceiling + 60, '#060c1f');
      rect(ctx, p.x, S.ceiling + 60, p.x + p.w, S.ceiling + 66, 'rgba(201,160,90,0.55)');
      // the window band: the night city the team looks out on
      const [w0, w1, w2, w3] = S.window;
      rect(ctx, w0 - 20, w1 - 20, w2 + 20, w3 + 24, '#050a1a');
      vgrad(ctx, w0, w1, w2, w3, [[0, '#0b1a3e'], [0.7, '#1a3060'], [1, '#26407a']]);
      const sky = [[w0, w3]];
      for (let x = w0; x <= w2; x += 40) sky.push([x, w3 - 120 - rand() * 260 * (rand() < 0.5 ? 1 : 0.35)]);
      sky.push([w2, w3]);
      poly(ctx, sky, '#08142e');
      for (let i = 0; i < 70; i++) {
        const x = w0 + rand() * (w2 - w0);
        const y = w3 - 40 - rand() * 300;
        rect(ctx, x, y, x + 12, y + 16, rand() < 0.7 ? 'rgba(232,198,106,0.85)' : 'rgba(255,241,207,0.75)');
      }
      for (let x = w0 + 400; x < w2; x += 400) rect(ctx, x - 8, w1, x + 8, w3, '#050a1a');
      // pendant lamps over the desk: warm, restrained, the only warm light in the room
      for (const x of S.lamps) {
        rect(ctx, x - 3, S.ceiling + 60, x + 3, -1760, '#05091a');
        poly(ctx, [[x - 60, -1700], [x + 60, -1700], [x + 26, -1760], [x - 26, -1760]], '#1e2433');
        rect(ctx, x - 56, -1706, x + 56, -1698, '#f0cf8a');
        radial(ctx, x, -1380, 380, [[0, 'rgba(240,200,130,0.32)'], [1, 'rgba(240,200,130,0)']], 1, 0.6);
      }
      // the collaborative desk: dark walnut with a brass edge (the restaurant's own materials, at night)
      const [d0, d1, dy] = S.desk;
      rect(ctx, d0, dy, d1, dy + 34, '#2a1c14');
      rect(ctx, d0, dy, d1, dy + 6, '#b98a4e');
      vgrad(ctx, d0 + 20, dy + 34, d1 - 20, S.floor, [[0, '#1c1410'], [1, '#110c0a']]);
      for (let x = d0 + 60; x < d1 - 60; x += 250) rect(ctx, x, dy + 60, x + 210, S.floor - 30, 'rgba(255,220,170,0.04)');
      // laptop, notebook and cups on the desk
      rect(ctx, 14180, dy - 16, 14300, dy, '#1c2233');
      rect(ctx, 14610, dy - 8, 14740, dy, '#e6dfcf');
      radial(ctx, 15090, dy - 14, 20, [[0, '#eee6d4'], [1, 'rgba(0,0,0,0)']]);
      // the whiteboard: product sketches — a phone menu, a kitchen screen, arrows, sticky squares
      const [b0, b1, b2, b3] = S.whiteboard;
      rect(ctx, b0 - 14, b1 - 14, b2 + 14, b3 + 14, '#1b2338');
      vgrad(ctx, b0, b1, b2, b3, [[0, '#b9c0cf'], [1, '#a7afc0']]);
      ctx.strokeStyle = 'rgba(31,50,99,0.85)';
      ctx.lineWidth = 6;
      ctx.strokeRect(b0 + 50, b1 + 60, 130, 250);
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(b0 + 70, b1 + 100 + i * 38); ctx.lineTo(b0 + 160, b1 + 100 + i * 38); ctx.stroke(); }
      ctx.strokeRect(b0 + 300, b1 + 90, 320, 180);
      for (let i = 0; i < 3; i++) ctx.strokeRect(b0 + 322 + i * 100, b1 + 120, 78, 120);
      ctx.beginPath(); ctx.moveTo(b0 + 190, b1 + 180); ctx.lineTo(b0 + 290, b1 + 180); ctx.moveTo(b0 + 270, b1 + 164); ctx.lineTo(b0 + 290, b1 + 180); ctx.lineTo(b0 + 270, b1 + 196); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,100,59,0.8)';
      ctx.beginPath(); ctx.moveTo(b0 + 60, b1 + 420); ctx.bezierCurveTo(b0 + 200, b1 + 360, b0 + 380, b1 + 480, b0 + 600, b1 + 400); ctx.stroke();
      for (const [x, y, c] of [[b0 + 420, b1 + 330, '#e8c66a'], [b0 + 500, b1 + 330, '#e8c66a'], [b0 + 580, b1 + 330, '#fff1cf'], [b0 + 90, b1 + 470, '#e8c66a']]) rect(ctx, x, y, x + 58, y + 58, c);
      // the systems wall display (content is DOM) and a small rack with its status lights
      const [s0, s1, s2, s3] = S.display;
      rect(ctx, s0 - 16, s1 - 16, s2 + 16, s3 + 16, '#05080f');
      rect(ctx, s0, s1, s2, s3, '#0a1122');
      radial(ctx, (s0 + s2) / 2, (s1 + s3) / 2, 520, [[0, 'rgba(120,170,230,0.18)'], [1, 'rgba(120,170,230,0)']]);
      const [r0, r1, r2, r3] = S.rack;
      rect(ctx, r0, r1, r2, r3, '#0b101d');
      for (let y = r1 + 30; y < r3 - 20; y += 44) { rect(ctx, r0 + 12, y, r2 - 12, y + 30, '#141b2c'); rect(ctx, r0 + 20, y + 11, r0 + 28, y + 19, rand() < 0.6 ? '#7dffb0' : '#e8c66a'); }
      // plants at both ends, a shelf of binders and models above the rack
      for (const x of [13560, 16020]) { blob(ctx, x, S.floor - 170, 90, 150, '#1f3d34', rand, 7, 0.95); rect(ctx, x - 50, S.floor - 90, x + 50, S.floor, '#2a1c14'); }
      rect(ctx, 16000, -1480, 16400, -1466, '#2a1c14');
      // floor: dark polished concrete that catches the monitor light
      vgrad(ctx, p.x, S.floor, p.x + p.w, p.y + p.h, [[0, '#121a30'], [1, '#0a0f1e']]);
      radial(ctx, 14420, S.floor + 20, 900, [[0, 'rgba(150,190,240,0.12)'], [1, 'rgba(150,190,240,0)']], 1, 0.12);
      // section edges of the tower's structure
      rect(ctx, p.x, p.y, p.x + 80, p.y + p.h, '#1a2442');
      rect(ctx, p.x + p.w - 30, p.y, p.x + p.w, p.y + p.h, '#1a2442');
      // ambient occlusion: the room recedes into the dark
      vgrad(ctx, p.x, S.ceiling, p.x + p.w, S.ceiling + 300, [[0, 'rgba(2,6,16,0.55)'], [1, 'rgba(2,6,16,0)']]);
      hgrad(ctx, p.x, p.y, p.x + 400, p.y + p.h, [[0, 'rgba(2,6,16,0.5)'], [1, 'rgba(2,6,16,0)']]);
      hgrad(ctx, p.x + p.w - 400, p.y, p.x + p.w, p.y + p.h, [[0, 'rgba(2,6,16,0)'], [1, 'rgba(2,6,16,0.5)']]);
    }, { passes: PASSES });
  },
};

for (const [name, fn] of Object.entries(PLATES)) {
  if (only.length && !only.includes(name)) continue;
  const t0 = Date.now();
  console.log(`chapter5 ${name}…`);
  await fn();
  console.log(`  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
