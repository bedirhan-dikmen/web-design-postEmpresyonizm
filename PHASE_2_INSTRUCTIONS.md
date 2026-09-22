# PHASE 2 — VISUAL PROTOTYPE

Read:

- KERINTI_SCROLL_REDESIGN_BRIEF.md
- STORYBOARD.md
- ART_DIRECTION.md
- TECHNICAL_PLAN.md
- COPY_DRAFT.md

The planning phase is approved conceptually.

However, DO NOT implement the full technical architecture yet.

Our priority now is NOT engineering completeness.

Our priority is answering one question:

> Does the transition from Kerinti → QR → Portal → NeXa feel visually
> exceptional and continuous?

## PROTOTYPE SCOPE

Implement ONLY:

- Chapter 1 — Kerinti Intro
- Chapter 2 — Portal
- Chapter 3 — NeXa Intro

STOP after Chapter 3.

Do not implement Chapters 4, 5 or 6.

---

# MOST IMPORTANT REQUIREMENT

This must NOT feel like three website sections.

It must feel like ONE continuous camera shot.

There must be no obvious:

- section fade out
- section fade in
- slide transition
- hard background replacement
- PowerPoint-like movement

The final frame of one state must naturally become the first frame
of the next state.

Scrolling backward must reverse the entire sequence smoothly.

---

# STORY TO IMPLEMENT

Night.

Kerinti exists inside a living painted nocturnal world.

Square painterly modules float in the atmosphere.

As the user scrolls, they assemble into the QR motif.

The camera begins moving toward the QR's top-left finder square.

That finder square becomes a window into another world.

We move THROUGH it.

The night environment must not simply fade away.

The portal expands beyond the viewport and the user physically
passes through the QR.

On the other side is a warm painted restaurant morning.

When the camera settles, the same portal square is now visibly
a window inside the restaurant.

The QR motif continues into the scene and eventually becomes the
QR object on a restaurant table.

Then NeXa is introduced.

This is where the prototype ends.

---

# VISUAL QUALITY

Follow ART_DIRECTION.md.

The visual language should be:

- original post-impressionist inspired painting
- visible rhythmic brushwork
- painterly depth
- atmospheric
- premium
- calm
- cinematic

Do NOT recreate any recognizable Van Gogh painting.

Do NOT copy Pear.no artwork or composition.

We are inspired by Pear's CONTINUITY and SCROLL CHOREOGRAPHY,
not its visual assets.

---

# IMPORTANT SIMPLIFICATION

Do NOT build the final WebGL architecture yet.

For this prototype prefer:

- GSAP
- ScrollTrigger
- Canvas 2D or SVG for QR modules
- layered painted image plates
- translate3d / scale for camera movement
- SVG/CSS mask for the portal
- simple parallax

Do NOT implement unless absolutely required:

- custom WebGL renderer
- complex shaders
- Chapter 4 module formations
- complete device-tier architecture
- final QR generator
- final performance framework

We will add these only after the visual prototype succeeds.

---

# ASSET STRATEGY

Create an `/prototype-assets` structure.

We need three master visual states:

01 — Kerinti nocturnal world
02 — Portal transition state
03 — NeXa restaurant morning

Use placeholder painterly assets if final art is unavailable.

The architecture must allow these images to be replaced later
without rewriting the animation.

---

# SCROLL MODEL

Use one ScrollTrigger-controlled master timeline.

The scroll position IS the movie playhead.

Suggested initial budget:

Kerinti Intro: 180vh
Portal: 120vh
NeXa Intro: 140vh

Total prototype: approximately 440vh.

No scroll snapping.

Use scrub.

Reverse scrolling must work perfectly.

---

# SUCCESS CRITERIA

The prototype is successful only if:

1. The QR feels like one physical object throughout the sequence.
2. There is no visible section boundary.
3. The portal feels like entering another world.
4. World B exists before entering it.
5. Reverse scroll looks intentional.
6. The restaurant does not appear through a simple crossfade.
7. Text never dominates the visual story.
8. The experience is smooth on a normal desktop computer.
9. The animation remains understandable without excessive effects.
10. The result feels closer to an interactive film than a landing-page slider.

---

# IMPLEMENTATION RULE

Do not spend time polishing navigation, footer, forms, product features,
responsive edge cases or SEO yet.

First make the core 440vh experience excellent.

After implementation:

1. Run the project.
2. Test forward scrolling.
3. Test reverse scrolling.
4. Check every transition boundary.
5. Fix visible pops.
6. Report what still needs final artwork.

Do not continue into Chapter 4 without explicit approval.