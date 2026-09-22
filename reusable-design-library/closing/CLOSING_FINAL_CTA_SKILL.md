# Final CTA Skill

The last frame of the film: composition, hierarchy, and the one background-layering fix that makes
soft pools behind text work.

---

## 1. PURPOSE

Compose a final cinematic frame that asks for exactly one action, stays legible over painted
artwork, and hands off cleanly to an ordinary contact section.

## 2. VISUAL RESULT

A calm night sky. On one side, a cream card carrying the final code, softly haloed. On the other, a
block of copy: a small mark and eyebrow, a heading, one supporting line, one gold button, and a
short line pointing at the code. Behind the copy, a soft pool of darker sky with no visible edges.
Nothing moves except slow ambience.

## 3. REQUIRED INGREDIENTS

- A settled camera (arrived and stopped well before the copy appears).
- A calm channel that damps ambience across the whole scene.
- One primary action.
- A soft background pool behind the copy — as a **sibling layer**, see §9.

## 4. COMPOSITION

```text
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   ■ EYEBROW                                              │
│   Heading, two lines maximum                    ┌──────┐ │
│   One supporting line.                          │ CODE │ │
│                                                 └──────┘ │
│   ┌──────────────────┐                                   │
│   │  Primary action ↓│                                   │
│   └──────────────────┘                                   │
│   → Or scan the code with your phone                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Rules:

- **Copy and code on opposite sides.** They lead to the same place; separating them lets each be read
  without the other interfering.
- **The code gets the quieter half of the sky.** Nothing textured behind it.
- **The eyebrow carries the brand mark** at small scale — the same geometry that was the portal.
  It is the last time the motif appears, at its smallest.
- **One button.** Not two, not a secondary link. After a whole film with nothing clickable, a single
  action is unmissable; two actions split the moment.
- The line pointing at the code is short and explicit ("Or scan the code with your phone"). Do not
  assume the code explains itself.

## 5. VISUAL HIERARCHY

```text
1. the code card         highest local contrast (cream on night), isolated
2. the heading           largest type
3. the button            the only saturated, filled shape in the frame
4. the supporting line   low contrast
5. the eyebrow + mark    smallest, but carries the motif
6. the hint line         smallest, lowest contrast
```

The button and the card compete for attention by design — they are the same offer. Everything else
is quieter than both.

## 6. CAMERA AND CALM

- The camera settles *before* the assembly finishes and never moves again.
- A `calm` channel reduces ambient amplitude across the whole scene by ~70–80%: drift slows,
  twinkles damp, background runners quieten.
- The vignette deepens slightly with `calm`, which pulls the eye to the centre.

Ambience must not stop entirely. A completely frozen frame reads as a crash; a slowly breathing one
reads as rest.

## 7. THE BACKGROUND POOL — AND THE LAYERING FIX

Copy over painted artwork needs a soft dark pool behind it for contrast. The naive implementation
puts the pool inside the text container. **This is the bug worth knowing about.**

### The problem

The text container carries an animated mask (a brush-like wipe used for the text's entrance):

```css
.film-text {
  --wipe: 0%;
  mask-image: linear-gradient(100deg, #000 0%, #000 44%, transparent 56%, transparent 100%);
  mask-size: 240% 100%;
  mask-position: var(--wipe) 0;
}
```

A CSS mask clips **every descendant** to the masked region. A radial-gradient pool placed inside that
container is therefore clipped to the text box's rectangle — and a soft radial gradient cut off at a
hard rectangle produces a **visible rectangular edge** in the middle of the sky. It is most obvious
where the pool is still partly opaque at the box boundary.

### The reusable fix

**Decorative light/background pools must be siblings of the masked text container, not children.**

```tsx
{/* the pool: a SIBLING, positioned to overhang the text box on all sides */}
<div aria-hidden data-pool={key}
     className="pointer-events-none absolute"
     style={{
       left:  box.x - 130,  top: box.y - 90,
       width: box.w + 260,  height: 460,
       opacity: 0,
       background: 'radial-gradient(closest-side at 50% 50%, rgba(4,10,28,.5), rgba(4,10,28,.28) 55%, rgba(4,10,28,0) 100%)',
     }} />

{/* the text: masked, with no decorative children */}
<div data-text={key} className="film-text absolute"
     style={{ left: box.x, top: box.y, width: box.w }}>
  …
</div>
```

Three supporting details:

1. **Overhang the box.** The pool is larger than the text box on every side (≈130 × 90 units in the
   reference), so its own falloff, not a boundary, is what ends it.
2. **`closest-side` radial, reaching full transparency at 100%.** The gradient must be fully
   transparent before its own bounding box, so the box is never visible.
3. **Drive the pool's opacity from the text's own channel**, with the same curve, so they fade
   together:

```ts
const poolOpacity = (v) => v <= 0.001 || v >= 1.999 ? 0
                         : v <= 1 ? Math.min(1, v * 1.6)
                         : 1 - (v - 1);
```

For pools over *light* artwork, the same structure works with an inverted tone and an additional
`mask-image: radial-gradient(closest-side …)` on the pool itself, plus a small `backdrop-filter:
blur()` — which likewise must not be inside a masked container.

## 8. CONTRAST AND SAFE ZONES

- Lay the copy out in the same design-space frame as the artwork, cover-fitted, so each block stays
  inside its painted safe zone at every aspect ratio.
- Keep every block inside the intersection of your widest and tallest supported ratios (reference:
  `x 240…1680, y 135…945`), with ≥60 units of inset from that frame.
- Verify contrast against the *artwork*, not against a flat colour. The pool exists to guarantee it.
- The button gets a visible focus ring (`outline: 3px solid <light>; outline-offset: 3px`) — it is
  the only interactive element in the film and must be reachable by keyboard.

## 9. ACCESSIBILITY

- The film's scene is `aria-hidden`; the final CTA block is not.
- The code's SVG carries `role="img"` and a label naming where it leads.
- The button is a real `<a href="#contact">` with a real href, so it works without JavaScript; the
  click handler only upgrades it to smooth scrolling and focus management.
- `prefers-reduced-motion` removes transition on the button and binds the film's scrub exactly.

## 10. HANDING OFF TO THE CONTACT SECTION

- The CTA copy **stays on screen to the end of the timeline and beyond** — the contact section
  scrolls up over the still frame.
- The transition is the same document-block gradient as `bridge/CINEMATIC_TO_STANDARD_SITE.md`.
- The contact section repeats the mark in its own eyebrow, so the motif continues into the page
  chrome at its smallest scale.
- The button and the code lead to the **same** anchor. Do not give them different destinations.
- Anchor navigation must not restart the film: the film is a pure function of scroll, so
  `scrollIntoView` on the target is enough, plus `history.replaceState` and moving focus.

## 11. REVERSE-SCROLL REQUIREMENTS

- Copy and pool opacity both derive from the same channel, written every frame.
- The button remains interactive only while the CTA channel is in range; outside it the whole text
  layer is `visibility: hidden`, which also removes it from the tab order.

## 12. FAST-SCROLL REQUIREMENTS

- The CTA enters on an already-settled frame and stays. A flung reader who arrives at the end sees
  the complete composition regardless of speed.
- Budget the terminal hold generously — this is the frame the film exists to deliver.

## 13. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| A visible rectangle of darkness behind the copy | Pool nested inside the masked text container | Make the pool a sibling |
| The pool's own edge is visible | Gradient not transparent before its bounding box | `closest-side`, ending at fully transparent, with overhang |
| Pool and text fade out of sync | Different easing curves | Drive both from one channel with one curve |
| Two calls to action, neither is taken | Competing primary actions | One button |
| Readers do not notice the code | No hint line, or the code is behind texture | Add the hint; isolate the code |
| The frame reads as frozen | All ambience damped to zero | Damp to ~20–30%, not 0 |
| Keyboard users cannot reach the button | Whole film `pointer-events: none` and never focusable | Opt the CTA in; keep a real href |
| The final frame is cropped on wide screens | Copy laid out in viewport units | Lay out in design space, cover-fitted |

## 14. MINIMAL PSEUDOCODE

```tsx
// pools first, as siblings
{blocks.map(b => <Pool key={b.key} box={b.box} />)}
// then the masked text blocks
{blocks.map(b => (
  <div key={b.key} data-text={b.key} className="film-text absolute" style={boxStyle(b)}>
    <p className="eyebrow"><Mark size={14} /> {b.eyebrow}</p>
    <h2 className="display">{b.heading}</h2>
    <p>{b.line}</p>
    {b.key === 'cta' && (
      <a href={CONTACT_HREF} onClick={scrollToContact}
         className="cta-primary pointer-events-auto">{CTA.label} ↓</a>
    )}
  </div>
))}
```

```ts
for (const t of texts) {
  const v = active ? st[t.key] : 0;
  textStyle(t.el, v);                    // opacity + translate + --wipe
  setOpacity(t.pool, poolOpacity(v));    // same curve, sibling element
}
```

## 15. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| CTA composition, pools as siblings, the mark, the button | `components/prototype/Chapter5Layers.tsx` (`Chapter5Text`, `Pool` pattern, `Mark`) |
| The same sibling-pool fix for the previous act | `components/prototype/Chapter4Layers.tsx → Pool` |
| Copy, box positions, CTA label and hint | `lib/prototype/chapter5/content.ts` (`BEAT5_TEXTS`, `CTA`) |
| Pool opacity curve matched to the text channel | `components/prototype/Chapter5Layers.tsx → poolOpacity` |
| The wipe mask that caused the clipping | `app/globals.css → .film-text` |
| Button style and focus ring | `app/globals.css → .cta-primary` |
| Anchor navigation that never restarts the film | `components/site/scrollTo.ts` |
| Contact section and the gradient hand-off | `components/site/ContactSection.tsx` |
| CTA channel timing and the terminal hold | `lib/prototype/chapter5/timeline.ts` (beat `k4`) |
