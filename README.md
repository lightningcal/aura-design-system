# AURA Design System

**The Arcade Terminal**: cyan glow on a near-black void, square corners, upper-case readouts. One design system and one set of tokens for:

- **AURA.p**: Pandora client for iPhone and iPad (native Swift)
- **Glowcast**: live TV channels for web, Google TV and Apple TV
- **Streamer**: on-demand player for web, Google TV and Apple TV

Open **[index.html](index.html)** in a browser to see the whole system: colors, type, space, glow, motion and every component, in both themes.

## What's here

```
tokens/aura.tokens.json   the single source of every value  ← edit this
DESIGN.md                 art direction: principles, color, type, shape, motion, do & don't
docs/components.md        anatomy of each building block
docs/consuming.md         how each app and platform loads the tokens
docs/contrast.md          generated contrast report
dist/                     generated outputs (CSS, TV drop-in JSON, flat JSON)
build/build.mjs           the generator and its checks (Node 18+, no dependencies)
index.html, site/         the showcase
AGENTS.md                 guide for coding agents
```

## Themes

| Theme | Class on `<html>` | Used by |
|---|---|---|
| Tron Dark (default) | none, or `.theme-tron-dark` | all three apps |
| Tron Light | `.theme-tron-light` | AURA.p |

## Use it

```html
<link rel="stylesheet" href="../aura-design-system/dist/aura.css">
```

TV apps take `dist/design-tokens.json` in place of their own token file; see [docs/consuming.md](docs/consuming.md).

## Change it

```
node build/build.mjs
```

Edit `tokens/aura.tokens.json`, bump `version`, rebuild, and commit the tokens and `dist/` together.
