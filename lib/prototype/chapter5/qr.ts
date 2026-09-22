/**
 * A small, real QR Code encoder (ISO/IEC 18004) for the Chapter 5 call-to-action.
 *
 * Byte mode, versions 1–6, error correction L or M, automatic mask selection by the standard penalty
 * rules. That covers URLs up to 134 bytes (version 6-L), which is plenty for a demo / contact link, and
 * keeps the implementation short: versions 1–6 need no version-information blocks.
 *
 * The structure follows Project Nayuki's reference QR generator (MIT); only what this site needs is kept.
 * Chapter 1's QR (`buildQrMatrix` in moduleField.ts) is a stylised pattern; this one scans.
 */

export type Ecc = 'L' | 'M';

/** [ecc codewords per block, number of blocks] by version 1–6 */
const ECC_TABLE: Record<Ecc, [number, number][]> = {
  L: [[7, 1], [10, 1], [15, 1], [20, 1], [26, 1], [18, 2]],
  M: [[10, 1], [16, 1], [26, 1], [18, 2], [24, 2], [16, 4]],
};
/** format bits of the error correction level */
const ECC_FORMAT: Record<Ecc, number> = { L: 1, M: 0 };

const sizeOf = (version: number) => version * 4 + 17;

function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  return [6, version * 4 + 10]; // versions 2–6 have exactly one alignment pattern
}

function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const n = Math.floor(version / 7) + 2;
    result -= (25 * n - 10) * n - 55;
  }
  return result;
}

const totalCodewords = (version: number) => Math.floor(rawDataModules(version) / 8);

function dataCodewords(version: number, ecc: Ecc) {
  const [perBlock, blocks] = ECC_TABLE[ecc][version - 1];
  return totalCodewords(version) - perBlock * blocks;
}

// ── Reed–Solomon over GF(2^8) with the QR polynomial 0x11D ─────────────────────────────

function rsMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function rsDivisor(degree: number): number[] {
  const result: number[] = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = rsMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = rsMultiply(root, 0x02);
  }
  return result;
}

export function rsRemainder(data: readonly number[], degree: number): number[] {
  const divisor = rsDivisor(degree);
  const result: number[] = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => (result[i] ^= rsMultiply(coef, factor)));
  }
  return result;
}

// ── encoding ───────────────────────────────────────────────────────────────────────────

function utf8(text: string): number[] {
  return Array.from(new TextEncoder().encode(text));
}

function encodeData(bytes: number[], version: number, ecc: Ecc): number[] {
  const capacityBits = dataCodewords(version, ecc) * 8;
  const bits: number[] = [];
  const put = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  put(0b0100, 4); // byte mode
  put(bytes.length, 8); // character count (versions 1–9)
  for (const b of bytes) put(b, 8);
  put(0, Math.min(4, capacityBits - bits.length)); // terminator
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) put(pad, 8);
  const out: number[] = [];
  for (let i = 0; i < bits.length; i += 8) out.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  return out;
}

function addEccAndInterleave(data: number[], version: number, ecc: Ecc): number[] {
  const [eccLen, numBlocks] = ECC_TABLE[ecc][version - 1];
  const raw = totalCodewords(version);
  const numShort = numBlocks - (raw % numBlocks);
  const shortLen = Math.floor(raw / numBlocks);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < numShort ? 0 : 1));
    k += dat.length;
    const e = rsRemainder(dat, eccLen);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(e));
  }
  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++)
    blocks.forEach((block, j) => {
      if (i !== shortLen - eccLen || j >= numShort) result.push(block[i]);
    });
  return result;
}

// ── the matrix ─────────────────────────────────────────────────────────────────────────

