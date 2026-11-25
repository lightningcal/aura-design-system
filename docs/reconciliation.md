# Reconciliation: where each app stands

How AURA was put together from the three apps (read 2026-11-25), what was decided where they disagreed, and what each app has to change to match. Use this list when you update each app.

## Sources

| App | Read from |
|---|---|
| AURA.p | Branch **`codex/native-ios`** (the native Swift app, newest commit 2026-11-14; not yet merged into `main`): `DESIGN.md`, `PRODUCT.md`, `ios/Native/AURACore/Sources/AURACore/Design/DesignTokens+Themes.swift`, `ios/Native/App/Design/*` (`AuraChrome.swift`, `TronCube.swift`, `AuraTheme.swift`). Its token values were generated from the legacy `src/renderer/styles/global.css` at tag `legacy-final`, which is what `main` still has, so the two agree on every Tron value. |
| Glowcast | `docs/design/06-design-system.md`, `internal/server/tokens/design-tokens.json` (`2026-11-14.2`), `web/app/css/app.css`, `touch.css`, `loading.html`, `Theme.kt`, `Theme.swift`, `apple-tv/tokens.py` |
| Streamer | `docs/design/06-design-system.md`, `docs/design/01-web-app-ui.md` (loading line), `internal/server/tokens/design-tokens.json` (`2026-11-14.2`), `web/app/css/aura.css` (a copy of Glowcast's `app.css`), `streamer.css`, `internal/server/tokens.go` |

## Decisions

- **AURA is Tron only.** AURA.p's Bluey themes are left out of the system (they were a joke theme). AURA.p can keep Bluey as an app-local theme outside AURA, or remove it.
- **Tron Dark values come from the Glowcast/Streamer token file** where the apps disagree: it's the newer, measured version, compiled into three platforms.
- **Names** are the TV vocabulary (`panel`, `focus`, `muted`, `line`, `ink` ...) plus AURA.p's extra roles (`overlay`, `ghost`, `focusDim`, `lineHover`, `progressBuffer`, `info`, the glow set). `guide` became `bg`; the TV drop-in still writes `guide`.
- **The five layout gaps** (Streamer, 2026-11-23) and **`slideMs`** (Glowcast, 2026-11-25) are now AURA tokens for every app.
- **Three loaders**, one per app's kind of wait: AURA.p's **cube spinner** (2026-11-03; it replaced the flat turning square, which `main` still has), Streamer's **loading line** (2026-11-19) and Glowcast's **tuning bars** (2026-11-14).
- **Touch rules** from the native AURA.p are AURA's: pressed state carries the highlight, long-press menus, no hover-only paths, no tooltips.
- **Mono is Share Tech Mono.** AURA.p uses *Share Tech*, which is not monospaced.
- **Contrast floor is 4.5:1** for every text role, checked at build time.

## AURA.p changes to make

All in `DesignTokens+Themes.swift` (with `Fixtures/design-tokens-contract.json`) on `codex/native-ios`, or after it's merged.

| What | AURA.p today | AURA | Why |
|---|---|---|---|
| Tron Dark `--bg-panel` | `oklch(11% 0.02 225)` | `panel` `oklch(12% 0.022 225)` | Match TV apps |
| Tron Dark `--text-dim` (and `--text-muted`, `--text-secondary`) | `oklch(55% 0.04 210)`, 4.37:1 | `muted` `oklch(66% 0.04 210)`, 6.8:1 | Below AA for small text |
| Tron Dark `--border-dim` | cyan / 18% | `line` cyan / 22% | Match TV apps (Tron Light keeps 18%) |
| Tron Dark `--success` | `oklch(72% 0.16 155)` | `ok` `oklch(80% 0.16 165)` | Match TV apps |
| Tron Dark `--glow-dim` | 8px/44%, 20px/18% | 8px/30%, 20px/14% | Match TV apps; menus glow less than the focused item |
| Tron Light `--danger` | `oklch(55% 0.21 318)`, 3.46:1 | `oklch(66% 0.21 318)`, 5.45:1 | Below AA |
| `--font-mono` | Share Tech | Share Tech Mono | Share Tech isn't monospaced; digits jitter. Bundle `ShareTechMono-Regular` |
| `AuraColors` (thumbs-up orange, search badge orange and magenta) | Fixed values that bypass the tokens | `live` and `danger` | Same values; tokens only |
| Theme docs | `DESIGN.md`, `docs/DESIGN-SYSTEM.md`, `docs/design/tron.md` | Point at this repo for Tron | One source |

Everything else in AURA.p's Tron tokens (cyan, magenta, void, text, borders, the glow ladder, notches, grid, overlay, the cube spinner) already matches AURA.

## Glowcast changes to make

- Swap `internal/server/tokens/design-tokens.json` for `dist/design-tokens.json`. Adds `sectionGap`, `headingGap`, `buttonGap`, `tileGap`, `chipGap`; changes no value.
- Point `docs/design/06-design-system.md` at this repo; keep the app-specific parts (guide cells, channel chips, tuning screen) there.

## Streamer changes to make

- Swap the token file the same way. Adds `slideMs`; changes no value. Its current file's `note` still says "Glowcast's look"; the drop-in fixes that.
- `web/app/css/aura.css` is a hand copy of Glowcast's `app.css`; nothing keeps the two in sync. It's a candidate to move into AURA as shared component CSS later.
- The 22% rounded service logos are a sanctioned exception (logo artwork), recorded in DESIGN.md.
- The loading line's timings (`200ms` delay, `1600ms` glide) are typed into `streamer.css` and both TV apps; they're tokens now (`loadDelayMs`, `glideMs`).

## Open questions

- **Display P3 or sRGB?** AURA.p paints OKLCH colors in Display P3, so its cyan is more vivid than the TV apps', which clip to sRGB (`#00ced7`). Matching exactly means AURA.p clips too, or the TV apps accept their screens' limits. Not decided.

## Not covered yet

- No shared component CSS: each app keeps its own, built to [components.md](components.md).
- No generator for AURA.p's Swift tokens; values are copied by hand for now.
- Tron Light has no TV export: no TV app uses it. Its `row`, `cell`, `cellNow`, `soft`, `mutedOnCell` and `warn` are `derived` (marked in the token file) until an app uses them.
