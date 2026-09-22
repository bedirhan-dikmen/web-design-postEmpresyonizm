import { DESIGN, PORTAL, type WorldId } from './sceneConfig';

/**
 * Everything the master timeline animates. The scroll position scrubs a GSAP
 * timeline that tweens these numbers; rendering is a pure function of them,
 * so any scroll position (forward or backward) produces the same frame.
 */
export interface FilmState {
  /** portal square on screen, in design-screen units */
  px: number;
  py: number;
  logS: number;
  /** 0 = Kerinti night (World A), 1 = NeXa morning (World B). Switched only while the portal covers the screen. */
  world: number;
  /** stars → QR */
  assemble: number;
  /** how far the finder aperture is open (0 closed … 1 = full 5×5 square) */
  aperture: number;
  /** warm light behind the finder */
  glow: number;
  /** painted speed flicks during the passage */
  flicks: number;
  /** light bloom at the threshold */
  flare: number;
  /** the finder's 9 gold centre modules: 0 = part of the QR, 1 = carried with the camera */
  goldCarry: number;
  /** 0 = carried, 1 = floating in the sunbeam, 2 = landed on the table tent */
  goldLand: number;
  /** dust → table-tent QR */
  settle: number;
  /** text blocks: 0 hidden (before), 1 shown, 2 hidden (after) */
  textIntro: number;
  textSmall: number;
  textNexa: number;

  // ── Chapter 4 (all 0 during Chapters 1–3) ──────────────────────────────
  /** 1 once Chapter 4 has started (gates Chapter 4 plates and props) */
  ch4: number;
  /** Module Field formation: 0 qr.tableTent · 1 menu (in the phone) · 2 order card · 3 kds · 4 bill · 5 stock · 6 cari · 7 report */
  form: number;
  /** arc length of the order (order card / bill) along the flow path */
  orderS: number;
  /** arc length of the painted flow line revealed so far (unused since 4.3; kept at 0) */
  flow: number;
  /** guest phone: 0 in the lap · 1 scanning the table QR · 2 put away */
  phone: number;
  /** QR scan progress */
  scan: number;
  /** selected dish pulse on the menu formation */
  select: number;
  /** phone surface: 0→1 the guest's phone opens up to fill the view · 1→2 it goes back into his hand, sent */
  th1: number;
  /** phone menu: 0 browsing · 1 Köfte added · 2 Ayran added */
  menuStep: number;
  /** order note typed (0…1) */
  note: number;
  /** phone: 0→1 order sent · 1→2 becomes the order card */
  send: number;
  /** cashier screen: the Masa 7 order row arrives */
  rowNew: number;
  /** cashier turns to the screen */
  cashierLook: number;
  /** the printed slip: 0→1 it is lifted off the printer and read · 1→2 it settles back onto it */
  th2: number;
  /** kitchen printer has printed the slip */
  printer: number;
  /** chef: 0 at the stove · 1 reading the order · 2 passing the plate */
  chefLook: number;
  /** KDS status: ready */
  kdsReady: number;
  /** the plate slides to the service hatch */
  plate: number;
  /** waiter: 0 at the hatch · 1 at the table · 2 plate served, steps back */
  carry: number;
  /** guest picks the phone up again (extra order + bill) */
  phone2: number;
  /** surface: 0→1 the adisyon opens on the phone · 1→2 it goes back into the guest's hand */
  th5: number;
  /** surface: 0→1 the phone reopens for the bill · 1→2 it becomes the bill · 2→3 it goes back to the table */
  th7: number;
  /** the table's own session is closed: the tag at Masa 7 after payment */
  tableDone: number;
  /** extra order: 0→1 Künefe added · 1→2 sent to the same table */
  extra: number;
  /** bill requested from the table */
  billReq: number;
  /** cashier screen: paid, table closed */
  posPaid: number;
  /** bill formation burst (kept for the bill formation) */
  burst: number;
  /** office monitor tab: 1 Siparişler · 2 Stok · 3 Cari · 4 Rapor */
  ops: number;
  /** stock: low-stock cue */
  reorder: number;
  /** office: e-invoice slides out */
  invoice: number;
  /** office: manager leans in */
  managerLean: number;
  /** threshold bloom at the moment the management portal is crossed */
  portalFlare: number;
  /** Chapter 5 hand-off: the bottom-left finder square forming quietly over the final management frame */
  finder: number;
  /** 0 morning → 1 sunset */
  day: number;

  // ── Phase 4.9 camera orientation (degrees; see chapter4/stage3d.ts) ──
  yaw: number;
  pitch: number;
  roll: number;

  // ── Phase 4.9: the ONE portal inside Chapter 4 ──
  /** the closed table's "Hesap kapandı" tile → the management workstation: 0 closed … 1 crossed */
  gMgmt: number;
  /** the sent order leaving the guest's phone and travelling across the restaurant to the cashier */
  orderPulse: number;
  /** the Masa 7 order ticket: 0 in the row · 1 lifted off the till · 2 at the kitchen printer · 3 gone into the printer */
  ticket: number;
  /** the extra-order ticket: 0 in the row · 1 on the kitchen pass · 2 cleared */
  sparkX: number;
  /** the extra item has reached the kitchen screen */
  kdsExtra: number;
  /** the large management panel in the final frame, with its links down to the rooms it describes */
  mgmt: number;

