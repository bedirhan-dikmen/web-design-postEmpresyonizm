/**
 * Scene configuration for the Chapter 1–3 prototype.
 *
 * Everything is expressed in a 1920×1080 "design space". The stage maps design
 * space to the viewport with object-fit: cover, so every number here is
 * resolution independent.
 *
 * Replacing art: swap the files in /public/prototype-assets keeping the same
 * size + design origin (see the README there). Nothing in the animation needs
 * to change.
 */

export const DESIGN = { w: 1920, h: 1080 } as const;

export type WorldId = 'A' | 'B';

/**
 * Each world has one "portal square". The camera is described by where that
 * square sits on screen and how big it is — the same numbers drive both
 * worlds, which is what makes the Kerinti → NeXa hand-off continuous.
 *
 *  - World A: the inner 5×5 aperture of the QR's top-left finder pattern
 *  - World B: the glass of the restaurant window
 */
export interface PortalDef {
  /** design-space centre of the square when the camera is at rest */
  cx: number;
  cy: number;
  /** side length in design units at rest */
  size: number;
}

/** QR placement in World A. 25×25 modules. */
export const QR_A = { x: 1025, y: 225, cell: 22, n: 25 } as const;

export const PORTAL: Record<WorldId, PortalDef> = {
  A: { cx: QR_A.x + 3.5 * QR_A.cell, cy: QR_A.y + 3.5 * QR_A.cell, size: 5 * QR_A.cell },
  B: { cx: 620, cy: 400, size: 360 },
};

/** Window glass in World B (design units). The dab ring is one cell (72) wide around it. */
export const GLASS_B = { x0: 440, y0: 220, x1: 800, y1: 580 } as const;

/** Table-tent face in World B, and the QR that lands on it. */
export const TENT_B = {
  x0: 1180,
  y0: 650,
  x1: 1310,
  y1: 780,
  qr: { x: 1193, y: 664, cell: 4.2 },
  depth: -0.28,
} as const;

export interface PlateDef {
  id: string;
  world: WorldId | 'view';
  src: string;
  /** design-space top-left of the image */
  x: number;
  y: number;
  /** image size in design units (= pixel size of the placeholder files) */
  w: number;
  h: number;
  /**
   * Depth relative to the world's portal plane. 0 = on the plane,
   * > 0 behind it (moves less), < 0 in front of it (moves more, can pass the camera).
   */
  depth: number;
  blend?: 'screen' | 'soft-light';
  opacity?: number;
  /** Chapter 4/5 plates: hidden until their chapter starts, loaded lazily during late Chapter 3 */
  chapter?: 4 | 5;
}

const ASSETS = '/prototype-assets';

export const PLATES: PlateDef[] = [
  // 02 — the world beyond the portal. Lives in World B space but is visible through the hole in World A.
  { id: 'window-view', world: 'view', src: `${ASSETS}/02-portal/window-view.webp`, x: -580, y: -500, w: 2400, h: 1800, depth: 2.2 },

  // 04 — Chapter 4 building cross-section (behind the dining room; see CHAPTER4_ARTWORK.md)
  // Phase 4.2: every plate carries overscan beyond the camera's widest (21:9) and tallest (4:3) view of its beats
  { id: 'ch4-exterior', world: 'B', chapter: 4, src: `${ASSETS}/04-journey/exterior.webp`, x: -2600, y: -5000, w: 14000, h: 9200, depth: 0 },
  { id: 'ch4-sky', world: 'B', chapter: 4, src: `${ASSETS}/04-journey/sky.webp`, x: 400, y: -5000, w: 9400, h: 3050, depth: 0 },
  { id: 'ch4-office', world: 'B', chapter: 4, src: `${ASSETS}/04-journey/office.webp`, x: 2100, y: -2200, w: 5800, h: 1900, depth: 0 },
  { id: 'ch4-storeroom', world: 'B', chapter: 4, src: `${ASSETS}/04-journey/storeroom.webp`, x: 3700, y: 1250, w: 4000, h: 1650, depth: 0 },
  { id: 'ch4-service', world: 'B', chapter: 4, src: `${ASSETS}/04-journey/service.webp`, x: 5080, y: -450, w: 2920, h: 1850, depth: 0 },
  { id: 'ch4-kitchen', world: 'B', chapter: 4, src: `${ASSETS}/04-journey/kitchen.webp`, x: 2200, y: -450, w: 2900, h: 1850, depth: 0 },

  // 05 — Chapter 5: the Kerinti night above and beside the restaurant (see lib/prototype/chapter5/geometry.json).
  // Rendered AFTER the night veil (PortalFilm.tsx), so the veil darkens the restaurant but never these.
  { id: 'ch5-sky', world: 'B', chapter: 5, src: `${ASSETS}/05-kerinti/sky.webp`, x: -2600, y: -12200, w: 22000, h: 10000, depth: 0 },
  { id: 'ch5-city', world: 'B', chapter: 5, src: `${ASSETS}/05-kerinti/city.webp`, x: 11400, y: -4900, w: 8000, h: 9100, depth: 0 },
  { id: 'ch5-studio', world: 'B', chapter: 5, src: `${ASSETS}/05-kerinti/studio.webp`, x: 13400, y: -2400, w: 3200, h: 1400, depth: 0 },

  // 03 — NeXa restaurant morning
  { id: 'room-wall', world: 'B', src: `${ASSETS}/03-nexa-morning/room-wall.webp`, x: -340, y: -210, w: 2600, h: 1500, depth: 0 },
  { id: 'room-mid', world: 'B', src: `${ASSETS}/03-nexa-morning/room-mid.webp`, x: -340, y: -210, w: 2600, h: 1500, depth: -0.12 },
  { id: 'light-beam', world: 'B', src: `${ASSETS}/03-nexa-morning/light-beam.webp`, x: -340, y: -210, w: 2600, h: 1500, depth: -0.06, blend: 'screen', opacity: 0.42 },
  { id: 'table-near', world: 'B', src: `${ASSETS}/03-nexa-morning/table-near.webp`, x: -340, y: -210, w: 2600, h: 1500, depth: TENT_B.depth },

  // 01 — Kerinti nocturnal world
  { id: 'sky', world: 'A', src: `${ASSETS}/01-kerinti-night/sky.webp`, x: -480, y: -360, w: 2880, h: 1800, depth: 1.6 },
  { id: 'horizon', world: 'A', src: `${ASSETS}/01-kerinti-night/horizon.webp`, x: -480, y: 700, w: 2880, h: 800, depth: 0.8 },
];

