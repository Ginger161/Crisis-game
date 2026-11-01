/* CRISIS — animated pixel environments (160 x 90 grid), side-view people standing ON the floor.
   Palette (from the designer): buildings orange #f6b37f, cream #f2ebcf. Crest = pixel version of the real logo (emblem.js).
   Everybody has a ground line: they stand on it, sit on chairs, sit on the floor, kneel, lie on beds, or jump on a mattress. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const PAL = {
  cream: '#f2ebcf', creamD: '#d0cab2', creamDD: '#a5a08d', orange: '#f6b37f', orangeD: '#c58f66', orangeDD: '#8f6648',
  green: '#1f6b4a', white: '#efe9d8', night: '#0c1124', amber: '#ffd070', wood: '#4a3626', woodD: '#33241a', floor: '#3a2e26', floorD: '#271e18', steel: '#7a828a'
};
const CSS = `
.sc{width:100%;height:auto;display:block;image-rendering:pixelated}
.flick{animation:flick 1.3s steps(1,end) infinite}
@keyframes flick{0%{opacity:.55}15%{opacity:.85}30%{opacity:.6}45%{opacity:1}60%{opacity:.7}75%{opacity:.9}100%{opacity:.55}}
.twinkle{animation:tw 3s steps(1,end) infinite}.twinkle.b{animation-delay:1.1s}.twinkle.c{animation-delay:2.2s}
@keyframes tw{0%{opacity:1}50%{opacity:.2}100%{opacity:1}}
.wR{animation:wR var(--t,14s) steps(64,end) infinite}.wL{opacity:0;animation:wL var(--t,14s) steps(64,end) infinite}
@keyframes wR{0%{transform:translateX(0);opacity:1}48%{transform:translateX(var(--d,60px));opacity:1}49%,100%{transform:translateX(var(--d,60px));opacity:0}}
@keyframes wL{0%,50%{transform:translateX(var(--d,60px));opacity:0}51%{transform:translateX(var(--d,60px));opacity:1}99%{transform:translateX(0);opacity:1}100%{transform:translateX(0);opacity:0}}
.ember{animation:ember 2s steps(1,end) infinite}@keyframes ember{0%{transform:translateY(0);opacity:1}50%{transform:translateY(-2px);opacity:.6}100%{transform:translateY(-4px);opacity:0}}
.blink{animation:bl 1.6s steps(1,end) infinite}@keyframes bl{0%{opacity:1}60%{opacity:.15}100%{opacity:1}}
@media (prefers-reduced-motion:reduce){.flick,.twinkle,.wR,.wL,.ember,.blink{animation:none}.wL{opacity:0}}`;
let cssAdded = false;
function ensureCSS() { if (cssAdded || typeof document === 'undefined') return; cssAdded = true; const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }
const SP = () => C.Sprites, SD = () => C.Side;
const mk = () => { let o = ''; return { R: (x, y, w, h, c, a) => { o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${a ? ' ' + a : ''}/>`; }, add: (s) => { o += s; }, get: () => o }; };
const GLOWDEF = '<radialGradient id="glw"><stop offset="0" stop-color="#ffb040" stop-opacity=".75"/><stop offset=".55" stop-color="#ff9a30" stop-opacity=".22"/><stop offset="1" stop-color="#ff9a30" stop-opacity="0"/></radialGradient>';
const wrap = (inner, defs, extra) => `<svg class="sc" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><defs>${GLOWDEF}${defs || ''}</defs>${inner}${extra || ''}</svg>`;
const hash = (n) => { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return Math.abs(n); };

/* ---------- emblem (pixel version of the real crest) ---------- */
function emblemRects(x, y, sc) {
  const E = C.EMBLEM; if (!E) return '';
  let o = '';
  E.rows.forEach((row, j) => { let i = 0; while (i < row.length) { const ch = row[i]; if (ch === '.') { i++; continue; } let w = 1; while (i + w < row.length && row[i + w] === ch) w++; o += `<rect x="${x + i * sc}" y="${y + j * sc}" width="${w * sc}" height="${sc}" fill="${E.pal[+ch]}"/>`; i += w; } });
  return o;
}
function emblem(scale) {
  const E = C.EMBLEM; const s = scale || 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${E.w} ${E.h}" width="${E.w * s}" height="${E.h * s}" shape-rendering="crispEdges">${emblemRects(0, 0, 1)}</svg>`;
}
/* ---------- shared pieces ---------- */
const FLOOR = 76;
function room(b, o) {
  o = o || {}; const R = b.R;
  R(0, 0, 160, 90, '#0a0807');
  R(6, 4, 148, FLOOR - 4, o.wall || PAL.cream); R(6, 4, 148, 4, PAL.creamD);
  if (o.dado !== false) { R(6, 46, 148, FLOOR - 46, o.dadoC || PAL.orange); R(6, 46, 148, 2, PAL.creamD); R(6, FLOOR - 3, 148, 3, PAL.orangeD); }
  R(6, FLOOR, 148, 14, o.floor || PAL.floor);
  for (let x = 6; x < 154; x += 12) R(x, FLOOR, 1, 14, PAL.floorD); R(6, FLOOR + 6, 148, 1, PAL.floorD);
  if (o.cracks !== false) [[70, 12, 1, 7], [71, 18, 2, 1], [73, 19, 1, 6], [30, 10, 1, 5], [140, 52, 1, 6]].forEach((c) => R(c[0], c[1], c[2], c[3], PAL.creamDD));
}
function glow(b, x, y, r, delay) { b.add(`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.75}" fill="url(#glw)" class="flick" style="mix-blend-mode:screen${delay ? ';animation-delay:' + delay + 's' : ''}"/>`); }
function dark(b, a) { b.add(`<rect width="160" height="90" fill="#080c1e" opacity="${a}"/>`); }
function vig(b, id, cx, cy, a) { b.add(`<rect width="160" height="90" fill="url(#${id})"/>`); return `<radialGradient id="${id}" cx="${cx}%" cy="${cy}%" r="78%"><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#03030a" stop-opacity="${a}"/></radialGradient>`; }
const place = (sp, kind, x, g, o) => SD().place(sp, kind, x, g, o);
/* A walker goes one way facing that way, turns round, and comes back facing the other way. Never moonwalks.
   Pass {backwards:true} only for a dramatic moment (someone backing away from danger). */