  // beat copy: one channel per stage (see chapter4/content.ts)
  tTable: number;
  tSystem: number;
  tKitchen: number;
  tWaiter: number;
  tExtra: number;
  tBill: number;
  tOps: number;
  textCloser: number;

  // ── Chapter 5 (all 0 before it) ────────────────────────────────────────
  /** 1 once Chapter 5 has started (gates the Chapter 5 plates and layers) */
  ch5: number;
  /** 0 the warm restaurant evening … 1 the Kerinti night (veil over the restaurant, grade, city lights) */
  night: number;
  /** the operational modules: 0 on the manager's monitor (Chapter 4) · 1 drifting in the Kerinti sky · 2 the final QR */
  k5: number;
  /** the final QR card: its cream face and the crisp, scannable code under the painted modules */
  qr: number;
  /** the final frame calms: ambient motion and the world around the QR recede */
  calm: number;
  /** the manager's operations panel dissolving into square dabs */
  dissolve: number;
  /** the finder mark that waits bottom-left since Chapter 4 steps back while we are in the studio */
  markDim: number;
  t5Kerinti: number;
  t5Company: number;
  t5Team: number;
  t5Cta: number;
}

export const VC = { x: DESIGN.w / 2, y: DESIGN.h / 2 };

export function initialFilmState(): FilmState {
  return {
    px: PORTAL.A.cx,
    py: PORTAL.A.cy,
    logS: Math.log(PORTAL.A.size * 0.92),
    world: 0,
    assemble: 0,
    aperture: 0,
    glow: 0,
    flicks: 0,
    flare: 0,
    goldCarry: 0,
    goldLand: 0,
    settle: 0,
    textIntro: 1,
    textSmall: 0,
    textNexa: 0,
    ch4: 0,
    form: 0,
    orderS: 0,
    flow: 0,
    phone: 0,
    scan: 0,
    select: 0,
    th1: 0,
    menuStep: 0,
    note: 0,
    send: 0,
    rowNew: 0,
    cashierLook: 0,
    th2: 0,
    printer: 0,
    chefLook: 0,
    kdsReady: 0,
    plate: 0,
    carry: 0,
    phone2: 0,
    th5: 0,
    th7: 0,
    tableDone: 0,
    extra: 0,
    billReq: 0,
    posPaid: 0,
    burst: 0,
    ops: 0,
    reorder: 0,
    invoice: 0,
    managerLean: 0,
    portalFlare: 0,
    finder: 0,
    day: 0,
    yaw: 0,
    pitch: 0,
    roll: 0,
    gMgmt: 0,
    orderPulse: 0,
    ticket: 0,
    sparkX: 0,
    kdsExtra: 0,
    mgmt: 0,
    tTable: 0,
    tSystem: 0,
    tKitchen: 0,
    tWaiter: 0,
    tExtra: 0,
    tBill: 0,
    tOps: 0,
    textCloser: 0,
    ch5: 0,
    night: 0,
    k5: 0,
    qr: 0,
    calm: 0,
    dissolve: 0,
    markDim: 0,
    t5Kerinti: 0,
    t5Company: 0,
    t5Team: 0,
    t5Cta: 0,
  };
}

/**
 * 2.5D perspective camera derived from the portal square.
 *
 * At rest (portal at its design position and size) every layer is drawn at
 * design scale. A layer at relative depth δ is `1+δ` times further away than
 * the portal plane, so it scales and pans less (δ>0) or more (δ<0).
 */
export interface Camera {
  /** distance to the portal plane (1 at rest) */
  d: number;
  camX: number;
  camY: number;
}

export function cameraFor(world: WorldId, st: FilmState): Camera {
  const p = PORTAL[world];
  const s = Math.exp(st.logS);
  const d = p.size / s;
  return { d, camX: p.cx - (st.px - VC.x) * d, camY: p.cy - (st.py - VC.y) * d };
}

export interface LayerXf {
  /** scale factor (design → design-screen) */
  m: number;
  /** translation: screen = p * m + t */
  tx: number;
  ty: number;
  /** false when the layer is behind the camera */
  ok: boolean;
}

export function layerTransform(cam: Camera, depth: number, out: LayerXf): LayerXf {
  const den = cam.d + depth;
  if (den <= 0.004) {
    out.ok = false;
    out.m = 0;
    return out;
  }
  out.ok = true;
  out.m = (1 + depth) / den;
  out.tx = VC.x + (-VC.x * depth - cam.camX) / den;
  out.ty = VC.y + (-VC.y * depth - cam.camY) / den;
  return out;
}

/** Maps design-screen coordinates to device pixels (object-fit: cover). */
export interface Viewport {
  vw: number;
  vh: number;
  b: number;
  ox: number;
  oy: number;
}

export function viewportFor(vw: number, vh: number): Viewport {
  const b = Math.max(vw / DESIGN.w, vh / DESIGN.h);
  return { vw, vh, b, ox: vw / 2 - VC.x * b, oy: vh / 2 - VC.y * b };
}

/** True when the portal square fully contains the visible viewport. */
export function portalCovers(st: FilmState, vp: Viewport): boolean {
  const half = Math.exp(st.logS) / 2;
  const hw = vp.vw / 2 / vp.b;
  const hh = vp.vh / 2 / vp.b;
  return st.px - half <= VC.x - hw && st.px + half >= VC.x + hw && st.py - half <= VC.y - hh && st.py + half >= VC.y + hh;
}
