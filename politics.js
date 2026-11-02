/* CRISIS — politics
   Fourteen factions that live their own lives whether or not you are watching: they trade, raid, make pacts, break them, fight over
   the three standoff zones (New Cafeteria, New Theatre, Hostel T), starve, split, and collapse. You are a commander among them.
   You can trade, gift, lend, borrow, make pacts, demand tribute, threaten, broker peace, incite, send aid, and betray.
   State lives in G.fac, G.zones, G.ledger, G.pacts, G.rep, G.wars, G.rumors. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const K = () => C.Cast, S = () => C.Story, W = () => C.Campus;
let H = null;
const P = {};
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = (a) => a[Math.floor(Math.random() * a.length)], chance = (p) => Math.random() < p, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ITEMV = { food: 1, water: 1, meds: 3, bandage: 1.5, parts: 1.2, wood: 0.8, cloth: 0.8, ogogoro: 1.5, club: 2, machete: 3, pistol: 6, meal: 1.6 };
const NAME = { food: 'food', water: 'water', meds: 'medicine', bandage: 'bandages', parts: 'scrap', wood: 'wood', cloth: 'cloth', ogogoro: 'ogogoro', club: 'clubs', machete: 'machetes', pistol: 'pistols', meal: 'cooked meals' };
const value = (items) => Object.entries(items).reduce((a, [k, n]) => a + (ITEMV[k] || 1) * n, 0);
const itemText = (items) => Object.entries(items).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${NAME[k] || k}`).join(', ');
const fac = (id) => (H.G.fac || []).find((f) => f.id === id);
const live = () => (H.G.fac || []).filter((f) => f.status === 'active');
const gdef = (id) => K().group[id];
const size = (f) => f.foll + f.members.length;
const power = (f) => Math.max(0, (f.foll + f.members.length * 2) * (0.35 + f.arms / Math.max(8, size(f)) * 1.8) * (0.55 + f.morale / 100 * 0.65));
const ops = (a, b) => { const k = K().opinion; return (f2o(a, b)); };
const f2o = (a, b) => ((a.op || {})[b.id] != null ? a.op[b.id] : 0);
function setOp(a, b, v) { a.op[b.id] = clamp(v, -100, 100); }
function bump(a, b, v) { setOp(a, b, f2o(a, b) + v); setOp(b, a, f2o(b, a) + v * 0.8); }
const leaderOf = (f) => K().by[f.leader];
const face = (cid, seed) => { const c = K().by[cid]; const sp = C.Sprites.gen(c.arch, (seed || 0) + 7919 * (c.id.length * 31 + c.name.length), c.ov); sp.name = c.name;
  if (H && H.G && (H.G.turned || []).some((t) => t.cid === cid)) { sp.top = Object.assign({}, sp.top, { type: 'shirt', sleeve: 'long', c: '#1d1d20' }); sp.bottom = Object.assign({}, sp.bottom, { type: 'pants', c: '#1d1d20' }); sp.over = [{ t: 'vest', c: '#2a2a22' }]; sp.head = 'headband'; sp.headc = '#b8402f'; sp.item = 'ak'; sp.camo = null; }
  return sp; };
const faceArt = (f, state) => { const l = f.leader && K().by[f.leader]; if (!l) { const sp = C.Sprites.gen('refugee', f.id.length * 131 + 7); return { sp, state: state || 'hungry' }; } return { sp: face(f.leader), state: state || 'ok' }; };
const stance = (f) => { const p = f.p || 0; return p >= 40 ? 'Allied' : p >= 15 ? 'Friendly' : p > -15 ? 'Wary' : p > -45 ? 'Hostile' : 'Enemy'; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- setup ---------- */
P.setHost = function (host) { H = host; };
P.init = function (host, party) {
  H = host; const G = H.G; const cast = K(); const used = new Set([G.shelter]);
  const inParty = new Set(party || []);
  G.fac = cast.groups.map((g) => {
    let loc = g.locs.find((l) => !used.has(l) && W().BY[l]);
    if (!loc) { const pool = W().LOCS.filter((l) => l.group && !used.has(l.id)); loc = pool.length ? pick(pool).id : g.locs[0]; }
    used.add(loc);
    const members = g.members.filter((m) => !inParty.has(m));
    const missing = g.members.filter((m) => inParty.has(m));
    const foll = rnd(g.foll[0], g.foll[1]); const sz = foll + members.length;
    const leader = members.includes(g.leader) ? g.leader : (g.alt && members.includes(g.alt) ? g.alt : members[0]);
    const f = { id: g.id, name: g.name, loc, members, missing, leader, foll, status: 'active', morale: rnd(55, 80), arms: Math.round(sz * 0.25 * (0.4 + g.arms)), food: Math.round(sz * (0.7 + g.wealth * 2.2)), water: Math.round(sz * (0.6 + g.wealth * 1.7)), meds: Math.round(sz * 0.1 * (g.id === 'medical' ? 5 : 1)) + rnd(0, 3), parts: rnd(2, 10), cloth: rnd(1, 6), p: 0, op: {}, tension: 0, met: false, hist: [], mem: {} };
    members.forEach((m) => { if (inParty.has(m)) return; });
    return f;
  });
  G.fac.forEach((f) => { G.fac.forEach((o) => { if (o.id !== f.id) f.op[o.id] = K().opinion[f.id + '|' + o.id] || 0; }); });
  /* your people vouch for their own: a faction that lost a member to your party starts warm toward you */
  G.fac.forEach((f) => { f.p = f.missing.length * 14; });
  G.zones = Object.fromEntries(Object.entries(cast.zones).map(([k, z]) => [k, { id: k, name: z.name, holder: z.holder, claimants: z.claimants.slice(), tension: rnd(8, 25), since: 1, last: 0, note: z.note }]));
  G.ledger = []; G.pacts = []; G.wars = []; G.rumors = []; G.envoys = []; G.rep = { honor: 0, fear: 0, wealth: 0 };
  /* if a zone holder is missing its leader, nothing changes; holder always exists */
  P.sync();
};

