---
name: AURA
description: Tron design system shared by AURA.p, Glowcast and Streamer. Cyan glow on a near-black void; square, flat, uppercase; focus is the only thing that glows.
version: 2026-11-25.1
tokens: tokens/aura.tokens.json
themes:
  tron-dark: ":root (default) or .theme-tron-dark on <html>"
  tron-light: ".theme-tron-light on <html>"
colors:
  bg: "oklch(6% 0.015 230)"
  panel: "oklch(12% 0.022 225)"
  cell: "oklch(17% 0.03 220)"
  cell-now: "oklch(23% 0.05 212)"
  line: "oklch(75% 0.18 198 / 22%)"
  text: "oklch(90% 0.03 210)"
  soft: "oklch(80% 0.035 210)"
  muted: "oklch(66% 0.04 210)"
  ink: "oklch(6% 0.015 230)"
  focus: "oklch(75% 0.18 198)"
  live: "oklch(72% 0.19 54)"
  ok: "oklch(80% 0.16 165)"
  warn: "oklch(86% 0.15 95)"
  danger: "oklch(60% 0.22 330)"
typography:
  display: { fontFamily: "Rajdhani", fontWeight: 300, fontSize: "36px", letterSpacing: "0.5em" }
  headline: { fontFamily: "Rajdhani", fontWeight: 600, fontSize: "16px", letterSpacing: "0.08em" }
  body: { fontFamily: "Rajdhani", fontWeight: 500, fontSize: "14px" }
  label: { fontFamily: "Rajdhani", fontWeight: 600, fontSize: "12px", letterSpacing: "0.18em", textTransform: uppercase }
  mono: { fontFamily: "Share Tech Mono", fontWeight: 400, fontSize: "12px" }
rounded:
  all: "0"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
elevation:
  glow: "0 0 12px oklch(75% 0.18 198 / 58%), 0 0 32px oklch(75% 0.18 198 / 24%)"
  glow-dim: "0 0 8px oklch(75% 0.18 198 / 30%), 0 0 20px oklch(75% 0.18 198 / 14%)"
---

# AURA

**The Arcade Terminal.** A 1982 mainframe interface built for 2026: direct, geometric, uncompromising. Surfaces are void. Things you can act on glow cyan. Corners are square, labels are upper case and widely spaced, numbers are monospaced readouts. Pictures, whether album art, posters or stills, are the hero, framed with precision and never buried in chrome.

AURA is one system for three products:

| App | What it is | Platforms | Themes |
|---|---|---|---|
| **AURA.p** | Pandora client | Native Swift for iPhone and iPad | Tron Dark, Tron Light |
| **Glowcast** | Live TV channels from a Plex library | Web (TV canvas + touch), Google TV, Apple TV | Tron Dark |
| **Streamer** | On-demand catalogue player | Web (TV canvas), Google TV, Apple TV | Tron Dark |

Values live in [tokens/aura.tokens.json](tokens/aura.tokens.json). This file is the *why* and the *rules*; [docs/components.md](docs/components.md) is the anatomy of each building block; [docs/consuming.md](docs/consuming.md) is how each platform loads the tokens.

## 1. Principles

1. **Cyan means you can act.** `focus` is reserved for focus, selection and pressable things. Never decoration, never plain text. At most about 30% of any screen.
2. **Glow, not shadow.** Depth comes from a cyan glow on the one focused thing and from panels a shade lighter than the void. No drop shadows, no blur, no glass.
3. **Square and flat.** Every corner is 0. No gradients on controls. A gradient appears only as a fade under text laid over a picture.
4. **The void is quiet.** Panels sit barely above the background, enough to separate and never enough to stack. Hierarchy comes from type and light, not boxes.
5. **One canvas for TVs.** TV layouts are drawn on a 1920 × 1080 canvas and scaled to the screen. Token sizes are canvas pixels, so one design reads the same on every TV.
6. **Focus is the main state; touch is honest.** On a remote-driven screen the focused item takes the cyan fill, dark `ink` text and the `glow`, and grows slightly. On a phone the pressed state carries the same highlight: tap to act, long-press for a menu, swipe from the leading edge to go back. No hover-only paths and no tooltips; a control's hint is its VoiceOver hint.
7. **Functional retro.** Grids, notches, readouts and the sweeping now line are working parts. No CRT scanlines, floppy icons or cyberpunk noise.

## 2. Color

OKLCH throughout, so lightness steps are even. Two themes share every role name; switch by class on `<html>`.

| Role | Tron Dark | Use |
|---|---|---|
| `bg` | `oklch(6% 0.015 230)` ≈ `#000102` | The void: every screen's background |
| `panel` | `oklch(12% 0.022 225)` | Menus, tiles, dialogs, cards |
| `row` / `cell` / `cellNow` | 13% / 17% / 23% | List rows, listings, a listing on now |
| `line` / `lineStrong` | cyan at 22% / 45% | Edges and dividers |
| `text` / `soft` / `muted` | 90% / 80% / 66% | Main text, body text, readouts |
| `ink` | = `bg` | Text on a cyan, orange or magenta fill |
| `focus` | `oklch(75% 0.18 198)` ≈ `#00ced7` | **Interactive only** |
| `live` | `oklch(72% 0.19 54)` orange | The now line, live marks, an active thumbs-up |
| `ok` / `warn` / `danger` | green / yellow / Arcade Magenta | Success, warnings, errors (and an active thumbs-down) only |
| `ghost` | 28% | Decoration only, never readable text |

