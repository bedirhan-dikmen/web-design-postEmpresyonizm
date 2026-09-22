import G from './geometry.json';

/**
 * Chapter 4 formations for the persistent Module Field.
 *
 *   1 menu.tiles → 2 ticket.order → 3 kds.grid → 4 pos.receipt → 5 stock.bins → 6 ledger.lines → 7 chart.columns
 *   (0 = qr.tableTent, owned by the Chapter 3 code path)
 *
 * Every formation is a list of slots in LOCAL design units around its anchor.
 * Gold slots are always listed first: the Chapter 3 gold modules land in them, so the
 * gold "thing to follow" keeps its identity across the whole chapter.
 */

export type SlotColor = 'ink' | 'gold' | 'cream' | 'terracotta' | 'ochre' | 'sage' | 'olive';

export interface Slot {
  x: number;
  y: number;
  size: number;
  color: SlotColor;
  gold: boolean;
  /** receipt only: payment dab burst direction (design units at burst = 1) */
  bx?: number;
  by?: number;
}

export interface Formation {
  key: string;
  slots: Slot[];
  goldCount: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function finish(key: string, gold: Slot[], rest: Slot[]): Formation {
  return { key, slots: [...gold, ...rest], goldCount: gold.length };
}

const ring = (cx: number, cy: number, w: number, h: number, step: number, size: number, color: SlotColor, gold = false): Slot[] => {
  const out: Slot[] = [];
  const nx = Math.max(1, Math.round(w / step));
  const ny = Math.max(1, Math.round(h / step));
  for (let i = 0; i <= nx; i++) {
    out.push({ x: cx - w / 2 + (w * i) / nx, y: cy - h / 2, size, color, gold });
    out.push({ x: cx - w / 2 + (w * i) / nx, y: cy + h / 2, size, color, gold });
  }
  for (let j = 1; j < ny; j++) {
    out.push({ x: cx - w / 2, y: cy - h / 2 + (h * j) / ny, size, color, gold });
    out.push({ x: cx + w / 2, y: cy - h / 2 + (h * j) / ny, size, color, gold });
  }
  return out;
};

// ------------------------------------------------------------------ 1 menu.tiles

export const MENU = (() => {
  const { tile, gap, header, selected } = G.menu;
  const W = 3 * tile + 2 * gap;
  const H = header + 2 * tile + gap;
  const tiles = [0, 1, 2, 3, 4, 5].map((i) => ({
    x: ((i % 3) - 1) * (tile + gap),
    y: -H / 2 + header + tile / 2 + Math.floor(i / 3) * (tile + gap),
  }));
  return { W, H, tile, header, selected, tiles };
})();

function menuTiles(): Formation {
  const gold: Slot[] = [];
  const rest: Slot[] = [];
  MENU.tiles.forEach((t, i) => {
    const slots = ring(t.x, t.y, MENU.tile - 25, MENU.tile - 25, 25, 20, i === MENU.selected ? 'gold' : 'ink', i === MENU.selected);
    (i === MENU.selected ? gold : rest).push(...slots);
  });
  for (let x = -225; x <= 225; x += 25) rest.push({ x, y: -MENU.H / 2 + 40, size: 14, color: 'ink', gold: false });
  rest.push(...ring(0, 0, MENU.W + 44, MENU.H + 44, 22, 11, 'ink'));
  return finish('menu.tiles', gold, rest);
}

// ------------------------------------------------------------------ 2 ticket.order

export const TICKET = { w: 180, h: 250 };

function ticketOrder(): Formation {
  const gold: Slot[] = [];
  const rest: Slot[] = [];
  for (const y of [-95, -82]) for (let x = -64; x <= 64; x += 16) gold.push({ x, y, size: 12, color: 'gold', gold: true });
  const rows = [7, 10, 6, 9, 5, 8];
  rows.forEach((len, r) => {
    for (let c = 0; c < len; c++) rest.push({ x: -70 + c * 13, y: -50 + r * 24, size: 10, color: 'ink', gold: false });
    rest.push({ x: 66, y: -50 + r * 24, size: 10, color: 'ink', gold: false });
  });
  rest.push(...ring(0, 0, TICKET.w, TICKET.h, 16, 7, 'ink'));
  return finish('ticket.order', gold, rest);
}

// ------------------------------------------------------------------ 3 kds.grid

export const KDS = { cards: [-150, 0, 150], cardW: 128, cardH: 220, cardY: 22 };

function kdsGrid(): Formation {
  const gold: Slot[] = [];
  const rest: Slot[] = [];
  KDS.cards.forEach((cx, i) => {
    const active = i === 0;
    const slots = ring(cx, KDS.cardY, KDS.cardW, KDS.cardH, 16, 11, active ? 'gold' : 'cream', active);
    (active ? gold : rest).push(...slots);
    // three order lines per card; the lower third of each card stays free for the DOM status + timer
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 5; c++)
        if (!(i > 0 && r === 2 && c > 2)) rest.push({ x: cx - 40 + c * 20, y: KDS.cardY - 62 + r * 34, size: 11, color: 'cream', gold: false });
  });
  for (let x = -210; x <= 210; x += 30) rest.push({ x, y: -128, size: 9, color: 'cream', gold: false });
  return finish('kds.grid', gold, rest);
}

