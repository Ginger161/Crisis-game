/* CRISIS — the tap-to-move shelter
   A cutaway of the shelter where your people live, walk and talk. Built for a thumb:
     tap a person        -> select them (tap another person while one is selected: walk over and talk)
     tap the floor       -> the selected person walks there, facing the way they walk
     tap an object       -> they walk to it and use it (bed, table, stove, radio, window, door, prayer mat)
   Between taps the others get on with their own lives: wandering, sitting, praying, and talking in their own voices.
   The scene lives in one persistent element, so walking is not interrupted when the page redraws. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const SPEED = 26;                         // scene units per second
const Cut = { hooks: {}, root: null, actors: {}, key: '', started: false };
const SC = () => C.Scenes, SD = () => C.Side;
const FLOOR = 76;
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = (a) => a[Math.floor(Math.random() * a.length)];
const NS = 'http://www.w3.org/2000/svg';
const ok = () => typeof document !== 'undefined' && document.createElement && document.createElement('div') && typeof document.createElement('div').appendChild === 'function';

function ensureRoot() {
  if (Cut.root) return;
  Cut.root = document.createElement('div'); Cut.root.className = 'cutaway';
  Cut.root.innerHTML = '<div class="cscene"></div><div class="cbubbles"></div><div class="chint"></div>';
  Cut.root.addEventListener('pointerdown', onTap);
}
function build(G) {
  const key = JSON.stringify([G.build, G.shelter]);
  if (key === Cut.key && Cut.svg) return;
  Cut.key = key; Cut.actors = {};
  Cut.root.querySelector('.cscene').innerHTML = SC().shelter({ build: G.build, people: [], actors: true, tone: 0.28 });
  Cut.svg = Cut.root.querySelector('svg'); Cut.layer = Cut.svg.querySelector('#actors');
}
/* ---------- actors ---------- */
function stoolOf(a) { return (a.kind === 'climb' || a.kind === 'peek') ? `<rect x="-7" y="${a.g - 7}" width="14" height="7" fill="#6a4a32"/><rect x="-7" y="${a.g - 7}" width="14" height="2" fill="#8a6a46"/><rect x="-6" y="${a.g - 2}" width="2" height="2" fill="#3a2a1c"/><rect x="4" y="${a.g - 2}" width="2" height="2" fill="#3a2a1c"/>` : ''; }
function drawActor(a) {
  const s = Cut.hooks.person(a.sid); if (!s) return;
  const sel = Cut.hooks.selected() === a.sid;
  a.el.innerHTML = stoolOf(a) + SD().place(s.sp, a.kind, 0, a.g, { dir: a.dir, state: a.state }) + (sel ? `<g class="selmark"><path d="M-3 ${a.g - 41} L3 ${a.g - 41} L0 ${a.g - 37} Z" fill="#f6b37f"/></g>` : '');
}
function addActor(s, pos) {
  const el = document.createElementNS(NS, 'g'); el.setAttribute('class', 'actor'); el.dataset.sid = s.id;
  el.style.transform = `translate(${pos.x}px,0px)`; Cut.layer.appendChild(el);
  const a = { sid: s.id, el, x: pos.x, g: pos.g, kind: pos.kind, dir: pos.dir || 1, state: Cut.hooks.stateOf(s), busy: false, until: 0 };
  Cut.actors[s.id] = a; drawActor(a); return a;
}
function layoutAll(G, fresh) {
  const al = G.S.filter((s) => s.alive); const people = al.map((s) => ({ sp: s.sp, kind: Cut.hooks.poseFor(s), state: Cut.hooks.stateOf(s) }));
  const lay = SC().layout(people, G.build);
  al.forEach((s, i) => {
    const l = lay[i]; let a = Cut.actors[s.id];
    if (!a) a = addActor(s, l);
    else if (fresh && !a.busy) { a.el.style.transition = 'none'; a.x = l.x; a.g = l.g; a.kind = l.kind; a.dir = l.dir; a.el.style.transform = `translate(${l.x}px,0px)`; drawActor(a); }
  });
}
function sync(G) {
  Object.keys(Cut.actors).forEach((id) => { const s = Cut.hooks.person(+id); if (!s || !s.alive) { Cut.actors[id].el.remove(); delete Cut.actors[id]; } });
  layoutAll(G, false);
  Object.values(Cut.actors).forEach((a) => { const s = Cut.hooks.person(a.sid); if (!s) return; const st = Cut.hooks.stateOf(s); if (st !== a.state) { a.state = st; } drawActor(a); });
}
Cut.attach = function (container, G) {
  if (!ok() || !SC() || !SD()) return;
  ensureRoot(); build(G); sync(G); container.appendChild(Cut.root); start();
  if (!Cut.hinted) { Cut.hinted = true; setTimeout(() => hint('Tap someone, then tap the floor or an object'), 600); }
};
Cut.reset = function () { Cut.key = ''; Cut.actors = {}; Cut.svg = null; Cut.layer = null; if (Cut.root) Cut.root.querySelector('.cscene').innerHTML = ''; };
Cut.refresh = function (G) { if (!Cut.root || !Cut.svg) return; layoutAll(G, true); };      // a new day: everyone settles into where they spend it

