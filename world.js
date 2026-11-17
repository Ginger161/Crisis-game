/* CRISIS — the People and Groups screen (DIPLOMACY.md 1.19, mockups B + C)
   The World tab is the campus map: every group you know sits at its place as a chalk mark, with the word for where you stand.
   A list rides over the bottom of the map. Folded, it holds only what needs you (an envoy at the door, a debt). Pulled up, it holds
   every group by standing, and the map dims behind it with the chosen group's mark lit. Tap a mark or a row to choose a group;
   tap it again to open its page. Leaders and members open a person's page. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const P = () => C.Politics, K = () => C.Cast, W = () => C.Campus;
const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let H = null;   /* the game hands over what it owns: G, ask, flush, alive, personPage, the knock, the old panels */

/* each group's chalk mark, drawn in a 40x40 box centred on 0,0 */
const MARK = {
  kitchen: '<path d="M-8 -1h16v5a5 5 0 0 1-5 5h-6a5 5 0 0 1-5-5z M-10 -1h20 M-3 -5c0-2 2-2 2-4 M3 -5c0-2 2-2 2-4"/>',
  theatre: '<path d="M0 -9v18 M-6 9h12 M-9 -5h18 M-9 -5l-3 6h6z M9 -5l-3 6h6z"/>',
  chapel: '<path d="M0 -10v20 M-6 -4h12"/>',
  sisters: '<circle cx="-4" r="6"/><circle cx="4" r="6"/>',
  security: '<path d="M0 -9l7 3v5c0 5-4 7-7 9-3-2-7-4-7-9v-5z"/>',
  medical: '<circle r="9"/><path d="M0 -5v10 M-5 0h10"/>',
  hustlers: '<path d="M-5 9v-18l10 18v-18 M-8 -2h16 M-8 3h16"/>',
  union: '<path d="M-9 -3v5l12 6v-17z M3 -5h4v8h-4"/>',
  mph: '<path d="M-10 -1l10-7 10 7 M-7 -1v10 M7 -1v10 M0 3v6"/>',
  gate: '<path d="M-8 9v-18 M-3 9v-18 M3 9v-18 M8 9v-18 M-10 -4h20"/>',
  terrace: '<path d="M-6 10v-19h12v19 M-3 -5h2 M1 -5h2 M-3 0h2 M1 0h2 M-3 5h2 M1 5h2"/>',
  tech: '<path d="M0 10v-12 M-6 10l6-12 6 12 M-5 -6a7 7 0 0 1 10 0 M-8 -9a11 11 0 0 1 16 0"/>',
  pitch: '<path d="M-10 6v-13h20v13"/><circle cy="3" r="3"/>',
  staff: '<circle cx="-5" r="4"/><path d="M-1 0h11 M7 0v4 M10 0v3"/>'
};
const markSvg = (id, px, col) => `<svg class="gmark" width="${px}" height="${px}" viewBox="-20 -20 40 40" aria-hidden="true"><g fill="none" stroke="${col || 'currentColor'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${MARK[id] || '<circle r="8"/>'}</g></svg>`;

/* where each group sits on the map (a sketch of the campus, 360 x 420), and where you are */
const SPOT = { sisters: [62, 66], hustlers: [252, 70], terrace: [310, 58], chapel: [138, 152], tech: [198, 148], theatre: [258, 160], staff: [128, 214], kitchen: [194, 210], medical: [258, 224], mph: [180, 274], security: [100, 300], union: [54, 356], pitch: [142, 372], gate: [304, 390] };
const YOU = { boysA: [96, 402], girls: [112, 98], boysP: [276, 106], core: [234, 290], sports: [272, 340], gate: [252, 400] };
const AREA = [['girls', 14, 22, 132, 92, "Girls' hostels"], ['boysP', 224, 22, 124, 92, 'Hostels R, S, T'], ['core', 92, 124, 196, 176, 'Academic core'], ['boysA', 14, 318, 172, 96, "Boys' hostels"], ['sports', 204, 314, 144, 52, 'Sports grounds']];
const STAGE_COL = { allies: '#f6b37f', good: '#e9e1c6', wary: '#a59c90', hostile: '#f08a6c', enemies: '#f08a6c', strangers: '#6f685e' };
const ORDER = ['allies', 'good', 'wary', 'hostile', 'enemies'];
const SHORT = { kitchen: 'Kitchen', theatre: 'Council', chapel: 'Chapel', sisters: 'Sisterhood', security: 'Security', medical: 'Medical', hustlers: 'Hustlers', union: 'Union', mph: 'MPH Camp', gate: 'Gate Boys', terrace: 'Terrace', tech: 'Tech Guild', pitch: 'Pitch Boys', staff: 'Staff' };

