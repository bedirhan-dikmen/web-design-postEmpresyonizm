import type { gsap } from 'gsap';
import type { FilmState } from '../camera';
import { PORTAL } from '../sceneConfig';
import { ANCHOR_S } from './flowPath';
import { CUT, PORTALS, type PortalKey, type ShotKey } from './portals';
import G from './geometry.json';

/**
 * CHAPTER 4 — One Order, One Day. Appended to the master timeline (1 unit = 100vh).
 *
 * Phase 4.9 FINAL CINEMATIC SIMPLIFICATION. The story is unchanged; the grammar is not.
 *
 *  · PORTALS ARE SPECIAL. There are exactly two in the whole film: the Chapter 2 window (QR → finder →
 *    window → inside the restaurant) and, at the very end of Chapter 4, `gMgmt` — the closed table's own
 *    "Hesap kapandı" tile opening onto the management workstation. Nothing else crosses a threshold.
 *  · EVERYTHING ELSE IS CAMERA TRAVEL through ONE restaurant. Phone → cashier, cashier → kitchen,
 *    kitchen → waiter, waiter → table, bill → cashier, cashier → table are all continuous moves
 *    (`travel`), passing the counter edge, the hatch arch, the service arch and foreground props.
 *  · Each zone keeps its own camera personality (stage3d.ts turns the painted section in 3D):
 *      masa      warm, human height, close to the guest             yaw ≈ +4…6°, looking slightly down
 *      kasa      three-quarter from the street side                 yaw ≈ −14°, foreground stools/counter
 *      mutfak    side-on from the other direction, deeper           yaw ≈ +10°, foreground rail + crates
 *      servis    low tracking shot beside the waiter                pitch ≈ +5° (looking slightly up)
 *      yönetim   three-quarter at the workstation, then a pull-back to the restaurant still working below
 *
 * Fast-scroll rule: every stage is SOURCE HOLD → CAMERA MOVE → DESTINATION HOLD. No two semantic events
 * share a short scroll range, and copy only appears once the camera has arrived and stopped.
 *
 *   Z1 MASA      a1 arrive · a2 scan · a3 menu · a4 choose · a5 note · a6 send · a7 back in the hand
 *   T1 TRAVEL    the sent order flows out into the restaurant; the camera follows it to the counter
 *   Z2 KASA      b1 the counter room · b2 the Masa 7 row
 *   T2 TRAVEL    the Masa 7 row produces the ORDER TICKET; the camera follows the ticket through the service
 *                arch into the kitchen, where it goes into the printer and the KDS lights the same order
 *   Z3 MUTFAK    c1 kitchen · c2 ticket · c3 KDS · c4 cook · c5 the dish tracked down the pass
 *   T3 TRAVEL    through the hatch arch onto the dining side, where the waiter is waiting
 *   Z4 SERVİS    d1 handoff · d2 the walk (tracking) · d3 served
 *   Z5 EK        e1 adisyon · e2 extra · T4 pull-back over counter + kitchen · e3 back to the table
 *   Z6 HESAP     f1 request · f2 the bill · T5 travel to the counter · f3 paid · T6 travel back · f4 closed
 *   P  PORTAL 2  p2 the "Hesap kapandı" tile → the management workstation
 *   Z7 YÖNETİM   h1 operations · h2 stock · h3 cari · h4 report · h5 pull back over the working restaurant · h6 closer
 */

const START = 4.4;

const DURATIONS = {
  a1: 1.0, a2: 1.2, a3: 1.2, a4: 1.0, a5: 1.0, a6: 1.0, a7: 0.8,
  t1: 2.2,
  b1: 1.2, b2: 1.0,
  t2: 2.0,
  c1: 1.2, c2: 1.1, c3: 0.9, c4: 1.0, c5: 1.2,
  t3: 1.2,
  d1: 1.3, d2: 1.6, d3: 0.9,
  e1: 0.9, e2: 1.0, t4: 1.4, e3: 1.0,
  f1: 1.1, f2: 0.8, t5: 1.4, f3: 1.2, t6: 1.2, f4: 0.9,
  p2: 1.9,
  h1: 1.6, h2: 1.0, h3: 1.0, h4: 1.0, h5: 1.8, h6: 1.0,
} as const;
export type BeatKey = keyof typeof DURATIONS;

