// Chapter 4 placeholder plates (Phase 4.9 — one restaurant, physically connected).
//
// The rooms are no longer separate painted backdrops that happen to sit next to each other. Kitchen,
// service counter and office now share ONE architectural language, so that a camera travelling between
// them reads as travel through a single building:
//
//   · the same ceiling line and the same CORNICE band under it (SHARED.cornice)
//   · the same glazed teal tile (SHARED.tileA/B) on the kitchen walls AND behind the counter
//   · the same warm plaster above it (SHARED.plaster) and the same walnut dado rail with a brass edge
//   · the same terracotta floor across kitchen and front of house, with one wood threshold at the counter
//   · the same pendant rhythm (one lamp every 560 units, on one line) running through every room
//   · real ARCHES, not hatches: dining↔kitchen and kitchen↔counter are full-height openings with a
//     service shelf across them, painted by ONE shared routine so both sides match exactly
//
// See CHAPTER4_ARTWORK.md §1 and geometry.json (kitchen.hatch / kitchen.passWindow / archHead).
//
// PROTOTYPE plates for choreography and staging review — not final artwork. They are painted with the same
// brush engine as the approved pilot art, with stronger values, material identity and lighting than Phase 4.
// All coordinates come from lib/prototype/chapter4/geometry.json (single source of truth).
// Figures, devices, foreground layers and ambient sprites live in chapter4-sprites.mjs.
//
// Usage: node scripts/art/chapter4-plates.mjs [name…]

import path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import G from '../../lib/prototype/chapter4/geometry.json' with { type: 'json' };
import { Plate, blob, canvasTooth, hgrad, mulberry32, paintStrokes, poly, radial, vgrad, writeFile } from './engine.mjs';

const OUT = path.resolve('public/prototype-assets/04-journey');
const only = process.argv.slice(2);

const PASSES = [
  { r: 15, step: 12, len: [26, 70], alpha: 0.86, hueJ: 8, satJ: 0.07, lumJ: 0.07, taper: 0.4 },
  { r: 7, step: 6, len: [12, 30], alpha: 0.85, thresh: 22, texture: () => 0.14, hueJ: 7, satJ: 0.06, lumJ: 0.06, impasto: 0.6 },
];
const hatch = () => -0.85;

async function brush(plate, drawGuide, { passes = PASSES, field = hatch, alpha = null, quality = 82 } = {}) {
  const guide = plate.canvas();
  drawGuide(plate.designCtx(guide));
  const painted = paintStrokes(plate, guide, { field, passes, edgeFollow: () => 0.85, jitter: () => 1, impastoMap: () => 0.5, seed: 17 });
  canvasTooth(painted, 0.03);
  if (alpha) alpha(painted);
  await writeFile(path.join(OUT, `${plate.name}.webp`), await painted.encode('webp', quality));
}

const cutRect = (plate, rects) => (canvas) => {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'destination-out';
  for (const [x0, y0, x1, y1] of rects) ctx.fillRect((x0 - plate.x) * plate.k, (y0 - plate.y) * plate.k, (x1 - x0) * plate.k, (y1 - y0) * plate.k);
  ctx.restore();
};

// shared pieces ---------------------------------------------------------------
const rect = (ctx, x0, y0, x1, y1, fill) => {
  ctx.fillStyle = fill;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
};
/** cut concrete / timber slab of the cross-section, with a lit top edge */
const slab = (ctx, x0, x1, y0, y1) => {
  vgrad(ctx, x0, y0, x1, y1, [[0, '#4b3a2e'], [0.5, '#3a2d24'], [1, '#2a211b']]);
  ctx.strokeStyle = 'rgba(20,14,10,0.45)';
  ctx.lineWidth = 6;
  for (let x = x0 - (y1 - y0); x < x1; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x + (y1 - y0), y0);
    ctx.stroke();
  }
  rect(ctx, x0, y0, x1, y0 + 6, 'rgba(255,214,160,0.35)');
};
/** darken towards the edges of a room: ceiling, floor and side walls (ambient occlusion) */
const roomShade = (ctx, x0, y0, x1, y1, strength = 0.45) => {
  vgrad(ctx, x0, y0, x1, y0 + 260, [[0, `rgba(20,12,8,${strength})`], [1, 'rgba(20,12,8,0)']]);
  vgrad(ctx, x0, y1 - 160, x1, y1, [[0, 'rgba(20,12,8,0)'], [1, `rgba(20,12,8,${strength * 0.7})`]]);
  hgrad(ctx, x0, y0, x0 + 220, y1, [[0, `rgba(20,12,8,${strength * 0.8})`], [1, 'rgba(20,12,8,0)']]);
  hgrad(ctx, x1 - 220, y0, x1, y1, [[0, 'rgba(20,12,8,0)'], [1, `rgba(20,12,8,${strength * 0.8})`]]);
};
const tiles = (ctx, x0, y0, x1, y1, size, a, b, grout = 'rgba(230,240,230,0.35)') => {
  for (let x = x0; x < x1; x += size)
    for (let y = y0; y < y1; y += size) {
      const odd = (Math.round((x - x0) / size) + Math.round((y - y0) / size)) % 2;
      rect(ctx, x, y, Math.min(x + size, x1), Math.min(y + size, y1), odd ? a : b);
    }
  ctx.strokeStyle = grout;
  ctx.lineWidth = 3;
  for (let x = x0; x <= x1; x += size) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
  for (let y = y0; y <= y1; y += size) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
};
const floorBoards = (ctx, x0, x1, y0, y1, a, b, vanishX) => {
  vgrad(ctx, x0, y0, x1, y1, [[0, a], [1, b]]);
  ctx.strokeStyle = 'rgba(40,22,12,0.4)';
  ctx.lineWidth = 4;
  for (let x = x0 - 800; x < x1 + 800; x += 120) {
    ctx.beginPath();
    ctx.moveTo(vanishX + (x - vanishX) * 0.55, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
  }
  vgrad(ctx, x0, y0, x1, y0 + 60, [[0, 'rgba(20,12,8,0.5)'], [1, 'rgba(20,12,8,0)']]);
};
const steel = (ctx, x0, y0, x1, y1) => {
  vgrad(ctx, x0, y0, x1, y1, [[0, '#dfe5e6'], [0.08, '#a9b3b6'], [0.5, '#7d888c'], [1, '#5b6568']]);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x0, y0 + 4); ctx.lineTo(x1, y0 + 4); ctx.stroke();
};
const pendantRod = (ctx, x, y0, y1) => {
  ctx.strokeStyle = '#1f1a17';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
};

