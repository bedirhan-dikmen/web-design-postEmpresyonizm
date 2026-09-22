# Closing Storyboard

Shot by shot. Timing as a proportion of the closing act; reference values in brackets.

Reference act length: **565vh** = 5.65 timeline units (t 48.60 → 54.25).

```text
Beat 1 — Return to the brand world   35%
Beat 2 — Company                     22%
Beat 3 — Team                        16%
Beat 4 — Final CTA / code            27%
```

---

## BEAT 1 — RETURN TO THE BRAND WORLD · 35% [t 48.60 → 50.60]

### 1a — The source leaves (0–10% of the beat)

**Visual state.** The previous act's final frame: a workplace, an operations panel, the closing
statement of that act on screen.

**Camera.** Still. The camera does not move until the frame has emptied.

**Modules.** The rendered panel **dissolves into the square dabs it is made of** — its KPI tiles,
status tiles and chips become individual dabs that rise and drift away, warming to gold and white as
they go.

**Text.** The previous act's closing line exits first.

**Order matters.** Copy leaves → panel dissolves → *then* the camera moves. Three separate events,
never overlapping. This is the general rule for leaving any settled frame.

### 1b — The pull-back (6–66%)

**Camera.** A continuous three-waypoint travel: workplace → a wide pull over the city → the brand
sky. Catmull-Rom path, smoothstep easing, sampled as ~24 keyframes.

**Background.** `night: 0 → 1` over roughly the middle half of the beat. Night is applied as a
**veil**, not a replacement:

- a cobalt `multiply` layer over the city and street,
- a light crush layer above it,
- a **hole** at the building being left, filled by a lighter veil, so its interior stays the warmest
  light in the frame.

The hole is built from **four sibling rectangles**, not a `clip-path: path()` — some browsers drop a
multiply layer's blend where it is clipped by a path, which shows as the evening exterior flashing
through during the pull-back.

City windows light up as square dabs as the night comes on. Sky stars fade in.

**Modules.** `k5: 0 → 1` — the operational modules leave the workplace and rise into the sky on
arcs, scattering into a seeded ellipse. Their colours change to the sky palette (gold / mist / white)
past the halfway point of each module's own flight.

**Text.** First copy block enters at ~68% of the beat, after the camera has arrived.

**Destination state.** The brand's night world, seen wide, with the modules drifting in it as the
opening's star field.

---

## BEAT 2 — COMPANY · 22% [t 50.60 → 51.85]

**Visual state.** A cut-away studio inside the brand's own building: desks, screens, a systems wall,
a server rack, lamps, three figures.

**Camera.** A controlled **diagonal descent** through three waypoints: brand sky → the tower face →
the studio wide shot. Diagonal, not horizontal — the axis change is what keeps the act from feeling
like the previous one.

**Modules.** Still drifting in the sky above; the carried finder mark **dims** (`markDim: 0 → 1`)
while the camera is with the team, so it does not compete with the human content.

**Text.** Beat 1's copy exits at the start of this beat; beat 2's copy enters at ~50%, on the settled
studio frame.

**Ambience.** Studio life on the wall clock: a blinking caret on a code screen, LED status lights,
figures breathing (a tiny non-uniform scale + rotation about their base), gold modules running along
a path between systems.

---

## BEAT 3 — TEAM · 16% [t 51.85 → 52.75]

**Visual state.** The same studio, closer. Human scale.

**Camera.** One small push to a named shot. No travel, no waypoints — a single `look`. This is the
quietest camera in the act.

**Modules.** Unchanged.

**Text.** Beat 3's copy enters at ~44% and exits at the start of beat 4.

**Purpose.** This beat exists to put people on screen before the film asks for a response. It is the
only beat in the act with no module activity at all.

---

## BEAT 4 — FINAL CTA / CODE · 27% [t 52.75 → 54.25]

### 4a — The rise (5–47%)

**Camera.** A four-waypoint travel back up: team desk → studio wide → tower rise → the final sky. The
camera **settles by 47%** of the beat and does not move again for the rest of the film.

**Modules.** The finder mark un-dims (`markDim → 0`) at the start.

### 4b — The assembly (24–60%)

**Modules.** `k5: 1 → 2`.

- Each operational module flies from its drift position to **its own assigned dark cell** of a real
  code, on an arc, staggered per module.
- Sky stars join: a real code larger than 25×25 needs more dark modules than there are operational
  ones, and the extras come from the star field.
- The finder mark that has waited in the corner since the previous act flies in and becomes the
  code's **top-left finder**, cell for cell, in the same ring-then-core order in which it was drawn.
- Landed modules swap to ink past 55% of their own flight.
- Spare modules (more modules than the code needs) fade to quiet stars rather than piling up.

### 4c — The card (38–64%)

**Visual state.** A cream card with a gold rim rises behind the dabs, carrying the **crisp SVG code**
underneath. As it comes up, the painted dabs settle onto it: their size drops to 0.92 of a module and
their opacity falls to ~38%, so the brush texture stays visible but the brush edges stop reaching
into the light modules.

That last detail is what makes the code scannable. See `CLOSING_MODULE_TO_QR_SKILL.md`.

### 4d — Calm (42–74%)

**Ambience.** `calm: 0 → 1` — ambient amplitude across the whole scene is reduced by ~70–80%:
drifting slows, twinkling damps, the runners quieten, the vignette deepens slightly. The frame stops
breathing hard and starts resting.

### 4e — The call to action (58%→)

**Text.** The final block enters and **stays** — through the end of the timeline and beyond, while
the page's contact section scrolls up over the still frame.

It carries: an eyebrow with the brand mark, a heading, one supporting line, **one** primary button,
and a short line pointing at the code.

### 4f — The hold (74–100%)

An explicit empty tween. A completely stable final frame. This is the frame the reader will look at
longest, and the one a phone camera will be pointed at.

---

## BEAT BOUNDARIES AS A TABLE

| Beat | Camera | Module channel | World | Copy |
|---|---|---|---|---|
| 1 | pull-back, 3 waypoints | `dissolve`, `k5 0→1` | `night 0→1` | previous out, block 1 in |
| 2 | diagonal descent, 3 waypoints | `markDim 0→1` | — | block 1 out, block 2 in |
| 3 | one small push | — | — | block 2 out, block 3 in |
| 4 | rise, 4 waypoints, then still | `markDim→0`, `k5 1→2`, `qr 0→1` | `calm 0→1` | block 3 out, CTA in and stays |

## THE THREE-PART EXIT FROM A SETTLED FRAME

Used at every beat boundary in this act, and worth stating on its own:

```text
1. copy leaves            (fast, ~7% of a beat, power1.in)
2. the frame's content resolves or dissolves
3. the camera moves       (only now)
```

Reversing that order — moving the camera while copy is still on screen — is the most common way a
closing act becomes unreadable.
