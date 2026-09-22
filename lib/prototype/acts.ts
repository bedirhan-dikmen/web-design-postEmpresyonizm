import { LABELS } from './timeline';
import { CH5, CH5_LABELS } from './chapter5/timeline';

/**
 * The page scrolls the master timeline in TWO acts, with ordinary page sections between them.
 *
 *   ACT 1   0.00 ─ 4.40   Chapters 1–3: Kerinti night → QR → portal → the restaurant → the table QR,
 *                         ending on "NeXa Restoran Sipariş Yönetimi".
 *   (page)                the standard site (components/site/SiteSections.tsx) covers the stage.
 *   ACT 2   reentry ─ end Chapter 5 from "NeXa'nın arkasında · Kerinti." onward: company, team,
 *                         the final QR and the call to action; the contact section then rises over it.
 *
 * The Chapter 4 story (and the start of Chapter 5 that leaves it) is never scrolled: the playhead jumps
 * across it while the page sections fully cover the stage. It stays in the timeline because Chapter 5's
 * world (camera, night veil, module field) continues from its final state.
 */
export interface Act {
  t0: number;
  t1: number;
}

export const ACT1: Act = { t0: 0, t1: LABELS.end };
export const ACT2: Act = { t0: CH5_LABELS.reentry, t1: CH5.end };

/** scroll length of an act's track: 1 timeline unit = 100vh, plus one viewport so its last frame can hold */
export const trackVh = (a: Act) => Math.round((a.t1 - a.t0) * 100) + 100;

/** progress rail: one dot per chapter the reader actually scrolls through (timeline ranges) */
export const RAIL = [
  { id: 'kerinti', label: 'Kerinti', t0: 0, t1: LABELS.portal },
  { id: 'portal', label: 'Geçiş', t0: LABELS.portal, t1: LABELS.nexa },
  { id: 'nexa', label: 'NeXa', t0: LABELS.nexa, t1: ACT1.t1 },
  { id: 'kerinti-finale', label: 'Kerinti', t0: ACT2.t0, t1: ACT2.t1 },
] as const;

/** where the NeXa chapter starts on the first track, for the #nexa anchor */
export const NEXA_VH = Math.round(LABELS.nexa * 100);
