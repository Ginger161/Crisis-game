/* CRISIS — the tutorial: short coach cards that wait for you to actually do the thing.
   One sentence each. The card sits just above the action bar, never on the scene. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const T = { active: false, i: 0, el: null };
const STEPS = [
  { text: '<b>Keep your people alive.</b> Soldiers will come. Nobody knows when.', btn: 'Start' },
  { text: '👆 <b>Tap a different person</b> in the room.', wait: 'select' },
  { text: '👣 <b>Tap the floor.</b> They walk there.', wait: 'walk' },
  { text: '🛠 <b>Tap the window, the bunk or the table.</b> They go and use it.', wait: 'object' },
  { text: '💬 <b>Tap your selected person again</b> to talk. Trust is earned.', wait: 'talk' },
  { text: '🌍 <b>Open the World tab.</b> Other groups live here.', wait: 'tab:world' },
  { text: '🍚 Hunger kills. <b>Open Work and eat something.</b> Cooked is best.', wait: 'use' },
  { text: '🌙 <b>Tap Nightfall</b> when you are ready. ☰ at the top has the guide.', btn: 'Got it' }
];
const settings = () => C.Settings;
function ensure() {
  if (T.el) return T.el; T.el = document.createElement('div'); T.el.id = 'coach'; T.el.className = 'coach hidden'; document.body.appendChild(T.el);
  T.el.addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; if (b.dataset.c === 'skip') T.finish(); else if (b.dataset.c === 'next') next(); });
  return T.el;
}
T.start = function () { T.active = true; T.i = 0; draw(); };
T.stop = function () { T.active = false; if (T.el) T.el.classList.add('hidden'); };
T.finish = function () { T.active = false; if (settings()) settings().set('tutorialSeen', true); if (T.el) T.el.classList.add('hidden'); };
T.notify = function (ev) { if (!T.active) return; const s = STEPS[T.i]; if (s && s.wait === ev) next(); };
T.act = function (a, d) { const m = { sel: 'select', talk: 'talk', use: 'use' }; if (m[a]) T.notify(m[a]); else if (a === 'tab') T.notify('tab:' + (d && d.t)); };
function next() { T.i++; if (T.i >= STEPS.length) { T.finish(); return; } draw(); }
function draw() {
  if (typeof document === 'undefined') return; const el = ensure(), s = STEPS[T.i];
  el.innerHTML = `<div class="cdots">${STEPS.map((_, k) => `<i class="${k < T.i ? 'd' : k === T.i ? 'n' : ''}"></i>`).join('')}</div><div class="ctext">${s.text}</div><div class="cbtns">${s.btn ? `<button class="primary" data-c="next">${s.btn}</button>` : '<span class="dim cwait">Waiting for you…</span>'}<button class="cskip" data-c="skip">Skip</button></div>`;
  T.place();
}
T.place = function () {
  if (!T.el) return; const el = T.el; if (!T.active) { el.classList.add('hidden'); return; }
  const a = document.querySelector('.actions'), pw = document.querySelector('.panelwrap');
  if (!a || !pw) { el.classList.add('hidden'); return; }
  const r = pw.getBoundingClientRect(), ar = a.getBoundingClientRect();
  el.style.left = (r.left + 8) + 'px'; el.style.width = (r.width - 16) + 'px'; el.style.top = 'auto'; el.style.bottom = Math.max(0, window.innerHeight - ar.top + 10) + 'px'; el.classList.remove('hidden');
};
if (typeof window !== 'undefined') window.addEventListener('resize', () => T.place());
C.Tutorial = T;
if (typeof module !== 'undefined') module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