const walker = (sp, kind, x, g, o) => { o = o || {}; const st = `--d:${o.dist || 60}px;--t:${o.secs || 14}s`; return `<g class="wR" style="${st}">${place(sp, kind, x, g, Object.assign({}, o, { dir: 1 }))}</g><g class="wL" style="${st}">${place(sp, kind, x, g, Object.assign({}, o, { dir: o.backwards ? 1 : -1 }))}</g>`; };
const chair = (b, x, g, dir) => { const R = b.R, d = dir === -1 ? -1 : 1; const bx = d === 1 ? x - 6 : x + 5; R(x - 5, g - 9, 10, 2, PAL.wood); R(bx, g - 19, 2, 12, PAL.woodD); R(x - 4, g - 7, 1, 7, PAL.woodD); R(x + 3, g - 7, 1, 7, PAL.woodD); };
const fan = (b, x, y) => { b.R(x, 8, 1, y - 8, PAL.woodD); b.add(`<g class="blink"><rect x="${x - 7}" y="${y}" width="15" height="1" fill="#2a2a2a"/></g>`); };

/* where each pose happens in the shelter: bunks to lie on, chairs to sit on, a mat to kneel on, floor to stand on */
function layout(ppl, bd) {
  bd = bd || {}; const matG = bd.bed ? 72 : 76; const used = {}; const stand = [72, 92, 116, 144, 60, 32]; const chairs = [98, 54, 124]; const floorSit = [124, 112, 146];
  return ppl.map((p, i) => {
    let kind = p.kind, x = null, g = FLOOR, dir = 1, prop = null; const free = (k) => !used[k];
    if (kind === 'sleep' || kind === 'dead') { if (free('low')) { used.low = 1; x = 80; g = 60; } else if (free('top')) { used.top = 1; x = 80; g = 40; } else if (free('mat')) { used.mat = 1; x = 50; g = matG; prop = 'mat'; } else { x = 40 + i * 14; } }
    else if (kind === 'jump') { if (free('mat')) { used.mat = 1; x = 50; g = bd.bed ? 72 : 73; prop = 'mat'; } else { kind = 'idle'; } }
    else if (kind === 'sit') { const c = chairs.findIndex((cx, ci) => free('c' + ci)); if (c >= 0) { used['c' + c] = 1; x = chairs[c]; prop = 'chair' + c; } else kind = 'sitfloor'; }
    if (kind === 'sitfloor') { const k = floorSit.findIndex((f, fi) => free('f' + fi)); const kk = k < 0 ? 0 : k; used['f' + kk] = 1; x = floorSit[kk]; dir = -1; }
    else if (kind === 'pray') { x = 26; prop = 'prayer'; }
    if (x == null) { const k = stand.findIndex((q, si) => free('s' + si)); const kk = k < 0 ? 0 : k; used['s' + kk] = 1; x = stand[kk]; dir = kk % 2 ? -1 : 1; }
    return { x, g, kind, dir, prop };
  });
}
/* tappable things in the shelter (scene coordinates). x = where a person stands to use it. */
const HOT = {
  radio: { rect: [117, 52, 12, 11], x: 121 }, bed: { rect: [60, 36, 40, 30], x: 76 }, table: { rect: [104, 56, 30, 10], x: 112 }, stove: { rect: [134, 52, 16, 24], x: 132 },
  window: { rect: [106, 12, 42, 28], x: 124 }, cupboard: { rect: [40, 46, 22, 30], x: 50 }, poster: { rect: [44, 6, 26, 30], x: 56 }, door: { rect: [8, 28, 32, 48], x: 26 }, mat: { rect: [12, 70, 28, 8], x: 26 }
};