// ------------------------------------------------------------------ 4 pos.receipt

export const RECEIPT = { w: 130, h: 220 };

function posReceipt(): Formation {
  const rand = mulberry32(404);
  const gold = ring(0, 0, RECEIPT.w, RECEIPT.h, 14, 10, 'gold', true).map((s) => {
    const a = -Math.PI / 2 + (rand() - 0.5) * 2.6;
    const r = 60 + rand() * 90;
    return { ...s, bx: Math.cos(a) * r, by: Math.sin(a) * r };
  });
  const rest: Slot[] = [];
  const lens = [6, 8, 5, 7, 8, 4, 7, 6];
  lens.forEach((len, r) => {
    for (let c = 0; c < len; c++) rest.push({ x: -48 + c * 12, y: -80 + r * 22, size: 9, color: 'ink', gold: false });
  });
  return finish('pos.receipt', gold, rest);
}

// ------------------------------------------------------------------ 5 stock.bins

export const BINS = { xs: G.storeroom.binXs, size: G.storeroom.binSize, levels: [5, 3, 6, 4], colors: ['terracotta', 'ochre', 'sage', 'olive'] as SlotColor[] };

function stockBins(): Formation {
  const gold: Slot[] = [];
  const rest: Slot[] = [];
  BINS.xs.forEach((bx, b) => {
    const [, bh] = BINS.size;
    const levels = BINS.levels[b];
    for (let r = 0; r < levels; r++)
      for (let c = 0; c < 6; c++) {
        const slot: Slot = { x: bx - 60 + c * 24, y: bh / 2 - 14 - r * 24, size: 20, color: BINS.colors[b], gold: false };
        // the fresh stock movement: top layer of the first bin
        if (b === 0 && r === levels - 1) gold.push({ ...slot, color: 'gold', gold: true });
        else rest.push(slot);
      }
  });
  return finish('stock.bins', gold, rest);
}

// ------------------------------------------------------------------ 6 ledger.lines

export const LEDGER = {
  w: G.office.ledgerSheet[0],
  h: G.office.ledgerSheet[1],
  rowY: [-105, -71, -37, -3, 31, 65, 99],
  labels: ['Satış · Masa 7', 'Stok hareketi', 'Satın alma', 'Tedarikçi cari', 'E-Fatura', 'Kasa', 'Gün sonu'],
  lens: [12, 9, 14, 8, 11, 10, 7],
};

function ledgerLines(): Formation {
  const gold: Slot[] = [];
  const rest: Slot[] = [];
  const check: [number, number][] = [[128, 95], [137, 104], [146, 113], [157, 103], [168, 91], [179, 79], [190, 67], [201, 56], [212, 45]];
  for (const [x, y] of check) gold.push({ x, y, size: 13, color: 'gold', gold: true });
  LEDGER.rowY.forEach((y, r) => {
    for (let c = 0; c < LEDGER.lens[r]; c++) rest.push({ x: -60 + c * 15, y, size: 12, color: 'ink', gold: false });
  });
  return finish('ledger.lines', gold, rest);
}

