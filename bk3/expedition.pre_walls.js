/* CRISIS — the night run, controlled by you
   A scrolling building. Tap the floor to walk. Tap a glowing spot to search it (an hour each). Tap a wardrobe to hide.
   Tap 🤫 to sneak: slower, quieter, harder to spot. Patrols walk their routes: the pale cone is what they can see.
   Walk into someone and a scene plays. Tap the green door to head home. The torch only lights what is near you. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const X = { hooks: {}, st: null, root: null, timer: null, key: '' };
const NS = 'http://www.w3.org/2000/svg';
const SC = () => C.Scenes, SD = () => C.Side, SP = () => C.Sprites;
const FLOOR = 76, SEG = 160;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const usable = () => typeof document !== 'undefined' && document.createElementNS && document.createElement && typeof document.createElement('div').appendChild === 'function';

function ensureRoot() {
  if (X.root) return;
  X.root = document.createElement('div'); X.root.className = 'xwrap';
  X.root.innerHTML = '<div class="xsvg"></div><button class="xsneak" aria-pressed="false">🤫 Sneak</button><button class="xhole">🕓 Hole up</button><div class="xnoise" title="Noise"><i></i></div><div class="xhint"></div>';
  X.root.addEventListener('pointerdown', onTap);
  X.root.querySelector('.xhole').addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); if (X.hooks.holeUp && !(X.hooks.modalOpen && X.hooks.modalOpen())) X.hooks.holeUp(); });
  X.root.querySelector('.xsneak').addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); if (!X.st) return; X.st.p.sneak = !X.st.p.sneak; const b = e.currentTarget; b.classList.toggle('on', X.st.p.sneak); b.setAttribute('aria-pressed', X.st.p.sneak); hint(X.st.p.sneak ? 'Sneaking: slower, quieter.' : 'Walking normally.'); });
}
function hint(t) { if (!X.root) return; const h = X.root.querySelector('.xhint'); h.textContent = t; h.classList.add('on'); clearTimeout(X.ht); X.ht = setTimeout(() => h.classList.remove('on'), 2600); }
function redraw(en) {
  const cone = en.cone ? `<path transform="scale(${en.dir} 1)" d="M6 ${FLOOR - 28} L${en.range} ${FLOOR - 42} L${en.range} ${FLOOR - 3} Z" fill="rgba(255,214,120,.13)"/>` : '';
  en.el.innerHTML = cone + SD().place(en.sp, en.kind, 0, en.g || FLOOR, { dir: en.dir, state: en.state });
  en.dk = en.kind; en.dd = en.dir; en.ds = en.state;
}
function setKind(en, k) { if (en.kind !== k) { en.kind = k; redraw(en); } else if (en.dd !== en.dir || en.ds !== en.state) redraw(en); }
function mkEn(sp, x, kind, dir, state, o) {
  const el = document.createElementNS(NS, 'g'); X.st.actors.appendChild(el);
  const en = Object.assign({ sp, x, kind, dir, state: state || 'ok', el, g: FLOOR }, o || {}); redraw(en); el.style.transform = `translate(${x}px,0px)`; return en;
}
/* ---------- building the place ---------- */
X.attach = function (container, e, info) {
  if (!usable() || !SC() || !SD()) return; ensureRoot();
  const key = e.loc + '|' + e.xseed + '|' + (e.floor || 0);
  if (!X.st || X.key !== key) { build(e, info); X.key = key; }
  X.st.e = e; X.st.info = info; container.appendChild(X.root); start();
  if (!X.hinted) { X.hinted = true; setTimeout(() => hint('Tap the floor to walk. Tap glowing spots to search. 🤫 to sneak.'), 500); }
};

