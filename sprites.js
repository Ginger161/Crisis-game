/* CRISIS — pixel character engine
   Every person is a small spec (body, hair, clothes, gear, state) turned into animated SVG.
   Animation is pure CSS frame-swapping, so it stays crisp and costs no JS at runtime.
   Same seed -> same person, so a saved game can always redraw the same survivor. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};

/* ---------- helpers ---------- */
const has = (sp, k) => String(sp.state || '').split('+').includes(k);
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const toHex = (a) => '#' + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const shade = (h, f) => toHex(hex(h).map((v) => v * f));
const tint = (h, t, k) => { const a = hex(h), b = hex(t); return toHex(a.map((v, i) => v * (1 - k) + b[i] * k)); };
function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- palettes ---------- */
const SKIN = ['#d9a273', '#c68a5c', '#a8714a', '#8d5a3b', '#6b4429', '#4a2e1c', '#3a2314'];
const HAIRC = ['#0f0b08', '#1a120c', '#2a1b12'];
const GREY = '#b8b4aa';
const TEE = ['#6b4f3a', '#4d5a4a', '#5a4a58', '#7a6a4a', '#3f4f5f', '#7a3f35', '#58584a', '#8a7a5a', '#44505a', '#a04a2a', '#2f2f34', '#6a6a6a'];
const VIV = ['#c8832b', '#2f7a4a', '#b8402f', '#2d5fa0', '#8a3a8a', '#d8b040', '#1f7a3d'];
const DARK = ['#1d1d20', '#24201c', '#1a2028'];
const DENIM = ['#33465e', '#2c3a4e', '#3d4f68'];
const KHAKI = ['#8a7a58', '#7a6c4c', '#9a8a68'];
const WHITE = '#ece6d6';
const CAMO = [['#4a5a3a', '#3a4430', '#6a6a48'], ['#5a5a40', '#3e4a34', '#7a7458'], ['#3a4a3a', '#2c382c', '#566048']];
const NAMES_M = ['Tunde', 'Emeka', 'Bashir', 'Segun', 'Obinna', 'Kelechi', 'Femi', 'Musa', 'Ibrahim', 'Yemi', 'Danjuma', 'Uche', 'Seyi', 'Nnamdi', 'Tobi', 'Ekene', 'Dele', 'Gbenga', 'Chinedu', 'Sani'];
const NAMES_F = ['Chidera', 'Amina', 'Ngozi', 'Ifeoma', 'Hauwa', 'Zainab', 'Blessing', 'Adaeze', 'Chiamaka', 'Halima', 'Aisha', 'Rahila', 'Dami', 'Ada', 'Funke', 'Nkechi', 'Folake', 'Maryam', 'Ujunwa', 'Temi'];

/* ---------- body geometry (20 x 28 grid, feet on row 26) ---------- */
function geom(sp) {
  const f = sp.sex === 'f', b = sp.body;
  if (b === 'child') return { hy: 10, ty: 16, th: 5, tw: 8, ly: 21, lw: 3, ah: 4 };
  if (b === 'teen') return { hy: 5, ty: 12, th: 7, tw: 8, ly: 19, lw: 3, ah: 6 };
  const tw = sp.build === 'broad' ? 12 : (f ? 8 : 10);
  const g = { hy: 3, ty: 10, th: 8, tw, ly: 18, lw: tw >= 12 ? 5 : (tw >= 10 ? 4 : 3), ah: 7 };
  if (b === 'elder') { g.hy = 4; g.ty = 11; g.th = 7; g.ah = 6; }
  return g;
}

