# Module → Scannable QR Skill

Turning the film's painted particles into a **real, scannable QR code** that keeps its painterly
texture. This is the hardest technical piece in the archive.

---

## 1. PURPOSE

End the film on a code that is simultaneously (a) the visual payoff of the whole module-field motif
and (b) a code that a phone camera actually decodes.

## 2. VISUAL RESULT

Square painted dabs drift in a night sky. They gather along arcs onto a cream card with a gold rim.
As they land, a crisp code rises underneath them and the paint settles into it — the texture stays,
the edges stop bleeding. The result reads as a hand-painted code and scans like a printed one.

## 3. REQUIRED INGREDIENTS

- The module field with persistent identity (`shared/MODULE_FIELD_SKILL.md`).
- A **real** QR encoder — ISO/IEC 18004, byte mode, ECC L/M, penalty-based mask selection. (~300
  lines; versions 1–6 need no version-information blocks, which is most of the savings.)
- The target URL, known at render time.
- A crisp vector layer (SVG) under the painted layer.
- A quiet zone of at least 4 modules.

## 4. STRUCTURE

```text
<card>                       cream face, gold rim, drop shadow, corner radius
  <svg data-qr-crisp>        the real code, shapeRendering="crispEdges", opacity driven by state
    <path fill="#16264f" />  one path: "M<c> <r>h1v1h-1z" per dark module, viewBox 0 0 n n
<canvas>                     the painted dabs, drawn ABOVE the card
```

The card is a DOM prop placed in world space by the same camera transform as everything else. The
dabs are canvas. The crisp SVG sits between them.

## 5. BUILDING THE CODE

```ts
export function getFinalQr(): FinalQr | null {
  const target = qrTarget();                  // the URL — see §6
  if (!target) return null;
  const code = encodeQr(target, 'M', 2);      // ECC M, prefer version 2 (25×25)
  const n = code.size;
  const cell = (BASE_CELL * 25) / n;          // the CARD keeps one physical size
  const origin = [centre[0] - n * cell / 2, centre[1] - n * cell / 2];
  …
}
```

Design decisions worth copying:

- **Error correction M (15% recovery), not L.** Painted dabs, a textured card and a photographed
  screen all eat into the margin. Prefer M at *every* version before falling back to L:

```ts
const order = [];
for (const e of ['M', 'L']) for (let v = minVersion; v <= 6; v++) order.push([v, e]);
const pick = order.find(([v, e]) => fits(v, e));
```

  Robustness beats a smaller grid.

- **Prefer version 2 (25×25)** — the same grid as the opening's stylised code. The motif reads as the
  same object returning. Grow only if the URL does not fit.

- **The card keeps one physical size** whatever the version. A longer URL produces smaller modules,
  not a bigger card, so the composition never changes.

- **Quiet zone of 4 modules** (the ISO minimum) of card around the code. Do not put anything in it —
  not a rim, not a shadow, not a dab.

- **Dark ink on cream**, not black on white. Enough contrast to decode, warm enough to belong in the
  frame. Verify contrast ratio empirically with real decoders (§11).

## 6. THE TARGET URL

```ts
export function qrTarget(): string | null {
  const origin = SITE.url ?? (typeof window !== 'undefined' ? window.location.origin : null);
  return origin ? `${origin}/#contact` : null;
}
```

- Prefer a configured canonical origin; fall back to the origin actually serving the page.
- Because the fallback is only known in the browser, **build the code lazily on the client** and
  cache it by target string.
- Never encode a placeholder domain. A code that resolves to nothing is worse than no code.
- Shorter URLs mean larger modules mean easier scanning. Point at a short path.

## 7. DETERMINISTIC TARGET ASSIGNMENT

Every dark module of the code needs exactly one dab, assigned stably.

```ts
// 1. the finder ring, in the SAME order the mark was originally drawn (clockwise from top-left)
const finderRing = [];
for (let c = 0; c < 7; c++) finderRing.push([0, c]);
for (let r = 1; r < 7; r++) finderRing.push([r, 6]);
for (let c = 5; c >= 0; c--) finderRing.push([6, c]);
for (let r = 5; r >= 1; r--) finderRing.push([r, 0]);

// 2. the 3×3 core, centre first
const finderCore = [[0,0],[-1,0],[0,1],[1,0],[0,-1],[-1,-1],[1,-1],[1,1],[-1,1]]
  .map(([dx, dy]) => [3 + dy, 3 + dx]);

