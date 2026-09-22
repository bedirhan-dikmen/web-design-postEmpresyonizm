# Module Field Skill

One persistent pool of particles that plays every role in the film: stars, a code, dust, a window
frame, an interface, a chart, and finally a scannable code again.

---

## 1. PURPOSE

Give a long sequence **one visual protagonist**. Instead of a new effect per scene, the same finite
set of objects keeps its identity and changes formation. The reader is never introduced to a new
thing; they watch a thing they already know become something else.

## 2. VISUAL RESULT

A field of square painted dabs. In the opening they are scattered stars that gather into a code. At
the threshold a small gold subset detaches and is carried by the camera. In the destination world
they drift as dust and settle onto a physical object. Through the middle of the film they form
interface elements — menu tiles, an order card, a grid, a receipt, stock bins, ledger rows, chart
columns. In the closing they rise back into the sky and assemble into a real, scannable code.

## 3. REQUIRED INGREDIENTS

- A canvas 2D layer covering the viewport.
- A **dab atlas**: one PNG strip of N square cells, a light-grey painted texture on transparency.
  Reference: 8 cells × 256px. Tinted at runtime, so one atlas serves every colour.
- A seeded PRNG (`mulberry32` or similar) so every "random" position is reproducible.
- The camera model from `CAMERA_GRAMMAR.md`.

## 4. STRUCTURE

```ts
class ModuleField {
  private mods: Mod[];                 // the pool, built once in the constructor
  private atlas: HTMLImageElement;
  private tinted: Map<string, Canvas>; // "variant|colour" → pre-tinted sprite
  draw(ctx, state, viewport, dpr, clock) { … }
}

interface Mod {
  role: number;         // DATA | RING | GOLD | ACCENT | DUST
  variant: number;      // which atlas cell — fixed for life
  phase: number;        // ambience phase — fixed for life
  sx, sy, sd, ss;       // scatter position (source world): x, y, depth, size
  qx, qy, qs;           // formation position (source world)
  dx, dy, dd, ds;       // scatter position (destination world)
  tx, ty, td, ts;       // target position (destination world)
  aDelay, bDelay;       // per-module stagger
  curve;                // how far its flight arcs
  starColor;            // its colour while free
}
```

Everything a module needs for every formation is computed **once, in the constructor**, from a seeded
RNG. Per frame, only interpolation happens. This is what makes the field cheap and deterministic.

## 5. ROLES

Give each module a role at construction and never change it. Roles are how identity survives a
transformation.

| Role | Source world | Destination world | Notes |
|---|---|---|---|
| `DATA` | a cell of the code | the same cell of the destination code | the bulk of the field |
| `RING` | the outer ring of the emphasised finder | the frame of the destination's window | the frame the camera flew through *is* the ring it flew through |
| `GOLD` | the 3×3 core of that finder | carried by the camera, then landed | the subject the reader follows |
| `ACCENT` | ambient star | the destination object's own finder ring | |
| `DUST` | ambient star | free-floating mote | ambience only; no formation duty |

The gold subset is the single most valuable idea here: a small, visually distinct group that the
reader can track individually across the entire film. It is the difference between "particles moved"
and "those nine things went through and came out the other side".

## 6. FORMATIONS

A formation is a list of slots in **local** design units around an anchor:

```ts
interface Slot { x: number; y: number; size: number; color: ColorKey; gold: boolean; }
interface Formation { key: string; slots: Slot[]; goldCount: number; }
```

Rules:

- **Gold slots are listed first.** The assignment function gives them to the gold modules, so the
  followed subject stays the followed subject in every formation.
- Formations are placed in the world by an **anchor** (a point, often sampled along a path) plus a
  **local scale** per formation, so the same geometry can be a phone-sized menu or a wall-sized chart.
- Count mismatch is normal. If there are more modules than slots, extras cycle and sit exactly on top
  of each other (invisible). If there are more slots than modules, borrow from the ambient pool.

### Deterministic slot assignment

```ts
function assignSlots(formation, moduleIsGold) {
  const out = new Array(moduleIsGold.length);
  let g = 0;
  moduleIsGold.forEach((isGold, i) => { if (isGold && g < formation.goldCount) out[i] = g++; });
  const free = range(g, formation.slots.length);
  let k = 0;
  moduleIsGold.forEach((_, i) => {
    if (out[i] === undefined) out[i] = free.length ? free[k++ % free.length] : k++ % formation.slots.length;
  });
  return out;
}
```

Computed **once per formation at startup**, cached as `slots[]` on each participating module. Never
re-assign at runtime: a re-assignment during a scrub would swap two modules' targets mid-flight.

## 7. MORPHING BETWEEN FORMATIONS

Drive the whole chain from one continuous channel:

```ts
st.form   // 0 = formation 0, 1 = formation 1, 2.5 = halfway from 2 to 3 …

const k = Math.floor(st.form);       // current formation
const p = st.form - k;               // progress into the next
const e = ease(clamp01((p - delay) / 0.65));
```

Per-module `delay` staggers the transformation so it reads as material flowing rather than a slide
transition. Give the **gold modules a much smaller delay** (`delay * 0.15`): the subject leads and
the rest of the material follows it. This one line is most of why the morph reads as intentional.

Add an arc so flights are not straight lines:

```ts
const arc = Math.sin(Math.PI * e) * curve;
x = lerp(ax, bx, e) + arc * 0.35;
y = lerp(ay, by, e) - arc;
```

