# Text Timing Skill

When copy may appear in a scroll-driven film, and how to lay it out so it is never cropped, never
unreadable, and never competing with the image.

---

## 1. PURPOSE

Make copy legible inside a moving cinematic without slowing the film down or asking the reader to
read and watch at the same time.

## 2. THE RULE

```text
CAMERA ARRIVES
  → SCENE READABLE          (the frame has settled; the thing the copy refers to is on screen)
    → TEXT ENTERS           (~10vh)
      → READING HOLD        (the camera does not move at all)
        → TEXT EXITS        (~7vh)
          → NEXT MOVE       (only now)
```

Copy never overlaps a camera move. The measurable target is **0 px of camera movement per unit of
scroll while a block is fully shown**. Audit it; do not assume it.

## 3. WHY COPY DURING CAMERA TRAVEL FAILS

Three separate failures, all at once:

1. **Optical.** Text moving relative to a moving background is hard to fixate. The eye tracks one or
   the other and loses both.
2. **Attentional.** A camera move is itself information ("we are going somewhere"). Reading during it
   means discarding one of the two messages.
3. **Compositional.** A text box positioned for the arrival frame is almost always wrong for the
   departure frame. Copy shown across a travel is mis-composed for most of its life.

The cure is not smaller text or more contrast. It is putting the copy after the move.

## 4. THE 0 / 1 / 2 CHANNEL

One number per block:

```text
0     before — hidden
0→1   entering
1     shown
1→2   leaving
2     after — hidden
```

```ts
function textStyle(el, v) {
  if (v <= 0.001 || v >= 1.999) { el.style.visibility = 'hidden'; return; }
  el.style.visibility = 'visible';
  if (v <= 1) {
    el.style.opacity = String(Math.min(1, v * 1.6));
    el.style.transform = `translate3d(0, ${(1 - v) * 16}px, 0)`;
    el.style.setProperty('--wipe', `${(1 - v) * 100}%`);
  } else {
    const e = v - 1;
    el.style.opacity = String(1 - e);
    el.style.transform = `translate3d(0, ${-e * 22}px, 0)`;
    el.style.setProperty('--wipe', '0%');
  }
}
```

Why one channel rather than two booleans: it is tweenable in both directions, it hides the element
completely at both ends (removing it from the tab order), and it makes "has this block been seen yet"
unrepresentable — which is correct, because a scrubbed film has no such concept.

Entry rises to full opacity faster than linear (`v * 1.6`) so the block is readable before it has
finished settling. Exit rises further and faster than the entry fell (22px vs 16px) — copy should
arrive gently and leave decisively.

## 5. FIXED SCROLL DURATIONS

```ts
tl.to(st, { [key]: 1, duration: 0.10, ease: 'power1.out' }, inTime);    // ≈10vh
tl.to(st, { [key]: 2, duration: 0.07, ease: 'power1.in'  }, outTime);   // ≈7vh
```

Not fractions of a beat. Copy should read at the same rate in a 90vh beat and a 220vh one.

## 6. READING HOLD LENGTH

```text
hold ≥ in (10vh) + out (7vh) + reading time
```

Reading time in scroll distance depends on how fast readers scroll, which you cannot control. The
practical approach:

- Give an eyebrow + heading + one line at least **60vh** of fully-shown hold.
- Give a heading alone at least **40vh**.
- If a block needs more than three lines, it is not film copy — move it to the standard-site portion.

## 7. HIERARCHY

Three levels, no more:

```text
EYEBROW          11–14px, letterspaced 0.14em, uppercase, semibold, low contrast
Heading          40–64px display face, line-height ≈1.06, text-wrap: balance
Supporting line  18–21px, line-height ≈1.5, lower contrast than the heading
```

The eyebrow does the naming ("WHAT THIS SECTION IS"), the heading does the claim, the line does the
qualification. If a block has no eyebrow, the reader has to infer the context from the image — which
is fine for the opening headline and rarely fine anywhere else.

Carry the brand mark in the eyebrow of the first and last blocks only.

## 8. SAFE ZONES

Lay text out in the **same design space as the artwork**, cover-fitted with the same mapping:

```tsx
<div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
  <div data-text-frame className="absolute left-0 top-0 origin-top-left"
       style={{ width: DESIGN.w, height: DESIGN.h }}>
    <div className="film-text absolute" style={{ left: box.x, top: box.y, width: box.w }}>…</div>
  </div>
</div>
```

```ts
textFrame.style.transform = `translate(${vp.ox}px, ${vp.oy}px) scale(${vp.b})`;
```

