/* CRISIS — radial wheels
   A ring of pixel cards around a hub, used for crafting, cooking, building and the cupboard.
   Wheel.open({ title, hub, items:[{id,label,icon,cost,lack,time,count,sub,off,why,danger}], onPick(item) })
   cost = { item: amount }, lack = { item: true } marks what you are short of. A greyed card says why when tapped. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
let el = null, stack = [];
const toast = (t) => { try { if (C.UI && C.UI.toast) C.UI.toast(t); } catch (e) {} };
const IC = () => C.Icons;

const narrow = () => (typeof innerWidth === 'number' ? innerWidth : 390) < 360;
const short = () => (typeof innerHeight === 'number' ? innerHeight : 800) < 560;
const perPage = () => (short() || narrow() ? 8 : ((typeof innerWidth === 'number' ? innerWidth : 390) < 460 ? 6 : 8));

function ensure() {
  if (el || typeof document === 'undefined' || !document.body) return;
  el = document.createElement('div'); el.id = 'wheel'; el.className = 'wheel hidden'; document.body.appendChild(el);
  el.addEventListener('click', (e) => {
    const w = e.target.closest('[data-w]'); const cur = stack[stack.length - 1];
    if (e.target.closest('[data-wclose]') || (!w && e.target === el)) { close(); return; }
    if (e.target.closest('[data-wmore]')) { cur.page = (cur.page + 1) % Math.ceil(cur.items.length / perPage()); draw(); return; }
    if (!w || !cur) return; const it = cur.items[+w.dataset.w]; if (!it) return;
    if (it.off) { toast(it.why || 'Not available right now.'); return; }
    try { if (C.Audio) C.Audio.sfx('choose'); } catch (x) {}
    close(); if (cur.onPick) cur.onPick(it);
  });
}
const cost = (it) => {
  const I = IC(); if (!it.cost && !it.time) return '';
  const chips = Object.entries(it.cost || {}).map(([k, n]) => `<span class="cc${it.lack && it.lack[k] ? ' lack' : ''}">${I ? I.item(k) : ''}<b>${n}</b></span>`).join('');
  const t = it.time ? `<span class="ct">${I ? I.html('clock') : ''}${it.time}</span>` : '';
  return `<span class="wmeta">${chips}${t}</span>`;
};
const card = (it, gi, idx) => `<button class="wedge${it.off ? ' off' : ''}${it.danger ? ' danger' : ''}" data-w="${gi}" style="--i:${idx}"><span class="wcard"><span class="wi">${it.icon && IC() ? IC().html(it.icon) : ''}</span>${it.count !== undefined ? `<em>${it.count}</em>` : ''}${it.lock && IC() ? `<span class="wlock">${IC().html('lock')}</span>` : ''}</span><span class="wl">${it.label}</span>${cost(it)}${it.sub ? `<small>${it.sub}</small>` : ''}</button>`;
const moreCard = (idx) => `<button class="wedge wmore" data-wmore="1" style="--i:${idx}"><span class="wcard"><span class="wi">…</span></span><span class="wl">More</span></button>`;

function draw() {
  const cur = stack[stack.length - 1]; if (!cur) return;
  const W = Math.min(typeof innerWidth === 'number' ? innerWidth : 390, 620), Hh = typeof innerHeight === 'number' ? innerHeight : 800;
  const grid = short() || narrow(); const per = perPage(); const hasMore = cur.items.length > per;
  const items = cur.items.slice(cur.page * per, cur.page * per + per); const hub = cur.hub && IC() ? IC().html(cur.hub) : '';
  if (grid) {
    el.innerHTML = `<div class="wgrid"><div class="wgtop"><span class="whub sm">${hub}</span><b>${cur.title}</b><button class="wx" data-wclose="1" aria-label="Back">← Back</button></div><div class="wgcells">${items.map((it, i) => `<div class="wedge-pos static">${card(it, cur.page * per + i, i)}</div>`).join('')}${hasMore ? `<div class="wedge-pos static">${moreCard(items.length)}</div>` : ''}</div></div>`;
    el.classList.remove('hidden'); if (IC()) IC().skin(el); return;
  }
  const n = items.length + (hasMore ? 1 : 0);
  const Rx = Math.max(96, Math.min(150, W / 2 - 50)), Ry = Math.max(130, Math.min(250, Hh / 2 - 122));
  let o = `<div class="wcenter"><span class="whub">${hub}</span><b>${cur.title}</b><button class="wx" data-wclose="1" aria-label="Back">← Back</button></div>`;
  const place = (i, html) => { const a = -Math.PI / 2 + (i / Math.max(n, 1)) * Math.PI * 2; return `<div class="wedge-pos" style="left:calc(50% + ${(Math.cos(a) * Rx).toFixed(1)}px);top:calc(50% + ${(Math.sin(a) * Ry).toFixed(1)}px)">${html}</div>`; };
  items.forEach((it, i) => { o += place(i, card(it, cur.page * per + i, i)); });
  if (hasMore) o += place(items.length, moreCard(items.length));
  el.innerHTML = `<div class="wring" style="--rx:${Rx}px;--ry:${Ry}px">${o}</div>`; el.classList.remove('hidden');
  if (IC()) IC().skin(el);
}
function open(opts) { ensure(); if (!el) return; stack.push({ title: opts.title, hub: opts.hub, items: opts.items || [], onPick: opts.onPick, page: 0 }); draw(); }
function close() { if (!el) return; stack = []; el.classList.add('hidden'); el.innerHTML = ''; }
const isOpen = () => !!(el && !el.classList.contains('hidden'));
C.Wheel = { open, close, isOpen };
if (typeof module !== 'undefined') module.exports = C.Wheel;
})(typeof window !== 'undefined' ? window : globalThis);
