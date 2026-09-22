# Opening Cinematic — Overview

Pattern A. A scroll-driven opening that carries the reader from an abstract brand world into the
concrete place where the product lives, without ever cutting.

---

## THE SEQUENCE

```text
night world (World A)
  → scattered floating modules / stars
    → modules assemble into a code
      → one finder square of that code is emphasised
        → warm light appears behind it, the aperture opens
          → the camera pushes into the aperture
            → the destination is already visible inside it
              → the aperture fills and passes the viewport
                → World B: a warm interior, the same square is now a window
                  → the carried modules drift down a light beam
                    → they land on a physical object on a table
                      → settle · copy · hold
```

The opening ends the moment that object is established. Whatever follows — more film, or an ordinary
page — is a separate decision (see `bridge/`).

## WHY IT WORKS

### One visual protagonist

The reader is introduced to exactly one kind of object — a square painted module — and never to a
second. Stars, the code, the window frame, the dust, the object on the table are all *the same
modules in different formations*. Nothing new is ever introduced; things the reader already knows
become something else.

A small **gold subset** (the 3×3 core of the emphasised finder) is visually distinct and is carried
through the threshold by the camera. It is the thread the eye holds onto across the entire crossing.

### Physical continuity

There is no moment where the source world is hidden and the destination world appears. Both worlds
are described by *the same three camera numbers* — the position and size of a square on screen. The
crossing is a continuous zoom in which the square being flown through belongs to World A on one side
and World B on the other. The world flag flips while that square covers the entire viewport, so both
worlds render an identical frame at the switch.

### Transformation instead of scene replacement

Every change is a transformation of something already on screen:

| Not this | This |
|---|---|
| fade out stars, fade in a code | the stars fly into the code's cells |
| cut to the interior | fly through the aperture into the interior |
| the window frame appears | the finder's ring *becomes* the window frame |
| a code appears on the table | the carried gold modules descend and land as it |

### A clear camera target

From the first frame, the camera is leaning toward one point. The reader always knows what is being
looked at, so the push-in that follows is a confirmation rather than a surprise.

### The destination is visible through the transition

Before the aperture reaches the viewport edges, the destination world is already rendering inside it.
The reader sees where they are going before they arrive. This is the single biggest difference
between "a portal" and "a wipe".

### Contrast between the two worlds

The crossing needs a payoff. World A is a cool nocturne — deep cobalt, cool whites, small pinpoints
of gold. World B is a warm interior — ochre, terracotta, a sunbeam. The same palette on both sides
makes the crossing feel like nothing happened.

Keep the *continuity* elements shared (the module texture, the gold accent) and the *atmosphere*
opposed (temperature, luminance, density).

### Restrained copy

The whole opening carries two short blocks in World A and one in World B. Copy appears only when the
camera has stopped, and leaves before it moves again (see `shared/TEXT_TIMING_SKILL.md`). During the
crossing itself there is no text at all — the image is doing the work.

### Strong settle frames

Each of the five beats ends with the camera stopped and one idea on screen. Under a fast fling, the
reader samples the film at intervals; the settles are what they land on. An opening built only of
motion reads as a blur at any speed above "slow".

## TIMING SHAPE

Proportions of the opening act (reference implementation: 440vh total):

| Beat | Share | Reference |
|---|---|---|
| 1 · Atmosphere + code assembly | 30% | t 0.00 → 1.30 |
| 2 · Finder activation (glow, aperture opens) | 11% | t 1.30 → 1.80 |
| 3 · Approach + crossing | 18% | t 1.80 → 2.58 |
| 4 · Arrival + settle into World B | 17% | t 2.58 → 3.32 |
| 5 · Descent, landing, hold | 24% | t 3.32 → 4.40 |

The crossing itself is the *shortest* part. Approach and arrival are longer than the threshold. That
ratio is what makes the crossing feel like an event rather than the whole point.

## WHAT THE READER SHOULD BE ABLE TO SAY AFTERWARDS

If the opening works, a reader who scrolled it once at normal speed can answer:

1. What was the thing made of squares?
2. Where did the camera go?
3. Where are we now?
4. What is on the table?

If any of those is unclear, the fix is almost always more hold, not more motion.

## SKILLS THAT MAKE IT UP

- `OPENING_QR_FORMATION_SKILL.md` — scatter → code geometry
- `OPENING_PORTAL_SKILL.md` — the threshold crossing (the critical one)
- `OPENING_TABLE_LANDING_SKILL.md` — the arrival and the closure of the act
- `shared/MODULE_FIELD_SKILL.md` — the protagonist
- `shared/CAMERA_GRAMMAR.md` — the camera model
- `OPENING_CAMERA_AND_TIMING.md` — pacing values
- `OPENING_IMPLEMENTATION_MAP.md` — exact files in this repository
- `OPENING_CUSTOMIZATION_GUIDE.md` — what to change for a new brand
