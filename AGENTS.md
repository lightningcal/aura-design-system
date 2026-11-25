# AURA design system: agent guide

AURA is the Tron design system shared by **AURA.p**, **Glowcast** and **Streamer**. This repo holds the tokens, the art direction, and a showcase. It holds no app code.

## Read in this order

1. **[DESIGN.md](DESIGN.md)**: the look, the principles, the do and don't. Read it before designing or changing any UI in any AURA app.
2. **[dist/aura.flat.json](dist/aura.flat.json)**: every token, resolved per theme, with `use`, sRGB `hex` and its CSS variable. Easiest file for looking up a value.
3. **[docs/components.md](docs/components.md)**: how each building block is made from tokens.
4. **[docs/consuming.md](docs/consuming.md)**: which file each platform loads and how to change a token.

## Rules for any agent working on an AURA app

- **Tokens only.** No literal color, font, type size, spacing, glow, radius or timing in app code. If no token fits, add one here first.
- **Pick tokens by `use`**, not by how they look. `focus` is for interaction only; `live` for live marks only; `danger` for errors only; `ghost` never for readable text.
- **Tron only.** Square corners, glow instead of shadow, upper-case spaced labels, Rajdhani + Share Tech Mono.
- **TV sizes are canvas px** on 1920 × 1080; touch sizes are `tt*` × the layout unit; the phone app (AURA.p) uses `typeRoles`.
- Leave room for focus growth and glow (`buttonGap`, `tileGap`, padded clips).

## Rules for working in this repo

- **Edit only `tokens/aura.tokens.json`** (and the docs). Never hand-edit `dist/` or `docs/contrast.md`.
- Every token is `{ "value", "use" }`. Colors are `oklch(L% C H)` or `oklch(L% C H / A%)`, the only form the apps' native generators parse. Both themes must have the same roles in the same order.
- After a change: bump `version`, run `node build/build.mjs`, and commit the tokens and `dist/` together. The build fails on bad tokens or contrast below 4.5:1.
- When a value changes, update DESIGN.md if it's quoted there.
- Keep this repo about the system, not the apps' code: no app repo paths or branch names. The repo is public.
- `index.html` is the showcase and reads `dist/aura.css` + `dist/aura.tokens.js`. Open it after a change to look at the result.
