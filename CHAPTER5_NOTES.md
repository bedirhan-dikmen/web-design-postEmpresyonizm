# CHAPTER 5 — Return to Kerinti + Corporate Finale: Implementation Notes

> Phase 5 prototype. Branch `chapter4-prototype`. Chapter 4 is **soft-locked** at tag `chapter4-lock` (`d72fc91`);
> Chapter 5 only touched it where the hand-off required it (see *Chapter 4 changes*). Art is placeholder.

Chapter 4 answered *how NeXa works inside a restaurant*. Chapter 5 answers *who is behind it*, and closes the
film on the shape it opened with: the QR.

## Structure (565vh, t 48.60 → 54.25) — compact

| Beat | vh | Camera | What happens | Copy (only on a still frame) |
|---|---|---|---|---|
| **5.1** From NeXa to Kerinti (`k1`) | 200 | slow pull-back out of the office over the night city, then up into the Kerinti sky | the closing line leaves; the operations panel dissolves into its square dabs; evening turns to Kerinti night; the operational modules rise off the manager's monitor and become the sky's stars and gold lights | NEXA'NIN ARKASINDA · **Kerinti Soft.** · Restoranların günlük operasyonlarını… (held 58vh) |
| **5.2** Company (`k2`) | 125 | controlled diagonal descent past the glowing KERİNTİ sign, down the Kerinti tower into its cut-away studio | the studio: window on the night city, the team at the desk, product sketches on the whiteboard, a "SİSTEM" wall, a rack; gold modules running between the systems | KERİNTİ SOFT · **İşletmenin ihtiyacından ürüne.** (held 55vh) |
| **5.3** Team (`k3`) | 90 | a small push to human scale at the desk | three engineers: one coding, one standing and pointing at the product, one listening | EKİP · **Ürünü, operasyonu anlayarak geliştiriyoruz.** (held 44vh) |
| **5.4** Final CTA / QR (`k4`) | 150 | back up the tower into a calm sky; the camera settles completely | the modules assemble into a **real, scannable QR** on a cream card with a gold rim; the world calms | NEXA'YI KEŞFEDİN · **Restoranınızın operasyonunu tek yerden yönetin.** · [İletişime Geç ↓] · → Ya da QR kodu telefonunuzla okutun (held 54vh, then the page continues into İletişim) |

**Final phase:** one CTA only. The button and the QR both lead to the homepage's contact section (`#iletisim`). The
QR's target is `lib/site/config.ts → qrTarget()`: `${site.json url}/#iletisim`, or, while `url` is null, the origin
actually serving the page. It is built on the client (`getFinalQr()`). A target longer than 26 bytes produces a
larger code (29×29 for `https://<domain>/#iletisim`); the extra modules are built by the Kerinti sky's stars, so the
code is always fully painted. See LAUNCH_CHECKLIST.md.

Freeze labels: `?t=ch5-start | to-night | city-night | kerinti | to-studio | company | team | to-sky | assemble | cta | ch5-end`.

## No portal: transformation and travel

The Kerinti night is built in **World B's space**, above and to the right of the restaurant building
(`lib/prototype/chapter5/geometry.json`), so the camera simply travels there:

1. **Night falls** (`st.night`). A cobalt multiply veil (`<Chapter5Veil>`) is inserted in World B *after* the
   Chapter 4 world and *before* the Chapter 5 plates: it turns the restaurant's street and neighbours to night;
   the restaurant's own cut-away gets a lighter veil through a clip-path hole, so its interior stays the warmest
   light in the city. The Chapter 4 day grade and vignette fade with `1 − night`; a navy vignette comes up.
2. **Restaurant lights → city lights.** The neighbouring buildings' windows light up as square dabs in gold and
   cream — the Kerinti module language — and the Kerinti tower's city (`city.webp`) is lit the same way.
3. **Operational data → Kerinti modules.** The panel of Chapter 4's final frame breaks into its KPI / table /
   module dabs and floats away (`st.dissolve`); the 315 operational modules on the manager's monitor (which were
   Chapter 3's table QR and Chapter 4's order, ticket, KDS, bill, stock, cari and report) rise into the sky and
   drift there as Chapter 1's stars (`st.k5` 0 → 1).
4. **The Kerinti sky** (`sky.webp`) fades in with the night over every roof — the same palette, ribbons and swirl
   recipe as Chapter 1's `sky.webp`, its big swirl centred on the final QR as Chapter 1's was centred on the
   portal finder.

