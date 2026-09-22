# Standard Site → Cinematic

Re-entering the film after conventional page content, without an abrupt mount.

---

## 1. PURPOSE

Hand scroll control back from an ordinary DOM page to the cinematic stage for the closing act, so the
film appears to have been there all along.

## 2. THE SHAPE

```text
last conventional section
  → a section that is already darker and quieter than the rest
    → the stage is prewarmed (mounted, rendering, but still covered)
      → the cover thins
        → the first cinematic frame is already settled and visible underneath
          → the closing act's scroll track begins; the camera starts to move
```

## 3. THE RULE THAT MATTERS

**Never mount the cinematic world at the moment it becomes visible.**

A stage that mounts, loads images, builds a module field and renders its first frame *while the
reader is looking at it* will show: a blank frame, then a pop, then motion. The reveal must uncover
something that is already correct.

So: **prewarm, then uncover.** They are two separate things, separated by scroll distance.

## 4. STRUCTURE

```text
<stage>                fixed, z-0 — mounted from page load, or prewarmed on approach
<content z-20>
  …normal sections…
  <closingApproach>    a section with the film's own background colour; progressively emptier
  <reveal>             a block whose background fades from the page colour to transparent
  <closingTrack>       tall, empty — the closing act's playhead
</content>
```

The reveal block is the mirror of the bridge block in `CINEMATIC_TO_STANDARD_SITE.md`: the same
gradient, reversed.

```tsx
<div aria-hidden style={{ height: '60vh', background:
  'linear-gradient(to bottom, #050b1e 0%, rgba(5,11,30,.85) 35%, rgba(5,11,30,0) 100%)' }} />
```

## 5. PREWARMING

Three things to warm, in this order, all **before** the reveal begins:

### 5.1 Assets

Lazy-load the closing act's artwork when the reader reaches a trigger point well upstream — the
reference film loads act-4 art during late act 3, roughly 100vh of scroll before it is needed.

```ts
let loading = false;
const loadClosingArt = () => {
  if (loading) return;
  loading = true;
  root.querySelectorAll('img[data-lazy-src]').forEach((img) => {
    img.src = img.dataset.lazySrc;
    img.decode().catch(() => undefined);
  });
};
if (timelineTime > PREWARM_T) loadClosingArt();
```

Trigger on **timeline time**, not on an IntersectionObserver: it works identically forward and
backward, and it is already the thing driving everything else.

### 5.2 Rendering

Keep the stage rendering — or resume it — while it is still fully covered. One full frame must have
been drawn before any part of the cover thins. If you stopped the renderer during the standard-site
section (see `CINEMATIC_TO_STANDARD_SITE.md` §7), resume it at the same upstream trigger.

### 5.3 State

The closing act's channels must already hold their correct values at the reveal. Because the whole
film is one scrubbed timeline, this is automatic: the playhead is at the right time, so the state is
right. This is one of the main reasons not to split the film into per-act timelines.

## 6. TIMELINE STAGES

As fractions of the re-entry region:

| Stage | Share | What happens |
|---|---|---|
| Approach section | 0–40% | ordinary content, darker palette, fewer elements, more space |
| Prewarm trigger | ~35% | assets load, renderer resumes — all invisible |
| Reveal | 40–75% | the cover gradient thins; the settled first cinematic frame appears |
| Settled hold | 75–85% | the film is fully visible and **not moving** |
| Act begins | 85–100% | the camera starts its first move |

The settled hold between "the film is visible" and "the film moves" is essential. Without it, the
reveal and the first camera move happen together and read as a single jarring event.

## 7. PREPARING THE READER VISUALLY

The transition into the film should be foreshadowed by the ordinary sections, not sprung on the
reader:

- The last two or three conventional sections move toward the film's palette and away from the page's
  working colours.
- Content density drops: fewer columns, shorter blocks, more negative space.
- The film's motif appears in the page chrome at small scale (a mark in an eyebrow, a rule, a bullet)
  so the reader already recognises it when it returns full size.

The reference site does this with a small square-and-core mark used as a bullet in section eyebrows
and in the footer — the same geometry as the finder core that was the opening's portal.

