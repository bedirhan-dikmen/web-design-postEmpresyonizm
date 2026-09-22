# QR Formation Skill

Turning a scattered field of particles into a code-like geometry that reads instantly, stays
deterministic, and can hand one of its own features to the portal.

---

## 1. PURPOSE

Assemble the module field into a recognisable code, with one finder square emphasised so it can
become the threshold the camera flies through.

## 2. VISUAL RESULT

Pale square dabs scattered across a night sky drift, arc and settle into a 25×25 grid. The three
corner finder patterns resolve first; the data field sweeps in from them. The top-left finder's 3×3
core is gold — the only warm colour in the frame — and light begins to leak from behind it.

## 3. REQUIRED INGREDIENTS

- The module field (`shared/MODULE_FIELD_SKILL.md`).
- A code matrix generator (stylised or real — see §11).
- A seeded PRNG.
- A grid placement: origin, cell size, module count.

## 4. STRUCTURE

```ts
const QR_A = { x: 1025, y: 225, cell: 22, n: 25 };   // design-space placement

PORTAL.A = {
  cx: QR_A.x + 3.5 * QR_A.cell,     // centre of the top-left finder
  cy: QR_A.y + 3.5 * QR_A.cell,
  size: 5 * QR_A.cell,              // its inner 5×5 aperture
};
```

The portal square is **derived from the code's own geometry**. Never place it independently — if
they can drift apart, they will.

## 5. THE MODULE-FIELD CONCEPT

One pool, roles assigned by where a module sits in the matrix:

```ts
for (r, c) in matrix:
  if (!matrix[r][c]) continue;                     // light module: no dab
  const inTopLeftFinder = r < 7 && c < 7;
  const isCore = inTopLeftFinder && r in 2..4 && c in 2..4;
  role = inTopLeftFinder ? (isCore ? GOLD : RING) : DATA;
```

Plus two ambient groups that are not part of the code: the destination object's own finder ring, and
free dust. They exist from the first frame so the sky is populated before anything assembles.

## 6. SEEDED POSITIONS

Every "random" value comes from one seeded generator, consumed in a fixed order at construction:

```ts
const rand = mulberry32(7);
const star = () => {
  let x = -120 + rand() * 2160;
  const y = -60 + rand() * 960;
  // keep the headline region calmer: push most stars out of it
  if (x < 820 && y > 260 && y < 720 && rand() < 0.6) x = 820 + rand() * 1200;
  return { x, y };
};
```

Two properties this buys:

- **Deterministic**: the same frame every reload, every reverse scroll, every machine.
- **Art-directed randomness**: the exclusion rule above keeps the copy area quiet without making the
  field look gridded. Randomness with rules beats both uniform noise and hand placement.

Use a **separate seed per act** (`mulberry32(7)`, `mulberry32(4004)`, `mulberry32(5005)`). Then adding
particles to a later act cannot shift the earlier act's field by one draw.

## 7. STAR → SQUARE TRANSFORMATION

```ts
const e    = ease(clamp01((st.assemble - m.aDelay) / 0.5));
const free = 1 - e;
const arc  = Math.sin(Math.PI * e) * m.curve;

x     = lerp(m.sx, m.qx, e) + arc * 0.35 + wob  * 7 * free;
y     = lerp(m.sy, m.qy, e) - arc * 0.2  + wob2 * 5 * free;
depth = lerp(m.sd, 0, e);                // scattered depths → all on the code plane
size  = lerp(m.ss, m.qs, e);             // small twinkle → full cell
colour = e > 0.5 ? CODE_COLOUR : m.starColor;
alpha  = 0.72 + 0.28 * e - twinkle * free;
```

Four things change together — position, depth, size and colour — which is why it reads as a
transformation rather than a move. Depth converging to zero is what makes the field *flatten* into a
readable plane.

### Assembly order

```ts
aDelay = codeModule
  ? clamp01(distanceToNearestFinderCentre / 26) * 0.5 + rand() * 0.06
  : 0;
```

Finders first, then a sweep outward. This is not decoration: the finder squares are what make a code
*legible as a code*, so resolving them first means the shape is recognised before it is complete.
Keep the random jitter small (≈0.06) — it breaks the mechanical feel without breaking the order.

## 8. FINDER GEOMETRY

A finder pattern is 7×7: a dark ring, a light gap, a dark 3×3 core, with a one-module light margin
outside. It is the most recognisable feature of a code and the one you should build the design
around.

```text
· · · · · · · · ·
· ■ ■ ■ ■ ■ ■ ■ ·
· ■ · · · · · ■ ·
· ■ · ■ ■ ■ · ■ ·
· ■ · ■ ■ ■ · ■ ·      ← the 3×3 core is the portal aperture
· ■ · ■ ■ ■ · ■ ·
· ■ · · · · · ■ ·
· ■ ■ ■ ■ ■ ■ ■ ·
· · · · · · · · ·
```

Role assignment:

