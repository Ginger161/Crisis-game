/* CRISIS — the night run, controlled by you
   A building drawn like the hideout (sites.js). Tap the floor to walk. Tap furniture to go through it. Tap a wardrobe, curtain or counter to hide.
   Tap 🤫 to sneak: slower, quieter, harder to spot. Patrols walk their routes: the pale cone is what they can see.
   Walk into someone and a scene plays. Tap the green door to head home. The torch only lights what is near you. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const X = { hooks: {}, st: null, root: null, timer: null, key: '' };
const NS = 'http://www.w3.org/2000/svg';
const SC = () => C.Scenes, SD = () => C.Side, SP = () => C.Sprites;
const ST = () => C.Sites;
const FLOOR = 70, SEG = 240, VW = 176, FIG = 0.95;   /* same scale as the hideout: rooms 240 x 64, the camera 176 wide */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const usable = () => typeof document !== 'undefined' && document.createElementNS && document.createElement && typeof document.createElement('div').appendChild === 'function';

function ensureRoot() {
  if (X.root) return;
  X.root = document.createElement('div'); X.root.className = 'xwrap';
  X.root.innerHTML = '<div class="xsvg"></div><div class="xnoise"><i></i></div><div class="xhint"></div><button class="xpill" hidden></button>';
  X.root.addEventListener('pointerdown', onTap);
  X.root.querySelector('.xpill').addEventListener('pointerdown', (ev) => { ev.stopPropagation(); ev.preventDefault(); if (X.hooks.modalOpen && X.hooks.modalOpen()) return; const a = X.pillAct; if (a && X.st && !X.st.p.busy) a(); });
}
X.setSneak = function (on) { if (!X.st) return; X.st.p.sneak = !!on; };
function hint(t) { if (!X.root) return; const h = X.root.querySelector('.xhint'); h.textContent = t; h.classList.add('on'); clearTimeout(X.ht); X.ht = setTimeout(() => h.classList.remove('on'), 2600); }
function redraw(en) {
  const cone = en.cone ? `<path transform="scale(${en.dir} 1)" d="M6 ${FLOOR - 30} L${en.range + 30} ${FLOOR - 46} L${en.range + 30} ${FLOOR - 4} Z" fill="rgba(255,214,120,.09)"/><rect x="${en.dir > 0 ? 4 : -6}" y="${FLOOR - 31}" width="2" height="1.6" fill="#fff4c0"/>` : '';
  en.el.innerHTML = cone + SD().place(en.sp, en.kind, 0, en.g || FLOOR, { dir: en.dir, state: en.state, s: FIG });
  en.dk = en.kind; en.dd = en.dir; en.ds = en.state;
}
function setKind(en, k) { if (en.kind !== k) { en.kind = k; redraw(en); } else if (en.dd !== en.dir || en.ds !== en.state) redraw(en); }
function mkEn(sp, x, kind, dir, state, o) {
  const el = document.createElementNS(NS, 'g'); X.st.actors.appendChild(el);
  const en = Object.assign({ sp, x, kind, dir, state: state || 'ok', el, g: FLOOR }, o || {}); redraw(en); el.style.transform = `translate(${x}px,0px)`; return en;
}
/* ---------- building the place ---------- */
X.attach = function (container, e, info) {
  if (!usable() || !SC() || !SD() || !ST()) return; ensureRoot();
  const key = e.loc + '|' + e.xseed + '|' + (e.floor || 0);
  if (!X.st || X.key !== key) { build(e, info); X.key = key; }
  X.st.e = e; X.st.info = info; container.appendChild(X.root); start(); if (e.homing) setTimeout(() => X.runHome(), 60);
  
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
  const risk = info.risk || 2;
  const L = ST().layout({ plan: info.plan || 'corridor', floors: nfl, floor: fl, seed: info.seed || e.xseed || 1 });
  const W = L.W, nseg = L.types.length;
  const pst = info.piles || [];
  const spots = L.piles.map((p, i) => ({ x: p.x, k: p.k, lockable: !!p.lock, locked: !!(pst[i] ? pst[i].locked : p.lock), broken: !!(pst[i] && pst[i].broken), searched: !!(pst[i] && pst[i].searched), empty: !!(pst[i] && pst[i].empty) }));
  pst.slice(L.piles.length).forEach((q) => spots.push({ age: q.age || 0, x: q.x, k: q.k || 'body', dyn: true, searched: !!q.searched, empty: !!q.empty, locked: false, broken: false }));
  const traces = (L.traces || []).map((t) => ({ x: t.x, k: t.k })).concat((info.notes || []).map((n) => ({ x: n.x, k: 'note', dyn: true })));
  const bst = info.blocks || []; const blocks = (L.blocks || []).map((b, i) => ({ x: b.x, kind: b.kind, open: !!bst[i] }));
  const hides = L.hides.map((h) => ({ x: h.x, k: h.k }));
  /* the rest of the building, stacked like the hideout: other floors are there, dim, so you feel the boots above you */
  let others = ''; const STEP = ST().STEP;
  for (let f = 0; f < nfl; f++) { if (f === fl) continue; const Lf = ST().layout({ plan: info.plan || 'corridor', floors: nfl, floor: f, seed: info.seed || e.xseed || 1 }); others += `<g transform="translate(0 ${-(f - fl) * STEP})">${Lf.art}<rect x="-40" y="${FLOOR - 78}" width="${Lf.W + 80}" height="92" fill="#02040b" opacity="${info.day ? 0.35 : 0.8}"/></g>`; }
  /* outside the building: the campus at night (or a bleached day), the roofline, the ground */
  { const topY = FLOOR - 64 - 14 - (nfl - 1 - fl) * STEP, botY = FLOOR + 14 + fl * STEP; let sk = `<rect x="-400" y="${topY - 900}" width="${W + 800}" height="900" fill="url(#xsky)"/>`;
    for (let i = 0; i < 14; i++) { const bx = -300 + R() * (W + 600), bw = 30 + R() * 60, bh = 30 + R() * 140; sk += `<rect x="${bx.toFixed(0)}" y="${(topY - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="#0c0d14" opacity=".9"/>`; if (R() < 0.3) sk += `<rect x="${(bx + bw * 0.4).toFixed(0)}" y="${(topY - bh + 8).toFixed(0)}" width="3" height="3" fill="#e8a040" opacity=".55"/>`; }
    for (let i = 0; i < 40; i++) sk += `<rect x="${(-300 + R() * (W + 600)).toFixed(0)}" y="${(topY - 200 - R() * 600).toFixed(0)}" width=".8" height=".8" fill="#cfd3e8" opacity="${(0.3 + R() * 0.5).toFixed(2)}"/>`;
    /* the campus around you: something always burning, muzzle flashes far off, crows over the roofs */
    if (!info.day) { const n = 1 + (R() < 0.5 ? 1 : 0); for (let k = 0; k < n; k++) { const bx = -200 + R() * (W + 400), bw = 40 + R() * 40, bh = 70 + R() * 80, by = topY - bh;
        sk += `<circle cx="${(bx + bw / 2).toFixed(0)}" cy="${(by + 10).toFixed(0)}" r="${(bw * 1.6).toFixed(0)}" fill="url(#xfire)"/><rect x="${bx.toFixed(0)}" y="${by.toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="#120a08"/>`;
        for (let w = 0; w < 6; w++) sk += `<rect class="fire" style="animation-delay:-${(w * 0.4).toFixed(1)}s" x="${(bx + 6 + (w % 3) * (bw / 3.4)).toFixed(0)}" y="${(by + 10 + Math.floor(w / 3) * 18).toFixed(0)}" width="5" height="6" fill="#ff8a2a"/>`;
        sk += `<path class="smoke" d="M${(bx + bw / 2).toFixed(0)} ${by.toFixed(0)} q-14 -40 6 -80 q18 -40 -4 -90" stroke="#2a2422" stroke-width="22" fill="none" opacity=".55"/>`;
        for (let em = 0; em < 6; em++) sk += `<rect class="ember" style="animation-delay:-${(em * 0.9).toFixed(1)}s;--ex:${((R() - 0.5) * 30).toFixed(0)}px" x="${(bx + bw / 2 + (R() - 0.5) * 20).toFixed(0)}" y="${by.toFixed(0)}" width="1" height="1" fill="#ffc060"/>`; }
      for (let k = 0; k < 3; k++) sk += `<rect class="mflash" style="animation-delay:-${(R() * 9).toFixed(1)}s;animation-duration:${(7 + R() * 9).toFixed(1)}s" x="${(-250 + R() * (W + 500)).toFixed(0)}" y="${(topY - 20 - R() * 60).toFixed(0)}" width="2" height="1.4" fill="#fff4b0"/>`; }
    for (let k = 0; k < 3; k++) sk += `<path class="crow" style="animation-delay:-${(R() * 30).toFixed(1)}s;animation-duration:${(26 + R() * 20).toFixed(0)}s" d="M${(-200 + R() * 200).toFixed(0)} ${(topY - 60 - R() * 120).toFixed(0)} l3 -2 l3 2 l3 -2 l3 2" stroke="#0a0a0a" stroke-width="1" fill="none"/>`;
    if (!L.outside) sk += `<rect x="-6" y="${topY - 8}" width="${W + 12}" height="8" fill="#4a3022"/><rect x="-6" y="${topY - 8}" width="${W + 12}" height="1.5" fill="#6a4a32"/>`;
    sk += `<rect x="-400" y="${botY}" width="${W + 800}" height="600" fill="#1a140f"/><rect x="-400" y="${botY}" width="${W + 800}" height="2" fill="#3a2a1e"/>`;
    for (let i = 0; i < 30; i++) sk += `<rect x="${(-300 + R() * (W + 600)).toFixed(0)}" y="${(botY + 2 + R() * 20).toFixed(0)}" width="${(2 + R() * 6).toFixed(1)}" height="1.2" fill="#2e241a"/>`;
    others = sk + others; }
    let props = '';
  const campOn = !!(info.hasGroup && info.camp && fl === (info.groupFloor || 0)); const cx0 = Math.max(SEG + 20, W - SEG + 20); if (campOn) props += campArt(cx0, info.camp);
  spots.forEach((sp, i) => { props += `<g id="xs${i}" class="xpile" opacity="${sp.empty ? 0.55 : 1}">${sp.dyn ? ST().pileArt(sp.k, sp.x, sp.age) : ''}${sp.broken ? `<rect x="${sp.x - 16}" y="${FLOOR - 46}" width="32" height="46" fill="#05040a" opacity=".0"/>${ST().debris(sp.x)}` : ''}${sp.locked ? `<g class="xlk">${ST().padlock(sp.x, FLOOR - 22)}</g>` : ''}${sp.searched ? '' : `<rect class="blink" x="${sp.x - 1.5}" y="${FLOOR - 46}" width="3" height="3" fill="#ffd070"/>`}</g>`; });
  /* a note left by whoever died here; boot prints where someone else got here first */
  traces.forEach((t) => { if (t.dyn) props += ST().traceArt ? ST().traceArt('note', t.x) : ''; });
  pst.forEach((q, i) => { const sx = spots[i] && spots[i].x; if (q && q.prints && sx) for (let k = 0; k < 6; k++) props += `<rect x="${(sx - 22 + k * 8 + (k % 2) * 2).toFixed(0)}" y="${FLOOR - 1.2 - (k % 2) * 0.8}" width="3.2" height="1.2" fill="#2a1d12" opacity=".75"/>`; });
  blocks.forEach((b, i) => { props += `<g id="xb${i}"${b.open ? ' display="none"' : ''}>${ST().blockArt(b.x, b.kind)}</g>`; });
  const sky = info.day ? ['#7a7262', '#a99f86'] : ['#0a0c18', '#1c2030'];
  X.root.querySelector('.xsvg').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -20 ${VW} 100" preserveAspectRatio="xMidYMax meet" shape-rendering="crispEdges"><defs>${SC().GLOWDEF}<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><linearGradient id="xsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><radialGradient id="xfire"><stop offset="0" stop-color="#ff8a30" stop-opacity=".28"/><stop offset="1" stop-color="#ff6a10" stop-opacity="0"/></radialGradient><radialGradient id="xlg"><stop offset=".15" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient><linearGradient id="xbg" x1="0" y1="0" x2="1" y2="0"><stop offset=".05" stop-color="#000"/><stop offset=".7" stop-color="#555"/><stop offset="1" stop-color="#fff"/></linearGradient><linearGradient id="xwg2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffc070" stop-opacity=".22"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></linearGradient><linearGradient id="xpg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".85"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<mask id="xm" maskUnits="userSpaceOnUse" x="-600" y="-600" width="${W + 1200}" height="1400"><rect x="-600" y="-600" width="${W + 1200}" height="1400" fill="#fff"/><g id="xlamp"><circle cx="0" cy="0" r="22" fill="url(#xlg)"/><path id="xcone" d="M0 -5 L100 -32 L100 30 L0 5 Z" fill="url(#xbg)"/></g><g id="xpb"></g></mask></defs>
<g id="xwg"><g id="xworld">${others}${L.art}${props}</g><g id="xact"></g>
<rect id="xdark" x="-600" y="${FLOOR - 80}" width="${W + 1200}" height="96" fill="#02040b" opacity="${info.day ? 0.22 : 0.8}" mask="url(#xm)" pointer-events="none"/>
<g id="xwarm" pointer-events="none"><path id="xwcone" d="M0 -5 L100 -32 L100 30 L0 5 Z" fill="url(#xwg2)"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect class="dust" style="animation-delay:-${(i * 1.3).toFixed(1)}s;--dx:${(8 + i * 11)}px" x="${8 + i * 10}" y="${-14 + (i * 7) % 24}" width=".7" height=".7" fill="#ffe8c0" opacity=".55"/>`).join('')}</g></g>
<rect id="xtint" x="-50" y="-400" width="1000" height="900" fill="#0b1430" opacity="${info.day ? 0.04 : 0.24}" pointer-events="none"/><rect id="xvig" x="-50" y="-400" width="1000" height="900" fill="none" pointer-events="none"/><rect id="xflash" x="-50" y="-400" width="1000" height="900" fill="#b8402f" opacity="0" pointer-events="none"/></svg>`;
  const svg = X.root.querySelector('svg');
  X.st = { W, nseg, R, svg, L, wg: svg.querySelector('#xwg'), actors: svg.querySelector('#xact'), dark: svg.querySelector('#xdark'), lamp: svg.querySelector('#xlamp'), warm: svg.querySelector('#xwarm'), pb: svg.querySelector('#xpb'), rain: !!info.rain, nextBolt: performance.now() + 15000 + Math.random() * 20000, flash: svg.querySelector('#xflash'), spots, hides, blocks, traces, stairs: L.stairs, walls: L.walls, pats: [], npcs: [], cam: 0, t: performance.now(), e, info, tick: 0 };
  const S = X.st;
  const startX = e.arrive === 'left' ? 52 : e.arrive === 'right' ? W - 52 : 32;
  const pl = mkEn(info.sp, startX, 'idle', e.arrive === 'right' ? -1 : 1, info.state, {}); pl.sneak = false; pl.target = null; pl.busy = false; pl.hidden = false; pl.walked = 0; S.p = pl;
  /* patrols: the more dangerous the place, the more of them; never in the room you come in through */
  const nPat = (info.danger ? 1 : 0) + (info.day ? 2 : 0) + (risk >= 4 ? 1 : 0) + (risk >= 3 && R() < 0.5 ? 1 : 0) + (R() < 0.3 ? 1 : 0);
  const types = ['bandit_soldier', 'bandit_heavy', 'bandit_scout', 'bandit_kid'];
  const startRoom = Math.floor(startX / SEG);
  for (let i = 0; i < nPat && nseg > 1; i++) {
    let room = Math.floor(R() * nseg); if (room === startRoom) room = (room + 1 + Math.floor(R() * (nseg - 1))) % nseg; if (room === startRoom) continue;
    /* most patrols keep to their own room; some walk the whole floor through the doorways */
    const roam = R() < 0.35; const r0 = roam ? 40 : room * SEG + 26, r1 = roam ? W - 40 : room * SEG + SEG - 26;
    const sp = SP().gen(types[Math.floor(R() * types.length)], Math.floor(R() * 1e6));
    { const qm = document.createElementNS(NS, 'text'); qm.setAttribute('font-size', '9'); qm.setAttribute('fill', '#ffd070'); qm.setAttribute('text-anchor', 'middle'); qm.setAttribute('display', 'none'); qm.textContent = '?'; S.actors.appendChild(qm); S.qms = S.qms || []; S.qms.push(qm); }
    let q0 = r0, q1 = r1; const x0p = room * SEG + 60; blocks.forEach((b) => { if (!b.open) { if (b.x <= x0p && b.x + 10 > q0) q0 = b.x + 14; if (b.x > x0p && b.x - 10 < q1) q1 = b.x - 14; } });
    S.pats.push(mkEn(sp, room * SEG + 60 + R() * (SEG - 120), 'walk', R() < 0.5 ? 1 : -1, 'ok', { qi: S.pats.length, cone: true, range: 44, speed: 11 + R() * 4, r0: q0, r1: q1, pause: 0, cool: 0 }));
  }
  S.camp = null;
  if (campOn) {
    const faces = (info.faces && info.faces.length ? info.faces : [SP().gen('refugee', 3), SP().gen('boy_hoodie', 4), SP().gen('girl_braids', 9)]).slice(0, 4); const hostile = info.camp.att === 'hostile' || info.camp.att === 'predatory';
    const people = []; const guard = (sp, gx) => { const en = mkEn(hostile ? Object.assign({}, sp, { item: 'ak' }) : sp, gx, hostile ? 'aim' : 'idle', -1, info.camp.att === 'desperate' ? 'hungry' : 'ok', {}); people.push(en); return en; };
    guard(faces[1] || faces[0], cx0 + 4); if (hostile || info.camp.size > 4) guard(faces[2] || faces[0], cx0 + 22);
    const lead = mkEn(faces[0], cx0 + 96, 'idle', -1, info.camp.att === 'desperate' ? 'hungry' : 'ok', {}); lead.el.insertAdjacentHTML('beforeend', `<path d="M-3 ${FLOOR - 46} L3 ${FLOOR - 46} L0 ${FLOOR - 42} Z" fill="#f6b37f"/>`); people.push(lead);
    (faces.slice(3).concat([SP().gen('refugee', 11)])).slice(0, 2).forEach((sp, i) => { people.push(mkEn(sp, cx0 + 108 + i * 16, 'sitfloor', -1, 'ok', {})); });
    S.camp = { x0: cx0, people }; S.npcs.push({ kind: 'people', x: cx0 + 6, done: false });
    S.pats = S.pats.filter((pt) => { if (Math.abs(pt.x - cx0 - 60) < 140) { pt.el.remove(); return false; } return true; });
  }
  /* the person this place is about, if they are still here */
  if (info.story && fl === (info.story.floor || 0) && nseg > 1) { const x = SEG + 150; const en = mkEn(info.story.sp, x, info.story.kind || 'sitfloor', -1, info.story.state || 'ok', {}); S.npcs.push({ kind: 'story', x, done: false, en }); S.pats.forEach((pt) => { if (Math.abs(pt.x - x) < 60) pt.x = Math.max(pt.r0, Math.min(pt.r1, x + 120)); }); }
  if (R() < 0.3 && nseg > 2) { const x = SEG * 2 + 80 + R() * 80; mkEn(SP().gen(['refugee', 'boy_hoodie', 'girl_braids'][Math.floor(R() * 3)], Math.floor(R() * 1e6)), x, 'sitfloor', 1, 'hurt+hungry', {}); S.npcs.push({ kind: 'injured', x, done: false }); }
  if (R() < 0.3 && nseg > 2) { const x = SEG + 40 + R() * (W - SEG - 80); mkEn(SP().gen('scavenger', Math.floor(R() * 1e6)), x, 'idle', -1, 'hungry', {}); S.npcs.push({ kind: 'rival', x, done: false }); }
  S.cam = clamp(pl.x - VW / 2, -20, W - VW + 20); S.dawnHinted = false;
}
/* the game tells the scene when a pile has been gone through or emptied */
X.markPile = function (i, st) { const S = X.st; if (!S || !S.spots[i]) return; Object.assign(S.spots[i], st); const g = S.svg.querySelector('#xs' + i); if (!g) return; g.setAttribute('opacity', S.spots[i].empty ? '0.55' : '1'); if (S.spots[i].searched) { const b = g.querySelector('.blink'); if (b) b.remove(); } };
X.addPile = function (q) { const S = X.st; if (!S) return -1; const i = S.spots.length; S.spots.push({ x: q.x, k: q.k, dyn: true, searched: false, empty: false, locked: false, broken: false }); const w = S.svg.querySelector('#xworld'); if (w) w.insertAdjacentHTML('beforeend', `<g id="xs${i}" class="xpile">${ST().pileArt(q.k, q.x)}<rect class="blink" x="${q.x - 1.5}" y="${FLOOR - 46}" width="3" height="3" fill="#ffd070"/></g>`); (S.bodies || []).forEach((b) => { if (Math.abs(b.x - q.x) < 2) b.el.remove(); }); return i; };
/* violence you see: a spray of blood, the screen jolts, red at the edges when it is you */
function burst(wx, wy, n) { const S = X.st; if (!S) return; const g = document.createElementNS(NS, 'g'); let o = ''; for (let i = 0; i < (n || 14); i++) { const a = -Math.PI * (0.1 + Math.random() * 0.8), v = 6 + Math.random() * 16; o += `<rect class="bl" style="--bx:${(Math.cos(a) * v * (Math.random() < 0.5 ? -1 : 1)).toFixed(1)}px;--by:${(Math.sin(a) * v).toFixed(1)}px;animation-delay:${(Math.random() * 0.08).toFixed(2)}s" x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${(0.8 + Math.random()).toFixed(1)}" height="${(0.8 + Math.random()).toFixed(1)}" fill="${Math.random() < 0.5 ? '#9a1a12' : '#6a0e0a'}"/>`; } o += `<ellipse class="pool" cx="${wx.toFixed(1)}" cy="${FLOOR - 0.6}" rx="2" ry=".8" fill="#5a0c08" opacity=".95"/>`; g.innerHTML = o; S.svg.querySelector('#xworld').appendChild(g); }
X.shake = function (k) { if (!X.root) return; X.root.classList.remove('shake', 'shake2'); void X.root.offsetWidth; X.root.classList.add(k > 1 ? 'shake2' : 'shake'); };
X.hurtFx = function () { if (!X.root) return; let v = X.root.querySelector('.xhurt'); if (!v) { v = document.createElement('div'); v.className = 'xhurt'; X.root.appendChild(v); } v.classList.remove('on'); void v.offsetWidth; v.classList.add('on'); X.shake(1); };
X.openBlock = function (i) { const S = X.st; if (!S || !S.blocks[i]) return; S.blocks[i].open = true; const g = S.svg.querySelector('#xb' + i); if (g) g.setAttribute('display', 'none'); };
X.setPile = function (i, st) { const S = X.st; if (!S || !S.spots[i]) return; const sp = S.spots[i]; Object.assign(sp, st); const g = S.svg.querySelector('#xs' + i); if (!g) return; if (!sp.locked) { const l = g.querySelector('.xlk'); if (l) l.remove(); } if (sp.broken && !g.dataset.br) { g.dataset.br = 1; g.insertAdjacentHTML('afterbegin', ST().debris(sp.x)); } g.setAttribute('opacity', sp.empty ? '0.55' : '1'); };
/* a fight in the room: the game decided how it went; the scene shows it */
X.resolveAttack = function (pi, res) {
  const S = X.st; if (!S) return; const pt = S.pats[pi]; const p = S.p; if (!pt) return;
  p.dir = Math.sign(pt.x - p.x) || 1; setKind(p, res.weapon === 'pistol' ? 'aim' : 'jump'); p.busy = true;
  setTimeout(() => { if (!X.st) return; p.busy = false; setKind(p, 'idle');
    try { if (C.Audio) C.Audio.sfx(res.weapon === 'pistol' ? 'shot' : 'slash'); } catch (er) {}
    if (res.win) { burst(pt.x, FLOOR - 22, res.weapon === 'pistol' ? 20 : 14); X.shake(res.weapon === 'pistol' ? 2 : 1); pt.dead = true; pt.cone = false; pt.alert = null; setKind(pt, 'dead'); pt.state = 'dead'; redraw(pt); S.pats.splice(pi, 1); S.bodies = (S.bodies || []).concat([pt]); if (res.loud) { S.e.noise += 8; S.pats.forEach((o) => { if (Math.abs(o.x - p.x) < SEG * 2.5) o.alert = { x: p.x, until: performance.now() + 12000 }; }); flash(); } }
    else { pt.dir = Math.sign(p.x - pt.x) || 1; pt.cool = 0; S.grace = 0; }
  }, 520);
};
X.stop = function () { try { if (C.Audio) { C.Audio.flies(0); C.Audio.hk = 0; } } catch (er) {} clearInterval(X.timer); X.timer = null; X.st = null; X.key = ''; if (X.root && X.root.querySelector) { const s = X.root.querySelector('.xsvg'); if (s) s.innerHTML = ''; } };
function start() { if (X.timer) return; X.timer = setInterval(tick, 60); }