/* ---------- 1. The shelter (your hostel room) ---------- */
/* model: { people:[{sp,kind,state}], build:{barricade,stove,bed,bucket,radio,still}, tone:0..1 darkness } */
function shelter(m) {
  ensureCSS(); const b = mk(), R = b.R, bd = m.build || {};
  room(b, {});
  /* window with boards */
  R(112, 14, 30, 26, '#16223c'); R(114, 16, 26, 22, '#1d2e52'); R(126, 14, 1, 26, '#0a0807');
  const planks = Math.min(5, 1 + (bd.barricade || 0) * 1.4);
  for (let i = 0; i < planks; i++) R(109, 17 + i * 5, 36, 3, i % 2 ? PAL.woodD : PAL.wood);
  /* door */
  R(12, 30, 24, FLOOR - 30, '#5a3f2a'); R(14, 32, 20, FLOOR - 32, '#6a4a32'); R(32, 54, 2, 2, '#c8a050');
  if (bd.barricade) { for (let i = 0; i < 20; i++) { R(12 + i, 36 + i, 3, 3, PAL.wood); R(34 - i, 36 + i, 3, 3, PAL.woodD); } R(10, 60, 28, 4, PAL.wood); if (bd.barricade > 1) R(10, 52, 28, 3, PAL.woodD); if (bd.barricade > 2) { R(10, 44, 28, 3, PAL.wood); R(8, 66, 32, 5, PAL.woodD); } }
  /* crest poster */
  b.add(`<g transform="translate(46 8) scale(.55)">${emblemRects(0, 0, 1)}</g>`);
  /* the group's cupboard: a chest, or a proper cupboard once you have built a bigger one */
  if (bd.cupboard) { R(40, 48, 22, 28, '#5a3f2a'); R(40, 48, 22, 3, '#7a5a3c'); R(50, 51, 2, 25, '#2a1d14'); R(46, 62, 2, 3, '#c8a050'); R(54, 62, 2, 3, '#c8a050'); R(41, 54, 8, 1, '#3a2a1c'); R(53, 54, 8, 1, '#3a2a1c'); }
  else { R(42, 66, 16, 10, '#5a3f2a'); R(42, 64, 16, 3, '#7a5a3c'); R(49, 66, 2, 10, '#3a2a1c'); R(49, 69, 2, 2, '#c8a050'); R(42, 73, 16, 1, '#3a2a1c'); }
  /* bunk bed */
  R(62, 38, 3, FLOOR - 38, PAL.woodD); R(96, 38, 3, FLOOR - 38, PAL.woodD);
  R(63, 44, 35, 2, PAL.wood); R(63, 64, 35, 2, PAL.wood);
  for (let i = 0; i < 9; i++) { R(64 + i * 4, 40, 2, 4, i % 2 ? PAL.green : PAL.white); R(64 + i * 4, 60, 2, 4, i % 2 ? PAL.white : PAL.green); }
  R(64, 40, 34, 4, 'none'); R(64, 59, 34, 1, '#2a2a30'); R(64, 39, 34, 1, '#2a2a30');
  if (bd.bed) { R(40, 72, 20, 3, '#2a2a30'); for (let i = 0; i < 5; i++) R(41 + i * 4, 72, 2, 3, i % 2 ? PAL.green : PAL.white); }
  /* table + candle (+ radio) */
  R(104, 62, 28, 3, PAL.wood); R(106, 65, 2, FLOOR - 65, PAL.woodD); R(128, 65, 2, FLOOR - 65, PAL.woodD);
  R(112, 58, 2, 4, PAL.white); R(111, 61, 4, 1, PAL.creamD);
  if (bd.radio) { R(119, 58, 8, 4, '#2a2a2e'); R(120, 59, 4, 2, '#7a8a7a'); R(125, 59, 1, 1, '#d94030', 'class="blink"'); R(123, 54, 1, 4, '#8a8a90'); }
  /* stove, bucket, still */
  if (bd.stove) { R(136, 66, 10, 10, '#1d1d20'); R(136, 64, 10, 2, '#3a3a40'); R(138, 70, 6, 3, PAL.orange, 'class="flick"'); R(140, 56, 2, 8, '#3a3a40'); }
  if (bd.bucket) { R(148, 68, 6, 8, '#4a5a6a'); R(148, 68, 6, 1, '#7a8a9a'); R(150, 70, 2, 2, '#5a8ac0'); }
  if (bd.still) { R(146, 60, 6, 8, '#8a5a30'); R(150, 56, 1, 6, '#6a6a6a'); }
  /* people: drawn in place, or left empty for the tap-to-move controller (actors mode) */
  const ppl = (m.people || []).slice(0, 8);
  const cb = mk();
  const mattress = () => { R(38, 73, 24, 3, '#2a2a30'); for (let q = 0; q < 6; q++) R(39 + q * 4, 73, 2, 3, q % 2 ? PAL.green : PAL.white); };
  if (m.actors) {
    [98, 54, 124].forEach((cx) => chair(cb, cx - 3, FLOOR));
    if (!bd.bed) mattress();
    R(14, FLOOR - 1, 24, 1, '#7a3f35');
    b.add(cb.get()); b.add('<g id="actors"></g>');
  } else {
    const lay = layout(ppl, bd); const out = [];
    lay.forEach((l, i) => {
      const p = ppl[i];
      if (l.prop && l.prop.startsWith('chair')) chair(cb, l.x - 3, FLOOR);
      if (l.prop === 'prayer') R(14, FLOOR - 1, 24, 1, '#7a3f35');
      if (l.kind === 'jump' && !bd.bed) mattress();
      out.push({ g: l.g, html: place(p.sp, l.kind, l.x, l.g, { state: p.state, dir: l.dir }) });
    });
    b.add(cb.get());
    out.sort((a, c) => a.g - c.g).forEach((o) => b.add(o.html));
  }
  /* light */
  dark(b, m.tone != null ? m.tone : 0.3);
  glow(b, 113, 56, 34); if (bd.stove) glow(b, 141, 70, 16, 0.5);
  const vd = vig(b, 'vigS', 70, 66, 0.82);
  return wrap(b.get(), vd);
}