- **core (3×3)** → `GOLD`. The subject. Becomes the portal aperture, is carried through it, and lands
  on the destination object.
- **ring (the 7×7 outline)** → `RING`. Becomes the **frame of the window** in the destination world.
- everything else → `DATA`.

Giving the ring a job on the other side is what closes the loop: the square the camera flew through
is visibly framed by the same modules that framed it before.

## 9. GOLD MODULE IDENTITY

Nine modules, a distinct warm hue in a cool field, with a small additive glow sprite behind each one
while they are below ~200px on screen. They:

1. sit in the code as its finder core,
2. detach at the threshold and hold a screen-space formation (carried by the camera),
3. drift in the destination's light beam,
4. land as the destination object's own finder.

Keep the count small (9 is ideal — a 3×3 is countable at a glance) and the colour unique. Everything
else in the field may share colours; the gold must not.

## 10. AVOIDING VISUAL NOISE

| Rule | Why |
|---|---|
| One size per formation state | Mixed sizes in a settled formation read as an error |
| At most 2–3 tints on screen at once | More reads as confetti |
| Damp ambience by `1 - assembleProgress` | A settled code must be still |
| Keep a quiet region for copy | Enforce it in the scatter function, not with a scrim |
| Cull and near-fade aggressively | One huge dab destroys a frame |
| Light modules draw nothing | Do not draw "off" cells in a lighter tint; absence is the contrast |

## 11. STYLISED CODE VS REAL SCANNABLE CODE

**Use a stylised matrix for the opening.**

```ts
export function buildQrMatrix(n = 25, seed = 2026): boolean[][] {
  // three finders with their light margins
  // timing rows/columns (alternating) on row 6 and column 6
  // one alignment pattern near the bottom-right
  // every remaining cell: rand() < 0.47
}
```

Roughly 47% fill matches the visual density of a real code. It has the silhouette without the
constraints.

Reasons the opening should **not** carry a real code:

- The opening code is flown into, partially occluded, rotated, scaled 60× and half-dismantled. A real
  code in that state is not scannable anyway, so the robustness is wasted.
- A real code invites scanning at a moment when the reader should be watching, not reaching for a
  phone.
- A real code's content is fixed geometry; a stylised one lets you tune density, cell count and the
  finder emphasis to the composition.
- Version/ECC constraints would dictate your grid size instead of your art direction.

**Use a real code for the closing call to action**, where it is presented flat, still, at rest, with a
quiet zone — see `closing/CLOSING_MODULE_TO_QR_SKILL.md`.

Keep both at the **same grid size** (25×25 = version 2) so the opening motif and the closing payoff
are visibly the same object.

## 12. REVERSE-SCROLL REQUIREMENTS

- All positions derive from `st.assemble` alone; nothing accumulates.
- The matrix is generated once at construction from a fixed seed.
- Ambient wobble is damped by `free`, so at `assemble = 1` the frame is identical regardless of
  arrival direction.

## 13. FAST-SCROLL REQUIREMENTS

- Total stagger ≤ ~0.5 of the assembly channel, so the code is never half-built for long.
- Finish assembly with a hold before the next beat begins. A flung reader should land on a *finished*
  code, not on 70% of one.

## 14. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| The shape never reads as a code | Finders resolve at the same time as the data | Stagger by distance to the nearest finder |
| The field looks like a grid of confetti | Colour swapped gradually instead of at crossover | Hard swap at `e > 0.5` |
| The code twitches after assembling | Ambience not damped | Scale wobble by `1 - e` |
| Copy is unreadable over the field | No quiet region | Bias the scatter function away from the text box |
| The portal square drifts off the finder | Portal placed independently of the grid | Derive `PORTAL.A` from the grid constants |
| Reloading gives a different sky | Unseeded `Math.random()` | Seeded PRNG, fixed consumption order |

## 15. HOW TO CUSTOMIZE

Change freely: grid size and cell size, placement in the frame, fill density, palette, which finder
is emphasised, the shape of the scatter region.

Keep: finder-first assembly order, a distinct carried subset, derived portal geometry, seeded
determinism, one visual protagonist, the ring's job on the other side.

If your brand mark is not a code, the pattern still holds — any geometry with a recognisable
sub-feature works (a monogram with a countable centre, a grid logo, an icon with a distinct core).
What matters is that the sub-feature can plausibly be *entered*.

## 16. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| Stylised matrix generator | `lib/prototype/moduleField.ts → buildQrMatrix` |
| Roles, seeded scatter, per-module targets, stagger | `lib/prototype/moduleField.ts` (constructor) |
| Assembly render path | `lib/prototype/moduleField.ts → draw`, World A branch |
| Grid placement and derived portal square | `lib/prototype/sceneConfig.ts → QR_A`, `PORTAL.A` |
| Assembly timing | `lib/prototype/timeline.ts` (Chapter 1 block, `assemble`) |
| Real encoder, used only for the closing | `lib/prototype/chapter5/qr.ts` |