/* ---------- taps ---------- */
function toWorld(ev) { const S = X.st, pt = S.svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const m = S.svg.getScreenCTM(); const q = m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; return { x: q.x + S.cam, y: q.y }; }
function goto(x, then) { const S = X.st, p = S.p; if (p.hidden) unhide(); let t = clamp(x, 12, S.W - 12); const dir = Math.sign(t - p.x);
  const b = (S.blocks || []).filter((q) => !q.open && (dir > 0 ? q.x > p.x && q.x < t + 8 : q.x < p.x && q.x > t - 8)).sort((a, c) => Math.abs(a.x - p.x) - Math.abs(c.x - p.x))[0];
  if (b) { t = b.x - dir * 9; then = null; } p.target = t; p.then = then || null; }
X.runHome = function (forced) {
  const S = X.st; if (!S || S.e.dead) return; const p = S.p; if (p.busy) return; S.e.homing = true; if (forced) S.e.forced = true; if (p.hidden) unhide(); p.run = true; p.sneak = false;
  const st = S.stairs.find((q) => q.dir === -1);
  if ((S.e.floor || 0) > 0 && st) goto(st.x, () => { if (X.hooks.stairs) X.hooks.stairs(-1); }); else goto(26, () => { if (X.hooks.exit) X.hooks.exit(true); });
};
function unhide() { const p = X.st.p; p.hidden = false; p.el.style.opacity = 1; }
function onTap(ev) {
  const S = X.st; if (!S || (X.hooks.modalOpen && X.hooks.modalOpen()) || C.paused) return; ev.preventDefault(); const p = S.p;
  try { if (C.Audio) { C.Audio.start(); C.Audio.sfx('tap'); } } catch (e) {}
  if (p.busy || S.e.dead) return; if (S.e.forced) return; if (S.e.homing) { S.e.homing = false; p.run = false; } const w = toWorld(ev);
  if ((S.e.floor || 0) === 0 && w.x < 24 && w.y > FLOOR - 50) { goto(26, () => { if (X.hooks.exit) X.hooks.exit(); }); return; }
  if (S.camp) { const tp = S.camp.people.find((q) => Math.abs(w.x - q.x) <= 12 && w.y > FLOOR - 42); if (tp) { goto(tp.x - 22, () => { if (X.hooks.meet) X.hooks.meet('people'); }); return; } }
  const sti = S.stairs.find((q) => Math.abs(w.x - q.x) <= 18 && w.y > FLOOR - 64); if (sti) { goto(sti.x, () => { if (X.hooks.stairs) X.hooks.stairs(sti.dir); }); return; }
  const bi = (S.blocks || []).findIndex((b) => !b.open && Math.abs(w.x - b.x) <= 12 && w.y > FLOOR - 46); if (bi >= 0) { const side = p.x < S.blocks[bi].x ? -1 : 1; goto(S.blocks[bi].x + side * 9, () => { if (X.hooks.barrier) X.hooks.barrier(bi, S.blocks[bi].kind); }); return; }
  const si = S.spots.findIndex((s) => !s.empty && Math.abs(w.x - s.x) <= 14 && w.y > FLOOR - 44 && w.y < FLOOR - 6);
  if (si >= 0) { goto(S.spots[si].x, () => search(si)); return; }
  const hi = S.hides.findIndex((h) => Math.abs(w.x - h.x) <= 12 && w.y > FLOOR - 44 && w.y < FLOOR - 6);
  if (hi >= 0) { goto(S.hides[hi].x, () => hide()); return; }
  const nn = S.npcs.find((n) => !n.done && Math.abs(w.x - n.x) <= 12 && w.y > FLOOR - 40);
  if (nn) { goto(nn.x - 12 * Math.sign(nn.x - p.x || 1), null); return; }
  goto(w.x, null);
}
function search(i) {
  const S = X.st, p = S.p; if (!S || p.busy) return; const sp = S.spots[i]; if (!sp || sp.empty) return; if (sp.locked) { if (X.hooks.pickLock) X.hooks.pickLock(i); return; }
  if (S.e.hours <= 0) { hint('No time. Home.'); return; }
  p.busy = true; setKind(p, sp.searched ? 'idle' : 'sitfloor');
  setTimeout(() => { if (!X.st) return; p.busy = false; setKind(p, 'idle'); if (X.hooks.search) X.hooks.search(i, sp.k); }, sp.searched ? 120 : 700);
}
function hide() { const p = X.st.p; p.hidden = true; p.el.style.opacity = 0.35; setKind(p, 'idle'); hint('Hidden. Tap anywhere to come out.'); }

