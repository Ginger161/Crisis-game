/* CRISIS — radial wheels
   A ring of round, pixel-icon buttons around the middle of the screen. Used for crafting, cooking, building and the cupboard.
   Wheel.open({ title, items:[{id,label,icon,sub,count,off,why}], onPick(item) }) — a greyed wedge says why when tapped. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
let el = null, stack = [];
const toast = (t) => { try { if (C.UI && C.UI.toast) C.UI.toast(t); } catch (e) {} };

function ensure() {
  if (el || typeof document === 'undefined' || !document.body) return;
  el = document.createElement('div'); el.id = 'wheel'; el.className = 'wheel hidden'; document.body.appendChild(el);
  el.addEventListener('click', (e) => {
    const w = e.target.closest('[data-w]'); const cur = stack[stack.length - 1];
    if (e.target.closest('[data-wclose]') || (!w && e.target === el)) { close(); return; }
    if (e.target.closest('[data-wmore]')) { cur.page = (cur.page + 1) % Math.ceil(cur.items.length / 7); draw(); return; }
    if (!w || !cur) return; const it = cur.items[+w.dataset.w]; if (!it) return;
    if (it.off) { toast(it.why || 'Not available right now.'); return; }
    try { if (C.Audio) C.Audio.sfx('choose'); } catch (x) {}
    close(); if (cur.onPick) cur.onPick(it);
  });
}
function draw() {
  const cur = stack[stack.length - 1]; if (!cur) return; const per = cur.items.length > 8 ? 7 : 8;
  const items = cur.items.slice(cur.page * per, cur.page * per + per); const more = cur.items.length > 8;
  const W = Math.min(typeof innerWidth === 'number' ? innerWidth : 390, 620), Hh = typeof innerHeight === 'number' ? innerHeight : 800;
  const R = Math.max(86, Math.min(128, Math.min(W, Hh) / 2 - 62)); const n = items.length + (more ? 1 : 0);
  let o = `<div class="wcenter"><b>${cur.title}</b><button class="wx" data-wclose="1" aria-label="Back">← Back</button></div>`;
  const place = (i, html) => { const a = -Math.PI / 2 + (i / Math.max(n, 1)) * Math.PI * 2; return `<div class="wedge-pos" style="left:calc(50% + ${(Math.cos(a) * R).toFixed(1)}px);top:calc(50% + ${(Math.sin(a) * R).toFixed(1)}px)">${html}</div>`; };
  items.forEach((it, i) => { const gi = cur.page * per + i; o += place(i, `<button class="wedge${it.off ? ' off' : ''}" data-w="${gi}"><span class="wi">${it.icon && C.Icons ? C.Icons.html(it.icon) : ''}${it.count !== undefined ? `<em>${it.count}</em>` : ''}</span><span class="wl">${it.label}</span>${it.sub ? `<small>${it.sub}</small>` : ''}</button>`); });
  if (more) o += place(items.length, `<button class="wedge more" data-wmore="1"><span class="wi">…</span><span class="wl">More</span></button>`);
  el.innerHTML = `<div class="wring">${o}</div>`; el.classList.remove('hidden');
  if (C.Icons) C.Icons.skin(el);
}
function open(opts) { ensure(); if (!el) return; stack.push({ title: opts.title, items: opts.items || [], onPick: opts.onPick, page: 0 }); draw(); }
function close() { if (!el) return; stack = []; el.classList.add('hidden'); el.innerHTML = ''; }
const isOpen = () => !!(el && !el.classList.contains('hidden'));
C.Wheel = { open, close, isOpen };
if (typeof module !== 'undefined') module.exports = C.Wheel;
})(typeof window !== 'undefined' ? window : globalThis);