// 3. every other dark module, in a SEEDED shuffle
const dataCells = [];
for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
  if (code.modules[r][c] && !(r < 7 && c < 7)) dataCells.push([r, c]);
seededShuffle(dataCells, 2027);
```

Then:

| Source | Target |
|---|---|
| the finder mark carried since the previous act | `finderRing` then `finderCore`, cell for cell |
| the operational modules (index `i`) | `dataCells[i]` |
| the sky stars (index `i`) | `dataCells[operationalCount + i]` |
| any module with no cell left | fades out as a quiet star |

The seeded shuffle matters: assigning cells in raster order makes the code fill top-to-bottom like a
progress bar. Shuffled, it fills as a texture resolving.

## 8. THE FLIGHT

```ts
const u = ease(clamp01((k5 - 1 - delay * 0.4) / 0.62));
const [wx, wy] = qr.cellAt(row, col);
const lift = Math.sin(Math.PI * u) * 160 * cameraScale;
x = lerp(x, target.x, u);
y = lerp(y, target.y, u) - lift;
size = lerp(size, qr.cell * 0.92, u);
rot  = lerp(rot, 0, u);                    // painted rotation → axis-aligned
if (u > 0.55) colour = INK;
```

Three details:

- **Rotation must go to zero.** A rotated dab overlaps its neighbours' cells. Axis alignment is a
  decoding requirement, not a style choice.
- **Size lands at 0.92 of a module**, not 1.0. A dab at exactly one module, with soft painted edges,
  bleeds into adjacent light cells.
- **Colour swaps at 55%** of the flight, hard, not lerped.

## 9. PAINTED DAB → CRISP CODE SETTLING

This is the step that makes it scan.

```ts
// the crisp SVG comes up as the card resolves
crisp.style.opacity = clamp01((qr - 0.45) / 0.55);

// and the paint settles into it
const settle = 1 - 0.62 * clamp01((qr - 0.55) / 0.45);
dabAlpha *= settle;                         // ~0.96 → ~0.38
dabSize  *= /* already 0.92 */;
```

The painted layer never disappears — at ~38% opacity over the crisp code, the texture is clearly
visible but the decoder sees the crisp geometry underneath. The reader sees paint; the camera sees a
code.

Do **not** fade the paint out entirely: the point of the whole film is that these modules became the
code. And do not try to make the paint alone scannable: soft brush edges at module scale are
unreliable at any alpha.

## 10. QUIET ZONE AND SURROUNDINGS

- 4 modules of plain card on every side, containing nothing.
- The card's gold rim sits **outside** the quiet zone (inset shadow on the card, sized from the
  module size).
- The halo/glow behind the card is a separate, larger, soft radial — never a hard edge near the code.
- No copy, button or decoration overlaps the card.
- Keep the card away from the very edge of the frame so a phone can frame it with margin.

## 11. HOW TO TEST SCANNING

Two levels. Do both.

### Automated (repeatable, do this in CI or a script)

Render the **real final frame** — dabs, crisp layer, sky, copy and buttons all in view — to a
screenshot, then run **three independent decoders**: jsQR, ZXing (JS port), and zxing-cpp (WASM). The
ZXing family is the engine inside most Android scanner apps and many in-app scanners.

Test matrix (each condition, each decoder):

```text
card fills the view          whole screen in view        whole screen from far away
far (code ≈150px)            very far (code ≈110px)
defocus blur 2px             defocus blur 3.5px
tilt 15°                     tilt 35°                    keystone (angled view)
dim room (contrast ×0.5)     overexposed (+70)
sensor noise ±35             screen glare                heavy JPEG (q25)
far + blur + tilt + noise + low contrast + JPEG, combined
```

Pass criteria: **every condition read by at least two decoders, and no decode ever returns a wrong
value.** A wrong value is far worse than a failure to read.

Also verify the encoder itself against a published test vector (the "HELLO WORLD" 1-M Reed–Solomon
vector is the standard one).

### Physical (cannot be automated — schedule it)

Scan the real final frame on a real screen with at least:

- an iPhone Camera app (Apple Vision),
- an Android Camera / Google Lens,
- one in-app scanner (a messaging or banking app),

from ~30cm and ~1m, in a lit room and a dim room. Re-run whenever the URL changes.

## 12. REVERSE-SCROLL REQUIREMENTS

- The code is built once and cached by target string. Rebuilding mid-scrub would reshuffle nothing
  (the shuffle is seeded) but would cost frames.
- Cell assignments are index-based and fixed.
- The crisp layer's opacity and the paint's settle factor are both pure functions of the `qr` channel.
- Scrolling back disassembles the code along the same arcs.

## 13. FAST-SCROLL REQUIREMENTS

- Per-module stagger ≤ ~0.4 of the assembly channel.
- The camera must have settled *before* the assembly starts (reference: settled at 47% of the beat,
  assembly starts at 24% and runs to 60% — so the last two thirds of the assembly happen on a still
  camera).
- A long terminal hold, so the scannable frame is the one a reader stops on.

## 14. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| Decoders fail on the rendered frame | Painted dabs bleeding into light modules | Size 0.92, rotation → 0, settle alpha to ~0.38 over a crisp layer |
| Decoders sometimes return the wrong URL | Insufficient ECC for the visual noise | Use M, not L; verify with the full matrix |
| The code fills like a progress bar | Cells assigned in raster order | Seeded shuffle |
| The finder does not line up with the carried mark | Different cell order in the two places | Share one ordering (ring clockwise from top-left, then core centre-first) |
| The code changes size between deployments | Card sized from the module count | Fix the card size; derive the module size from it |
| The code points nowhere | Placeholder domain shipped | Derive from the serving origin; fail closed (render no code) if unknown |
| The code is built on the server with the wrong origin | Encoded at build time | Build lazily on the client, cache by target |
| The quiet zone is violated | Rim or glow drawn inside it | Rim outside, glow soft and large |
| The code jitters | Ambient wobble not damped after landing | Damp ambience by landing progress |

## 15. MINIMAL PSEUDOCODE

```ts
// once, lazily, on the client
const qr = getFinalQr();                                   // real encoder, ECC M, version ≥2
crisp.setAttribute('viewBox', `0 0 ${qr.code.size} ${qr.code.size}`);
path.setAttribute('d', qr.code.modules.flatMap((row, r) =>
  row.map((dark, c) => dark ? `M${c} ${r}h1v1h-1z` : '')).join(''));

