#!/usr/bin/env node
// Builds every AURA output from tokens/aura.tokens.json. No dependencies: `node build/build.mjs`.
// Fails (exit 1) on a malformed token, a theme missing a role, or a contrast pair below its floor.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const T = JSON.parse(readFileSync(join(root, "tokens/aura.tokens.json"), "utf8").replace(/^﻿/, "")); // tolerate a BOM (Windows editors add one)
const errors = [];
const fail = (m) => errors.push(m);
const kebab = (s) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()); // mutedOnCell -> muted-on-cell, as the apps' servers do
const themes = Object.keys(T.themes);
const header = `Generated from tokens/aura.tokens.json ${T.version} by build/build.mjs. Don't edit; change the tokens file.`;

// ---- Validate: every leaf is { value, use }, every theme has the same roles ----
(function walk(node, path) {
  if (node && typeof node === "object" && "value" in node) {
    if (typeof node.use !== "string" || !node.use) fail(`${path}: missing "use"`);
    return;
  }
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) if (!["name", "version", "note", "defaultTheme", "use"].includes(k)) walk(v, path ? `${path}.${k}` : k);
})(T, "");
for (const group of ["color", "glow", "grid"]) {
  const ref = Object.keys(T.themes[T.defaultTheme][group]).join();
  for (const th of themes) if (Object.keys(T.themes[th][group]).join() !== ref) fail(`themes.${th}.${group}: roles differ from ${T.defaultTheme} (same names, same order)`);
}

// ---- Color: oklch() to sRGB, the same math as the TV apps' token generators ----
const OKLCH = /^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)%)?\s*\)$/;
function toRGBA(css, where) {
  const m = OKLCH.exec(css.trim());
  if (!m) { fail(`${where}: "${css}" is not oklch(L% C H [/ A%]), the only form the native generators read`); return [0, 0, 0, 1]; }
  const l = +m[1] / 100, c = +m[2], h = (+m[3] * Math.PI) / 180;
  const a = c * Math.cos(h), b = c * Math.sin(h);
  const l1 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m1 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s1 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1, -1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1, -0.0041960863 * l1 - 0.7034186147 * m1 + 1.707614701 * s1];
  const rgb = lin.map((x) => Math.round(Math.min(1, Math.max(0, x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)) * 255));
  return [...rgb, m[4] === undefined ? 1 : +m[4] / 100];
}
const hx = (n) => n.toString(16).padStart(2, "0");
const toHex = ([r, g, b, a]) => "#" + hx(r) + hx(g) + hx(b) + (a < 1 ? hx(Math.round(a * 255)) : "");
const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1].map(Math.round);
const lum = ([r, g, b]) => [r, g, b].map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (x, y) => { const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };

const rgba = {}, hex = {};
for (const th of themes) {
  rgba[th] = {}; hex[th] = {};
  for (const [k, v] of Object.entries(T.themes[th].color)) { rgba[th][k] = toRGBA(v.value, `themes.${th}.color.${k}`); hex[th][k] = toHex(rgba[th][k]); }
}
// Self-check: the app icons hand-type these two sRGB values (Glowcast doc 6, "App icon"); they must stay true.
if (hex["tron-dark"].bg !== "#000102" || hex["tron-dark"].focus !== "#00ced7") fail(`self-check: tron-dark bg/focus are ${hex["tron-dark"].bg}/${hex["tron-dark"].focus}, the icons expect #000102/#00ced7`);

// ---- Contrast: WCAG 2 ratios, translucent colors laid over what they sit on ----
const PAIRS = [
  ["text", "bg", 4.5, "main text"], ["text", "panel", 4.5, "text in a panel"], ["soft", "bg", 4.5, "body text"],
  ["muted", "bg", 4.5, "readouts"], ["muted", "panel", 4.5, "readouts in a panel"], ["mutedOnCell", "cell", 4.5, "listing details"],
  ["text", "cellNow", 4.5, "a listing on now"], ["focus", "bg", 4.5, "active tab, cyan label"], ["live", "bg", 4.5, "live label"],
  ["ok", "bg", 4.5, "success text"], ["warn", "bg", 4.5, "warning badge"], ["danger", "bg", 4.5, "error text"],
  ["ink", "focus", 4.5, "focused item, primary button"], ["ink", "live", 4.5, "now-line time flag"], ["ink", "danger", 4.5, "error banner"],
  ["ghost", "bg", 0, "decoration only, not text"],
];
const contrast = {};
for (const th of themes) {
  const c = rgba[th];
  contrast[th] = PAIRS.map(([fg, bg, min, use]) => {
    const base = over(c[bg], c.bg), r = ratio(over(c[fg], base), base);
    if (r < min) fail(`contrast ${th}: ${fg} on ${bg} is ${r.toFixed(2)}:1, below ${min}:1 (${use})`);
    return { fg, bg, ratio: +r.toFixed(2), min, use, pass: r >= min };
  });
}

