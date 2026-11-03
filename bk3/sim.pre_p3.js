/* Crisis v2 engine: continuous clock, needs, autonomous people, stations, jobs, building, night attention, raids.
   No DOM in here. The game talks to it through `Sim.init(host)`; the view reads `Sim.posOf` and each person's `act`.
   Time is in game-minutes. G.t = minutes since Day 1, 00:00. The game starts Day 1 08:00. The day number turns over at 06:00. */
(function (g) {
'use strict';
const C = g.Crisis = g.Crisis || {};
let H = null;                                   // host: { G, R, add, inv, log, bond, mood, kill, ... } (see init)
const G = () => H.G;
const R = () => (H.R ? H.R() : Math.random());
const rnd = (a, b) => a + Math.floor(R() * (b - a + 1));
const chance = (p) => R() < p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (a) => a[Math.floor(R() * a.length)];

/* ---------- clock ---------- */
const DAY0 = 360;                               // the day number turns over at 06:00
const dayOf = (t) => Math.floor((t - DAY0) / 1440) + 1;
const hourOf = (t) => Math.floor(t / 60) % 24;
const minOf = (t) => Math.floor(t) % 60;
const clock = (t) => `${String(hourOf(t)).padStart(2, '0')}:${String(minOf(t)).padStart(2, '0')}`;
const phaseOf = (t) => { const h = (t % 1440) / 60; return h >= 20 || h < 5.5 ? 'night' : h < 7 ? 'dawn' : h < 18 ? 'day' : 'dusk'; };
const isNight = (t) => phaseOf(t) === 'night';
const SPEEDS = [0, 1, 2.5, 6];                  // game-minutes per real second: 1x is a minute of real time per game hour

/* ---------- rates (per game-minute) ---------- */
const RATE = { hunger: 0.028, thirst: 0.025, fatigue: 0.075, sleep: 0.25 };
const EFFECT = { meal: 50, raw: 20, water: 45 };

/* ---------- the house: stations ---------- */
const FLOORW = 240, STAIRX = 120, WALK = 22, STAIR_MIN = 5;
function floors() { return Math.max(2, Math.min(4, G().floors || 3)); }
function bunkCount() { const fa = Math.max(1, floors() - 2); return Math.min(Math.max(4, 4 + (G().build.bed || 0)), 6 * fa); }
function stations() {
  const B = G().build, N = floors(), top = N - 1, st = {};
  const add = (id, f, x, label, o) => { st[id] = Object.assign({ id, f, x, label }, o || {}); };
  add('door', 0, 14, 'Door'); add('win0', 0, 30, 'Window'); add('cupboard', 0, 56, 'Cupboard'); add('water', 0, 78, 'Water store');
  add('filter', 0, 94, B.filter ? 'Water filter' : 'Filter site', { built: !!B.filter });
  add('stairs', 0, STAIRX, 'Stairs');
  add('bench', 0, 146, B.bench ? 'Workbench' : 'Workbench site', { built: !!B.bench });
  add('still', 0, 168, B.still ? 'Still' : 'Still site', { built: !!B.still });
  add('stove', 0, 190, B.stove ? 'Stove' : 'Stove site', { built: !!B.stove });
  add('table', 0, 218, 'Table');
  { const fa = Math.max(1, top - 1); const nb = bunkCount();
    for (let i = 0; i < nb; i++) { const u = Math.floor(i / 2), tp = i % 2 === 1; const f = 1 + Math.min(fa - 1, Math.floor(u / 3)); const x = 20 + (u % 3) * 32; add('bunk' + i, f, x, 'Bunk ' + (i + 1) + (tp ? ' (top)' : ''), { up: tp ? 24 : 0, lx: x + 17 }); } }
  for (let f = 1; f < top; f++) add('win' + f, f, 208, 'Window');
  add('mat', 1, 150, 'Prayer mat');
  add('infirm', 1, 178, B.infirm ? 'Sick bed' : 'Sick bed site', { built: !!B.infirm });
  const compact = N <= 2;                                  // a two-storey hostel has no spare room upstairs: the look-out shares the floor with the beds, and there is no roof to use
  add('post', top, compact ? 214 : 28, 'Look-out window'); add('radio', top, compact ? 230 : 160, B.radio ? 'Radio' : 'Radio site', { built: !!B.radio });
  add('tally', top, compact ? 180 : 214, 'Tally wall');
  if (!compact) { add('garden', top, 72, B.garden ? 'Garden' : 'Garden site', { built: !!B.garden }); add('roof', top, 190, B.bucket ? 'Rain catcher' : 'Rain catcher site', { built: !!B.bucket }); }
  return st;
}
function walkMin(a, b) {                        // a,b = {f,x}; the stair path is continuous: floor, foot of the stairs, up the stairs, top of the stairs, floor
  if (Math.abs(a.f - b.f) < 0.03) return Math.abs(a.x - b.x) / WALK;
  const up = b.f > a.f; const s0 = up ? STAIRX - 12 : STAIRX + 12, s1 = up ? STAIRX + 12 : STAIRX - 12;
  return Math.abs(a.x - s0) / WALK + STAIR_MIN * Math.abs(a.f - b.f) + Math.abs(b.x - s1) / WALK;
}

/* ---------- build + craft tables (see DESIGN.md) ---------- */
const BUILDS = {
  stove: { name: 'Stove', cost: { wood: 3, parts: 2 }, min: 120, at: 'stove', set(B) { B.stove = 1; }, can: (B) => !B.stove },
  bench: { name: 'Workbench', cost: { wood: 3, parts: 1 }, min: 90, at: 'bench', set(B) { B.bench = 1; }, can: (B) => !B.bench },
  barr1: { name: 'Barricade I', cost: { wood: 4, parts: 1 }, min: 90, at: 'door', set(B) { B.barricade = 1; }, can: (B) => (B.barricade || 0) === 0 },
  barr2: { name: 'Barricade II', cost: { wood: 6, parts: 2 }, min: 150, at: 'door', set(B) { B.barricade = 2; }, can: (B) => B.barricade === 1 },
  barr3: { name: 'Barricade III', cost: { wood: 8, parts: 3 }, min: 240, at: 'door', set(B) { B.barricade = 3; }, can: (B) => B.barricade === 2 },
  bunk: { name: 'Extra bunk', cost: { wood: 3, cloth: 3 }, min: 120, at: 'stairs', set(B) { B.bed = (B.bed || 0) + 1; }, can: (B) => (B.bed || 0) < 4 && 4 + (B.bed || 0) < 6 * Math.max(1, floors() - 2) },
  bucket: { name: 'Rain catcher', cost: { parts: 2, cloth: 2 }, min: 90, at: 'roof', set(B) { B.bucket = 1; }, can: (B) => !B.bucket && floors() >= 3 },
  filter: { name: 'Water filter', cost: { parts: 3, cloth: 2 }, min: 120, at: 'filter', set(B) { B.filter = 1; }, can: (B) => !B.filter },
  garden: { name: 'Rooftop garden', cost: { wood: 4, cloth: 2, food: 2 }, min: 180, at: 'garden', set(B) { B.garden = 1; G().gardenAt = G().t + 6 * 1440; }, can: (B) => !B.garden && floors() >= 3 },
  radio: { name: 'Radio', cost: { parts: 4 }, min: 180, at: 'radio', set(B) { B.radio = 1; }, can: (B) => !B.radio },
  alarm: { name: 'Alarm line', cost: { parts: 2 }, min: 60, at: 'door', set(B) { B.alarm = 1; }, can: (B) => !B.alarm },
  curtains: { name: 'Blackout curtains', cost: { cloth: 4 }, min: 90, at: 'stairs', set(B) { B.curtains = 1; }, can: (B) => !B.curtains },
  infirm: { name: 'Sick bed', cost: { wood: 3, cloth: 3 }, min: 120, at: 'infirm', set(B) { B.infirm = 1; }, can: (B) => !B.infirm },
  cupboard: { name: 'Bigger cupboard', cost: { wood: 4, parts: 1 }, min: 120, at: 'cupboard', set(B) { B.cupboard = 1; }, can: (B) => !B.cupboard },
  still: { name: 'Still', cost: { parts: 3, wood: 2 }, min: 150, at: 'still', set(B) { B.still = 1; }, can: (B) => !B.still }
};
const CRAFTS = {
  bandage: { name: 'Bandage', cost: { cloth: 2 }, min: 15, out: { bandage: 1 } },
  club: { name: 'Club', cost: { wood: 2 }, min: 30, out: { club: 1 } },
  knife: { name: 'Knife', cost: { parts: 1, cloth: 1 }, min: 20, out: { knife: 1 } },
  machete: { name: 'Machete', cost: { parts: 2, wood: 1 }, min: 60, out: { machete: 1 } }
};
const NEEDS_BENCH = (B) => !!B.bench;

/* ---------- people ---------- */
function ensure(p) {
  if (p.f === undefined) { const top = floors() - 1; p.f = chance(0.4) ? 0 : chance(0.67) ? Math.min(1, top) : rnd(0, Math.max(0, top - 1)); let x = rnd(16, 224); if (Math.abs(x - STAIRX) < 26) x = x < STAIRX ? STAIRX - 30 : STAIRX + 30; p.x = x; p.up = 0; p.idleUntil = (G().t || 0) + rnd(2, 40); }
  if (p.act === undefined || typeof p.act === 'string') p.act = null;
  if (!p.q) p.q = [];
  if (p.auto === undefined) p.auto = true;
  if (p.shift === undefined) p.shift = null;           // 'early' | 'late' | null
  if (p.fatigue === undefined) p.fatigue = 20;
  if (p.warm === undefined) p.warm = 100;
}
const alive = () => G().S.filter((s) => s.alive && !s.gone);
const home = () => alive().filter((s) => !s.out);
const byId = (id) => G().S.find((s) => s.id === id);
const have = (k) => H.inv(k);
function take(p, k) {                              // own pack first, then the cupboard
  if (p.pack && p.pack[k] > 0) { p.pack[k]--; if (!p.pack[k]) delete p.pack[k]; return true; }
  if (have(k) > 0) { H.add(k, -1); return true; }
  return false;
}
function has(p, k) { return (p.pack && p.pack[k] > 0) || have(k) > 0; }
const say = (p, text, ms) => { if (text) p.bub = { text, until: G().t + (ms || 25) }; };
const logT = (text, cls) => H.log(`${clock(G().t)} ${text}`, cls || '');
const mood = (p, n) => { p.mood = clamp((p.mood || 50) + n, 0, 100); };

/* ---------- jobs and acts ---------- */
// act = { k, label, st, walkLeft, left, total, job, interrupt:boolean, from:{f,x}, to:{f,x}, walkTotal }
function beginAct(p, k, stId, dur, label, job, opts) {
  const S = stations(); const st = typeof stId === 'object' ? stId : (S[stId] || S.table); const sid = st.id || 'floor';
  const up0 = p.up || 0; const same = p.at === sid && Math.abs((p.f || 0) - st.f) < 0.03 && up0 === (st.up || 0) && sid !== 'floor';
  const hereX = up0 ? (p.lx || p.x) : p.x; const here = { f: p.f, x: hereX };
  const now = G().t + acc;                              // one continuous clock for the picture and the simulation
  const down = same ? 0 : (up0 > 0 ? 1 : 0); const climb = same ? 0 : ((st.up || 0) > 0 ? 1 : 0); const wk = same ? 0 : walkMin(here, climb ? { f: st.f, x: st.lx || st.x } : st);
  const tD = now + down, tW = tD + wk, tC = tW + climb;
  p.act = Object.assign({ k, label, st: sid, t0: now, tD, tW, tC, ph: 0, walkLeft: wk, walkTotal: wk, left: dur, total: dur, job: job || null, from: { f: p.f, x: p.x, up: up0 }, hereX, to: { f: st.f, x: st.x, up: st.up || 0, lx: st.lx || st.x }, hasClimb: climb > 0, interrupt: true }, opts || {});
  return p.act;
}
function jobDuration(p, job) {
  const B = G().build;
  if (job.k === 'build') { let m = BUILDS[job.id].min; if (p.trait === 'strong') m *= 0.8; if (p.trait === 'hustler') m *= 0.95; return m; }
  if (job.k === 'craft') return CRAFTS[job.id].min * (p.trait === 'medic' && job.id === 'bandage' ? 0.6 : 1);
  if (job.k === 'cook') return 40;
  return 20;
}
/* why can't this be done right now (null = fine) */
function why(job, p) {
  const B = G().build;
  if (job.k === 'build') {
    const d = BUILDS[job.id]; if (!d) return 'Unknown project.'; if (!d.can(B)) return 'Already built, or not yet possible.';
    const q = G().bq && G().bq.find((x) => x.id === job.id); if (q) { if (q.who && q.who !== (p && p.id)) return 'Someone is already on it.'; return null; }
    for (const [k, v] of Object.entries(d.cost)) if (have(k) < v) return `Not enough ${k === 'parts' ? 'scrap' : k} (need ${v}, have ${have(k)}).`;
    return null;
  }
  if (job.k === 'craft') {
    if (!NEEDS_BENCH(B)) return 'Build the workbench first.'; const d = CRAFTS[job.id];
    for (const [k, v] of Object.entries(d.cost)) if (have(k) < v) return `Not enough ${k === 'parts' ? 'scrap' : k} (need ${v}, have ${have(k)}).`;
    return null;
  }
  if (job.k === 'cook') { if (!B.stove) return 'Build a stove first.'; if (have('wood') < 1) return 'No wood for the fire.'; if (have('food') < 1) return 'No food to cook.'; return null; }
  if (job.k === 'watch') return null;
  if (job.k === 'rest') return null;
  if (job.k === 'walk') return null;
  return null;
}
/* the player gives an order. returns {ok, why} */
function order(pid, job, front) {
  const p = byId(pid); if (!p || !p.alive || p.out) return { ok: false, why: 'Not available.' };
  ensure(p); const w = why(job, p); if (w) return { ok: false, why: w };
  if (p.mood < 20 && chance(0.3)) { say(p, pick(['Not now.', 'I cannot. Ask someone else.', 'Leave me.']), 40); mood(p, -1); return { ok: false, why: `${p.name} is too low to take orders right now.` }; }
  if (front) { p.q.unshift(job); if (p.act && p.act.interrupt) abort(p); } else p.q.push(job);
  if (!p.act) pickNext(p);
  return { ok: true };
}
function abort(p) {
  const a = p.act; if (!a) return;
  if (a.job && a.job.k === 'build') { const q = (G().bq || []).find((x) => x.id === a.job.id); if (q) { q.who = 0; q.prog = Math.max(q.prog, 0); } }
  if (a.k === 'sleep') p.sleeping = false;
  /* cancelled mid-walk or mid-climb: they stay where they actually are, not where the walk began */
  if (a.ph < 3) { const pos = posOf(p, acc); p.f = Math.abs(pos.f - Math.round(pos.f)) < 0.03 ? Math.round(pos.f) : pos.f; p.x = pos.x; p.up = pos.up || 0; if (G().t + acc >= a.tW && a.to.up > 0) p.lx = a.to.lx; p.at = null; }
  p.act = null;
}
/* changing your mind: whatever part of the materials has not been used up comes back, rounded in your favour */
function refundOf(cost, left, total) { const r = total > 0 ? Math.max(0, Math.min(1, left / total)) : 0; const out = {}; Object.entries(cost).forEach(([k, v]) => { const n = Math.ceil(v * r - 1e-9); if (n > 0) out[k] = n; }); return out; }
function giveBack(out) { Object.entries(out).forEach(([k, n]) => H.add(k, n)); return out; }
function cancelTask(pid) {
  const p = byId(pid); if (!p) return null; const a = p.act; let back = null;
  if (a && a.job) {
    if (a.k === 'build') { const q = (G().bq || []).find((x) => x.id === a.job.id); const d = BUILDS[a.job.id]; if (q && d) { back = giveBack(refundOf(d.cost, q.need - q.prog, q.need)); G().bq = G().bq.filter((x) => x !== q); } }
    else if (a.k === 'craft') { const d = CRAFTS[a.job.id]; if (d) back = giveBack(refundOf(d.cost, a.left, a.total)); }
    else if (a.k === 'cook') back = giveBack(refundOf({ food: a.job.n || 0, wood: 1 }, a.left, a.total));
  }
  if (a && /^(build|craft|cook)$/.test(a.k)) { abort(p); p.act = null; }
  p.q = []; return back || {};
}
function cancelBuild(id) {
  const q = (G().bq || []).find((x) => x.id === id); if (!q) return null; const d = BUILDS[id]; const who = q.who && byId(q.who);
  if (who && who.act && who.act.k === 'build' && who.act.job && who.act.job.id === id) return cancelTask(who.id);
  G().bq = G().bq.filter((x) => x !== q); return giveBack(refundOf(d.cost, q.need - q.prog, q.need));
}
/* what is being made right now, for the screens that let you stop it */
function activeTasks() {
  const g = G(); const out = [];
  (g.bq || []).forEach((q) => { const d = BUILDS[q.id]; const w = q.who && byId(q.who); out.push({ kind: 'build', id: q.id, name: d.name, pct: Math.round(100 * q.prog / Math.max(1, q.need)), pid: w ? w.id : 0, who: w ? w.name : '' }); });
  home().forEach((p) => { const a = p.act; if (!a || !a.job) return; if (a.k === 'craft') out.push({ kind: 'craft', id: a.job.id, name: CRAFTS[a.job.id].name, pct: Math.round(100 * (1 - a.left / Math.max(1, a.total))), pid: p.id, who: p.name }); else if (a.k === 'cook') out.push({ kind: 'cook', id: 'cook', name: 'Cooking', pct: Math.round(100 * (1 - a.left / Math.max(1, a.total))), pid: p.id, who: p.name }); });
  return out;
}
function startJob(p, job) {
  const B = G().build, S = stations();
  if (job.k === 'walk') { beginAct(p, 'walk', job.pt ? { id: 'floor', f: job.pt.f, x: job.pt.x } : (job.st || 'table'), 1, 'Walking', job); return true; }
  if (job.k === 'rest') { beginAct(p, 'rest', job.st || 'table', job.min || 30, 'Resting', job); return true; }
  if (job.k === 'use') { beginAct(p, 'use', job.st || 'table', job.min || 3, job.label || 'Using', job, { interrupt: true }); return true; }
  if (job.k === 'pray') { beginAct(p, 'pray', 'mat', 15, 'Praying', job, { interrupt: true }); return true; }
  if (job.k === 'look') { beginAct(p, 'look', job.st || 'win0', 6, 'Looking out of the window', job, { interrupt: true }); return true; }
  if (why(job, p)) return false;
  if (job.k === 'build') {
    const d = BUILDS[job.id]; G().bq = G().bq || []; let q = G().bq.find((x) => x.id === job.id);
    if (!q) { for (const [k, v] of Object.entries(d.cost)) H.add(k, -v); q = { id: job.id, prog: 0, need: jobDuration(p, job), who: p.id }; G().bq.push(q); }
    q.who = p.id; beginAct(p, 'build', d.at, Math.max(1, q.need - q.prog), 'Building: ' + d.name, job); return true;
  }
  if (job.k === 'craft') { const d = CRAFTS[job.id]; for (const [k, v] of Object.entries(d.cost)) H.add(k, -v); beginAct(p, 'craft', 'bench', jobDuration(p, job), 'Making: ' + d.name, job, { interrupt: false }); return true; }
  if (job.k === 'cook') {
    const n = Math.min(job.n || 4, have('food')); H.add('food', -n); H.add('wood', -1);
    beginAct(p, 'cook', 'stove', jobDuration(p, job), 'Cooking', Object.assign({ n }, job), { interrupt: false }); return true;
  }
  if (job.k === 'watch') { beginAct(p, 'watch', 'post', job.min || 300, 'On watch', job, { interrupt: true }); return true; }
  return false;
}

/* ---------- decision rule ---------- */
const wantsWatch = (p, t) => { const h = hourOf(t) + minOf(t) / 60; if (p.shift === 'early') return h >= 20 || h < 1; if (p.shift === 'late') return h >= 1 && h < 5.5; if (p.shift === 'all') return h >= 20 || h < 5.5; return false; };
function mealsLow() { const n = home().length; return have('meal') < Math.max(2, n * 0.8); }
function someoneCooking() { return G().S.some((s) => s.act && s.act.k === 'cook'); }
function pickNext(p) {
  ensure(p); const t = G().t; const B = G().build; if (p.act || !p.alive) return;
  /* the person the player controls only acts on orders; they still look after themselves when it is urgent */
  const me = !!(H.controlled && H.controlled() === p.id);
  const self = (label) => { if (me && H.onSelfCare) H.onSelfCare(p, label); };
  /* 1. emergencies */
  if (p.wound && has(p, 'bandage')) { take(p, 'bandage'); self('dress a wound'); beginAct(p, 'treat', 'table', p.trait === 'medic' ? 4 : 8, 'Dressing a wound', { k: 'treat' }, { interrupt: false }); return; }
  if (p.sick && p.hp < 70 && has(p, 'meds')) { take(p, 'meds'); self('take medicine'); beginAct(p, 'meds', 'table', 5, 'Taking medicine', { k: 'meds' }, { interrupt: false }); return; }
  if (p.hp < 20) { self('lie down'); beginAct(p, 'sleep', B.infirm ? 'infirm' : bunkFor(p), 90, 'Lying down, weak', { k: 'rest' }); p.sleeping = true; return; }
  /* 2. eat */
  if (p.hunger >= (me ? 75 : 55)) {
    if (has(p, 'meal')) { take(p, 'meal'); self('eat'); beginAct(p, 'eat', 'table', 10, 'Eating', { k: 'eat', raw: false }, { interrupt: false }); return; }
    if (p.hunger >= 78 && has(p, 'food')) { take(p, 'food'); self('eat raw food'); beginAct(p, 'eat', 'table', 6, 'Eating raw food', { k: 'eat', raw: true }, { interrupt: false }); return; }
  }
  /* 3. drink */
  if (p.thirst >= (me ? 70 : 50) && has(p, 'water')) { take(p, 'water'); self('drink'); beginAct(p, 'drink', 'water', 3, 'Drinking', { k: 'drink' }, { interrupt: false }); return; }
  /* 4. sleep */
  const night = isNight(t);
  if (p.fatigue >= (me ? 92 : 85) || (!me && night && p.fatigue >= 35 && !wantsWatch(p, t))) { self('sleep'); beginAct(p, 'sleep', bedFor(p), 600, p.bed === 'floor' ? 'Sleeping on the floor' : 'Sleeping', { k: 'sleep' }); p.sleeping = true; return; }
  /* 5. watch */
  if (wantsWatch(p, t) && p.fatigue < 96) { const end = shiftEnd(p, t); startJob(p, { k: 'watch', min: Math.max(10, end - t) }); return; }
  /* 6. orders */
  while (p.q.length) { const job = p.q.shift(); if (startJob(p, job)) return; }
  if (me) return;                                    // the controlled person waits for you
  /* 7. auto-work */
  if (p.auto && !night) { const j = autoWork(p); if (j && startJob(p, j)) return; }
  /* 8. life */
  lifeAct(p);
}
function shiftEnd(p, t) { const day0 = Math.floor(t / 1440) * 1440; const h = hourOf(t); if (p.shift === 'all') return h >= 20 ? day0 + 1440 + 330 : day0 + 330; if (p.shift === 'early') return h >= 20 ? day0 + 1440 + 60 : day0 + 60; return day0 + 330; }
/* the night roles decide where a person sleeps: a bunk (good rest) or the floor (poor rest, a stiff back) */
function bedFor(p) { if (p.bed === 'floor') { const i = home().indexOf(p); return { id: 'sleepfloor', f: Math.min(1, floors() - 1), x: 112 + (i % 5) * 16 }; } return bunkFor(p); }
function bunkFor(p) { const S = stations(); const ids = Object.keys(S).filter((k) => k.indexOf('bunk') === 0); const taken = new Set(G().S.filter((s) => s !== p && s.act && s.act.k === 'sleep').map((s) => s.act.st)); const mine = p.bunk && S[p.bunk] ? p.bunk : null; if (mine && !taken.has(mine)) return mine; const free = ids.filter((i) => !S[i].up).find((i) => !taken.has(i)) || ids.find((i) => !taken.has(i)) || ids[0]; p.bunk = free; return free; }
function autoWork(p) {
  const B = G().build;
  if (B.stove && have('food') >= 2 && have('wood') >= 1 && mealsLow() && !someoneCooking() && why({ k: 'cook' }, p) === null) return { k: 'cook' };
  const q = (G().bq || []).find((x) => !x.who); if (q) return { k: 'build', id: q.id };
  if (B.bench && p.trait === 'medic' && have('bandage') < 2 && have('cloth') >= 2 && why({ k: 'craft', id: 'bandage' }, p) === null) return { k: 'craft', id: 'bandage' };
  /* garden / stills tend themselves; nothing else is urgent */
  return null;
}
const LIFE = [
  { k: 'pray', label: 'Praying', st: 'mat', min: 15, w: (p) => (p.trait === 'devout' ? 4 : 1) * (p.mood < 50 ? 1.6 : 1), fx(p) { mood(p, 3); }, lines: ['Lord, keep us.', 'Please. Just one more day.', 'Bismillah.', 'Nobody is coming. But You are.'] },
  { k: 'sit', label: 'Sitting alone', st: 'spot', min: 25, w: (p) => 2, fx(p) { p.fatigue = Math.max(0, p.fatigue - 4); }, lines: ['', '', 'I keep counting the exits.'] },
  { k: 'write', label: 'Writing in a notebook', st: 'spot', min: 30, w: (p) => (p.sp && /nerd|law|hijab/.test(p.arch || '') ? 3 : 1), fx(p) { mood(p, 2); }, lines: ['', 'If anyone finds this...'] },
  { k: 'tinker', label: 'Fixing things', st: 'bench', min: 30, w: (p) => (p.trait === 'strong' || p.trait === 'hustler' ? 2.5 : 0.6), fx(p) { mood(p, 1); }, lines: ['', 'This will hold.'] },
  { k: 'exercise', label: 'Pushing through press-ups', st: 'spot', min: 15, w: (p) => (p.trait === 'strong' ? 3 : 0.4), fx(p) { mood(p, 2); p.fatigue += 3; }, lines: ['If I stop moving I stop.'] },
  { k: 'cry', label: 'Crying alone in a corner', st: 'corner', min: 22, w: (p) => (p.mood < 28 ? 6 : p.mood < 45 ? 1.4 : 0.15), fx(p) { mood(p, 5); G().att = clamp((G().att || 0) + 1, 0, 100); }, lines: ['…', 'Nobody can hear me.', ''] },
  { k: 'stare', label: 'Staring out into the dark', st: 'spot', min: 20, w: (p) => (p.mood < 45 ? 2 : 0.3), fx(p) {}, lines: ['', 'Did you hear that?'] }
];
const B0 = () => G().build;
function lifeAct(p) {
  /* sometimes: find someone to talk to */
  const isMe = (o) => !!(H.controlled && H.controlled() === o.id);
  const others = home().filter((o) => o !== p && !isMe(o) && o.alive && (!o.act || (o.act.k === 'life' || o.act.k === 'sit' || o.act.k === 'stare')) && !o.sleeping && o.q.length === 0);
  if (others.length && chance(0.38)) {
    const q = pick(others); const dur = rnd(12, 25); const mx = clamp(p.x, 18, 222);
    beginAct(p, 'chat', { id: 'meet', f: p.f, x: mx }, dur, 'Talking with ' + q.name, { k: 'chat', with: q.id }); abort(q); beginAct(q, 'chat', { id: 'meetp', f: p.f, x: clamp(mx + (chance(0.5) ? -16 : 16), 10, 230) }, dur + 4, 'Talking with ' + p.name, { k: 'chat', with: p.id }); return;
  }
  const opts = LIFE.map((l) => [l, l.w(p)]).filter((x) => x[1] > 0); let r = R() * opts.reduce((s, x) => s + x[1], 0); let L = opts[0][0];
  for (const [l, w] of opts) { if ((r -= w) < 0) { L = l; break; } }
  const spot = () => { let f = p.f; if (chance(0.3)) f = rnd(0, Math.max(0, floors() - 2)); let x = 16 + R() * 208; if (Math.abs(x - STAIRX) < 26) x = x < STAIRX ? STAIRX - 30 : STAIRX + 30; return { id: 'spot', f, x }; };
  const stSpec = L.st === 'corner' ? { id: 'corner', f: p.f, x: p.x < STAIRX ? 9 : FLOORW - 9 } : (L.st === 'spot' || (L.st === 'bench' && !B0().bench)) ? spot() : L.st;
  const a = beginAct(p, 'life', stSpec, L.min + rnd(0, 10), L.label, { k: 'life', life: L.k });
  a.fx = L.fx; a.line = pick(L.lines);
}

/* ---------- per-tick effects ---------- */
function finish(p) {
  const a = p.act; if (!a) return; const job = a.job || {}; const B = G().build;
  switch (a.k) {
    case 'eat': {
      if (job.raw) { p.hunger = Math.max(0, p.hunger - EFFECT.raw); if (chance(G().build.filter ? 0.15 : 0.22)) { p.sick = true; logT(`${p.name} ate raw food and will regret it.`, 'bad'); } else mood(p, -1); }
      else { p.hunger = Math.max(0, p.hunger - EFFECT.meal); mood(p, 4); const tbl = home().filter((o) => o !== p && o.act && o.act.k === 'eat' && o.act.st === 'table'); if (tbl[0] && H.bond) H.bond(p, tbl[0], 1, 0); }
      p.stats = p.stats || {}; p.stats.meals = (p.stats.meals || 0) + 1; break;
    }
    case 'drink': p.thirst = Math.max(0, p.thirst - EFFECT.water); break;
    case 'treat': p.wound = false; p.hp = Math.min(100, p.hp + 6); logT(`${p.name}'s wound is dressed.`, ''); break;
    case 'meds': if (chance(0.75)) { p.sick = false; logT(`${p.name} looks better. The medicine worked.`, 'good'); } else logT(`${p.name} took the medicine. Nothing yet.`, ''); break;
    case 'cook': {
      const n = job.n || 0; const out = n + (p.trait === 'cook' ? 1 : 0); H.add('meal', out); mood(p, p.trait === 'cook' ? 4 : 1);
      home().forEach((o) => mood(o, 1)); const al = home(); if (H.bond) for (let i = 0; i < al.length; i++) for (let j = i + 1; j < al.length; j++) if (chance(0.3)) H.bond(al[i], al[j], 1, -1);
      logT(`${p.name} cooked a pot: ${out} meals. The smell brings everyone closer.`, 'good'); say(p, pick(['Come and eat.', 'It is ready.', 'Gently. There is enough for now.']), 40); break;
    }
    case 'craft': { const d = CRAFTS[job.id]; Object.entries(d.out).forEach(([k, v]) => H.add(k, v)); logT(`${p.name} made a ${d.name.toLowerCase()}.`, 'good'); break; }
    case 'build': {
      const d = BUILDS[job.id]; const q = G().bq.find((x) => x.id === job.id);
      if (q) { G().bq = G().bq.filter((x) => x !== q); d.set(B); mood(p, 3); logT(`${p.name} finished the ${d.name.toLowerCase()}.`, 'good'); if (H.onBuilt) H.onBuilt(job.id, p); }
      break;
    }
    case 'life': if (a.fx) a.fx(p); break;
    case 'chat': { const o = byId(job.with); if (o && o.alive && H.bond) { H.bond(p, o, job.comfort ? 3 : 1, 0); } mood(p, job.comfort ? 3 : 2); if (job.comfort && o) { mood(o, 5); logT(`${p.name} sat with ${o.name} until the crying stopped.`, 'good'); } if (H.chatLine) say(p, H.chatLine(p, o), 40); break; }
    case 'watch': logT(`${p.name} comes off watch.`, ''); break;
    case 'use': if (H.onUse) H.onUse(p, job.what); break;
    case 'pray': mood(p, p.trait === 'devout' ? 8 : 3); break;
    case 'look': if (H.onLook) H.onLook(p, S0floor(a.st)); break;
  }
  p.act = null;
}
function S0floor(id) { const st = stations()[id]; return st ? st.f : 0; }
/* anyone just loitering in front of something the controlled character is trying to reach steps aside */
const LOITER = /^(life|chat|walk)$/;
function yieldTick() {
  const cid = H.controlled && H.controlled(); const c = cid ? byId(cid) : null; if (!c || !c.alive || c.out) return;
  const S = stations(); const near = Object.values(S).filter((s) => s.id !== 'stairs' && s.id !== 'tally' && Math.abs(s.f - c.f) < 0.5 && Math.abs(s.x - c.x) <= 38);
  if (!near.length) return;
  home().forEach((o) => {
    if (o === c || o.sleeping || o.up > 0 || Math.abs(o.f - c.f) > 0.5 || (o.q && o.q.length) || (o.yieldCd && G().t < o.yieldCd)) return;
    if (o.act && !(LOITER.test(o.act.k) && (o.act.k !== 'life' || !/pray/.test((o.act.job || {}).life || '') || o.act.st !== 'mat'))) return;
    if (o.act && o.act.ph !== undefined && o.act.ph < 3 && o.act.k === 'walk') return;
    const st = near.find((s) => Math.abs(s.x - o.x) < 14); if (!st) return;
    let x = st.x + (o.x >= st.x ? 1 : -1) * (30 + R() * 14); if (x < 14 || x > 226) x = st.x + (x < 14 ? 1 : -1) * 44 * (R() < 0.5 ? 1 : 1); x = clamp(x, 14, 226); if (Math.abs(x - STAIRX) < 24) x = x < STAIRX ? STAIRX - 28 : STAIRX + 28;
    o.yieldCd = G().t + 25; abort(o); beginAct(o, 'walk', { id: 'floor', f: o.f, x }, 1, 'Making room', { k: 'walk' });
    if (chance(0.5)) say(o, pick(['Sorry.', 'Go ahead.', 'After you.', 'Excuse me.']), 40);
  });
}
function tickPerson(p) {
  ensure(p); const t = G().t; const a = p.act;
  const sleeping = !!(a && a.k === 'sleep' && a.walkLeft <= 0);
  const m60 = minOf(t) === 0;
  /* needs */
  p.hunger = clamp(p.hunger + RATE.hunger * (sleeping ? 0.6 : 1), 0, 100);
  p.thirst = clamp(p.thirst + RATE.thirst * (sleeping ? 0.6 : 1), 0, 100);
  p.fatigue = clamp(p.fatigue + (sleeping ? -RATE.sleep * (p.act && p.act.st === 'sleepfloor' ? 0.6 : (G().build.curtains || p.bunk ? 1 : 0.9)) : RATE.fatigue * (p.sick ? 1.4 : 1)), 0, 100);
  /* mood drift */
  if (p.hunger > 60) mood(p, p.trait === 'fragile' ? -0.02 : -0.012); if (p.thirst > 60) mood(p, -0.015); if (p.fatigue > 80) mood(p, -0.01);
  if (p.sick) mood(p, -0.006); if (sleeping) mood(p, 0.004);
  /* damage */
  if (p.hunger >= 100) p.hp -= 0.03; if (p.thirst >= 100) p.hp -= 0.06; if (p.wound) { p.hp -= 0.012; if (m60 && chance(0.15)) { p.wound = false; } }
  else if (!p.sick && p.hunger < 85 && p.thirst < 85 && p.hp < 100) p.hp = Math.min(100, p.hp + (sleeping ? 0.018 : 0.006)); if (p.sick) p.hp -= G().build.infirm && a && a.st === 'infirm' ? 0.002 : 0.005;
  if (p.hp <= 0) { p.hp = 0; const cause = p.thirst >= 100 ? 'thirst' : p.hunger >= 100 ? 'starvation' : p.wound ? 'wounds' : 'sickness'; if (H.kill) H.kill(p, cause); else p.alive = false; p.act = null; return; }
  if (p.fatigue >= 100 && !sleeping && chance(0.02)) { /* collapses */ if (p.act) abort(p); beginAct(p, 'sleep', bunkFor(p), 240, 'Collapsed from exhaustion', { k: 'sleep' }); p.sleeping = true; logT(`${p.name} collapsed from exhaustion.`, 'bad'); return; }
  /* bark bubble expiry */
  if (p.bub && p.bub.until < t) p.bub = null;
  if (!a) { if (p.idleUntil && t < p.idleUntil) return; pickNext(p); return; }
  /* walking */
  if (a.ph < 3) {
    a.walkLeft = Math.max(0, a.tW - t);
    while (a.ph < 3) {
      const end = a.ph === 0 ? a.tD : a.ph === 1 ? a.tW : a.tC; if (t < end) return;
      if (a.ph === 0) { p.up = 0; p.x = a.hereX; }
      else if (a.ph === 1) { p.f = a.to.f; p.x = a.hasClimb ? a.to.lx : a.to.x; if (!a.hasClimb && a.line) say(p, a.line, 30); }
      else { p.up = a.to.up; p.x = a.to.x; p.lx = a.to.lx; }
      a.ph++;
    }
    a.walkLeft = 0;
  }
  p.f = a.to.f; p.x = a.to.x; p.up = a.to.up; if (a.to.lx) p.lx = a.to.lx; p.at = a.st;
  /* work in place */
  a.left -= 1;
  if (a.k === 'build') { const q = (G().bq || []).find((x) => x.id === a.job.id); if (q) { q.prog += 1; if (G().night && chance(0.01)) G().att = clamp((G().att || 0) + 1, 0, 100); } }
  if (a.k === 'watch') { if (p.fatigue > 88 && chance(0.004)) { logT(`${p.name} dozed off on watch.`, 'bad'); abort(p); beginAct(p, 'sleep', 'post', 40, 'Dozing at the post', { k: 'sleep' }); p.sleeping = true; return; } }
  if (a.k === 'sleep') {
    const need = p.hunger >= 92 || p.thirst >= 92; const h = hourOf(t) + minOf(t) / 60; const morning = h >= 6 && h < 12;
    if (p.fatigue <= 12 || (morning && p.fatigue <= 40) || need) { p.sleeping = false; p.act = null; if (need) logT(`${p.name} wakes, desperate for ${p.thirst >= 92 ? 'water' : 'food'}.`, 'bad'); return; }
    a.left = 600;
  }
  if (a.k === 'cook' && isNight(t)) G().att = clamp((G().att || 0) + 0.12, 0, 100);
  if (a.k === 'life' && a.job && a.job.life === 'cry' && a.walkLeft <= 0 && a.left > 6 && chance(0.012)) {
    const q = home().find((o) => o !== p && !(H.controlled && H.controlled() === o.id) && o.alive && !o.sleeping && o.mood > 40 && (!o.act || /life|chat/.test(o.act.k)) && o.q.length === 0 && o.f === p.f);
    if (q) { abort(q); beginAct(q, 'chat', { id: 'cornerc', f: p.f, x: a.to.x + (a.to.x < STAIRX ? 14 : -14) }, 9, 'Sitting with ' + p.name, { k: 'chat', with: p.id, comfort: true }); say(q, pick(['I am here.', 'You do not have to talk.', 'Move up. Let me sit.']), 40); a.left = Math.min(a.left, 10); }
  }
  if (a.left <= 0) {
    if (a.k === 'sleep') { p.sleeping = false; p.act = null; return; }
    finish(p);
  }
}

/* ---------- world: dawn, weather, attention, raids ---------- */
const WX = { harmattan: ['clear', 'dust', 'clear', 'cold', 'clear'], rains: ['storm', 'drizzle', 'clear', 'storm', 'mud'] };
function dawn() {
  const g = G(); const day = dayOf(g.t); g.day = day;
  g.wx = pick(WX[g.season || 'harmattan']);
  const B = g.build;
  if (B.bucket) { const w = g.season === 'rains' ? (g.wx === 'storm' ? rnd(3, 5) : g.wx === 'drizzle' ? 2 : 0) : (chance(0.4) ? 1 : 0); if (w) { H.add('water', w); logT(`The rain catcher gathered ${w} water.`, 'good'); } }
  if (B.still && have('wood') >= 1) { H.add('wood', -1); H.add('water', 2); }
  if (B.garden && g.gardenAt && g.t >= g.gardenAt) { const f = g.season === 'rains' ? rnd(3, 5) : rnd(1, 3); H.add('food', f); g.gardenAt = g.t + 6 * 1440; logT(`The rooftop garden gave ${f} food.`, 'good'); }
  /* illness */
  home().forEach((p) => {
    if (p.sick) { const c = B.infirm ? 0.4 : 0.26; if (chance(c)) { p.sick = false; logT(`${p.name} is over the sickness.`, 'good'); } }
    else { const base = g.season === 'rains' ? 0.05 : 0.04; const sheltered = (B.curtains ? 0.01 : 0) + (B.bed ? 0.01 : 0); if (chance(Math.max(0.01, base - sheltered + (g.wx === 'cold' ? 0.03 : 0) + (B.filter ? -0.01 : 0)))) { p.sick = true; logT(`${p.name} woke up shivering and hot.`, 'bad'); } }
  });
  /* the sick infect neighbours */
  const sick = home().filter((p) => p.sick); if (sick.length && !B.infirm) home().forEach((p) => { if (!p.sick && chance(0.06 * sick.length)) { p.sick = true; logT(`${p.name} has caught it too.`, 'bad'); } });
  g.watchSet = false; g.att = Math.max(0, (g.att || 0) * 0.5);
  if (H.onDawn) H.onDawn(day);
}
function autoWatch() {
  const g = G(); const al = home().filter((p) => p.alive && p.hp > 25); if (!al.length) return;
  if (al.some((p) => p.shift)) { g.watchSet = true; return; }
  const sorted = al.slice().sort((a, b) => a.fatigue - b.fatigue + (b.trait === 'sleeper' ? 8 : 0) - (a.trait === 'sleeper' ? 8 : 0));
  const need = al.length >= 4 ? 2 : 1;
  sorted.slice(0, need).forEach((p, i) => { p.shift = i === 0 ? 'early' : 'late'; });
  if (need === 1) sorted[0].shift = 'early';
  g.watchSet = true;
}
function lookout() { return home().find((p) => p.act && p.act.k === 'watch' && p.act.walkLeft <= 0) || null; }
function raidTick() {
  const g = G(); const t = g.t; const night = isNight(t);
  if (g.pend) { if (t >= g.pend.at) resolveRaid(g.pend.choice || 'hold'); return; }
  if (minOf(t) !== 0) return;                                  // roll once an hour
  const day = dayOf(t); if (day < 3) return;
  const att = g.att || 0; let p = night ? 0.004 + att * 0.0008 : 0.0004 + att * 0.0001;
  p *= 1 + Math.min(day, 30) / 15;
  if (!chance(p)) return;
  const size = clamp(1 + Math.floor(day / 8) + rnd(0, 2), 1, 7);
  const warn = lookout() ? 30 : 0;
  g.pend = { at: t + warn, size, warned: warn > 0, choice: null, night, born: t };
  if (H.onRaidWarn) H.onRaidWarn(g.pend); else if (warn) logT('The lookout whispers: people at the gate.', 'bad');
}
const LOSS = { food: 0.3, meal: 0.3, water: 0.3, wood: 0.15, parts: 0.15, cloth: 0.15, meds: 0.3, bandage: 0.3 };
function resolveRaid(choice) {
  const g = G(); const r = g.pend; if (!r) return null; g.pend = null; const B = g.build;
  const awake = home().filter((p) => !p.sleeping && p.hp > 25);
  const weapon = H.bestWeapon ? H.bestWeapon() : 0;
  const def = (B.barricade || 0) * 2 + (B.alarm ? 1 : 0) + awake.length * 0.7 + weapon + (r.warned ? 1.5 : 0) + (choice === 'fight' ? 2 + (r.fw || 0) * 1.5 : 0) - (awake.length === 0 ? 2 : 0);
  const atk = r.size * 1.2 + R() * 2;
  const out = { choice, size: r.size, def, atk, result: '', hurt: [], lost: {} };
  if (choice === 'dark' && r.night && chance(0.35 + (B.curtains ? 0.2 : 0) + (r.warned ? 0.15 : 0))) { out.result = 'passed'; g.att = (g.att || 0) * 0.5; if (H.onRaidDone) H.onRaidDone(out); else logT('You sat in the dark and held your breath. They went past.', 'good'); return out; }
  if (choice === 'pay') {
    ['food', 'meal', 'water'].forEach((k) => { const n = Math.min(have(k), Math.ceil(have(k) * 0.2)); if (n) { H.add(k, -n); out.lost[k] = n; } });
    out.result = 'paid'; g.att = (g.att || 0) * 0.4; if (H.onRaidDone) H.onRaidDone(out); else logT('You paid them to leave. It will not hold for long.', ''); return out;
  }
  if (def >= atk) { out.result = 'repelled'; if (B.barricade && chance(0.3)) { B.barricade -= 1; out.result = 'repelled-damaged'; } g.att = (g.att || 0) + 6 + (r.loud || 0); if (choice === 'fight') awake.forEach((p) => { if (chance(0.3)) hurt(p, rnd(5, 15), 'fighting', out); }); }
  else {
    out.result = 'breached';
    Object.keys(LOSS).forEach((k) => { const n = Math.floor(have(k) * LOSS[k] * (0.5 + R())); if (n > 0) { H.add(k, -n); out.lost[k] = n; } });
    const victims = (awake.length ? awake : home()).slice().sort(() => R() - 0.5).slice(0, 1 + (r.size > 3 ? 1 : 0)); victims.forEach((p) => hurt(p, rnd(15, 45), 'a raid', out));
    home().forEach((p) => mood(p, -6)); g.att = (g.att || 0) + 10;
  }
  if (H.onRaidDone) H.onRaidDone(out); return out;
}
function hurt(p, n, cause, out) {
  if (p.hp > 35 && p.hp - n <= 0) n = p.hp - (4 + Math.floor(R() * 6));          /* a healthy person is left barely alive, not killed outright */
  p.hp -= n; if (n >= 15 || chance(0.4)) p.wound = true; if (out) out.hurt.push(p.name);
  if (p.hp <= 0) { p.hp = 0; if (H.kill) H.kill(p, cause); else p.alive = false; }
}
function attentionTick() {
  const g = G(); const t = g.t; const B = g.build; const night = isNight(t);
  const lit = night && (g.light === true || someoneCooking());
  let a = g.att || 0;
  if (night) { a -= 0.03 + (B.curtains ? 0.03 : 0); if (lit) a += 0.06; } else a -= 0.015;
  g.att = clamp(a, 0, 100);
}

/* ---------- main tick ---------- */
function tick() {
  const g = G(); const t0 = g.t; g.t = t0 + 1; const t = g.t;
  g.night = isNight(t);
  const h = hourOf(t), m = minOf(t);
  if (h === 6 && m === 0) dawn();
  if (h === 19 && m === 30 && !g.watchSet) { if (H.onNight) { autoWatch(); g.watchSet = true; H.onNight(); } else autoWatch(); }
  if (h === 5 && m === 30) { home().forEach((p) => { p.shift = null; p.bed = null; }); g.watchSet = false; }
  home().forEach(tickPerson);
  if (m % 2 === 0) yieldTick();
  attentionTick(); raidTick();
  if (m === 0 && H.onHour) H.onHour(h, dayOf(t));
  g.day = dayOf(t);
}
let acc = 0;
/* real-time driver: call every animation frame with the seconds elapsed. Speed 0 = paused. */
function drive(dt, over) {
  const g = G(); const sp = over !== undefined ? over : (SPEEDS[g.speed === undefined ? 1 : g.speed] || 0); if (!sp) return;
  acc += Math.min(0.25, dt) * sp; let n = 0;
  while (acc >= 1 && n < 60) { if (H.halt && H.halt()) { acc = 0; return; } tick(); acc -= 1; n++; }
  if (acc > 4) acc = 0;
}
const frac = () => acc;
function advance(mins) { let n = Math.floor(mins); while (n-- > 0) { if (H.halt && H.halt()) return; tick(); } }

/* ---------- setup ---------- */
function start(newG) {
  const g = newG || G(); g.t = g.t || 8 * 60; g.day = dayOf(g.t); g.att = g.att || 0; g.bq = g.bq || []; g.season = g.season || (R() < 0.5 ? 'harmattan' : 'rains'); g.wx = g.wx || 'clear'; g.speed = g.speed || 1;
  ['bench', 'filter', 'garden', 'alarm', 'curtains', 'infirm'].forEach((k) => { if (g.build[k] === undefined) g.build[k] = 0; });
  g.S.forEach(ensure);
}
/* position for the view, interpolated through a walk; frac = 0..1 of the current game-minute */
function posOf(p, frac) {
  const a = p.act; const cl = (v) => Math.max(0, Math.min(1, v));
  if (!a) return { f: p.f, x: p.x, up: p.up || 0, moving: false, dir: 1 };
  const now = G().t + (frac || 0);
  if (now >= a.tC) return { f: a.to.f, x: a.to.x, up: a.to.up || 0, moving: false, dir: 1 };
  if (now < a.tD) { const k = cl((now - a.t0) / Math.max(0.001, a.tD - a.t0)); return { f: a.from.f, x: a.from.x + (a.hereX - a.from.x) * cl(k * 2), up: a.from.up * (1 - k), moving: false, climbing: true, dir: 1 }; }
  if (now >= a.tW) { const k = cl((now - a.tW) / Math.max(0.001, a.tC - a.tW)); return { f: a.to.f, x: a.to.lx + (a.to.x - a.to.lx) * cl((k - 0.55) / 0.45), up: a.to.up * k, moving: false, climbing: true, dir: k > 0.55 ? -1 : 1 }; }
  const done = cl((now - a.tD) / Math.max(0.001, a.tW - a.tD)); const from = { f: a.from.f, x: a.hereX }, to = a.to; const tx = a.hasClimb ? to.lx : to.x;
  if (Math.abs(from.f - to.f) < 0.03) return { f: to.f, x: from.x + (tx - from.x) * done, up: 0, moving: true, dir: tx >= from.x ? 1 : -1 };
  const upw = to.f > from.f; const s0 = upw ? STAIRX - 12 : STAIRX + 12, s1 = upw ? STAIRX + 12 : STAIRX - 12;
  const d1 = Math.abs(from.x - s0) / WALK, d2 = STAIR_MIN * Math.abs(from.f - to.f), d3 = Math.abs(tx - s1) / WALK; const tot = d1 + d2 + d3; let m = done * tot;
  if (m < d1) return { f: from.f, x: from.x + (s0 - from.x) * (m / Math.max(0.001, d1)), up: 0, moving: true, dir: s0 >= from.x ? 1 : -1 };
  m -= d1; if (m < d2) { const k = m / Math.max(0.001, d2); const e = Math.min(k, 1 - k) / 0.2; const dp = Math.max(0, Math.min(1, e)); return { f: from.f + (to.f - from.f) * k, x: s0 + (s1 - s0) * k, up: 0, moving: true, dir: upw ? 1 : -1, stairs: true, depth: dp * dp * (3 - 2 * dp) }; }
  m -= d2; return { f: to.f, x: s1 + (tx - s1) * Math.min(1, m / Math.max(0.001, d3)), up: 0, moving: true, dir: tx >= s1 ? 1 : -1 };
}
/* what can be done at a station (for the order sheet) */
function jobsAt(stId, p) {
  const B = G().build, out = []; const mk = (label, job) => { const w = why(job, p); out.push({ label, job, why: w }); };
  Object.entries(BUILDS).forEach(([id, d]) => { if (d.at === stId && d.can(B)) mk(`Build ${d.name} (${Object.entries(d.cost).map(([k, v]) => v + ' ' + (k === 'parts' ? 'scrap' : k)).join(', ')}; ${Math.round(d.min / 6) / 10} h)`, { k: 'build', id }); });
  if (stId === 'stove') mk('Cook a pot', { k: 'cook' });
  if (stId === 'bench') Object.entries(CRAFTS).forEach(([id, d]) => mk(`Make ${d.name} (${Object.entries(d.cost).map(([k, v]) => v + ' ' + (k === 'parts' ? 'scrap' : k)).join(', ')})`, { k: 'craft', id }));
  if (stId === 'post') mk('Stand watch for 3 hours', { k: 'watch', min: 180 });
  if (stId === 'radio' && B.radio) mk('Listen to the radio', { k: 'use', st: 'radio', what: 'radio', min: 4, label: 'Listening to the radio' });
  if (stId === 'mat') mk('Pray', { k: 'pray' });
  if (/^win\d/.test(stId) || stId === 'post') mk('Look out', { k: 'look', st: stId });
  if (stId.indexOf('bunk') === 0 || stId === 'infirm') mk((G().build && stations()[stId] && stations()[stId].up) ? 'Climb up and rest' : 'Rest here', { k: 'rest', st: stId, min: 90 });
  mk('Go here', { k: 'walk', st: stId });
  return out;
}
function init(host) { H = host; }
C.Sim = { bunkCount, bedFor, init, start, tick, advance, drive, frac, cancelTask, cancelBuild, activeTasks, order, abort, why, jobsAt, stations, posOf, lookout, resolveRaid, autoWatch, dawn, floors, clock, dayOf, hourOf, minOf, phaseOf, isNight, ensure, pickNext, hurt, SPEEDS, BUILDS, CRAFTS, RATE, EFFECT, walkMin, say, get host() { return H; } };
if (typeof module !== 'undefined') module.exports = C.Sim;
})(typeof window !== 'undefined' ? window : globalThis);