/* ---------- two-way sync with the older "G.groups" structure the scavenging code uses ---------- */
P.sync = function () {
  const G = H.G; G.groups = G.groups || [];
  G.fac.forEach((f, i) => {
    let g = G.groups.find((x) => x.fid === f.id);
    if (!g) { g = { id: i + 1, fid: f.id, name: f.name, loc: f.loc, size: size(f), att: 'wary', rel: f.p, stock: { food: f.food, water: f.water, meds: f.meds }, alive: true, met: false, starve: 0 }; G.groups.push(g); }
    g.name = f.name; g.loc = f.loc; g.size = Math.max(0, size(f)); g.alive = f.status === 'active'; g.met = g.met || f.met;
    g.rel = f.p; g.stock.food = f.food; g.stock.water = f.water; g.stock.meds = f.meds;
    g.att = f.status !== 'active' ? 'desperate' : f.p <= -60 ? 'predatory' : f.p <= -20 ? 'hostile' : (f.food < size(f) * 0.6 ? 'desperate' : f.p >= 25 ? 'friendly' : 'wary');
    g.faces = f.members.slice(0, 4).map((m) => face(m));
    if (!g.faces.length) g.faces = [C.Sprites.gen('refugee', i * 977 + 3), C.Sprites.gen('boy_hoodie', i * 313 + 5)];
    g.leaderName = leaderOf(f) ? leaderOf(f).name : '';
  });
};
P.pull = function () {   // changes made to G.groups by older code flow back
  const G = H.G;
  (G.groups || []).forEach((g) => { const f = fac(g.fid); if (!f) return; f.p = clamp(g.rel, -100, 100); f.food = Math.max(0, g.stock.food); f.water = Math.max(0, g.stock.water); f.meds = Math.max(0, g.stock.meds); if (g.size < size(f)) { const lost = size(f) - g.size; f.foll = Math.max(0, f.foll - lost); } if (g.met) f.met = true; });
};

/* ---------- rumours (these become the news, with a reliability) ---------- */
function rumor(text, sure, facs) { const G = H.G; G.rumors.push({ d: G.day, t: text, sure: sure == null ? 0.7 : sure, f: (facs || []).map((x) => x.id) }); if (G.rumors.length > 30) G.rumors.shift(); }
P.rumor = rumor;
function note(f, text) { f.hist.push({ d: H.G.day, t: text }); if (f.hist.length > 10) f.hist.shift(); }

/* ---------- battles and casualties ---------- */
function kill(f, why) {
  if (!f.members.length) return null;
  if (chance(0.5) || f.foll <= 0) {
    const id = pick(f.members.filter((m) => m !== f.leader) .concat(chance(0.18) ? [f.leader] : []).filter(Boolean)); if (!id) return null;
    f.members = f.members.filter((m) => m !== id); const c = K().by[id];
    H.G.fallen = H.G.fallen || []; H.G.fallen.push({ id, name: c.name, group: f.id, day: H.G.day, why });
    if (id === f.leader) { f.leader = f.members.find((m) => m !== id) || null; f.morale = clamp(f.morale - 20, 0, 100); }
    f.p = f.p;   // opinion toward you unchanged
    return c;
  }
  return null;
}
function fight(a, d, zoneId) {
  const A = power(a) * (0.75 + Math.random() * 0.5), D = power(d) * (0.8 + Math.random() * 0.5) * 1.18;
  const win = A > D; const winner = win ? a : d, loser = win ? d : a;
  const lossL = Math.round(loser.foll * (0.12 + Math.random() * 0.22)), lossW = Math.round(winner.foll * (0.04 + Math.random() * 0.1));
  loser.foll = Math.max(0, loser.foll - lossL); winner.foll = Math.max(0, winner.foll - lossW);
  loser.morale = clamp(loser.morale - 14, 0, 100); winner.morale = clamp(winner.morale + 6, 0, 100);
  const fallen = []; const k1 = kill(loser, 'battle'); if (k1) fallen.push(k1); if (chance(0.25)) { const k2 = kill(winner, 'battle'); if (k2) fallen.push(k2); }
  ['food', 'water', 'meds', 'parts'].forEach((k) => { const take = Math.floor(loser[k] * (0.15 + Math.random() * 0.2)); loser[k] -= take; winner[k] += take; });
  bump(a, d, -25);
  return { win, winner, loser, lossL, lossW, fallen };
}

