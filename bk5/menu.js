/* CRISIS — menus: pause, settings, how to play, about, and confirmations.
   One full-screen overlay (#menu) that sits above the game. Opening it pauses the shelter's life and the ambient sound. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const M = { hooks: {}, screen: null, from: null, el: null, opts: {} };
const S = () => C.Settings, V = () => C.Settings.v;
const sfx = (n) => { try { if (C.Audio) { C.Audio.start(); C.Audio.sfx(n); } } catch (e) {} };
const el = () => (M.el = M.el || document.getElementById('menu'));

const page = (title, body, back) => `<div class="mpage"><div class="mtop">${back ? `<button class="mback" data-mn="${back}">←</button>` : '<span></span>'}<h2>${title}</h2><span></span></div>${body}</div>`;
const tog = (k, label, hint) => `<div class="mrow"><div><b>${label}</b>${hint ? `<div class="dim">${hint}</div>` : ''}</div><button class="tog ${V()[k] ? 'on' : ''}" data-mn="tog" data-k="${k}" aria-pressed="${!!V()[k]}" aria-label="${label}"><i></i></button></div>`;
const slider = (k, label) => `<div class="mrow col"><div class="srow"><b>${label}</b><span class="dim" id="v_${k}">${Math.round(V()[k] * 100)}%</span></div><input type="range" min="0" max="100" value="${Math.round(V()[k] * 100)}" data-k="${k}"></div>`;
const seg = (k, label, opts) => `<div class="mrow col"><b>${label}</b><div class="seg">${opts.map(([v, t]) => `<button class="${V()[k] === v ? 'on' : ''}" data-mn="seg" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div></div>`;

const SCREENS = {
  pause() {
    const i = (M.hooks.info && M.hooks.info()) || null;
    return page('Paused', `${i ? `<div class="dim" style="text-align:center;margin:-4px 0 14px">Day ${i.day} · ${i.place}<br>${i.alive} alive · saved automatically</div>` : ''}
      <div class="mbtns"><button class="primary" data-mn="close">Resume</button><button data-mn="howto">How to play</button><button data-mn="settings">Settings</button><button data-mn="saveNow">Save now</button><button data-mn="report">Copy a problem report</button><button data-mn="confirmRestart">Restart this run</button><button class="danger" data-mn="confirmQuit">Quit to title</button></div>`);
  },
  settings() {
    return page('Settings', `
      ${seg('text', 'Text size', [['s', 'Small'], ['m', 'Medium'], ['l', 'Large'], ['xl', 'Huge']])}
      ${seg('layout', 'Layout', [['auto', 'Auto'], ['pc', 'PC'], ['phone', 'Phone']])}
      ${seg('perf', 'Graphics', [['auto', 'Auto'], ['full', 'Full'], ['balanced', 'Balanced'], ['light', 'Light']])}
      <div class="dim mperf">${(root.Crisis && root.Crisis.Perf) ? `Running: ${root.Crisis.Perf.label()}. Auto picks for your phone and remembers.` : ''}</div>
      ${tog('reduce', 'Reduce motion', 'Stops animation and the shelter\'s wandering. Easier on the eyes and the battery.')}
      <div class="msub">Sound</div>
      ${tog('sound', 'Sound', `Generated in the game. Starts after your first ${C.tw ? C.tw() : 'tap'}.`)}
      ${slider('master', 'Volume')}${slider('music', 'Ambience (wind, distance)')}${slider('sfx', 'Interface sounds')}
      ${tog('haptics', 'Vibration', 'A short buzz for deaths and attacks, on phones that support it.')}
      <div class="msub">Content</div>
      ${tog('gore', 'Graphic violence', 'On: blood, wounds and the dead are shown in full. Off: the dead are covered and wounds are bandaged.')}
      <div class="msub">Data</div>
      <div class="mbtns"><button data-mn="confirmDelete" ${M.hooks.hasSave && M.hooks.hasSave() ? '' : 'disabled'}>Delete saved game</button><button data-mn="resetSettings">Reset settings</button></div>`, M.from || 'close');
  },
  howto() {
    const CARDS = [
      ['🎯', 'The goal', 'Keep your people alive until help reaches the campus. Nobody knows when. What you do is remembered.'],
      ...(document.documentElement.classList.contains('pc') ? [
        ['🖱', 'Everyone', 'You give the orders for the whole group. Click a card on the left (or press 1 to 6) to pick someone. Click the floor to send them there, or click anything in the house to use it. Hover first: it tells you what a click will do. Right-click stops whoever you picked.'],
        ['🛠', 'Use things', 'Click the cupboard, the workbench, the stove, a bunk or a window from anywhere in the house: whoever you picked walks over and does it. Junk and rubble must be cleared before you can build there.'],
        ['⌨', 'Keys', 'Space pauses. F changes the speed. Tab moves between people. E ends the day. I, W and J open Items, the World and the Journal. In a choice, press its number. Esc closes whatever is open. On a run: S to sneak, H to head home.']
      ] : [
        ['👆', 'Everyone', 'You give the orders for the whole group. Tap a face below to pick someone, then tap the floor to send them there or tap anything in the house to use it. Someone on a long job is busy until it is done: tap their face again to stop them.'],
        ['🛠', 'Use things', 'Tap the cupboard, the workbench, the stove, a bunk or a window: whoever you picked walks over and does it. Junk and rubble must be cleared before you can build there.']
      ]),
      ['⚙', 'Build and make', 'Empty spots in the house can be built on. The workbench makes bandages, weapons and tools. Tools wear out.'],
      ['🍚', 'Food', 'Raw food is weak and can make you sick. A cooked pot feeds more and lifts the room. Water runs out faster than food.'],
      ['🛏', 'The day', 'A day passes in a few minutes, and the others get on with their own work. When there is nothing left to do, ' + (C.tw ? C.tw() : 'tap') + ' End day.'],
      ['🌙', 'The night plan', 'At 8 in the evening, choose who sleeps in a bed or on the floor, who keeps watch, who goes out and who is sent.'],
      ['👣', 'The night run', 'You walk the runner yourself. ' + (C.tw ? C.tw(true) : 'Tap') + ' glowing spots to search. Every noise spreads in a ring, and bandits come to see. Be home by 5.'],
      ['🤒', 'Staying alive', 'Wounds go bad if you leave them. Fevers get worse. Cold nights cost sleep. Bandage early, board up the windows, keep a fire.'],
      ['💬', 'People', 'They remember what you did, and what you told them. They can break, refuse you, or leave. Sit with them.'],
      ['🏛', 'Mai Kudi', "The bandits' collector comes every few days. Pay, bargain or refuse, and live with what follows."]
    ];
    const i = Math.max(0, Math.min(CARDS.length - 1, M.card || 0)); const c = CARDS[i], last = i === CARDS.length - 1;
    return page('How to play', `<div class="gcard"><div class="gi">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p></div>
      <div class="gdots">${CARDS.map((_, k) => `<i class="${k === i ? 'n' : ''}"></i>`).join('')}</div>
      <div class="mbtns" style="flex-direction:row">${i > 0 ? '<button style="flex:1" data-mn="cardPrev">Back</button>' : ''}<button class="primary" style="flex:2" data-mn="${last ? 'close' : 'cardNext'}">${last ? 'Got it' : 'Next'}</button></div>`, M.from || 'close');
  },
  about() {
    return page('About', `<div class="how"><p><b>CRISIS</b> · a survival game set during a siege at Veritas University, Abuja.</p>
      <p class="dim">A work of fiction. Every character, group and event is invented. It borrows the name, layout and look of a real university and is not based on real events or real people there.</p>
      <p>Contains graphic violence, death, hunger, grief, and adult themes. There is a setting to reduce the graphic content.</p>
      <h3>Install it</h3><p><b>iPhone</b> (Safari): Share, then Add to Home Screen. <b>Android</b> (Chrome): menu, then Install app or Add to Home screen. Installed, it runs full screen with no browser bars and works offline.</p>
      <h3>Version</h3><p class="dim">Crisis 1.0 · saves stay on this device.</p>${V().egg ? '<h3>Made by</h3><p>Ginger-Eke Chienyegom</p>' : ''}</div>`, M.from || 'close');
  },
  confirm() {
    const o = M.opts.confirm; return page(o.title, `<p class="story" style="margin:6px 0 18px">${o.text}</p><div class="mbtns"><button class="${o.danger ? 'danger' : 'primary'}" data-mn="yes">${o.yes}</button><button data-mn="no">Cancel</button></div>`);
  }
};
M.open = function (screen, opts) {
  const e = el(); if (!e) return; M.opts = opts || {}; M.from = M.opts.from || (M.screen && M.screen !== 'confirm' ? M.screen : null) || (screen === 'pause' ? null : (M.hooks.hasGame && M.hooks.hasGame() ? 'pause' : 'close'));
  if (!M.screen) { C.paused = true; if (M.hooks.onPause) M.hooks.onPause(true); }
  if (screen === 'howto') M.card = 0; M.screen = screen; render(); e.classList.remove('hidden'); placeMenu(); sfx('open');
};
M.close = function () { const e = el(); if (!e) return; e.classList.add('hidden'); e.innerHTML = ''; M.screen = null; M.from = null; C.paused = false; if (M.hooks.onPause) M.hooks.onPause(false); };
function render() { const e = el(); e.innerHTML = SCREENS[M.screen](); if (C.UI) C.UI.soon(); }
function placeMenu() { const e = el(); if (!e) return; const root2 = document.documentElement; e.style.top = root2.style.getPropertyValue('--app-top') || '0px'; e.style.height = root2.style.getPropertyValue('--app-h') || '100%'; }
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; el().appendChild(d); setTimeout(() => d.remove(), 1500); }
M.confirm = function (o) { M.opts = { confirm: o, from: M.screen }; const prev = M.screen; M.prevScreen = prev; M.screen = 'confirm'; render(); };

function handle(e) {
  const b = e.target.closest('[data-mn]'); if (!b || b.disabled) return; const a = b.dataset.mn;
  if (a === 'tog') { S().set(b.dataset.k, !V()[b.dataset.k]); if (b.dataset.k === 'sound') { try { C.Audio.start(); } catch (x) {} } render(); sfx('tap'); return; }
  if (a === 'seg') { S().set(b.dataset.k, b.dataset.v); render(); sfx('tap'); return; }
  sfx(a === 'close' || a === 'no' ? 'back' : 'tap');
  switch (a) {
    case 'close': M.close(); break;
    case 'cardNext': M.card = (M.card || 0) + 1; render(); break;
    case 'cardPrev': M.card = Math.max(0, (M.card || 0) - 1); render(); break;
    case 'replay': M.close(); if (C.Tutorial) C.Tutorial.start(); break;
    case 'pause': M.screen = 'pause'; M.from = null; render(); break;
    case 'settings': case 'howto': case 'about': M.from = M.screen === 'confirm' ? M.prevScreen : M.screen; M.screen = a; if (a === 'howto') M.card = 0; render(); break;
    case 'saveNow': if (M.hooks.save) M.hooks.save(); toast('Saved'); break;
    case 'report': if (M.hooks.report) { M.close(); M.hooks.report(); } break;
    case 'resetSettings': S().reset(); render(); toast('Settings reset'); break;
    case 'startFirst': S().set('tutorialSeen', true); M.close(); break;
    case 'confirmRestart': M.confirm({ title: 'Restart this run?', text: 'You will lose this run, and everyone in it. A new one will begin.', yes: 'Restart', danger: true, do: () => { M.close(); M.hooks.restart(); } }); break;
    case 'confirmQuit': M.confirm({ title: 'Quit to the title?', text: 'Your progress is saved. You can pick up from the title screen with Continue.', yes: 'Quit', danger: false, do: () => { M.close(); M.hooks.quit(); } }); break;
    case 'confirmDelete': M.confirm({ title: 'Delete the saved game?', text: 'This cannot be undone. Your settings stay.', yes: 'Delete', danger: true, do: () => { if (M.hooks.deleteSave) M.hooks.deleteSave(); M.screen = 'settings'; render(); toast('Deleted'); } }); break;
    case 'yes': { const f = M.opts.confirm && M.opts.confirm.do; if (f) f(); break; }
    case 'no': M.screen = M.prevScreen || 'pause'; render(); break;
  }
}
function slide(e) { const r = e.target; if (!r.dataset || !r.dataset.k || r.type !== 'range') return; const v = (+r.value) / 100; S().set(r.dataset.k, v); const l = document.getElementById('v_' + r.dataset.k); if (l) l.textContent = Math.round(v * 100) + '%'; try { C.Audio.start(); } catch (x) {} }
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => { const m = el(); if (m && m.contains(e.target)) handle(e); });
  document.addEventListener('input', slide);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (M.screen) M.close(); else if (M.hooks.hasGame && M.hooks.hasGame()) M.open('pause'); } });
  if (typeof window !== 'undefined') { window.addEventListener('resize', () => { if (M.screen) placeMenu(); }); }
}
C.Menu = M;
if (typeof module !== 'undefined') module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
