# Gorilla Hockey Homepage Image Manifest

This manifest is aligned with the current homepage code and the current `public/homepage-school/` directory.

Use it as the production checklist for the next sprint with real images.

Status values:
- `already exists`
- `placeholder exists`
- `needs design`
- `needs real photo`

Notes:
- `Current code path` is the path used right now by the project.
- `Recommended production filename` is the preferred final asset name if you want to replace placeholders cleanly in a later sprint.
- For photo assets, prepare responsive exports at `1600w`, `1200w`, and `800w` from the recommended master where noted.
- For logos, prefer SVG masters even if the current code still uses PNG.

## Logo / Branding

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/homepage-school/gorilla-logo.png` | `gorilla-logo-dark.svg` | Public header, footer, admin/staff hero | Main Gorilla Hockey logo on dark backgrounds | 600 x 180 master | 10:3 | SVG preferred, PNG fallback | Logo | already exists | Current PNG is used in homepage + staff/admin; next sprint should prepare a clean vector dark-background version. |
| not used yet | `gorilla-logo-light.svg` | Light documents / future light shells | Main Gorilla Hockey logo on light backgrounds | 600 x 180 master | 10:3 | SVG | Logo | needs design | Not required by current dark homepage, but useful for docs, print, and any future light surfaces. |
| not used yet | `gorilla-mark.svg` | Favicon / app mark | Simplified gorilla mark icon | 512 x 512 master | 1:1 | SVG | Logo mark | needs design | Use for favicon, app icon, social avatar, and small badges. |
| not used yet | `favicon-32.png`, `favicon-192.png`, `favicon-512.png` | Browser / PWA | Raster favicon exports from the mark | 32 x 32, 192 x 192, 512 x 512 | 1:1 | PNG | Logo mark | needs design | Export after the mark is approved. |

## Hero

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/homepage-school/hero-ice-arena.svg` | `hero-main-dark.webp` | Hero main visual | Primary image-led arena / school key art | 2400 x 1600 master | 3:2 | WEBP | Illustration or real photo | placeholder exists | Main homepage visual; must work with dark overlays and left/right crop. Export responsive versions. |
| `/homepage-school/training-kids.svg` | `hero-support-start.webp` | Hero support card | Support visual for the “first ice / calm start” card | 1600 x 1200 master | 4:3 | WEBP | Real photo or stylized illustration | placeholder exists | This file is reused by hero and training sections today; if replaced separately later, update content paths. |
| `/homepage-school/team-moscow.svg` | `hero-support-team.webp` | Hero support card | Support visual for the “matches and growth” card | 1600 x 1200 master | 4:3 | WEBP | Real photo or stylized illustration | placeholder exists | Currently reused by hero and teams. Works better if the subject has visible player motion. |

## Training

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/homepage-school/training-kids.svg` | `training-kids.webp` | Training: kids | First-ice training visual | 1600 x 1200 master | 4:3 | WEBP | Real photo | placeholder exists | Clear child-on-ice start moment, readable at card crop. |
| `/homepage-school/training-family.svg` | `training-family.webp` | Training: family | Parent + child / family ice visual | 1600 x 1200 master | 4:3 | WEBP | Real photo | placeholder exists | Needs warm but still sporty energy. |
| `/homepage-school/training-middle.svg` | `training-middle.webp` | Training: middle group | Mid-level group training visual | 1600 x 1200 master | 4:3 | WEBP | Real photo | placeholder exists | Show movement, puck work, and at least 2-3 players. |
| `/homepage-school/training-senior.svg` | `training-senior.webp` | Training: senior group | Older group / match-pace training visual | 1600 x 1200 master | 4:3 | WEBP | Real photo | placeholder exists | Strong speed / competitive feeling. |
| `/homepage-school/training-individual.svg` | `training-individual.webp` | Training: individual | 1-on-1 technique / shooting session visual | 1600 x 1200 master | 4:3 | WEBP | Real photo | placeholder exists | Close enough to read coach + player interaction in crop. |

## Teams

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/homepage-school/team-moscow.svg` | `team-moscow.webp` | Team: Moscow | Hero image for Moscow team card | 2400 x 1600 master | 3:2 | WEBP | Real photo | placeholder exists | Should support wide crop with players, bench, or group energy. Export responsive versions. |
| `/homepage-school/team-nizhny.svg` | `team-nn.webp` | Team: Nizhny Novgorod | Hero image for Nizhny team card | 2400 x 1600 master | 3:2 | WEBP | Real photo | placeholder exists | Match or group photo with clear team identity. Export responsive versions. |

## Gallery

