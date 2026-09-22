# Camera Grammar

The vocabulary of camera moves that carried a 5,400vh film, and the rules about when each one is
allowed.

---

## 1. PURPOSE

Give a scroll-driven scene a camera that reads as a camera — one continuous observer moving through
one continuous space — instead of a sequence of unrelated CSS animations.

## 2. THE CAMERA MODEL

The camera is **not** a 3D position. It is a rectangle on screen.

Each world declares one **portal square**: a real object in that world (the inner aperture of a code's
finder pattern; the glass of a window) with a design-space centre and a side length at rest.

```ts
PORTAL.A = { cx, cy, size }   // source world
PORTAL.B = { cx, cy, size }   // destination world
```

The camera state is where that square currently sits and how big it is:

```ts
st.px, st.py   // its centre in design-screen units
st.logS        // log of its side length  ← always tween the LOG, never the raw size
```

From that, the per-world camera is:

```ts
cameraFor(world, st) {
  const s = Math.exp(st.logS);
  const d = PORTAL[world].size / s;                       // distance to the portal plane, 1 at rest
  return {
    d,
    camX: PORTAL[world].cx - (st.px - VC.x) * d,
    camY: PORTAL[world].cy - (st.py - VC.y) * d,
  };
}
```

and a layer at relative depth δ transforms as:

```ts
layerTransform(cam, depth) {
  const den = cam.d + depth;
  if (den <= 0.004) return { ok: false };                 // behind the camera
  return {
    m:  (1 + depth) / den,                                // scale
    tx: VC.x + (-VC.x * depth - cam.camX) / den,
    ty: VC.y + (-VC.y * depth - cam.camY) / den,
    ok: true,
  };
}
```

**Why this model is worth adopting**

- Parallax is automatic and physically consistent: δ > 0 is behind the portal plane and moves less,
  δ < 0 is in front and moves more (and can pass the camera, where `ok` goes false).
- The portal transition is not a special case. Both worlds are described by the *same three numbers*,
  so flying into the source world's square and settling onto the destination world's square is one
  continuous move with a world flag flipped in the middle.
- Named shots are data, not code: `[x, y, zoom, yaw, pitch, roll]` in a geometry JSON file, converted
  by one helper.

```ts
lookB([cx, cy, z]) {          // "look at world point (cx, cy) at zoom z"
  return {
    px:  960 + (PORTAL.B.cx - cx) * z,
    py:  540 + (PORTAL.B.cy - cy) * z,
    logS: Math.log(PORTAL.B.size * z),
  };
}
```

## 3. ALWAYS INTERPOLATE LOG ZOOM

Tweening the raw portal size across a 3–4× push makes the aim point swing sideways, because position
and scale are coupled. Interpolating `log(size)` keeps the aimed-at point fixed under the lens and
makes a push-in feel like a constant-speed dolly rather than an accelerating lurch.

The same applies to camera paths: interpolate `[x, y, log z, yaw, pitch, roll]`.

## 4. THE MOVE VOCABULARY

| Move | What it does | Use it for | Ease |
|---|---|---|---|
| **Push-in** | zoom increases, aim fixed | committing to one object; the start of a threshold | `power2.in` or `t²` when the object must come *up to the lens* |
| **Pull-back** | zoom decreases, aim widens | revealing that the thing just seen is part of something larger; act endings | `sine.inOut` |
| **Side track** | pan across at roughly constant zoom | following a subject through a space | `sine.inOut` |
| **Diagonal travel** | pan + zoom change together, through waypoints | moving between rooms/regions | smoothstep over a Catmull-Rom path |
| **Object follow** | the camera path and the subject's path share waypoints | making a moving object the protagonist | linear on the object, easing on the camera |
| **Threshold crossing** | a portal object grows past the viewport edges | changing world or level | see `OPENING_PORTAL_SKILL.md` |
| **Foreground occlusion** | a negative-depth layer sweeps past the lens | hiding a cut; adding physical depth | free — comes from δ < 0 |
| **Settle** | all motion stops for a measurable scroll distance | *every* beat ending | terminal `sine.out` |
| **Perspective change** | yaw/pitch/roll of the whole scene plane | giving each region its own viewpoint | `sine.inOut`, small angles |

### Multi-waypoint travel

A travel between distant places must not be a straight lerp — it cuts corners through walls. Sample
a Catmull-Rom spline through named waypoints and bake it as keyframes so it stays a pure function of
scroll:

```ts
const travel = (beat, f, d, shotKeys, ease = smoothstep, N = 20) => {
  const shots = shotKeys.map(k => SHOT[k]);
  const frames = Array.from({ length: N }, (_, i) => ({
    ...shotVars(pathAt(shots, ease((i + 1) / N))),
    duration: len(beat, d) / N,
    ease: 'none',
  }));
  tl.to(st, { keyframes: frames }, pos(beat, f));
};
```

