# Fast-Scroll Readability

Designing a long cinematic so it survives being flung through — and how to measure whether it does.

---

## 1. THE PROBLEM

A reader scrolling fast does not see a film. They see a **sample** of it: one frame every 40–120vh,
depending on how hard they flick. Whatever is between samples does not exist for them.

A sequence built as continuous motion therefore reads as a blur, no matter how good the motion is.
The question is not "is the animation smooth" but "what does a sparse sample of it look like".

## 2. THE MISTAKE TO AVOID

**Do not just make the scroll track longer.**

Scaling an act from 3,000vh to 4,500vh multiplies every duration equally — the transitions get longer
*and* the holds get longer, in the same proportion. The sample interval stays the same relative to
the content. The reader still sees the same fraction of mid-transition frames; they just scroll more
to get there.

The reference project shortened an act from 4,880vh to 4,400vh while **raising** its settled-scroll
ratio from 44% to 57%, by removing six threshold crossings and converting them to camera travel with
longer holds. Shorter, and more readable.

## 3. THE FIVE LEVERS THAT ACTUALLY WORK

### 3.1 A larger spatial world

Give the camera real distance to cover. A world 14,000 design units wide with distinct regions gives
every travel a reason to be long and gives every arrival somewhere recognisable to arrive.

A cramped world forces short moves, which forces events to be packed close together, which is what
makes fast scrolling illegible.

### 3.2 Intermediate states

Between "the order is at the table" and "the order is at the counter", put the order **visibly in
transit**, as an object the camera follows. A sample landing mid-travel then still says something
("it is on its way") rather than nothing.

Intermediate states are how a transition becomes readable at a glance rather than only as a
completed change.

### 3.3 Strong anchor frames

An anchor frame is a settle of ≥15vh where the camera is stopped and one idea is on screen. Count
them; they are what a flung reader lands on.

Reference figures for a 4,400vh act:

```text
23 anchor frames, totalling 2,494vh   (57% of the act)
holds ranging from 72vh to 361vh
```

For a 4,400vh act at a 120vh fling, that produced a **57% chance of landing on a settled frame**.

### 3.4 Distinct destinations

Every region must be recognisable in one frame: different lighting, different colour, different
camera angle, different foreground props. If two regions look alike, a sample cannot tell the reader
where they are, and the sequence loses its structure.

Per-region camera orientation (a different yaw or pitch for each place) is a cheap and very effective
way to do this — the same artwork reads as a different place.

### 3.5 Fewer semantic events per unit of scroll

One event per transition, separated by holds. See `TIMELINE_AND_SCROLL_SKILL.md` §4.

## 4. THE SOURCE / TRANSITION / DESTINATION SEPARATION

The structural expression of all five levers:

```text
SOURCE HOLD          a sample here says: "here is where we are"
TRANSITION           a sample here says: "we are moving / it is changing"   ← needs an intermediate state
DESTINATION HOLD     a sample here says: "here is where we arrived"
```

Three distinct answers, none of them "I do not know what I am looking at". That is the whole design
goal.

## 5. HOW TO MEASURE

Write these as scripts against the real timeline. Eyeballing does not work — the whole point is
behaviour at speeds you cannot reproduce reliably by hand.

### Measurement 1 — Settled ratio

```text
for t in 0 … END step 0.01:
    settled(t) = every channel changes by < ε over [t, t + 0.02]
report: % of samples settled, and the list of maximal settled runs ≥ 0.15 units
```

Targets: **> 50%** for a long act; **> 35%** for a short, dense one.

### Measurement 2 — Fling landing rate

```text
for offset in 100 random values in [0, FLING_STEP):
    for t = offset; t < END; t += 1.2:
        count += settled(t)
report: count / total
```

Target: **≥ 50%**. Below that, add holds or remove events.

### Measurement 3 — Anchor frame census

List every settled run ≥ 0.15 units with its length and the label of the beat it belongs to. Look
for gaps: a stretch of more than ~300vh with no anchor is where readers will report "I lost the
thread".

### Measurement 4 — Event density map

For each 1.0-unit window, count the semantic events (channels starting or finishing a meaningful
change). Plot it. Spikes are where the sequence is too busy.

### Measurement 5 — Copy stillness

For each copy block, measure camera movement in px per unit of scroll while the block is fully shown.
Target: **0 for every block.**

### Measurement 6 — Plate coverage

At many samples, across every supported viewport ratio, probe a grid of points (e.g. 25 per sample)
and check that painted artwork covers each one. Target: **0 uncovered probes.** A fast camera move
that briefly exposes the empty stage is the most visible fast-scroll defect there is, and it is
invisible at normal speed.

## 6. AUTHORING RULES THAT FOLLOW

| Rule | Reason |
|---|---|
| Every beat ends in a settle | It is the sample target |
| At most one thing still easing at a settle | Otherwise it is not a settle |
| Copy only on settles | See `TEXT_TIMING_SKILL.md` |
| Travels carry a followed object | Gives mid-travel samples meaning |
| Each region has its own camera personality | Makes a single frame locate the reader |
| Plates carry overscan beyond the widest and tallest shot | Prevents exposure during fast moves |
| Portals stay rare | A mid-crossing sample is the least informative frame in the film |

## 7. WHAT A FAST-SCROLL REVIEW LOOKS LIKE

1. Run measurements 1, 2 and 6 as scripts. Fix anything below target before looking at the film.
2. Fling through the act in a browser, repeatedly, from different starting points. Note every moment
   you cannot immediately name what you are looking at.
3. For each note, find the beat and ask: is the hold too short, or are there two events in one
   transition?
4. Fix by lengthening holds and separating events — **not** by lengthening the act uniformly.
5. Re-run the scripts.

## 8. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| "It is pretty but I could not follow it" | Low settled ratio | Longer holds, fewer events |
| The empty stage flashes during a fast move | Plates lack overscan | Extend each plate beyond the widest/tallest shot of its beats |
| Layers flash through each other on a fast pull-back | Compositor cannot rasterise huge scaled layers | Lay plates out at natural pixel size |
| Two regions are indistinguishable in a single frame | Same lighting and angle | Per-region orientation, colour, foreground |
| Lengthening the act did not help | Everything scaled equally | Lengthen holds only |
| Mid-travel frames say nothing | No followed object | Add an intermediate state to follow |
| Copy is missed entirely at speed | Correct and unavoidable | Ensure no copy is load-bearing; the image must carry the story |

## 9. THE LAST POINT IS THE MOST IMPORTANT

**A fast scroller will miss copy.** Always. Therefore the film's meaning must be carried by the
images, and the copy must be a confirmation of what was already seen — never the only place an idea
appears.

If removing all the copy makes the sequence incomprehensible, the sequence is not finished.

## 10. WHICH KERINTI FILES AND RECORDS RELATE

| Concern | Where |
|---|---|
| Beat structure enforcing source/transition/destination | `lib/prototype/chapter4/timeline.ts` (header comment states the rule) |
| Per-region camera personalities | `lib/prototype/chapter4/stage3d.ts`, `chapter4/geometry.json → camera` |
| Followed objects during travel | `lib/prototype/chapter4/timeline.ts` (`orderPulse`, `ticket`), `chapter4/flowPath.ts` |
| Plate overscan note | `lib/prototype/sceneConfig.ts` (comment on the act-4 plates) |
| Natural-pixel-size plate layout | `lib/prototype/sceneConfig.ts → fitPlate` |
| Recorded measurements | `CHAPTER4_NOTES.md → Length and fast scroll`, `→ Fast-scroll clarity`, `→ Verification` |