Only 3 distinct gallery placeholders are used in the current code. Both city cards reuse them.

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/homepage-school/gallery-rush.svg` | `game-01.webp` | Teams gallery | Rush / transition moment | 1200 x 900 master | 4:3 | WEBP | Real photo | placeholder exists | Good for attack entry or fast breakout. |
| `/homepage-school/gallery-bench.svg` | `game-02.webp` | Teams gallery | Bench / shift talk / pause moment | 1200 x 900 master | 4:3 | WEBP | Real photo | placeholder exists | Adds variation against action-only photos. |
| `/homepage-school/gallery-shot.svg` | `game-03.webp` | Teams gallery | Shot / finish moment | 1200 x 900 master | 4:3 | WEBP | Real photo | placeholder exists | Close enough to read puck and stick action. |

## Trainers

Current homepage code uses portrait placeholders for all 4 trainer cards and expects 4:5 crops.

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/homepage-school/trainer-placeholder-1.svg` | `trainer-01.webp` | Trainers | Trainer portrait 01 | 1200 x 1500 master | 4:5 | WEBP | Real photo | placeholder exists | Portrait with enough top padding for badge overlay. |
| `/homepage-school/trainer-placeholder-2.svg` | `trainer-02.webp` | Trainers | Trainer portrait 02 | 1200 x 1500 master | 4:5 | WEBP | Real photo | placeholder exists | Same crop system as trainer 01. |
| `/homepage-school/trainer-placeholder-3.svg` | `trainer-03.webp` | Trainers | Trainer portrait 03 | 1200 x 1500 master | 4:5 | WEBP | Real photo | placeholder exists | Same crop system as trainer 01. |
| `/homepage-school/trainer-placeholder-4.svg` | `trainer-04.webp` | Trainers | Trainer portrait 04 | 1200 x 1500 master | 4:5 | WEBP | Real photo | placeholder exists | Same crop system as trainer 01. |
| `/homepage-school/trainer-placeholder-1.svg` | `trainer-placeholder-01.svg` | Trainers | Current placeholder | 800 x 1000 | 4:5 | SVG | Placeholder | placeholder exists | Already in repo. |
| `/homepage-school/trainer-placeholder-2.svg` | `trainer-placeholder-02.svg` | Trainers | Current placeholder | 800 x 1000 | 4:5 | SVG | Placeholder | placeholder exists | Already in repo. |
| `/homepage-school/trainer-placeholder-3.svg` | `trainer-placeholder-03.svg` | Trainers | Current placeholder | 800 x 1000 | 4:5 | SVG | Placeholder | placeholder exists | Already in repo. |
| `/homepage-school/trainer-placeholder-4.svg` | `trainer-placeholder-04.svg` | Trainers | Current placeholder | 800 x 1000 | 4:5 | SVG | Placeholder | placeholder exists | Already in repo. |

## Arena / Rent

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/homepage-school/ice-rent.svg` | `ice-rent.webp` | Ice rent | Rent / private ice visual | 2000 x 1400 master | 10:7 | WEBP | Real photo | placeholder exists | Ice surface, team slot, or private lesson scene. Export responsive versions. |

## Testimonials

Current code does not use testimonial images. Text-only cards are live now.

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| not used now | `review-01.webp` | Testimonials | Optional portrait / family visual for reviews | 1200 x 1200 master | 1:1 | WEBP | Real photo | needs real photo | Only needed if testimonial cards gain avatars or image mode later. |

## Location

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/homepage-school/map-moscow.svg` | `location-moscow.webp` | Location | Moscow location preview | 1600 x 1000 master | 8:5 | WEBP | Real photo or designed map preview | placeholder exists | Can be a venue exterior, rink entrance, or polished map-style preview. |
| `/homepage-school/map-nizhny.svg` | `location-nn.webp` | Location | Nizhny Novgorod location preview | 1600 x 1000 master | 8:5 | WEBP | Real photo or designed map preview | placeholder exists | Same visual system as Moscow preview. |
| not used now | `location-preview.webp` | Location | Generic location cover if a single map header is added later | 1600 x 1000 master | 8:5 | WEBP | Real photo or designed map preview | needs design | Optional; current code does not need a generic location image. |

## Game

Current code does not use a separate poster or promo image for the game block. The playable component renders the visual arena directly.

| Current code path | Recommended production filename | Block / section | Purpose | Recommended size | Aspect ratio | Format | Type | Status | Comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| not used now | `game-preview.webp` | Discount game | Optional promo poster / fallback cover for the game block | 1600 x 1200 master | 4:3 | WEBP | Illustration | needs design | Only needed if the block later gets a static promo header, social card, or fallback state. |

## Current Code Usage Checklist

These are the image paths actually used by the homepage and staff branding right now:

- `/homepage-school/gorilla-logo.png`
- `/homepage-school/hero-ice-arena.svg`
- `/homepage-school/training-kids.svg`
- `/homepage-school/training-family.svg`
- `/homepage-school/training-middle.svg`
- `/homepage-school/training-senior.svg`
- `/homepage-school/training-individual.svg`
- `/homepage-school/team-moscow.svg`
- `/homepage-school/team-nizhny.svg`
- `/homepage-school/gallery-rush.svg`
- `/homepage-school/gallery-bench.svg`
- `/homepage-school/gallery-shot.svg`
- `/homepage-school/trainer-placeholder-1.svg`
- `/homepage-school/trainer-placeholder-2.svg`
- `/homepage-school/trainer-placeholder-3.svg`
- `/homepage-school/trainer-placeholder-4.svg`
- `/homepage-school/ice-rent.svg`
- `/homepage-school/map-moscow.svg`
- `/homepage-school/map-nizhny.svg`

## Missing Assets To Prepare Next

Highest-priority missing production assets for the next sprint:

1. `gorilla-logo-dark.svg`
2. `gorilla-mark.svg` + favicon exports
3. `hero-main-dark.webp`
4. All 5 training photos
5. 2 team hero photos
6. 3 gallery photos
7. 4 trainer portraits
8. `ice-rent.webp`
9. 2 location previews