const BEATS = (() => {
  let t = START;
  const out = {} as Record<BeatKey, { start: number; dur: number }>;
  for (const k of Object.keys(DURATIONS) as BeatKey[]) {
    out[k] = { start: t, dur: DURATIONS[k] };
    t += DURATIONS[k];
  }
  return out;
})();

export const CH4 = {
  start: START,
  beats: Object.fromEntries(Object.entries(BEATS).map(([k, v]) => [k, +v.start.toFixed(3)])) as Record<BeatKey, number>,
  end: +(BEATS.h6.start + BEATS.h6.dur).toFixed(3),
};

const at = (b: BeatKey, f: number) => +(BEATS[b].start + BEATS[b].dur * f).toFixed(3);

/** Portal timing inside its beat: [start, end] of the portal progress 0 → 1, as fractions of the beat. */
export const PORTAL_SPAN: Record<PortalKey, { beat: BeatKey; f0: number; f1: number }> = {
  gMgmt: { beat: 'p2', f0: 0.14, f1: 0.86 },
};

/** Freeze points for ?t=<label> (debug): the settled frame of every stage, and the middle of every travel. */
export const CH4_LABELS = {
  'ch4-start': START,
  table: at('a1', 0.85),
  scan: at('a2', 0.9),
  menu: at('a3', 0.9),
  choose: at('a4', 0.85),
  note: at('a5', 0.85),
  send: at('a6', 0.85),
  sent: at('a7', 0.8),
  'to-cashier': at('t1', 0.45),
  counter: at('b1', 0.75),
  cashier: at('b2', 0.8),
  'ticket-lift': at('t2', 0.11),
  'to-kitchen': at('t2', 0.45),
  'ticket-arch': at('t2', 0.5),
  'ticket-printer': at('t2', 0.9),
  kitchen: at('c1', 0.8),
  ticket: at('c2', 0.8),
  kds: at('c3', 0.85),
  cook: at('c4', 0.85),
  pass: at('c5', 0.5),
  ready: at('c5', 0.95),
  'to-waiter': at('t3', 0.5),
  handoff: at('d1', 0.8),
  walk: at('d2', 0.5),
  served: at('d3', 0.85),
  adisyon: at('e1', 0.9),
  extra: at('e2', 0.85),
  update: at('t4', 0.9),
  back: at('e3', 0.9),
  request: at('f1', 0.9),
  bill: at('f2', 0.85),
  'to-payment': at('t5', 0.5),
  paid: at('f3', 0.85),
  'to-table': at('t6', 0.5),
  closed: at('f4', 0.8),
  'portal-mgmt': at('p2', 0.55),
  ops: at('h1', 0.85),
  stock: at('h2', 0.85),
  cari: at('h3', 0.85),
  report: at('h4', 0.9),
  'pull-back': at('h5', 0.85),
  final: at('h6', 0.6),
  'ch4-end': CH4.end,
} as const;

/** Camera "look at (x, y) with zoom z" expressed as the World B portal square the engine already uses. */
export function lookB([cx, cy, z]: readonly number[]) {
  return {
    px: 960 + (PORTAL.B.cx - cx) * z,
    py: 540 + (PORTAL.B.cy - cy) * z,
    logS: Math.log(PORTAL.B.size * z),
  };
}
/** a full shot: pan/zoom + the camera's orientation */
export function shotVars(s: readonly number[]) {
  return { ...lookB(s), yaw: s[3] ?? 0, pitch: s[4] ?? 0, roll: s[5] ?? 0 };
}
export const SHOT = G.camera as unknown as Record<ShotKey, number[]>;

/** Catmull-Rom through the waypoints of a camera path, so a multi-room travel has no kink at a waypoint. */
const crom = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

/**
 * A shot on a camera path at u ∈ [0, 1]. Pan, orientation and LOG zoom are interpolated, so a travel that
 * changes zoom 3–4× still keeps its aim point where it was pointed (tweening the raw portal square would
 * swing the aim sideways on a big push).
 */