**Tron Light** keeps the same grammar on a deep-blue Grid (`oklch(17% 0.07 232)`) with a visible 24px grid line, a brighter cyan `oklch(80% 0.17 213)`, and orange `live` as a true second accent. Panels are *darker* than the grid, like windows cut into it.

Every text role passes WCAG AA (4.5:1) on its surface in both themes; the build checks this each time and writes [docs/contrast.md](docs/contrast.md).

## 3. Typography

Two faces and no third: **Rajdhani** for everything that reads, **Share Tech Mono** for times, numbers, counts and technical details (sizes, codecs, resolutions).

- **Labels** (tabs, buttons, chips, badges, section headings) are UPPER CASE, semibold, letter-spaced 0.1–0.18em.
- **Titles** are large, light-to-regular weight (300–400), tracked 0.05em, line-height 1.
- **Metadata** may be mixed case for readability.
- **TV scale** `t1`–`t21` (13–230 canvas px); `t7` (25px) is the base. **Touch scale** `tt1`–`tt19` in layout units; `tt8` (16) is the base. **Phone roles** for AURA.p: `display` 36, `headline` 16, `body` 14, `label` 12/0.18em, `button` 12/0.15em, `tab` 10/0.12em, `mono` 12 (times 10).

## 4. Space and layout

- TV space steps `s1`–`s16` (2–77 canvas px). AURA.p's `xs/sm/md/lg` are `s2/s4/s8/s10` (4/8/16/24).
- **Five gaps** set the rhythm between things: `sectionGap` 46, `headingGap` 12, `buttonGap` 24, `tileGap` 24, `chipGap` 10. Lines inside one thing keep their own small steps.
- TV screens keep `edgeX` 80 / `edgeY` 60 title-safe margins.
- Leave room for focus: a focused item grows (1.02–1.07) and glows, so lists are padded and gaps sized so it never touches a neighbour or the text around it.

## 5. Shape and elevation

- `radius` 0 everywhere. The one exception is third-party logo artwork (service and network logos), which keeps its own rounding (22%) and gets no frame.
- **Notches:** framed hero art carries L-shaped corner marks, `notchSize` 10 × `notchWeight` 2, in `focus`; a station card shows 8px ones (`notchCard`) while pressed or while its menu is open.
- **Glow ladder:** `glowDim` (menus, dialogs) → `glow` (the focused item) → `glowHover`, the strong glow (a pressed primary control; pointer hover on the web). Hero art breathes between `glowArt` and `glowArtPulse` over 4s. Banners use `glowDanger` / `glowOk` / `glowInfo`.
- Never a drop shadow for elevation. Text laid over pictures may take a soft dark `text-shadow` for legibility.

## 6. Motion

Short and plain: fades and slides of 80–300ms, no bounce, no spring.

| Token | ms | For |
|---|---|---|
| `pressMs` | 80 | Press feedback on a control |
| `focusMs` | 150 | Focus change: fill, scale, glow (`ease-out`) |
| `bannerInMs` / `bannerOutMs` | 200 / 300 | Banner in (`ease-out`) and out (`ease-in`); a message banner holds `bannerHoldMs` 4000 |
| `slideMs` | 240 | Now-playing bar and playback panel |
| `scrollMs` | 200 | Lists scroll to a new place (`ease-in-out`) |
| `pulseMs` | 4000 | Hero art glow breathing |

Scrolling follows the wheel or finger exactly. **Reduced motion:** nothing grows, slides, pulses or turns; a focused item shows a solid `s3` outline in `text`, `s1` outside it, instead of the glow.

### Loading

Three loaders, one per kind of wait. All are drawn in `focus` (the sweep in `live`), and none appears for a wait that ends at once.

| Loader | Where | What it is |
|---|---|---|
| **Cube spinner** | AURA.p | A wireframe cube tumbling in perspective: its 12 edges turn about Y every `cubeTurnYMs` (1.8s) and X every `cubeTurnXMs` (2.7s) from a 0.5 rad tilt. Far edges at 22% opacity, near edges full and under the `glow`. 40px by default. Replaced the flat turning square on 2026-11-03. |
| **Loading line** | Streamer | The progress line (3px, `text` at 15%) with a lit `focus` piece 35% long gliding along it every `glideMs` (1.6s, `ease-in-out`), under the word that names the wait. Hidden for `loadDelayMs` (200ms). |
| **Tuning bars** | Glowcast | The app icon come to life: three rows of listing bars with the words written in them, the orange now line sweeping across every `sweepMs` (2.4s), each bar lighting `focus` with `ink` words as it passes. |

## 7. Do and don't

**Do:** use tokens only (no literal color, size, space, glow or timing in app code) · keep cyan for interaction · square corners · upper-case spaced labels · mono for numbers · let pictures lead · crop pictures to fill (posters 2:3, stills 16:9), never letterbox them in a frame · give focused items room to grow · add a token rather than misuse one whose `use` doesn't fit.

**Don't:** rounded corners · drop shadows · glassmorphism or blur · gradients on controls · cyan on decoration or body text · orange anywhere but live marks (Tron Light's second accent aside) · magenta anywhere but errors · a third typeface · lower-case UI labels · Spotify/Apple-Music-style streaming chrome · CRT pastiche · chaotic neon.
