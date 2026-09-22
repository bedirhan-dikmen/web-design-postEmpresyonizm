import G from './geometry.json';

/**
 * Phase 4.9 PORTAL GRAMMAR — portals are special, so there are only two in the whole film:
 *
 *   1. the Chapter 2 window portal (QR → finder square → window → inside the restaurant). It is built by
 *      the Chapters 1–3 code path and is not touched here.
 *   2. `gMgmt`, below: the one moment Chapter 4 changes level, from one guest at one table to the restaurant
 *      as a managed business.
 *
 * Everything else in Chapter 4 — phone → cashier, cashier → kitchen, kitchen → waiter, waiter → table,
 * bill → cashier, cashier → table — is ordinary camera travel through one continuous restaurant
 * (see timeline.ts → `travel`). No thresholds, no crossings: the camera simply moves through the rooms,
 * passing counter edges, arch jambs and foreground props on the way.
 *
 * The remaining portal is a real object and runs the same seven steps as the window did:
 *   SOURCE (hold) → APPROACH (the camera moves toward the object) → FRAME (its surface turns into a window)
 *   → REVEAL (the next place is seen through it) → CROSS (its edges pass the viewport) → ARRIVAL → SETTLE.
 *
 * Its source is the completed order itself: the green "Hesap kapandı" status tile standing on Masa 7 once
 * the table has been paid and closed. It deliberately does NOT reuse the QR/finder visual of portal 1.
 *
 *   src     world rectangle [x0, y0, x1, y1] at `depth`
 *   frame   how the rim of the window is drawn
 *   wide    the destination as first glimpsed through the window
 *   arrive  the destination camera at the moment of crossing (= the main camera right after the cut)
 */

export type PortalKey = 'gMgmt';
export type FrameStyle = 'tile';
export type ShotKey = keyof typeof G.camera;

export interface PortalDef {
  key: PortalKey;
  src: { rect: [number, number, number, number]; depth: number };
  frame: FrameStyle;
  wide: ShotKey;
  arrive: ShotKey;
}

const DONE_TAG = G.dining.doneTag as [number, number, number, number];

export const PORTALS: PortalDef[] = [
  { key: 'gMgmt', src: { rect: DONE_TAG, depth: G.dining.depth }, frame: 'tile', wide: 'monitorTile', arrive: 'monitorArrive' },
];

/** portal progress at which the camera behind the window is cut to the destination */
export const CUT = 0.93;
/** until here the window is exactly the object; after it, it opens past the viewport */
export const PHYSICAL = 0.55;
/** from here the window covers the whole screen */
export const COVER = 0.86;