/* ---------- 2. Campus at night (exterior) ---------- */
function quad(model) {
  ensureCSS(); const b = mk(), R = b.R; model = model || {};
  R(0, 0, 160, 90, PAL.night);
  for (let i = 0; i < 20; i++) R(((i * 37) % 150) + 4, ((i * 13) % 26) + 2, 1, 1, '#d8d8c8', `class="twinkle ${['', 'b', 'c'][i % 3]}"`);
  R(0, 32, 160, 14, '#1c1b2c'); R(0, 40, 160, 10, '#4a2f35'); R(0, 46, 160, 8, '#8a5a3a'); R(0, 52, 160, 8, '#c8803a');
  R(132, 6, 8, 8, '#e8e4d0'); R(135, 6, 5, 8, PAL.night);
  R(0, 46, 36, 14, '#171320'); R(110, 44, 50, 16, '#171320');
  /* main block */
  R(26, 30, 84, 32, PAL.cream); R(24, 26, 88, 5, PAL.orange); R(24, 31, 88, 1, PAL.orangeD);
  for (let i = 0; i < 6; i++) R(30 + i * 14, 32, 3, 30, PAL.orange);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { const lit = (i * 3 + r * 5 + (model.seed || 0)) % 4 === 0; R(36 + i * 14, 36 + r * 12, 7, 8, lit ? PAL.amber : '#26242e', lit ? 'class="flick"' : ''); R(36 + i * 14, 40 + r * 12, 7, 1, PAL.cream); }
  R(62, 48, 11, 14, '#2a2024');
  b.add(`<g transform="translate(66 6) scale(.5)">${emblemRects(0, 0, 1)}</g>`);
  /* second block with orange roof */
  R(114, 34, 32, 28, PAL.cream); R(112, 30, 36, 5, PAL.orange); R(114, 35, 32, 1, PAL.orangeD);
  for (let i = 0; i < 3; i++) { R(118 + i * 9, 40, 6, 7, '#26242e'); R(118 + i * 9, 51, 6, 7, i === 1 ? PAL.amber : '#26242e', i === 1 ? 'class="flick"' : ''); }
  /* ground, road, fence (posts stand on the ground) */
  R(0, 62, 160, 28, '#17120f'); R(0, 62, 160, 1, '#241c16'); R(0, 72, 160, 1, '#1f1812'); R(0, 83, 160, 1, '#1f1812');
  for (let x = 2; x < 160; x += 6) R(x, 54, 1, 9, '#0e0e12'); R(0, 56, 160, 1, '#1a1a1e'); for (let x = 0; x < 160; x += 3) R(x, 53 + (x % 2), 1, 1, '#3a3a40');
  [[8, 44], [150, 42]].forEach(([x, y]) => { R(x, y, 3, 20, '#0c0a08'); R(x - 8, y - 12, 19, 14, '#0f1a12'); R(x - 5, y - 16, 13, 6, '#0f1a12'); });
  /* fire barrel with bandits around it (sitting, standing, one on watch) */
  const fx = 118, fg = 76;
  R(fx - 3, fg - 9, 7, 9, '#2a2a2e'); R(fx - 3, fg - 9, 7, 1, '#4a4a4e'); R(fx - 1, fg - 13, 3, 4, PAL.orange, 'class="flick"'); R(fx, fg - 15, 1, 2, PAL.amber, 'class="ember"');
  const sp = (a, s) => SP().gen(a, s), people = [];
  people.push({ g: fg, h: place(sp('bandit_soldier', 21), 'sitfloor', 100, fg, { dir: 1 }) });
  people.push({ g: fg, h: place(sp('bandit_heavy', 7), 'sit', 134, fg, { dir: -1 }) });
  people.push({ g: 70, h: place(sp('bandit_scout', 4), 'idle', 84, 70, { s: 0.85 }) });
  people.push({ g: 66, h: walker(sp('bandit_soldier', 11), 'walk', 20, 66, { s: 0.7, state: 'ok', dist: 70, secs: 18 }) });
  people.push({ g: 82, h: place(sp(model.a || 'guard', model.as || 5), 'idle', 44, 84, { dir: 1 }) });
  people.push({ g: 84, h: place(sp(model.b || 'sister', model.bs || 2), 'pray', 70, 86) });
  chair(b, 131, fg, -1);
  people.sort((a, c) => a.g - c.g).forEach((p) => b.add(p.h));
  b.add(`<ellipse cx="${fx}" cy="${fg - 10}" rx="26" ry="18" fill="url(#glw)" class="flick" style="mix-blend-mode:screen"/>`);
  const vd = vig(b, 'vigQ', 50, 60, 0.7);
  return wrap(b.get(), vd);
}

