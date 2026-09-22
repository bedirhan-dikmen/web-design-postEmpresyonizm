import { DAB_ATLAS } from '@/lib/prototype/sceneConfig';

/**
 * The homepage hero's module field: the same painted square dabs as the film's opening, drifting like its
 * stars. On load they fly in and assemble the Kerinti logo (time-driven, not scroll-driven: it is the page's
 * loading moment), then the paint settles into the crisp logo underneath — the same way the film's final QR
 * settles into a real code.
 *
 * Coordinates are canvas CSS pixels. The logo's target is a DOM box (the "slot"), so the formation follows the
 * responsive layout: beside the copy on desktop, above it on a phone.
 */

const COLORS = { star: '#eaf0f7', mist: '#9cc7e0', gold: '#d80017' };
/** the logo's own red (kerinti.com.tr), in three painted values so the formation reads as brushwork */
const REDS = ['#e30613', '#c9000f', '#f2303b'];

/** the logo grid: columns across the logo's width (rows follow its aspect) */
const COLS = 64;
/** timing (seconds from start) */
const T = {
  sweep: 1.0, // left → right: the logo is "written" by the arriving modules
  jitter: 0.35,
  fly: 1.25,
  settleAt: 2.45, // the paint settles into the crisp logo
  settleDur: 0.9,
} as const;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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

interface Mod {
  /** start: a star somewhere on the stage (fractions of the canvas) */
  sx: number;
  sy: number;
  s0: number;
  /** target cell in the logo grid, or -1 for an ambient star that never joins */
  cell: number;
  delay: number;
  arc: number;
  variant: number;
  ph: number;
  color: string;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class LogoField {
  private atlas: HTMLImageElement | null = null;
  private atlasCell: number = DAB_ATLAS.cell;
  private tinted = new Map<string, HTMLCanvasElement>();
  private cells: [number, number][] = [];
  private rows = 1;
  private mods: Mod[] = [];

  /** atlas = the film's dab atlas; mask = the logo (its alpha decides which grid cells are filled) */
  constructor(atlas: HTMLImageElement, mask: HTMLImageElement, ambient: number) {
    this.atlas = atlas;
    this.atlasCell = atlas.naturalHeight || DAB_ATLAS.cell;
    this.rows = Math.max(1, Math.round((COLS * mask.naturalHeight) / mask.naturalWidth));

    // sample the logo on a COLS × rows grid (the browser averages each cell while scaling down)
    const c = document.createElement('canvas');
    c.width = COLS;
    c.height = this.rows;
    const x = c.getContext('2d', { willReadFrequently: true })!;
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = 'high';
    x.drawImage(mask, 0, 0, COLS, this.rows);
    const px = x.getImageData(0, 0, COLS, this.rows).data;
    for (let r = 0; r < this.rows; r++) for (let col = 0; col < COLS; col++) if (px[(r * COLS + col) * 4 + 3] > 110) this.cells.push([col, r]);

    const rand = mulberry32(2026);
    const star = (): [number, number] => [rand() * 1.08 - 0.04, rand() * 0.9 - 0.02];
    const make = (cell: number, u: number): Mod => {
      const [sx, sy] = star();
      const g = rand();
      return {
        sx,
        sy,
        s0: 3 + rand() * 6,
        cell,
        delay: u * T.sweep + rand() * T.jitter,
        arc: (rand() - 0.3) * 120,
        variant: (rand() * DAB_ATLAS.count) | 0,
        ph: rand() * Math.PI * 2,
        color: cell < 0 ? (g < 0.12 ? COLORS.gold : g < 0.3 ? COLORS.mist : COLORS.star) : g < 0.18 ? REDS[1] : g < 0.3 ? REDS[2] : REDS[0],
      };
    };
    this.cells.forEach(([col], i) => this.mods.push(make(i, col / COLS)));
    for (let i = 0; i < ambient; i++) this.mods.push(make(-1, 0));
  }

  /** Dab sprite tinted with a colour, preserving the painted texture of the atlas (as in the film). */
  private sprite(variant: number, color: string): HTMLCanvasElement | null {
    if (!this.atlas) return null;
    const key = `${variant}|${color}`;
    let c = this.tinted.get(key);
    if (c) return c;
    const cell = this.atlasCell;
    const size = Math.min(cell, 128);
    c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d')!;
    x.fillStyle = color;
    x.fillRect(0, 0, size, size);
    x.globalCompositeOperation = 'multiply';
    x.drawImage(this.atlas, variant * cell, 0, cell, cell, 0, 0, size, size);
    x.globalCompositeOperation = 'destination-in';
    x.drawImage(this.atlas, variant * cell, 0, cell, cell, 0, 0, size, size);
    this.tinted.set(key, c);
    return c;
  }

  /** how far the paint has settled into the crisp logo (0 → 1): the page fades the crisp logo in with it */
  settle(elapsed: number) {
    return ease(clamp01((elapsed - T.settleAt) / T.settleDur));
  }

  /**
   * Draw one frame. `elapsed` = seconds since the formation started (Infinity = already formed, e.g. reduced
   * motion); `time` drives the ambient drift; `still` disables it.
   */
  draw(ctx: CanvasRenderingContext2D, W: number, H: number, dpr: number, slot: Box, elapsed: number, time: number, still: boolean) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const cw = slot.w / COLS;
    const settled = this.settle(elapsed);
    const drift = still ? 0 : 1;
    for (const m of this.mods) {
      // the star
      let x = m.sx * W + Math.sin(time * 0.22 + m.ph) * 14 * drift;
      let y = m.sy * H + Math.cos(time * 0.17 + m.ph * 1.3) * 9 * drift;
      let s = m.s0;
      let rot = (m.ph - 3) * 0.12;
      let a = 0.55 + 0.35 * Math.sin(time * 1.2 + m.ph * 3) ** 2 * drift;
      if (m.cell >= 0) {
        const [col, row] = this.cells[m.cell];
        const tx = slot.x + (col + 0.5) * cw + Math.sin(time * 0.9 + m.ph) * 0.6 * drift;
        const ty = slot.y + (row + 0.5) * cw;
        const e = ease(clamp01((elapsed - m.delay) / T.fly));
        x = lerp(x, tx, e);
        y = lerp(y, ty, e) - Math.sin(Math.PI * e) * m.arc;
        s = lerp(s, cw * 1.02, e);
        rot = lerp(rot, (m.ph - 3) * 0.025, e);
        // once formed, the paint steps back and the crisp logo carries the shape; the texture stays visible
        a = lerp(a, 0.95, e) * (1 - 0.72 * settled);
      }
      this.dab(ctx, x * dpr, y * dpr, s * dpr, rot, m.variant, m.color, a);
    }
  }

  private dab(ctx: CanvasRenderingContext2D, px: number, py: number, ps: number, rot: number, variant: number, color: string, alpha: number) {
    if (alpha <= 0.01 || ps <= 0.3) return;
    const spr = this.sprite(variant, color);
    if (!spr) return;
    const cos = Math.cos(rot) * ps;
    const sin = Math.sin(rot) * ps;
    ctx.globalAlpha = alpha;
    ctx.setTransform(cos, sin, -sin, cos, px, py);
    ctx.drawImage(spr, -0.5, -0.5, 1, 1);
  }
}

/** when the formation is complete (seconds), for the copy that follows it */
export const LOGO_FORMED_AT = T.settleAt;