const fac = (id) => P().fac(id);
const known = () => (H.G().fac || []).filter((f) => f.met);
const heardOnly = () => (H.G().fac || []).filter((f) => !f.met && f.status === 'active' && P().heard(f));
const placeOf = (f) => { const L = W().BY[f.loc]; return L ? L.name : ''; };
const leaderName = (f) => { const l = P().leaderOf(f); return l ? l.name : ''; };
const atDoor = (f) => { const k = H.knock(); return !!(k && k.d && k.d.id === 'envoy' && H.G().envoyAt === f.id); };
const owe = (f) => (H.G().ledger || []).filter((l) => l.fid === f.id && l.status === 'open');
/* the one short note on a group's row, and whether it needs you */
function noteOf(f) {
  const G = H.G();
  if (f.status !== 'active') return null;
  if (atDoor(f)) return { t: 'At your door', need: true };
  const mine = owe(f).find((l) => l.dir === 'owe'); if (mine) return { t: `You owe ${P().itemText(mine.items)}${G.day > mine.due ? ', late' : ''}`, need: true, bad: G.day > mine.due };
  const theirs = owe(f).find((l) => l.dir === 'owed'); if (theirs) return { t: `Owe you ${P().itemText(theirs.items)}` };
  if (f.food < P().size(f) * 0.45 || f.water < P().size(f) * 0.4) return { t: 'Hungry' };
  return null;
}

