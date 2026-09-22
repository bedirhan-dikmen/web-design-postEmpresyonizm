import { cameraFor, layerTransform, VC, type Camera, type FilmState, type LayerXf, type Viewport } from './camera';
import { DAB_ATLAS, GLASS_B, QR_A, TENT_B } from './sceneConfig';
import { drawFlowLine } from './chapter4/flowLine';
import { FINDER_CORE, FINDER_SLOTS, FORMATIONS, FORM_SCALE, MINI_CHART, assignSlots, type SlotColor } from './chapter4/formations';
import { ANCHOR_S, pointAt, type PathPoint } from './chapter4/flowPath';
import G4 from './chapter4/geometry.json';
import { orientOf, project as stageProject, stageFor, type Stage } from './chapter4/stage3d';
import G5 from './chapter5/geometry.json';
import { getFinalQr } from './chapter5/finalQr';

/**
 * The Module Field: one fixed pool of square paint dabs.
 *
 * Every module has a stable identity and a position in each formation:
 *   World A: star (scattered)  → QR cell
 *   World B: dust (in the air) → table-tent QR cell / window frame / stays dust
 *
 * Roles
 *   DATA   QR cell in A, same QR cell on the table tent in B
 *   RING   ring of the top-left finder in A, the window frame in B
 *   GOLD   centre 3×3 of the top-left finder: carried through the portal by the camera
 *   TENT   ambient star in A, becomes the tent QR's own finder ring in B
 *   DUST   ambient star in A, dust mote in the sunbeam in B
 */
const DATA = 0;
const RING = 1;
const GOLD = 2;
const TENT = 3;
const DUST = 4;

const COLORS = {
  star: '#eaf0f7',
  mist: '#9cc7e0',
  // the accent ('gold' by history): the red of the Kerinti logo — see app/globals.css
  gold: '#d80017',
  goldDeep: '#b00013',
  cream: '#fff1cf',
  ink: '#1f3263',
  // Chapter 4
  terracotta: '#c8643b',
  ochre: '#e3a83b',
  sage: '#8a9a5b',
  olive: '#a79a4a',
};

const SLOT_COLORS: Record<SlotColor, string> = {
  ink: COLORS.ink,
  gold: COLORS.gold,
  cream: COLORS.cream,
  terracotta: COLORS.terracotta,
  ochre: COLORS.ochre,
  sage: COLORS.sage,
  olive: COLORS.olive,
};

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

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Stylised (non-functional) 25×25 QR matrix — the final scannable QR comes later. */
export function buildQrMatrix(n = 25, seed = 2026): boolean[][] {
  const rand = mulberry32(seed);
  const m: (boolean | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));
  const finder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++)
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
        const ring = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        m[rr][cc] = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (ring || core);
      }
  };
  finder(0, 0);
  finder(0, n - 7);
  finder(n - 7, 0);
  for (let i = 8; i < n - 8; i++) {
    m[6][i] = i % 2 === 0;
    m[i][6] = i % 2 === 0;
  }
  const a = n - 7;
  for (let r = -2; r <= 2; r++)
    for (let c = -2; c <= 2; c++) m[a + r][a + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (m[r][c] === null) m[r][c] = rand() < 0.47;
  return m as boolean[][];
}

interface Mod {
  role: number;
  variant: number;
  phase: number;
  // World A
  sx: number; sy: number; sd: number; ss: number; // star
  qx: number; qy: number; qs: number; // QR cell (depth 0)
  aDelay: number;
  curve: number;
  starColor: string;
  // World B
  dx: number; dy: number; dd: number; ds: number; // dust
  tx: number; ty: number; td: number; ts: number; // tent / frame target
  bDelay: number;
  // Gold only
  carryX: number; carryY: number;
  beamX: number; beamY: number;
}

export class ModuleField {
  private mods: Mod[] = [];
  private atlas: HTMLImageElement | null = null;
  /** actual atlas cell size in px, read from the loaded image (see DAB_ATLAS) */
  private atlasCell: number = DAB_ATLAS.cell;
  private tinted = new Map<string, HTMLCanvasElement>();
  private glowSprite: HTMLCanvasElement | null = null;
  private xf: LayerXf = { m: 1, tx: 0, ty: 0, ok: true };
  private flickSeeds: { a: number; u: number; w: number; v: number }[] = [];
  /** Chapter 4: participating modules (the Chapter 3 table-card QR) and their slot per formation */
  private ch4Mods: { m: Mod; slots: number[]; delay: number; curve: number }[] = [];
  private finderOf = new Map<Mod, number>();
  private pp: PathPoint = { x: 0, y: 0, a: 0 };
  private motes: { room: AmbientRoom; x: number; y: number; ph: number; v: number; s: number }[] = [];
  /** Chapter 5: where each operational module drifts in the Kerinti sky, and its night colour */
  private drift5: { x: number; y: number; size: number; color: string; ph: number; arc: number }[] = [];
  /** Chapter 5: lit windows of the night city (square dabs), stars of the Kerinti sky, the dissolving panel */
  private city5: { x: number; y: number; s: number; color: string; ph: number; v: number }[] = [];
  private stars5: { x: number; y: number; s: number; ph: number; v: number }[] = [];
  private panel5: { x: number; y: number; s: number; color: string; ph: number; v: number }[] = [];
  /** debug: screen-space centroid and count of gold dabs drawn in the last Chapter 4 frame */
  debugGold = { x: 0, y: 0, n: 0 };