// per frame, per module
const cell = qr.dataCells[i];                              // stable index assignment
if (!cell) { alpha *= 1 - 0.75 * u; }                      // spare modules fade
else {
  const [wx, wy] = qr.cellAt(cell[0], cell[1]);
  const u = ease(clamp01((k5 - 1 - delay * 0.4) / 0.62));
  x = lerp(x, wx, u); y = lerp(y, wy, u) - sin(PI * u) * LIFT;
  size = lerp(size, qr.cell * 0.92, u);
  rot = lerp(rot, 0, u);
  alpha = lerp(alpha, 0.96, u) * (1 - 0.62 * clamp01((st.qr - 0.55) / 0.45));
  if (u > 0.55) colour = INK;
}

// the crisp layer
crisp.style.opacity = clamp01((st.qr - 0.45) / 0.55);
```

## 16. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| Real QR encoder (byte mode, v1–6, ECC L/M, RS, masking, penalty) | `lib/prototype/chapter5/qr.ts` |
| Code assembly for the film: cell size, origin, finder order, seeded shuffle, caching | `lib/prototype/chapter5/finalQr.ts` |
| The target URL | `lib/site/config.ts → qrTarget()`, `lib/site/site.json` |
| The card, the crisp SVG, `buildQr()` on the client | `components/prototype/Chapter5Layers.tsx` (`qrCard` prop, `data-qr-crisp`, `createChapter5Updater`) |
| Module flight, settle, ink swap, spare fade | `lib/prototype/moduleField.ts` (`drawChapter4` Chapter-5 block, `drawAmbient5`) |
| The carried finder mark → the code's finder | `lib/prototype/moduleField.ts` (`finderOf` block), `lib/prototype/chapter4/formations.ts` (`FINDER_SLOTS`, `FINDER_CORE`) |
| Card geometry, quiet zone, centre | `lib/prototype/chapter5/geometry.json → qr` |
| Assembly timing | `lib/prototype/chapter5/timeline.ts` (beat `k4`) |
| Decoder verification record | `CHAPTER5_NOTES.md → The final QR / Decoding` |
