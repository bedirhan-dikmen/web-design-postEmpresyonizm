# Closing — Customization Guide

What to replace when carrying Pattern C into a new project, and what must stay.

---

## REPLACE

### Brand and identity

| Item | Notes |
|---|---|
| Company name and sign | The tower sign is a DOM prop: a mark + letterspaced wordmark with a glow |
| The mark | Reuse the opening's motif sub-feature at small scale — it should be the same geometry |
| Palette | Keep the night/warm opposition; the closing returns to the opening's cool end |
| Copy | Four blocks, one per beat. Keep to one idea each |
| Team imagery | Sprite figures anchored bottom-centre on the desk; real photography drops in at the same anchors |

### The "company" world

The reference uses a cut-away studio: desks, three screens (code / the product / its architecture), a
systems wall, a server rack, lamps, three figures. Replace with whatever is true of your company —
a workshop, a kitchen, a lab, a shop floor.

What the scene must provide:

1. **Depth** — at least two planes, so the descent has parallax.
2. **Signs of work** — a few small ambient motions (a blinking caret, status lights, breathing
   figures) so the frame is alive on the wall clock.
3. **A human-scale shot** — the third beat needs faces or hands at a believable size.
4. **A place the camera can rise out of** into an empty sky for the finale.

### The code target

| Item | Where |
|---|---|
| Destination URL | `qrTarget()` — canonical origin from config, else the serving origin |
| Anchor | the contact section's id |
| Error correction | M by default; only drop to L if the URL will not fit at any version |
| Minimum version | 2 (25×25) if your opening motif is a 25×25 grid — keep them matched |
| Card colours | dark ink on cream in the reference; verify any change with real decoders |

**Never ship a placeholder domain.** Configure the canonical origin, or let it fall back to the
serving origin, and render no code at all if neither is available.

### CTA

| Item | Constraint |
|---|---|
| Button label | One action, in the imperative |
| Hint line | Short, explicit, pointing at the code |
| Destination | The button and the code must lead to the **same** place |
| Count | Exactly one primary action. No secondary link |

### Module colours in the night

```ts
// the closing sky palette — the modules revert to the opening's colours
g < 0.22 ? COLORS.gold : g < 0.40 ? COLORS.mist : COLORS.star
```

Roughly a fifth gold, a fifth mist, the rest white. Adjust the ratios, keep the gold minority: it is
the same subject the reader followed through the opening.

---

## KEEP UNCHANGED

### Structural

- The closing begins on the **previous act's final frame**, with no re-entry animation.
- **No portal.** The return is by transformation, travel and grade — never by a threshold.
- The act is part of the same master timeline; it never has its own.
- The final frame's copy stays on screen past the end of the timeline, while the page scrolls over it.

### The three-part exit

At every beat boundary, in this order:

```text
copy leaves  →  the frame's content resolves or dissolves  →  the camera moves
```

### Camera

- Energy decreases beat by beat: wide pull-back → diagonal descent → small push → settle.
- The final camera move ends at or before the midpoint of the final beat. The payoff happens on a
  still camera.
- Travels use Catmull-Rom through named real places, interpolating log zoom.

### Modules

- Persistent identity from the opening. These must literally be the same objects.
- The carried finder mark becomes the final code's top-left finder, **cell for cell, in the same
  order it was drawn**.
- Spare modules fade to quiet stars rather than piling up.
- Assembly staggered, arced, rotation → 0, colour swapped hard at 55%.

### The code

- Real encoder, ECC M preferred at every version before L.
- Card keeps one physical size; module size derives from the version.
- Quiet zone ≥ 4 modules, containing nothing.
- Painted dabs at 0.92 module size, settling to ~38% alpha over a crisp vector layer.
- Built lazily on the client, cached by target string.
- Verified by at least three independent decoders across the full condition matrix, plus real phones.

### The final composition

- Copy and code on opposite sides.
- Background pools are **siblings** of masked text containers, never children.
- One primary action, with a real href and a visible focus ring.
- Ambience damped to ~20–30%, never to zero.
- An explicit terminal hold of ~25% of the final beat.

### Night as a veil

- Multiply veil + crush layer over the previous world, with a **hole** at the place being left so its
  interior stays the warmest light.
- The hole is four sibling rectangles, not a `clip-path: path()`.
- The closing's own plates render **after** the veil, so they are never darkened twice.

---

## A MINIMAL PORTING CHECKLIST

```text
[ ] The act starts on the previous act's final frame; no mount, no re-entry animation
[ ] A carried mark exists from the previous act, with a defined cell order
[ ] Beat durations follow the shrink-then-grow shape (35 / 22 / 16 / 27)
[ ] Copy leaves → content resolves → camera moves, at every boundary
[ ] Camera energy decreases beat by beat
[ ] Night applied as a veil with a four-rect hole; closing plates render after it
[ ] Modules rise on arcs into a seeded ellipse, reverting to the opening palette
[ ] Real encoder wired to a real, non-placeholder URL; built on the client
[ ] Code version matches the opening motif's grid where possible
[ ] Finder cell order shared between the carried mark and the code
[ ] Spare modules fade rather than pile up
[ ] Dabs land at 0.92 module size, rotation 0, settling to ~38% over the crisp layer
[ ] Quiet zone ≥ 4 modules, empty
[ ] Camera settled before the assembly's second half
[ ] Pools are siblings of masked text
[ ] Exactly one primary action; same destination as the code
[ ] Ambience damped to ~20–30% by a calm channel; vignette deepens
[ ] Terminal hold budgeted as an explicit empty tween
[ ] Decoder matrix passed (3 decoders × full condition list, no wrong values)
[ ] Physical phone scan performed on the real final frame
[ ] Reverse-scroll and fast-scroll passes run
```