/* ---------- the map ---------- */
function mapSvg(sel, open) {
  const G = H.G(); const L = W().BY[G.shelter]; const you = YOU[(L && L.zone) || 'core'] || YOU.core;
  const roads = AREA.map(([, x, y, w, h]) => `<path d="M190 212 L${x + w / 2} ${y + h / 2}"/>`).join('') + `<path d="M190 212 L${YOU.gate[0] + 40} ${YOU.gate[1]}"/>`;
  const areas = AREA.map(([id, x, y, w, h, nm]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>${id === 'core' ? `<text x="${x + w - 8}" y="${y + h - 7}" text-anchor="end">${nm}</text>` : `<text x="${x + 8}" y="${y + 15}">${nm}</text>`}`).join('') + `<text x="${YOU.gate[0] + 6}" y="${YOU.gate[1] + 14}">Main gate</text>`;
  const marks = known().map((f) => {
    const [x, y] = SPOT[f.id] || [180, 210]; const st = P().stage(f); const gone = f.status !== 'active'; const col = gone ? '#6f685e' : STAGE_COL[st]; const on = sel === f.id;
    const n = noteOf(f); const dot = n && n.need ? `<circle cx="13" cy="-13" r="5" fill="#f6b37f"/>` : '';
    return `<g class="wmk${on ? ' on' : ''}${gone ? ' gone' : ''}" data-a="wgrp" data-f="${f.id}" transform="translate(${x} ${y})" role="button" aria-label="${esc(f.name)}, ${gone ? 'gone' : P().STAGE_WORD[st]}">${on ? '<circle r="26" class="cmpring"/>' : ''}<circle r="17" fill="${st === 'hostile' || st === 'enemies' ? '#2a1712' : '#1c1a16'}" stroke="${col}" stroke-width="${st === 'allies' || on ? 2.6 : 1.6}"/><g transform="scale(.82)" fill="none" stroke="${gone ? '#6f685e' : '#f2ebcf'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${MARK[f.id] || ''}</g>${gone ? '<path d="M-12 12L12 -12" stroke="#6f685e" stroke-width="2"/>' : ''}${dot}<text y="32" text-anchor="middle" fill="${col}">${gone ? 'Gone' : P().STAGE_WORD[st]}</text></g>`;
  }).join('');
  const rumoured = heardOnly().map((f) => { const [x, y] = SPOT[f.id] || [180, 210]; return `<g class="wq" transform="translate(${x} ${y})"><circle r="13" fill="none" stroke="#5a544b" stroke-width="1.4" stroke-dasharray="3 3"/><text y="5" text-anchor="middle" class="wqm">?</text><text y="28" text-anchor="middle">${SHORT[f.id] || esc(f.name)}</text></g>`; }).join('');
  /* with the list pulled up, the map shrinks into the strip above it, centred on the chosen group */
  const cy = sel && SPOT[sel] ? SPOT[sel][1] : you[1]; const vb = open ? `0 ${Math.max(0, Math.min(420 - 220, cy - 110))} 360 220` : '0 0 360 420';
  return `<svg class="wsvg${open ? ' dim' : ''}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="The campus, with each group you know at the place they hold">
    <g class="wroad" fill="none" stroke="#3b362f" stroke-width="9" stroke-linecap="round">${roads}</g>
    <g class="warea">${areas}</g>
    ${rumoured}
    <g transform="translate(${you[0]} ${you[1]})"><circle r="14" fill="#f2ebcf"/><path d="M-7 1l7-6 7 6 M-5 -1v7h10v-7 M-1.5 6v-4h3v4" fill="none" stroke="#1c1a16" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><text x="18" y="5" class="wyou">You</text></g>
    ${marks}
  </svg>`;
}

/* ---------- the list ---------- */
function row(f, sel) {
  const n = noteOf(f); const on = sel === f.id; const st = P().stage(f); const lead = leaderName(f);
  return `<button class="cmprow${on ? ' on' : ''}${st === 'hostile' || st === 'enemies' ? ' bad' : ''}${f.status !== 'active' ? ' gone' : ''}" data-a="wgrp" data-f="${f.id}">${markSvg(f.id, 28)}<span class="wtx"><b>${esc(f.name)}</b><small>${esc(placeOf(f))}${lead ? ' · ' + esc(lead) : ''}</small></span>${n ? `<em class="${n.bad || st === 'hostile' || st === 'enemies' ? 'bad' : ''}">${esc(n.t)}</em>` : ''}${on ? '<span class="wgo">Open ›</span>' : ''}</button>`;
}
function panel(ui) {
  const sel = ui.wsel && fac(ui.wsel) && fac(ui.wsel).met ? ui.wsel : null; const open = !!ui.wopen;
  const fs = known(); const live = fs.filter((f) => f.status === 'active');
  const need = live.filter((f) => { const n = noteOf(f); return n && n.need; });
  let list = '';
  if (!open) list = need.length ? `<h4>Needs you</h4>${need.map((f) => row(f, sel)).join('')}` : '';
  else {
    list = ORDER.map((st) => { const g = live.filter((f) => P().stage(f) === st); return g.length ? `<h4 style="color:${STAGE_COL[st]}">${P().STAGE_WORD[st]}</h4>${g.map((f) => row(f, sel)).join('')}` : ''; }).join('');
    const gone = fs.filter((f) => f.status !== 'active'); if (gone.length) list += `<h4 class="wdim">Gone</h4>${gone.map((f) => row(f, sel)).join('')}`;
    if (!fs.length) list += `<p class="wnone">You don't know anyone out there yet.</p>`;
    list += `<h4>Beyond the walls</h4><div class="wbeyond">${H.beyond()}</div>`;
  }
  const count = live.length;
  return `<div class="wv${open ? ' open' : ''}"><div class="wmap">${mapSvg(sel, open)}</div>
    <section class="cmpsheet" aria-label="Groups"><button class="wgrab" data-a="wsheet" aria-label="${open ? 'Pull the list down' : 'Pull the list up'}"><i></i></button>
    <div class="whead" data-a="wsheet"><b>The campus</b><span>${count === 1 ? '1 group' : count + ' groups'}</span></div>
    <div class="wlist">${list}</div></section></div>`;
}

