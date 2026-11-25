# Components

The building blocks every AURA app is made of, described in tokens. Web class names in `code` are Glowcast's and Streamer's (`web/app/css/aura.css`, `streamer.css`); AURA.p names are its SwiftUI views on `codex/native-ios` (`ios/Native/App/Design/`). TV sizes are canvas px tokens; AURA.p uses the phone `typeRoles` and `s2/s4/s8/s10`. The live versions are in the showcase ([index.html](../index.html)).

## Focus and press (the main state)

- **Remote (TV, web canvas):** focused = `focus` fill, `ink` text, `glow`, scaled by its `focus.scale` (`cell` 1.045, `card` 1.07, `item` 1.03, `button` 1.05, `row` 1.02). Transition `focusMs` `ease-out` on transform, background, box-shadow. It rises above its neighbours and never pushes into the text around it.
- **Pictures** (posters, cards) don't fill; they take a 3–4px `focus` ring plus `glow`, and their caption brightens to `text`.
- **Touch (AURA.p):** the pressed state carries the highlight: `focus` border + `glow` (`glowHover` on a primary button). No hover states, no tooltips; a control's hint is its VoiceOver hint.
- **Reduced motion:** no scale, no glow; `outline: var(--s3) solid var(--text); outline-offset: var(--s1)`.

## Button `.btn` (AURA.p primary / secondary buttons)

- TV: display `t7`, 600, 0.1em, upper case, padding `s6` × `s12`; rest fill `text` at 11%. **The fill grows, the text doesn't:** the fill is a `::before` layer scaled by `focus.scale.button`, so words never jump.
- Phone: `button` role (12px, 0.15em, upper case). Primary: `focus` fill, `ink` text, `glow`; pressed `glowHover`. Secondary: transparent, 1px `line`; pressed border and text `focus` + `glow`. Tertiary (Tron Light): `live` border and text.
- Danger: `danger` text and 2px inset `danger` ring; focused or pressed fills `danger` with `ink` text.
- Side by side: `buttonGap`.

## Chip `.chip` and hint keys

- Display `t5`, 600, 0.1em, upper case, padding `s3` × `s8`, fill `text` at 9%. Primary: `focus` fill, `ink`, `glow`.
- Hint keys: `<kbd>` in mono `focus`, then the action: **`Enter`** Watch live.
- Between chips: `chipGap`.

## Badge `.bdg` and logo chip `.logo`

- Badge: mono `t2`, 0.08em, padding `s2` × `s3`, 1px inset outline in `currentColor`. `warn` for LAST DAY and warnings, `soft` for THRU/ENDS, `focus` for resolution, `ok` for healthy. AURA.p's search type badges: `danger` magenta (artist), `live` orange (station).
- Logo chip: display 700 `t2` 0.1em upper case in the channel's own color (from data, not tokens), outlined 1px in the same color. On a focused row it turns `ink`.

## Tabs `.tab`

- Display 600, upper case, `muted` at rest. TV: `t7`, 0.1em. Phone: `tab` role (10px, 0.12em); AURA.p's tab bar is at the top.
- Current: `focus` text with a 2–3px `focus` underline (inset, so nothing shifts).
- Focused (remote): full `focus` fill, `ink`, `glow`.
- Settings side nav (TV): the same, with a 3px left bar instead of an underline.

## Progress `.bar`

- TV: 7–9px track of `text` at 15%; buffered part `progressBuffer`; played part `focus` with `glow`.
- Phone: 2px track, a 4px square thumb. AURA.p's scrubber shows position only; it never seeks.
- Live point / now: a 3–4px `live` mark with a soft orange glow.

## Listing cell `.cell` and rows `.ch`, `.chrow`, `.li`

- Cell: `cell` fill, 1px inset `line`; `cellNow` while on now; past at 55% opacity. Title display 600 `t7`; details mono `t3` `mutedOnCell`.
- Row: `row` fill, 60–64px tall, number in mono `muted`, name upper case. Focused list row in Streamer: `cellNow` fill + 2px inset `focus` ring + `glow`; elsewhere a full `focus` fill.