/* ---------- what a faction does with its day ---------- */
function think(f) {
  const G = H.G, sz = size(f), others = live().filter((o) => o.id !== f.id), ai = gdef(f.id).ai;
  const hungry = f.food < sz * 0.45 || f.water < sz * 0.4; const opts = [];
  others.forEach((o) => {
    const op = f2o(f, o);
    if (op > 5 && !atWar(f, o)) opts.push({ w: ai.trade * 1.6 * (hungry ? 1.5 : 1), do: 'trade', o });
    if ((op < 5 || hungry) && !pactWith(f, o) && power(f) > power(o) * 1.05) opts.push({ w: ai.aggr * (hungry ? 2.4 : 0.8) * (op < -20 ? 1.6 : 1), do: 'raid', o });
    if (op > 28 && !pactWith(f, o)) opts.push({ w: 0.7 * ai.honor, do: 'pact', o });
    if (pactWith(f, o) && (hungry || op < -10) && ai.honor < 0.4) opts.push({ w: 0.5, do: 'betray', o });
  });
  Object.values(G.zones).forEach((z) => { if (z.holder !== f.id && z.claimants.includes(f.id) && f.morale > 35) { const h = fac(z.holder); if (h && h.status === 'active') opts.push({ w: ai.aggr * 1.1 * (power(f) > power(h) * 0.85 ? 1.5 : 0.35) + z.tension / 120, do: 'contest', z, o: h }); } });
  if (G.player && f.p > -50 && f.met !== false) opts.push({ w: 0.55 * (hungry ? 2 : 1), do: 'envoy' });
  opts.push({ w: 0.8, do: 'recruit' }, { w: 0.6, do: 'fortify' }, { w: 0.9, do: 'forage' });
  const tot = opts.reduce((a, b) => a + b.w, 0); let r = Math.random() * tot; for (const o of opts) { if ((r -= o.w) < 0) return o; } return opts[0];
}
const pactWith = (a, b) => (H.G.pacts || []).some((p) => p.until >= H.G.day && p.between && p.between.includes(a.id) && p.between.includes(b.id));
const atWar = (a, b) => (H.G.wars || []).some((w) => w.on && [w.a, w.b].includes(a.id) && [w.a, w.b].includes(b.id));
function act(f, o) {
  const G = H.G; const dn = (x) => x.name;
  switch (o.do) {
    case 'trade': { const t = o.o; const give = f.food > size(f) ? 'food' : f.parts > 6 ? 'parts' : 'water'; const get = t.meds > f.meds + 2 ? 'meds' : t.food > size(t) ? 'food' : 'water'; const qg = Math.min(f[give] * 0.15 | 0, 6), qt = Math.min(t[get] * 0.15 | 0, 6); if (qg > 0 && qt > 0) { f[give] -= qg; t[give] += qg; t[get] -= qt; f[get] += qt; bump(f, t, 4); if (chance(0.35)) rumor(`${dn(f)} and ${dn(t)} were seen trading in the open.`, 0.8, [f, t]); } break; }
    case 'raid': { const t = o.o; const r = fight(f, t); const lines = []; if (r.win) { rumor(`${dn(f)} hit ${dn(t)} in the night. ${r.fallen.length ? r.fallen.map((c) => c.name).join(' and ') + ' did not make it.' : 'Nobody could say who was hurt.'}`, 0.65, [f, t]); if (t.p > 10 && r.fallen.length) f.p = f.p; } else rumor(`${dn(f)} tried ${dn(t)} and was thrown back.`, 0.55, [f, t]); note(f, `raided ${dn(t)}`); G.dir && (G.dir.tension = clamp(G.dir.tension + 3, 0, 100)); if (!atWar(f, t) && chance(0.5)) G.wars.push({ a: f.id, b: t.id, start: G.day, on: true }); break; }
    case 'pact': { const t = o.o; if (chance(0.55)) { G.pacts.push({ type: 'nonaggr', between: [f.id, t.id], until: G.day + rnd(8, 14) }); bump(f, t, 8); rumor(`${dn(f)} and ${dn(t)} are said to have shaken hands.`, 0.8, [f, t]); } break; }
    case 'betray': { const t = o.o; G.pacts = G.pacts.filter((p) => !(p.between && p.between.includes(f.id) && p.between.includes(t.id))); bump(f, t, -40); const r = fight(f, t); rumor(`${dn(f)} broke their word to ${dn(t)}. Nobody is calling it a surprise.`, 0.9, [f, t]); break; }
    case 'contest': { const z = o.z, h = o.o; z.tension = clamp(z.tension + 12, 0, 100); if (z.tension > 55 && chance(0.55)) { const r = fight(f, h, z.id); z.tension = clamp(z.tension - 28, 0, 100); if (r.win) { z.holder = f.id; z.since = G.day; rumor(`${dn(f)} have taken the ${z.name} from ${dn(h)}. ${r.fallen.length ? r.fallen[0].name + ' fell in the fight.' : ''}`, 0.85, [f, h]); } else rumor(`${dn(h)} held the ${z.name} against ${dn(f)}.`, 0.8, [f, h]); G.wars.push({ a: f.id, b: h.id, zone: z.id, start: G.day, on: true }); } else rumor(`${dn(f)} are massing near the ${z.name}.`, 0.6, [f, h]); break; }
    case 'envoy': { G.envoys.push(mkEnvoy(f)); break; }
    case 'recruit': { if (f.morale > 50 && f.food > size(f) * 0.8) { f.foll += rnd(1, 4); } break; }
    case 'fortify': { f.arms += rnd(0, 2); f.morale = clamp(f.morale + 2, 0, 100); break; }
    case 'forage': { f.food += rnd(0, Math.ceil(size(f) * 0.25)); f.water += rnd(0, Math.ceil(size(f) * 0.2)); if (chance(0.1)) f.meds += 1; break; }
  }
}
function mkEnvoy(f) {
  const G = H.G, sz = size(f); const hungry = f.food < sz * 0.5;
  const kinds = [];
  if (hungry) kinds.push('plea', 'plea', 'trade'); else kinds.push('trade', 'pact');
  if (f.p < -10 && power(f) > 20) kinds.push('tribute');
  if (live().some((o) => atWar(f, o))) kinds.push('call');
  if (f.p > 20 && f.mem.trust) kinds.push('secret');
  if (f.missing.length && !f.mem.missingAsked) kinds.push('missing', 'missing');
  const k = pick(kinds); return { fid: f.id, kind: k, day: G.day };
}