  constructor() {
    const rand = mulberry32(7);
    const qr = buildQrMatrix(QR_A.n);
    const n = QR_A.n;

    const tentCell = (r: number, c: number) => ({
      x: TENT_B.qr.x + (c + 0.5) * TENT_B.qr.cell,
      y: TENT_B.qr.y + (r + 0.5) * TENT_B.qr.cell,
    });
    const frameCell = 72;
    const frameCellPos = (r: number, c: number) => ({
      x: GLASS_B.x0 + (c - 1 + 0.5) * frameCell,
      y: GLASS_B.y0 + (r - 1 + 0.5) * frameCell,
    });

    const star = () => {
      // keep the headline area (left) calmer
      let x = -120 + rand() * 2160;
      const y = -60 + rand() * 960;
      if (x < 820 && y > 260 && y < 720 && rand() < 0.6) x = 820 + rand() * 1200;
      return { x, y };
    };
    const dust = () => {
      // mostly inside the sunbeam volume, some drifting around the room
      if (rand() < 0.7) {
        const t = rand();
        return { x: lerp(560, 1300, t) + (rand() - 0.5) * 360, y: lerp(360, 760, t) + (rand() - 0.5) * 260 };
      }
      return { x: -200 + rand() * 2300, y: 40 + rand() * 900 };
    };

    const make = (role: number, r: number, c: number): Mod => {
      const s = star();
      const d = dust();
      const q = { x: QR_A.x + (c + 0.5) * QR_A.cell, y: QR_A.y + (r + 0.5) * QR_A.cell };
      const finderDist = Math.min(Math.hypot(r - 3, c - 3), Math.hypot(r - 3, c - (n - 4)), Math.hypot(r - (n - 4), c - 3));
      const t = tentCell(r, c);
      return {
        role,
        variant: (rand() * DAB_ATLAS.count) | 0,
        phase: rand() * Math.PI * 2,
        sx: s.x, sy: s.y,
        sd: role === DATA || role === RING || role === GOLD ? -rand() * 0.35 : -0.06 - rand() * 0.5,
        ss: 5 + rand() * 7,
        qx: q.x, qy: q.y,
        qs: QR_A.cell * 0.94,
        // finders first, then the rest sweeping in from the finder corners
        aDelay: role === DATA || role === RING || role === GOLD ? clamp01(finderDist / 26) * 0.5 + rand() * 0.06 : 0,
        curve: (rand() - 0.5) * 260,
        starColor: rand() < 0.2 ? COLORS.mist : rand() < 0.1 ? COLORS.gold : COLORS.star,
        dx: d.x, dy: d.y, dd: -0.07 - rand() * 0.42, ds: 3 + rand() * 5,
        tx: t.x, ty: t.y, td: TENT_B.depth, ts: TENT_B.qr.cell * 0.98,
        bDelay: clamp01(Math.hypot(r - 12, c - 12) / 18) * 0.45 + rand() * 0.08,
        carryX: 0, carryY: 0, beamX: 0, beamY: 0,
      };
    };

    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        if (!qr[r][c]) continue;
        const inTopLeftFinder = r < 7 && c < 7;
        const isCore = inTopLeftFinder && r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const role = inTopLeftFinder ? (isCore ? GOLD : RING) : DATA;
        const m = make(role, r, c);
        if (role === RING) {
          const f = frameCellPos(r, c);
          m.tx = f.x;
          m.ty = f.y;
          m.td = 0;
          m.ts = frameCell * 0.9;
        }
        if (role === GOLD) {
          m.carryX = VC.x + (c - 3) * 74 + (rand() - 0.5) * 20;
          m.carryY = VC.y + (r - 3) * 74 + (rand() - 0.5) * 20;
          m.beamX = 760 + (c - 3) * 70 + (rand() - 0.5) * 40;
          m.beamY = 520 + (r - 3) * 60 + (rand() - 0.5) * 40;
        }
        this.mods.push(m);
      }