/* ---------- movement ---------- */
function curX(a) { try { return new DOMMatrix(getComputedStyle(a.el).transform).m41; } catch (e) { return a.x; } }
function walkTo(a, x, done) {
  const tok = a.tok = (a.tok || 0) + 1; if (a.busy && a.kind === 'walk') { const cx = curX(a); a.el.style.transition = 'none'; a.el.style.transform = `translate(${cx}px,0px)`; a.x = cx; }
  x = Math.max(12, Math.min(150, x)); const dx = x - a.x;
  if (Math.abs(dx) < 2) { if (done) done(); return; }
  a.busy = true; a.dir = dx > 0 ? 1 : -1; a.kind = 'walk'; a.g = FLOOR; drawActor(a);
  const t = Math.max(0.35, Math.abs(dx) / SPEED);
  void a.el.getBoundingClientRect();      // settle the starting position, then start the move
  a.el.style.transition = `transform ${t}s linear`; a.el.style.transform = `translate(${x}px,0px)`;
  setTimeout(() => { if (a.tok !== tok) return; a.x = x; a.kind = 'idle'; a.g = FLOOR; a.busy = false; drawActor(a); if (done) done(); }, t * 1000 + 40);
}
function pose(a, kind, x, g, dir, ms, then) {         // lie down / kneel / sit for a moment, then stand again
  a.busy = true; a.el.style.transition = 'none'; a.x = x; a.el.style.transform = `translate(${x}px,0px)`; a.kind = kind; a.g = g; a.dir = dir || 1; drawActor(a);
  setTimeout(() => { a.kind = 'idle'; a.g = FLOOR; a.busy = false; drawActor(a); if (then) then(); }, ms);
}
function toScene(e) { const svg = Cut.svg; const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
function hint(text) { const h = Cut.root.querySelector('.chint'); h.textContent = text || ''; h.classList.toggle('on', !!text); if (text) setTimeout(() => { if (h.textContent === text) { h.classList.remove('on'); } }, 1800); }
function onTap(e) {
  if (!Cut.svg || !Cut.hooks.person) return; if (C.paused || (Cut.hooks.modalOpen && Cut.hooks.modalOpen())) return; e.preventDefault(); try { if (C.Audio) { C.Audio.start(); C.Audio.sfx('tap'); } } catch (x) {}
  const p = toScene(e); const HOT = SC().HOT; const G = Cut.hooks.G();
  const pr = HOT.poster.rect; if (p.x >= pr[0] && p.x <= pr[0] + pr[2] && p.y >= pr[1] && p.y <= pr[1] + pr[3]) { if (knock(p)) return; }
  /* a person? */
  const hit = Object.values(Cut.actors).find((a) => Math.abs(p.x - a.x) <= 10 && p.y >= a.g - 36 && p.y <= a.g + 4);
  const selId = Cut.hooks.selected(); const sel = Cut.actors[selId];
  if (hit && hit.sid !== selId) {
    if (sel && (!sel.busy || sel.kind === 'walk') && e.detail !== 0 && sel.sid !== hit.sid && Cut.wantTalk === hit.sid) { Cut.wantTalk = null; walkTo(sel, hit.x + (sel.x < hit.x ? -12 : 12), () => Cut.hooks.talk(hit.sid, sel.sid)); return; }
    Cut.wantTalk = hit.sid; setTimeout(() => { if (Cut.wantTalk === hit.sid) Cut.wantTalk = null; }, 2500);
    Cut.hooks.select(hit.sid); hint('Tap them again to talk, or tap the floor to move'); return;
  }
  if (hit && hit.sid === selId) { Cut.hooks.talkMenu(hit.sid); return; }
  if (!sel || (sel.busy && sel.kind !== 'walk')) return;
  /* an object? */
  const order = [G.build.radio ? 'radio' : null, 'cupboard', 'bed', G.build.stove ? 'stove' : null, 'table', 'mat', 'window', 'door'].filter(Boolean);
  const obj = order.find((k) => { const r = HOT[k].rect; return p.x >= r[0] && p.x <= r[0] + r[2] && p.y >= r[1] && p.y <= r[1] + r[3]; });
  if (obj) {
    const H = HOT[obj]; hint({ cupboard: 'Open the cupboard', bed: 'Rest', radio: 'Listen', stove: 'Cook', table: 'Work', mat: 'Pray', window: 'Look out', door: 'The night' }[obj]);
    walkTo(sel, H.x, () => {
      const s = Cut.hooks.person(sel.sid);
      if (obj === 'bed') { const free = Object.values(Cut.actors).every((o) => o === sel || o.kind !== 'sleep' || o.x !== 80); pose(sel, 'sleep', 80, free ? 60 : 40, 1, 2200, null); setTimeout(() => Cut.hooks.use('bed', sel.sid), 2300); }
      else if (obj === 'mat') { pose(sel, 'pray', 26, FLOOR, 1, 2600, null); setTimeout(() => Cut.hooks.use('mat', sel.sid), 2700); }
      else if (obj === 'window') {
        sel.busy = true; sel.dir = 1; sel.kind = 'climb'; drawActor(sel);
        setTimeout(() => { sel.kind = 'peek'; drawActor(sel); setTimeout(() => { sel.busy = false; Cut.hooks.use('window', sel.sid); }, 1500); }, 800);
      }
      else { sel.dir = (obj === 'table' || obj === 'radio' || obj === 'stove') ? 1 : -1; drawActor(sel); setTimeout(() => Cut.hooks.use(obj, sel.sid), 250); }
    });
    return;
  }
  /* the floor */
  if (p.y >= 44) { if (Cut.hooks.notify) Cut.hooks.notify('walk'); walkTo(sel, p.x); const m = document.createElementNS(NS, 'circle'); m.setAttribute('cx', p.x); m.setAttribute('cy', Math.min(FLOOR + 3, Math.max(FLOOR - 1, p.y))); m.setAttribute('r', 3); m.setAttribute('fill', 'none'); m.setAttribute('stroke', '#f6b37f'); m.setAttribute('class', 'tapmark'); Cut.layer.appendChild(m); setTimeout(() => m.remove(), 700); }
}

/* a knock on the crest: three, then two, then one, with a breath between. The author's hidden note. */
function knock(p) {
  const now = Date.now(); Cut.knocks = (Cut.knocks || []).filter((t) => now - t < 14000); Cut.knocks.push(now);
  const m = document.createElementNS(NS, 'circle'); m.setAttribute('cx', p.x); m.setAttribute('cy', p.y); m.setAttribute('r', 2); m.setAttribute('fill', 'none'); m.setAttribute('stroke', '#f2ebcf'); m.setAttribute('class', 'tapmark'); Cut.layer.appendChild(m); setTimeout(() => m.remove(), 700);
  try { if (C.Audio) { C.Audio.start(); C.Audio.sfx('hit'); } } catch (e) {}
  const groups = []; Cut.knocks.forEach((t, i) => { if (i === 0 || t - Cut.knocks[i - 1] > 650) groups.push(1); else groups[groups.length - 1]++; });
  const n = groups.length; if (n >= 3 && groups[n - 3] === 3 && groups[n - 2] === 2 && groups[n - 1] === 1) { Cut.knocks = []; setTimeout(() => { if (Cut.hooks.egg) Cut.hooks.egg(); }, 700); return true; }
  return false;
}

/* ---------- life: wandering, sitting, and speaking in their own voices ---------- */
function bubble(a, html) {
  const box = Cut.root.querySelector('.cbubbles'); if (box.children.length >= 2) box.firstChild.remove();
  const b = document.createElement('div'); b.className = 'bubble'; b.innerHTML = html;
  b.style.left = Math.max(2, Math.min(66, (a.x / 160) * 100 - 14)) + '%'; b.style.top = Math.max(1, ((a.g - 62) / 90) * 100) + '%'; box.appendChild(b);
  setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 400); }, 4200);
}
let tickN = 0;
function life() {
  if (C.paused || !Cut.root || !Cut.root.isConnected || !Cut.hooks.person) return; tickN++;
  const acts = Object.values(Cut.actors).filter((a) => !a.busy && a.sid !== Cut.hooks.selected());
  if (tickN % 4 === 0 && acts.length) {
    const a = pick(acts); const s = Cut.hooks.person(a.sid); if (!s) return;
    if (a.kind === 'idle' || a.kind === 'stand' || a.kind === 'blink') {
      const r = Math.random();
      if (r < 0.55) walkTo(a, rnd(26, 146));
      else if (r < 0.75) { const chairX = pick([98, 54, 124]); walkTo(a, chairX - 6, () => pose(a, 'sit', chairX, FLOOR, 1, rnd(5000, 9000))); }
      else if (r < 0.85 && s.trait === 'devout') walkTo(a, 26, () => pose(a, 'pray', 26, FLOOR, 1, rnd(5000, 8000)));
    }
  }
  if (tickN % 6 === 3 && acts.length && Cut.hooks.bark) { const a = pick(acts); const t = Cut.hooks.bark(a.sid); if (t) bubble(a, t); }
}
function start() { if (Cut.started) return; Cut.started = true; setInterval(life, 1000); }

C.Cutaway = Cut;
if (typeof module !== 'undefined') module.exports = Cut;
})(typeof window !== 'undefined' ? window : globalThis);
