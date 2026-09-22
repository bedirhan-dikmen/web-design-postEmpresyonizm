import { qrTarget } from '../../site/config';
import { encodeQr, type QrCode } from './qr';
import G from './geometry.json';

/**
 * The final QR of the film: a real, scannable QR Code that leads to the homepage's contact section.
 *
 * Its target is `qrTarget()` (lib/site/config.ts): `${SITE.url}/#iletisim` when the canonical origin is configured,
 * otherwise the origin actually serving the page — so it is correct on any deployment and never points at a
 * placeholder domain. Because that origin is only known in the browser, the code is built lazily on the client.
 *
 * Error correction M; version 2 (25×25, Chapter 1's grid) when the URL fits, larger otherwise. Its top-left finder is
 * built by the dabs that formed the finder square at the end of Chapter 4 (FINDER_SLOTS / FINDER_CORE order); the other
 * dark modules by the operational modules, and — if the code is larger than 25×25 — by the Kerinti sky's stars.
 */

export const QR_CELL_BASE = G.qr.cell;

export interface FinalQr {
  code: QrCode;
  /** module size in world units (the card keeps one physical size whatever the version) */
  cell: number;
  /** world top-left of the code, without the quiet zone */
  origin: [number, number];
  /** full card side, quiet zone included */
  full: number;
  cellAt: (r: number, c: number) => [number, number];
  finderRing: [number, number][];
  finderCore: [number, number][];
  /** every other dark module, in a stable shuffled order */
  dataCells: [number, number][];
}

let cached: { target: string; qr: FinalQr } | null = null;

export function getFinalQr(): FinalQr | null {
  const target = qrTarget();
  if (!target) return null;
  if (cached && cached.target === target) return cached.qr;
  const code = encodeQr(target, 'M', 2);
  const n = code.size;
  // the card keeps the size a 25×25 code has; a larger code gets smaller modules
  const cell = (QR_CELL_BASE * 25) / n;
  const origin: [number, number] = [G.qr.center[0] - (n * cell) / 2, G.qr.center[1] - (n * cell) / 2];
  const cellAt = (r: number, c: number): [number, number] => [origin[0] + (c + 0.5) * cell, origin[1] + (r + 0.5) * cell];
  const finderRing: [number, number][] = [];
  for (let c = 0; c < 7; c++) finderRing.push([0, c]);
  for (let r = 1; r < 7; r++) finderRing.push([r, 6]);
  for (let c = 5; c >= 0; c--) finderRing.push([6, c]);
  for (let r = 5; r >= 1; r--) finderRing.push([r, 0]);
  const finderCore: [number, number][] = [[0, 0], [-1, 0], [0, 1], [1, 0], [0, -1], [-1, -1], [1, -1], [1, 1], [-1, 1]].map(([dx, dy]) => [3 + dy, 3 + dx]);
  const dataCells: [number, number][] = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) if (code.modules[r][c] && !(r < 7 && c < 7)) dataCells.push([r, c]);
  let s = 2027;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = dataCells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [dataCells[i], dataCells[j]] = [dataCells[j], dataCells[i]];
  }
  const qr: FinalQr = { code, cell, origin, full: (n + 2 * G.qr.quiet) * cell, cellAt, finderRing, finderCore, dataCells };
  cached = { target, qr };
  return qr;
}