/* ---------- the daily tick ---------- */
P.tick = function () {
  const G = H.G; P.pull();
  live().forEach((f) => {
    const sz = size(f); f.food = Math.max(0, f.food - Math.ceil(sz * 0.14)); f.water = Math.max(0, f.water - Math.ceil(sz * 0.12));
    const starving = f.food === 0 || f.water === 0;
    if (starving) { f.morale = clamp(f.morale - 6, 0, 100); f.foll = Math.max(0, f.foll - Math.ceil(f.foll * 0.07)); if (chance(0.15)) kill(f, 'hunger'); } else f.morale = clamp(f.morale + 1, 0, 100);
    Object.values(G.zones).forEach((z) => { if (z.holder === f.id) { if (z.id === 'newcaf') f.food += 5; if (z.id === 'bhT') f.arms += chance(0.3) ? 1 : 0; if (z.id === 'theatre') f.morale = clamp(f.morale + 1, 0, 100); } });
    if (chance(0.5)) act(f, think(f));
    if (f.foll <= 0 && f.members.length === 0 || (f.foll <= 1 && f.members.length === 0)) { f.status = 'gone'; rumor(`${f.name} are gone. The rooms they held are standing open.`, 0.9, [f]); G.zones && Object.values(G.zones).forEach((z) => { if (z.holder === f.id) z.holder = null; }); }
    if (!f.leader && f.members.length) f.leader = f.members[0];
  });
  /* zones with no holder get claimed by the strongest claimant */
  Object.values(G.zones).forEach((z) => { z.tension = clamp(z.tension + (live().filter((f) => z.claimants.includes(f.id) && f.id !== z.holder).length) * 1.2 - 1, 0, 100); if (!z.holder) { const c = live().filter((f) => z.claimants.includes(f.id)).sort((a, b) => power(b) - power(a))[0]; if (c) { z.holder = c.id; rumor(`${c.name} walked into the ${z.name} and sat down.`, 0.8, [c]); } } });
  /* pacts expire, wars cool */
  G.pacts = G.pacts.filter((p) => p.until >= G.day); G.wars.forEach((w) => { if (G.day - w.start > 8 || (fac(w.a) && fac(w.a).status !== 'active') || (fac(w.b) && fac(w.b).status !== 'active')) w.on = false; });
  /* opinion toward you drifts toward the mood of the day */
  live().forEach((f) => { f.p = clamp(f.p + (f.p > 0 ? -0.4 : 0.4), -100, 100); });
  P.ledgerTick();
  P.sync();
};