// ── ONE restaurant: the palette and the mouldings every ground-floor room shares ──────────────
const SHARED = {
  ceiling: -330,
  floor: 840,
  /** warm plaster above the tiling — identical stops in kitchen, counter and office */
  plaster: [[0, '#a8835b'], [0.45, '#c9a371'], [1, '#bd9366']],
  /** the glazed tile that runs through the kitchen and reappears behind the counter */
  tileA: '#2f5f5a',
  tileB: '#346863',
  tileTop: 280,
  /** walnut dado + brass edge, at the same height everywhere */
  dadoY: 412,
  wood: '#5b3a25',
  woodDark: '#3a2518',
  brass: '#c79a4e',
  /** pendant line: one lamp every SHARED.step, hanging to the same height in every room */
  pendantY: 150,
  step: 560,
};

/** the cornice band directly under the ceiling — the single strongest continuity cue between rooms */
const cornice = (ctx, x0, x1, y = SHARED.ceiling) => {
  vgrad(ctx, x0, y, x1, y + 26, [[0, '#7d6047'], [1, '#5d452f']]);
  rect(ctx, x0, y + 26, x1, y + 34, 'rgba(255,214,160,0.3)');
  vgrad(ctx, x0, y + 34, x1, y + 96, [[0, 'rgba(24,14,8,0.3)'], [1, 'rgba(24,14,8,0)']]);
};

/** the walnut dado rail with its brass edge, at SHARED.dadoY */
const dado = (ctx, x0, x1) => {
  rect(ctx, x0, SHARED.dadoY - 10, x1, SHARED.dadoY + 14, SHARED.wood);
  rect(ctx, x0, SHARED.dadoY - 10, x1, SHARED.dadoY - 4, SHARED.brass);
};

/** the terracotta floor of the whole ground floor, receding to one vanishing x */
const terracotta = (ctx, x0, x1, vanishX) => {
  vgrad(ctx, x0, SHARED.floor, x1, 1290, [[0, '#8e4b33'], [1, '#6e3826']]);
  ctx.strokeStyle = 'rgba(40,18,10,0.45)';
  ctx.lineWidth = 4;
  for (let y = 900; y < 1290; y += 70) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
  for (let x = x0 - 600; x < x1 + 600; x += 110) { ctx.beginPath(); ctx.moveTo(vanishX + (x - vanishX) * 0.6, SHARED.floor); ctx.lineTo(x, 1290); ctx.stroke(); }
};

/** the pendant rhythm: the same lamp, the same height, on the same line, in every room */
const pendantLine = (ctx, xs, y = SHARED.pendantY, ceil = SHARED.ceiling) => {
  for (const x of xs) {
    pendantRod(ctx, x, ceil, y - 46);
    poly(ctx, [[x - 62, y + 6], [x + 62, y + 6], [x + 26, y - 46], [x - 26, y - 46]], '#2b2e30');
    rect(ctx, x - 58, y - 2, x + 58, y + 8, '#ffcf7a');
    rect(ctx, x - 40, y + 8, x + 40, y + 14, 'rgba(255,236,190,0.55)');
    radial(ctx, x, y + 200, 320, [[0, 'rgba(255,190,110,0.26)'], [1, 'rgba(255,190,110,0)']], 1, 0.55);
  }
};

/**
 * A real opening between two rooms, painted by ONE routine so that the kitchen side and the counter /
 * dining side of the same wall are identical: a full-height arch with a service shelf across it, warm
 * light spilling through, and the wall's own cut edge on either side.
 *
 *   x0..x1   the cut wall (seen edge-on in the cross-section)
 *   y0..y1   the opening, floor to springing
 *   head     where the arch head springs
 *   shelfY   the service shelf across the opening
 *   warm     [top, bottom] of the light beyond it
 */
const archOpening = (ctx, x0, x1, y0, y1, head, shelfY, warm) => {
  const mid = (x0 + x1) / 2;
  const r = (x1 - x0) / 2;
  // the cut wall itself, and a shadow on the wall to either side of the opening so its edges register
  vgrad(ctx, x0 - 40, SHARED.ceiling, x1 + 40, 1290, [[0, '#3a2a1e'], [1, '#281c14']]);
  // the opening: the next room, brighter than any wall around it — this is what makes it read as a way through
  vgrad(ctx, x0, y0, x1, y1, [[0, warm[0]], [1, warm[1]]]);
  radial(ctx, mid, (y0 + y1) / 2, r * 2.6, [[0, 'rgba(255,240,205,0.85)'], [0.5, 'rgba(255,214,150,0.4)'], [1, 'rgba(255,200,130,0)']]);
  // the reveal: the thickness of the wall we pass through, lit on one side and shaded on the other
  hgrad(ctx, x0, y0, x0 + 26, y1, [[0, 'rgba(60,40,24,0.55)'], [1, 'rgba(60,40,24,0)']]);
  hgrad(ctx, x1 - 26, y0, x1, y1, [[0, 'rgba(60,40,24,0)'], [1, 'rgba(60,40,24,0.4)']]);
  // arch head: the wall closes over the opening above the springing
  ctx.save();
  ctx.fillStyle = '#3d2c1c';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y0);
  ctx.lineTo(x1, head);
  ctx.quadraticCurveTo(mid, head - r * 1.5, x0, head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  rect(ctx, x0, head - 6, x1, head + 6, 'rgba(255,214,150,0.28)');
  // the service shelf across it
  rect(ctx, x0 - 30, shelfY, x1 + 30, shelfY + 32, '#6d4a2e');
  rect(ctx, x0 - 30, shelfY, x1 + 30, shelfY + 8, SHARED.brass);
  // warm spill onto both rooms, so the light of one is visibly present in the other
  radial(ctx, x0 - 30, (shelfY + head) / 2, 560, [[0, 'rgba(255,196,118,0.4)'], [1, 'rgba(255,196,118,0)']], 1, 0.65);
  radial(ctx, x1 + 30, (shelfY + head) / 2, 560, [[0, 'rgba(255,196,118,0.4)'], [1, 'rgba(255,196,118,0)']], 1, 0.65);
};