/* ---------- a group's page ---------- */
const face = (cid, scale) => { try { return C.Sprites.render(P().face(cid), 'blink', { scale: scale || 2, state: 'ok' }); } catch (e) { return ''; } };
const when = (d) => { const day = H.G().day; return d === day ? 'Today' : d === day - 1 ? 'Yesterday' : `Day ${d}`; };
const sure = (s) => (s >= 0.8 ? 'Everyone is saying it' : s >= 0.6 ? 'Most people say so' : 'Only a rumour');
function groupPage(fid) {
  const f = fac(fid); if (!f) return; const G = H.G(); const st = P().stage(f); const gd = K().group[f.id] || {};
  const lead = P().leaderOf(f); const orig = gd.leader && K().by[gd.leader];
  const away = orig && orig.id !== f.leader && H.alive().find((s) => s.cid === orig.id);
  const base = [{ label: 'Back' }];
  if (f.met && f.status === 'active' && C.Visits) base.unshift(G.planVisit === f.id ? { label: 'Planned for tonight', sub: 'Tap to cancel', fn() { G.planVisit = null; groupPage(f.id); return ''; } } : { label: 'Visit them tonight', fn() { G.planVisit = f.id; groupPage(f.id); return ''; } });
  const hidden = []; const tap = (fn) => { hidden.push({ label: 'open', hide: true, fn() { fn(); return ''; } }); return base.length + hidden.length - 1; };
  const faceBtn = (cid, fn) => { const c = K().by[cid]; return c ? `<button class="gface" data-m="${tap(fn)}"><span>${face(cid)}</span>${esc(c.name)}</button>` : ''; };
  const out = [];
  out.push(`<div class="gsub">${esc(placeOf(f))}${f.status === 'active' ? ` · about ${P().size(f)} people` : ''}</div><div class="gstage" style="color:${f.status === 'active' ? STAGE_COL[st] : '#6f685e'}">${f.status === 'active' ? P().STAGE_WORD[st] : 'Gone'}</div>`);
  if (lead) out.push(`<button class="gcard glead" data-m="${tap(() => personPage(lead.id, f.id))}"><span class="gpic">${face(lead.id)}</span><span><b>${esc(lead.name)}</b><small>${away ? `Leads them while ${esc(orig.name)} is with you` : 'Leads them'}</small></span></button>`);
  /* what they remember: their words about you, newest first, and anyone of theirs under your roof */
  const want = P().amendsFor(f);   /* while they hold a grudge, what they want from you stays at the top, in their words */
  const said = (f.said || []).slice().reverse().map((x) => x.t).filter((t) => t !== want);
  H.alive().filter((s) => s.cid && f.missing.includes(s.cid)).forEach((s) => said.push(`${s.name} is under your roof. We have not forgotten that.`));
  if (said.length || want) out.push(`<h4>What they remember</h4>${want ? `<p class="gq gwant">“${esc(want)}”</p>` : ''}${said.slice(0, want ? 4 : 5).map((t) => `<p class="gq">“${esc(t)}”</p>`).join('')}`);
  const heard = (G.rumors || []).filter((r) => (r.f || []).includes(f.id)).slice(-3).reverse();
  if (heard.length) out.push(`<h4>What you've heard</h4>${heard.map((r) => `<div class="gh"><p class="gq">${esc(r.t)}</p><small>${sure(r.sure)} · ${when(r.d)}</small></div>`).join('')}`);
  const between = [];
  owe(f).forEach((l) => between.push(l.dir === 'owe' ? `You owe them ${esc(P().itemText(l.items))} by day ${l.due}.${G.day > l.due ? ' It is late.' : ''}` : `They owe you ${esc(P().itemText(l.items))} by day ${l.due}.`));
  (G.pacts || []).filter((q) => q.with === f.id && q.until >= G.day).forEach((q) => between.push(`${q.type === 'trade' ? 'A trade pact' : q.type === 'defense' ? 'A defence pact' : 'A pact: neither side raids the other'}, until day ${q.until}.`));
  if (between.length) out.push(`<h4>Between you</h4><div class="gcard gcol">${between.map((t) => `<div>${t}</div>`).join('')}</div>`);
  const yours = H.alive().filter((s) => s.cid && K().by[s.cid] && K().by[s.cid].group === f.id);
  if (yours.length) out.push(`<h4>Yours from here</h4><div class="gfaces">${yours.map((s) => `<button class="gface" data-m="${tap(() => H.personPage(s))}"><span>${H.portrait(s)}</span>${esc(s.name)}</button>`).join('')}</div>`);
  const met = (f.seen || []).filter((cid) => cid !== f.leader && f.members.includes(cid));
  if (met.length) out.push(`<h4>People you've met</h4><div class="gfaces">${met.map((cid) => faceBtn(cid, () => personPage(cid, f.id))).join('')}</div>`);
  H.ask(f.name, out.join(''), base.concat(hidden), { html: `<span class="gbig">${markSvg(f.id, 64, '#f2ebcf')}</span>` });
}

