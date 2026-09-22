# Prototype assets (Chapters 1–3)

**Status (Phase 2.7 pilot):** `02-portal/window-view.webp` and `03-nexa-morning/room-wall.webp` are **final-artwork pilots**, produced by `npm run art` (source: `scripts/art/`; 2× masters are regenerated into `art-src/masters/`, review sheets live in `art-src/review/`). Their original placeholders are kept in `_placeholder/` and in the git tag `prototype-fallback`.
All other files are still **generated placeholders** (`npm run paint`, source: `scripts/paint-prototype-assets.mjs`; it never overwrites the pilot files).
Final artwork can replace any file **without touching the animation**, as long as the contract below is kept.
Placement and depth live in `lib/prototype/sceneConfig.ts` (`PLATES`), if a new painting needs a different size.

Coordinates are in the 1920×1080 **design space** of each world (the frame you see when that world's camera is at rest).

| File | World | Size (px) | Design origin (x, y) | Depth | Alpha | Must contain |
|---|---|---|---|---|---|---|
| `01-kerinti-night/sky.webp` | A | 2880×1800 | −480, −360 | 1.6 | no | Night sky. Keep the area around the QR (design x 1025–1575, y 225–775) calm enough for light modules to read |
| `01-kerinti-night/horizon.webp` | A | 2880×800 | −480, 700 | 0.8 | yes | Low hills / distant lights, transparent above |
| `02-portal/window-view.webp` | view (B space) | 2400×1800 | −580, −500 | 2.2 | no | The morning world seen *through* the portal and the window. Seen at many scales, so paint it edge to edge |
| `03-nexa-morning/room-wall.webp` | B | 2600×1500 | −340, −210 | 0 | yes | Back wall, floor, kitchen pass. **Glass hole must be transparent at design x 440–800, y 220–580.** Leave plain wall under the 72-px frame ring around it (the blue dabs are drawn in code) |
| `03-nexa-morning/room-mid.webp` | B | 2600×1500 | −340, −210 | −0.12 | yes | Mid tables, chairs, pendant lamps |
| `03-nexa-morning/light-beam.webp` | B | 2600×1500 | −340, −210 | −0.06 | yes | Soft sunbeam from the glass to the hero table (screen blend, 42% opacity) |
| `03-nexa-morning/table-near.webp` | B | 2600×1500 | −340, −210 | −0.28 | yes | Hero table. **Blank table-tent face at design x 1180–1310, y 650–780** (the QR lands there in code) |
| `00-shared/dabs.png` | — | 2048×256 (final: 4096×512) | — | — | yes | 8 square brush dabs in one row, light grey with texture (tinted at runtime). Cell size is read from the image height; see `DAB_ATLAS` in `lib/prototype/sceneConfig.ts` |
| `00-shared/grain.png` | — | 512×512 | — | — | no | Tileable canvas grain (soft-light overlay) |

Depth: `0` = the portal plane. Positive values sit further back and move less; negative values sit closer and move more, and can pass the camera during the dive and pull-back.