/* ---------- 3. A location you scavenge (interior or exterior, by building type) ---------- */
function kindProps(b, kind, name) {
  const R = b.R;
  switch (kind) {
    case 'hostel':
      for (let i = 0; i < 6; i++) { const x = 14 + i * 24; R(x, 28, 14, FLOOR - 28, '#6a4a32'); R(x + 1, 29, 12, FLOOR - 29, '#7a5a3e'); R(x + 10, 52, 2, 2, '#c8a050'); R(x + 3, 24, 8, 3, PAL.creamDD); }
      R(98, 28, 14, FLOOR - 28, '#16120f'); R(99, 29, 12, FLOOR - 29, '#ffd070', 'class="flick" opacity=".55"');
      R(10, 20, 140, 1, '#6a5a3a'); [[24, 21], [60, 21], [96, 21]].forEach(([x, y]) => R(x, y, 6, 8, '#8a7a5a')); break;
    case 'cafe':
      R(20, 36, 120, 22, PAL.orangeD); R(20, 34, 120, 3, PAL.cream); R(26, 40, 40, 14, '#16120f'); R(26, 40, 40, 5, '#4a4a4e');
      for (let i = 0; i < 3; i++) { const x = 40 + i * 40; R(x, 64, 24, 3, PAL.wood); R(x + 2, 67, 2, FLOOR - 67, PAL.woodD); R(x + 20, 67, 2, FLOOR - 67, PAL.woodD); R(x, 70, 24, 1, PAL.woodD); }
      R(112, 40, 8, 12, '#2a2a2e'); R(122, 44, 12, 8, '#3a3a40'); break;
    case 'class':
      R(24, 22, 60, 22, '#1f3a2a'); R(24, 22, 60, 1, PAL.wood); R(26, 44, 56, 1, PAL.wood); R(30, 28, 20, 1, '#cfd8d0'); R(30, 32, 28, 1, '#cfd8d0'); R(30, 36, 14, 1, '#cfd8d0');
      for (let i = 0; i < 3; i++) { const x = 40 + i * 34; R(x, 64, 18, 2, PAL.wood); R(x + 2, 66, 2, FLOOR - 66, PAL.woodD); R(x + 14, 66, 2, FLOOR - 66, PAL.woodD); R(x - 2, 56, 2, 10, PAL.woodD); }
      fan(b, 100, 14); R(122, 28, 18, 14, '#16223c'); break;
    case 'hall':
      R(10, 14, 22, 62, '#7a2a2a'); R(10, 14, 22, 4, '#a84a3a'); for (let i = 0; i < 5; i++) R(14 + i * 4, 18, 1, 58, '#5a1c1c');
      for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) R(60 + i * 14 + r * 3, 40 + r * 8, 10, 3, PAL.wood);
      R(36, 70, 20, 1, '#6a6a5a'); break;
    case 'clinic':
      for (let i = 0; i < 2; i++) { const x = 30 + i * 52; R(x, 62, 30, 3, '#ddd8c8'); R(x, 60, 30, 2, '#9a96a0'); R(x + 1, 65, 2, FLOOR - 65, PAL.steel); R(x + 27, 65, 2, FLOOR - 65, PAL.steel); }
      R(112, 24, 22, 40, '#d8d8d0'); R(121, 30, 4, 12, '#b8402f'); R(117, 34, 12, 4, '#b8402f'); R(110, 28, 1, 36, PAL.steel); R(108, 28, 6, 1, PAL.steel); R(109, 30, 2, 5, '#9bd0e0'); break;
    case 'chapel':
      for (let i = 0; i < 3; i++) { const x = 14 + i * 20; R(x, 14, 12, 24, '#1b2a50'); R(x + 5, 14, 2, 24, '#0c0a09'); R(x, 24, 12, 2, '#0c0a09'); R(x + 1, 16, 4, 6, i % 2 ? '#2f7a4a' : '#b8402f'); R(x + 7, 28, 4, 6, '#d8b040'); }
      R(88, 30, 3, 36, PAL.white); R(82, 38, 15, 3, PAL.white); R(76, 62, 28, 3, PAL.white); R(78, 65, 24, FLOOR - 65, PAL.woodD); R(70, 52, 2, 10, PAL.white); R(108, 52, 2, 10, PAL.white);
      for (let i = 0; i < 8; i++) R(116 + i * 4, 18, 4, 28, i % 2 ? PAL.green : PAL.white);
      for (let r = 0; r < 2; r++) { R(8 + r * 26, 68, 22, 3, PAL.wood); R(8 + r * 26, 64, 2, 4, PAL.woodD); R(10 + r * 26, 71, 2, FLOOR - 71, PAL.woodD); R(26 + r * 26, 71, 2, FLOOR - 71, PAL.woodD); }
      glow(b, 71, 50, 12); glow(b, 109, 50, 12, 0.4); break;
    case 'library':
      for (let i = 0; i < 3; i++) { const x = 12 + i * 22; R(x, 24, 16, FLOOR - 24, PAL.woodD); for (let r = 0; r < 4; r++) { R(x + 1, 28 + r * 12, 14, 1, PAL.wood); for (let k = 0; k < 6; k++) R(x + 2 + k * 2, 22 + r * 12 + 6 - (k % 3), 1, 5 + (k % 3), ['#7a3f35', '#2d5fa0', '#4d5a4a', '#8a7a5a'][(k + r) % 4]); } }
      for (let i = 0; i < 2; i++) { const x = 84 + i * 30; R(x, 62, 22, 3, PAL.wood); R(x + 2, 65, 2, FLOOR - 65, PAL.woodD); R(x + 18, 65, 2, FLOOR - 65, PAL.woodD); R(x + 5, 50, 12, 10, '#16120f'); R(x + 6, 51, 10, 8, '#0e1a22'); R(x + 9, 60, 4, 2, '#2a2a2e'); }
      R(140, 30, 10, 46, '#2a2e34'); for (let i = 0; i < 6; i++) R(142, 34 + i * 6, 6, 2, '#16190c'), R(146, 35 + i * 6, 1, 1, '#60d060', 'class="blink"'); break;
    case 'admin':
      R(30, 62, 40, 3, PAL.wood); R(32, 65, 3, FLOOR - 65, PAL.woodD); R(64, 65, 3, FLOOR - 65, PAL.woodD); R(44, 58, 14, 4, '#2a2a2e');
      R(96, 36, 16, 40, PAL.steel); R(96, 36, 16, 2, '#9aa2aa'); for (let i = 0; i < 3; i++) R(98, 42 + i * 10, 12, 1, '#4a525a');
      b.add(`<g transform="translate(120 20) scale(.4)">${emblemRects(0, 0, 1)}</g>`); break;
  }
}
function exteriorProps(b, kind) {
  const R = b.R;
  R(0, 0, 160, 90, PAL.night); for (let i = 0; i < 16; i++) R(((i * 41) % 150) + 4, ((i * 17) % 34) + 2, 1, 1, '#d8d8c8', `class="twinkle ${['', 'b', 'c'][i % 3]}"`);
  R(0, 44, 160, 10, '#1c1b2c'); R(0, 52, 160, 8, '#6a3f35'); R(0, 58, 160, 6, '#c8803a'); R(130, 8, 8, 8, '#e8e4d0'); R(133, 8, 5, 8, PAL.night);
  R(0, 64, 160, 26, kind === 'gate' ? '#1a1612' : '#121a12'); R(0, 64, 160, 1, '#0c0a08');
  if (kind === 'field') {
    for (let x = 12; x < 160; x += 50) { R(x, 22, 2, 42, '#14141a'); R(x - 4, 20, 10, 3, '#14141a'); }
    R(80, 38, 2, 26, '#d8d8d0'); R(112, 38, 2, 26, '#d8d8d0'); R(80, 38, 34, 2, '#d8d8d0'); for (let x = 82; x < 112; x += 3) R(x, 40, 1, 10, '#8a8a84');
    R(0, 76, 160, 1, '#1d2a1d'); R(0, 80, 160, 1, '#1d2a1d');
  } else if (kind === 'gate') {
    R(30, 38, 26, 26, PAL.cream); R(28, 34, 30, 5, PAL.orange); R(34, 44, 8, 8, '#26242e'); R(44, 44, 8, 8, PAL.amber, 'class="flick"');
    R(70, 56, 80, 3, '#d8d8d0'); for (let i = 0; i < 8; i++) R(70 + i * 10, 56, 5, 3, '#b8402f'); R(66, 50, 4, 14, '#2a2a2e');
    R(104, 52, 36, 12, '#2a2020'); R(108, 46, 24, 8, '#1e1818'); R(106, 60, 8, 4, '#0a0808'); R(130, 60, 8, 4, '#0a0808'); R(112, 44, 4, 3, '#b8402f', 'class="flick"');
    for (let x = 0; x < 160; x += 6) R(x, 48, 1, 16, '#0e0e12'); for (let x = 0; x < 160; x += 3) R(x, 46 + (x % 2), 1, 1, '#3a3a40');
  } else R(20, 38, 120, 26, PAL.cream);
}
/* opts: { kind, name, scav:{sp,state,kind}, group:{att,size,alive,id,hostile?}, patrol:boolean, tone } */
function location(o) {
  ensureCSS(); const b = mk(), R = b.R; const kind = o.kind || 'hostel';
  const ext = kind === 'field' || kind === 'gate';
  if (ext) exteriorProps(b, kind); else { room(b, {}); kindProps(b, kind, o.name); }
  const GR = ext ? 78 : FLOOR; const people = [];
  const sp = (a, s) => SP().gen(a, s);
  const g = o.group;
  if (g) {
    const n = Math.min(4, Math.max(1, g.size || 2)); const seedBase = (g.id || 1) * 100;
    for (let i = 0; i < n; i++) {
      const x = 98 + i * 15 + (i % 2) * 3;
      const named = g.faces && g.faces[i];
      if (named && g.alive) { const face = Object.assign({}, named); const hostile = g.att === 'hostile' || g.att === 'predatory'; if (hostile) face.item = face.item || 'ak'; people.push({ g: GR, h: place(face, hostile ? (i % 2 ? 'aim' : 'idle') : g.att === 'desperate' ? (i % 2 ? 'sitfloor' : 'idle') : 'idle', x, GR, { dir: -1, state: g.att === 'desperate' ? (i % 2 ? 'starving' : 'hungry') : 'ok' }) }); continue; }
      const kid = i === n - 1 && n > 1 && hash(seedBase) % 100 < 18;   // rare, and always an NPC
      if (kid && g.alive) { people.push({ g: GR, h: place(sp(['kid_boy', 'kid_girl'][hash(seedBase) % 2], seedBase + i), g.att === 'desperate' ? 'sitfloor' : 'idle', x, GR, { dir: -1, state: g.att === 'desperate' ? 'starving' : 'hungry' }) }); continue; }
      if (!g.alive) { people.push({ g: GR, h: place(sp(['refugee', 'boy_hoodie', 'girl_braids', 'mother'][i % 4], seedBase + i), 'dead', x - 30 + i * 12, GR, { state: 'dead' }) }); continue; }
      if (g.att === 'hostile' || g.att === 'predatory') people.push({ g: GR, h: place(sp(i === 0 && g.att === 'predatory' ? 'bandit_boss' : ['bandit_soldier', 'bandit_heavy', 'bandit_kid', 'bandit_queen'][i % 4], seedBase + i), i % 2 ? 'aim' : 'idle', x, GR, { dir: -1 }) });
      else if (g.att === 'desperate') people.push({ g: GR, h: place(sp(['refugee', 'girl_braids', 'boy_hoodie', 'mother'][i % 4], seedBase + i), i % 2 ? 'sitfloor' : 'idle', x, GR, { dir: -1, state: i % 2 ? 'starving' : 'hungry' }) });
      else people.push({ g: GR, h: place(sp(['boy_gym', 'girl_natural', 'boy_hoodie', 'girl_church'][i % 4], seedBase + i), g.att === 'friendly' ? 'idle' : 'idle', x, GR, { dir: -1, state: 'ok' }) });
    }
  }
  if (o.patrol) { people.push({ g: GR - 2, h: walker(sp('bandit_soldier', 41), 'walk', 12, GR - 2, { s: 0.8, dist: 70, secs: 18 }) }); people.push({ g: GR - 2, h: walker(sp('bandit_scout', 43), 'walk', 26, GR - 2, { s: 0.8, dist: 70, secs: 18 }) }); }
  if (o.scav) { const sc = o.scav; people.push({ g: GR + 1, h: place(sc.sp, sc.kind || 'sneak', sc.x || 20, GR + 1, { state: sc.state, dir: 1 }) }); if (sc.torch) glow(b, (sc.x || 20) + 6, GR - 14, 18); }
  people.sort((a, c) => a.g - c.g).forEach((p) => b.add(p.h));
  dark(b, o.tone != null ? o.tone : 0.45);
  if (!ext) glow(b, 103, 40, 22);
  const vd = vig(b, 'vigL', 40, 66, 0.84);
  return wrap(b.get(), vd);
}

function roomInner(kind) { ensureCSS(); const b = mk(); if (kind === 'field' || kind === 'gate') exteriorProps(b, kind); else { room(b, {}); kindProps(b, kind, ''); } return b.get(); }
C.Scenes = { shelter, quad, location, walker, emblem, emblemRects, layout, HOT, FLOOR, PAL, ensureCSS, roomInner, GLOWDEF };
if (typeof module !== 'undefined') module.exports = C.Scenes;
})(typeof window !== 'undefined' ? window : globalThis);