The only camera discontinuity in the whole of Chapters 4–5 is still the management portal's cut, under full cover.

## The final QR

- `lib/prototype/chapter5/qr.ts` is a **real QR Code encoder** (byte mode, versions 1–6, ECC L/M, penalty-based
  mask selection; structure after Project Nayuki's reference generator). Reed–Solomon is checked against the
  published "HELLO WORLD" 1-M vector.
- `finalQr.ts` encodes `CTA.qrUrl` at **error correction M** (15% recovery) and version 2 when it fits: **25×25, the
  same grid as Chapter 1's stylised QR.** M is preferred over a smaller grid at every version; L is a last resort.
- A **4-module quiet zone** (the ISO/IEC 18004 minimum) of cream card around the code; dark ink (#16264f) on cream.
- Its **top-left finder is built by the 33 dabs that formed the finder square at the end of Chapter 4** (same
  cell order), which have waited bottom-left through the chapter (dimmed inside the studio, `st.markDim`).
  All 315 other dark modules are built by the 315 operational modules — exactly one each, none left over.
- Under the painted dabs, the card carries the **crisp code** as an SVG (`data-qr-crisp`). Once the dabs land they
  **settle into it** (size 0.92 of a module, opacity down to ~38%): the paint texture stays visible, but brush edges
  no longer reach into the light modules.
### Decoding — what was verified, and what still needs real phones

Three independent decoders were run on a **real screenshot of the rendered final frame** (painted modules, crisp
layer, sky, copy and buttons all in view), under simulated phone-camera conditions:
**jsQR**, **ZXing (JS port)** and **zxing-cpp (WASM)** — the ZXing family is the engine inside most Android scanner
apps and many in-app scanners.

| Condition | jsQR | ZXing JS | zxing-cpp |
|---|---|---|---|
| card fills the view (≈460px) | ✓ | ✓ | ✓ |
| whole screen in view, including copy and buttons | ✓ | ✓ | ✓ |
| whole screen from far away (code ≈210px) | ✓ | ✓ | ✓ |
| far (code ≈150px) · very far (code ≈110px) | ✓ ✓ | ✓ ✓ | ✓ ✓ |
| defocus blur 2px · 3.5px | ✓ ✓ | ✓ ✓ | ✓ ✓ |
| phone tilted 15° · 35° | ✓ ✓ | ✓ ✓ | ✓ ✓ |
| keystone (angled view) | ✓ | — | ✓ |
| dim room (contrast ×0.5, −40) · overexposed (+70) | ✓ ✓ | ✓ ✓ | ✓ ✓ |
| sensor noise ±35 | — | ✓ | ✓ |
| screen glare | ✓ | — | ✓ |
| heavy JPEG (q25) | ✓ | — | ✓ |
| far + blur + tilt + noise + low contrast + JPEG, combined | ✓ | ✓ | ✓ |

**44 / 48 decodes**, every condition read by at least two decoders, zxing-cpp reads all 16, and **no decode ever
returned a wrong value**. The raw encoder matrix also decodes exactly; Reed–Solomon matches the published
"HELLO WORLD" 1-M vector.

**Not done: physical phones.** This session cannot hold a phone to the screen. Before launch, scan the final frame
(`?t=cta`, desktop) with at least: an iPhone Camera app (Apple Vision), an Android Camera / Google Lens, and one
in-app scanner (e.g. WhatsApp or a bank app), from ~30cm and ~1m, in a lit and a dim room. Expected result: each opens
`CTA.qrUrl`. Re-run after changing the URL.

## Before launch

| Item | Where | Now |
|---|---|---|
| QR target | `lib/site/site.json → url` | `null`: the QR encodes the serving origin + `/#iletisim`. Set the canonical domain before launch (see LAUNCH_CHECKLIST.md) |
| CTA | `lib/prototype/chapter5/content.ts → CTA` | one button, **İletişime Geç** → `#iletisim` (final) |
| Team figures | `public/prototype-assets/05-kerinti/sprites/engineer-*.webp` | gestural placeholders; real photography can replace them at the same anchors (bottom centre on the desk top, `geometry.json → studio.engineers`) |
| Claims | copy | only what the brief states: Kerinti Soft builds NeXa, analyses operational needs, builds usable and maintainable software. The "SİSTEM" wall labels (Web · Masaüstü · Sunucu · Veri) are the brief's own topics; no integrations, clients or certifications are claimed |

## Files

| File | Role |
|---|---|
| `lib/prototype/chapter5/timeline.ts` | `buildChapter5`, beats, labels (appended after Chapter 4 in `lib/prototype/timeline.ts`) |
| `lib/prototype/chapter5/geometry.json` | plates, tower, studio, drift cloud, QR card, camera shots |
| `lib/prototype/chapter5/content.ts` | copy + CTA configuration |
| `lib/prototype/chapter5/qr.ts`, `finalQr.ts` | the encoder and the final code's cells |
| `components/prototype/Chapter5Layers.tsx` | veil, studio/tower/QR world layers, night vignette, copy + CTA, updater |
| `lib/prototype/moduleField.ts` | Chapter 5 module journey (monitor → sky → QR), finder → QR finder, city windows, sky stars, panel dissolve |
| `scripts/art/chapter5-plates.mjs`, `chapter5-sprites.mjs` | `npm run art:chapter5` |
| `public/prototype-assets/05-kerinti/` | `sky.webp`, `city.webp`, `studio.webp`, `sprites/engineer-{a,b,c}.webp` |

New FilmState channels: `ch5 night k5 qr calm dissolve markDim t5Kerinti t5Company t5Team t5Cta` (all 0 before Chapter 5).

## Chapter 4 changes (hand-off only)

| Change | Why |
|---|---|
| `Chapter4Layers.tsx`: day grade, grade glow and vignette × `(1 − st.night)` | the warm restaurant grade must give way to the night; `night` is 0 throughout Chapter 4, so Chapter 4 renders identically |
| `Chapter4Layers.tsx`: the portal's inner world excludes Chapter 5 plates | the management portal must not render the Kerinti plates |
| `moduleField.ts`: the finder dabs and the operational modules gain a Chapter 5 branch | only active when `st.k5 > 0` (Chapter 5) |
| `PortalFilm.tsx`: veil + Chapter 5 plates/world after the Chapter 4 world; Chapter 5 labels | DOM order is what keeps the Kerinti plates out of the night veil |

Measured: **0 differences** in all 67 Chapter 1–4 channels against `chapter4-lock`, and no Chapter 5 channel moves
before t 48.6.

## Verification (Phase 5)

| Check | Result |
|---|---|
| Path independence, 78 channels × 53 checkpoints (Chapters 4 + 5), Δ0.005 / 0.02 / 0.4 / 1.2, forward and reverse | **0 differences** |
| Pop scan t 48.1 → 54.3 (616 samples × 78 channels) | 1 isolated jump: `ch5` switching on at t 48.61 (a gate, nothing visible changes). **0 camera jumps** — no cut |
| Chapter 4 → 5 in a real browser (wheel scroll) | approved Chapter 4 frame → closer leaves → panel dissolves → pull-back with modules streaming off the monitor while dusk turns to night → Kerinti sky. No hard visual cut |
| Copy vs camera motion | 0 px per unit of scroll for all four blocks (held 44–58vh) |
| Chapter 5 settled scroll / fling landing | 53% / 52% |
| Plate coverage, 5 viewports × 25 probes, t 48.1 → 54.3 | 0 uncovered probes |
| Reverse from the end of Chapter 5 into Chapter 4 (node + real browser) | Chapter 4's final frame restored exactly; veil, Kerinti world and CTA hidden |
| Fast jump to the end (real browser) | QR assembled, CTA shown, the CTA button is the element under the pointer (clickable) |
| QR decode | see *Decoding* above: 44/48 across three decoders and 16 camera conditions, 0 wrong reads |
| Chapters 1–4 vs `chapter4-lock` | 0 differences |
| Typecheck / production build | Pass |

## Copy background

The copy's soft pool of night is a **sibling** of each text block, not a child: `film-text`'s wipe mask clips its
children to the text box, which drew a visible rectangle into the calm final sky. The pool follows its text's fade.
*Chapter 4's copy pools have the same clipping (a faint rectangle behind each block); it is left for the final
polish phase, as Chapter 4 is soft-locked.*

## Mobile (not implemented)

Portrait crops the design frame to x ≈ 710–1210: the 5.1–5.3 copy (left) and the QR card (right) cannot share a
frame. Mobile needs its own `finalSky` composition (QR above, CTA below), a narrower studio shot, and a QR cell
large enough to scan on a small screen (≥ 3.5 CSS px per module).