if (errors.length) { console.error("AURA build failed:\n  " + errors.join("\n  ")); process.exit(1); }

// ---- Outputs ----
for (const d of ["dist", "docs"]) mkdirSync(join(root, d), { recursive: true });
const out = (f, s) => { writeFileSync(join(root, f), s); console.log("wrote " + f); };
const decl = (name, v) => `  --${name}: ${v};`;
const roleFont = (spec) => { // "300 36px/1.1 display 0.5em" -> font shorthand + tracking
  const [w, size, fam, track] = spec.split(" ");
  return [`${w} ${size} var(--font-${fam})`, track];
};

// aura.css: every token as a CSS custom property; themes switch by class on <html>.
const css = [`/* ${header} */`, `/* Themes: :root is ${T.defaultTheme}; add .theme-tron-light to <html> for Tron Light. */`];
for (const th of themes) {
  const sel = th === T.defaultTheme ? `:root,\n.theme-${th}` : `.theme-${th}`;
  const t = T.themes[th];
  css.push(`${sel} {`, ...Object.entries(t.color).map(([k, v]) => decl(kebab(k), v.value)), ...Object.entries(t.glow).map(([k, v]) => decl(kebab(k), v.value)),
    ...Object.entries(t.grid).map(([k, v]) => decl(kebab(k), v.value)), "  color-scheme: dark;", "}");
}
css.push(":root {",
  ...Object.entries(T.font).map(([k, v]) => decl("font-" + k, v.value)),
  ...Object.entries(T.typeRoles).flatMap(([k, v]) => { const [f, tr] = roleFont(v.value); return [decl("type-" + k, f), decl("tracking-" + k, tr)]; }),
  ...Object.entries(T.type).map(([k, v]) => decl(k, v.value)),
  ...Object.entries(T.touchType).map(([k, v]) => decl(k, v.value)),
  ...Object.entries(T.space).map(([k, v]) => decl(kebab(k), v.value)),
  ...Object.entries(T.shape).map(([k, v]) => decl(kebab(k), v.value)),
  ...Object.entries(T.motion).map(([k, v]) => decl(kebab(k), v.value)),
  ...Object.entries(T.easing).map(([k, v]) => decl("ease-" + k, v.value)),
  ...Object.entries(T.focus.scale).map(([k, v]) => decl("focus-scale-" + k, v.value)),
  "}");
out("dist/aura.css", css.join("\n") + "\n");

// aura-compat.css: the names each app uses today, pointed at AURA's. Load after aura.css; drop once an app is migrated.
out("dist/aura-compat.css", `/* ${header} */
/* Legacy names -> AURA names. Glowcast/Streamer (tokens.css) and AURA.p (global.css) can load this instead of their own token CSS. */
:root {
  /* Glowcast and Streamer */
  --guide: var(--bg);
  --display: var(--font-display);
  --mono: var(--font-mono);
  /* AURA.p */
  --bg-panel: var(--panel);
  --bg-overlay: var(--overlay);
  --accent: var(--focus);
  --accent-dim: var(--focus-dim);
  --accent-2: var(--focus);
  --accent-2-dim: var(--focus-dim);
  --danger-dim: color-mix(in oklch, var(--danger) 30%, transparent);
  --success: var(--ok);
  --glow-success: var(--glow-ok);
  --text-dim: var(--muted);
  --text-muted: var(--muted);
  --text-secondary: var(--muted);
  --text-ghost: var(--ghost);
  --border: var(--line-strong);
  --border-dim: var(--line);
  --border-hover: var(--line-hover);
  --glow-label: drop-shadow(0 0 5px var(--focus-dim)) drop-shadow(0 0 12px color-mix(in oklch, var(--focus) 16%, transparent));
  --grid-image: none;
  --font-body: var(--font-display);
  --radius-sm: var(--radius);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
}
.theme-tron-light {
  --accent-2: var(--live);
  --accent-2-dim: color-mix(in oklch, var(--live) 35%, transparent);
  --grid-image: linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
}
`);

