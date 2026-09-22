# Reusable Cinematic Design Library

A portable record of the scroll-cinema patterns built for the Kerinti Soft site, written so that
another project — different brand, different art, different story — can rebuild them from scratch.

This folder is **documentation and reference only**. Nothing here is imported by the live site, and
nothing here should be. The production implementation lives in `app/`, `components/` and `lib/`;
this archive describes it, generalises it, and records the rules that made it work.

---

## What this archive contains

### Pattern A — Cinematic Opening
`opening/`

Night world → floating modules → QR formation → finder emphasis → portal → destination world →
modules descend → landing on a physical object (a table QR).

The opening is a single continuous camera move through one transforming subject. It ends when the
destination is established and the subject has come to rest on a real object in that destination.

### Pattern B — Cinematic ↔ Standard-site Bridge
`bridge/`

How to end a cinematic act, hand scroll control to an ordinary DOM page (services, products,
pricing, references), and later hand it back for the closing act — without white flashes, stuck
overlays or a broken back-scroll.

### Pattern C — Cinematic Closing
`closing/`

Brand/company content → human scene → simplification → modules return → QR formation → final CTA →
contact. The closing reuses the opening's motif with inverted meaning: the opening QR is a
*gateway in*, the closing QR is a *way out to you*.

### Shared skills
`shared/`

The architecture underneath all three: scroll model, module field, camera grammar, timeline and
scroll budgeting, text timing, reverse-scroll safety, fast-scroll readability, painterly art
direction, performance.

---

## File index

```text
opening/
  OPENING_OVERVIEW.md            the concept and why it works
  OPENING_STORYBOARD.md          shot by shot, in reusable proportions
  OPENING_CAMERA_AND_TIMING.md   the camera model and the pacing rules
  OPENING_QR_FORMATION_SKILL.md  scattered field → code geometry
  OPENING_PORTAL_SKILL.md        the seven-step threshold crossing
  OPENING_TABLE_LANDING_SKILL.md the arrival and settle
  OPENING_IMPLEMENTATION_MAP.md  exact files, functions, state, assets
  OPENING_CUSTOMIZATION_GUIDE.md what to replace, what to leave alone

bridge/
  CINEMATIC_TO_STANDARD_SITE.md  ending an act and releasing scroll
  STANDARD_SITE_TO_CINEMATIC.md  re-entering the film without a mount pop
  LOADING_TRANSITION_SKILL.md    the dark hold between the two

closing/
  CLOSING_OVERVIEW.md
  CLOSING_STORYBOARD.md
  CLOSING_CAMERA_AND_TIMING.md
  CLOSING_MODULE_TO_QR_SKILL.md  painted dabs → a real, scannable code
  CLOSING_FINAL_CTA_SKILL.md
  CLOSING_IMPLEMENTATION_MAP.md
  CLOSING_CUSTOMIZATION_GUIDE.md

shared/
  CINEMATIC_SCROLL_ARCHITECTURE.md
  MODULE_FIELD_SKILL.md
  CAMERA_GRAMMAR.md
  TIMELINE_AND_SCROLL_SKILL.md
  PAINTERLY_ART_DIRECTION.md
  TEXT_TIMING_SKILL.md
  REVERSE_SCROLL_SAFETY.md
  FAST_SCROLL_READABILITY.md
  PERFORMANCE_GUIDE.md
  REUSE_CHECKLIST.md

code-reference/
  README.md                      what was copied, and what deliberately was not
```

---

## The one-paragraph version

A fixed full-viewport **stage** renders a scene. A tall empty **scroll track** below it is the
playhead. One paused **master timeline** tweens a single flat **state object** of plain numbers.
Rendering is a pure function of that state, run once per animation frame. Nothing is animated
imperatively, nothing is triggered on enter/leave, and no DOM element remembers anything between
frames. Because of that, any scroll position — reached slowly, flung, or jumped to backwards —
produces exactly the same frame.

Everything else in this archive is a consequence of that one decision.

---

## HOW TO REUSE IN A NEW PROJECT

```text
1.  Copy `reusable-design-library/` into the new repository.
2.  Read shared/CINEMATIC_SCROLL_ARCHITECTURE.md first and build the stage + track + state skeleton.
    Nothing else works until the pure-state render loop exists.
3.  Give the coding agent opening/OPENING_OVERVIEW.md + opening/OPENING_STORYBOARD.md and define:
    brand palette, artwork plates, the subject motif, the destination world, and the copy.
4.  Implement the opening:
      shared/MODULE_FIELD_SKILL.md
      opening/OPENING_QR_FORMATION_SKILL.md
      opening/OPENING_PORTAL_SKILL.md
      opening/OPENING_TABLE_LANDING_SKILL.md
5.  If the middle of the site is a conventional page, apply
      bridge/CINEMATIC_TO_STANDARD_SITE.md + bridge/LOADING_TRANSITION_SKILL.md
6.  Build the normal sections as ordinary DOM. They are not part of the film and must not be.
7.  Re-enter the film with bridge/STANDARD_SITE_TO_CINEMATIC.md
8.  Implement the closing:
      closing/CLOSING_MODULE_TO_QR_SKILL.md
      closing/CLOSING_FINAL_CTA_SKILL.md
9.  Run the test passes in shared/REVERSE_SCROLL_SAFETY.md and shared/FAST_SCROLL_READABILITY.md
    before calling any act finished.
10. Walk shared/REUSE_CHECKLIST.md end to end.
```

### Recommended reading order if you only have time for four files

1. `shared/CINEMATIC_SCROLL_ARCHITECTURE.md`
2. `opening/OPENING_PORTAL_SKILL.md`
3. `shared/CAMERA_GRAMMAR.md`
4. `shared/REVERSE_SCROLL_SAFETY.md`

---

## Documentation conventions used here

- Timing is given as **proportions of an act**, with the Kerinti absolute values in brackets for
  reference only. One timeline unit = 100vh of scroll in the reference implementation.
- "Design space" means a fixed virtual canvas (1920×1080 in the reference) that is cover-fitted to
  the viewport, so every coordinate in the system is resolution independent.
- Historical detail — what broke, what was tried — appears only under **Common Failure Modes**.