    // ambient modules: the tent's own top-left finder ring + free dust
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++) {
        if (!(r === 0 || r === 6 || c === 0 || c === 6)) continue;
        this.mods.push(make(TENT, r, c));
      }
    for (let i = 0; i < 170; i++) {
      const m = make(DUST, 0, 0);
      m.bDelay = rand();
      this.mods.push(m);
    }

    for (let i = 0; i < 90; i++) this.flickSeeds.push({ a: rand() * Math.PI * 2, u: rand(), w: 0.6 + rand() * 0.8, v: (rand() * DAB_ATLAS.count) | 0 });

    // Chapter 4 (separate RNG, so the Chapters 1–3 module data stay identical)
    const r4 = mulberry32(4004);
    const participants = this.mods.filter((m) => m.role === DATA || m.role === TENT || m.role === GOLD);
    const isGold = participants.map((m) => m.role === GOLD);
    const perFormation = FORMATIONS.map((f) => (f.slots.length ? assignSlots(f, isGold) : []));
    this.ch4Mods = participants.map((m, i) => ({ m, slots: perFormation.map((a) => a[i] ?? 0), delay: r4() * 0.35, curve: 20 + r4() * 70 }));
    this.mods.filter((m) => m.role === DUST).slice(0, FINDER_SLOTS.length + FINDER_CORE.length).forEach((m, i) => this.finderOf.set(m, i));
    // Chapter 4 ambient motes: each room keeps a little life in the air (dust in light, steam, evening sparks)
    const ra = mulberry32(4242);
    for (const room of AMBIENT_ROOMS)
      for (let i = 0; i < room.n; i++)
        this.motes.push({ room, x: room.x0 + ra() * (room.x1 - room.x0), y: room.y0 + ra() * (room.y1 - room.y0), ph: ra() * Math.PI * 2, v: (ra() * DAB_ATLAS.count) | 0, s: room.size * (0.6 + ra() * 0.8) });

    // ── Chapter 5 ──
    const r5 = mulberry32(5005);
    const [dcx, dcy] = G5.drift.center;
    this.drift5 = this.ch4Mods.map(() => {
      // an even scatter inside an ellipse: Chapter 1's star field, again
      const a = r5() * Math.PI * 2;
      const d = Math.sqrt(r5());
      const g = r5();
      return {
        x: dcx + Math.cos(a) * d * G5.drift.rx,
        y: dcy + Math.sin(a) * d * G5.drift.ry,
        size: 18 + r5() * 22,
        color: g < 0.3 ? COLORS.gold : g < 0.45 ? COLORS.mist : COLORS.star,
        ph: r5() * Math.PI * 2,
        arc: 300 + r5() * 900,
      };
    });
    const [gx0, gy0, ox0, oy0] = G5.neighbours.grid;
    for (const [x0, x1, top] of G5.neighbours.rects)
      for (let y = top + oy0 + 70; y < 760; y += gy0)
        for (let x = x0 + ox0 + 55; x < x1 - 70; x += gx0)
          if (r5() < 0.42) this.city5.push({ x, y, s: 70 + r5() * 30, color: r5() < 0.72 ? COLORS.gold : COLORS.cream, ph: r5() * Math.PI * 2, v: (r5() * DAB_ATLAS.count) | 0 });
    for (let i = 0; i < 110; i++)
      this.stars5.push({ x: -2000 + r5() * 21000, y: -11800 + r5() * 6600, s: 14 + r5() * 26, ph: r5() * Math.PI * 2, v: (r5() * DAB_ATLAS.count) | 0 });
    // the operations panel of Chapter 4's final frame (screen space, design px), as square dabs:
    // four KPIs, twelve table tiles in their status colours, and the module chips
    const kpiColors = ['#d80017', '#9fc9c2', '#e3a83b', '#7dffb0'];
    const tileColors = ['#8fa3a0', '#9fc9c2', '#9fc9c2', '#8fa3a0', '#e3a83b', '#d80017', '#7dffb0', '#8fa3a0', '#d80017', '#9fc9c2', '#8fa3a0', '#d80017'];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) this.panel5.push({ x: 1100 + i * 129 + j * 24, y: 290, s: 16, color: kpiColors[i], ph: r5() * 6.28, v: (r5() * DAB_ATLAS.count) | 0 });
    for (let t = 0; t < 12; t++) for (let j = 0; j < 2; j++) this.panel5.push({ x: 1096 + (t % 4) * 129 + j * 30, y: 352 + Math.floor(t / 4) * 50, s: 14, color: tileColors[t], ph: r5() * 6.28, v: (r5() * DAB_ATLAS.count) | 0 });
    for (let c = 0; c < 7; c++) this.panel5.push({ x: 1090 + c * 74, y: 530, s: 15, color: COLORS.gold, ph: r5() * 6.28, v: (r5() * DAB_ATLAS.count) | 0 });
  }

  setAtlas(img: HTMLImageElement) {
    this.atlas = img;
    this.tinted.clear();
    this.atlasCell = img.naturalHeight || DAB_ATLAS.cell;
    if (img.naturalHeight !== DAB_ATLAS.cell || img.naturalWidth !== img.naturalHeight * DAB_ATLAS.count) {
      console.warn(
        `[dabs] atlas is ${img.naturalWidth}×${img.naturalHeight}; expected ${DAB_ATLAS.count} cells of ${DAB_ATLAS.cell}px. Using ${this.atlasCell}px cells.`,
      );
    }
    const g = document.createElement('canvas');
    g.width = g.height = 128;
    const gx = g.getContext('2d')!;
    const grad = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,72,84,0.6)');
    grad.addColorStop(0.35, 'rgba(216,0,23,0.22)');
    grad.addColorStop(1, 'rgba(216,0,23,0)');
    gx.fillStyle = grad;
    gx.fillRect(0, 0, 128, 128);
    this.glowSprite = g;
  }

  /** Dab sprite tinted with a colour, preserving the painted texture of the atlas. */
  private sprite(variant: number, color: string): HTMLCanvasElement | null {
    if (!this.atlas) return null;
    const key = `${variant}|${color}`;
    let c = this.tinted.get(key);
    if (c) return c;
    const cell = this.atlasCell;
    const size = Math.min(cell, DAB_ATLAS.tintCell);
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

  draw(ctx: CanvasRenderingContext2D, st: FilmState, vp: Viewport, dpr: number, time: number) {
    const { b, ox, oy } = vp;
    const K = b * dpr;
    const inB = st.world >= 0.5;
    const camA = cameraFor('A', st);
    const camB = cameraFor('B', st);
    const xf = this.xf;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const ch4On = inB && st.form > 1e-6;
    if (inB && st.flow > 0) {
      layerTransform(camB, 0, xf);
      drawFlowLine(ctx, st.flow, xf, vp, dpr, st.day);
    }

    // Chapter 4 (4.9): the section can be turned in 3D; every World B dab goes through the same matrix as the DOM
    const stage: Stage | null = inB && st.ch4 >= 0.5 ? stageFor(orientOf(st), camB, vp) : null;
    const turned = !!stage && stage.on;
    /** CSS px of a design-screen point on the wall plane, and its local scale */
    const toPx = (x: number, y: number) => {
      const sx = x * b + ox;
      const sy = y * b + oy;
      if (!turned) return { x: sx, y: sy, s: 1 };
      return stageProject(stage!.wall, sx, sy);
    };
    const wallAlpha = stage ? stage.wallVis : 1;

    const dab = (x: number, y: number, size: number, rot: number, variant: number, color: string, alpha: number, flat = false) => {
      // x, y, size in design-screen units; flat = screen space (not on the wall)
      if (!flat) alpha *= wallAlpha;
      if (alpha <= 0.01 || size <= 0.3) return;
      const q = flat ? { x: x * b + ox, y: y * b + oy, s: 1 } : toPx(x, y);
      const px = q.x * dpr;
      const py = q.y * dpr;
      const ps = size * K * q.s;
      if (px < -ps || py < -ps || px > ctx.canvas.width + ps || py > ctx.canvas.height + ps) return;
      const spr = this.sprite(variant, color);
      if (!spr) return;
      const cos = Math.cos(rot) * ps;
      const sin = Math.sin(rot) * ps;
      ctx.globalAlpha = alpha;
      ctx.setTransform(cos, sin, -sin, cos, px, py);
      ctx.drawImage(spr, -0.5, -0.5, 1, 1);
    };

    /** alpha fade for modules that grow huge as they pass the camera */
    const nearFade = (screenSize: number) => clamp01((260 - screenSize) / 140);

    const project = (world: 'A' | 'B', x: number, y: number, depth: number, size: number) => {
      layerTransform(world === 'A' ? camA : camB, depth, xf);
      if (!xf.ok) return null;
      return { x: x * xf.m + xf.tx, y: y * xf.m + xf.ty, s: size * xf.m };
    };

    // Chapter 5 foreshadowing: warm light inside the finder square (same light as the Chapter 1 aperture),
    // forming quietly in the bottom-left corner of the final management frame (screen space)
    const [fcx, fcy, fcell] = G4.finder.screen;
    if (inB && st.finder > 0.7 && this.glowSprite) {
      const a = clamp01((st.finder - 0.7) / 0.3) * (0.75 + 0.2 * Math.sin(time * 1.1));
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.5 * a;
      const gs = fcell * 7 * 1.25 * K;
      ctx.setTransform(gs, 0, 0, gs, (fcx * b + ox) * dpr, (fcy * b + oy) * dpr);
      ctx.drawImage(this.glowSprite, -0.5, -0.5, 1, 1);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (ch4On) this.drawAmbient4(time, dab, project);

    for (const m of this.mods) {
      const wob = Math.sin(time * 0.6 + m.phase);
      const wob2 = Math.cos(time * 0.45 + m.phase * 1.7);

      if (m.role === GOLD) continue; // drawn last, on top

      if (!inB) {
        // ---- World A: star → QR
        const isQr = m.role === DATA || m.role === RING;
        const e = isQr ? ease(clamp01((st.assemble - m.aDelay) / 0.5)) : 0;
        const free = 1 - e;
        const arc = Math.sin(Math.PI * e) * m.curve;
        const x = lerp(m.sx, m.qx, e) + arc * 0.35 + wob * 7 * free;
        const y = lerp(m.sy, m.qy, e) - arc * 0.2 + wob2 * 5 * free;
        const depth = lerp(m.sd, 0, e);
        const size = lerp(m.ss, m.qs, e);
        const p = project('A', x, y, depth, size);
        if (!p) continue;
        const twinkle = free * (0.25 + 0.25 * Math.sin(time * 1.3 + m.phase * 3));
        dab(p.x, p.y, p.s, (m.phase - 3) * 0.05 * (0.4 + free), m.variant, e > 0.5 ? COLORS.star : m.starColor, (0.72 + 0.28 * e - twinkle) * nearFade(p.s));
      } else {
        // ---- World B: dust → table tent / window frame
        if (m.role === RING) {
          const p = project('B', m.tx, m.ty, 0, m.ts);
          if (p) dab(p.x, p.y, p.s, (m.phase - 3) * 0.02, m.variant, COLORS.ink, 0.94 * nearFade(p.s * 0.45));
          continue;
        }
        const lands = m.role === DATA || m.role === TENT;
        if (lands && ch4On) continue; // drawn by drawChapter4()
        const e = lands ? ease(clamp01((st.settle - m.bDelay) / 0.5)) : 0;
        const free = 1 - e;
        const arc = Math.sin(Math.PI * e) * m.curve * 0.4;
        const x = lerp(m.dx, m.tx, e) + arc + wob * 12 * free;
        const y = lerp(m.dy, m.ty, e) - Math.abs(arc) * 0.3 + (wob2 * 9 + Math.sin(time * 0.2 + m.phase) * 6) * free;
        const depth = lerp(m.dd, m.td, e);
        const size = lerp(m.ds, m.ts, e);
        const fi = st.finder > 0 ? this.finderOf.get(m) : undefined;
        if (fi !== undefined) {
          // Chapter 5 hand-off: light rises off the manager's screen and draws the bottom-left finder
          // square clockwise. A module does not exist until its turn (it emerges at size 0).
          // ring first (finder 0–0.6, clockwise), then the 3×3 core (0.55–0.9) — the part that was the portal
          const ringN = FINDER_SLOTS.length;
          const isCore = fi >= ringN;
          const order = isCore ? (fi - ringN) / FINDER_CORE.length : fi / ringN;
          const fe = isCore
            ? ease(clamp01((st.finder - 0.55 - order * 0.3) / 0.14))
            : ease(clamp01((st.finder - order * 0.5) / 0.14));
          if (fe <= 0) continue;
          const slot = isCore ? FINDER_CORE[fi - ringN] : FINDER_SLOTS[fi];
          // the light rises off the management screen, which is what this chapter has just arrived at
          let sx = 1100;
          let sy = 700;
          const src = project('B', G4.office.monitorCenter[0], G4.office.monitorCenter[1], 0, 1);
          if (src) {
            const q = toPx(src.x, src.y);
            sx = (q.x - ox) / b + (m.phase - 3) * 6;
            sy = (q.y - oy) / b;
          }
          const arc = Math.sin(Math.PI * fe) * 140;
          let fx = lerp(sx, slot.x, fe);
          let fy = lerp(sy, slot.y, fe) - arc;
          let fs = fcell * (isCore ? 0.8 : 0.78) * clamp01(fe * 2.2);
          let fcol = isCore ? COLORS.gold : COLORS.star;
          let frot = (m.phase - 3) * 0.04 * (1 - fe);
          // Chapter 5: the finder that waited in the corner since Chapter 4 flies into the final QR and
          // becomes its top-left finder — cell for cell (finalQr.ts keeps the same order as FINDER_SLOTS)
          const fq = st.k5 > 1 ? getFinalQr() : null;
          if (fq) {
            const q5 = ease(clamp01((st.k5 - 1.05 - order * 0.12) / 0.7));
            const [cr, cc] = isCore ? fq.finderCore[fi - ringN] : fq.finderRing[fi];
            const [wx, wy] = fq.cellAt(cr, cc);
            const q = project('B', wx, wy, 0, fq.cell * 0.92);
            if (q && q5 > 0) {
              const px = toPx(q.x, q.y);
              const tx = (px.x - ox) / b;
              const ty = (px.y - oy) / b;
              const lift = Math.sin(Math.PI * q5) * 120;
              fx = lerp(fx, tx, q5);
              fy = lerp(fy, ty, q5) - lift;
              fs = lerp(fs, q.s * px.s, q5);
              frot = lerp(frot, 0, q5);
              if (q5 > 0.55) fcol = COLORS.ink;
            }
          }
          const settle = 1 - 0.62 * clamp01((st.qr - 0.55) / 0.45);
          dab(fx, fy, fs, frot, m.variant, fcol, (0.9 * clamp01(fe * 3) + 0.1 * clamp01(st.k5 - 1.6)) * (1 - 0.8 * st.markDim) * settle, true);
          continue;
        }
        const p = project('B', x, y, depth, size);
        if (!p) continue;
        const color = e > 0.88 ? COLORS.ink : COLORS.cream;
        const shimmer = free * (0.3 + 0.3 * Math.sin(time * 1.1 + m.phase * 2));
        dab(p.x, p.y, p.s, (m.phase - 3) * 0.08 * free, m.variant, color, (0.85 - shimmer) * nearFade(p.s));
      }
    }

    // ---- painted speed flicks (the passage)
    if (st.flicks > 0.01) {
      const s = Math.exp(st.logS);
      const color = '#f6ecd6'; // same in both worlds: the passage itself is light
      for (const f of this.flickSeeds) {
        const r = (f.u + st.logS * 0.42 * f.w) % 1;
        const radius = (0.12 + r * r * 1.3) * 1100;
        const len = (40 + 260 * r) * st.flicks;
        const x = st.px + Math.cos(f.a) * radius * (inB ? 1 : Math.min(1, s / 900 + 0.35));
        const y = st.py + Math.sin(f.a) * radius * 0.7;
        const alpha = st.flicks * Math.sin(Math.PI * r) * 0.55;
        if (alpha < 0.02) continue;
        const px = (x * b + ox) * dpr;
        const py = (y * b + oy) * dpr;
        const spr = this.sprite(f.v, color);
        if (!spr) continue;
        const ca = Math.cos(f.a);
        const sa = Math.sin(f.a);
        const L = len * K;
        const W = (5 + 9 * r) * K;
        ctx.globalAlpha = alpha;
        ctx.setTransform(ca * L, sa * L, -sa * W, ca * W, px, py);
        ctx.drawImage(spr, -0.5, -0.5, 1, 1);
      }
    }

    // ---- gold modules: part of the QR → carried by the camera → sunbeam → table tent
    for (const m of this.mods) {
      if (m.role !== GOLD) continue;
      if (ch4On) continue; // drawn by drawChapter4()
      const wob = Math.sin(time * 0.7 + m.phase);
      const wob2 = Math.cos(time * 0.55 + m.phase);
      const carry = { x: m.carryX + wob * 10, y: m.carryY + wob2 * 8, s: 30 };
      let x: number, y: number, s: number;

      if (!inB) {
        const e = ease(clamp01((st.assemble - m.aDelay) / 0.5));
        const ax = lerp(m.sx, m.qx, e);
        const ay = lerp(m.sy, m.qy, e);
        const p = project('A', ax, ay, lerp(m.sd, 0, e), lerp(m.ss, m.qs, e)) ?? carry;
        const c = ease(clamp01(st.goldCarry));
        x = lerp(p.x, carry.x, c);
        y = lerp(p.y, carry.y, c);
        s = lerp(Math.min(p.s, 400), carry.s, c);
      } else {
        const beam = project('B', m.beamX + wob * 16, m.beamY + wob2 * 12, -0.1, 16);
        const tent = project('B', m.tx, m.ty, TENT_B.depth, m.ts);
        if (!beam || !tent) {
          x = carry.x; y = carry.y; s = carry.s;
        } else if (st.goldLand <= 1) {
          const g = ease(clamp01(st.goldLand));
          x = lerp(carry.x, beam.x, g);
          y = lerp(carry.y, beam.y, g);
          s = lerp(carry.s, beam.s, g);
        } else {
          const e = ease(clamp01((st.goldLand - 1 - m.bDelay * 0.3) / 0.85));
          x = lerp(beam.x, tent.x, e);
          y = lerp(beam.y, tent.y, e);
          s = lerp(beam.s, tent.s, e);
        }
      }
      if (this.glowSprite && s < 200) {
        ctx.globalCompositeOperation = 'lighter';
        const gq = toPx(x, y);
        const gs = s * 4.2 * K * gq.s;
        ctx.globalAlpha = 0.55 * wallAlpha;
        ctx.setTransform(gs, 0, 0, gs, gq.x * dpr, gq.y * dpr);
        ctx.drawImage(this.glowSprite, -0.5, -0.5, 1, 1);
        ctx.globalCompositeOperation = 'source-over';
      }
      const landed = inB && st.goldLand > 1.6;
      dab(x, y, s, (m.phase - 3) * 0.06, m.variant, landed ? COLORS.goldDeep : COLORS.gold, 0.97);
    }

    if (inB && st.ch5 >= 0.5) this.drawAmbient5(st, time, dab, project);
    if (ch4On) this.drawChapter4(ctx, st, vp, dpr, time, dab, project, camB, toPx, wallAlpha);

    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ------------------------------------------------------------------ Chapter 4

  /** Ambient motes of the Chapter 4 rooms: time-driven only, so the world stays alive while the scroll rests. */
  private drawAmbient4(time: number, dab: DabFn, project: Projector) {
    for (const d of this.motes) {
      const r = d.room;
      const h = r.y1 - r.y0;
      // wrap vertically inside the room; fade near the wrap edges so nothing pops
      const t = (((d.y - r.y0 - time * r.rise) % h) + h) % h;
      const edge = clamp01(Math.min(t, h - t) / 120);
      const x = d.x + Math.sin(time * 0.35 + d.ph) * r.sway;
      const p = project('B', x, r.y0 + t, 0, d.s);
      if (!p) continue;
      const tw = 0.55 + 0.45 * Math.sin(time * 1.3 + d.ph * 3);
      dab(p.x, p.y, p.s, d.ph, d.v, r.color, r.alpha * tw * edge);
    }
  }

  /**
   * Chapter 5 ambient life (time-driven, so the night stays alive while the scroll rests):
   *   · the neighbouring buildings' windows light up as square dabs — the restaurant's evening becomes a city
   *   · the Kerinti sky twinkles with star dabs (Chapter 1's star field)
   *   · the operations panel of Chapter 4's final frame breaks into the square dabs it is made of and floats away
   */
  private drawAmbient5(st: FilmState, time: number, dab: DabFn, project: Projector) {
    const night = st.night;
    const calm = 1 - 0.75 * st.calm;
    if (night > 0.01)
      for (const w of this.city5) {
        const p = project('B', w.x, w.y, 0, w.s);
        if (!p) continue;
        const flick = 0.75 + 0.25 * Math.sin(time * (0.4 + (w.ph % 1)) + w.ph) * calm;
        dab(p.x, p.y, p.s, (w.ph - 3) * 0.05, w.v, w.color, 0.85 * night * flick);
      }
    const fq = st.k5 > 1 ? getFinalQr() : null;
    const extra = fq ? fq.dataCells.slice(this.ch4Mods.length) : [];
    this.stars5.forEach((s, i) => {
      let x = s.x + Math.sin(time * 0.2 + s.ph) * 20 * calm;
      let y = s.y;
      let size = s.s;
      let col = s.ph < 1.5 ? COLORS.gold : COLORS.star;
      let a = (0.45 + 0.4 * Math.sin(time * 1.3 + s.ph * 3) * calm) * night;
      let rot = (s.ph - 3) * 0.1;
      const cell = extra[i];
      if (fq && cell) {
        // a code larger than Chapter 1's 25×25 needs more modules than the operational ones: stars join it
        const u = ease(clamp01((st.k5 - 1.1 - (s.ph % 1) * 0.2) / 0.6));
        const [wx, wy] = fq.cellAt(cell[0], cell[1]);
        x = lerp(x, wx, u);
        y = lerp(y, wy, u) - Math.sin(Math.PI * u) * 300;
        size = lerp(size, fq.cell * 0.92, u);
        rot = lerp(rot, 0, u);
        a = lerp(a, 0.96, u) * (1 - 0.62 * clamp01((st.qr - 0.55) / 0.45));
        if (u > 0.55) col = COLORS.ink;
      }
      const p = project('B', x, y, 0, size);
      if (p) dab(p.x, p.y, p.s, rot, s.v, col, a);
    });
    const dv = st.dissolve;
    if (dv > 0.001) {
      const away = clamp01((night - 0.15) / 0.7);
      for (const d of this.panel5) {
        const rise = away * (260 + (d.ph % 1) * 380);
        const x = d.x + Math.sin(time * 0.6 + d.ph) * 10 + away * (d.ph - 3) * 40;
        const y = d.y - rise;
        const a = clamp01(dv * 2.2) * (1 - away);
        const col = away > 0.5 ? (d.ph < 2 ? COLORS.gold : COLORS.star) : d.color;
        dab(x, y, d.s * (1 + away * 0.6), (d.ph - 3) * 0.1 * away, d.v, col, 0.9 * a, true);
      }
    }
  }

  /** Screen position of a table-card module exactly as the Chapter 3 code path draws it. */
  private tentScreen(m: Mod, st: FilmState, time: number, project: Projector) {
    const nearFade = (screenSize: number) => clamp01((260 - screenSize) / 140);
    if (m.role === GOLD) {
      const wob = Math.sin(time * 0.7 + m.phase);
      const wob2 = Math.cos(time * 0.55 + m.phase);
      const carry = { x: m.carryX + wob * 10, y: m.carryY + wob2 * 8, s: 30 };
      const beam = project('B', m.beamX + wob * 16, m.beamY + wob2 * 12, -0.1, 16);
      const tent = project('B', m.tx, m.ty, TENT_B.depth, m.ts);
      if (!beam || !tent) return { x: carry.x, y: carry.y, s: carry.s, color: COLORS.goldDeep, alpha: 0.97, rot: (m.phase - 3) * 0.06 };
      const e = ease(clamp01((st.goldLand - 1 - m.bDelay * 0.3) / 0.85));
      return {
        x: lerp(beam.x, tent.x, e),
        y: lerp(beam.y, tent.y, e),
        s: lerp(beam.s, tent.s, e),
        color: st.goldLand > 1.6 ? COLORS.goldDeep : COLORS.gold,
        alpha: 0.97,
        rot: (m.phase - 3) * 0.06,
      };
    }
    const wob = Math.sin(time * 0.6 + m.phase);
    const wob2 = Math.cos(time * 0.45 + m.phase * 1.7);
    const e = ease(clamp01((st.settle - m.bDelay) / 0.5));
    const free = 1 - e;
    const arc = Math.sin(Math.PI * e) * m.curve * 0.4;
    const x = lerp(m.dx, m.tx, e) + arc + wob * 12 * free;
    const y = lerp(m.dy, m.ty, e) - Math.abs(arc) * 0.3 + (wob2 * 9 + Math.sin(time * 0.2 + m.phase) * 6) * free;
    const p = project('B', x, y, lerp(m.dd, m.td, e), lerp(m.ds, m.ts, e));
    if (!p) return null;
    const shimmer = free * (0.3 + 0.3 * Math.sin(time * 1.1 + m.phase * 2));
    return { x: p.x, y: p.y, s: p.s, color: e > 0.88 ? COLORS.ink : COLORS.cream, alpha: (0.85 - shimmer) * nearFade(p.s), rot: (m.phase - 3) * 0.08 * free };
  }

  /** Arc-length anchor of a formation (ticket and receipt ride on the order's position). */
  private anchorS(k: number, st: FilmState) {
    switch (k) {
      case 2:
      case 4:
        return st.orderS;
      case 3:
        return ANCHOR_S.kds;
      case 5:
        return ANCHOR_S.bins;
      case 6:
        return ANCHOR_S.ledger;
      default:
        return ANCHOR_S.chart;
    }
  }

  private localSlot(kk: number, slotIdx: number, st: FilmState) {
    const s = FORMATIONS[kk].slots[slotIdx];
    let x = s.x;
    let y = s.y;
    let size = s.size;
    if (kk === 2 || kk === 4) {
      // riding along the flow line: a slight sway
      const w = 0.05 * Math.sin(st.orderS / 160);
      const c = Math.cos(w);
      const sn = Math.sin(w);
      const rx = x * c - y * sn;
      const ry = x * sn + y * c;
      x = rx;
      y = ry;
    }
    if (kk === 4 && s.bx !== undefined) {
      x += s.bx * st.burst;
      y += (s.by ?? 0) * st.burst;
    }
    if (kk === 1 && s.gold) size *= 1 + 0.35 * Math.sin(Math.PI * st.select);
    const k = FORM_SCALE[kk];
    return { x: x * k, y: y * k, size: size * k, color: SLOT_COLORS[s.color], gold: s.gold };
  }

  private drawChapter4(
    ctx: CanvasRenderingContext2D, st: FilmState, vp: Viewport, dpr: number, time: number, dab: DabFn, project: Projector, camB: Camera,
    toPx: (x: number, y: number) => { x: number; y: number; s: number }, wallAlpha: number,
  ) {
    // while the management portal is open its window shows the workstation: the modules of the table we
    // are leaving must not paint over it
    const through = st.gMgmt > 0 && st.gMgmt < 1 ? clamp01((st.gMgmt - 0.02) / 0.25) : 0;
    const keep = 1 - through;
    const f = Math.min(7, st.form);
    const k = Math.min(6, Math.floor(f));
    const p = f - k;
    // capture the wall-plane transform: project() reuses this.xf for other depths while we iterate
    layerTransform(camB, 0, this.xf);
    const M = this.xf.m;
    const TX = this.xf.tx;
    const TY = this.xf.ty;
    const toScreen = (x: number, y: number, size: number) => ({ x: x * M + TX, y: y * M + TY, s: size * M });
    // the menu formation lives on the guest's phone screen, at table depth
    layerTransform(camB, G4.dining.depth, this.xf);
    const PM = this.xf.m;
    const PTX = this.xf.tx;
    const PTY = this.xf.ty;
    const [phx, phy] = G4.dining.phoneScan;
    const toPhone = (x: number, y: number, size: number) => ({ x: (phx + x) * PM + PTX, y: (phy + y) * PM + PTY, s: size * PM });
    const K = vp.b * dpr;
    let gx = 0;
    let gy = 0;
    let gn = 0;

    for (let mi = 0; mi < this.ch4Mods.length; mi++) {
      const { m, slots, delay, curve } = this.ch4Mods[mi];
      // the gold subject leads every transformation; the rest of the material follows it
      const goldLead = FORMATIONS[k + 1].slots[slots[k + 1]].gold || (k > 0 && FORMATIONS[k].slots[slots[k]].gold);
      const e = ease(clamp01((p - delay * (goldLead ? 0.15 : 1)) / 0.65));
      const B = this.localSlot(k + 1, slots[k + 1], st);
      let x: number;
      let y: number;
      let s: number;
      let color: string;
      let alpha = 0.95;
      let rot = (m.phase - 3) * 0.03;
      let gold: boolean;

      if (k === 0) {
        // qr.tableTent → menu.tiles: lift off the table card (screen space, so the first frame is exact)
        const a = this.tentScreen(m, st, time, project);
        if (!a) continue;
        const b = toPhone(B.x, B.y, B.size);
        const lift = Math.sin(Math.PI * e) * curve * PM * 0.5;
        x = lerp(a.x, b.x, e) - lift * 0.3;
        y = lerp(a.y, b.y, e) - lift;
        s = lerp(a.s, b.s, e);
        color = e < 0.5 ? a.color : B.color;
        alpha = lerp(a.alpha, 0.95, e);
        rot = lerp(a.rot, rot, e);
        gold = e >= 0.5 && B.gold;
      } else {
        const A = this.localSlot(k, slots[k], st);
        let wx = 0;
        let wy = 0;
        let size = lerp(A.size, B.size, e);
        let swap = e;
        let screenPt: { x: number; y: number; s: number } | null = null;
        if (k === 1) {
          // menu (in the phone) → order card (on the cashier screen). This happens while the phone surface
          // covers the screen (THROUGH 1), so it is a straight screen-space move between the two places.
          const a1 = toPhone(A.x, A.y, A.size);
          const anchor = pointAt(st.orderS, this.pp);
          const b1 = toScreen(anchor.x + B.x, anchor.y + B.y, B.size);
          screenPt = { x: lerp(a1.x, b1.x, e), y: lerp(a1.y, b1.y, e), s: lerp(a1.s, b1.s, e) };
        } else if (k === 6) {
          // ledger.lines → chart.columns. Phase 4.9: the report STAYS on the manager's screen — the 4.8
          // version lifted it off the monitor and up through the roof, which is where the removed
          // bird's-eye ending began. The cari rows simply compress into the day's report, in place.
          const mc = G4.office.monitorCenter;
          const miniX = mc[0] + B.x * MINI_CHART.scale;
          const miniY = mc[1] + MINI_CHART.dy + B.y * MINI_CHART.scale;
          const c = ease(clamp01((p - delay * 0.1) / 0.5));
          wx = lerp(G4.office.ledgerCenter[0] + A.x, miniX, c);
          wy = lerp(G4.office.ledgerCenter[1] + A.y, miniY, c);
          size = lerp(A.size, B.size * MINI_CHART.scale * 1.6, c);
          swap = c;
        } else {
          // every later transformation follows the painted flow line
          const sA = this.anchorS(k, st);
          const sB = this.anchorS(k + 1, st);
          const anchor = pointAt(lerp(sA, sB, e), this.pp);
          wx = anchor.x + lerp(A.x, B.x, e);
          wy = anchor.y + lerp(A.y, B.y, e);
          if (Math.abs(sB - sA) < 1) wy -= Math.sin(Math.PI * e) * curve * 0.5; // docking hop
        }
        const pt = screenPt ?? toScreen(wx, wy, size);
        x = pt.x;
        y = pt.y;
        s = pt.s;
        color = swap < 0.5 ? A.color : B.color;
        gold = swap < 0.5 ? A.gold : B.gold;
      }

      // ── Chapter 5: they leave the manager's monitor for the Kerinti sky (k5 0 → 1), drift there as its stars
      // and gold lights, and then assemble into the real QR of the call to action (k5 1 → 2) ──
      if (st.k5 > 0) {
        const d5 = this.drift5[mi];
        const k5 = st.k5;
        const calm = 1 - 0.7 * st.calm;
        const w1 = Math.sin(time * 0.35 + d5.ph) * 60 * calm;
        const w2 = Math.cos(time * 0.27 + d5.ph * 1.3) * 40 * calm;
        const dp = toScreen(d5.x + w1, d5.y + w2, d5.size);
        const u1 = ease(clamp01((Math.min(1, k5) - delay * 0.5) / 0.5));
        if (u1 > 0) {
          const arc = Math.sin(Math.PI * u1) * d5.arc * M;
          x = lerp(x, dp.x, u1);
          y = lerp(y, dp.y, u1) - arc;
          s = lerp(s, dp.s, u1);
          rot = lerp(rot, (m.phase - 3) * 0.2, u1);
          if (u1 > 0.5) {
            color = d5.color;
            gold = d5.color === COLORS.gold;
          }
          alpha = lerp(alpha, 0.55 + 0.4 * Math.sin(time * 1.1 + d5.ph) ** 2, u1);
        }
        const fq = k5 > 1 ? getFinalQr() : null;
        if (fq) {
          const cell = fq.dataCells[mi];
          const u2 = ease(clamp01((k5 - 1 - delay * 0.4) / 0.62));
          if (cell) {
            const [wx, wy] = fq.cellAt(cell[0], cell[1]);
            const q = toScreen(wx, wy, fq.cell * 0.92);
            const lift = Math.sin(Math.PI * u2) * 160 * M;
            x = lerp(x, q.x, u2);
            y = lerp(y, q.y, u2) - lift;
            s = lerp(s, q.s, u2);
            rot = lerp(rot, 0, u2);
            // once landed, the paint settles into the crisp code underneath: the texture stays, the brush
            // edges stop reaching into the light modules (that is what keeps the code readable for cameras)
            alpha = lerp(alpha, 0.96, u2) * (1 - 0.62 * clamp01((st.qr - 0.55) / 0.45));
            if (u2 > 0.55) {
              color = COLORS.ink;
              gold = false;
            }
          } else {
            // more modules than the code needs: the spare ones stay behind as quiet stars
            alpha *= 1 - 0.75 * u2;
          }
        }
      }

      if (gold && this.glowSprite && s < 160) {
        ctx.globalCompositeOperation = 'lighter';
        const gq = toPx(x, y);
        const gs = s * 3.2 * K * gq.s;
        ctx.globalAlpha = 0.28 * wallAlpha * keep;
        ctx.setTransform(gs, 0, 0, gs, gq.x * dpr, gq.y * dpr);
        ctx.drawImage(this.glowSprite, -0.5, -0.5, 1, 1);
        ctx.globalCompositeOperation = 'source-over';
      }
      dab(x, y, s, rot, m.variant, color, alpha * keep);
      if (gold) {
        gx += x;
        gy += y;
        gn++;
      }
    }
    this.debugGold = gn ? { x: gx / gn, y: gy / gn, n: gn } : { x: 0, y: 0, n: 0 };
  }
}

type Projector = (world: 'A' | 'B', x: number, y: number, depth: number, size: number) => { x: number; y: number; s: number } | null;

interface AmbientRoom {
  x0: number; y0: number; x1: number; y1: number;
  n: number; size: number; color: string; alpha: number;
  /** drift speed in design units per second (rising steam, slow dust, lifting sparks) and sideways sway */
  rise: number; sway: number;
}
const AMBIENT_ROOMS: AmbientRoom[] = [
  // kitchen: warm specks + steam wisps over the stove
  { x0: 2400, y0: -300, x1: 4380, y1: 820, n: 46, size: 7, color: '#ffe3b0', alpha: 0.5, rise: 9, sway: 14 },
  { x0: 3980, y0: -200, x1: 4380, y1: 620, n: 14, size: 26, color: '#f4efe6', alpha: 0.18, rise: 34, sway: 24 },
  // front counter: dust in the window light
  { x0: 4600, y0: -300, x1: 5950, y1: 820, n: 40, size: 6, color: '#fff4dc', alpha: 0.45, rise: 3, sway: 10 },
  // storeroom: dust in the bulb light
  { x0: 4500, y0: 1450, x1: 5900, y1: 2450, n: 54, size: 6, color: '#ffd9a0', alpha: 0.5, rise: 2, sway: 12 },
  // office: dust in the sunset beam
  { x0: 2800, y0: -1900, x1: 5900, y1: -500, n: 50, size: 6, color: '#ffd2a0', alpha: 0.45, rise: 2.5, sway: 10 },
  // evening sky over the roof: lifting sparks
  { x0: 2300, y0: -3300, x1: 6200, y1: -2150, n: 60, size: 8, color: '#ffe9c0', alpha: 0.55, rise: 12, sway: 18 },
];
type DabFn = (x: number, y: number, size: number, rot: number, variant: number, color: string, alpha: number, flat?: boolean) => void;