// ------------------------------------------------------------------ 7 chart.columns

export const CHART = { heights: [5, 7, 6, 9, 8, 11, 14], spacing: 190, cell: 44, labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Bugün'] };

/** 4.7 stage 1: the report first appears as a miniature chart on the office monitor (scale of CHART, centre offset). */
export const MINI_CHART = { scale: 0.27, dy: 120 };

function chartColumns(): Formation {
  const gold: Slot[] = [];
  const rest: Slot[] = [];
  CHART.heights.forEach((h, i) => {
    const bx = (i - 3) * CHART.spacing;
    const today = i === CHART.heights.length - 1;
    for (let j = 0; j < h; j++)
      for (const dx of [-CHART.cell, 0, CHART.cell]) {
        const slot: Slot = { x: bx + dx, y: -CHART.cell / 2 - j * CHART.cell, size: 38, color: today ? 'gold' : 'ink', gold: today };
        (today ? gold : rest).push(slot);
      }
  });
  return finish('chart.columns', gold, rest);
}

/**
 * Phase 4.3 placements: each formation's local scale where it lives in the story.
 *   1 menu → inside the guest's phone (tiny, at table depth)   2 order card → cashier screen detail panel
 *   4 bill → cashier screen detail panel                       5 stock → office monitor
 */
export const FORM_SCALE = [1, 0.15, 0.6, 1, 0.6, 0.5, 1, 1];

export const FORMATIONS: Formation[] = [
  { key: 'qr.tableTent', slots: [], goldCount: 0 }, // index 0: Chapter 3 positions
  menuTiles(),
  ticketOrder(),
  kdsGrid(),
  posReceipt(),
  stockBins(),
  ledgerLines(),
  chartColumns(),
];

/**
 * Finder-square slots (outer 7×7 ring) for the Chapter 5 hand-off, in DRAWING ORDER:
 * clockwise from the top-left corner, so a partially assembled ring always reads as a square
 * being drawn (three sides complete, the last side closing) rather than as scattered dabs.
 */
export const FINDER_SLOTS = (() => {
  // Phase 4.9: in design-screen space, bottom-left of the final management frame
  const [cx, cy, cell] = G.finder.screen;
  const center = [cx, cy];
  const ring: [number, number][] = [];
  for (let c = 0; c < 7; c++) ring.push([0, c]); // top →
  for (let r = 1; r < 7; r++) ring.push([r, 6]); // right ↓
  for (let c = 5; c >= 0; c--) ring.push([6, c]); // bottom ←
  for (let r = 5; r >= 1; r--) ring.push([r, 0]); // left ↑
  return ring.map(([r, c]) => ({ x: center[0] + (c - 3) * cell, y: center[1] + (r - 3) * cell }));
})();

/** The finder's 3×3 core (the part that became the portal in Chapter 2), centre first. */
export const FINDER_CORE = (() => {
  const [cx, cy, cell] = G.finder.screen;
  const center = [cx, cy];
  const order: [number, number][] = [[0, 0], [-1, 0], [0, 1], [1, 0], [0, -1], [-1, -1], [1, -1], [1, 1], [-1, 1]];
  return order.map(([dx, dy]) => ({ x: center[0] + dx * cell, y: center[1] + dy * cell }));
})();

/**
 * Stable module → slot assignment. `goldModules` are the Chapter 3 gold modules; they take the
 * first gold slots, everything else fills the remaining slots in order (cycling if there are more
 * modules than slots — duplicates sit exactly on top of each other).
 */
export function assignSlots(formation: Formation, moduleIsGold: boolean[]): number[] {
  const n = formation.slots.length;
  const out = new Array<number>(moduleIsGold.length);
  let g = 0;
  moduleIsGold.forEach((isGold, i) => {
    if (isGold && g < formation.goldCount) out[i] = g++;
  });
  const free: number[] = [];
  for (let s = g; s < n; s++) free.push(s);
  let k = 0;
  moduleIsGold.forEach((isGold, i) => {
    if (out[i] !== undefined) return;
    out[i] = free.length ? free[k++ % free.length] : k++ % n;
  });
  return out;
}
