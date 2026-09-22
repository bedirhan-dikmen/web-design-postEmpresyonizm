# Cinematic → Standard Site

How to end a cinematic act and hand scroll control back to an ordinary DOM page, so the change reads
as a deliberate act break rather than as the animation breaking.

---

## 1. PURPOSE

Let a project use the cinematic opening as an overture, then continue as a conventional website
(services, products, about, portfolio, pricing, references), and later re-enter the film for the
closing.

## 2. THE SHAPE

```text
cinematic settle
  → atmosphere lowers (ambience and grade recede)
    → optional short label or mark
      → controlled fade toward near-black
        → a perceptual hold in the dark
          → normal page content emerges from the same black
            → the fixed stage stops being the visible layer
```

The reader should experience: *the film ended, and the site begins*. Not: *something failed to load*.

## 3. THE CORE PRINCIPLE

**Express the bridge in scroll, not in time.**

A timeout-based fade is wrong here for three reasons: it is not reversible, it fires differently at
different scroll speeds, and it competes with the reader's own input. Every stage below is a function
of scroll position, exactly like the rest of the film.

The reference site ends the film on a settled frame and lets the next section rise over it through a
28vh gradient region — the scroll-driven version of a fade to black. The dark hold is the same
technique with a longer, flatter middle.

## 4. STRUCTURE

Two layers, both driven by the same scroll position:

```text
<stage>            position: fixed — the film, still rendering its final frame
<content>          normal document flow, starts below the film's track
  <bridge>         a tall block whose background is a gradient from transparent to the page colour
  <section>        …ordinary sections from here down
```

The trick is that the bridge block is **part of the normal document**, not part of the stage. As it
scrolls up over the fixed stage, it covers the film. No overlay needs to be managed, no z-index
race exists, and scrolling back up uncovers the film automatically.

```tsx
<section id="next" className="relative z-20">
  {/* the film settles into the page */}
  <div aria-hidden className="h-[28vh]"
       style={{ background: 'linear-gradient(to bottom, rgba(5,11,30,0) 0%, rgba(5,11,30,0.82) 52%, #050b1e 80%)' }} />
  {/* -mt-px: overlap by a pixel so no sub-pixel seam lets the film show through */}
  <div className="-mt-px bg-[#050b1e] …">
    …normal content…
  </div>
</section>
```

Note the `-mt-px`. Sub-pixel rounding between a gradient block and a solid block will show a
one-pixel line of the film. Overlap the blocks by a pixel.

## 5. STAGE PROPORTIONS

Express as fractions of the bridge's own scroll length (reference: 28vh for a plain settle; 60–90vh
when you want a true dark hold):

| Stage | Share | What happens |
|---|---|---|
| Cinematic settle | — | the last beat of the act already ended on a hold |
| Atmosphere lowers | 0–25% | ambient amplitude, grade and vignette ease down |
| Optional label | 15–45% | a small mark or word at low opacity, centred |
| Fade to near-black | 25–70% | the bridge gradient covers the stage |
| **Perceptual hold** | 70–85% | fully dark; nothing on screen |
| Page emerges | 85–100% | first section fades/rises out of the same colour |

The perceptual hold is what makes it feel intentional. As a rough equivalence, 200–500ms of held
black at a typical reading scroll speed is about **15–25vh**. Shorter reads as a glitch; longer reads
as a stall.

## 6. WHAT MAKES IT FEEL INTENTIONAL RATHER THAN BROKEN

| Do | Don't |
|---|---|
| Fade to the **page's own background colour** | Fade to pure `#000` when the page is not black |
| Let ambience and grade wind down *before* the fade | Cut the ambience at the fade |
| Put something in the dark — a small mark, a word, a rule | Leave a featureless void for more than ~25vh |
| Keep the fade monotone and slow | Use a wipe, a slide, or a pattern transition |
| Start the next section's content already in motion as it emerges | Have it appear abruptly at full opacity |
| Keep the scrollbar continuous | Lock scroll, or snap |

The single most common reason a dark bridge feels like a bug: **nothing is in it**. A 14px letter-
spaced brand word at 40% opacity for 15vh converts a loading-glitch into a title card.

## 7. RELEASING THE STAGE

The stage is `position: fixed` and stays mounted. Two decisions:

**Keep it mounted (recommended).** It costs one static frame of rendering. Scrolling back up
instantly shows the film again, with zero re-mount cost and no state to rebuild. Stop its per-frame
work instead:

