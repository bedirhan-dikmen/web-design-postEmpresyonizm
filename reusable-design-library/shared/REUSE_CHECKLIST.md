# Reuse Checklist

End-to-end checklist for building a cinematic scroll site from this archive. Work top to bottom;
each phase depends on the ones above it.

---

## PHASE 0 — DECISIONS BEFORE ANY CODE

```text
[ ] Which patterns does this project need? (A opening · B bridge · C closing)
[ ] Is the middle of the site cinematic, or a conventional page?
[ ] Landscape only, or is portrait in scope? (portrait = a second edit, not a breakpoint)
[ ] What is the one visual protagonist? (see MODULE_FIELD_SKILL §5)
[ ] What is the motif, and does it have an enterable sub-feature?
[ ] What are the two worlds, and how do they oppose each other?
[ ] What is the one call to action at the end?
[ ] Total scroll budget per act (beats × 70–200vh)
```

## PHASE 1 — ARCHITECTURE

Read: `CINEMATIC_SCROLL_ARCHITECTURE.md`

```text
[ ] Design space chosen; cover mapping implemented (viewportFor)
[ ] Fixed stage + empty scroll track; anchors on the track
[ ] Flat numbers-only state object
[ ] One paused master timeline; 1 unit = 100vh
[ ] Single ticker; render is a pure function of state
[ ] Two clocks separated (scroll = story, wall clock = ambience)
[ ] Scroll binding with scrub 0.7 / exact under reduced motion
[ ] Freeze tool (?t=<label>) and a debug state overlay — BUILD THESE ON DAY ONE
[ ] Global background colour on html/body
[ ] Initial load cover, decode-gated with a timeout race
```

## PHASE 2 — CAMERA

Read: `CAMERA_GRAMMAR.md`

```text
[ ] Camera expressed as one square (px, py, logS) per world
[ ] Layer transform with per-plate depth; at least one layer at negative depth
[ ] Always interpolating log zoom
[ ] Named shots as data (geometry JSON), not code
[ ] Catmull-Rom travel helper, sampled as keyframes
[ ] Per-region orientation if the world has distinct places
[ ] Camera speed exposed for defocus, computed from magnitude
```

## PHASE 3 — MODULE FIELD

Read: `MODULE_FIELD_SKILL.md`

```text
[ ] Dab atlas authored (N square cells, grey on transparency)
[ ] Seeded PRNG; a separate seed per act
[ ] Roles assigned at construction, never changed
[ ] A distinguished subset with a unique colour
[ ] All per-formation targets computed once, in the constructor
[ ] Slot assignment deterministic, gold-first, computed once
[ ] Tinted sprite cache; memory measured
[ ] Near-fade for modules passing the lens
[ ] Ambience damped by formation progress
```

## PHASE 4 — OPENING (Pattern A)

Read: `opening/OPENING_OVERVIEW.md`, `OPENING_STORYBOARD.md`,
`OPENING_QR_FORMATION_SKILL.md`, `OPENING_PORTAL_SKILL.md`, `OPENING_TABLE_LANDING_SKILL.md`

```text
[ ] Motif geometry defined; the portal square DERIVED from it
[ ] Destination world's counterpart for the portal defined
[ ] Assembly staggered finder-first
[ ] Aperture path irregular; hole punched in the source world
[ ] Destination plate visible through the hole before cover
[ ] Align before the final push
[ ] Cover predicate verified at the switch time, at every supported ratio
[ ] World switch is an instant set, only under cover
[ ] Flare straddles the switch
[ ] Arrival pull-back roughly as long as the push
[ ] Focal object at negative depth, with a large cell-size ratio
[ ] Terminal hold budgeted as an explicit empty tween
[ ] No copy during the crossing
```

## PHASE 5 — BRIDGE (Pattern B), if the middle is a conventional page

Read: `bridge/CINEMATIC_TO_STANDARD_SITE.md`, `LOADING_TRANSITION_SKILL.md`

```text
[ ] Bridge is a document-flow block covering the fixed stage (preferred over an overlay)
[ ] Gradient reaches full cover by ~80%, not 100%
[ ] 1px overlap between gradient and solid blocks
[ ] Something in the dark (a mark or word); hold ≈15–25vh
[ ] Stage stays mounted; render skipped, canvas never cleared
[ ] Everything above the stage is pointer-events: none except the film's own CTA
[ ] Document overflow never modified
[ ] Content wrapper has a stacking context above the stage
[ ] No white flash: global background, 1px overlaps, load cover
```

## PHASE 6 — STANDARD SECTIONS