/* ---------- debts ---------- */
P.ledgerTick = function () {
  const G = H.G;
  G.ledger.forEach((l) => {
    if (l.status !== 'open' || G.day < l.due) return; const f = fac(l.fid); if (!f || f.status !== 'active') { l.status = 'void'; return; }
    if (l.dir === 'owed') {          // they owe you
      const can = Object.entries(l.items).every(([k, n]) => (f[k] || 0) >= n * 0.5); const honest = gdef(f.id).ai.honor;
      if (can && chance(0.35 + honest * 0.55)) { Object.entries(l.items).forEach(([k, n]) => { const take = Math.min(f[k] || 0, n); f[k] -= take; H.add(k, take); }); l.status = 'paid'; f.p = clamp(f.p + 6, -100, 100); G.rep.honor++; G.envoys.push({ fid: f.id, kind: 'repaid', items: l.items, day: G.day }); }
      else { l.status = 'default'; G.envoys.push({ fid: f.id, kind: 'default', items: l.items, day: G.day }); }
    } else {                           // you owe them
      l.late = (l.late || 0) + 1; if (l.late === 1) G.envoys.push({ fid: f.id, kind: 'due', items: l.items, day: G.day });
    }
  });
};
P.repay = function (l) {
  const f = fac(l.fid); if (!Object.entries(l.items).every(([k, n]) => H.inv(k) >= n)) return false;
  Object.entries(l.items).forEach(([k, n]) => { H.add(k, -n); f[k] = (f[k] || 0) + n; }); l.status = 'paid'; f.p = clamp(f.p + 10, -100, 100); H.G.rep.honor++; return true;
};

/* ---------- your side of the table ---------- */
P.myPower = function () {
  const G = H.G; const al = H.alive(); let p = al.length * 2 + G.build.barricade * 3; const w = ['pistol', 'machete', 'club'].reduce((a, k, i) => a + H.inv(k) * [4, 2.5, 1.2][i], 0);
  (G.pacts || []).forEach((q) => { if (q.type === 'defense' && q.with) { const f = fac(q.with); if (f && f.status === 'active') p += power(f) * 0.4; } });
  return p + w;
};
function envoyScore(s, f) {
  const c = S().cd(s); if (!c) return 0; const a = c.axes; let sc = (a.warm + a.funny * 0.6 + a.order * 0.6) * 6 + (s.trust || 0) / 8;
  if (c.group === f.id) sc += 18;        // they know people there
  else if ((c.ties || []).some((t) => f.members.includes(t[0]))) sc += 8;
  if (K().by[f.leader] && (c.ties || []).some((t) => t[0] === f.leader)) sc += 8;
  return sc;
}
P.envoyScore = envoyScore;
P.askPrice = (f, give, get) => { const gv = value(give), tv = value(get); const need = (k) => (f[k] < size(f) * 0.5 ? 1.5 : 1); const want = Object.entries(give).reduce((a, [k, n]) => a + (ITEMV[k] || 1) * n * need(k), 0); const lose = Object.entries(get).reduce((a, [k, n]) => a + (ITEMV[k] || 1) * n * (f[k] < size(f) * 0.5 ? 1.6 : 1), 0); const bonus = 1 + f.p / 250 + (pactOf(f, 'trade') ? 0.18 : 0); return { accept: want * bonus >= lose, want, lose }; };
const pactOf = (f, type) => (H.G.pacts || []).some((p) => p.with === f.id && p.type === type && p.until >= H.G.day);
P.pactOf = pactOf;

/* The action menu. Every action costs a task from the selected survivor, so who you send matters. */
P.menu = function (s) {
  const G = H.G; const buttons = live().map((f) => ({ label: `${f.name} · ${stance(f)}${f.met ? '' : ' · unknown'}`, fn() { return P.faction(s, f); } }));
  buttons.push({ label: 'Back' });
  const zl = Object.values(G.zones).map((z) => `${z.name}: ${z.holder ? fac(z.holder).name : 'nobody'} (${z.tension > 60 ? 'on the brink' : z.tension > 35 ? 'tense' : 'quiet'})`).join('\n');
  H.ask('The Campus', `<i>The three standoff zones:</i>\n${zl}\n\n<i>Who do you send ${S().first(s)} to?</i>`, buttons, S().portrait(s));
  return '';
};
P.faction = function (s, f) {
  const G = H.G; f.met = true; const ldr = leaderOf(f);
  const sc = envoyScore(s, f); const what = `${stance(f)}. ${gdef(f.id).desc}`;
  const known = f.p > 10 || f.mem.looked; const stocks = known ? `\n\n<i>${f.food < size(f) * 0.4 ? 'They look hungry.' : f.food > size(f) * 1.4 ? 'Their stores look full.' : 'They look steady.'} About ${size(f)} people, ${f.members.length} you could name.</i>` : '';
  const acts = [
    { label: 'Trade', fn() { return tradeMenu(s, f); } }, { label: 'Give a gift', fn() { return giftMenu(s, f); } }, { label: 'Lend supplies', fn() { return loanMenu(s, f); } },
    { label: 'Ask to borrow', fn() { return borrow(s, f); } }, { label: 'Propose a pact', fn() { return pactMenu(s, f); } }, { label: 'Demand tribute', fn() { return tribute(s, f); } },
    { label: 'Threaten them', fn() { return threaten(s, f); } }, { label: 'Try to broker peace', fn() { return brokerMenu(s, f); } }, { label: 'Incite trouble against them', fn() { return incite(s, f); } },
    { label: 'Send aid to their fight', fn() { return support(s, f); } }, { label: 'Betray them', fn() { return betray(s, f); } }
  ];
  acts.push({ label: 'Repay a debt', fn() { return repayMenu(s, f); } }); acts.push({ label: 'Back' });
  H.ask(f.name, `${what}${ldr ? `\n\n<i>${ldr.name} leads them.</i>` : ''}${stocks}\n\n<i>${S().first(s)} would go. ${sc > 18 ? 'They know how to talk to these people.' : sc > 10 ? 'A fair choice.' : 'A weak fit for this.'}</i>`, acts, faceArt(f));
  return '';
};
function spend(s) { if (s.slots < 1) return false; s.slots--; s.fatigue += 6; return true; }
const tooTired = (s) => `<i>${S().first(s)} is too worn out to go anywhere today.</i>`;

