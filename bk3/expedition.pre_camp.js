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
  if (info.hasGroup && fl === (info.groupFloor || 0)) {
    const faces = (info.faces && info.faces.length ? info.faces : [SP().gen('refugee', 3), SP().gen('boy_hoodie', 4)]).slice(0, 4); const bx = W - 120;
    faces.forEach((sp, i) => { mkEn(sp, bx + i * 16, i % 2 ? 'sitfloor' : 'idle', -1, i % 2 ? 'hungry' : 'ok', {}); });
    S.npcs.push({ kind: 'people', x: bx + 20, done: false });
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
    const dx = p.target - p.x, spd = p.sneak ? 13 : 25, step = spd * dt; e.sneak = !!p.sneak; e.hours = Math.max(0, e.hours - Math.min(Math.abs(dx), step) * (p.sneak ? 1 / 110 : 1 / 300));
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