/**
 * Size a plate's <img> at the image's own pixel size and return the extra scale that maps it to its design
 * size. Plates used to be laid out at their DESIGN size (the Kerinti sky is 22000 × 10000 design units, the
 * exterior 14000 × 9200) and shrunk by the transform. The browser then had to keep a composited layer of that
 * enormous size; during a fast pull-back it could not rasterise its tiles in time, and the layers underneath
 * (the evening sky, or the empty stage) flashed through — the "gel-git" between Chapters 4 and 5.
 * Laid out at pixel size, each layer is only as large as its image. What is drawn on screen is identical.
 */
export function fitPlate(img: HTMLImageElement, def: { w: number; h: number }): [number, number] {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return [1, 1];
  if (img.dataset.fit !== `${nw}x${nh}`) {
    img.style.width = `${nw}px`;
    img.style.height = `${nh}px`;
    img.dataset.fit = `${nw}x${nh}`;
  }
  return [def.w / nw, def.h / nh];
}

export const SHARED = {
  grain: `${ASSETS}/00-shared/grain.png`,
};

/**
 * Brush dab atlas: one row of `count` square cells, light grey texture on transparency,
 * tinted at runtime for every module (stars, QR, dust, window frame, gold, flicks).
 *
 * - `cell`: expected cell size in px. The renderer derives the real cell size from the
 *   image height when the atlas loads, so a higher-resolution atlas (e.g. 8 × 512 = 4096×512)
 *   is a drop-in replacement; a mismatch with this value only logs a warning.
 * - `tintCell`: resolution of each tinted sprite kept in memory. There are ~7 tints × `count`
 *   sprites, so memory ≈ 56 × tintCell² × 4 B: 256 → ~15 MB, 512 → ~58 MB. Raise it together
 *   with the final atlas only after checking memory on target machines.
 */
export const DAB_ATLAS = {
  src: `${ASSETS}/00-shared/dabs.png`,
  count: 8,
  cell: 256,
  tintCell: 256,
} as const;

/**
 * Text is laid out in the same 1920×1080 design space as the artwork (cover-fit), so a text
 * box stays locked to its painted safe zone on every desktop aspect ratio.
 *
 * TEXT_FRAME is the part of the design frame that stays visible from 4:3 (x 240–1680) to
 * 21:9 (y 135–945). Text boxes sit inside BOTH this frame (with ≥ 60 units of inset, so text
 * never hugs a screen edge) and their artwork safe zone (ARTWORK_COMPOSITIONS.md → Text safe
 * areas), so they are never cropped.
 *
 * TODO(mobile-phase): portrait viewports crop the design frame to x ≈ 710–1210, which hides
 * the QR, the window and these text boxes. Mobile needs its own camera composition, portal
 * positions, text boxes and crop strategy — see ASSET_MANIFEST.md §4 and
 * ARTWORK_REPLACEMENT_CONTRACT.md §6 (item 6). Not addressed in the desktop prototype.
 */
export const TEXT_FRAME = { x0: 240, y0: 135, x1: 1680, y1: 945 } as const;

export const TEXT_BOXES = {
  /** Kerinti eyebrow + H1 + supporting line — inside safe zone T1 (x 80–800, y 300–820) */
  intro: { x: 300, y: 330, w: 500 },
  /** Chapter 1 second line — inside safe zone T2 (x 120–760, y 570–760) */
  small: { x: 300, y: 640, w: 460 },
  /** NeXa eyebrow + H2 + supporting lines — inside safe zone T4 (x 1220–1840, y 170–570) */
  nexa: { x: 1220, y: 200, w: 400 },
} as const;

/* Scroll budget: see lib/prototype/acts.ts (two acts, 1 timeline unit = 100vh). */