/* ---------- one animation frame -> svg rects ---------- */
function drawFrame(sp, fr) {
  const isDead = has(sp, 'dead') || !!fr.dead;
  const GORE = !(C.Settings && C.Settings.v && C.Settings.v.gore === false); const RED = GORE ? '#8a1f18' : '#efe9d8', RED2 = GORE ? '#7a1a14' : '#efe9d8';
  const out = [];
  const R = (x, y, w, h, c) => { if (w > 0 && h > 0) out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`); };
  const RC = (x, y, w, h, c) => {
    if (!sp.camo) { R(x, y, w, h, c); return; }
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const k = (((x + i) * 7) + ((y + j) * 13) + (((x + i) >> 1) * 5)) % 7; R(x + i, y + j, 1, 1, k < 3 ? sp.camo[0] : k < 5 ? sp.camo[1] : sp.camo[2]); }
  };
  const g = geom(sp), GROUND = 26;
  const d = fr.drop || 0, bob = fr.bob || 0, hb = bob + d;
  const hy = g.hy + hb + (fr.hunch || 0) + (has(sp, 'starving') ? 1 : 0), ty = g.ty + hb;
  const x0 = 10 - g.tw / 2, tw = g.tw, lw = g.lw;
  let skin = has(sp, 'sick') ? tint(sp.skin, '#6f8a4a', 0.3) : sp.skin;
  if (has(sp, 'starving')) skin = tint(skin, '#8a8a64', 0.34); else if (has(sp, 'hungry')) skin = tint(skin, '#8a8a64', 0.14);
  if (isDead) skin = tint(skin, '#9aa0a0', 0.28);
  const sd = shade(skin, 0.8), sdd = shade(skin, 0.55);
  const top = sp.top, bot = sp.bottom, shoe = sp.shoe || '#1a130d';
  const legY = g.ly + d;
  const longG = ['wrapper', 'robe'].includes(bot.type);

  /* back layer: backpack */
  if (sp.bag) { R(x0 - 1, ty + 1, tw + 2, 6, sp.bag); R(x0, ty - 1, tw, 2, sp.bag); }

  /* legs */
  [[10 - lw, 'L'], [10, 'R']].forEach(([lx, s]) => {
    const lift = fr['lift' + s] || 0; const h = Math.max(1, GROUND - legY + 1 - lift);
    R(lx, legY, lw, h, skin);
    if (bot.type === 'pants') RC(lx, legY, lw, h - 1, bot.c);
    else if (bot.type === 'shorts') RC(lx, legY, lw, Math.min(4, h), bot.c);
    if (!(longG && lift)) R(lx, legY + h - 1, lw, 1, shoe);
  });
  /* skirts, dresses, wrappers, robes */
  const skTop = ty + g.th - 1;
  if (['skirt', 'dress', 'wrapper', 'robe'].includes(bot.type)) {
    const end = Math.min(GROUND, bot.type === 'skirt' ? legY + 4 : bot.type === 'dress' ? legY + 6 : GROUND);
    RC(x0 - 1, skTop, tw + 2, end - skTop, bot.c);
    if (bot.type === 'wrapper' && bot.c2) for (let y = skTop + 1; y < end - 1; y += 2) for (let x = x0 + ((y % 4) ? 0 : 1); x < x0 + tw; x += 3) R(x, y, 1, 1, bot.c2);
    if (bot.type === 'robe') R(10, skTop + 1, 1, end - skTop - 1, shade(bot.c, 0.7));
  }

  /* torso */
  if (top.type === 'agbada') { RC(x0 - 2, ty, tw + 4, g.th + 3, top.c); R(x0 - 2, ty + g.th + 2, tw + 4, 1, top.c2 || shade(top.c, 0.7)); R(x0 + 2, ty, tw - 4, 3, top.c2 || shade(top.c, 0.8)); }
  else RC(x0, ty, tw, g.th, top.c);
  if (sp.chain) R(x0 + 2, ty, tw - 4, 1, '#d8b040');
  if (sp.cross) { R(9, ty + 1, 2, 1, '#d8b040'); R(9, ty + 2, 1, 2, '#d8b040'); }

  /* over-garments */
  (sp.over || []).forEach((o) => {
    switch (o.t) {
      case 'tie': R(9, ty, 2, 1, o.c); R(9, ty + 1, 2, Math.max(2, g.th - 3), shade(o.c, 0.85)); break;
      case 'collar': R(8, ty, 4, 1, o.c || WHITE); break;
      case 'apron': R(x0 + 1, ty + 2, tw - 2, g.th - 2, o.c); R(x0 + 1, ty + g.th, tw - 2, 4, o.c); R(x0, ty + 3, 1, 1, shade(o.c, 0.7)); break;
      case 'coat': R(x0 - 0, ty + g.th, tw, 4, o.c); R(10, ty + 1, 1, g.th + 3, shade(o.c, 0.7)); break;
      case 'vest': R(x0, ty, 2, g.th, o.c); R(x0 + tw - 2, ty, 2, g.th, o.c); R(x0 + 2, ty + 4, 2, 2, shade(o.c, 1.3)); R(x0 + tw - 4, ty + 4, 2, 2, shade(o.c, 1.3)); break;
      case 'belt': R(x0, ty + g.th - 1, tw, 1, o.c || '#2a1a10'); break;
      case 'stripe': R(x0, ty + 3, tw, 1, o.c); break;
      case 'badge': R(x0 + 1, ty + 2, 2, 2, o.c || '#d8b040'); break;
      case 'lanyard': R(9, ty, 1, 4, o.c || '#1f7a3d'); R(9, ty + 4, 2, 2, WHITE); break;
      case 'hoodie': R(7, ty - 1, 6, 2, o.c); R(9, ty + 1, 2, 3, shade(o.c, 0.8)); break;
      case 'scarf': R(x0, ty, tw, 2, o.c); R(x0 + tw - 3, ty + 2, 2, 3, o.c); break;
      case 'sash': for (let i = 0; i < Math.min(tw, g.th); i++) R(x0 + i, ty + i, 1, 1, o.c); break;
      case 'charms': for (let i = 0; i < 4; i++) R(x0 + 1 + i * 2, ty + 1 + (i % 2) * 2, 1, 1, i % 2 ? '#d8b040' : '#b8402f'); break;
      case 'tabard': R(x0, ty, tw, g.th, o.c); R(x0, ty + 3, tw, 1, '#d8d8d0'); break;
      case 'cross': R(9, ty + 2, 2, 1, '#e8e0c8'); R(9, ty + 1, 1, 3, '#e8e0c8'); break;
    }
  });

  if (has(sp, 'starving') && (top.sleeve === 'none' || top.type === 'shirt')) { for (let y = ty + 2; y < ty + g.th - 1; y += 2) R(x0 + 2, y, tw - 4, 1, shade(top.c, 0.7)); }
  if (has(sp, 'hungry') && !has(sp, 'starving')) R(x0 + 3, ty + g.th - 2, tw - 6, 1, shade(top.c, 0.82));
  /* arms */
  const ah = g.ah;
  [['L', x0 - 2], ['R', x0 + tw]].forEach(([s, ax]) => {
    if (fr.pray) return;
    const ay = ty + (fr['a' + s] || 0);
    R(ax, ay, 2, ah, skin); R(ax, ay + ah - 1, 2, 1, sd);
    if (top.sleeve === 'long') RC(ax, ay, 2, ah - 1, top.c); else if (top.sleeve === 'short') RC(ax, ay, 2, Math.min(3, ah), top.c);
    if (top.type === 'agbada') RC(s === 'L' ? ax - 1 : ax, ay, 3, Math.min(ah, 6), top.c);
  });
  if (fr.pray) { RC(x0 + 1, ty + 1, tw - 2, 3, top.sleeve === 'none' ? skin : top.c); R(9, ty + 1, 2, 2, skin); }

  /* held items (drawn over body) */
  const hy2 = ty + ah;
  switch (sp.item) {
    case 'ak': R(x0 - 1, ty + 4, tw + 3, 2, '#222'); R(x0 - 1, ty + 4, 3, 2, '#6b4a2a'); R(x0 + tw - 3, ty + 6, 2, 3, '#1a1a1a'); R(x0 + tw + 1, ty + 4, 2, 1, '#111'); break;
    case 'rifle': R(x0 - 1, ty + 3, tw + 3, 1, '#2a2a2a'); R(x0 - 1, ty + 3, 4, 2, '#7a5a34'); break;
    case 'machete': R(x0 + tw + 2, hy2 - 6, 1, 6, '#c0c4c8'); R(x0 + tw + 2, hy2, 1, 2, '#3a2a1a'); break;
    case 'cane': R(x0 + tw + 2, hy2 - 1, 1, GROUND - hy2 + 2, '#6b4a2a'); R(x0 + tw + 1, hy2 - 1, 2, 1, '#6b4a2a'); break;
    case 'bible': R(x0 + tw, hy2 - 3, 3, 4, '#2a2a30'); R(x0 + tw + 1, hy2 - 2, 1, 2, '#d8b040'); break;
    case 'torch': R(x0 + tw + 2, hy2 - 2, 1, 4, '#222'); R(x0 + tw + 1, hy2 - 4, 3, 2, '#ffe9a0'); break;
    case 'baton': R(x0 + tw + 2, hy2 - 1, 1, 6, '#1a1a1a'); break;
    case 'jerrycan': R(x0 + tw + 1, hy2, 3, 4, '#d8b030'); R(x0 + tw + 2, hy2 - 1, 1, 1, '#b08820'); break;
    case 'basket': R(x0 + tw, hy2 - 1, 4, 3, '#b08a50'); R(x0 + tw, hy2 - 1, 4, 1, '#c8a060'); break;
    case 'bundle': R(x0 + tw, hy2 - 1, 4, 4, '#8a7a5a'); R(x0 + tw + 1, hy2 - 2, 2, 1, '#6b4f3a'); break;
    case 'dane': R(x0 - 2, ty + 3, tw + 5, 1, '#3a2a1a'); R(x0 + tw + 2, ty + 2, 1, 2, '#6a6a6a'); break;
  }

  /* neck + head */
  R(9, hy + 6, 2, Math.max(0, ty - (hy + 6)), sd);
  R(7, hy, 6, 6, skin); R(12, hy + 1, 1, 5, sd); R(6, hy + 2, 1, 2, skin); R(13, hy + 2, 1, 2, skin);

  const hc = sp.hairc, headC = sp.headc;
  const covers = ['hijab', 'helmet', 'balaclava', 'veil', 'hood'].includes(sp.head);
  if (!covers) {
    switch (sp.hair) {
      case 'short': R(7, hy - 1, 6, 2, hc); R(7, hy + 1, 1, 1, hc); R(12, hy + 1, 1, 1, hc); break;
      case 'fade': R(7, hy - 1, 6, 1, hc); R(8, hy, 4, 1, hc); break;
      case 'afro': R(6, hy - 3, 8, 4, hc); R(6, hy + 1, 1, 2, hc); R(13, hy + 1, 1, 2, hc); break;
      case 'twists': R(7, hy - 1, 6, 2, hc); R(7, hy - 2, 1, 1, hc); R(9, hy - 2, 1, 1, hc); R(11, hy - 2, 1, 1, hc); break;
      case 'cornrows': R(7, hy - 1, 6, 2, hc); [8, 10, 12].forEach((x) => R(x, hy - 1, 1, 2, shade(hc, 2.2))); break;
      case 'braids': R(7, hy - 1, 6, 2, hc); R(6, hy + 1, 1, 8, hc); R(13, hy + 1, 1, 8, hc); R(6, hy + 8, 1, 1, '#d8b040'); R(13, hy + 8, 1, 1, '#d8b040'); break;
      case 'bun': R(7, hy - 1, 6, 2, hc); R(9, hy - 3, 2, 2, hc); break;
      case 'weave': R(6, hy - 1, 8, 2, hc); R(6, hy + 1, 2, 9, hc); R(12, hy + 1, 2, 9, hc); break;
      case 'locs': R(6, hy - 2, 8, 3, hc); R(6, hy + 1, 1, 4, hc); R(13, hy + 1, 1, 6, hc); R(7, hy + 1, 1, 3, hc); R(12, hy + 1, 1, 5, hc); break;
      case 'mohawk': R(9, hy - 3, 2, 3, hc); R(8, hy, 4, 1, shade(hc, 1.5)); break;
      case 'pigtails': R(7, hy - 1, 6, 2, hc); R(5, hy + 1, 2, 3, hc); R(13, hy + 1, 2, 3, hc); break;
      case 'bald': default: break;
    }
  }
  /* headgear */
  switch (sp.head) {
    case 'cap': R(7, hy - 1, 6, 2, headC); R(7, hy + 1, 6, 1, shade(headC, 0.65)); break;
    case 'fila': R(7, hy - 2, 6, 3, headC); R(7, hy, 6, 1, shade(headC, 0.75)); break;
    case 'gele': R(5, hy - 4, 10, 4, headC); R(6, hy - 1, 8, 2, shade(headC, 0.8)); R(7, hy - 3, 1, 2, shade(headC, 1.3)); R(10, hy - 4, 1, 2, shade(headC, 1.3)); R(13, hy - 3, 2, 2, shade(headC, 1.2)); break;
    case 'headtie': R(6, hy - 1, 8, 2, headC); R(12, hy - 2, 2, 2, shade(headC, 1.25)); R(6, hy + 1, 1, 1, headC); break;
    case 'hijab': R(6, hy - 1, 8, 2, headC); R(6, hy + 1, 1, 5, headC); R(13, hy + 1, 1, 5, headC); R(7, hy, 6, 1, headC); R(6, hy + 6, 8, 3, headC); break;
    case 'turban': R(6, hy - 3, 8, 4, headC); R(6, hy - 1, 8, 1, shade(headC, 0.75)); R(12, hy, 2, 3, headC); break;
    case 'beanie': R(7, hy - 1, 6, 3, headC); break;
    case 'headband': R(7, hy + 1, 6, 1, headC); break;
    case 'beret': R(6, hy - 1, 7, 2, headC); R(5, hy, 2, 1, headC); break;
    case 'nursecap': R(8, hy - 1, 4, 2, '#f4f4f4'); R(9, hy - 1, 1, 1, '#b8402f'); break;
    case 'helmet': R(6, hy - 1, 8, 7, headC); R(7, hy + 2, 6, 2, '#14202a'); R(8, hy + 2, 2, 1, '#5a7a8a'); break;
    case 'balaclava': R(7, hy - 1, 6, 7, headC); R(6, hy + 1, 1, 4, headC); R(13, hy + 1, 1, 4, headC); R(8, hy + 2, 4, 1, skin); break;
    case 'veil': R(5, hy - 1, 10, 2, '#111'); R(6, hy + 1, 1, 7, '#111'); R(13, hy + 1, 1, 7, '#111'); R(7, hy, 6, 1, '#efe9d8'); R(6, hy + 6, 8, 2, '#efe9d8'); break;
    case 'hood': R(6, hy - 1, 8, 2, headC); R(6, hy + 1, 1, 5, headC); R(13, hy + 1, 1, 5, headC); R(7, hy, 6, 1, headC); break;
  }
  /* face */
  const closed = fr.eyesClosed || fr.blink || isDead;
  if (sp.head === 'helmet' && isDead) { [[7, 1], [9, 1], [8, 2], [7, 3], [9, 3], [10, 1], [12, 1], [11, 2], [10, 3], [12, 3]].forEach(([x, y]) => R(x, hy + y, 1, 1, '#d6d6de')); }
  if (sp.head !== 'helmet') {
    if (isDead) { [[7, 1], [9, 1], [8, 2], [7, 3], [9, 3], [10, 1], [12, 1], [11, 2], [10, 3], [12, 3]].forEach(([x, y]) => R(x, hy + y, 1, 1, '#16090a')); }
    else if (closed) { R(8, hy + 2, 1, 1, sdd); R(11, hy + 2, 1, 1, sdd); }
    else { R(8, hy + 2, 1, 1, '#140d08'); R(11, hy + 2, 1, 1, '#140d08'); }
    if (has(sp, 'tired') || has(sp, 'sick')) { R(8, hy + 3, 1, 1, sd); R(11, hy + 3, 1, 1, sd); }
    if (isDead) { R(9, hy + 4, 2, 1, '#3a0d0d'); R(9, hy + 5, 2, 2, '#d0566a'); R(10, hy + 7, 1, 1, '#a63a4c'); }
    else if (sp.head !== 'balaclava' && !sp.beard) R(9, hy + (has(sp, 'broken') || has(sp, 'sick') || has(sp, 'starving') ? 5 : 4), 2, 1, sdd);
    if (has(sp, 'hungry') || has(sp, 'starving')) { R(8, hy + 3, 1, 1, sd); R(11, hy + 3, 1, 1, sd); }
    if (has(sp, 'starving')) { R(7, hy + 4, 1, 2, sdd); R(12, hy + 4, 1, 2, sdd); R(8, hy + 4, 1, 1, sd); R(11, hy + 4, 1, 1, sd); }
  }
  if (sp.beard && sp.head !== 'balaclava' && sp.head !== 'helmet') {
    if (sp.beard === 'beard') R(8, hy + 4, 4, 2, hc); else if (sp.beard === 'goatee') R(9, hy + 4, 2, 2, hc); else R(8, hy + 3, 4, 1, hc);
  }
  if (sp.glasses && sp.head !== 'helmet' && sp.head !== 'balaclava') {
    R(7, hy + 1, 6, 1, sp.glasses); R(7, hy + 3, 6, 1, sp.glasses); R(7, hy + 2, 1, 1, sp.glasses); R(9, hy + 2, 2, 1, sp.glasses); R(12, hy + 2, 1, 1, sp.glasses);
  }
  if (sp.item === 'binoc') R(8, hy + 2, 4, 2, '#1a1a1a');
  if (sp.scar) { R(11, hy + 1, 1, 3, '#7a3a30'); }

  /* state overlays */
  if (has(sp, 'hurt')) {
    R(x0 - 2, ty + 2, 2, 2, '#efe9d8'); R(x0 - 2, ty + 3, 1, 1, RED);
    R(x0 + 2, ty + 3, 2, 2, RED2); R(7, hy, 6, 1, '#efe9d8'); R(10, hy, 1, 1, RED);
  }
  if (has(sp, 'sick') && fr.bob) R(13, hy + 1, 1, 1, '#9bd0e0');
  if (isDead) R(x0 + 2, ty + 3, 3, 3, GORE ? '#6a1410' : shade(top.c, 0.8));
  return out.join('');
}

/* ---------- animations ---------- */
const ANIMS = {
  idle: { n: 2, dur: 1.6, frames: [{ bob: 0 }, { bob: 1 }] },
  blink: { n: 4, dur: 3.2, frames: [{ bob: 0 }, { bob: 0 }, { bob: 1, blink: 1 }, { bob: 1 }] },
  walk: { n: 4, dur: 0.72, frames: [{ bob: 0, liftL: 2, aL: 1, aR: -1 }, { bob: 1 }, { bob: 0, liftR: 2, aL: -1, aR: 1 }, { bob: 1 }] },
  pray: { n: 2, dur: 2.4, frames: [{ drop: 6, pray: 1, bob: 0, hunch: 1 }, { drop: 6, pray: 1, bob: 1, hunch: 1 }] },
  sleep: { n: 2, dur: 2.8, rot: true, frames: [{ bob: 0, eyesClosed: 1 }, { bob: 1, eyesClosed: 1 }] },
  dead: { n: 1, dur: 1, rot: true, frames: [{ eyesClosed: 1, dead: 1 }] }
};
let cssDone = false;
function ensureCSS() {
  if (cssDone || typeof document === 'undefined') return; cssDone = true;
  let css = '.cs{image-rendering:pixelated;overflow:visible}.cs .f{opacity:0}.cs .f.only{opacity:1}';
  [2, 4].forEach((n) => { for (let i = 0; i < n; i++) { const a = (i / n * 100).toFixed(2), b = ((i + 1) / n * 100).toFixed(2); css += `@keyframes cf${n}_${i}{0%,${a === '0.00' ? '0.001' : (a - 0.001).toFixed(3)}%{opacity:${i === 0 ? 1 : 0}}${a}%,${(b - 0.001).toFixed(3)}%{opacity:1}${b}%,100%{opacity:${i === n - 1 ? 1 : 0}}}`; } });
  css += '@media (prefers-reduced-motion:reduce){.cs .f{animation-play-state:paused!important}}';
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
}
/* render(spec, anim, {scale, flip, state}) -> svg string */
function render(sp0, anim, opts) {
  opts = opts || {}; ensureCSS();
  const sp = opts.state ? Object.assign({}, sp0, { state: opts.state }) : sp0;
  const A = ANIMS[anim] || ANIMS.idle; const scale = opts.scale || 4;
  const frames = A.frames.map((fr, i) => `<g class="f${A.n === 1 ? ' only' : ''}"${A.n > 1 ? ` style="animation:cf${A.n}_${i} ${A.dur}s linear infinite"` : ''}>${drawFrame(sp, fr)}</g>`).join('');
  const shadow = A.rot ? '' : '<rect x="5" y="27" width="10" height="1" fill="rgba(0,0,0,.35)"/>';
  const inner = A.rot ? `<g transform="rotate(-90 10 14)">${frames}</g>` : shadow + frames;
  const vb = A.rot ? [-2, 4, 26, 20] : [0, 0, 20, 28];
  const flip = opts.flip ? `<g transform="translate(${vb[0] * 2 + vb[2]} 0) scale(-1 1)">${inner}</g>` : inner;
  const w = opts.responsive ? '100%' : vb[2] * scale;
  const hAttr = opts.responsive ? '' : ` height="${vb[3] * scale}"`;
  return `<svg class="cs" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${w}"${hAttr} shape-rendering="crispEdges">${flip}</svg>`;
}
/* nested form for scenes: returns <svg x y> element with native pixel size */
function place(sp, anim, x, y, opts) {
  opts = opts || {}; const A = ANIMS[anim] || ANIMS.idle; const vb = A.rot ? [-2, 4, 26, 20] : [0, 0, 20, 28];
  const k = opts.s || 1;
  return render(sp, anim, Object.assign({}, opts, { scale: 1 })).replace('<svg class="cs"', `<svg class="cs" x="${x}" y="${y}"`).replace(/ width="[^"]+"/, ` width="${vb[2] * k}"`).replace(/ height="[^"]+"/, ` height="${vb[3] * k}"`);
}

/* ---------- roster ---------- */
const ARCH = [];
const A = (id, group, label, o) => ARCH.push(Object.assign({ id, group, label }, o));
const youthCasual = { type: 'shirt', sleeve: ['short', 'short', 'long'], c: TEE };

/* Students - boys */
A('boy_gym', 'Students (boys)', 'Gym boy', { sex: 'm', body: ['teen', 'adult'], build: ['avg', 'broad'], hair: ['fade', 'short', 'bald', 'twists'], top: { type: 'shirt', sleeve: ['none', 'short'], c: TEE }, bottom: { type: 'shorts', c: DARK }, head: [null, 'cap'], headc: TEE, chain: 0.3 });
A('boy_nerd', 'Students (boys)', 'Bookworm', { sex: 'm', body: ['teen', 'adult'], hair: ['short', 'fade'], top: { type: 'shirt', sleeve: 'short', c: ['#c9c0a8', '#9ab0c0', '#a8b090'] }, bottom: { type: 'pants', c: KHAKI }, glasses: 0.9, bag: TEE, over: [{ t: 'lanyard', c: '#1f7a3d' }] });
A('boy_hustler', 'Students (boys)', 'Hustler', { sex: 'm', body: ['teen', 'adult'], hair: ['twists', 'cornrows', 'fade'], top: { type: 'shirt', sleeve: 'short', c: VIV }, bottom: { type: 'pants', c: DENIM }, head: [null, 'cap'], headc: DARK, chain: 0.8, scar: 0.15 });
A('boy_fellowship', 'Students (boys)', 'Fellowship boy', { sex: 'm', body: ['teen', 'adult'], hair: ['short', 'fade'], top: { type: 'shirt', sleeve: 'long', c: ['#d8d2c0', '#b8c8d0'] }, bottom: { type: 'pants', c: DARK }, over: [{ t: 'tie', c: '#7a3f35' }], item: 'bible', glasses: 0.25 });
A('boy_law', 'Students (boys)', 'Law student', { sex: 'm', body: 'adult', hair: ['short', 'fade'], top: { type: 'shirt', sleeve: 'long', c: DARK }, bottom: { type: 'pants', c: DARK }, over: [{ t: 'collar' }, { t: 'tie', c: '#efe9d8' }], glasses: 0.3 });
A('boy_hoodie', 'Students (boys)', 'Hoodie boy', { sex: 'm', body: ['teen', 'adult'], hair: ['short', 'twists'], top: { type: 'shirt', sleeve: 'long', c: TEE }, bottom: { type: 'pants', c: DENIM }, head: ['hood', 'beanie', null], headc: TEE, bag: 0.4 });
/* Students - girls */
A('girl_hijab', 'Students (girls)', 'Hijabi student', { sex: 'f', body: ['teen', 'adult'], top: { type: 'shirt', sleeve: 'long', c: TEE }, bottom: { type: 'skirt', c: DARK }, head: 'hijab', headc: ['#2a5a3a', '#3a3a50', '#6a4a5a', '#1f7a3d', '#8a7a5a'] });
A('girl_braids', 'Students (girls)', 'Braids girl', { sex: 'f', body: ['teen', 'adult'], hair: 'braids', top: { type: 'shirt', sleeve: 'short', c: TEE }, bottom: { type: 'pants', c: DENIM } });
A('girl_natural', 'Students (girls)', 'Natural hair girl', { sex: 'f', body: ['teen', 'adult'], hair: ['afro', 'twists', 'bun'], top: { type: 'shirt', sleeve: 'short', c: VIV }, bottom: { type: 'wrapper', c: DENIM, c2: '#c8a050' } });
A('girl_fashion', 'Students (girls)', 'Fashionista', { sex: 'f', body: 'adult', hair: ['weave', 'weave', 'braids'], top: { type: 'shirt', sleeve: 'none', c: VIV }, bottom: { type: 'dress', c: VIV }, bag: 0.3, chain: 0.4 });
A('girl_nursing', 'Students (girls)', 'Nursing student', { sex: 'f', body: ['teen', 'adult'], hair: ['bun', 'short', 'braids'], top: { type: 'shirt', sleeve: 'short', c: ['#5a8a9a', '#7aa08a'] }, bottom: { type: 'pants', c: ['#5a8a9a', '#7aa08a'] }, head: [null, 'nursecap'], over: [{ t: 'lanyard', c: '#1f7a3d' }] });
A('girl_church', 'Students (girls)', 'Church girl', { sex: 'f', body: ['teen', 'adult'], hair: ['short', 'bun'], top: { type: 'shirt', sleeve: 'long', c: ['#d8d2c0', '#e0c8c0', '#c8d8d0'] }, bottom: { type: 'skirt', c: DARK }, head: [null, 'headtie'], headc: VIV, item: 'bible', cross: 0.5 });
/* Children */
A('kid_boy', 'Children', 'Boy (child)', { sex: 'm', body: 'child', hair: ['short', 'fade', 'bald'], top: { type: 'shirt', sleeve: 'short', c: TEE }, bottom: { type: 'shorts', c: DARK } });
A('kid_girl', 'Children', 'Girl (child)', { sex: 'f', body: 'child', hair: ['pigtails', 'braids', 'bun'], top: { type: 'shirt', sleeve: 'short', c: VIV }, bottom: { type: 'skirt', c: DENIM } });
A('kid_school', 'Children', 'Staff kid (school uniform)', { sex: ['m', 'f'], body: 'child', hair: ['short', 'pigtails', 'fade'], top: { type: 'shirt', sleeve: 'short', c: ['#efe9d8'] }, bottom: { type: 'shorts', c: ['#2d4a8a', '#3a3a50'] }, over: [{ t: 'tie', c: '#b8402f' }] });
/* Lecturers and staff */
A('lect_m', 'Staff & clergy', 'Senior lecturer (male)', { sex: 'm', body: ['adult', 'elder'], hair: ['short', 'fade', 'bald'], hairc: [GREY, HAIRC[0]], top: { type: 'shirt', sleeve: 'long', c: ['#c9c0a8', '#9ab0c0', '#d8d2c0'] }, bottom: { type: 'pants', c: DARK }, over: [{ t: 'tie', c: '#7a3f35' }, { t: 'belt' }], glasses: 0.7, beard: 0.2 });
A('lect_f', 'Staff & clergy', 'Lecturer (female)', { sex: 'f', body: 'adult', hair: 'short', top: { type: 'shirt', sleeve: 'short', c: VIV }, bottom: { type: 'wrapper', c: ['#2f7a4a', '#2d5fa0', '#8a3a8a'], c2: '#d8b040' }, head: ['gele', 'headtie'], headc: VIV, glasses: 0.4 });
A('prof_m', 'Staff & clergy', 'Professor (agbada)', { sex: 'm', body: ['adult', 'elder'], build: ['avg', 'broad'], hair: 'short', hairc: GREY, top: { type: 'agbada', sleeve: 'long', c: ['#e8e0c8', '#2f7a4a', '#2d5fa0', '#8a7a5a'], c2: '#c8a050' }, bottom: { type: 'pants', c: ['#e8e0c8', '#8a7a5a'] }, head: 'fila', headc: ['#c8a050', '#2f7a4a', '#7a3f35'], glasses: 0.6, beard: 0.3, item: [null, 'cane'] });
A('prof_f', 'Staff & clergy', 'Professor (iro & buba)', { sex: 'f', body: ['adult', 'elder'], hair: 'short', hairc: GREY, top: { type: 'shirt', sleeve: 'long', c: VIV }, bottom: { type: 'wrapper', c: VIV, c2: '#efe9d8' }, head: 'gele', headc: VIV, glasses: 0.5 });
A('lab_m', 'Staff & clergy', 'Lab technician (male)', { sex: 'm', body: 'adult', hair: ['short', 'fade'], top: { type: 'shirt', sleeve: 'long', c: WHITE }, bottom: { type: 'pants', c: DARK }, over: [{ t: 'coat', c: WHITE }], glasses: 0.5 });
A('lab_f', 'Staff & clergy', 'Lab technician (female)', { sex: 'f', body: 'adult', hair: ['bun', 'short'], top: { type: 'shirt', sleeve: 'long', c: WHITE }, bottom: { type: 'pants', c: DARK }, over: [{ t: 'coat', c: WHITE }], head: [null, 'headtie'], headc: VIV, glasses: 0.4 });
A('priest', 'Staff & clergy', 'Priest / chaplain', { sex: 'm', body: ['adult', 'elder'], hair: ['short', 'fade'], hairc: [GREY, HAIRC[0]], top: { type: 'shirt', sleeve: 'long', c: DARK }, bottom: { type: 'robe', c: DARK }, over: [{ t: 'collar' }, { t: 'cross' }], glasses: 0.3, item: [null, 'bible'] });
A('sister', 'Staff & clergy', 'Sister (nun)', { sex: 'f', body: ['adult', 'elder'], top: { type: 'shirt', sleeve: 'long', c: ['#efe9d8', '#1d1d20'] }, bottom: { type: 'robe', c: ['#efe9d8', '#1d1d20'] }, head: 'veil', over: [{ t: 'cross' }], glasses: 0.2 });
A('guard', 'Staff & clergy', 'Security guard', { sex: 'm', body: ['adult', 'elder'], build: ['avg', 'broad'], hair: ['short', 'fade'], top: { type: 'shirt', sleeve: 'short', c: ['#3a4a5a', '#4a4a3a'] }, bottom: { type: 'pants', c: ['#2c3640', '#35352a'] }, over: [{ t: 'belt' }, { t: 'badge' }], head: 'cap', headc: ['#2c3640', '#35352a'], item: 'baton' });
A('porter', 'Staff & clergy', 'Hostel porter', { sex: 'm', body: ['adult', 'elder'], hair: ['short', 'bald'], hairc: [GREY, HAIRC[0]], top: { type: 'shirt', sleeve: 'short', c: ['#8a7a58', '#6a7a8a'] }, bottom: { type: 'pants', c: DARK }, head: [null, 'cap'], headc: KHAKI, item: [null, 'torch'] });
A('cafe_woman', 'Staff & clergy', 'Cafeteria woman', { sex: 'f', body: ['adult', 'elder'], build: 'avg', hair: 'short', hairc: [HAIRC[0], GREY], top: { type: 'shirt', sleeve: 'short', c: VIV }, bottom: { type: 'wrapper', c: VIV, c2: '#efe9d8' }, over: [{ t: 'apron', c: '#d8d2c0' }], head: 'headtie', headc: VIV, item: [null, 'basket'] });
A('cleaner', 'Staff & clergy', 'Cleaner', { sex: ['m', 'f'], body: 'adult', hair: ['short', 'bun'], top: { type: 'shirt', sleeve: 'short', c: ['#5a8a9a', '#8a7a58'] }, bottom: { type: 'pants', c: DARK }, over: [{ t: 'tabard', c: '#e0a030' }], head: [null, 'headtie'], headc: VIV });
A('nurse', 'Staff & clergy', 'Clinic nurse', { sex: ['f', 'f', 'm'], body: 'adult', hair: ['bun', 'short'], top: { type: 'shirt', sleeve: 'short', c: WHITE }, bottom: { type: 'pants', c: WHITE }, head: 'nursecap', over: [{ t: 'lanyard', c: '#1f7a3d' }] });
/* Parents and family */
A('father', 'Family', 'Father', { sex: 'm', body: 'adult', build: ['avg', 'broad'], hair: ['short', 'fade'], top: { type: 'shirt', sleeve: ['short', 'long'], c: TEE }, bottom: { type: 'pants', c: DARK }, beard: 0.3, over: [{ t: 'belt' }] });
A('mother', 'Family', 'Mother', { sex: 'f', body: 'adult', hair: 'short', top: { type: 'shirt', sleeve: 'long', c: VIV }, bottom: { type: 'wrapper', c: VIV, c2: '#efe9d8' }, head: ['gele', 'headtie'], headc: VIV, item: [null, 'bundle'] });
A('grandma', 'Family', 'Grandmother', { sex: 'f', body: 'elder', hair: 'short', hairc: GREY, top: { type: 'shirt', sleeve: 'long', c: TEE }, bottom: { type: 'wrapper', c: VIV, c2: '#d8d2c0' }, head: 'headtie', headc: ['#8a7a5a', '#6a4a5a', '#4d5a4a'], item: 'cane' });
A('grandpa', 'Family', 'Grandfather', { sex: 'm', body: 'elder', hair: 'short', hairc: GREY, top: { type: 'agbada', sleeve: 'long', c: ['#8a7a5a', '#e8e0c8', '#4d5a4a'] }, bottom: { type: 'pants', c: ['#8a7a5a', '#e8e0c8'] }, head: 'fila', headc: ['#c8a050', '#7a3f35'], beard: 0.5, item: 'cane' });
/* Bandits */
A('bandit_soldier', 'Bandits', 'Foot soldier', { sex: ['m', 'm', 'm', 'f'], body: 'adult', build: ['avg', 'broad'], top: { type: 'shirt', sleeve: 'long', c: DARK }, bottom: { type: 'pants', c: DARK }, camo: true, head: 'balaclava', headc: DARK, item: 'ak', shoe: '#222' });
A('bandit_scout', 'Bandits', 'Motorbike scout', { sex: 'm', body: ['teen', 'adult'], top: { type: 'shirt', sleeve: 'short', c: DARK }, bottom: { type: 'pants', c: DENIM }, head: 'helmet', headc: ['#2a2a2a', '#7a3f35'], item: 'machete', over: [{ t: 'stripe', c: '#d8b040' }] });
A('bandit_boss', 'Bandits', 'Commander', { sex: 'm', body: 'adult', build: 'avg', hair: 'short', top: { type: 'shirt', sleeve: 'long', c: ['#4a5a3a', '#2f2f34'] }, bottom: { type: 'pants', c: ['#35352a', '#2f2f34'] }, over: [{ t: 'vest', c: '#2a2a22' }, { t: 'charms' }], head: ['turban', 'beret', 'cap'], headc: ['#2a2a22', '#7a3f35', '#2f4a3a'], item: 'binoc', beard: 0.8, scar: 0.4, glasses: 0.3 });
A('bandit_heavy', 'Bandits', 'Heavy', { sex: 'm', body: 'adult', build: 'broad', hair: ['bald', 'mohawk', 'fade'], top: { type: 'shirt', sleeve: 'none', c: DARK }, bottom: { type: 'pants', c: DARK }, over: [{ t: 'vest', c: '#2a2a22' }, { t: 'belt' }], head: [null, 'headband'], headc: '#b8402f', item: 'ak', beard: 0.5, scar: 0.5, shoe: '#222' });
A('bandit_kid', 'Bandits', 'Young conscript', { sex: ['m', 'm', 'f'], body: 'teen', top: { type: 'shirt', sleeve: 'long', c: TEE }, bottom: { type: 'pants', c: DARK }, camo: 0.5, head: [null, 'cap', 'headband'], headc: DARK, item: 'ak', hair: 'short' });
A('bandit_informant', 'Bandits', 'Informant', { sex: ['m', 'f'], body: 'adult', hair: ['short', 'twists', 'bun'], top: { type: 'shirt', sleeve: 'short', c: TEE }, bottom: { type: 'pants', c: DENIM }, head: [null, 'cap', 'hood'], headc: DARK, chain: 0.3 });
A('bandit_queen', 'Bandits', 'Raider (woman)', { sex: 'f', body: 'adult', hair: 'braids', top: { type: 'shirt', sleeve: 'long', c: DARK }, bottom: { type: 'pants', c: DARK }, over: [{ t: 'vest', c: '#2a2a22' }], head: ['headtie', 'hijab', null], headc: DARK, item: ['ak', 'machete'], scar: 0.4, shoe: '#222' });
A('bandit_kingpin', 'Bandits', 'Kingpin', { sex: 'm', body: 'adult', build: 'broad', hair: 'bald', top: { type: 'agbada', sleeve: 'long', c: ['#1d1d20', '#3a1a1a'], c2: '#d8b040' }, bottom: { type: 'pants', c: DARK }, head: 'fila', headc: '#d8b040', glasses: 0.9, chain: 1, beard: 0.5, item: [null, 'cane'], shoe: '#222' });
/* Others */
A('soldier', 'Others', 'Soldier (rescue)', { sex: ['m', 'm', 'f'], body: 'adult', build: ['avg', 'broad'], top: { type: 'shirt', sleeve: 'long', c: DARK }, bottom: { type: 'pants', c: DARK }, camo: true, head: ['helmet', 'beret'], headc: ['#4a5a3a', '#2c382c'], item: 'rifle', over: [{ t: 'vest', c: '#3a4430' }], shoe: '#222' });
A('vigilante', 'Others', 'Hunter / vigilante', { sex: 'm', body: ['adult', 'elder'], hair: 'short', hairc: [HAIRC[0], GREY], top: { type: 'shirt', sleeve: 'long', c: ['#5a3a2a', '#4a3a28'] }, bottom: { type: 'pants', c: ['#5a3a2a', '#4a3a28'] }, over: [{ t: 'charms' }, { t: 'sash', c: '#b8402f' }], head: ['fila', 'headband'], headc: ['#6a3a2a', '#b8402f'], item: 'dane', beard: 0.5 });
A('scavenger', 'Others', 'Scavenger', { sex: ['m', 'f'], body: ['teen', 'adult'], top: { type: 'shirt', sleeve: 'long', c: TEE }, bottom: { type: 'pants', c: DARK }, head: ['hood', 'balaclava', 'beanie'], headc: DARK, item: 'jerrycan', bag: TEE });
A('refugee', 'Others', 'Refugee', { sex: ['m', 'f'], body: ['teen', 'adult', 'elder'], hair: ['short', 'bun', 'twists'], top: { type: 'shirt', sleeve: ['long', 'short'], c: ['#6a6a6a', '#58584a', '#7a6a4a'] }, bottom: { type: ['pants', 'skirt'], c: ['#3a3a40', '#4a3a2a'] }, item: ['bundle', 'bundle', null], head: [null, 'headtie'], headc: ['#8a7a5a', '#6a4a5a'], shoe: '#3a2a1a' });
A('trader', 'Others', 'Trader', { sex: ['m', 'f'], body: 'adult', hair: ['short', 'bun'], top: { type: 'shirt', sleeve: 'short', c: VIV }, bottom: { type: ['pants', 'wrapper'], c: DARK, c2: '#d8b040' }, over: [{ t: 'apron', c: '#d8d2c0' }], head: [null, 'cap', 'headtie'], headc: VIV, item: 'basket', chain: 0.4 });

function gen(id, seed, ov) {
  const a = ARCH.find((x) => x.id === id); if (!a) throw new Error('unknown archetype ' + id);
  seed = seed == null ? Math.floor(Math.random() * 1e9) : seed;
  const rng = mulberry(seed);
  const P = (v) => (Array.isArray(v) ? v[Math.floor(rng() * v.length)] : v);
  const sex = P(a.sex || 'm');
  const sp = { arch: id, seed, sex, body: P(a.body || 'adult'), build: P(a.build || 'avg'), skin: P(SKIN), hair: P(a.hair || 'short'), hairc: P(a.hairc || HAIRC), shoe: P(a.shoe || '#1a130d'), state: 'ok' };
  sp.top = { type: P(a.top.type), sleeve: P(a.top.sleeve), c: P(a.top.c), c2: a.top.c2 ? P(a.top.c2) : null };
  sp.bottom = { type: P(a.bottom.type), c: P(a.bottom.c), c2: a.bottom.c2 ? P(a.bottom.c2) : null };
  if (sp.bottom.type === 'skirt' && sex === 'm') sp.bottom.type = 'pants';
  sp.over = (a.over || []).map((o) => ({ t: o.t, c: o.c ? P(o.c) : null }));
  sp.head = P(a.head || null); sp.headc = P(a.headc || '#555'); sp.item = P(a.item || null);
  const chanceOf = (v) => (typeof v === 'number' ? rng() < v : !!v);
  sp.glasses = chanceOf(a.glasses) ? '#17120e' : null;
  sp.beard = chanceOf(a.beard) ? P(['beard', 'goatee', 'stache']) : null;
  if (sex === 'f') sp.beard = null;
  sp.scar = chanceOf(a.scar); sp.chain = chanceOf(a.chain); sp.cross = chanceOf(a.cross);
  sp.bag = a.bag && chanceOf(typeof a.bag === 'number' ? a.bag : 1) ? P(Array.isArray(a.bag) ? a.bag : ['#3a3a40', '#4a3a2a', '#2f4a3a']) : null;
  if (a.camo && chanceOf(a.camo)) sp.camo = P(CAMO);
  const pool = sex === 'f' ? NAMES_F : NAMES_M; sp.name = pool[Math.floor(rng() * pool.length)];
  sp.label = a.label; sp.group = a.group;
  if (ov) Object.assign(sp, ov);   // fixed looks for authored characters
  return sp;
}

C.Sprites = { render, place, gen, ARCH, ANIMS, geom, shade, tint, PAL: { SKIN, VIV, TEE } };
if (typeof module !== 'undefined') module.exports = C.Sprites;
})(typeof window !== 'undefined' ? window : globalThis);