/* ---------- someone you have met ---------- */
function personPage(cid, fid) {
  const c = K().by[cid]; const f = fac(fid); if (!c || !f) return; const G = H.G();
  const he = c.sex === 'f' ? 'She' : c.sex === 'm' ? 'He' : 'They';
  const rel = cid === f.leader ? 'Leads them' : cid === P().envoyOf(f) && f.envoyDay != null ? 'Their envoy to you' : `One of ${f.name}`;
  const out = [`<div class="gsub">${esc(c.role || '')}${c.home ? ' · from ' + esc(c.home) : ''}</div><div class="gsub">${esc(rel)}</div>`];
  if (f.lastLine && f.lastLine.cid === cid) out.push(`<div class="gcard gcol"><p class="gq">“${esc(f.lastLine.t)}”</p><small>${when(f.lastLine.d)}, at your door</small></div>`);
  const k = (G.known || {})[cid] || [];
  if (k.length) out.push(`<h4>What you know</h4>${k.map((x) => `<div class="gh"><p class="gq">“${esc(x.t)}”</p><small>${x.by === 'told' ? `${he} told you, ${when(x.d).toLowerCase().replace(/^day/, 'day')}` : esc(x.by)}</small></div>`).join('')}`);
  H.ask(c.name, out.join(''), [{ label: 'Back', fn() { groupPage(f.id); return ''; } }], { sp: P().face(cid), state: 'ok' });
}

/* taps on the World tab */
function act(a, d, ui) {
  if (a === 'wsheet') { ui.wopen = !ui.wopen; return true; }
  if (a === 'wgrp') {
    const f = fac(d.f); if (!f || !f.met) return true;
    if (ui.wsel === f.id && ui.wopen) { groupPage(f.id); H.flush(); return true; }
    ui.wsel = f.id; ui.wopen = true;
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(() => { const r = document.querySelector('.cmprow.on'); if (r && r.scrollIntoView) r.scrollIntoView({ block: 'nearest' }); });
    return true;
  }
  return false;
}
/* the dot on the World tab: something out there needs you */
const needsYou = () => !!(H && H.G() && known().some((f) => { const n = noteOf(f); return n && n.need; }));

C.WorldUI = { set host(h) { H = h; }, panel, groupPage, personPage, act, needsYou, markSvg, MARK };
})(typeof window !== 'undefined' ? window : globalThis);