class Matrix {
  size: number;
  modules: boolean[][];
  fn: boolean[][];
  constructor(readonly version: number) {
    this.size = sizeOf(version);
    this.modules = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
    this.fn = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
  }
  setFn(x: number, y: number, dark: boolean) {
    this.modules[y][x] = dark;
    this.fn[y][x] = true;
  }
  drawFunctionPatterns() {
    const n = this.size;
    for (let i = 0; i < n; i++) {
      this.setFn(6, i, i % 2 === 0);
      this.setFn(i, 6, i % 2 === 0);
    }
    this.drawFinder(3, 3);
    this.drawFinder(n - 4, 3);
    this.drawFinder(3, n - 4);
    const pos = alignmentPositions(this.version);
    for (let i = 0; i < pos.length; i++)
      for (let j = 0; j < pos.length; j++)
        if (!((i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0))) this.drawAlignment(pos[i], pos[j]);
    this.drawFormat('L', 0); // placeholder, overwritten once the mask is chosen
  }
  drawFinder(x: number, y: number) {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = x + dx;
        const yy = y + dy;
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) this.setFn(xx, yy, d !== 2 && d !== 4);
      }
  }
  drawAlignment(x: number, y: number) {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) this.setFn(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  drawFormat(ecc: Ecc, mask: number) {
    const data = (ECC_FORMAT[ecc] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((bits >>> i) & 1) !== 0;
    const n = this.size;
    for (let i = 0; i <= 5; i++) this.setFn(8, i, bit(i));
    this.setFn(8, 7, bit(6));
    this.setFn(8, 8, bit(7));
    this.setFn(7, 8, bit(8));
    for (let i = 9; i < 15; i++) this.setFn(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) this.setFn(n - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) this.setFn(8, n - 15 + i, bit(i));
    this.setFn(8, n - 8, true); // the dark module
  }
  drawCodewords(data: number[]) {
    const n = this.size;
    let i = 0;
    for (let right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < n; vert++)
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? n - 1 - vert : vert;
          if (!this.fn[y][x] && i < data.length * 8) {
            this.modules[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
            i++;
          }
        }
    }
  }
  applyMask(mask: number) {
    const n = this.size;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        let invert: boolean;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
        }
        if (!this.fn[y][x] && invert) this.modules[y][x] = !this.modules[y][x];
      }
  }
  penalty(): number {
    const n = this.size;
    const m = this.modules;
    let result = 0;
    const runs = (get: (i: number, j: number) => boolean) => {
      for (let i = 0; i < n; i++) {
        let run = 1;
        for (let j = 1; j <= n; j++) {
          if (j < n && get(i, j) === get(i, j - 1)) run++;
          else {
            if (run >= 5) result += 3 + (run - 5);
            run = 1;
          }
        }
        // finder-like 1:1:3:1:1 with 4 light on a side
        for (let j = 0; j + 6 < n; j++) {
          const p = [0, 1, 2, 3, 4, 5, 6].map((k) => get(i, j + k));
          if (p[0] && !p[1] && p[2] && p[3] && p[4] && !p[5] && p[6]) {
            const before = j >= 4 && [1, 2, 3, 4].every((k) => !get(i, j - k));
            const after = j + 10 < n && [7, 8, 9, 10].every((k) => !get(i, j + k));
            if (before || after) result += 40;
          }
        }
      }
    };
    runs((i, j) => m[i][j]);
    runs((i, j) => m[j][i]);
    for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) result += 3;
    let dark = 0;
    for (const row of m) for (const v of row) if (v) dark++;
    const total = n * n;
    result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return result;
  }
}

export interface QrCode {
  version: number;
  ecc: Ecc;
  mask: number;
  size: number;
  /** [row][col], true = dark */
  modules: boolean[][];
  text: string;
}

/**
 * Encode `text` as a QR code. Prefers `minVersion` (2 = 25×25, the same grid as the Chapter 1 QR) and
 * grows only if the text does not fit at `ecc`.
 */
export function encodeQr(text: string, ecc: Ecc = 'M', minVersion = 2): QrCode {
  const bytes = utf8(text);
  const fits = (v: number, e: Ecc) => 4 + 8 + bytes.length * 8 <= dataCodewords(v, e) * 8;
  // the requested level at every version first (robustness beats a smaller grid), L only as a last resort
  const order: [number, Ecc][] = [];
  for (const e of ecc === 'M' ? (['M', 'L'] as Ecc[]) : (['L'] as Ecc[])) for (let v = minVersion; v <= 6; v++) order.push([v, e]);
  const pick = order.find(([v, e]) => fits(v, e));
  if (!pick) throw new Error(`QR: "${text}" is too long for versions 1–6 (max 134 bytes at L)`);
  const [version, level] = pick;
  const data = addEccAndInterleave(encodeData(bytes, version, level), version, level);
  let best: Matrix | null = null;
  let bestMask = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const m = new Matrix(version);
    m.drawFunctionPatterns();
    m.drawCodewords(data);
    m.applyMask(mask);
    m.drawFormat(level, mask);
    const score = m.penalty();
    if (score < bestScore) {
      bestScore = score;
      best = m;
      bestMask = mask;
    }
  }
  return { version, ecc: level, mask: bestMask, size: best!.size, modules: best!.modules, text };
}