## 8. THE FIRST CINEMATIC FRAME

It must be a **hold frame**, not a mid-move frame:

- camera at rest,
- ambience running (so it is alive, not frozen),
- no copy yet, or copy already fully in,
- compositionally complete on its own.

The best choice is often the final frame of the previous act, if the film is continuous. In the
reference film the closing act begins on exactly the frame the previous act ended on — the reader
re-enters at the same camera, then the camera starts to move.

## 9. REVERSE SCROLL

Scrolling back up from the closing into the standard site must re-cover the stage in the same way.
With the document-block approach this is free. Two things to check:

- The prewarm trigger is a threshold test on timeline time, so it fires identically going back — and
  once loaded, assets stay loaded.
- The renderer's resume/stop threshold has no hysteresis (hysteresis on rendering causes a blank
  frame at the boundary; hysteresis is only for optional unmounting).

## 10. FAST SCROLL

A reader flinging from the middle of the page into the closing can cross the entire re-entry region
in one or two frames. Then:

- assets may not have decoded. The film must render acceptably with missing plates — hide a plate
  that has no natural size rather than drawing a broken box.
- the settled hold may be skipped. That is acceptable; what must not happen is the stage's *first
  ever* frame being a moving one.

If the whole film is built as one scrubbed timeline and the stage stays mounted, both problems
mostly disappear: there is no "first frame", only a continuing one.

## 11. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| The film pops in blank, then fills | Mounted at reveal time | Prewarm upstream; uncover later |
| First cinematic frame is mid-move | Reveal and first camera move coincide | Insert a settled hold between them |
| Missing artwork on a fast entry | Lazy load triggered too late | Trigger ~100vh upstream, on timeline time |
| A broken image box flashes | Plate drawn before `naturalWidth` is known | Skip plates with no natural size |
| Re-entry feels unrelated to the page | No visual foreshadowing | Carry the motif and palette into the preceding sections |
| The stage flashes when scrolling back up | Renderer stopped with a cleared canvas | Skip the render, never clear |
| Closing state is wrong on entry | Separate timeline per act | One master timeline; the playhead carries the state |

## 12. MINIMAL PSEUDOCODE

```tsx
<>
  <Film />                                   {/* mounted for the whole page */}
  <div className="relative z-20">
    <Services /> <Products /> <Pricing />
    <Quieter />                              {/* darker, sparser, motif in the eyebrow */}
    <div aria-hidden style={{ height: '60vh', background:
      'linear-gradient(to bottom,#050b1e 0%,rgba(5,11,30,.85) 35%,rgba(5,11,30,0) 100%)' }} />
  </div>
  {/* the closing act's track continues below; the stage is already correct underneath */}
</>
```

```ts
if (timelineTime > PREWARM_T) { loadClosingArt(); resumeRendering(); }
```

## 13. WHICH KERINTI FILES IMPLEMENT THE RELEVANT PARTS

The live site's film is continuous (no standard-site section in the middle), so the full re-entry is
not rendered in production. These are the pieces that implement its mechanics:

| Concern | File |
|---|---|
| Upstream lazy loading triggered on timeline time | `components/prototype/PortalFilm.tsx` (`loadChapter4`, `if (now > 3) loadChapter4()`) |
| Lazy plate markup (`data-lazy-src`) | `components/prototype/PortalFilm.tsx` → `Plate`, `lib/prototype/sceneConfig.ts` (`chapter: 4 | 5`) |
| Plates skipped until their act starts | `components/prototype/PortalFilm.tsx` (`if (def.chapter === 4 && st.ch4 < 0.5) show = false`) |
| Skipping a plate with no natural size | `lib/prototype/sceneConfig.ts → fitPlate` (returns `[1,1]` and draws nothing useful until loaded) |
| Act starting on the previous act's final frame | `lib/prototype/chapter5/timeline.ts` (`CH5_START = CH4.end`; first move begins after copy leaves) |
| Gradient cover block (reversed form) | `components/site/ContactSection.tsx` |
| Motif reused at small scale in page chrome | `components/prototype/Chapter5Layers.tsx → Mark`, `components/site/ContactSection.tsx` eyebrow |