/* a settlement: a barricade with a gap, a sign that says how they feel about visitors, a fire, bedrolls, crates, a washing line */
function campArt(x0, c) {
  const gy = FLOOR; const R_ = (x, y, w, h, f, ex) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${ex ? ' ' + ex : ''}/>`; let o = '';
  const col = { friendly: '#4a8a3a', wary: '#c8a040', desperate: '#8a7a5a', hostile: '#a0302a', predatory: '#a0302a' }[c.att] || '#c8a040';
  for (let i = 0; i < 5; i++) { if (i === 2) continue; const bx = x0 + i * 7, bh = 16 + (i % 3) * 6; o += R_(bx, gy - bh, 7, bh, i % 2 ? '#5a4330' : '#4a3626') + R_(bx, gy - bh, 7, 2, '#7a5a3c') + R_(bx + 2, gy - bh + 4, 3, 1, '#2a1d14'); }
  o += R_(x0 + 14, gy - 44, 1.4, 30, '#3a2a1c') + R_(x0 + 6, gy - 48, 18, 9, '#2a2218') + R_(x0 + 7, gy - 47, 16, 7, col, 'opacity=".85"') + R_(x0 + 10, gy - 45, 10, 1.2, '#14100c') + R_(x0 + 10, gy - 43, 6, 1.2, '#14100c');
  const fx = x0 + 84; o += `<circle cx="${fx}" cy="${gy - 16}" r="30" fill="url(#glw)" opacity=".8"/>` + R_(fx - 6, gy - 14, 12, 14, '#3a3a3a') + R_(fx - 6, gy - 14, 12, 2, '#6a6a6a') + R_(fx - 4, gy - 20, 8, 6, '#e8802a', 'class="blink"') + R_(fx - 2, gy - 24, 4, 5, '#ffd070', 'class="blink"');
  for (let i = 0; i < Math.min(6, Math.max(2, c.size)); i++) { const bx = x0 + 36 + (i % 3) * 32 + (i > 2 ? 14 : 0); o += R_(bx, gy - 3, 22, 3, ['#6a3a3a', '#3a5a7a', '#5a6a3a', '#7a6a3a'][i % 4]) + R_(bx, gy - 3, 6, 3, '#d8d0b0'); }
  const crates = Math.max(1, Math.min(6, Math.round(((c.stock.food || 0) + (c.stock.water || 0)) / 6)));
  for (let i = 0; i < crates; i++) { const cx = x0 + 150 + (i % 3) * 14, cy = gy - 9 - Math.floor(i / 3) * 9; o += R_(cx, cy, 13, 9, '#8a6a46') + R_(cx, cy, 13, 2, '#a98a62') + R_(cx + 5, cy + 3, 3, 2, '#2a1d14'); }
  o += R_(x0 + 56, gy - 36, 1, 36, '#4a3626') + R_(x0 + 124, gy - 36, 1, 36, '#4a3626') + `<path d="M${x0 + 56} ${gy - 34} Q${x0 + 90} ${gy - 28} ${x0 + 124} ${gy - 34}" stroke="#aaa" stroke-width=".5" fill="none"/>` + R_(x0 + 68, gy - 33, 6, 9, '#a05050') + R_(x0 + 80, gy - 32, 5, 8, '#d8d0b0') + R_(x0 + 98, gy - 33, 6, 10, '#5a7a9a') + R_(fx + 14, gy - 6, 7, 6, '#2a2622') + R_(fx + 13, gy - 7, 9, 1.4, '#4a4a4a');
  return o;
}
function build(e, info) {
  const fl = e.floor || 0, nfl = Math.max(1, info.floors || 1); const R = mulberry((e.xseed || 1) + fl * 977); SC().ensureCSS();
  const risk = info.risk || 2, plan = info.plan || 'corridor';
  const nseg = ({ hall: 4, cafsmall: 2, bigcaf: 5, corridor: 3 + (nfl > 2 ? 1 : 0), lecture: 3 + (risk >= 3 ? 1 : 0), clinic: 3, open: 4, gate: 3 }[plan]) || 3, W = nseg * SEG;
  let world = '';
  for (let i = 0; i < nseg; i++) { const inner = SC().roomInner(info.kind, i + fl * 3); world += i % 2 ? `<g transform="translate(${i * SEG + SEG} 0) scale(-1 1)">${inner}</g>` : `<g transform="translate(${i * SEG} 0)">${inner}</g>`; world += `<rect x="${i * SEG}" y="0" width="${SEG}" height="90" fill="${['#c8832b', '#7a8a5a', '#8a6a50', '#5a6a7a', '#a05a3a'][Math.floor(R() * 5)]}" opacity="${(0.07 + R() * 0.08).toFixed(2)}" pointer-events="none"/>`; }
  const spots = [], hides = [];
  for (let i = 0; i < nseg; i++) { spots.push({ x: i * SEG + 30 + R() * 28 }); spots.push({ x: i * SEG + 96 + R() * 34 }); if (i > 0 && (plan !== 'hall' || i % 2 === 1)) hides.push({ x: i * SEG + 68 + R() * 14 }); }
  ((e.xsF && e.xsF[fl]) || []).forEach((i) => { if (spots[i]) spots[i].done = true; });
  let props = '';
  const stairs = []; const stairArt = (sx, up) => { let t = ''; for (let k = 0; k < 6; k++) t += `<rect x="${sx - 12 + k * 4}" y="${FLOOR - 4 - k * 5}" width="${28 - k * 4}" height="5" fill="${k % 2 ? '#4a3a28' : '#3f3123'}"/><rect x="${sx - 12 + k * 4}" y="${FLOOR - 4 - k * 5}" width="${28 - k * 4}" height="1" fill="#6d5a3f"/>`; return t + `<path d="M${sx - 2} ${FLOOR - 40} l4 ${up ? -5 : 5} l4 ${up ? 5 : -5}" stroke="#f6b37f" stroke-width="1.2" fill="none"/>`; };
  if (fl > 0) { props += stairArt(30, false); stairs.push({ x: 30, dir: -1 }); }
  if (fl < nfl - 1) { props += stairArt(W - 34, true); stairs.push({ x: W - 34, dir: 1 }); }
  if (plan === 'bigcaf') for (let k = 1; k <= 4; k++) { const sx = k * SEG * 1.0 - 62; props += `<rect x="${sx}" y="${FLOOR - 22}" width="54" height="3" fill="#7a3a2a"/><rect x="${sx}" y="${FLOOR - 19}" width="54" height="19" fill="#2a1f16"/><rect x="${sx + 4}" y="${FLOOR - 15}" width="46" height="3" fill="#6a4a32"/><rect x="${sx + 2}" y="${FLOOR - 30}" width="2" height="8" fill="#4a3626"/><rect x="${sx + 50}" y="${FLOOR - 30}" width="2" height="8" fill="#4a3626"/>`; }
  if (fl === 0) props += `<rect x="2" y="${FLOOR - 36}" width="18" height="36" fill="#14281c"/><rect x="2" y="${FLOOR - 36}" width="18" height="4" fill="#3a9a5a" opacity=".8"/><rect x="15" y="${FLOOR - 18}" width="2" height="2" fill="#c8a050"/>`;
  const campOn = !!(info.hasGroup && info.camp && fl === (info.groupFloor || 0)); const cx0 = Math.max(120, W - 270); if (campOn) props += campArt(cx0, info.camp);
  hides.forEach((h) => { props += `<rect x="${h.x - 9}" y="${FLOOR - 32}" width="18" height="32" fill="#2a1d14"/><rect x="${h.x - 9}" y="${FLOOR - 32}" width="18" height="3" fill="#4a3626"/><rect x="${h.x}" y="${FLOOR - 29}" width="1" height="29" fill="#120c08"/><rect x="${h.x - 3}" y="${FLOOR - 16}" width="2" height="3" fill="#c8a050"/><rect x="${h.x + 2}" y="${FLOOR - 16}" width="2" height="3" fill="#c8a050"/>`; });
  spots.forEach((s, i) => { props += `<g id="xs${i}" opacity="${s.done ? 0.4 : 1}"><rect x="${s.x - 7}" y="${FLOOR - 11}" width="14" height="11" fill="#5a4330"/><rect x="${s.x - 7}" y="${FLOOR - 11}" width="14" height="3" fill="#7a5a3c"/><rect x="${s.x - 1}" y="${FLOOR - 7}" width="2" height="2" fill="#c8a050"/>${s.done ? '' : `<rect class="blink" x="${s.x - 2}" y="${FLOOR - 19}" width="4" height="4" fill="#ffd070"/>`}</g>`; });
  X.root.querySelector('.xsvg').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" shape-rendering="crispEdges"><defs>${SC().GLOWDEF}<radialGradient id="xtorch" gradientUnits="userSpaceOnUse" cx="80" cy="60" r="74"><stop offset=".18" stop-color="#05040a" stop-opacity="0"/><stop offset="1" stop-color="#05040a" stop-opacity=".93"/></radialGradient></defs><g id="xwg"><g id="xworld">${world}${props}</g><g id="xact"></g></g><rect width="160" height="90" fill="#080c1e" opacity=".22" pointer-events="none"/><rect id="xdark" width="160" height="90" fill="url(#xtorch)" pointer-events="none"/><rect id="xflash" width="160" height="90" fill="#b8402f" opacity="0" pointer-events="none"/></svg>`;
  const svg = X.root.querySelector('svg');
  X.st = { W, nseg, R, svg, wg: svg.querySelector('#xwg'), actors: svg.querySelector('#xact'), dark: svg.querySelector('#xdark'), flash: svg.querySelector('#xflash'), spots, hides, stairs, pats: [], npcs: [], cam: 0, t: performance.now(), e, info, tick: 0 };
  const S = X.st; const sneakBtn = X.root.querySelector('.xsneak'); sneakBtn.classList.remove('on');
  const pl = mkEn(info.sp, e.arrive === 'left' ? 64 : e.arrive === 'right' ? W - 70 : 30, 'idle', 1, info.state, {}); pl.sneak = false; pl.target = null; pl.busy = false; pl.hidden = false; pl.walked = 0; S.p = pl;
  const nPat = (info.danger ? 1 : 0) + (info.day ? 1 : 0) + (risk >= 4 ? 1 : 0) + (risk >= 3 && R() < 0.5 ? 1 : 0) + (R() < 0.25 ? 1 : 0);
  const types = ['bandit_soldier', 'bandit_heavy', 'bandit_scout', 'bandit_kid'];
  for (let i = 0; i < nPat; i++) { const sp = SP().gen(types[Math.floor(R() * types.length)], Math.floor(R() * 1e6)); const r0 = SEG * 0.7 + R() * 40, r1 = W - 24 - R() * 40; S.pats.push(mkEn(sp, r0 + R() * (r1 - r0), 'walk', R() < 0.5 ? 1 : -1, 'ok', { cone: true, range: 44, speed: 12 + R() * 4, r0, r1, pause: 0, cool: 0 })); }
  S.camp = null;
  if (campOn) {
    const faces = (info.faces && info.faces.length ? info.faces : [SP().gen('refugee', 3), SP().gen('boy_hoodie', 4), SP().gen('girl_braids', 9)]).slice(0, 4); const hostile = info.camp.att === 'hostile' || info.camp.att === 'predatory';
    const people = []; const guard = (sp, gx) => { const en = mkEn(hostile ? Object.assign({}, sp, { item: 'ak' }) : sp, gx, hostile ? 'aim' : 'idle', -1, info.camp.att === 'desperate' ? 'hungry' : 'ok', {}); people.push(en); return en; };
    guard(faces[1] || faces[0], cx0 + 4); if (hostile || info.camp.size > 4) guard(faces[2] || faces[0], cx0 + 22);
    const lead = mkEn(faces[0], cx0 + 96, 'idle', -1, info.camp.att === 'desperate' ? 'hungry' : 'ok', {}); lead.el.insertAdjacentHTML('beforeend', `<path d="M-3 ${FLOOR - 52} L3 ${FLOOR - 52} L0 ${FLOOR - 48} Z" fill="#f6b37f"/>`); people.push(lead);
    (faces.slice(3).concat([SP().gen('refugee', 11)])).slice(0, 2).forEach((sp, i) => { people.push(mkEn(sp, cx0 + 108 + i * 16, 'sitfloor', -1, 'ok', {})); });
    S.camp = { x0: cx0, people }; S.npcs.push({ kind: 'people', x: cx0 + 6, done: false });
  }
  if (R() < 0.35) { const x = SEG + 40 + R() * (W - SEG * 2 - 80); mkEn(SP().gen(['refugee', 'boy_hoodie', 'girl_braids'][Math.floor(R() * 3)], Math.floor(R() * 1e6)), x, 'sitfloor', 1, 'hurt+hungry', {}); S.npcs.push({ kind: 'injured', x, done: false }); }
  if (R() < 0.35) { const x = SEG + 40 + R() * (W - SEG * 2 - 80); mkEn(SP().gen('scavenger', Math.floor(R() * 1e6)), x, 'idle', -1, 'hungry', {}); S.npcs.push({ kind: 'rival', x, done: false }); }
  S.cam = clamp(pl.x - 80, 0, W - 160); S.dawnHinted = false;
}
X.stop = function () { clearInterval(X.timer); X.timer = null; X.st = null; X.key = ''; if (X.root && X.root.querySelector) { const s = X.root.querySelector('.xsvg'); if (s) s.innerHTML = ''; } };
function start() { if (X.timer) return; X.timer = setInterval(tick, 60); }

