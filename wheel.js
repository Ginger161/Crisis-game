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
    if (e.target.closest('[data-wmore]')) { const pp = ((typeof innerHeight === 'number' && innerHeight < 520) || (typeof innerWidth === 'number' && innerWidth < 340)) ? 8 : ((typeof innerWidth === 'number' ? innerWidth : 390) < 460 ? 6 : 8); cur.page = (cur.page + 1) % Math.ceil(cur.items.length / pp); draw(); return; }
    if (!w || !cur) return; const it = cur.items[+w.dataset.w]; if (!it) return;
    if (it.off) { toast(it.why || 'Not available right now.'); return; }
    try { if (C.Audio) C.Audio.sfx('choose'); } catch (x) {}
    close(); if (cur.onPick) cur.onPick(it);
  });
}
function draw() {
  const cur = stack[stack.length - 1]; if (!cur) return;
  const W = Math.min(typeof innerWidth === 'number' ? innerWidth : 390, 620), Hh = typeof innerHeight === 'number' ? innerHeight : 800;
  const grid = Hh < 520 || W < 340;                                         /* short screens (landscape phones): a tidy grid instead of a ring */
  const per = grid ? 8 : (W < 460 ? 6 : 8); const more = cur.items.length > per + (grid ? 0 : 1) || cur.items.length > per;
  const perPage = more ? per - 0 : cur.items.length; const items = cur.items.slice(cur.page * per, cur.page * per + per); const hasMore = cur.items.length > per;
  const btn = (it, gi) => `<button class="wedge${it.off ? ' off' : ''}" data-w="${gi}"><span class="wi">${it.icon && C.Icons ? C.Icons.html(it.icon) : ''}${it.count !== undefined ? `<em>${it.count}</em>` : ''}</span><span class="wl">${it.label}</span>${it.sub ? `<small>${it.sub}</small>` : ''}</button>`;
  let o = '';
  if (grid) {
    o = `<div class="wgrid"><div class="wgtop"><b>${cur.title}</b><button class="wx" data-wclose="1" aria-label="Back">← Back</button></div><div class="wgcells">${items.map((it, i) => `<div class="wedge-pos static">${btn(it, cur.page * per + i)}</div>`).join('')}${hasMore ? `<div class="wedge-pos static"><button class="wedge wmore" data-wmore="1"><span class="wi">…</span><span class="wl">More</span></button></div>` : ''}</div></div>`;
    el.innerHTML = o; el.classList.remove('hidden'); if (C.Icons) C.Icons.skin(el); return;
  }
  const n = items.length + (hasMore ? 1 : 0);
  const Rx = Math.max(96, Math.min(150, W / 2 - 52)), Ry = Math.max(120, Math.min(250, Hh / 2 - 118));
  o = `<div class="wcenter"><b>${cur.title}</b><button class="wx" data-wclose="1" aria-label="Back">← Back</button></div>`;
  const place = (i, html) => { const a = -Math.PI / 2 + (i / Math.max(n, 1)) * Math.PI * 2; return `<div class="wedge-pos" style="left:calc(50% + ${(Math.cos(a) * Rx).toFixed(1)}px);top:calc(50% + ${(Math.sin(a) * Ry).toFixed(1)}px)">${html}</div>`; };
  items.forEach((it, i) => { o += place(i, btn(it, cur.page * per + i)); });
  if (hasMore) o += place(items.length, `<button class="wedge wmore" data-wmore="1"><span class="wi">…</span><span class="wl">More</span></button>`);
  el.innerHTML = `<div class="wring">${o}</div>`; el.classList.remove('hidden');
  if (C.Icons) C.Icons.skin(el);
}
function open(opts) { ensure(); if (!el) return; stack.push({ title: opts.title, items: opts.items || [], onPick: opts.onPick, page: 0 }); draw(); }
function close() { if (!el) return; stack = []; el.classList.add('hidden'); el.innerHTML = ''; }
const isOpen = () => !!(el && !el.classList.contains('hidden'));
C.Wheel = { open, close, isOpen };
if (typeof module !== 'undefined') module.exports = C.Wheel;
})(typeof window !== 'undefined' ? window : globalThis);