// design-tokens.json: drop-in token file for Glowcast and Streamer, Tron Dark, in the exact shape their server and
// TV builds read. Only the keys they know.
const D = T.themes[T.defaultTheme];
const pick = (src, keys) => Object.fromEntries(keys.map((k) => [k, { value: src[k].value, use: src[k].use }]));
const tv = {
  version: T.version,
  note: `AURA Tron Dark for TV apps, generated from the AURA design system (aura-design-system/tokens/aura.tokens.json ${T.version}). Don't edit here; change AURA and rebuild. Type and space are in TV-canvas pixels: 1920 x 1080, so 1 is 1/1080 of the screen's height.`,
  color: { ink: D.color.ink, guide: D.color.bg, ...pick(D.color, ["panel", "row", "cell", "cellNow", "line", "lineStrong", "text", "soft", "muted", "mutedOnCell", "focus", "live", "ok", "warn", "danger"]) },
  font: pick(T.font, ["display", "mono"]),
  glow: pick(D.glow, ["glow", "glowDim"]),
  motion: pick(T.motion, ["focusMs", "bannerInMs", "bannerOutMs", "slideMs", "scrollMs", "screenFadeMs"]),
  type: T.type,
  space: T.space,
  touchType: T.touchType,
  focus: { scale: Object.fromEntries(Object.entries(T.focus.scale).map(([k, v]) => [k, v.value])) },
  radius: { all: 0 },
};
tv.color.guide = { value: D.color.bg.value, use: D.color.bg.use };
out("dist/design-tokens.json", JSON.stringify(tv, null, 2) + "\n");

// aura.flat.json: every token resolved per theme, with sRGB hex for native code and icons. The easiest file for an agent to read.
const flat = { version: T.version, header, themes: {} };
for (const th of themes) {
  const f = {};
  for (const [k, v] of Object.entries(T.themes[th].color)) f[`color.${k}`] = { value: v.value, hex: hex[th][k], css: `var(--${kebab(k)})`, use: v.use, ...(v.derived && { derived: true }) };
  for (const g of ["glow", "grid"]) for (const [k, v] of Object.entries(T.themes[th][g])) f[`${g}.${k}`] = { value: v.value, css: `var(--${kebab(k)})`, use: v.use };
  for (const g of ["font", "typeRoles", "type", "touchType", "space", "shape", "motion", "easing"])
    for (const [k, v] of Object.entries(T[g])) f[`${g}.${k}`] = { value: v.value, css: `var(--${g === "font" ? "font-" + k : g === "typeRoles" ? "type-" + k : g === "easing" ? "ease-" + k : kebab(k)})`, use: v.use };
  for (const [k, v] of Object.entries(T.focus.scale)) f[`focus.scale.${k}`] = { value: v.value, css: `var(--focus-scale-${k})`, use: v.use };
  flat.themes[th] = f;
}
out("dist/aura.flat.json", JSON.stringify(flat, null, 2) + "\n");

// aura.tokens.js: the same data for the showcase page, loadable from file:// with a <script> tag.
out("dist/aura.tokens.js", `/* ${header} */\nwindow.AURA = ${JSON.stringify({ tokens: T, hex, contrast })};\n`);

// docs/contrast.md: the contrast table, regenerated each build.
const md = [`# Contrast`, ``, `${header}`, ``, `WCAG 2 contrast of each text role on the surface it sits on. Translucent colors are laid over their surface first. The build fails if a pair drops below its floor.`, ``];
for (const th of themes) {
  md.push(`## ${th}`, ``, `| Text | On | Ratio | Floor | Use |`, `|---|---|---|---|---|`);
  for (const p of contrast[th]) md.push(`| \`${p.fg}\` ${hex[th][p.fg]} | \`${p.bg}\` ${hex[th][p.bg]} | ${p.ratio}:1 | ${p.min ? p.min + ":1" : "none"} | ${p.use} |`);
  md.push(``);
}
out("docs/contrast.md", md.join("\n"));
console.log(`AURA ${T.version}: ${themes.length} themes, all checks passed.`);