```text
[ ] Ordinary DOM. Not part of the film, not driven by the timeline
[ ] Palette moves toward the film's in the last sections before re-entry
[ ] The motif appears at small scale in page chrome
[ ] Anchors into the film sit on the track; anchors into the page are ordinary
[ ] Anchor navigation never restarts the film
```

## PHASE 7 — RE-ENTRY

Read: `bridge/STANDARD_SITE_TO_CINEMATIC.md`

```text
[ ] Assets prewarmed ~100vh upstream, triggered on timeline time
[ ] Renderer resumed while still fully covered
[ ] The first visible cinematic frame is a HOLD frame, not a mid-move frame
[ ] A settled hold between "film visible" and "camera moves"
[ ] Plates with no natural size are skipped, not drawn as broken boxes
```

## PHASE 8 — CLOSING (Pattern C)

Read: `closing/CLOSING_OVERVIEW.md`, `CLOSING_STORYBOARD.md`,
`CLOSING_MODULE_TO_QR_SKILL.md`, `CLOSING_FINAL_CTA_SKILL.md`

```text
[ ] Starts on the previous act's final frame; no re-entry animation
[ ] No portal in this act
[ ] Copy leaves → content resolves → camera moves, at every boundary
[ ] Camera energy decreases beat by beat; settles before the payoff
[ ] Night as a veil with a four-rect hole; closing plates render after it
[ ] Modules revert to the opening palette; the carried mark returns
[ ] Real encoder, ECC M, non-placeholder URL, built on the client
[ ] Finder cell order shared between the carried mark and the code
[ ] Dabs land at 0.92 module size, rotation 0, settling to ~38% over a crisp layer
[ ] Quiet zone ≥ 4 modules, empty
[ ] Pools are siblings of masked text containers
[ ] Exactly one primary action; same destination as the code
[ ] Ambience damped to ~20–30%; vignette deepens
[ ] Terminal hold ≈25% of the final beat
```

## PHASE 9 — TEXT

Read: `TEXT_TIMING_SKILL.md`

```text
[ ] 0/1/2 channel per block; hidden at both ends
[ ] Fixed scroll durations (~10vh in, ~7vh out)
[ ] Every block enters after the camera stops and leaves before it moves
[ ] Text laid out in design space, cover-fitted
[ ] Safe frame = intersection of widest and tallest ratios, with inset
[ ] Pools as siblings, overhanging, closest-side, opacity matched to the text channel
[ ] Three hierarchy levels maximum
[ ] Removing all copy still leaves the film comprehensible
```

## PHASE 10 — VERIFICATION

Read: `REVERSE_SCROLL_SAFETY.md`, `FAST_SCROLL_READABILITY.md`

### Scripted, against the real timeline

```text
[ ] Path independence: every channel, every checkpoint, Δ0.005 / 0.02 / 0.4 / 1.2,
    forward and reverse → 0 differences
[ ] Pop scan at Δ0.01 → every jump justified (a cut under cover, or an off-screen re-anchor)
[ ] Settled ratio → >50% for a long act
[ ] Fling landing rate at Δ1.2 → ≥50%
[ ] Copy stillness → 0 px camera movement per unit while any block is fully shown
[ ] Plate coverage at 1920×1080, 1280×800, 1440×900, 2560×1080, 1024×768 → 0 uncovered probes
```

### Browser

```text
[ ] Direct-jump vs scrub-back screenshots at every checkpoint → identical
[ ] Layer comparison (~175 points), forward vs reverse
[ ] Boundary oscillation at every act edge, portal and panel
[ ] Full real-scroll run: slow, normal, fast, reverse
[ ] prefers-reduced-motion pass
```

### The code, if there is one

```text
[ ] Encoder verified against a published test vector
[ ] 3 independent decoders × the full condition matrix → every condition read by ≥2,
    and NO decode ever returns a wrong value
[ ] Physical phones: iOS Camera, Android Camera/Lens, one in-app scanner, 30cm and 1m, lit and dim
[ ] Re-run after any change to the target URL
```

### Build

```text
[ ] Typecheck passes
[ ] Production build passes
[ ] Dev-only tooling compiled out of production (freeze, debug overlay, globals)
[ ] Launch checks / config validation pass
```

## PHASE 11 — BEFORE LAUNCH

```text
[ ] Canonical URL configured (the code must not encode a placeholder)
[ ] Contact details and form endpoint configured; missing values render nothing
[ ] Accessibility: scene aria-hidden, CTA focusable, real hrefs, lang attributes, focus rings
[ ] Metadata, favicon, social preview
[ ] Performance checklist in PERFORMANCE_GUIDE.md §14
[ ] Mobile/portrait decision documented and honoured
```