Swap the colour at the crossover (`e > 0.5`), not gradually: a dab that is 50% one colour and 50%
another reads as mud.

## 8. RENDERING

```ts
const dab = (x, y, size, rot, variant, color, alpha, screenSpace = false) => {
  if (alpha <= 0.01 || size <= 0.3) return;                  // cheap reject
  const p = screenSpace ? toScreen(x, y) : project(x, y);
  const ps = size * viewportScale * dpr * p.s;
  if (offscreen(p, ps)) return;                              // cull
  const sprite = tintedSprite(variant, color);               // cached
  ctx.globalAlpha = alpha;
  ctx.setTransform(cos * ps, sin * ps, -sin * ps, cos * ps, p.x * dpr, p.y * dpr);
  ctx.drawImage(sprite, -0.5, -0.5, 1, 1);
};
```

Tinting, done once per (variant, colour) pair and cached:

```ts
fill colour → composite 'multiply' with the atlas cell → composite 'destination-in' with it again
```

That keeps the painted texture and the alpha shape while replacing the hue. Memory is
`tints × cells × tintCell² × 4 bytes` — at 7 tints × 8 cells × 256² that is ~15 MB, at 512² it is
~58 MB. Raise `tintCell` only after measuring on target hardware.

### Near-fade

Modules at negative depth grow enormous as they pass the lens. Fade them out by screen size:

```ts
const nearFade = (screenSize) => clamp01((260 - screenSize) / 140);
```

Without it, one dab becomes a full-screen grey rectangle at the threshold.

## 9. AMBIENCE

Wall-clock motion keeps the field alive when the scroll rests:

```ts
const wob  = Math.sin(clock * 0.6 + m.phase);
const wob2 = Math.cos(clock * 0.45 + m.phase * 1.7);
x += wob * 7 * free;                 // `free` = 1 - formationProgress
```

Amplitude must scale with `free`, so a settled formation is **still**. A code whose modules still
jitter after landing reads as unfinished — and, if it is a real code, may fail to scan.

## 10. REVERSE-SCROLL REQUIREMENTS

- Every module position is `f(state, constants, clock)`. No accumulation, no velocity integration,
  no "previous position" stored between frames.
- Slot assignments and seeded positions are built at construction, never mutated.
- Ambience uses the wall clock, so it differs frame to frame — which is fine, because it carries no
  meaning. Never let ambience feed back into story state.

## 11. FAST-SCROLL REQUIREMENTS

- Stagger delays should span at most ~0.35 of a transformation's duration. Longer staggers mean a
  flung reader sees a half-built formation at every sample.
- Every formation needs a hold after it completes. See `FAST_SCROLL_READABILITY.md`.

## 12. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| The field reads as noise | Too many modules at too many sizes with no colour discipline | Cut count, unify size per formation, restrict to 2–3 tints per moment |
| One giant grey rectangle at a threshold | A near-depth module passing the lens | `nearFade` by screen size |
| Modules visibly swap places mid-morph | Slots re-assigned at runtime | Assign once at startup |
| The morph reads as a crossfade, not a flow | No stagger, no arc, colour lerped | Add per-module delay, `sin(πe)` arc, hard colour swap at `e > 0.5` |
| Memory spike on mobile | `tintCell` raised with many tints | Measure; 256 is usually right |
| The formation never looks finished | Ambience not damped by formation progress | Scale wobble by `1 - progress` |

## 13. HOW TO CUSTOMIZE

Replace freely: dab texture, palette, module count, formation geometry, the story the formations
tell, the number of formations.

Keep: persistent identity, roles fixed at construction, a distinguished "gold" subset, gold-first
slot ordering, gold-leads staggering, seeded determinism, atlas tinting, near-fade.

## 14. MINIMAL PSEUDOCODE

```ts
// construction (once)
for (const cell of codeCells) mods.push(make(roleFor(cell), cell.r, cell.c));
for (let i = 0; i < AMBIENT_N; i++) mods.push(make(DUST, 0, 0));
const isGold = participants.map(m => m.role === GOLD);
const perFormation = FORMATIONS.map(f => assignSlots(f, isGold));

// per frame
const k = floor(st.form), p = st.form - k;
for (const [i, m] of participants.entries()) {
  const A = slotOf(k,     perFormation[k][i]);
  const B = slotOf(k + 1, perFormation[k + 1][i]);
  const lead = B.gold || A.gold;
  const e = ease(clamp01((p - m.delay * (lead ? 0.15 : 1)) / 0.65));
  const arc = sin(PI * e) * m.curve;
  dab(lerp(A.x, B.x, e), lerp(A.y, B.y, e) - arc,
      lerp(A.size, B.size, e), m.rot, m.variant,
      e < 0.5 ? A.color : B.color, 0.95);
}
```

## 15. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| The field: pool, roles, draw, tinting, near-fade, ambience | `lib/prototype/moduleField.ts` |
| Atlas definition and memory notes | `lib/prototype/sceneConfig.ts → DAB_ATLAS` |
| Formations, slot geometry, `assignSlots`, `FORM_SCALE` | `lib/prototype/chapter4/formations.ts` |
| Formation anchors along a path | `lib/prototype/chapter4/flowPath.ts` |
| Closing drift + final-code targets | `lib/prototype/moduleField.ts` (`drift5`, `drawAmbient5`) and `lib/prototype/chapter5/finalQr.ts` |
| Atlas asset | `public/prototype-assets/00-shared/dabs.png` |
| Atlas generator | `scripts/paint-prototype-assets.mjs` |
