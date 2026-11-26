// AURA showcase: fills the token tables from window.AURA (dist/aura.tokens.js), switches themes,
// scales the TV canvas, and moves focus the way a TV remote does.
(() => {
  const A = window.AURA;
  if (!A) { document.body.insertAdjacentHTML("afterbegin", '<p style="padding:16px;color:#f0f">dist/aura.tokens.js is missing: run node build/build.mjs</p>'); return; }
  const T = A.tokens, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const kebab = (s) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  $$("[data-version]").forEach((e) => (e.textContent = T.version));

  // ---- Theme ----
  let theme = T.defaultTheme;
  try { const saved = localStorage.getItem("aura-theme"); if (saved && T.themes[saved]) theme = saved; } catch {}
  function setTheme(t) {
    theme = t;
    document.documentElement.className = t === T.defaultTheme ? "" : "theme-" + t;
    $$(".tbtn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.theme === t)));
    try { localStorage.setItem("aura-theme", t); } catch {}
    renderColor();
  }
  $$(".tbtn").forEach((b) => b.addEventListener("click", () => setTheme(b.dataset.theme)));

  // ---- Color ----
  const GROUPS = [
    ["Surfaces", ["bg", "panel", "row", "cell", "cellNow", "overlay"]],
    ["Lines", ["line", "lineStrong", "lineHover", "progressBuffer"]],
    ["Text", ["text", "soft", "muted", "mutedOnCell", "ghost", "ink"]],
    ["Signal", ["focus", "focusDim", "live", "ok", "warn", "danger", "info"]],
  ];
  function renderColor() {
    const c = T.themes[theme].color, hex = A.hex[theme];
    $("#swatches").innerHTML = GROUPS.map(([g, keys]) => `<div class="sw-group"><h3>${g}</h3><div class="sw-grid">${keys.map((k) => {
      const v = c[k], translucent = v.value.includes("/");
      return `<button class="sw" data-copy="var(--${kebab(k)})" title="Copy var(--${kebab(k)})"><span class="sw-chip${translucent ? " checker" : ""}"><i style="background:var(--${kebab(k)})"></i></span>
        <span class="sw-body"><span class="sw-name">${k}</span><span class="sw-val">${esc(v.value)}</span><span class="sw-val">${hex[k]}</span><span class="sw-use">${esc(v.use)}</span>${v.derived ? '<span class="sw-tag">derived</span>' : ""}</span></button>`;
    }).join("")}</div></div>`).join("");
    $("#contrast").innerHTML = `<thead><tr><th>Sample</th><th>Text on surface</th><th>Ratio</th><th>Use</th></tr></thead><tbody>` +
      A.contrast[theme].map((p) => `<tr><td><span class="spec" style="color:var(--${kebab(p.fg)});background:var(--${kebab(p.bg)})">Aa 08:30</span></td>
        <td class="mono">${p.fg} / ${p.bg}</td><td class="r">${p.ratio}:1 ${p.min ? '<span class="pass">✓</span>' : '<span class="dim">deco</span>'}</td><td>${esc(p.use)}</td></tr>`).join("") + "</tbody>";
  }

  // ---- Type ----
  const SAMPLE = { display: "AURA", headline: "Noir Classics Radio", body: "Pictures lead. Chrome stays quiet so the artwork can speak.", label: "Explicit filter", button: "Play", tab: "My collection", mono: "08:30 · 2160P · 14.2 GB" };
  $("#roles").innerHTML = Object.entries(T.typeRoles).map(([k, v]) =>
    `<div class="role"><b>${k}</b><span class="spec" style="font:var(--type-${k});letter-spacing:var(--tracking-${k});${["label","button","tab","display"].includes(k) ? "text-transform:uppercase" : ""}">${SAMPLE[k]}</span><span>${esc(v.value)}</span></div>`).join("");
  $("#tvscale").innerHTML = Object.entries(T.type).map(([k, v]) =>
    `<div class="ts"><b><em>${k}</em> ${v.value}</b><span style="font-size:calc(${v.value} / 2)">${+v.value.replace("px", "") >= 68 ? "Falcon" : "The Maltese Falcon"}</span></div>`).join("");

  // ---- Space ----
  const bar = (k, v, max) => `<div class="st"><b>${k}</b><span>${v.value}</span><i style="width:${(parseFloat(v.value) / max) * 100}%"></i></div>`;
  const steps = Object.entries(T.space).filter(([k]) => /^s\d+$/.test(k)), gaps = Object.entries(T.space).filter(([k]) => !/^s\d+$/.test(k));
  $("#steps").innerHTML = steps.map(([k, v]) => bar(k, v, 80)).join("");
  $("#gaps").innerHTML = gaps.map(([k, v]) => bar(k, v, 80).replace("</div>", `<small>${esc(v.use)}</small></div>`)).join("");

  // ---- Motion ----
  const EASE = { pressMs: "ease", fadeMs: "ease-out", focusMs: "ease-out", bannerInMs: "ease-out", scrollMs: "ease-in-out", slideMs: "ease-out", screenFadeMs: "ease-in-out", bannerOutMs: "ease-in", cubeTurnYMs: "linear", cubeTurnXMs: "linear", loadDelayMs: "linear", glideMs: "ease-in-out", sweepMs: "linear", bannerHoldMs: "linear", pulseMs: "ease-in-out" };
  $("#motiongrid").innerHTML = Object.entries(T.motion).map(([k, v]) =>
    `<button class="mt" style="--d:${v.value};--e:${EASE[k] || "ease-out"}"><em>${parseInt(v.value)}</em><b>${k}</b><span>${esc(v.use)}</span><span class="trk"><i></i></span></button>`).join("");

  // ---- Cube spinner: AURA.p's spinner, drawn on a canvas ----
  // The cube's 12 edges turn about Y (cubeTurnYMs) and X (cubeTurnXMs, from a 0.5 rad tilt) in perspective from 4.5
  // half-sides away; far edges at 22% opacity, near ones full and the near half under the glow.
  const CORNERS = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  const EDGES = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  function cubeEdges(t, side, cx, cy) {
    const a = (t * 2 * Math.PI) / (parseInt(T.motion.cubeTurnYMs.value) / 1000), b = 0.5 + (t * 2 * Math.PI) / (parseInt(T.motion.cubeTurnXMs.value) / 1000);
    const scale = side / 2 / 1.7, reach = Math.sqrt(3);
    const p = CORNERS.map(([x, y, z]) => {
      const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
      const y2 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b), f = 4.5 / (4.5 - z2);
      return [cx + x1 * f * scale, cy - y2 * f * scale, z2];
    });
    return EDGES.map(([i, j]) => ({ a: p[i], b: p[j], near: ((p[i][2] + p[j][2]) / 2 + reach) / (2 * reach) })).sort((m, n) => m.near - n.near);
  }
  function drawCubes(now) {
    const t = still.matches ? 0.3 : now / 1000, cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue("--focus").trim(), glows = cs.getPropertyValue("--glow").split(/,(?![^(]*\))/).map((s) => s.trim());
    for (const c of $$("canvas.cube")) {
      const dpr = devicePixelRatio || 1, w = c.clientWidth, side = 40;
      if (c.width !== w * dpr) { c.width = c.height = w * dpr; }
      const g = c.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, w); g.lineCap = "round"; g.lineWidth = 1.25; g.strokeStyle = accent;
      const edges = cubeEdges(t, side, w / 2, w / 2);
      for (const s of glows) { // the near half under the glow: each glow layer is "0 0 <blur> <color>"
        const m = /0 0 ([\d.]+)px (.+)/.exec(s); if (!m) continue;
        g.save(); g.shadowBlur = +m[1]; g.shadowColor = m[2]; g.beginPath();
        for (const e of edges) if (e.near >= 0.5) { g.moveTo(e.a[0], e.a[1]); g.lineTo(e.b[0], e.b[1]); }
        g.stroke(); g.restore();
      }
      for (const e of edges) { g.globalAlpha = 0.22 + 0.78 * e.near; g.beginPath(); g.moveTo(e.a[0], e.a[1]); g.lineTo(e.b[0], e.b[1]); g.stroke(); }
      g.globalAlpha = 1;
    }
    requestAnimationFrame(drawCubes);
  }
  requestAnimationFrame(drawCubes);

  // ---- Copy a swatch's variable ----
  const toast = $(".toast"); let tt;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    navigator.clipboard?.writeText(b.dataset.copy).catch(() => {});
    toast.textContent = "Copied " + b.dataset.copy; toast.classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 1400);
  });

  // ---- TV canvas: scale 1920 wide to the box ----
  const tv = $(".tv"), tvIn = $(".tv-in");
  const fit = () => { const s = tv.clientWidth / 1920; tvIn.style.transform = `scale(${s})`; tv.style.height = tvIn.offsetHeight * s + "px"; };
  new ResizeObserver(fit).observe(tv); document.fonts?.ready.then(fit);

  // ---- Focus: hover, or arrow keys inside the TV, moves the one .focus ----
  const items = $$(".tv .f");
  const focusOn = (el) => { items.forEach((i) => i.classList.remove("focus")); el.classList.add("focus"); };
  items.forEach((el) => { el.tabIndex = -1; el.addEventListener("mouseenter", () => focusOn(el)); });
  tv.tabIndex = 0; tv.setAttribute("role", "application");
  tv.setAttribute("aria-roledescription", "TV focus demo: use the arrow keys");
  tv.addEventListener("keydown", (e) => {
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!dir) return;
    e.preventDefault();
    const cur = $(".tv .f.focus") || items[0], r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best, bd = Infinity;
    for (const el of items) {
      if (el === cur) continue;
      const q = el.getBoundingClientRect(), dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy;
      if ((dir[0] && Math.sign(dx) !== dir[0]) || (dir[1] && Math.sign(dy) !== dir[1]) || (dir[0] && Math.abs(dy) > 60 * (tv.clientWidth / 1920) * 3 && Math.abs(dx) < Math.abs(dy))) continue;
      const d = dir[0] ? Math.abs(dx) + Math.abs(dy) * 3 : Math.abs(dy) + Math.abs(dx) * 0.6;
      if (d < bd) { bd = d; best = el; }
    }
    if (best) focusOn(best);
  });

  // ---- Nav: mark the section in view ----
  const links = $$(".nav a"), secs = links.map((a) => $(a.getAttribute("href")));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach((s) => io.observe(s));

  setTheme(theme);
})();