/* ---------- taps ---------- */
function toWorld(ev) { const S = X.st, pt = S.svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const m = S.svg.getScreenCTM(); const q = m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; return { x: q.x + S.cam, y: q.y }; }
function goto(x, then) { const p = X.st.p; if (p.hidden) unhide(); p.target = clamp(x, 12, X.st.W - 12); p.then = then || null; }
function unhide() { const p = X.st.p; p.hidden = false; p.el.style.opacity = 1; }
function onTap(ev) {
  const S = X.st; if (!S || (X.hooks.modalOpen && X.hooks.modalOpen()) || C.paused) return; ev.preventDefault(); const p = S.p;
  try { if (C.Audio) { C.Audio.start(); C.Audio.sfx('tap'); } } catch (e) {}
  if (p.busy || S.e.dead) return; const w = toWorld(ev);
  if (w.x < 22 && Math.abs(w.y - (FLOOR - 18)) < 24) { goto(26, () => { if (X.hooks.exit) X.hooks.exit(); }); return; }
  if (S.camp) { const tp = S.camp.people.find((q) => Math.abs(w.x - q.x) <= 14 && w.y > 30); if (tp) { goto(tp.x - 22, () => { if (X.hooks.meet) X.hooks.meet('people'); }); return; } }
  const sti = S.stairs.find((q) => Math.abs(w.x - q.x) <= 18 && w.y > 28); if (sti) { goto(sti.x, () => { if (X.hooks.stairs) X.hooks.stairs(sti.dir); }); return; }
  const si = S.spots.findIndex((s) => !s.done && Math.abs(w.x - s.x) <= 13 && w.y > 50);
  if (si >= 0) { goto(S.spots[si].x, () => search(si)); return; }
  const hi = S.hides.findIndex((h) => Math.abs(w.x - h.x) <= 12 && w.y > 36);
  if (hi >= 0) { goto(S.hides[hi].x, () => hide()); return; }
  const nn = S.npcs.find((n) => !n.done && Math.abs(w.x - n.x) <= 14 && w.y > 36);
  if (nn) { goto(nn.x - 16, null); return; }
  goto(w.x, null);
}
function search(i) {
  const S = X.st, p = S.p; if (!S || p.busy) return; const sp = S.spots[i]; if (!sp || sp.done) return;
  if (S.e.hours <= 0) { hint('It is almost dawn. Head home.'); return; }
  p.busy = true; setKind(p, 'sitfloor');
  setTimeout(() => { if (!X.st) return; p.busy = false; setKind(p, 'idle'); sp.done = true; { const ff = S.e.floor || 0; S.e.xsF = S.e.xsF || {}; (S.e.xsF[ff] = S.e.xsF[ff] || []).push(i); } const g = S.svg.querySelector('#xs' + i); if (g) { g.setAttribute('opacity', '0.4'); const b = g.querySelector('.blink'); if (b) b.remove(); } if (X.hooks.search) X.hooks.search(i); }, 900);
}
function hide() { const p = X.st.p; p.hidden = true; p.el.style.opacity = 0.35; setKind(p, 'idle'); hint('Hidden. Tap anywhere to come out.'); }