export function pathAt(shots: number[][], u: number) {
  const n = shots.length - 1;
  const tt = Math.min(1, Math.max(0, u)) * n;
  const i = Math.min(n - 1, Math.floor(tt));
  const t = tt - i;
  const g = (j: number) => shots[Math.min(n, Math.max(0, j))];
  const ch = (j: number, log = false) => {
    const v = (s: number[]) => (log ? Math.log(s[j]) : s[j] ?? 0);
    const r = crom(v(g(i - 1)), v(g(i)), v(g(i + 1)), v(g(i + 2)), t);
    return log ? Math.exp(r) : r;
  };
  return [ch(0), ch(1), ch(2, true), ch(3), ch(4), ch(5)];
}

export function buildChapter4(tl: gsap.core.Timeline, st: FilmState) {
  const S = ANCHOR_S;
  const len = (b: BeatKey, d: number) => BEATS[b].dur * d;
  const pos = (b: BeatKey, f: number) => BEATS[b].start + BEATS[b].dur * f;
  const to = (b: BeatKey, f: number, d: number, vars: gsap.TweenVars, ease = 'none') =>
    tl.to(st, { ...vars, duration: len(b, d), ease }, pos(b, f));
  /** instant change of a channel, only used while something covers its object or it is off screen */
  const cut = (b: BeatKey, f: number, vars: gsap.TweenVars) => tl.set(st, vars, pos(b, f));
  /** a camera move inside one room (pan, zoom and orientation together) */
  const look = (b: BeatKey, f: number, d: number, shot: ShotKey, ease = 'sine.inOut') => to(b, f, d, shotVars(SHOT[shot]), ease);
  /**
   * TRAVEL — the whole vocabulary of Chapter 4's transitions. The camera moves continuously through the
   * restaurant along a path of waypoints (a counter edge, an arch, a room), easing out of the shot it was
   * holding and into the next hold. Sampled as keyframes, so the path stays a pure function of scroll.
   */
  const travel = (b: BeatKey, f: number, d: number, keys: ShotKey[], e: (t: number) => number = (t) => t * t * (3 - 2 * t), N = 20) => {
    const shots = keys.map((k) => SHOT[k]);
    const frames = Array.from({ length: N }, (_, i) => ({
      ...shotVars(pathAt(shots, e((i + 1) / N))),
      duration: len(b, d) / N,
      ease: 'none',
    }));
    tl.to(st, { keyframes: frames }, pos(b, f));
  };
  /**
   * APPROACH: a long push toward one object (only the management portal now). Same look-space sampling as
   * `travel`, with an accelerating ease, so the object really comes up to the lens.
   */
  const approach = (b: BeatKey, f: number, d: number, from: ShotKey, dest: ShotKey) =>
    travel(b, f, d, [from, dest], (t) => t * t, 14);
  /** the threshold bloom at the crossing: up fast, down slow */
  const flare = (b: BeatKey, f: number) => {
    to(b, f - 0.05, 0.05, { portalFlare: 1 }, 'power2.in');
    to(b, f + 0.01, 0.16, { portalFlare: 0 }, 'power2.out');
  };
  /**
   * PORTAL (one, at the end): the tile opens on the object, the management workstation is revealed in it,
   * its edges pass the viewport and, while it covers the screen, the camera behind it is cut to the
   * destination (portals.ts). `extra` are channels that change at that cut.
   */
  const portal = (key: PortalKey, extra: gsap.TweenVars = {}) => {
    const { beat, f0, f1 } = PORTAL_SPAN[key];
    const def = PORTALS.find((p) => p.key === key)!;
    to(beat, f0, f1 - f0, { [key]: 1 }, 'none');
    const fc = f0 + (f1 - f0) * CUT;
    cut(beat, fc, { ...shotVars(SHOT[def.arrive]), ...extra });
    flare(beat, fc);
  };
  /** stage copy: in at (b, inF) over ≈10vh, out at (outBeat, outF) over ≈7vh */
  const text = (b: BeatKey, key: string, inF: number, outBeat?: BeatKey, outF = 0) => {
    tl.to(st, { [key]: 1, duration: 0.1, ease: 'power1.out' }, pos(b, inF));
    if (outBeat) tl.to(st, { [key]: 2, duration: 0.07, ease: 'power1.in' }, pos(outBeat, outF));
  };

  tl.set(st, { ch4: 1 }, START + 0.001);
  // one continuous service: midday (Chapter 4 start) → late afternoon (as the management frame settles).
  // The drift is slow, so every room is lit by the same light at any one moment.
  tl.to(st, { day: 1, duration: at('h5', 0.6) - START, ease: 'none' }, START);

  // ══ Z1 · MASA — warm, human height ══════════════════════════════════════════════════
  to('a1', 0, 0.14, { textNexa: 2 }, 'power1.in');
  look('a1', 0.02, 0.55, 'tableHuman'); // settle 0.57 → 1: the dining room, the guest, the table card

  look('a2', 0.0, 0.34, 'scan');
  to('a2', 0.05, 0.2, { phone: 1 }, 'power2.out');
  to('a2', 0.3, 0.24, { scan: 1 }, 'sine.inOut');
  to('a2', 0.5, 0.34, { form: 1 }); // the QR modules fly into the phone
  text('a2', 'tTable', 0.62, 'a6', 0.05); // the camera is at rest from a2 0.34 to the end of a6

  to('a3', 0.06, 0.36, { th1: 1 }, 'sine.inOut'); // the phone opens up: the menu
  cut('a3', 0.3, { orderS: S.cashier }); // hidden under the phone surface
  to('a3', 0.2, 0.5, { form: 2 });
  to('a3', 0.45, 0.1, { select: 1 }, 'sine.inOut');

  to('a4', 0.1, 0.16, { menuStep: 1 }, 'sine.out');
  to('a4', 0.5, 0.16, { menuStep: 2 }, 'sine.out');
  to('a5', 0.12, 0.44, { note: 1 });
  to('a6', 0.16, 0.2, { send: 1 }, 'sine.out'); // pressed → "Sipariş gönderildi"
  to('a7', 0.06, 0.44, { th1: 2 }, 'sine.inOut'); // SOURCE HOLD: back into the hand, the green tick on the glass

  // ══ T1 · the order travels to the counter — camera, not portal ══════════════════════
  // The confirmation throws a gold pulse out of the phone; it runs ahead of us along the room and lands on
  // the cashier screen, and the camera simply follows it: pull back from the table, pass the hatch arch and
  // the kitchen, and come to rest three-quarter on the counter with the restaurant's depth behind it.
  to('t1', 0.1, 0.7, { orderPulse: 1 }, 'sine.inOut'); // it stays just ahead of the camera, in frame
  travel('t1', 0.02, 0.88, ['scan', 'tableBack', 'hatchArch', 'kitchenPass', 'zoneCounter']);
  to('t1', 0.66, 0.26, { rowNew: 1 }, 'sine.out'); // Masa 7 arrives on the screen as we settle
  to('t1', 0.78, 0.18, { cashierLook: 1 }, 'sine.inOut');

  // ══ Z2 · KASA — three-quarter, from the street side ═══════════════════════════════
  text('b1', 'tSystem', 0.18, 'b2', 0.04); // DESTINATION HOLD: the copy arrives after the camera stops
  look('b2', 0.05, 0.45, 'cashierRow'); // push in until table, items, time and note are legible

  // ══ T2 · the ORDER TICKET travels from the till to the kitchen ══════════════════════
  // The physical ticket is the object we follow, not a badge: the Masa 7 row produces it, it lifts off the
  // till, and the camera goes with it over the counter, through the service arch and along the kitchen to the
  // printer. It goes into the printer, comes out printed, and the KDS lights the same order.
  // The flight is linear here on purpose: the renderer applies the camera's own easing and path curve to it
  // (G.ticket.path has one waypoint per camera waypoint), so ticket and camera stay locked together.
  to('t2', 0.0, 0.12, { ticket: 1 }, 'sine.out'); // SOURCE: the row produces the ticket; the camera holds
  to('t2', 0.12, 0.74, { ticket: 2 });
  travel('t2', 0.12, 0.74, ['cashierRow', 'ticketCounter', 'passThrough', 'ticketKitchen', 'kitchenTicket']);
  to('t2', 0.86, 0.08, { ticket: 3 }, 'sine.in'); // down into the printer …
  to('t2', 0.92, 0.3, { printer: 1 }, 'sine.out'); // … and out again, printed; the KDS confirms the same order

  // ══ Z3 · MUTFAK — side-on from the other direction, deeper ════════════════════════
  text('c1', 'tKitchen', 0.2, 'c2', 0.0);
  look('c2', 0.0, 0.34, 'printer');
  to('c2', 0.36, 0.34, { th2: 1 }, 'sine.inOut'); // the slip is lifted up and read
  to('c3', 0.0, 0.3, { th2: 2 }, 'sine.inOut');
  look('c3', 0.12, 0.44, 'kds');
  cut('c3', 0.2, { orderS: S.kds });
  to('c3', 0.24, 0.46, { form: 3 });
  look('c4', 0.0, 0.4, 'stove');
  to('c4', 0.16, 0.12, { chefLook: 1 }, 'sine.inOut');
  to('c4', 0.52, 0.12, { chefLook: 2 }, 'sine.inOut');
  // the dish is tracked down the whole pass to the hatch — a camera move inside the kitchen
  to('c5', 0.04, 0.12, { kdsReady: 1 }, 'power1.out');
  to('c5', 0.18, 0.62, { plate: 1 }, 'sine.inOut');
  look('c5', 0.16, 0.34, 'passTrack', 'sine.in');
  look('c5', 0.5, 0.35, 'hatchSide', 'sine.out'); // settle 0.85 → 1: "Hazır" at the hatch

  // ══ T3 · through the hatch arch onto the dining side ══════════════════════════════
  travel('t3', 0.05, 0.85, ['hatchSide', 'hatchThrough', 'waiterArrive']);

  // ══ Z4 · SERVİS — low, tracking ═══════════════════════════════════════════════════
  to('d1', 0.12, 0.44, { carry: 0.18 }, 'sine.inOut'); // lifted off the hatch onto his tray
  text('d1', 'tWaiter', 0.32, 'd1', 0.95);
  to('d2', 0.02, 0.9, { carry: 1 }, 'sine.inOut'); // the walk, followed
  travel('d2', 0.0, 0.94, ['waiterArrive', 'walkMid', 'table']);
  to('d3', 0.04, 0.4, { carry: 2 }, 'sine.inOut'); // set down on Masa 7; he steps back
  look('d3', 0.12, 0.5, 'tableWide');

  // ══ Z5 · EK SİPARİŞ — the same table, a shorter continuation ══════════════════════
  to('e1', 0.08, 0.18, { phone2: 1 }, 'power2.out');
  to('e1', 0.3, 0.46, { th5: 1 }, 'sine.inOut'); // the same table's adisyon on the same phone
  to('e2', 0.1, 0.22, { extra: 1 }, 'sine.out'); // + Künefe
  to('e2', 0.46, 0.22, { extra: 2 }, 'sine.out'); // sent, onto the same adisyon
  text('e2', 'tExtra', 0.42, 't4', 0.04);
  // T4 — a pull-back, not a portal: from the table we simply widen until the counter and the kitchen are
  // both in frame, and watch the addition reach the Masa 7 row and then the kitchen screen.
  to('t4', 0.0, 0.22, { th5: 2 }, 'sine.inOut'); // the phone goes back down to the table
  travel('t4', 0.04, 0.62, ['tableWide', 'hatchArch', 'bothWide']);
  to('t4', 0.28, 0.42, { sparkX: 1 }, 'sine.inOut');
  to('t4', 0.68, 0.16, { kdsExtra: 1 }, 'sine.out');
  travel('e3', 0.0, 0.78, ['bothWide', 'hatchArch', 'tableWide']); // and back to the table
  to('e3', 0.6, 0.3, { sparkX: 2 }); // (off screen) the extra ticket is taken off the pass

  // ══ Z6 · HESAP / ÖDEME ════════════════════════════════════════════════════════════
  to('f1', 0.08, 0.4, { th7: 1 }, 'sine.inOut');
  to('f1', 0.52, 0.16, { billReq: 1 }, 'sine.out'); // "Hesap iste"
  text('f1', 'tBill', 0.66, 't5', 0.04);
  to('f2', 0.06, 0.44, { th7: 2 }, 'sine.inOut'); // the request becomes the bill in his hand
  to('f2', 0.1, 0.5, { form: 4 });
  // T5 — the bill goes down, the camera leaves the table and travels to the payment end of the counter,
  // where the request is already on the screen: "Masa 7 · Hesap istendi".
  to('t5', 0.0, 0.24, { th7: 3 }, 'sine.inOut');
  to('t5', 0.1, 0.4, { kdsExtra: 0 }, 'sine.inOut'); // by now the kitchen has made the extra item too
  to('t5', 0.06, 0.8, { orderS: S.pos }, 'sine.inOut'); // the order itself travels with us, along the flow line
  travel('t5', 0.04, 0.86, ['table', 'hatchArch', 'kitchenPass', 'paymentArrive']);
  cut('t5', 0.99, { phone2: 0 });
  look('f3', 0.0, 0.42, 'payClose');
  to('f3', 0.4, 0.22, { posPaid: 1 }, 'power2.out'); // paid, the table closes
  // T6 — back to Masa 7 the same way we came; the green "Hesap kapandı" tile is already standing there.
  travel('t6', 0.04, 0.86, ['payClose', 'kitchenPass', 'hatchArch', 'tableDoneWide']);
  to('t6', 0.58, 0.32, { tableDone: 1 }, 'sine.out');
  look('f4', 0.1, 0.5, 'tableDone'); // a calm, settled final table

  // ══ P · PORTAL 2 — the closed table opens the business behind it ═══════════════════
  // The only threshold in Chapter 4: SOURCE (the tile) → APPROACH → GATEWAY → REVEAL → CROSS → ARRIVAL.
  cut('p2', 0.0, { ops: 1 });
  approach('p2', 0.0, 0.62, 'tableDone', 'tagPush');
  portal('gMgmt');

  // ══ Z7 · YÖNETİM — a dimensional workstation, the restaurant still working below ════
  look('h1', 0.0, 0.42, 'office'); // settle onto the workstation
  text('h1', 'tOps', 0.58, 'h2', 0.45);
  to('h2', 0.06, 0.14, { ops: 2 }, 'sine.inOut'); // stok
  to('h2', 0.06, 0.5, { form: 5 });
  to('h2', 0.58, 0.18, { reorder: 1 }, 'power1.out');
  to('h3', 0.04, 0.14, { ops: 3 }, 'sine.inOut'); // cari · e-Fatura
  to('h3', 0.06, 0.5, { form: 6 });
  to('h3', 0.48, 0.18, { invoice: 1 }, 'sine.out');
  to('h3', 0.5, 0.14, { managerLean: 1 }, 'sine.inOut');
  look('h3', 0.1, 0.6, 'deskWide'); // the camera moves around the workstation
  to('h4', 0.04, 0.12, { ops: 4 }, 'sine.inOut'); // rapor · gün sonu
  to('h4', 0.06, 0.6, { form: 7 }); // the day's report settles onto the monitor
  look('h4', 0.0, 0.5, 'officePull');
  // the final pull-back: the workstation stays in frame and the restaurant it runs opens up underneath it
  travel('h5', 0.05, 0.72, ['officePull', 'officeWide', 'officeLife']);
  to('h5', 0.5, 0.4, { mgmt: 1 }, 'sine.out'); // the large management panel, linked down to the rooms
  to('h6', 0.15, 0.08, { textCloser: 1 }, 'power1.out');
  to('h6', 0.05, 0.62, { finder: 1 }, 'sine.inOut'); // Chapter 5 hand-off, forming quietly bottom-left
  tl.to({}, { duration: CH4.end - at('h6', 0.72) }, at('h6', 0.72)); // stable final frame
}