## Now line `.nowline`

- 3px `live` vertical line with a `0 0 10px` orange glow; a flag on top with the time in mono `t2`, `ink` on `live`.

## Cards, posters and pictures

- Posters 2:3, cards and stills 16:9, `cell` placeholder, always cropped to fill.
- Text over a picture sits on a fade to the void at the bottom (and top for corner labels), with a soft dark text-shadow.
- Gaps: `tileGap` across and down.

## Station card (AURA.p)

- Grid of 2 columns (3 from 600pt wide, 4 from 1200pt), `panel` fill, 1:1 art.
- Pressed or menu open: `focus` border + `glow` and 8px notches (`notchCard`). Tap plays; long-press opens the menu.

## Framed hero art (AURA.p Now Playing)

- 1:1, square, 1px `lineStrong` frame, L-notches at the corners (`notchSize` × `notchWeight` in `focus`), breathing between `glowArt` and `glowArtPulse` over `pulseMs`.

## Panel, tile, dialog

- `panel` fill, 1px inset `line`, `glowDim` around floating ones (menus, dialogs).
- Dialog (AURA.p `EQPresetDialog`, `ConfirmDialogView`): full-window `overlay` backdrop, centred panel on `bg`, title in display label styling, actions right-aligned: secondary then primary. One modal shell; don't invent a second. A leading-edge swipe cancels it.
- Info banner over video (TV): void at 90% so the picture shows faintly through, 1px `line`, a faint 23px cyan halo.

## Menu (AURA.p `AuraMenuLayer`)

- Floating `panel`, 1px `line`, `glowDim`, at the press point or below its trigger, 8pt inside the window. Items 39pt rows, body 14px **sentence case**; a destructive item carries an 18px circle-× icon. No dividers, no open animation. A tap outside closes it.

## Message banner (AURA.p `BannerCenter`)

- One at a time, full width under the tab bar (at the top of the login screen); never shifts content. Mono 12px upper case, 0.05em.
- Error: `danger` fill, `ink` text, `glowDanger`. Success: `ok` + `glowOk`. Info: `info` + `glowInfo`. Goes by itself after `bannerHoldMs` (4s; 0 keeps it). Announced to VoiceOver.

## Input and search

- Square, void fill, 1px `lineStrong`; focus: `focus` border (or 2–3px inset ring) + `glow`; caret `focus`.
- Placeholder upper case in `muted` (not `ghost`: placeholders must be readable).

## Dropdown (AURA.p `AuraSelect`)

- `panel` fill, 1px `line`, square; label in body type 13px (16 in an option list), **sentence case**; chevron triangle in `focus`. A picker with long options opens a dialog instead.

## Loading

- **Cube spinner (AURA.p `TronCubeSpinner`):** the 12 edges of a wireframe cube in `focus`, 1.25px lines (1px under 28px), turning about Y (`cubeTurnYMs`) and X (`cubeTurnXMs`, from a 0.5 rad tilt) in perspective from 4.5 half-sides away. Far edges at 22% opacity rising to full for near ones; the near half drawn again under `glow`. 40px by default. Holds still with reduced motion. Its loading text: mono 11px, 0.18em, upper case, `muted`.
- **Loading line (Streamer `.sweep`):** 240px × 3px track of `text` at 15%; a `focus` piece 35% long glides across every `glideMs`, `ease-in-out`; fades in after `loadDelayMs` so a quick answer never shows it; sits under the word naming the wait ("Loading…", "Searching for releases…"). With reduced motion the piece stands still.
- **Tuning bars (Glowcast `.tune-bars`):** three rows of listing bars, centred, with the words written in them; the `live` now line sweeps across every `sweepMs`; each bar lights `focus` (words `ink`) as it passes. With reduced motion one bar stays lit and the line stands still.