```ts
const filmVisible = scrollY < trackEnd + BRIDGE_PX;
if (!filmVisible) return;          // skip the render, keep the element
```

Guard this with the **same** scroll threshold used to cover it, and make sure the skip leaves the
last frame intact rather than clearing the canvas.

**Unmount it.** Only if memory pressure demands it, and only behind a hysteresis band (unmount at
+40vh past the cover, re-mount at +20vh) so a reader oscillating at the boundary does not thrash.
Re-mounting must rebuild state from the scroll position alone — which it will, if the architecture
in `shared/CINEMATIC_SCROLL_ARCHITECTURE.md` was followed.

## 8. POINTER AND SCROLL CONTROL

- The stage must be `pointer-events: none` except for elements that are deliberately interactive
  (the film's own CTA). In the reference, only the final call-to-action link has
  `pointer-events: auto`.
- The normal page needs a stacking context above the stage: give the content wrapper
  `position: relative; z-index: 20` and the stage a lower z-index.
- Never take over `overflow` on `html`/`body`. The film uses native document scroll throughout, so
  there is nothing to release.
- Anchors that point into the film must sit **on the track**, so navigating to them moves the
  playhead. Anchors that point into the normal page are ordinary DOM anchors.

## 9. REVERSE SCROLL

Scrolling back up must uncover the film and resume it mid-frame. This is free if:

- the bridge is a document block covering a fixed stage (no overlay state to reverse),
- the film's renderer is skipped, not torn down, while covered,
- the render-skip threshold is the same going up and down (no hysteresis on the *render* guard; only
  on an optional unmount).

## 10. FAST SCROLL

At a fling, a reader can cross the whole bridge in two frames. That is acceptable — a bridge is
connective tissue, not content. What must not happen is a **white flash** (see
`LOADING_TRANSITION_SKILL.md`) or a frame where both the film and the next section are half-visible
through each other.

Make the gradient reach full opacity by 80% of the bridge, not 100%, so there is always a fully
covered band.

## 11. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| A one-pixel line of film between blocks | Sub-pixel rounding | Overlap blocks by 1px (`-mt-px`) |
| White flash at the handover | The page background is white underneath | Set `html, body { background: <page colour> }` globally |
| The film is still interactive under the content | Stage not `pointer-events: none` | Set it, and opt in per element |
| Scrolling back shows a blank stage | Renderer cleared the canvas when it stopped | Skip the render; do not clear |
| The dark moment reads as a loading bug | Nothing in the dark, and it is too long | Add a mark; shorten to 15–25vh |
| Content appears abruptly | Section has no emergence | Let the first block fade/rise over the last 15% |
| Jank at the boundary | Mount/unmount thrash | Hysteresis band, or do not unmount |

## 12. MINIMAL PSEUDOCODE

```tsx
// page
<>
  <Film />                              {/* fixed stage + tall track */}
  <section className="relative z-20">
    <div aria-hidden style={{ height: '70vh', background:
      'linear-gradient(to bottom, rgba(5,11,30,0) 0%, rgba(5,11,30,.85) 40%, #050b1e 70%, #050b1e 100%)' }}>
      <div className="sticky top-1/2 text-center opacity-40">BRAND</div>
    </div>
    <div className="-mt-px bg-[#050b1e]">…normal sections…</div>
  </section>
</>
```

```ts
// film renderer
const covered = window.scrollY > trackBottom + bridgeStartPx;
ticker.add((clock) => { if (!covered) render(clock); });   // no clear, no teardown
```

## 13. WHICH KERINTI FILES IMPLEMENT THE LIVE VERSION

The production site uses the **short settle** form of this bridge (no dark hold), because its film
runs to the end of the page and the contact section follows directly.

| Concern | File |
|---|---|
| The gradient bridge block, `-mt-px` overlap, `z-20` | `components/site/ContactSection.tsx` (top of the section) |
| Page composition: film, then normal sections | `app/page.tsx` |
| Global background colour (no white flash) | `app/globals.css` (`html, body { background: #050b1e }`) |
| Anchors on the track | `components/prototype/PortalFilm.tsx` (`#ust`, `#nexa` spans on `[data-track]`) |
| Anchor navigation that never restarts the film | `components/site/scrollTo.ts` |

The dark-hold variant described in §5–§6 is a documented extension, not something the live site
currently renders.