function giveOptions(f) { return ['food', 'water', 'meds', 'bandage', 'wood', 'parts', 'cloth', 'ogogoro'].filter((k) => H.inv(k) > 0); }
function tradeMenu(s, f) {
  if (s.slots < 1) return tooTired(s);
  const mine = giveOptions(f).slice(0, 5); const theirs = ['food', 'water', 'meds', 'parts', 'cloth', 'wood'].filter((k) => (f[k] || 0) > 2).slice(0, 5);
  if (!mine.length || !theirs.length) return `<i>You have nothing to swap, or they do not.</i>`;
  const b = []; mine.forEach((g) => { theirs.forEach((t) => { if (g !== t && b.length < 8) b.push({ label: `Give 3 ${NAME[g]} for 3 ${NAME[t]}`, off: H.inv(g) < 3, fn() { if (!spend(s)) return tooTired(s); const give = { [g]: 3 }, get = { [t]: 3 }; const pr = P.askPrice(f, give, get); const bonus = envoyScore(s, f) / 100; if (pr.accept || chance(0.2 + bonus)) { H.add(g, -3); H.add(t, 3); f[g] = (f[g] || 0) + 3; f[t] -= 3; f.p = clamp(f.p + 4, -100, 100); S().bond(s, s, 0, 0); H.G.rep.wealth++; return `<i>The deal is made, hands shaken. ${S().first(s)} counts it twice.</i>`; } f.p = clamp(f.p - 2, -100, 100); return `<i>They shake their heads. "${cap(NAME[g])} is cheap today."</i>`; } }); }); });
  b.push({ label: 'Back' }); H.ask('Trade', `<i>What will ${S().first(s)} offer?</i>`, b, faceArt(f)); return '';
}
function giftMenu(s, f) {
  const b = giveOptions(f).slice(0, 6).map((k) => ({ label: `Give 2 ${NAME[k]}`, off: H.inv(k) < 2, fn() { if (!spend(s)) return tooTired(s); H.add(k, -2); f[k] = (f[k] || 0) + 2; f.p = clamp(f.p + 6 + value({ [k]: 2 }) * 1.5, -100, 100); G_rep('honor', 1); return `<i>A gift needs no answer. Their faces say enough.</i>`; } }));
  b.push({ label: 'Back' }); H.ask('A gift', `<i>Generosity buys loyalty slowly, and sometimes not at all.</i>`, b, faceArt(f)); return '';
}
const G_rep = (k, n) => { H.G.rep[k] = (H.G.rep[k] || 0) + n; };
function loanMenu(s, f) {
  const b = giveOptions(f).slice(0, 6).map((k) => ({ label: `Lend 4 ${NAME[k]} (repay 5 in six days)`, off: H.inv(k) < 4, fn() { if (!spend(s)) return tooTired(s); H.add(k, -4); f[k] = (f[k] || 0) + 4; H.G.ledger.push({ id: Date.now() + Math.random(), fid: f.id, dir: 'owed', items: { [k]: 5 }, due: H.G.day + 6, status: 'open' }); f.p = clamp(f.p + 8, -100, 100); return `<i>${f.name} will remember. Debts are a kind of leash, and both ends are held.</i>`; } }));
  b.push({ label: 'Back' }); H.ask('A loan', `<i>You will be owed. Whether you are paid is another matter.</i>`, b, faceArt(f)); return '';
}
function borrow(s, f) {
  if (f.p < 15) return `<i>"We do not lend to people we do not know."</i>`; if (s.slots < 1) return tooTired(s);
  const k = ['food', 'water', 'meds'].find((x) => (f[x] || 0) > size(f) * 0.6); if (!k) return `<i>They have nothing to spare.</i>`;
  return (() => { H.ask('A loan', `<i>${f.name} will lend 5 ${NAME[k]}. You will owe 7 in five days.</i>`, [{ label: 'Take it', fn() { if (!spend(s)) return tooTired(s); f[k] -= 5; H.add(k, 5); H.G.ledger.push({ id: Date.now() + Math.random(), fid: f.id, dir: 'owe', items: { [k]: 7 }, due: H.G.day + 5, status: 'open' }); return `<i>You have it. You also have a date.</i>`; } }, { label: 'Refuse' }], faceArt(f)); return ''; })();
}
function repayMenu(s, f) {
  const open = H.G.ledger.filter((l) => l.fid === f.id && l.dir === 'owe' && l.status === 'open');
  if (!open.length) return `<i>You owe ${f.name} nothing.</i>`;
  const b = open.map((l) => ({ label: `Repay ${itemText(l.items)}`, off: !Object.entries(l.items).every(([k, n]) => H.inv(k) >= n), fn() { if (!spend(s)) return tooTired(s); return P.repay(l) ? `<i>"Good." They write it off. They mean it.</i>` : `<i>You cannot cover it.</i>`; } }));
  b.push({ label: 'Back' }); H.ask('Settling up', `<i>Open debts with ${f.name}.</i>`, b, faceArt(f)); return '';
}
function pactMenu(s, f) {
  const types = [['nonaggr', 'A non-aggression pact', 'Neither side raids the other.'], ['trade', 'A trade pact', 'Better prices both ways.'], ['defense', 'A defence pact', 'If one is attacked, the other helps.']];
  const b = types.map(([id, name, tip]) => ({ label: `${name} — ${tip}`, fn() {
    if (!spend(s)) return tooTired(s); const ai = gdef(f.id).ai; const sc = f.p / 100 + envoyScore(s, f) / 90 + ai.honor * 0.3 + (pactOf(f, id) ? -1 : 0) + (id === 'defense' ? -0.25 : 0);
    if (sc > 0.45 + Math.random() * 0.2) { H.G.pacts.push({ type: id, with: f.id, until: H.G.day + rnd(10, 16), between: ['player', f.id] }); f.p = clamp(f.p + 8, -100, 100); return `<i>They agree. A pact is only paper until the day it is tested.</i>`; }
    f.p = clamp(f.p - 3, -100, 100); return `<i>${f.name} turn it down politely. "Perhaps when we know you better."</i>`;
  } }));
  b.push({ label: 'Back' }); H.ask('A pact', `<i>Terms last about two weeks. Break one and everyone remembers.</i>`, b, faceArt(f)); return '';
}
function tribute(s, f) {
  if (!spend(s)) return tooTired(s); const mine = P.myPower(), theirs = power(f); const ok = mine * (1 + H.G.rep.fear * 0.05) > theirs * 0.75;
  if (ok) { const k = f.food > f.water ? 'food' : 'water'; const q = Math.min(f[k], Math.ceil(size(f) * 0.25)); f[k] -= q; H.add(k, q); f.p = clamp(f.p - 25, -100, 100); H.G.rep.fear += 2; H.G.rep.honor -= 1; return `<i>They hand it over, white-lipped. You have ${q} ${NAME[k]} and an enemy who will not forget the number.</i>`; }
  f.p = clamp(f.p - 35, -100, 100); H.G.rep.honor -= 1; if (C.Life) C.Life.nem(f, 'you tried to squeeze them for tribute', 30); H.G.flags.groupRaid = (H.G.groups.find((g) => g.fid === f.id) || {}).id; return `<i>They laugh at you. Then they stop laughing. "We will talk about this again."</i>`;
}
function threaten(s, f) {
  if (!spend(s)) return tooTired(s); const sc = (P.myPower() * 1.1) / Math.max(1, power(f));
  if (sc > 0.9 && chance(0.7)) { f.p = clamp(f.p - 10, -100, 100); H.G.rep.fear += 1; return `<i>They back off, for now. ${f.name} will watch you with new eyes.</i>`; }
  f.p = clamp(f.p - 25, -100, 100); f.tension += 15; if (C.Life) C.Life.nem(f, 'you threatened them and they saw the bluff', 30); if (chance(0.5)) H.G.flags.groupRaid = (H.G.groups.find((g) => g.fid === f.id) || {}).id; return `<i>Mistake. They saw the bluff, or they did not care.</i>`;
}
function brokerMenu(s, f) {
  const foes = live().filter((o) => o.id !== f.id && (atWar(f, o) || f2o(f, o) < -15)); if (!foes.length) return `<i>${f.name} have no quarrel you can see.</i>`;
  const b = foes.slice(0, 6).map((o) => ({ label: `Broker peace with ${o.name}`, fn() {
    if (!spend(s)) return tooTired(s); const sc = (H.G.rep.honor * 0.04) + envoyScore(s, f) / 80 + (f.p + o.p) / 300 + Math.random() * 0.3 - (f2o(f, o) < -40 ? 0.45 : 0);
    if (sc > 0.6) { bump(f, o, 30); H.G.wars.forEach((w) => { if ([w.a, w.b].includes(f.id) && [w.a, w.b].includes(o.id)) w.on = false; }); f.p = clamp(f.p + 8, -100, 100); o.p = clamp(o.p + 8, -100, 100); H.G.rep.honor += 2; rumor(`${f.name} and ${o.name} agreed to stop. Somebody carried the message and got both sides to listen.`, 0.9, [f, o]); return `<i>It takes all evening and the last of your patience. At the end of it, two leaders shake hands, and they look slightly shocked.</i>`; }
    f.p = clamp(f.p - 2, -100, 100); return `<i>Nothing moves. Some quarrels are older than the people having them.</i>`;
  } }));
  b.push({ label: 'Back' }); H.ask('Peace talks', `<i>Who should ${f.name} sit down with?</i>`, b, faceArt(f)); return '';
}
function incite(s, f) {
  const others = live().filter((o) => o.id !== f.id); const b = others.slice(0, 7).map((o) => ({ label: `Turn ${f.name} against ${o.name}`, fn() { if (!spend(s)) return tooTired(s); if (H.inv('food') < 1) return `<i>It takes a bribe. You have none.</i>`; H.add('food', -1); const caught = chance(0.3 - envoyScore(s, f) / 400); bump(f, o, -22); if (caught) { if (C.Life) C.Life.nem(f, 'your whispering was traced back to you', 28); f.p = clamp(f.p - 30, -100, 100); o.p = clamp(o.p - 20, -100, 100); H.G.rep.honor -= 2; return `<i>It comes out. Both of them know whose whisper it was.</i>`; } rumor(`${f.name} and ${o.name} are no longer speaking. Nobody knows quite why.`, 0.5, [f, o]); return `<i>A word here, a forgery there. By tomorrow they will be certain the other started it.</i>`; } }));
  b.push({ label: 'Back' }); H.ask('Whispers', `<i>A quiet cruelty. It costs a little food, and sometimes more.</i>`, b, faceArt(f)); return '';
}
function support(s, f) {
  const wars = H.G.wars.filter((w) => w.on && [w.a, w.b].includes(f.id)); if (!wars.length) return `<i>${f.name} are not fighting anyone.</i>`;
  return (() => { H.ask('Send aid', `<i>${f.name} are in a fight. You can send them something to make it a little less lonely.</i>`, [
    { label: 'Send food and water (3 each)', off: H.inv('food') < 3 || H.inv('water') < 3, fn() { if (!spend(s)) return tooTired(s); H.add('food', -3); H.add('water', -3); f.food += 3; f.water += 3; f.morale = clamp(f.morale + 10, 0, 100); f.p = clamp(f.p + 14, -100, 100); return `<i>They fight better fed. They remember the hand that fed them.</i>`; } },
    { label: 'Send a weapon', off: H.inv('club') + H.inv('machete') + H.inv('pistol') < 1, fn() { if (!spend(s)) return tooTired(s); const k = H.inv('pistol') ? 'pistol' : H.inv('machete') ? 'machete' : 'club'; H.add(k, -1); f.arms += k === 'pistol' ? 3 : 1; f.p = clamp(f.p + 16, -100, 100); return `<i>The ${k} goes to someone who will use it. You do not ask on whom.</i>`; } }, { label: 'Back' }], faceArt(f)); return ''; })();
}
function betray(s, f) {
  const pact = H.G.pacts.find((p) => p.with === f.id && p.until >= H.G.day);
  if (!pact && f.p > 20) return `<i>You cannot betray what you have not promised. Declare it, first, with a threat.</i>`;
  return (() => { H.ask('Betrayal', `<i>${S().first(s)} knows where ${f.name} keep their stores. If you strike now, while they trust you, it will work. Everyone will know who did it.</i>`, [
    { label: 'Do it', fn() { if (!spend(s)) return tooTired(s); H.G.pacts = H.G.pacts.filter((p) => p !== pact); const take = (k) => { const q = Math.floor((f[k] || 0) * 0.5); f[k] -= q; H.add(k, q); return q; }; const a = take('food'), b2 = take('water'), c = take('meds'); f.p = -90; if (C.Life) C.Life.nem(f, 'you robbed them while they trusted you', 75); f.morale = clamp(f.morale - 15, 0, 100); H.G.rep.honor -= 6; live().forEach((o) => { if (o.id !== f.id) o.p = clamp(o.p - 6, -100, 100); }); H.G.stats.thefts++; H.moodAll(-6); return `<i>It is quick. It is easy. You carry ${a} food, ${b2} water and ${c} medicine out through a door that was left open for you. Nobody in your group says a word. Everyone in the campus will know by morning.</i>`; } }, { label: 'Back out' }], faceArt(f)); return ''; })();
}

C.Politics = Object.assign(P, { power, size, stance, fac, live, face, faceArt, leaderOf, value, itemText, NAME, f2o, bump, rumor, atWar, pactWith, kill, fight, mkEnvoy, think, act, get host() { return H; } });
if (typeof module !== 'undefined') module.exports = P;
})(typeof window !== 'undefined' ? window : globalThis);