Then a text box stays locked to its painted safe zone at every aspect ratio, and its size relative to
the artwork never changes.

Define the safe frame as the intersection of your widest and tallest supported ratios:

```ts
// 1920×1080 design space, supporting 4:3 through 21:9
const TEXT_FRAME = { x0: 240, y0: 135, x1: 1680, y1: 945 };
```

Every box sits inside that frame with ≥60 units of inset, **and** inside its own shot's painted safe
area (the region of artwork that is quiet enough to carry text).

Recompute the transform only when it changes, not every frame — it is a string comparison against the
previous value.

## 9. CONTRAST OVER ARTWORK

Copy over painted artwork needs a pool. Two tones:

```ts
tone === 'ink'   // dark text over light artwork → a light pool  rgba(250,242,226,0.62)
tone === 'light' // light text over dark artwork → a dark pool   rgba(22,14,10,0.42)
```

Three requirements:

1. **The pool is a sibling of the text container, never a child.** A CSS mask on the text clips its
   descendants to the text box and turns a soft pool into a hard rectangle. See
   `closing/CLOSING_FINAL_CTA_SKILL.md` §7.
2. **The pool overhangs the box** (≈110 × 80 design units) and uses a `closest-side` radial mask, so
   it fades to nothing before its own bounds.
3. **The pool's opacity follows the text's channel with the same curve**, so they move together.

A small `backdrop-filter: blur(6px)` on the pool lifts contrast further without darkening much. It
also must not be inside the masked container.

## 10. RESPONSIVE CONSIDERATIONS

- Design-space layout handles every landscape ratio without per-breakpoint work.
- **Portrait is a different edit, not a breakpoint.** A 1920×1080 design frame crops to roughly
  `x 710…1210` in portrait, which typically hides the composition's subject entirely. Portrait needs
  its own camera composition, portal placement, text boxes and crop strategy. Budget it as work, or
  state explicitly that the film is landscape-only and provide a static alternative.
- Under `prefers-reduced-motion`, remove transitions on text and bind the scrub exactly.

## 11. ACCESSIBILITY

- Mark decorative scene layers `aria-hidden`; leave copy blocks in the accessibility tree.
- Because `visibility: hidden` at both ends of the channel removes blocks from the tab order, only
  the currently-shown block's links are focusable.
- Set `lang` on blocks in a different language from the document.
- Every interactive element in the film needs a visible focus ring.

## 12. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| Copy is hard to read despite good contrast | It is shown during a camera move | Move it into the hold |
| A hard rectangle appears behind the copy | Pool nested inside a masked container | Sibling pool |
| Copy is cropped on wide or tall screens | Laid out in viewport units | Design-space layout + safe frame |
| Copy sits over a busy part of the painting | Box position not checked against the artwork | Per-shot painted safe areas |
| Blocks feel like they flash by | In/out as fractions of a short beat | Fixed scroll durations |
| A hidden block is still tab-focusable | Opacity 0 without `visibility: hidden` | Hide at both ends of the channel |
| Copy explains what the image already shows | Writing to fill the block | Cut it; the hold can carry the image alone |

## 13. WRITING NOTES

- One idea per block. If two, it is two blocks with a hold between them.
- Let the scene carry the detail (numbers, statuses, item names belong in the in-world UI, not in the
  copy).
- Claims must be supportable; the film's authority makes over-claiming more damaging, not less.
- Keep the final block to: eyebrow, heading, one line, one action, one hint.

## 14. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| The 0/1/2 channel renderer | `components/prototype/PortalFilm.tsx → textStyle` |
| Design-space text frame | `components/prototype/PortalFilm.tsx` (`[data-text-frame]`) |
| Safe frame and box positions | `lib/prototype/sceneConfig.ts` (`TEXT_FRAME`, `TEXT_BOXES`) |
| The wipe mask, display/eyebrow styles, reduced-motion | `app/globals.css` (`.film-text`, `.display`, `.eyebrow`) |
| Copy content and per-block boxes | `lib/prototype/chapter4/content.ts`, `lib/prototype/chapter5/content.ts` |
| Sibling pools with the matched opacity curve | `components/prototype/Chapter4Layers.tsx → Pool`, `Chapter5Layers.tsx` (`[data-pool5]`, `poolOpacity`) |
| Text in/out timing helper | `lib/prototype/chapter4/timeline.ts → text()`, `chapter5/timeline.ts → text()` |
| Dev toggle to inspect frames without copy | `?hideText=1` / `?hideText=2` |