/* ---------- the one thing you can do right here ---------- */
const REACH = 24;
function nearest() {
  const S = X.st, p = S.p; if (p.busy || p.target != null) return null; const c = [];
  const near = (x) => Math.abs(x - p.x) <= REACH;
  if ((S.e.floor || 0) === 0 && p.x < 40) c.push({ d: Math.abs(p.x - 12), x: 12, y: FLOOR - 48, label: 'Leave', act: () => goto(26, () => { if (X.hooks.exit) X.hooks.exit(); }) });
  S.stairs.forEach((q) => { if (near(q.x)) c.push({ d: Math.abs(q.x - p.x), x: q.x, y: FLOOR - 62, label: q.dir > 0 ? 'Upstairs' : 'Downstairs', act: () => goto(q.x, () => { if (X.hooks.stairs) X.hooks.stairs(q.dir); }) }); });
  (S.blocks || []).forEach((b, i) => { if (!b.open && Math.abs(b.x - p.x) <= REACH) c.push({ d: Math.abs(b.x - p.x) - 2, x: b.x, y: FLOOR - 50, label: b.kind === 'lock' ? 'Locked' : 'Rubble', act: () => { if (X.hooks.barrier) X.hooks.barrier(i, b.kind); } }); });
  S.spots.forEach((sp, i) => { if (!near(sp.x) || sp.broken) return; if (sp.locked) { c.push({ d: Math.abs(sp.x - p.x), x: sp.x, y: FLOOR - 44, label: 'Locked', act: () => goto(sp.x, () => { if (X.hooks.pickLock) X.hooks.pickLock(i); }) }); return; } if (!sp.empty) c.push({ d: Math.abs(sp.x - p.x), x: sp.x, y: FLOOR - 44, label: sp.searched ? 'Look again' : 'Search', act: () => goto(sp.x, () => search(i)) }); else if (['crate', 'desk', 'shelf', 'wardrobe', 'counter'].includes(sp.k) && X.hooks.canBreak && X.hooks.canBreak()) c.push({ d: Math.abs(sp.x - p.x) + 2, x: sp.x, y: FLOOR - 44, label: 'Break up', act: () => goto(sp.x, () => { if (X.hooks.breakUp) X.hooks.breakUp(i); }) }); });
  S.pats.forEach((pt, i) => { const d = Math.abs(pt.x - p.x); if (d > REACH + 6 || pt.dead || !X.hooks.attack) return; const unseen = !((pt.x < p.x && pt.dir > 0) || (pt.x > p.x && pt.dir < 0)) || p.hidden; if (!unseen && !p.sneak) return; c.push({ d: d - 8, x: pt.x, y: FLOOR - 46, label: unseen ? 'Ambush' : 'Attack', act: () => { p.target = null; X.hooks.attack(i, { unseen, sneak: !!p.sneak }); } }); });
  (S.traces || []).forEach((t, i) => { if (Math.abs(t.x - p.x) <= 16) c.push({ d: Math.abs(t.x - p.x) + 4, x: t.x, y: FLOOR - 52, label: 'Read', act: () => { if (X.hooks.read) X.hooks.read(i); } }); });
  S.hides.forEach((h) => { if (near(h.x) && !p.hidden) c.push({ d: Math.abs(h.x - p.x) + 3, x: h.x, y: FLOOR - 46, label: 'Hide', act: () => goto(h.x, () => hide()) }); });
  S.npcs.forEach((n) => { if (!n.done && Math.abs(n.x - p.x) <= REACH + 14) c.push({ d: Math.abs(n.x - p.x) - 5, x: n.x, y: FLOOR - 44, label: n.label || 'Approach', act: () => goto(n.x - 12 * Math.sign(n.x - p.x || 1), null) }); });
  c.sort((a, b) => a.d - b.d); return c[0] || null;
}
function placePill() {
  const S = X.st; const pill = X.root.querySelector('.xpill'); if (!pill) return;
  const n = nearest(); if (!n || (X.hooks.modalOpen && X.hooks.modalOpen())) { if (!pill.hidden) pill.hidden = true; X.pillAct = null; return; }
  const m = S.svg.getScreenCTM(), r = X.root.getBoundingClientRect(); if (!m) return;
  const px = (n.x - S.cam) * m.a + m.e - r.left, py = n.y * m.d + m.f - r.top;
  if (pill.textContent !== n.label) pill.textContent = n.label;
  pill.style.left = Math.max(8, Math.min(r.width - 8, px)).toFixed(0) + 'px'; pill.style.top = Math.max(6, py).toFixed(0) + 'px'; pill.hidden = false; X.pillAct = n.act;
}

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
    const dx = p.target - p.x, spd = (p.sneak ? 13 : p.run ? 58 : 25) * (X.hooks.slow ? X.hooks.slow() : 1), step = spd * dt; e.sneak = !!p.sneak;
    if (Math.abs(dx) <= step) { p.x = p.target; p.target = null; const f = p.then; p.then = null; setKind(p, 'idle'); if (f) f(); }
    else { p.x += Math.sign(dx) * step; p.dir = Math.sign(dx); p.walked += step; setKind(p, p.sneak ? 'sneak' : p.run ? 'run' : 'walk'); if (!p.sneak && p.walked > 55) { p.walked = 0; e.noise += 1; } else if (p.sneak && p.walked > 170) { p.walked = 0; e.noise += 1; } }
  } else if (!p.busy && p.kind !== 'idle' && !p.hidden) setKind(p, 'idle');
  if (e.homing && p.target == null && !p.busy && !S.lock && !p.hidden) X.runHome();
  const roomOf = (v) => Math.floor(v / SEG);
  const sees = (pt) => { const a = Math.min(p.x, pt.x), b = Math.max(p.x, pt.x); if ((S.blocks || []).some((q) => !q.open && q.x > a && q.x < b)) return false; const between = (S.walls || []).filter((wx) => wx > a && wx < b); if (!between.length) return true; if (between.length > 1) return false; const wx = between[0]; return Math.abs(p.x - wx) < 14 && Math.abs(pt.x - wx) < 22; };
  S.pats.forEach((pt) => {
    const qm = S.qms && S.qms[pt.qi];
    /* a noise you made brings them to look, not to catch you through a wall */
    if (!pt.alert && e.noise >= 6 && now > (pt.alertCool || 0) && !sees(pt) && Math.abs(p.x - pt.x) < SEG * 2.2) { pt.alert = { x: p.x, until: now + 9000 }; pt.alertCool = now + 25000; e.noise = Math.max(0, e.noise - 2); }
    if (pt.alert && now > pt.alert.until) pt.alert = null;
    if (qm) { qm.setAttribute('display', pt.alert ? 'inline' : 'none'); qm.setAttribute('x', pt.x); qm.setAttribute('y', FLOOR - 40); }
    if (pt.alert) { const ad = pt.alert.x - pt.x; if (Math.abs(ad) > 6) { pt.dir = Math.sign(ad); pt.x += pt.dir * pt.speed * 1.5 * dt; setKind(pt, 'walk'); } else setKind(pt, 'idle'); }
    else if (now < pt.pause) { setKind(pt, 'idle'); }
    else { const nx = pt.x + pt.dir * pt.speed * dt; if (nx < pt.r0 || nx > pt.r1) { pt.dir *= -1; pt.pause = now + 1200 + Math.random() * 2500; } else pt.x = nx; setKind(pt, 'walk'); }
    const dx = p.x - pt.x; const facing = (dx > 0 && pt.dir > 0) || (dx < 0 && pt.dir < 0);
    const range = p.hidden ? 8 : (p.sneak ? 24 : 42) + Math.min(14, e.noise * 2); pt.range = Math.round(clamp(range, 18, 56));
    if (can() && now > pt.cool && sees(pt) && Math.abs(dx) < range && (facing || Math.abs(dx) < 10)) { pt.cool = now + 20000; pt.alert = null; X.spot = { dist: Math.abs(dx), same: roomOf(pt.x) === roomOf(p.x) }; fire(); flash(); if (X.hooks.spotted) X.hooks.spotted(); }
  });
  S.npcs.forEach((n) => { if (can() && !n.done && Math.abs(p.x - n.x) < 22) { n.done = true; fire(); if (X.hooks.meet) X.hooks.meet(n.kind); } });
  const rr = X.root.getBoundingClientRect(); const asp = rr.height > 0 ? rr.width / rr.height : 16 / 9; const nf = Math.max(1, (S.info && S.info.floors) || 1), fl0 = e.floor || 0, STEP = ST().STEP; const top = FLOOR - 64 - 22 - (nf - 1 - fl0) * STEP, bot = FLOOR + 16 + fl0 * STEP;
    const vw = asp >= 1 ? clamp(112 * asp, 150, 260) : clamp((bot - top) * asp * 1.6, 132, 176), vh = vw / asp;
    let y0 = vh >= bot - top ? top - (vh - (bot - top)) * 0.6 : clamp(FLOOR + 16 - vh * 0.72, top, bot - vh);
    const vbk = vw.toFixed(1) + '|' + y0.toFixed(1); if (S.vbk !== vbk) { S.vbk = vbk; S.svg.setAttribute('viewBox', `0 ${y0.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`); S.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); } S.vw = vw; const want = clamp(p.x - vw / 2, -20, S.W - vw + 20); S.cam += (want - S.cam) * 0.2;
  S.wg.style.transform = `translate(${-S.cam}px,0px)`;
  { const fl = Math.random() < 0.03 ? 0.55 + Math.random() * 0.3 : 0.92 + Math.random() * 0.08; const sc = p.hidden ? 0.25 : p.sneak ? 0.62 : 1; const tf = `translate(${p.x.toFixed(1)} ${FLOOR - 24}) scale(${(p.dir || 1) * sc} ${sc})`;
    S.lamp.setAttribute('transform', tf); S.lamp.setAttribute('opacity', fl.toFixed(2)); S.warm.setAttribute('transform', tf); S.warm.setAttribute('opacity', (fl * (p.sneak ? 0.6 : 1)).toFixed(2));
    if (S.tick % 2 === 0) S.pb.innerHTML = S.pats.filter((pt) => !pt.dead).map((pt) => `<path transform="translate(${pt.x.toFixed(1)} ${FLOOR - 30}) scale(${pt.dir} 1)" d="M4 -2 L${pt.range + 34} -18 L${pt.range + 34} 26 L4 3 Z" fill="url(#xpg)"/><circle cx="${pt.x.toFixed(1)}" cy="${FLOOR - 26}" r="10" fill="#000" opacity=".35"/>`).join('');
    if (S.rain && now > S.nextBolt) { S.nextBolt = now + 14000 + Math.random() * 26000; const fx = S.flash; fx.setAttribute('fill', '#e8eeff'); fx.setAttribute('opacity', '.55'); S.dark.setAttribute('opacity', '0.1'); setTimeout(() => { fx.setAttribute('opacity', '0'); fx.setAttribute('fill', '#b8402f'); if (X.st) X.st.dark.setAttribute('opacity', X.st.info.day ? 0.22 : 0.8); }, 140); try { if (C.Audio && C.Audio.sfx) setTimeout(() => C.Audio.sfx('thunder'), 700); } catch (er) {} } }
  [p].concat(S.pats, S.bodies || []).forEach((en) => { en.el.style.transform = `translate(${en.x}px,0px)`; });
  if (S.tick % 4 === 0 && C.Audio) { try { let near = 1e9; S.pats.forEach((pt) => { if (!pt.dead) near = Math.min(near, Math.abs(pt.x - p.x) - (sees(pt) ? 0 : 40)); }); C.Audio.heart(clamp(1 - near / 90, 0, 1)); let bd = 1e9; S.spots.forEach((sp) => { if (sp.k === 'body') bd = Math.min(bd, Math.abs(sp.x - p.x)); }); C.Audio.flies(clamp(1 - bd / 70, 0, 1)); } catch (er) {} }
  S.tick++; if (S.tick % 2 === 0) placePill(); if (S.tick % 5 === 0) { const nz = X.root.querySelector('.xnoise i'); if (nz) { nz.style.width = clamp(e.noise * 9, 0, 100) + '%'; const up = e.noise > (S.lastNoise || 0); if (up) S.noiseT = now; S.lastNoise = e.noise; nz.parentNode.classList.toggle('on', now - (S.noiseT || -1e9) < 3500); } if (e.hours <= 0.5 && !e.forced && !S.dawnHinted) { S.dawnHinted = true; hint(e.day ? 'The light is going.' : 'The sky is greying.'); } }
}
/* after being caught, whoever caught you moves off along their route, so you are not standing in their light when the sheets close */
function settle(S, now) { const p = S.p; S.pats.forEach((pt) => { if (Math.abs(pt.x - p.x) < 110) { pt.x = pt.x < p.x ? Math.max(pt.r0, p.x - 160) : Math.min(pt.r1, p.x + 160); pt.dir = pt.x < p.x ? -1 : 1; pt.cool = now + 20000; pt.pause = now + 2500; } }); }
function flash() { const f = X.st && X.st.flash; if (!f) return; f.setAttribute('opacity', '.35'); setTimeout(() => f.setAttribute('opacity', '0'), 350); try { if (C.Audio) C.Audio.sfx('alarm'); if (C.Audio) C.Audio.buzz([40, 30, 40]); } catch (e) {} }
X.hint = hint;
X.tick = tick;
C.Expedition = X;
if (typeof module !== 'undefined') module.exports = X;
})(typeof window !== 'undefined' ? window : globalThis);