Waypoints should be *real places*: a counter edge, an arch jamb, the middle of a corridor. Naming
them after places rather than coordinates keeps the path readable and makes re-staging trivial.

### Perspective per region

Treating the painted scene as a rigid plane in 3D and turning the *camera* relative to it gives each
region its own viewpoint without new artwork. Small angles only:

```text
warm, human-height table      yaw ≈ +4…6°, slight downward pitch
three-quarter counter         yaw ≈ −14°, foreground props in shot
deeper side-on kitchen        yaw ≈ +10°, foreground rail
low tracking beside a walker  pitch ≈ +5° (looking slightly up)
three-quarter workstation     yaw ≈ −10°, then pull back
```

One projective matrix per plane, shared by **both** the DOM (as `matrix3d`) and the canvas (projected
point by point), so painted layers, DOM props and particles stay registered to each other.

## 5. RULES THAT MATTER MORE THAN THE MOVES

### Portals must stay rare

A threshold crossing is the most expensive move in the vocabulary: it changes world or level and it
costs the reader a moment of re-orientation. Spend it two or three times in a whole film, never more.

The reference film has **two** portals across 5,400vh: the opening window (source world → destination
world) and one late act change of level (one table → the business that runs it). Everything else —
six inter-room transitions that could each have been a portal — is ordinary camera travel through one
continuous space.

When an earlier revision used seven portals in one act, the effect inverted: the crossing stopped
meaning *"we are going somewhere significant"* and started meaning *"here is another transition
effect"*. Cutting six of them out shortened the act by 480vh and made the remaining one land.

### Vary the shot, not just the distance

Repetition creeps in through three channels. Watch all three:

| Repetitive pattern | What it feels like | Replace with |
|---|---|---|
| Constant horizontal sliding | a side-scrolling game | vary the axis: diagonal descents, push-ins, pull-backs |
| Same camera angle everywhere | a flat diorama | per-region yaw/pitch, foreground occluders |
| Portal for every transition | a slideshow with a wipe | camera travel through continuous space |

### One cut, maximum, and only under cover

A hard camera cut is legitimate exactly where the screen is fully covered by something else — the
interior of a portal at full cover. Everywhere else, the camera moves. The reference film contains
one cut in 5,400vh, and it is invisible because the portal window has covered the viewport since 7%
before it.

### Camera speed is a rendering input

Expose camera speed (screen px per second) to the renderer and use it to defocus the background
during travel. It reads as depth of field and hides rasterisation lag. Compute it from the magnitude
of frame-to-frame change, so it is **direction independent** — otherwise reverse scroll renders
sharp where forward scroll renders soft.

## 6. EASING / PACING PRINCIPLES

- Default `ease: 'none'` on the timeline; add easing per tween, deliberately.
- `sine.inOut` for camera moves between holds — it starts and ends at zero velocity, which is what
  makes a settle read as a settle.
- `t²` (accelerating) for an approach that must feel like commitment.
- `smoothstep` (`t*t*(3-2t)`) for multi-waypoint travel.
- Ambient/secondary motion gets long, soft eases; nothing snaps except a deliberate UI press.

## 7. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| The aim point drifts sideways during a big zoom | Raw size tweened instead of log size | Tween `logS` |
| A travel path passes through a wall | Straight lerp between distant shots | Catmull-Rom through named real places |
| A waypoint produces a visible kink | Linear interpolation between segments | Catmull-Rom (C¹ continuous at waypoints) |
| Everything feels like the same shot | Only pan and zoom are ever used | Add per-region orientation and foreground occluders |
| The transition stops feeling special | Portals used for ordinary movement | Reserve thresholds for changes of world or level |
| Background is sharp going back, soft going forward | Camera speed computed from signed delta | Use absolute magnitude |

## 8. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| Camera model, layer transform, viewport mapping | `lib/prototype/camera.ts` (`cameraFor`, `layerTransform`, `viewportFor`, `portalCovers`) |
| Named shots as data | `lib/prototype/chapter4/geometry.json → camera`, `chapter5/geometry.json → camera` |
| `lookB`, `shotVars`, `pathAt` (Catmull-Rom), `travel`, `approach` | `lib/prototype/chapter4/timeline.ts` |
| Per-region orientation matrices (DOM + canvas) | `lib/prototype/chapter4/stage3d.ts` |
| Portal definitions and crossing constants | `lib/prototype/chapter4/portals.ts` |
| Camera-speed defocus | `components/prototype/Chapter4Layers.tsx` (`cam0.speed`) |