// plates ----------------------------------------------------------------------
const PLATES = {
  /** Only seen around the building in wide shots (dollhouse pull-back in 4.6, the sides of the finale). */
  async exterior() {
    const p = new Plate({ name: 'exterior', x: -2600, y: -5000, w: 14000, h: 9200, k: 0.14 });
    await brush(p, (ctx) => {
      const rand = mulberry32(3);
      vgrad(ctx, p.x, p.y, p.x + p.w, 900, [[0, '#2f3a64'], [0.4, '#6b6b96'], [0.62, '#c98f86'], [0.8, '#e9b787'], [1, '#f1cf9c']]);
      // neighbouring buildings (left of the dining room and right of the shaft)
      for (const [x0, x1, top, col] of [[-2600, -1500, -900, '#5b4a52'], [-1500, -380, -300, '#6d5657'], [8100, 9000, -1400, '#574752'], [9000, 10300, -600, '#66525a'], [10300, 11400, -1900, '#4d4150']]) {
        rect(ctx, x0, top, x1, 900, col);
        for (let y = top + 120; y < 760; y += 260)
          for (let x = x0 + 90; x < x1 - 120; x += 240) rect(ctx, x, y, x + 110, y + 140, rand() < 0.35 ? 'rgba(243,201,131,0.55)' : 'rgba(40,32,44,0.35)');
      }
      // street, kerb and cross-section of the earth under it
      vgrad(ctx, p.x, 840, p.x + p.w, 1290, [[0, '#8b7a6a'], [1, '#6d5d50']]);
      rect(ctx, p.x, 1290, p.x + p.w, 1330, '#3d3129');
      vgrad(ctx, p.x, 1330, p.x + p.w, p.y + p.h, [[0, '#5a4535'], [0.25, '#46372c'], [1, '#261e19']]);
      for (let i = 0; i < 90; i++) blob(ctx, p.x + rand() * p.w, 1500 + rand() * 2600, 40 + rand() * 60, 26 + rand() * 30, rand() < 0.5 ? '#6a5746' : '#352a22', rand, 3, 0.8);
      // the building's own outer walls and roof around the cut-away rooms
      rect(ctx, 2080, -2240, 8020, 1290, '#8a6d55');
      rect(ctx, 7660, -2240, 8020, 1290, '#7a5f4a');
      poly(ctx, [[-420, -210], [-300, -350], [2240, -350], [2300, -210]], '#8f4b36');
      rect(ctx, 3620, 1290, 8100, 2980, '#3b2f27');
    }, { passes: [PASSES[0]], alpha: cutRect(p, [[-340, -210, 2260, 1290]]) });
  },

  /** Dusk sky above the roof: the report bars stand against it at the end of the day. */
  async sky() {
    const p = new Plate({ name: 'sky', x: 400, y: -5000, w: 9400, h: 3050, k: 0.3 });
    await brush(p, (ctx) => {
      const rand = mulberry32(33);
      vgrad(ctx, p.x, p.y, p.x + p.w, -1950, [[0, '#1d2448'], [0.35, '#40406e'], [0.62, '#8e5e7a'], [0.82, '#d9876a'], [1, '#f2b774']]);
      radial(ctx, 6900, -2250, 900, [[0, 'rgba(255,214,150,0.95)'], [0.25, 'rgba(255,170,110,0.55)'], [1, 'rgba(255,150,100,0)']]);
      for (let i = 0; i < 14; i++) {
        const x = 600 + rand() * 7600;
        const y = -4200 + rand() * 1600;
        blob(ctx, x, y, 320 + rand() * 260, 40 + rand() * 30, rand() < 0.5 ? '#c7788a' : '#e59a7c', rand, 6, 0.5);
      }
      // far city skyline behind the parapet
      for (let x = p.x; x < p.x + p.w; x += 70 + rand() * 110) {
        const h = 60 + rand() * 230;
        const w = 60 + rand() * 120;
        rect(ctx, x, -2080 - h, x + w, -1950, rand() < 0.5 ? '#3f3452' : '#4c3b58');
        for (let wy = -2080 - h + 30; wy < -2100; wy += 44)
          for (let wx = x + 14; wx < x + w - 14; wx += 30) if (rand() < 0.22) rect(ctx, wx, wy, wx + 12, wy + 16, '#f6c77e');
      }
    }, { field: () => 0.02, passes: [PASSES[0]] });
  },

  /**
   * The management floor, directly above the restaurant. Phase 4.9 gives it the SAME language as the
   * rooms below — the same cornice, the same walnut and brass, the same glazed tile as an accent — and
   * a premium, practically lit workstation rather than a generic desk: warm key from the lamp, a cool
   * spill from the screen, a glazed partition with the warmth of the restaurant behind it, deep corners.
   */
  async office() {
    const p = new Plate({ name: 'office', x: 2100, y: -2200, w: 5800, h: 1900, k: 0.62 });
    const O = G.office;
    await brush(p, (ctx) => {
      const rand = mulberry32(61);
      // roof deck + parapet (the chart stands on it) and the roof slab section
      vgrad(ctx, p.x, -2200, p.x + p.w, -2140, [[0, '#7a5c49'], [1, '#5e4636']]);
      vgrad(ctx, p.x, -2140, p.x + p.w, -2080, [[0, '#9b8574'], [1, '#6f5d51']]);
      slab(ctx, p.x, p.x + p.w, -2080, -1980);
      // walls: deep sage-grey upper, dark walnut panelling lower — the same walnut and brass as the
      // counter downstairs, so the two floors read as one building
      vgrad(ctx, p.x, -1980, p.x + p.w, -700, [[0, '#46524a'], [0.5, '#56655a'], [1, '#4d5a50']]);
      cornice(ctx, p.x, p.x + p.w, -1980);
      vgrad(ctx, p.x, -700, p.x + p.w, O.floorLine, [[0, '#4a3223'], [1, '#34231a']]);
      rect(ctx, p.x, -716, p.x + p.w, -700, SHARED.wood);
      rect(ctx, p.x, -716, p.x + p.w, -708, SHARED.brass);
      for (let x = p.x + 60; x < p.x + p.w; x += 180) rect(ctx, x, -680, x + 150, O.floorLine - 26, 'rgba(255,220,170,0.06)');
      // a glazed partition on the stair side: the warmth of the restaurant is still there, one wall away
      rect(ctx, 2420, -1500, 2900, -640, '#3a2b1f');
      vgrad(ctx, 2444, -1476, 2876, -664, [[0, 'rgba(255,206,142,0.5)'], [1, 'rgba(226,150,86,0.42)']]);
      for (const gx of [2560, 2700, 2840]) rect(ctx, gx - 6, -1476, gx + 6, -664, '#3a2b1f');
      radial(ctx, 2960, -1060, 520, [[0, 'rgba(255,196,120,0.22)'], [1, 'rgba(255,196,120,0)']], 1, 0.7);
      // a band of the restaurant's own glazed tile as a splashback behind the desk return
      tiles(ctx, 4960, -1150, 5240, -760, 42, SHARED.tileA, SHARED.tileB);
      // outer wall sections
      rect(ctx, p.x, -1980, 2380, O.floorLine, '#6d5140');
      rect(ctx, 6260, -1980, p.x + p.w, O.floorLine, '#6d5140');
      // window with low sun, and its beam falling on the desk
      const [w0, w1, w2, w3] = O.window;
      rect(ctx, w0 - 26, w1 - 26, w2 + 26, w3 + 30, '#2d1f17');
      vgrad(ctx, w0, w1, w2, w3, [[0, '#7c88b0'], [0.55, '#e59a74'], [1, '#f7c985']]);
      rect(ctx, (w0 + w2) / 2 - 8, w1, (w0 + w2) / 2 + 8, w3, '#2d1f17');
      rect(ctx, w0, (w1 + w3) / 2 - 8, w2, (w1 + w3) / 2 + 8, '#2d1f17');
      poly(ctx, [[w2, w1], [w2, w3], [4700, O.floorLine], [4200, O.floorLine], [3900, -1100]], 'rgba(255,190,120,0.16)');
      // wall clock mount + framed certificate + cabinet
      radial(ctx, O.clock[0], O.clock[1], 78, [[0, '#2a211b'], [0.92, '#2a211b'], [1, 'rgba(42,33,27,0)']]);
      rect(ctx, 3380, -1330, 3620, -1130, '#6b4c34');
      rect(ctx, 3400, -1310, 3600, -1150, '#e9dcc1');
      const [c0, c1, c2, c3] = O.cabinet;
      vgrad(ctx, c0, c1, c2, c3, [[0, '#6f7474'], [1, '#4c5152']]);
      for (let y = c1 + 20; y < c3 - 20; y += 150) { rect(ctx, c0 + 14, y, c2 - 14, y + 130, '#5f6566'); rect(ctx, (c0 + c2) / 2 - 36, y + 50, (c0 + c2) / 2 + 36, y + 62, '#c9c2b0'); }
      // binders shelf — the accounting cue
      const [b0, b1, b2, b3] = O.binders;
      rect(ctx, b0 - 18, b1 - 18, b2 + 18, b3 + 10, '#3a271b');
      for (let y = b1; y < b3 - 40; y += 250) {
        rect(ctx, b0, y + 230, b2, y + 250, '#6e4b31');
        let x = b0 + 10;
        while (x < b2 - 40) {
          const w = 34 + rand() * 18;
          const col = ['#7e2f24', '#2f4f6a', '#6b6b2a', '#8a5a2b', '#3f5e4a', '#d8c9a8'][(rand() * 6) | 0];
          rect(ctx, x, y + 40 + rand() * 30, x + w, y + 230, col);
          rect(ctx, x + 8, y + 150, x + w - 8, y + 175, 'rgba(245,235,215,0.8)');
          x += w + 4;
        }
      }
      // desk (walnut, brass edge), legs, desk lamp base, invoice printer
      const [d0, d1, dy] = O.desk;
      rect(ctx, d0 - 120, dy, d1 + 200, dy + 38, SHARED.wood);
      rect(ctx, d0 - 120, dy, d1 + 200, dy + 8, SHARED.brass);
      // a desk return carrying the second display, so the workstation has real furniture under it
      rect(ctx, d1 + 60, dy + 38, d1 + 200, O.floorLine - 20, '#4a2f1f');
      vgrad(ctx, d0 + 30, dy + 34, d0 + 260, O.floorLine, [[0, '#4a2f1f'], [1, '#2e1d13']]);
      vgrad(ctx, d1 - 300, dy + 34, d1 - 30, O.floorLine, [[0, '#4a2f1f'], [1, '#2e1d13']]);
      for (let y = dy + 70; y < O.floorLine - 40; y += 70) rect(ctx, d1 - 270, y, d1 - 60, y + 50, '#553725');
      rect(ctx, 4960, -760, 5140, -676, '#2f3336');
      rect(ctx, 4975, -770, 5125, -758, '#171a1c');
      // monitor wall shadow
      radial(ctx, O.monitorCenter[0], O.monitorCenter[1] + 30, 420, [[0, 'rgba(10,20,20,0.35)'], [1, 'rgba(10,20,20,0)']], 1, 0.7);
      // floor with a worn rug under the desk
      floorBoards(ctx, p.x, p.x + p.w, O.floorLine, -300, '#6e4a31', '#4a3121', 4400);
      const rugRand = mulberry32(77);
      rect(ctx, 3700, O.floorLine - 96, 5400, -318, '#6b3a34');
      rect(ctx, 3740, O.floorLine - 86, 5360, -330, '#7d463c');
      for (let x = 3760; x < 5340; x += 90) rect(ctx, x, O.floorLine - 80, x + 44, -336, 'rgba(226,186,140,0.25)');
      void rugRand;
      // framed photographs above the cabinet
      for (let i = 0; i < 2; i++) {
        const fx = 3340 + i * 190;
        rect(ctx, fx, -1240, fx + 150, -1090, '#3a2718');
        rect(ctx, fx + 12, -1228, fx + 138, -1102, ['#8a6a4a', '#5f6f79'][i]);
      }
      // small things that make it somebody's desk: a cup, a stack of dockets, a plant on the return
      radial(ctx, 4180, O.desk[2] - 26, 34, [[0, '#f1ece0'], [0.8, '#cbc2ae'], [1, 'rgba(0,0,0,0)']]);
      rect(ctx, 4166, O.desk[2] - 20, 4194, O.desk[2] - 2, '#e8e1cf');
      for (let i = 0; i < 4; i++) rect(ctx, 5210 + i * 3, O.desk[2] - 16 - i * 7, 5390 - i * 3, O.desk[2] - 8 - i * 7, ['#f2e9d4', '#e9dec4'][i % 2]);
      blob(ctx, 5320, O.desk[2] - 120, 90, 96, '#3d6b45', rand, 7, 0.95);
      rect(ctx, 5286, O.desk[2] - 58, 5354, O.desk[2] - 2, '#8a5232');
      // the desk lamp's warm pool, the screens' cool spill, and corners that actually go dark
      radial(ctx, O.lamp[0] + 120, O.desk[2] - 40, 640, [[0, 'rgba(255,198,120,0.42)'], [1, 'rgba(255,198,120,0)']], 1, 0.6);
      radial(ctx, O.monitorCenter[0], O.monitorCenter[1] + 40, 660, [[0, 'rgba(150,220,230,0.2)'], [1, 'rgba(150,220,230,0)']], 1, 0.7);
      radial(ctx, O.monitorCenter[0] + 560, O.monitorCenter[1] + 120, 380, [[0, 'rgba(150,220,230,0.16)'], [1, 'rgba(150,220,230,0)']], 1, 0.7);
      roomShade(ctx, 2380, -1980, 7660, O.floorLine, 0.78);
    });
  },

  /** Basement storeroom: brick vault, shelving with four bins, bulb, stairs, service lift shaft. */
  async storeroom() {
    const p = new Plate({ name: 'storeroom', x: 3700, y: 1250, w: 4000, h: 1650, k: 0.62 });
    const R = G.storeroom;
    await brush(p, (ctx) => {
      const rand = mulberry32(21);
      slab(ctx, p.x, p.x + p.w, 1250, 1400);
      // brick walls, warm under the bulb, deep in the corners
      vgrad(ctx, p.x, 1400, p.x + p.w, R.shelf[2] + 400, [[0, '#5d4234'], [1, '#6f4f3c']]);
      for (let y = 1400; y < 2520; y += 44)
        for (let x = p.x + ((y / 44) % 2) * 60; x < p.x + p.w; x += 120)
          rect(ctx, x + 4, y + 4, x + 116, y + 40, rand() < 0.5 ? '#7a5642' : '#6a4a39');
      radial(ctx, R.bulb[0], R.bulb[1] + 120, 900, [[0, 'rgba(255,196,120,0.55)'], [0.45, 'rgba(255,170,100,0.18)'], [1, 'rgba(255,170,100,0)']]);
      // calm plastered panel for the text (upper left of the shelving)
      const [t0, t1, t2, t3] = R.calmText;
      rect(ctx, t0 - 60, t1 - 60, t2 + 60, t3 + 40, 'rgba(120,90,70,0.55)');
      // shelving unit: uprights, upper shelf (right half only), bin shelf, lower shelf
      const [s0, s1, sy] = R.shelf;
      for (const x of [s0, (s0 + s1) / 2, s1]) vgrad(ctx, x - 16, 1700, x + 16, 2520, [[0, '#4a3122'], [1, '#2f1f15']]);
      rect(ctx, 5150, 1770, s1 + 20, 1800, '#7a5234');
      for (let x = 5200; x < s1 - 30; x += 70) {
        rect(ctx, x, 1680, x + 50, 1770, ['#b6452f', '#d9b36a', '#5f7a45', '#caa46a'][((x / 70) | 0) % 4]);
        rect(ctx, x, 1680, x + 50, 1696, 'rgba(255,240,210,0.5)');
      }
      rect(ctx, s0 - 30, sy, s1 + 30, sy + 34, '#7a5234');
      rect(ctx, s0 - 30, sy, s1 + 30, sy + 6, '#c0925c');
      // bins: wooden crates (contents are modules)
      const [bw, bh] = R.binSize;
      for (const dx of R.binXs) {
        const cx = R.binsCenter[0] + dx;
        rect(ctx, cx - bw / 2 - 14, sy - bh - 10, cx + bw / 2 + 14, sy, '#5a3a24');
        rect(ctx, cx - bw / 2, sy - bh, cx + bw / 2, sy - 14, '#2c1d14');
        rect(ctx, cx - bw / 2 - 14, sy - 50, cx + bw / 2 + 14, sy, '#8a5f3b');
        rect(ctx, cx - bw / 2 - 14, sy - 50, cx + bw / 2 + 14, sy - 44, '#c79a62');
      }
      rect(ctx, s0 - 30, 2440, s1 + 30, 2470, '#6a4630');
      for (let i = 0; i < 5; i++) blob(ctx, 4800 + i * 170, 2380, 70, 70, i % 2 ? '#c9b48a' : '#b89e70', rand, 4, 0.95);
      // stairs down from the service floor (left)
      const [st0, st1] = R.stairs;
      for (let i = 0; i < 12; i++) {
        const t = i / 12;
        const x = st0 + t * (st1 - st0);
        const y = 1400 + t * 1100;
        rect(ctx, x, y, x + 120, y + 30, '#6c4a32');
        rect(ctx, x, y, x + 120, y + 7, '#a77a4f');
      }
      ctx.strokeStyle = '#2a1c14';
      ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(st0 + 40, 1300); ctx.lineTo(st1 + 60, 2380); ctx.stroke();
      // service lift shaft (right): the flow line rises through it
      const [sh0, sh1] = G.service.shaft;
      vgrad(ctx, sh0, 1400, sh1, 2520, [[0, '#3b2f29'], [1, '#2a211c']]);
      ctx.strokeStyle = '#8c7a66';
      ctx.lineWidth = 5;
      for (const x of [sh0 + 70, sh1 - 70]) { ctx.beginPath(); ctx.moveTo(x, 1400); ctx.lineTo(x, 2520); ctx.stroke(); }
      rect(ctx, sh0 - 20, 1400, sh0, 2520, '#5a4638');
      rect(ctx, sh1, 1400, sh1 + 20, 2520, '#5a4638');
      // floor
      vgrad(ctx, p.x, 2520, p.x + p.w, p.y + p.h, [[0, '#5a4a3e'], [1, '#2e2520']]);
      roomShade(ctx, p.x, 1400, p.x + p.w, 2520, 0.62);
    }, { field: () => 0.02 });
  },

  /** Front counter / cashier: walnut counter with brass edge, green wainscot, street window, lift shaft. */
  async service() {
    const p = new Plate({ name: 'service', x: 5080, y: -450, w: 2920, h: 1850, k: 0.7 });
    const S = G.service;
    await brush(p, (ctx) => {
      slab(ctx, p.x, p.x + p.w, -450, SHARED.ceiling);
      // the SAME plaster, cornice, tile and dado as the kitchen — this is one room, not another backdrop
      vgrad(ctx, p.x, SHARED.ceiling, p.x + p.w, SHARED.tileTop, SHARED.plaster);
      cornice(ctx, p.x, p.x + p.w);
      tiles(ctx, p.x, SHARED.tileTop, 6900, SHARED.dadoY, 56, SHARED.tileA, SHARED.tileB);
      vgrad(ctx, p.x, SHARED.tileTop, 6900, SHARED.tileTop + 50, [[0, 'rgba(255,240,200,0.25)'], [1, 'rgba(255,240,200,0)']]);
      dado(ctx, p.x, 6900);
      vgrad(ctx, p.x, SHARED.dadoY + 14, p.x + p.w, SHARED.floor, [[0, '#4d3526'], [1, '#3a2719']]);
      for (let x = p.x + 40; x < p.x + p.w; x += 150) rect(ctx, x, 470, x + 120, 800, 'rgba(255,230,190,0.05)');
      pendantLine(ctx, [5600]);
      // the service arch from the kitchen — the same routine, so both sides of the wall agree
      const [pw0, pw1, pw2, pw3] = G.kitchen.passWindow;
      archOpening(ctx, pw0, pw1, pw2, pw3, G.kitchen.archHead, G.kitchen.passShelf, ['#ffe9bd', '#e8bd85']);
      // street window, cool afternoon light
      const [w0, w1, w2, w3] = S.window;
      rect(ctx, w0 - 24, w1 - 24, w2 + 24, w3 + 30, '#3a271b');
      vgrad(ctx, w0, w1, w2, w3, [[0, '#9fc3d8'], [0.7, '#d9dfd2'], [1, '#e8cf9f']]);
      for (let i = 0; i < 4; i++) rect(ctx, w0 + 40 + i * 110, w1 + 180, w0 + 120 + i * 110, w3, ['#8a7160', '#a58a74', '#7a6a5f', '#9a7e68'][i]);
      rect(ctx, (w0 + w2) / 2 - 7, w1, (w0 + w2) / 2 + 7, w3, '#3a271b');
      // counter: brass-edged walnut top, panelled front
      const [c0, c1, cy] = S.counter;
      rect(ctx, c0 - 20, cy - 12, c1 + 20, cy + 22, '#3e2819');
      rect(ctx, c0 - 20, cy - 12, c1 + 20, cy - 4, '#d9a95c');
      vgrad(ctx, c0, cy + 22, c1, 840, [[0, '#5b3a25'], [1, '#3a2518']]);
      for (let x = c0 + 30; x < c1 - 60; x += 190) {
        rect(ctx, x, cy + 50, x + 160, 800, '#4b301f');
        rect(ctx, x, cy + 50, x + 160, cy + 56, 'rgba(255,210,150,0.25)');
      }
      // shelves behind the counter: cups, bottles and a plant — a real service station
      const rand2 = mulberry32(51);
      rect(ctx, 5200, 180, 5480, 198, '#6e4b31');
      for (let x = 5215; x < 5465; x += 40) radial(ctx, x + 14, 162, 22, [[0, '#f4ecdd'], [0.8, '#d6cbb6'], [1, 'rgba(0,0,0,0)']]);
      rect(ctx, 5200, 20, 5480, 38, '#6e4b31');
      for (let x = 5216; x < 5470; x += 34) {
        const h = 60 + rand2() * 34;
        const col = ['#7a3b2c', '#2f5a45', '#8a6a2a', '#43506b'][(x / 34 | 0) % 4];
        rect(ctx, x, 38 - h, x + 22, 38, col);
        rect(ctx, x + 7, 38 - h - 16, x + 15, 38 - h, col);
        rect(ctx, x + 3, 38 - h + 18, x + 19, 38 - h + 30, 'rgba(255,240,210,0.75)');
      }
      blob(ctx, 5170, 120, 70, 60, '#2f5a3e', rand2, 6, 0.95);
      rect(ctx, 5144, 150, 5196, 200, '#7a4a2c');
      // espresso machine on the back counter — chrome, brass and a warm lamp on it
      rect(ctx, 5520, 420, 5740, 590, '#6d767a');
      vgrad(ctx, 5520, 420, 5740, 478, [[0, '#c3cbcc'], [1, '#8b9497']]);
      rect(ctx, 5534, 478, 5726, 492, SHARED.brass);
      for (const gx of [5566, 5676]) { rect(ctx, gx, 492, gx + 44, 540, '#525a5d'); radial(ctx, gx + 22, 556, 24, [[0, '#e6e0d2'], [0.85, '#c2bba9'], [1, 'rgba(0,0,0,0)']]); }
      radial(ctx, 5630, 450, 240, [[0, 'rgba(255,214,150,0.3)'], [1, 'rgba(255,214,150,0)']]);
      // chalk menu board over the back counter, same walnut as the dado (clear of the street window)
      rect(ctx, 5540, 30, 5940, 240, SHARED.wood);
      rect(ctx, 5558, 48, 5922, 222, '#2b3330');
      for (let i = 0; i < 5; i++) rect(ctx, 5584, 74 + i * 30, 5584 + (190 + ((i * 53) % 120)), 86 + i * 30, 'rgba(238,232,214,0.5)');
      // brass foot rail along the counter front
      rect(ctx, 5300, 790, 6460, 802, SHARED.brass);
      // the counter's own key light: warmer and deeper than 4.8, so the room stops looking washed out
      radial(ctx, 5880, 620, 700, [[0, 'rgba(255,200,132,0.34)'], [1, 'rgba(255,200,132,0)']], 1, 0.55);
      radial(ctx, 6200, 300, 460, [[0, 'rgba(255,214,150,0.22)'], [1, 'rgba(255,214,150,0)']], 1, 0.7);
      // the handoff bay: a low steel shelf between the kitchen pass and the counter, where the waiter
      // picks the dish up. It is the service zone's own piece of furniture.
      const [hb0, hb1, hby] = S.handoff;
      steel(ctx, hb0 - 40, hby, hb1 + 120, hby + 34);
      vgrad(ctx, hb0 - 40, hby + 34, hb1 + 120, 840, [[0, '#6a6f6d'], [1, '#474c4b']]);
      radial(ctx, (hb0 + hb1) / 2 + 40, hby - 40, 300, [[0, 'rgba(255,196,120,0.3)'], [1, 'rgba(255,196,120,0)']], 1, 0.6);
      // stacked plates and a folded-napkin tray on the bay
      for (let i = 0; i < 3; i++) radial(ctx, hb0 + 30 + i * 70, hby - 16, 30, [[0, '#f1ece0'], [0.85, '#d3ccbd'], [1, 'rgba(0,0,0,0)']]);
      // lift shaft on the right edge of the ground floor
      const [sh0, sh1] = S.shaft;
      vgrad(ctx, sh0, -330, sh1, 840, [[0, '#3b2f29'], [1, '#2a211c']]);
      ctx.strokeStyle = '#8c7a66';
      ctx.lineWidth = 5;
      for (const x of [sh0 + 70, sh1 - 70]) { ctx.beginPath(); ctx.moveTo(x, -330); ctx.lineTo(x, 840); ctx.stroke(); }
      rect(ctx, sh1, SHARED.ceiling, p.x + p.w, 1290, '#6d5140');
      // the SAME terracotta floor as the kitchen, continuing through the arch; one wood threshold marks
      // where the service side begins, so the floor reads as continuous but the zones still register
      terracotta(ctx, p.x, p.x + p.w, 5900);
      floorBoards(ctx, 5280, 6520, SHARED.floor, 1290, '#7a4e33', '#5a3825', 5900);
      rect(ctx, 5270, SHARED.floor, 5284, 1290, SHARED.brass);
      rect(ctx, 6516, SHARED.floor, 6530, 1290, SHARED.brass);
      slab(ctx, p.x, p.x + p.w, 1290, 1400);
      roomShade(ctx, p.x, SHARED.ceiling, sh0, SHARED.floor, 0.62);
    });
  },

  /** Kitchen: glazed tiles, steel pass with heat lamps, KDS wall mount, printer shelf, hood + stove. */
  async kitchen() {
    const p = new Plate({ name: 'kitchen', x: 2200, y: -450, w: 2900, h: 1850, k: 0.7 });
    const K = G.kitchen;
    await brush(p, (ctx) => {
      const rand = mulberry32(7);
      slab(ctx, p.x, p.x + p.w, -450, -330);
      // the SHARED warm plaster of the whole ground floor, with soot near the hood
      vgrad(ctx, p.x, SHARED.ceiling, p.x + p.w, SHARED.tileTop, SHARED.plaster);
      cornice(ctx, p.x, p.x + p.w);
      radial(ctx, 4560, -100, 520, [[0, 'rgba(40,30,25,0.35)'], [1, 'rgba(40,30,25,0)']]);
      // the SHARED glazed tile — the same wall material reappears behind the counter next door
      tiles(ctx, 2380, SHARED.tileTop, 4980, SHARED.floor, 56, SHARED.tileA, SHARED.tileB);
      vgrad(ctx, 2380, SHARED.tileTop, 4980, SHARED.tileTop + 50, [[0, 'rgba(255,240,200,0.25)'], [1, 'rgba(255,240,200,0)']]);
      dado(ctx, 2380, 4980);
      // the SHARED pendant rhythm, clear of the KDS wall and the extraction hood
      pendantLine(ctx, [2800, 4160]);
      // the dining-room arch (cut section): the opening the waiter and the camera both pass through
      const [hw0, hw1] = K.hatchWall;
      const [h0, h1] = K.hatch;
      archOpening(ctx, hw0, hw1, h0, h1, K.archHead, K.hatchShelf[1], ['#ffe3ae', '#efb878']);
      // printer shelf
      const [ps0, ps1, psy] = K.printerShelf;
      rect(ctx, ps0, psy, ps1, psy + 26, '#5a3a25');
      rect(ctx, ps0, psy, ps1, psy + 5, '#b98a4e');
      for (const x of [ps0 + 40, ps1 - 40]) poly(ctx, [[x - 6, psy + 26], [x + 6, psy + 26], [x + 6, psy + 90], [x - 60, psy + 26]], '#3b2a1f');
      // wall phone
      const [cpx, cpy] = K.callerPhone;
      rect(ctx, cpx - 28, cpy - 46, cpx + 28, cpy + 46, '#2c2f31');
      rect(ctx, cpx - 18, cpy - 34, cpx + 18, cpy - 12, '#9fb3ae');
      // KDS wall mount shadow + arm
      const [k0, k1, k2, k3] = K.kdsScreen;
      rect(ctx, k0 + 10, k1 + 18, k2 + 22, k3 + 26, 'rgba(10,20,18,0.45)');
      rect(ctx, (k0 + k2) / 2 - 30, -330, (k0 + k2) / 2 + 30, k1, '#2a2d2f');
      // a warm working light falls over the pass and the stove, the corners stay deep
      radial(ctx, 3600, 520, 900, [[0, 'rgba(255,196,120,0.3)'], [1, 'rgba(255,196,120,0)']], 1, 0.6);
      radial(ctx, 4560, 520, 620, [[0, 'rgba(255,170,90,0.26)'], [1, 'rgba(255,170,90,0)']], 1, 0.7);
      radial(ctx, 4300, 500, 520, [[0, 'rgba(255,186,110,0.22)'], [1, 'rgba(255,186,110,0)']], 1, 0.7);
      // heat-lamp rods and shades over the pass
      for (const x of K.heatLamps) {
        pendantRod(ctx, x, -330, 500);
        poly(ctx, [[x - 70, 560], [x + 70, 560], [x + 40, 500], [x - 40, 500]], '#2b2e30');
        rect(ctx, x - 64, 552, x + 64, 562, '#ffcf7a');
        radial(ctx, x, 640, 200, [[0, 'rgba(255,170,80,0.45)'], [1, 'rgba(255,170,80,0)']], 1, 0.5);
      }
      // pass: steel shelf + cabinet front
      const [pa0, pa1, pay] = K.pass;
      steel(ctx, pa0, pay, pa1, pay + 40);
      vgrad(ctx, pa0, pay + 40, pa1, 840, [[0, '#6f7a7e'], [1, '#4c5558']]);
      for (let x = pa0 + 20; x < pa1 - 40; x += 240) rect(ctx, x, pay + 70, x + 210, 810, 'rgba(255,255,255,0.08)');
      // prep counter under the printer: board, tomatoes, greens
      steel(ctx, 2400, 700, pa0 - 10, 740);
      vgrad(ctx, 2400, 740, pa0 - 10, 840, [[0, '#626d71'], [1, '#474f52']]);
      rect(ctx, 2520, 680, 2760, 700, '#b88452');
      for (let i = 0; i < 5; i++) radial(ctx, 2560 + i * 36, 670, 18, [[0, '#d0452c'], [0.8, '#a8321f'], [1, 'rgba(0,0,0,0)']]);
      blob(ctx, 2800, 670, 50, 22, '#5f8a3a', rand, 4, 0.95);
      // hood + stove with pots
      const [ho0, ho1, ho2, ho3] = K.hood;
      poly(ctx, [[ho0 + 60, ho1], [ho2 - 20, ho1], [ho2, ho3], [ho0 - 30, ho3]], '#3d4245');
      rect(ctx, ho0 - 30, ho3 - 20, ho2, ho3, '#6d7477');
      const [sv0, sv1, svy] = K.stove;
      rect(ctx, sv0, svy - 10, sv1, svy + 190, '#2b2d2f');
      rect(ctx, sv0, svy - 10, sv1, svy, '#8a9296');
      for (const [x, w, h] of [[4460, 110, 90], [4630, 90, 70]]) {
        rect(ctx, x - w / 2, svy - 10 - h, x + w / 2, svy - 10, '#4b5154');
        rect(ctx, x - w / 2 - 6, svy - 16 - h, x + w / 2 + 6, svy - 4 - h, '#9aa3a7');
      }
      // copper pans, hanging herbs and garlic braids: a kitchen that is worked in
      for (let i = 0; i < 4; i++) {
        radial(ctx, 3680 + i * 86, 326 + (i % 2) * 26, 36, [[0, '#e5a15c'], [0.7, '#a85f31'], [1, 'rgba(0,0,0,0)']]);
        radial(ctx, 3680 + i * 86, 318 + (i % 2) * 26, 20, [[0, 'rgba(255,225,180,0.55)'], [1, 'rgba(255,225,180,0)']]);
      }
      for (let i = 0; i < 3; i++) {
        const hx2 = 2980 + i * 74;
        ctx.strokeStyle = '#4a3a24';
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(hx2, 300); ctx.lineTo(hx2, 352); ctx.stroke();
        blob(ctx, hx2, 392, 28, 46, i === 1 ? '#8a7b3c' : '#5f6d37', rand, 5, 0.95);
      }
      // crates of vegetables under the prep counter
      for (let i = 0; i < 3; i++) {
        const cx2 = 2430 + i * 130;
        rect(ctx, cx2, 860, cx2 + 112, 960, '#6b4a30');
        rect(ctx, cx2 + 6, 848, cx2 + 106, 872, '#7d5838');
        for (let j = 0; j < 5; j++) radial(ctx, cx2 + 18 + j * 20, 852, 15, [[0, ['#c0452c', '#d08a2e', '#5f8a3a'][i]], [0.8, ['#96331f', '#a96a20', '#456b28'][i]], [1, 'rgba(0,0,0,0)']]);
      }
      // the service arch to the front counter — painted by the SAME routine as the counter side, so the
      // two plates meet on an opening that matches exactly
      const [pw0, pw1, pw2, pw3] = K.passWindow;
      archOpening(ctx, pw0, pw1, pw2, pw3, K.archHead, K.passShelf, ['#ffe9bd', '#e8bd85']);
      // past the arch, the counter room begins: this plate paints its first strip with exactly the same
      // materials the service plate uses, so where the two images meet there is no step in tone
      vgrad(ctx, pw1, SHARED.ceiling, p.x + p.w, SHARED.tileTop, SHARED.plaster);
      cornice(ctx, pw1, p.x + p.w);
      tiles(ctx, pw1, SHARED.tileTop, p.x + p.w, SHARED.dadoY, 56, SHARED.tileA, SHARED.tileB);
      dado(ctx, pw1, p.x + p.w);
      vgrad(ctx, pw1, SHARED.dadoY + 14, p.x + p.w, SHARED.floor, [[0, '#4d3526'], [1, '#3a2719']]);
      // the SHARED terracotta floor: it runs on through the arch into the front of house
      terracotta(ctx, p.x, p.x + p.w, 3650);
      slab(ctx, p.x, p.x + p.w, 1290, 1400);
      roomShade(ctx, hw1, SHARED.ceiling, pw0, SHARED.floor, 0.6);
    }, { alpha: cutRect(p, [[p.x, p.y, K.hatchWall[0], p.y + p.h]]) });
  },

  // small props ---------------------------------------------------------------------
  async props() {
    const rand = mulberry32(99);
    // six dishes, top view (menu tiles + phone menu)
    {
      const c = createCanvas(720, 120);
      const ctx = c.getContext('2d');
      const dishes = [
        ['#f4efe6', '#e38d45', '#c86d35'],
        ['#f4efe6', '#8e5a3b', '#6d4430'],
        ['#f4efe6', '#8aa25a', '#c8643b'],
        ['#e9d3a0', '#d69a4a', '#c8643b'],
        ['#e9eef0', '#fbfbf6', '#dfe6e6'],
        ['#f4efe6', '#e3a83b', '#b8693a'],
      ];
      dishes.forEach(([plate, food, accent], i) => {
        const x = 60 + i * 120;
        radial(ctx, x, 60, 52, [[0, plate], [0.9, plate], [1, 'rgba(0,0,0,0)']]);
        radial(ctx, x, 60, 34, [[0, food], [0.8, food], [1, 'rgba(0,0,0,0)']]);
        for (let k = 0; k < 5; k++) radial(ctx, x + (rand() - 0.5) * 36, 60 + (rand() - 0.5) * 36, 7, [[0, accent], [1, 'rgba(0,0,0,0)']]);
      });
      await writeFile(path.join(OUT, 'props/dishes.png'), await c.encode('png'));
    }
    // served plate, side view (kitchen pass)
    {
      const c = createCanvas(160, 70);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f4efe6';
      ctx.beginPath(); ctx.ellipse(80, 52, 72, 14, 0, 0, Math.PI * 2); ctx.fill();
      blob(ctx, 80, 36, 40, 20, '#8e5a3b', rand, 5, 1);
      blob(ctx, 60, 34, 16, 10, '#8aa25a', rand, 3, 1);
      await writeFile(path.join(OUT, 'props/served-plate.png'), await c.encode('png'));
    }
    // paper texture tile
    {
      const c = createCanvas(256, 256);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f6eedc';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(${rand() < 0.5 ? '170,140,100' : '255,255,245'},${0.04 + rand() * 0.05})`;
        ctx.fillRect(rand() * 256, rand() * 256, 2 + rand() * 18, 1 + rand() * 2);
      }
      await writeFile(path.join(OUT, 'props/paper.png'), await c.encode('png'));
    }
  },
};

for (const [name, fn] of Object.entries(PLATES)) {
  if (only.length && !only.includes(name)) continue;
  const t = Date.now();
  console.log(`chapter4 ${name}…`);
  await fn();
  console.log(`  ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
