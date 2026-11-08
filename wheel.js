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
const gridFit = () => { const W = Math.min(typeof innerWidth === 'number' ? innerWidth : 390, 620), Hh = typeof innerHeight === 'number' ? innerHeight : 800; const cols = Math.max(1, Math.floor((W - 24) / 102)); const rows = Math.max(1, Math.floor((Hh - 96) / 138)); return Math.max(2, Math.min(8, cols * rows)); };
const perPage = () => (short() || narrow() ? gridFit() : ((typeof innerWidth === 'number' ? innerWidth : 390) < 460 ? 6 : 8));

function ensure() {
  if (el || typeof document === 'undefined' || !document.body) return;
  el = document.createElement('div'); el.id = 'wheel'; el.className = 'wheel hidden'; document.body.appendChild(el);
  el.addEventListener('click', (e) => {
    const w = e.target.closest('[data-w]'); const cur = stack[stack.length - 1];
    if (e.target.closest('[data-wclose]') || (!w && e.target === el)) { close(); return; }
    if (e.target.closest('[data-wmore]')) { { let pp = perPage(); if ((short() || narrow()) && cur.items.length > pp) pp = Math.max(1, pp - 1); cur.page = (cur.page + 1) % Math.ceil(cur.items.length / pp); }  draw(); return; }
    if (!w || !cur) return; const it = cur.items[+w.dataset.w]; if (!it) return;
    if (it.off) { toast(it.why || 'Not available right now.'); return; }
    try { if (C.Audio) C.Audio.sfx('choose'); } catch (x) {}
    close(); if (cur.onPick) cur.onPick(it); if (C.Wheel.after) { try { C.Wheel.after(); } catch (e2) {} }   /* whatever the choice queued (a result, a sheet) is shown now, never left waiting */
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
  const mob = typeof document !== 'undefined' && document.documentElement.classList.contains('mob'); el.classList.toggle('mobw', mob);
  if (mob) {
    /* a phone held upright: the choices come up as a sheet of tiles, three across, every word inside its tile. No paging: it scrolls */
    const I = IC(); const hub0 = cur.hub && I ? I.html(cur.hub) : '';
    const tile = (it, gi) => `<button class="wtile${it.off ? ' off' : ''}${it.danger ? ' danger' : ''}" data-w="${gi}" aria-label="${String(it.label).replace(/<[^>]+>/g, '').replace(/"/g, '')}">${it.time ? `<span class="wtm">${it.time}</span>` : ''}<span class="wi">${it.icon && I ? I.html(it.icon) : ''}${it.lock && I ? `<span class="wlock">${I.html('lock')}</span>` : ''}</span>${it.count !== undefined ? `<em class="wcount">${it.count}</em>` : ''}<b class="wl">${it.label}</b>${Object.keys(it.cost || {}).length ? `<span class="wcost">${Object.entries(it.cost).map(([k, n]) => `<span class="${it.lack && it.lack[k] ? 'lack' : ''}">${I ? I.item(k) : ''}${n}</span>`).join('')}</span>` : ''}${it.sub ? `<small>${it.sub}</small>` : ''}</button>`;
    el.innerHTML = `<div class="wsheet" role="dialog" aria-label="${cur.title}"><div class="wshead"><span class="whub">${hub0}</span><b>${cur.title}</b><button class="wx" data-wclose="1">Close</button></div><div class="wtiles">${cur.items.map((it, i) => tile(it, i)).join('')}</div>${cur.items.some((it) => it.off) ? '<div class="wsnote">Faded: something is missing. Tap it to see what.</div>' : ''}</div>`;
    el.classList.remove('hidden'); if (I) I.skin(el); return;
  }
  const grid = short() || narrow(); let per = perPage(); const hasMore = cur.items.length > per; if (grid && hasMore) per = Math.max(1, per - 1);
  const items = cur.items.slice(cur.page * per, cur.page * per + per); const hub = cur.hub && IC() ? IC().html(cur.hub) : '';
  if (grid) {
    el.innerHTML = `<div class="wgrid"><div class="wgtop"><button class="wx" data-wclose="1" aria-label="Back">← Back</button><span class="whub sm">${hub}</span><b>${cur.title}</b></div><div class="wgcells">${items.map((it, i) => `<div class="wedge-pos static">${card(it, cur.page * per + i, i)}</div>`).join('')}${hasMore ? `<div class="wedge-pos static">${moreCard(items.length)}</div>` : ''}</div></div>`;
    el.classList.remove('hidden'); if (IC()) IC().skin(el); return;
  }
  const n = items.length + (hasMore ? 1 : 0);
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('pc')) {
    /* an oval on a wide screen: more choices spread sideways, never stacked on each other */
    const R = Math.max(150, Math.min(205, 70 + n * 17)), RX = Math.round(R * (n > 4 ? 1.45 : 1.1)), IW = innerWidth, IH = innerHeight, pt = C.lastPt || { x: IW / 2, y: IH / 2 };
    /* it opens at the object you clicked if that is in the house view, otherwise in the middle of it; it always stays inside the house view, clear of the clock and the group */
    const stg = document.querySelector('.pcshell .stage, .shell.run .stage'); const sr = stg ? stg.getBoundingClientRect() : { left: 0, top: 0, right: IW, bottom: IH };
    const inStage = pt.x >= sr.left && pt.x <= sr.right && pt.y >= sr.top && pt.y <= sr.bottom; const px = inStage ? pt.x : (sr.left + sr.right) / 2, py = inStage ? pt.y : (sr.top + sr.bottom) / 2;
    const lo = sr.left + RX + 60, hi = sr.right - RX - 60, top = sr.top + R + 64, bot = sr.bottom - R - 84;
    const cx = lo <= hi ? Math.max(lo, Math.min(hi, px)) : (sr.left + sr.right) / 2, cy = top <= bot ? Math.max(top, Math.min(bot, py)) : (sr.top + sr.bottom) / 2;
    let o2 = `<div class="wcenter"><span class="whub">${hub}</span><b>${cur.title}</b><small class="wkeys">Esc to close</small></div>`;
    const place2 = (i, html) => { const a = -Math.PI / 2 + (i / Math.max(n, 1)) * Math.PI * 2; return `<div class="wedge-pos" style="left:calc(50% + ${(Math.cos(a) * RX).toFixed(1)}px);top:calc(50% + ${(Math.sin(a) * R).toFixed(1)}px)">${html}</div>`; };
    items.forEach((it, i) => { o2 += place2(i, card(it, cur.page * per + i, i)); }); if (hasMore) o2 += place2(items.length, moreCard(items.length));
    el.innerHTML = `<div class="wring pcw" style="--rx:${RX}px;--ry:${R}px;left:${cx}px;top:${cy}px">${o2}</div>`; el.classList.remove('hidden'); if (IC()) IC().skin(el); return;
  }
  const Rx = Math.max(96, Math.min(215, W / 2 - 50)), Ry = Math.max(130, Math.min(260, Hh / 2 - 122));
  let o = `<button class="wx wback" data-wclose="1" aria-label="Back">← Back</button><div class="wcenter"><span class="whub">${hub}</span><b>${cur.title}</b></div>`;
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