/* ---------- the loop ---------- */
function tick() {
  const S = X.st; if (!S || !X.root || !X.root.isConnected) return;
  const now = performance.now(); let dt = Math.min(0.12, (now - S.t) / 1000); S.t = now;
  const mo = !!(X.hooks.modalOpen && X.hooks.modalOpen());
  /* only one event at a time: once something has happened, nothing else can until the sheets are done and a few quiet seconds have passed */
  if (S.lock) { if (mo) S.sawModal = true; else if (S.sawModal || now - S.lockT > 1800) { S.lock = false; S.sawModal = false; S.grace = now + 6500; settle(S, now); } }
  if (C.paused || mo) return;
  const p = S.p, e = S.e;
  const can = () => !S.lock && now > (S.grace || 0) && (e.encN || 0) < 4;
  const fire = () => { S.lock = true; S.lockT = now; S.sawModal = false; p.target = null; p.then = null; };
  if (e.dead) { setKind(p, 'dead'); p.state = 'dead'; redraw(p); return; }
  p.state = X.hooks.stateNow ? X.hooks.stateNow() : p.state;
  if (p.target != null && !p.busy) {
    const dx = p.target - p.x, spd = (p.sneak ? 13 : 25) * (X.hooks.slow ? X.hooks.slow() : 1), step = spd * dt; e.sneak = !!p.sneak; e.hours = Math.max(0, e.hours - Math.min(Math.abs(dx), step) * (p.sneak ? 1 / 110 : 1 / 300));
    if (Math.abs(dx) <= step) { p.x = p.target; p.target = null; const f = p.then; p.then = null; setKind(p, 'idle'); if (f) f(); }
    else { p.x += Math.sign(dx) * step; p.dir = Math.sign(dx); p.walked += step; setKind(p, p.sneak ? 'sneak' : 'walk'); if (!p.sneak && p.walked > 55) { p.walked = 0; e.noise += 1; } else if (p.sneak && p.walked > 170) { p.walked = 0; e.noise += 1; } }
  } else if (!p.busy && p.kind !== 'idle' && !p.hidden) setKind(p, 'idle');
  S.pats.forEach((pt) => {
    if (now < pt.pause) { setKind(pt, 'idle'); }
    else { const nx = pt.x + pt.dir * pt.speed * dt; if (nx < pt.r0 || nx > pt.r1) { pt.dir *= -1; pt.pause = now + 1200 + Math.random() * 2500; } else pt.x = nx; setKind(pt, 'walk'); }
    const dx = p.x - pt.x; const facing = (dx > 0 && pt.dir > 0) || (dx < 0 && pt.dir < 0);
    const range = p.hidden ? 8 : (p.sneak ? 24 : 42) + Math.min(14, e.noise * 2); pt.range = Math.round(clamp(range, 18, 56));
    if (can() && now > pt.cool && Math.abs(dx) < range && (facing || Math.abs(dx) < 10)) { pt.cool = now + 20000; fire(); flash(); if (X.hooks.spotted) X.hooks.spotted(); }
  });
  S.npcs.forEach((n) => { if (can() && !n.done && Math.abs(p.x - n.x) < 26) { n.done = true; fire(); if (X.hooks.meet) X.hooks.meet(n.kind); } });
  const want = clamp(p.x - 80, 0, S.W - 160); S.cam += (want - S.cam) * 0.2;
  S.wg.style.transform = `translate(${-S.cam}px,0px)`; S.dark.parentNode.querySelector('#xtorch').setAttribute('cx', p.x - S.cam);
  [p].concat(S.pats).forEach((en) => { en.el.style.transform = `translate(${en.x}px,0px)`; });
  S.tick++; if (S.tick % 5 === 0) { const nz = X.root.querySelector('.xnoise i'); if (nz) { nz.style.width = clamp(e.noise * 9, 0, 100) + '%'; } if (e.hours <= 0 && !S.dawnHinted) { S.dawnHinted = true; hint('Dawn is breaking. Head for the green door.'); } }
}
/* after being caught, whoever caught you moves off along their route, so you are not standing in their light when the sheets close */
function settle(S, now) { const p = S.p; S.pats.forEach((pt) => { if (Math.abs(pt.x - p.x) < 110) { pt.x = pt.x < p.x ? Math.max(pt.r0, p.x - 160) : Math.min(pt.r1, p.x + 160); pt.dir = pt.x < p.x ? -1 : 1; pt.cool = now + 20000; pt.pause = now + 2500; } }); }
function flash() { const f = X.st && X.st.flash; if (!f) return; f.setAttribute('opacity', '.35'); setTimeout(() => f.setAttribute('opacity', '0'), 350); try { if (C.Audio) C.Audio.sfx('alarm'); if (C.Audio) C.Audio.buzz([40, 30, 40]); } catch (e) {} }
X.hint = hint;
X.tick = tick;
C.Expedition = X;
if (typeof module !== 'undefined') module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
