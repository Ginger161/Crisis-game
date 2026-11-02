'use strict';
/* CRISIS — prototype 0.1
   Phase 1: a reskin of the This War of Mine loop set at a besieged university.
   Everything random is rolled per run: cast, traits, loot, events, raids, rescue day. */
(() => {
const $ = (s) => document.querySelector(s);
const R = () => Math.random();
const rnd = (a, b) => a + Math.floor(R() * (b - a + 1));
const pick = (a) => a[Math.floor(R() * a.length)];
const chance = (p) => R() < p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function wpick(obj) { const e = Object.entries(obj); let r = R() * e.reduce((s, x) => s + x[1], 0); for (const [k, w] of e) { if ((r -= w) < 0) return k; } return e[0][0]; }

/* ---------- data ---------- */
const ITEMS = {
  food: ['🍚', 'Food'], meal: ['🍲', 'Cooked meal'], water: ['💧', 'Water'], wood: ['🪵', 'Wood'],
  parts: ['⚙️', 'Scrap'], cloth: ['🧵', 'Cloth'], meds: ['💊', 'Medicine'], bandage: ['🩹', 'Bandage'],
  ogogoro: ['🍶', 'Ogogoro'], club: ['🏏', 'Club'], machete: ['🔪', 'Machete'], pistol: ['🔫', 'Pistol']
};
const WEAPON = { pistol: 3, machete: 2, club: 1 };
const NAMES = ['Chidera', 'Tunde', 'Amina', 'Emeka', 'Ngozi', 'Bashir', 'Ifeoma', 'Segun', 'Hauwa', 'Obinna', 'Zainab', 'Kelechi', 'Femi', 'Blessing', 'Musa', 'Adaeze', 'Ibrahim', 'Chiamaka', 'Yemi', 'Danjuma', 'Uche', 'Halima', 'Seyi', 'Nnamdi', 'Aisha', 'Tobi', 'Ekene', 'Rahila', 'Dami', 'Ada'];
const DEPTS = ['Law, 300L', 'Nursing, 200L', 'Computer Science, 400L', 'Accounting, 100L', 'Mass Comm, 300L', 'Microbiology, 400L', 'Economics, 200L', 'Political Science, 300L', 'Architecture, 500L', 'Business Admin, 100L', 'Hostel porter', 'Lab technician', 'Lecturer, Chemistry'];
const STORIES = [
  'Was in the middle of a test when the gate went quiet.',
  'Phone died on Day 1. Has not heard from home since.',
  'Left a sibling in another hostel. Never found them.',
  'Owed a debt before all this. Keeps saying it no longer matters.',
  'Was due to travel home that very weekend.',
  'Holds a rosary and does not talk about it.',
  'Sold recharge cards on campus. Knows who owes who.',
  'Slept through the first night. Woke to a different world.',
  'Carries a scholarship letter in a plastic sleeve, folded soft.',
  'Used to lead the fellowship. Has stopped leading.'
];
const TRAITS = {
  cook: ['Cook', 'Cooked meals feed more.'],
  medic: ['Nurse-in-training', 'Bandages and medicine go further.'],
  runner: ['Fast', 'Harder to spot outside.'],
  strong: ['Strong', 'Carries 2 more items.'],
  sleeper: ['Light sleeper', 'Better on guard.'],
  hustler: ['Hustler', 'Better at deals and bribes.'],
  fragile: ['Anxious', 'Mood falls faster.'],
  devout: ['Devout', 'Stealing and violence cut deep. Prayer heals.'],
  hardened: ['Hardened', 'Violence and theft cost less.']
};
const CR = (typeof window !== 'undefined' ? window : globalThis).Crisis || {};
if (CR.Icons) Object.keys(ITEMS).forEach((k) => { const h = CR.Icons.item(k); if (h) ITEMS[k][0] = h; });
const CAMPUS = CR.Campus;
const LOCS = CAMPUS.LOCS;
const LOCBY = CAMPUS.BY;
const sfx = (n) => { try { if (CR.Audio) CR.Audio.sfx(n); } catch (e) {} };
const buzz = (p) => { try { if (CR.Audio) CR.Audio.buzz(p); } catch (e) {} };

const MORNING = [
  'Dawn. Nobody says "good morning" anymore.', 'A generator coughs somewhere far, then stops.', 'Hunger woke you before the birds did.',
  'The harmattan dust hangs in the air. Everything tastes of it.', 'Distant gunfire, then a long, bad quiet.', 'Someone is humming a hymn behind the barricade. It trails off.',
  'The sky is clear. That is no comfort.', 'You can smell smoke. You do not ask from where.', 'Somebody cried in the night. Everybody pretends they slept.',
  'A cock crows. It must have survived on something.', 'The dogs have stopped barking. You know what that means.', 'You count the people in the room. You count again.', 'Flies. Somewhere close. You decide not to look.', 'Last night someone prayed out loud for an hour. Nobody told them to stop.'
];
const DIARY = {
  0: ['"I am fine. Do not ask me again."', '"We will be out of here soon."', '"At least we are together."'],
  1: ['"I keep hearing the gate."', '"Is it only me who cannot sleep?"'],
  2: ['"What is the point of all this?"', '"I miss home so much it hurts."'],
  3: ['"Leave me alone."', '"I do not think I can do this anymore."', '"Do not look at me like that."', '"Everything is quiet inside me now."'],
  4: ['"..."']
};

/* ---------- state ---------- */
let G = null;
const Q = []; let after = null; let modalOpen = false;
const person = (id) => G.S.find((s) => s.id === id);
const alive = () => G.S.filter((s) => s.alive);
const log = (t, c = '') => { G.log.unshift({ t, c }); G.log.length = Math.min(G.log.length, 40); };
const inv = (k) => G.inv[k] || 0;
const STASH_BASE = 40;
const stashCap = () => STASH_BASE + 25 * ((G && G.build && G.build.cupboard) || 0);
const stashCount = () => Object.values(G.inv).reduce((a, b) => a + b, 0);
const stashRoom = () => Math.max(0, stashCap() - stashCount());
const packCap = (s) => 6 + (s && s.trait === 'strong' ? 2 : 0);
const packCount = (s) => Object.values((s && s.pack) || {}).reduce((a, b) => a + b, 0);
/* anything that comes into the shelter has to fit in the cupboard; the rest is left behind */
const add = (k, n = 1) => {
  if (n > 0) { const room = stashRoom(); if (n > room) { const lost = n - room; G.stats.lost = (G.stats.lost || 0) + lost; try { toastWhy(`The cupboard is full. ${lost} ${ITEMS[k][1].toLowerCase()} left behind.`); } catch (e) {} n = room; } }
  G.inv[k] = Math.max(0, inv(k) + n);
};
const canPay = (c) => Object.entries(c).every(([k, v]) => inv(k) >= v);
const pay = (c) => Object.entries(c).forEach(([k, v]) => add(k, -v));
const costText = (c) => Object.entries(c).map(([k, v]) => `${v}${ITEMS[k][0]}`).join(' ');
const tier = (m) => (m >= 75 ? 0 : m >= 50 ? 1 : m >= 30 ? 2 : m >= 15 ? 3 : 4);
const TIERN = ['Okay', 'Uneasy', 'Sad', 'Depressed', 'Broken'];
const hasTrait = (s, t) => s.trait === t;
const weaponsOwned = () => Object.keys(WEAPON).flatMap((k) => Array(inv(k)).fill(k)).sort((a, b) => WEAPON[b] - WEAPON[a]);
const bestWeapon = () => { const w = weaponsOwned(); return w.length ? WEAPON[w[0]] : 0; };

const STUDENT_DEPTS = ['Law, 300L', 'Nursing, 200L', 'Computer Science, 400L', 'Accounting, 100L', 'Mass Comm, 300L', 'Microbiology, 400L', 'Economics, 200L', 'Political Science, 300L', 'Architecture, 500L', 'Business Admin, 100L', 'Pharmacy, 300L', 'Medicine, 400L'];
const POOLS = {
  student: ['boy_gym', 'boy_nerd', 'boy_hustler', 'boy_fellowship', 'boy_law', 'boy_hoodie', 'girl_hijab', 'girl_braids', 'girl_natural', 'girl_fashion', 'girl_nursing', 'girl_church'],
  visitor: ['refugee', 'scavenger', 'trader', 'boy_hoodie', 'girl_braids', 'father', 'mother', 'porter', 'cleaner', 'boy_hustler', 'girl_natural'],
  joiner: ['boy_gym', 'boy_nerd', 'boy_fellowship', 'girl_hijab', 'girl_nursing', 'girl_church', 'lect_m', 'lect_f', 'porter', 'cleaner', 'nurse', 'father', 'mother', 'cafe_woman', 'lab_m', 'lab_f']
};
const TRAIT_ARCH = { devout: ['boy_fellowship', 'girl_church'], medic: ['girl_nursing', 'nurse'], strong: ['boy_gym', 'porter'], hustler: ['boy_hustler', 'girl_fashion'], cook: ['girl_natural', 'cafe_woman'], runner: ['boy_gym', 'boy_hoodie'], hardened: ['boy_hustler', 'boy_hoodie'] };
const TRAIT_BY_ARCH = { boy_fellowship: 'devout', girl_church: 'devout', girl_nursing: 'medic', nurse: 'medic', boy_gym: 'strong', porter: 'strong', boy_hustler: 'hustler', girl_fashion: 'hustler', girl_natural: 'cook', cafe_woman: 'cook', boy_hoodie: 'runner' };
function mkPerson(trait, pool) {
  pool = pool || 'student';
  let arch = pick(POOLS[pool]);
  if (trait && TRAIT_ARCH[trait]) { const c = TRAIT_ARCH[trait].filter((a) => POOLS[pool].includes(a)); if (c.length) arch = pick(c); }
  let seed = Math.floor(R() * 1e9);
  let sp = CR.Sprites.gen(arch, seed);
  while (sp.body === 'child') { seed = Math.floor(R() * 1e9); sp = CR.Sprites.gen(arch, seed); }   // children are NPCs, never survivors
  const tr = trait || (TRAIT_BY_ARCH[arch] && chance(0.7) ? TRAIT_BY_ARCH[arch] : pick(Object.keys(TRAITS)));
  const student = /^Students/.test(sp.group) || sp.group === 'Children';
  return {
    id: 0, name: sp.name, arch, seed, sp, dept: student ? pick(STUDENT_DEPTS) : sp.label, story: pick(STORIES), trait: tr,
    hunger: rnd(10, 30), thirst: rnd(10, 30), fatigue: rnd(10, 30), hp: 100, sick: false, wound: false,
    mood: rnd(62, 85), alive: true, gone: false, slots: 2
  };
}
function addPerson(p) {
  const used = new Set(G.S.map((s) => s.name));
  let t = 0; while (!p.cid && used.has(p.name) && t++ < 25) { p.seed = Math.floor(R() * 1e9); p.sp = CR.Sprites.gen(p.arch, p.seed); p.name = p.sp.name; }
  if (!p.cid && used.has(p.name)) p.name += ' Jr';
  p.sp.name = p.name; p.id = ++G.nextId; G.S.push(p); return p;
}
/* what a person looks like right now: hunger, thirst, sickness, wounds, exhaustion, despair */
function stateOf(s) {
  if (!s.alive) return 'dead';
  const a = [];
  if (s.thirst >= 90 || s.hunger >= 90) a.push('starving'); else if (s.hunger >= 62 || s.thirst >= 68) a.push('hungry');
  if (s.sick) a.push('sick'); if (s.wound || s.hp < 45) a.push('hurt'); if (s.fatigue >= 72) a.push('tired'); if (s.mood < 15) a.push('broken');
  return a.length ? a.join('+') : 'ok';
}
const hashN = (n) => Math.abs(Math.imul(n | 0, 2654435761) >>> 0);
let curArt = null;
function artOne(a) {
  if (!a) return ''; if (a.html) return `<div class="art scene">${a.html}</div>`; if (a.icon) return `<div class="art icon">${a.icon}</div>`; if (!CR.Sprites || !CR.Side || !a.sp) return '';
  const nm = a.name || a.sp.name || ''; const inner = a.side ? CR.Side.render(a.sp, a.kind || 'dead', { scale: 3, state: a.state || 'ok' }) : CR.Sprites.render(a.sp, a.anim || 'blink', { scale: 3, state: a.state || 'ok' });
  return `<div class="art">${inner}${nm ? `<small>${nm}</small>` : ''}</div>`;
}
function artHtml(a) { if (Array.isArray(a)) return `<div class="arts">${a.map(artOne).join('<span class="arrow">↔</span>')}</div>`; return artOne(a); }
/* when two or three people are in a scene together, show all of them, so it is clear who is talking to whom */
function expandArt(art) {
  const c = ST.cur; if (!art || Array.isArray(art) || !c || !c.A || !c.B || art.sp !== c.A.sp) return art;
  return [art].concat([c.B, c.C].filter(Boolean).map((o) => ({ sp: o.sp, state: stateOf(o) })));
}
const memoMap = new Map();
const memoize = (k, fn) => { if (!memoMap.has(k)) { memoMap.set(k, fn()); if (memoMap.size > 10) memoMap.delete(memoMap.keys().next().value); } return memoMap.get(k); };
const portraitCache = new Map();
function portrait(s, st, scale) { const k = s.sp.arch + s.sp.seed + '|' + st + '|' + scale; if (!portraitCache.has(k)) { portraitCache.set(k, CR.Sprites.render(s.sp, 'blink', { scale, state: st })); if (portraitCache.size > 80) portraitCache.delete(portraitCache.keys().next().value); } return portraitCache.get(k); }
const BANDIT_ARCH = ['bandit_soldier', 'bandit_heavy', 'bandit_scout', 'bandit_kid', 'bandit_queen'];
function groupArt(g) {
  if (g.faces && g.faces.length && g.alive) { const f0 = g.faces[0]; if (g.att === 'hostile' || g.att === 'predatory') return { side: true, sp: Object.assign({}, f0, { item: f0.item || 'ak' }), kind: 'aim', state: 'ok' }; return { sp: f0, state: g.att === 'desperate' ? 'starving' : 'ok' }; }
  if (!g.alive) return { side: true, sp: CR.Sprites.gen('refugee', g.id * 97), kind: 'dead', state: 'dead' };
  if (g.att === 'hostile' || g.att === 'predatory') return { side: true, sp: CR.Sprites.gen(g.att === 'predatory' ? 'bandit_boss' : pick(BANDIT_ARCH), g.id * 31), kind: 'aim', state: 'ok' };
  if (g.att === 'desperate') return { sp: CR.Sprites.gen('refugee', g.id * 53), state: 'starving' };
  return { sp: CR.Sprites.gen(g.id % 2 ? 'boy_gym' : 'girl_natural', g.id * 17), state: 'ok' };
}

const ST = CR.Story, PO = CR.Politics, KS = CR.Cast;
function mkFromCast(cid, trust) {
  const c = KS.by[cid]; const seed = Math.floor(R() * 1e9);
  const sp = CR.Sprites.gen(c.arch, seed, c.ov); sp.name = c.name;
  return { id: 0, cid, name: c.name, arch: c.arch, seed, sp, dept: c.role, story: c.bio, trait: c.trait, hunger: rnd(10, 30), thirst: rnd(10, 30), fatigue: rnd(10, 30), hp: 100, sick: false, wound: false, mood: rnd(62, 85), alive: true, gone: false, slots: 2, trust: trust || 10, known: [], topics: {}, beats: {}, pack: {} };
}
function drawParty() {
  const ids = KS.core.map((c) => c.id);
  for (let t = 0; t < 300; t++) {
    const p = shuffle(ids).slice(0, 4); const sexes = new Set(p.map((i) => KS.by[i].sex)); const gc = {}; p.forEach((i) => { const g = KS.by[i].group; gc[g] = (gc[g] || 0) + 1; });
    if (sexes.size > 1 && Object.values(gc).every((n) => n <= 2)) return p;
  }
  return shuffle(ids).slice(0, 4);
}
function joinNamed(cid) {
  if (alive().length >= 6 || G.S.some((x) => x.cid === cid)) return null;
  const p = mkFromCast(cid, 12); p.mood = rnd(40, 60); p.hunger = rnd(40, 70); const s2 = addPerson(p); ST.initRel(); return s2;
}
function facChips() {
  return (G.fac || []).map((f) => `<span class="chip ${f.status === 'active' ? '' : 'zero'}">${f.met ? f.name : 'Unknown group'} · ${LOCBY[f.loc].name} · ${f.status === 'active' ? (f.met ? PO.stance(f) + ' · ~' + PO.size(f) : 'seen from afar') : 'gone'}</span>`).join('');
}
function zonePanel() {
  const z = G.zones || {}; if (!Object.keys(z).length) return '';
  return `<div class="panel"><h3>The standoff zones</h3>${Object.values(z).map((q) => { const h = q.holder ? PO.fac(q.holder) : null; return `<div class="dim">${q.name}: <b style="color:var(--cream)">${h ? (h.met ? h.name : 'someone you have not met') : 'nobody'}</b> · ${q.tension > 60 ? 'on the brink' : q.tension > 35 ? 'tense' : 'quiet'}</div>`; }).join('')}</div>`;
}
function showNotebook(id) {
  const s = person(id); if (!s) return;
  const rows = alive().filter((o) => o.id !== s.id).map((o) => { const r = ST.rel(s, o); const w = r.love >= 2 ? '❤ together' : r.love >= 1 ? '❤ something between them' : r.fond > 60 ? 'very close' : r.fond > 30 ? 'friends' : r.fond > 10 ? 'friendly' : r.fond < -10 ? 'cold' : 'acquaintances'; return `${o.name}: ${w}${r.tension > 50 ? ' · strained' : ''}`; });
  ask(`${s.name}'s notebook`, `<i>${ST.describe(s)}</i>\n\nTrust in you: ${Math.round(s.trust || 0)}/100\n\n${(s.known || []).length ? 'What you know:\n' + s.known.map((k) => '• ' + k).join('\n') : 'You do not know them well yet.'}\n\n${rows.join('\n')}`, [{ label: 'Close' }], { sp: s.sp, state: stateOf(s) });
}
function newGame() {
  if (CR.House) CR.House.reset(); if (CR.Tutorial) CR.Tutorial.stop();
  G = {
    t: 480, speed: 1, seed: Math.floor(Math.random() * 1e9), yard: [], sched: [], pend: null, away: false, day: 1, screen: 'day', S: [], nextId: 0, sel: null,
    inv: { food: rnd(7, 10), water: rnd(7, 10), wood: rnd(4, 6), parts: rnd(2, 3), cloth: rnd(1, 3), meds: rnd(0, 2), bandage: rnd(0, 2) },
    build: { barricade: 0, stove: 0, bed: 0, bucket: 0, radio: 0, still: 0, cupboard: 0, bench: 1 },
    locs: {}, flags: {}, stats: { thefts: 0, kills: 0, helped: 0, refused: 0, deaths: 0, left: 0, lost: 0, storylets: 0, by: {} },
    rescueWin: null, rescueDay: 0, floors: 3 + Math.floor(Math.random() * 4), dayTrip: false, log: [], assign: {}, exp: null, tonight: null, groups: [], grateful: [], lastEv: '', thiefId: 0, pickLoc: null, pickZone: null, shelter: '', newsLog: [],
    mem: {}, rel: {}, threads: [], nem: [], turned: [], favors: [], dir: { tension: 20, last: [], cool: {} }, dead: [], fac: [], zones: {}, ledger: [], pacts: [], wars: [], rumors: [], envoys: [], rep: { honor: 0, fear: 0, wealth: 0 }, player: true, out: null
  };
  { const a0 = rnd(20, 32); G.rescueWin = [a0, a0 + 5]; G.rescueDay = rnd(a0, a0 + 5); }
  const party = drawParty();
  party.forEach((cid) => addPerson(mkFromCast(cid, 10)));
  G.sel = G.S[0].id; G.S.forEach((p) => { p.slots = 3; });
  G.shelter = pick(CAMPUS.hostels().filter((h) => h.id !== 'bhT')).id; G.pickZone = LOCBY[G.shelter].zone;
  LOCS.forEach((l) => { G.locs[l.id] = { rich: rnd(l.rich[0], l.rich[1]) }; });
  CR.World.init(host); PO.init(host, party); ST.initRel();
  CR.Sim.start(G);
  rollTonight();
  G.sched = [10, 15, 20];
  const missingLine = party.map((cid) => { const c = KS.by[cid]; const g = KS.group[c.group]; return g ? `${c.name}'s friends from ${g.name} are somewhere across the campus.` : ''; }).filter(Boolean).slice(0, 2).join(' ');
  const intro = pick([
    'Bandits have cut every road into Bwari and the edges of Abuja. The FCT is under lockdown. The university gates were chained by the administration, then abandoned by it.',
    'The bandits came out of the bush the way they always do, but this time they did not leave. The roads closed. The FCT locked down. The radio said "stay indoors," then stopped saying anything.',
    'First the checkpoints fell. Then the police stations. By the time anyone said the word lockdown, there was no one left to enforce it and no one left to call.'
  ]);
  say('Day 1', `${intro}\n\nFour of you are holed up in ${LOCBY[G.shelter].name} on the Veritas campus. No power. No signal. Little food. Others are out there too, in the other blocks, behind their own doors, deciding what they will do to survive. ${missingLine}\n\nYou are the one the others look to. The last word on the radio, before it died: soldiers may reach the campus <b>between Day ${G.rescueWin[0]} and Day ${G.rescueWin[1]}</b>. Not the exact day. Survive until then.`);
  log('Day 1. The siege begins.');
  flush();
  save();
}

/* ---------- save ---------- */
function save() { try { localStorage.setItem('crisis_save', JSON.stringify(G)); } catch (e) {} }
function load() {
  try {
    const s = localStorage.getItem('crisis_save'); if (!s) return false;
    const g = JSON.parse(s);
    /* saves from older versions have no shelter, sprites or campus ids: discard them rather than crash */
    const ok = g && g.shelter && LOCBY[g.shelter] && Array.isArray(g.S) && g.S.every((x) => x.sp && x.sp.arch && x.cid) && g.tonight && g.build && g.fac && g.fac.length && g.rel && g.dir && typeof g.t === 'number';
    if (!ok) { localStorage.removeItem('crisis_save'); return false; }
    G = g; if (CR.House) CR.House.reset(); G.pend = null; G.away = false; if (CR.Sim) CR.Sim.start(G); return true;
  } catch (e) { try { localStorage.removeItem('crisis_save'); } catch (e2) {} return false; }
}

/* ---------- modal queue ---------- */
function ask(title, text, choices, art) { Q.push({ title, text, choices, art: expandArt(art || curArt), cur: ST.cur }); }
function say(title, text, art) { Q.push({ title, text, choices: [{ label: 'Continue' }], art: expandArt(art || curArt), cur: ST.cur }); }
function flush(cb) { if (cb) after = cb; if (!modalOpen) nextModal(); }
function nextModal() {
  const m = Q.shift(); const el = $('#modal');
  if (!m) { modalOpen = false; if (el) el.classList.add('hidden'); try { const hs = document.querySelector('.house .hsvg'); if (hs) { hs.style.height = ''; hs.style.bottom = ''; } } catch (e0) {} const a = after; after = null; save(); render(); if (a) a(); return; }
  try {
    modalOpen = true; render();
    const ch = m.choices.filter((c) => c.show === undefined || c.show); const prompt = ch.length > 1 ? `<div class="prompt">${m.choices.prompt || 'What do you do?'}</div>` : '';
    const BACKRE = /^(leave it|never mind|nevermind|close|back|cancel|stay inside|wait inside|not now|that's all|enough|leave)\b/i; const bi = ch.length > 1 ? ch.findIndex((c) => BACKRE.test(String(c.label).replace(/<[^>]+>/g, '').trim())) : -1; const backBtn = bi >= 0 ? `<button class="mback" data-m="${bi}">← ${String(ch[bi].label).replace(/<[^>]+>/g, '').replace(/[.!…]+$/, '')}</button>` : '';
    el.innerHTML = `<div class="box">${backBtn}<div class="mhead">${artHtml(m.art)}<h3>${m.title}</h3></div><div class="story">${m.text.replace(/\n/g, '<br>')}</div>${prompt}<div class="btns">${ch.map((c, i) => (i === bi ? '' : `<button data-m="${i}" ${c.off ? dis(c.why || autoWhy(c.label)) : ''}>${c.label}</button>`)).join('')}</div></div>`;
    el.classList.remove('hidden'); placeModal(); sfx('open'); if (CR.UI) CR.UI.soon();
    el.querySelectorAll('[data-m]').forEach((b) => {
      b.onclick = () => {
        if (b.getAttribute('aria-disabled')) { toastWhy(b.dataset.why); return; }
        try {
          sfx('choose'); const c = ch[+b.dataset.m]; if (m.cur !== undefined) ST.cur = m.cur; const r = c.fn ? c.fn() : null;
          if (typeof r === 'string' && r) Q.unshift({ title: m.title, text: r, choices: [{ label: 'Continue' }], art: m.art, cur: m.cur });
          if (G && G.screen !== 'over' && alive().length === 0) { G.screen = 'over'; Q.length = 0; }
        } catch (err) { reportError(err); }
        nextModal();
      };
    });
  } catch (err) { reportError(err); modalOpen = false; Q.length = 0; if (el) el.classList.add('hidden'); }
}
function reportError(err) { try { console.error(err); (window.__errors = window.__errors || []).push(String(err && err.stack || err)); } catch (e) {} }




/* ---------- someone knocks: you decide who answers ---------- */
function knockRun(d, cs, runFn) {
  const saved = Q.splice(0, Q.length); let r; try { r = runFn(); } catch (e) { reportError(e); r = false; }
  const got = Q.splice(0, Q.length); Q.push(...saved);
  if (r === false) return false; if (!got.length) return true;
  knockModal(d, got, null); return true;
}
function knockModal(d, got, peek) {
  const al = alive(); const brave = (s) => (ST.cd(s) ? ST.cd(s).axes.brave : 0.3);
  const cands = al.slice().sort((a, b) => brave(b) - brave(a)).slice(0, 2);
  sfx('hit'); setTimeout(() => sfx('hit'), 330); setTimeout(() => sfx('hit'), 660); buzz([40, 70, 40, 70, 40]);
  const a0 = Array.isArray(got[0].art) ? got[0].art[0] : got[0].art;
  if (a0 && a0.sp && !peek) { const armed0 = a0.sp.item === 'ak' || a0.sp.item === 'rifle' || /bandit|soldier/.test(a0.sp.arch || ''); const needy0 = /hungry|starving|hurt|sick/.test(a0.state || ''); G.yard = [{ sp: a0.sp, kind: armed0 ? 'aim' : needy0 ? 'sitfloor' : 'idle', state: a0.state || 'ok', until: G.t + 60, text: armed0 ? 'An armed figure stands at the door.' : needy0 ? 'Someone thin is waiting at the door, shaking.' : 'Someone is waiting at the door.' }]; }
  const intro = pick(['Three slow knocks on the barricade.', 'Knocking: quick, soft, desperate.', 'Two polite knocks, a pause, then two more.', 'A fist on the wood, patient and heavy.']);
  const ch = [{ label: 'Open the door yourself', fn() { Q.unshift(...got); return ''; } }];
  cands.forEach((c) => ch.push({ label: `Send ${c.name} to answer`, fn() { c.trust = clamp((c.trust || 0) + 1, 0, 100); Q.unshift({ title: `${c.name} answers`, text: `<i>${c.name} goes to the door, slides the bolt back a hand's width, and asks who it is.</i>`, choices: [{ label: 'Continue' }], art: { sp: c.sp, state: stateOf(c) }, cur: null }, ...got); return ''; } }));
  if (!peek) ch.push({ label: 'Look through the gap first', fn() {
    const armed = a0 && a0.sp && (a0.sp.item === 'ak' || a0.sp.item === 'rifle' || /bandit|soldier/.test(a0.sp.arch || '')); const needy = a0 && /hungry|starving|hurt|sick/.test(a0.state || '');
    const t = armed ? 'Boots, a rifle sling, and more than one shadow behind the first.' : needy ? 'One person, thin, shaking, with their hands where you can see them.' : 'One person, steady, watching the gap as if they know you can see them.';
    knockModal(d, got, t); return ''; } });
  ch.push({ label: 'Stay quiet. Do not answer.', fn() { log('Someone knocked. Nobody answered.', 'warn'); if (d.onIgnore) d.onIgnore(); return `<i>The knocking goes on a while. Then it stops, and the quiet afterwards is worse.</i>`; } });
  ch.prompt = 'Who answers?';
  ask('Knock, knock', `${intro}\n\nEveryone in the room goes still.${peek ? `\n\n<i>${peek}</i>` : ''}`, ch, { icon: '🚪' });
}

/* ---------- inventory: the cupboard (group) and each person's pack ---------- */
const ITEM_KEYS = Object.keys(ITEMS);
function depositBag(bag, s) {
  s.pack = s.pack || {}; let toPack = 0, lost = 0;
  Object.entries(bag).forEach(([k, v]) => { for (let i = 0; i < v; i++) { if (stashRoom() > 0) G.inv[k] = inv(k) + 1; else if (packCount(s) < packCap(s)) { s.pack[k] = (s.pack[k] || 0) + 1; toPack++; } else lost++; } });
  if (toPack || lost) say('The cupboard is full', `<i>There was no room for everything ${s.name} brought back.${toPack ? ` ${toPack} item${toPack > 1 ? 's' : ''} stayed in ${s.name}'s pack.` : ''}${lost ? ` ${lost} had to be left outside.` : ''} A bigger cupboard would help.</i>`);
}
function invText(s) {
  const list = (o) => ITEM_KEYS.filter((k) => (o[k] || 0) > 0).map((k) => `${ITEMS[k][0]} ${o[k]}`).join('   ') || 'nothing';
  return `<b>Cupboard</b>  ${stashCount()}/${stashCap()}\n${list(G.inv)}\n\n<b>${s.name}'s pack</b>  ${packCount(s)}/${packCap(s)}\n${list(s.pack || {})}\n\n<i>Raiders can only take from the cupboard. A pack stays with its owner.</i>`;
}
function invMenu(s) {
  s.pack = s.pack || {}; const others = alive().filter((o) => o.id !== s.id);
  ask(`${s.name}'s inventory`, invText(s), [
    { label: 'Take from the cupboard', off: stashCount() === 0 || packCount(s) >= packCap(s), why: stashCount() === 0 ? 'The cupboard is empty.' : `${s.name}'s pack is full (${packCap(s)} max).`, fn() { invList(s, 'take'); return ''; } },
    { label: 'Put into the cupboard', off: packCount(s) === 0 || stashRoom() < 1, why: packCount(s) === 0 ? `${s.name} is carrying nothing.` : 'The cupboard is full.', fn() { invList(s, 'put'); return ''; } },
    { label: 'Give to someone', off: packCount(s) === 0 || !others.length, why: packCount(s) === 0 ? `${s.name} is carrying nothing to give.` : 'There is no one else here.', fn() { invWho(s); return ''; } },
    { label: 'Done' }], { sp: s.sp, state: stateOf(s) });
}
function invWho(s) {
  const ch = alive().filter((o) => o.id !== s.id).map((o) => ({ label: `${o.name} (${packCount(o)}/${packCap(o)})`, off: packCount(o) >= packCap(o), why: `${o.name} cannot carry any more.`, fn() { invList(s, 'give', o); return ''; } }));
  ch.push({ label: 'Back', fn() { invMenu(s); return ''; } }); ask('Give to whom?', `<i>${s.name} is carrying ${packCount(s)}/${packCap(s)}.</i>`, ch, { sp: s.sp, state: stateOf(s) });
}
function giftEffect(t, k) {
  const need = ((k === 'food' || k === 'meal') && t.hunger > 55) || (k === 'water' && t.thirst > 55) || (k === 'meds' && t.sick) || (k === 'bandage' && t.wound);
  t.trust = clamp((t.trust || 0) + (need ? 4 : 1), 0, 100); if (need) mood(t, 2); return need;
}
function invList(s, mode, target) {
  s.pack = s.pack || {}; const src = mode === 'take' ? G.inv : s.pack; const items = ITEM_KEYS.filter((k) => (src[k] || 0) > 0);
  const room = () => (mode === 'take' ? packCap(s) - packCount(s) : mode === 'put' ? stashRoom() : packCap(target) - packCount(target));
  const why = mode === 'take' ? `${s.name}'s pack is full (${packCap(s)} max).` : mode === 'put' ? 'The cupboard is full.' : `${target.name} cannot carry any more.`;
  const move = (k, n) => { for (let i = 0; i < n; i++) { if (room() < 1 || (src[k] || 0) < 1) break; if (mode === 'take') { add(k, -1); s.pack[k] = (s.pack[k] || 0) + 1; } else if (mode === 'put') { s.pack[k]--; add(k, 1); } else { s.pack[k]--; target.pack = target.pack || {}; target.pack[k] = (target.pack[k] || 0) + 1; } } };
  const ch = items.map((k) => ({ label: `${ITEMS[k][0]} ${ITEMS[k][1]} ×${src[k]}`, off: room() < 1, why, fn() { move(k, 1); if (mode === 'give') { const need = giftEffect(target, k); toastWhy(need ? `${target.name} needed that. Thank you.` : `${target.name} takes it.`); } invList(s, mode, target); return ''; } }));
  if (items.length > 1 && room() > 0) ch.push({ label: 'Move everything that fits', fn() { items.forEach((k) => move(k, src[k])); if (mode === 'give') target.trust = clamp((target.trust || 0) + 2, 0, 100); invList(s, mode, target); return ''; } });
  ch.push({ label: 'Back', fn() { if (mode === 'give') invWho(s); else invMenu(s); return ''; } });
  const head = mode === 'take' ? 'Take from the cupboard' : mode === 'put' ? 'Put into the cupboard' : `Give to ${target.name}`;
  ask(head, items.length ? `<i>Tap an item to move one. Cupboard ${stashCount()}/${stashCap()} · ${s.name} ${packCount(s)}/${packCap(s)}${mode === 'give' ? ` · ${target.name} ${packCount(target)}/${packCap(target)}` : ''}</i>` : '<i>Nothing left to move.</i>', ch, { sp: s.sp, state: stateOf(s) });
}

/* ---------- why something is greyed out ---------- */
const escA = (t) => String(t).replace(/"/g, '&quot;');
const parseData = (x) => { const o = {}; String(x || '').replace(/data-([a-z]+)="([^"]*)"/g, (m, k, v) => { o[k] = v; return m; }); return o; };
function whyNot(a, d) {
  const s = person(G.sel) || alive()[0]; const nm = s ? s.name : 'They';
  const noTask = s ? (s.slots < 1 ? `${nm} has no tasks left today.` : s.mood < 15 ? `${nm} is too broken to work.` : s.fatigue >= 95 ? `${nm} is too exhausted.` : '') : '';
  const need = (c) => { const miss = Object.entries(c).filter(([k, v]) => inv(k) < v).map(([k, v]) => `${v - inv(k)} more ${ITEMS[k][1].toLowerCase()}`); return miss.length ? `Needs ${miss.join(' and ')}.` : ''; };
  switch (a) {
    case 'use': { const k = d.i; if (inv(k) < 1 && !(s && s.pack && s.pack[k] > 0)) return `You have no ${ITEMS[k][1].toLowerCase()}.`; if (k === 'meds' && s && !s.sick) return `${nm} is not sick.`; if (k === 'bandage' && s && !s.wound) return `${nm} has no wound to treat.`; return 'Not possible right now.'; }
    case 'cook': return !G.build.stove ? 'Build a stove first (Work, then Build).' : noTask || (!inv('food') ? 'You have no food to cook.' : !inv('wood') ? 'You need wood for the fire.' : '');
    case 'bandage': return noTask || need({ cloth: 2 });
    case 'club': return noTask || need({ wood: 2 });
    case 'machete': return noTask || need({ parts: 2, wood: 1 });
    case 'brew': return !G.build.still ? 'Build a still first.' : noTask || need({ food: 2 });
    case 'pray': return noTask;
    case 'build': { const B2 = BUILDS[d.b]; if (G.build[d.b] >= B2.max) return `${B2.n} is already built.`; return noTask || need(B2.cost()); }
    case 'talk': { const t = person(+d.id); return t ? `${t.name} is worn out today.` : ''; }
    case 'diplo': return noTask;
  }
  return 'Not available right now.';
}
function autoWhy(label) { const m = String(label).match(/\(([^)]*\d[^)]*)\)/); if (m && /^\s*\d/.test(m[1])) return `Needs ${m[1].trim()}.`; if (/^Send /i.test(label)) return 'They need a free task for this.'; return 'You cannot do this right now.'; }
const dis = (why2) => `aria-disabled="true" data-why="${escA(why2)}"`;
function toastWhy(t) { try { if (CR.UI) CR.UI.toast(t || 'Not available right now.'); } catch (e) {} }

/* ---------- survivor effects ---------- */
function mood(s, d) {
  if (!s.alive) return;
  if (d < 0 && hasTrait(s, 'fragile')) d *= 1.5;
  s.mood = clamp(s.mood + d, 0, 100);
}
function moodAll(d, except) { alive().forEach((s) => { if (s !== except) mood(s, d); }); }
function moral(s, amt) {
  if (hasTrait(s, 'devout')) amt *= 1.7; if (hasTrait(s, 'hardened')) amt *= 0.5;
  mood(s, -amt); moodAll(-1, s);
}
function kill(s, why) {
  if (!s.alive) return; s.alive = false; s.hp = 0; G.stats.deaths++;
  log(`${s.name} is dead. ${why || ''}`, 'bad');
  moodAll(-12);
  if (G.exp && G.exp.sid === s.id) G.exp.dead = true;
  if (s.cid) ST.onDeath(s, why);
  Object.entries(s.pack || {}).forEach(([k, v]) => add(k, v)); s.pack = {};
  sfx('death'); buzz([90, 60, 220]);
  Q.push({ title: `${s.name} is dead`, text: deathText(s, why), choices: [{ label: 'Continue' }], art: { side: true, sp: s.sp, kind: 'dead', state: 'dead' } });
}
function deathText(s, why) {
  const w = (why || '').toLowerCase(), n = s.name;
  const bank = [
    [/starv/, [`${n} had stopped asking for food two days before. The skin sat on the bones like wet cloth. At the end, the hands were the last thing to move.`, `${n} died hungry. The ribs showed through the shirt. The stomach was swollen and tight, and nothing you had would have stopped it by then.`]],
    [/thirst/, [`${n}'s lips had split and gone black. The tongue was dry as leather. They died whispering for water you did not have.`]],
    [/fever|sick/, [`The fever took ${n} slowly, then all at once. The sheets were soaked through. The room smelt of it for days.`]],
    [/bled/, [`${n} bled through every bandage you had. By morning the floor under the bed was dark and tacky, and the flies had found it.`]],
    [/raid|shelter|defend/, [`They found ${n} in the dark corridor. It was quick and ugly. You found what was left at dawn, and you will not describe it.`, `${n} went down fighting at the barricade. The planks were wet to the height of a man's chest.`]],
    [/patrol|shot|back/, [`A burst from the dark. ${n} dropped like a sack of rice. The wall behind was wet. They never got up.`, `The first round took ${n} in the chest. The second took the rest. The torch went on burning on the floor, lighting it all.`]],
    [/beaten|beat/, [`They beat ${n} until the face stopped being a face. The hands were still clenched when you found them.`]],
    [/meeting|ambush/, [`${n} never came back from the meeting. You found them two days later, left where you would see.`]],
    [/fall/, [`${n} fell through the rotten floor. The neck bent wrong. It was over before the dust settled.`]],
    [/killed by/, [`${n} was cut down inside their own corridor. Whoever did it took the shoes.`]]
  ];
  for (const [re, lines] of bank) if (re.test(w)) return pick(lines);
  return `${n} is dead. Nobody says how it felt. Nobody needs to.`;
}
function hurt(s, amt, why) {
  if (!s.alive) return false;
  s.hp -= amt; if (amt >= 18) s.wound = true;
  if (s.hp <= 0) { kill(s, why); return true; } return false;
}

/* ---------- tonight rumours ---------- */
function rollTonight() {
  const danger = pick(LOCS.filter((l) => l.id !== G.shelter)).id;
  G.tonight = { danger, zone: pick(Object.keys(CAMPUS.ZONES)) };
}

/* ---------- other survivor groups ---------- */
const ATT = { friendly: 28, wary: 26, desperate: 20, hostile: 16, predatory: 10 };
const ATTN = { friendly: 'Friendly', wary: 'Wary', desperate: 'Desperate', hostile: 'Hostile', predatory: 'Predatory' };
const ATTREL = { friendly: 40, wary: 0, desperate: 10, hostile: -40, predatory: -60 };
function groupName(L) {
  const n = L.name.replace(/ \(premium\)| \(occupied\)/, '');
  if (L.kind === 'hostel') return `${n} residents`;
  if (L.kind === 'cafe') return `The ${n} camp`;
  const special = { chapel: 'The Chapel congregation', elib: 'E-Library holdouts', mph: 'The MPH crowd', aud: 'Auditorium holdouts', clinic: 'Clinic staff and patients', senate: 'Senate block holdouts', pg: 'Postgraduate holdouts', med: 'The Medical block group' };
  return special[L.id] || `${n} survivors`;
}
function mkGroups() {
  const cand = LOCS.filter((l) => l.group && l.id !== G.shelter);
  return shuffle(cand).slice(0, rnd(5, 7)).map((L, i) => {
    const att = wpick(L.zone === 'boysP' ? { friendly: 14, wary: 26, desperate: 8, hostile: 26, predatory: 26 } : ATT);
    const big = L.id === 'newcaf', k = L.zone === 'boysP' ? 1.5 : big ? 2 : 1;
    return { id: i + 1, name: groupName(L), loc: L.id, size: big ? rnd(6, 10) : rnd(2, 7), att, rel: ATTREL[att], stock: { food: Math.round(rnd(4, 12) * k), water: Math.round(rnd(4, 10) * k), meds: rnd(0, 3) }, alive: true, met: false, starve: 0 };
  });
}
const groupAt = (loc) => G.groups.find((g) => g.loc === loc);
const gLive = () => G.groups.filter((g) => g.alive);
function setRel(g, d) {
  g.rel = clamp(g.rel + d, -100, 100);
  if (g.att !== 'predatory') { if (g.rel <= -40) g.att = 'hostile'; else if (g.rel >= 40 && g.att !== 'desperate') g.att = 'friendly'; }
}
function groupsDawn(lines) {
  gLive().forEach((g) => {
    g.stock.food = Math.max(0, g.stock.food - Math.ceil(g.size * 0.35)); g.stock.water = Math.max(0, g.stock.water - Math.ceil(g.size * 0.3));
    if (g.stock.food === 0 || g.stock.water === 0) g.starve++; else { g.starve = 0; if (chance(0.2)) g.stock.food += rnd(1, 3); }
    if (g.starve >= 1 && (g.att === 'friendly' || g.att === 'wary')) g.att = 'desperate';
    if (g.starve >= 3 && chance(0.4)) { g.size--; }
    if (g.size <= 0 || chance(0.025)) { g.alive = false; if (g.met) lines.push(`${g.name} have gone silent.`); }
  });
}
function joinFrom(g) { const p = mkPerson(null, 'joiner'); p.story = g ? `Came from ${g.name}. Does not say why they left.` : p.story; if (g) g.size = Math.max(0, g.size - 1); return addPerson(p); }
function gItems() { return ['food', 'water', 'meds', 'bandage', 'cloth', 'parts', 'wood'].filter((k) => inv(k) > 0); }
function evGroup() {
  const g = pick(gLive()); g.met = true; const L = LOCBY[g.loc]; const hd = `${g.name} (${g.size}, ${L.name})`; curArt = groupArt(g);
  if (g.att === 'friendly') {
    ask(`${g.name} send word`, `A runner from ${hd} crosses the open ground with hands raised. "We have a little extra. We can swap. And a warning: the gate men are out tonight."`, [
      { label: 'Swap 2 for 2', off: !gItems().length, fn() { const k = pick(gItems()); const n = Math.min(2, inv(k)); add(k, -n); add(pick(['food', 'water']), 2); setRel(g, 8); return 'A fair trade. Somebody almost smiles.'; } },
      { label: 'Take the warning', fn() { G.flags.levyPaid = 2; setRel(g, 5); return 'You keep the lights off and the barricade tight.'; } },
      { label: 'Send them away', fn() { setRel(g, -10); return 'You do not trust gifts anymore.'; } }
    ]);
  } else if (g.att === 'wary') {
    ask(`${g.name} at the boundary`, `${hd}. A man with a pipe stands at the edge of your ground. "Stay off our floors and we stay off yours."`, [
      { label: 'Agree', fn() { setRel(g, 10); return 'He nods once and leaves.'; } },
      { label: 'Offer a swap', off: !gItems().length, fn() { const k = pick(gItems()); add(k, -1); add(pick(['food', 'water']), 1); setRel(g, 12); return 'It is small. It is a beginning.'; } },
      { label: 'Threaten them', fn() { setRel(g, -25); moodAll(-1); return 'He does not blink. He remembers your face.'; } }
    ]);
  } else if (g.att === 'desperate') {
    ask(`${g.name} are starving`, `${hd}. Three of them at your barricade. One is a child, or looks like one. "We are out. Please. Anything."`, [
      { label: 'Give 3 food or water', off: inv('food') + inv('water') < 3, fn() {
        let n = 3; ['food', 'water', 'food', 'water'].forEach((k) => { if (n > 0 && inv(k) > 0) { add(k, -1); n--; } });
        setRel(g, 30); g.att = 'friendly'; G.stats.helped++;
        if (alive().length < 6) {
          Q.push({ title: 'One more mouth', text: 'One of them stays behind at the door. "Take me. Please. I will work."', choices: [
            { label: 'Take them in', fn() { const p = joinFrom(g); log(`${p.name} joined from ${g.name}.`, 'good'); return `${p.name} comes in without a word.`; } },
            { label: 'Close the door', fn() { G.stats.refused++; return 'You close it. It is the loudest sound you have ever heard.'; } }
          ] });
        }
        return 'They thank you. They are crying.';
      } },
      { label: 'Send them away', fn() { setRel(g, -20); G.stats.refused++; moodAll(-2); if (chance(0.35)) G.flags.groupRaid = g.id; return 'They stand a long time. Then they walk off. Some of them will not come back.'; } }
    ]);
  } else if (g.att === 'hostile') {
    ask(`${g.name} want what you have`, `${hd}. Six of them in the yard, none of them smiling. "You have been stealing from us. Pay, or we collect."`, [
      { label: 'Pay (lose 3 supplies)', fn() { let n = 3; ['food', 'water', 'food'].forEach((k) => { if (n > 0 && inv(k) > 0) { add(k, -1); n--; } }); setRel(g, 12); return 'They count it twice. They go.'; } },
      { label: 'Bluff: say you are armed', fn() { if (chance(bestWeapon() ? 0.65 : 0.3)) { setRel(g, 6); return 'They stare. They back off. For now.'; } G.flags.groupRaid = g.id; return 'They laugh. "Tonight, then."'; } },
      { label: 'Refuse', fn() { G.flags.groupRaid = g.id; setRel(g, -10); return '"Okay." They leave.'; } }
    ]);
  } else {
    ask(`${g.name} invite you to talk`, `${hd}. Their leader is friendly in a way that does not reach his eyes. "Meet us at ${L.name}. We trade. Everybody eats."`, [
      { label: 'Send someone to meet them', fn() {
        const s2 = pick(alive()); const ambush = chance(alive().some((x) => hasTrait(x, 'hustler')) ? 0.45 : 0.6);
        if (ambush) { hurt(s2, rnd(15, 40), 'Never came back from the meeting.'); stealSome(0.3); log(`${s2.name} was ambushed at the meeting.`, 'bad'); return `${s2.name} stumbles back alone, half-carried. Supplies gone.`; }
        add('food', 3); add('water', 2); setRel(g, 5); return `It was a trade, really. ${s2.name} comes back with food and a bad feeling.`;
      } },
      { label: 'Refuse', fn() { G.flags.informant = 2; return 'He stops smiling. "Okay."'; } }
    ]);
  }
}
function evNews() {
  const t = pick(CAMPUS.NEWS); G.newsLog = G.newsLog || []; G.newsLog.unshift({ d: G.day, t }); G.newsLog.length = Math.min(G.newsLog.length, 6);
  say(G.build.radio ? 'On the radio' : 'A news sheet', `${G.build.radio ? 'Between the static, a flat voice:' : 'A hand-copied sheet passes from block to block:'}\n\n"${t}"\n\nThe outside world is still there. It just is not coming.`);
}
function evScreams() {
  const g = gLive().find((x) => x.met) || null;
  ask('Screaming', `Past midnight someone screams for a long time. ${g ? 'It is coming from where ' + g.name + ' are.' : 'It is coming from across the open ground.'} Then it stops. Nobody in the room is breathing.`, [
    { label: 'Send someone to look', fn() {
      const s2 = pick(alive());
      if (chance(0.4)) { hurt(s2, rnd(10, 30), 'Went out to look. Did not return.'); return `${s2.name} comes back shaking, bleeding. "Do not go out there."`; }
      const k = pick(['food', 'water', 'cloth']); add(k, 2); mood(s2, -8);
      return `${s2.name} finds what is left. ${s2.name} takes ${ITEMS[k][1].toLowerCase()} from a room that no longer has an owner, and does not talk for a day.`;
    } },
    { label: 'Stay put', fn() { moodAll(-3); return 'You do nothing. Everyone knows you did nothing. Nobody says so.'; } }
  ]);
}

/* ---------- day events ---------- */
const PLEAD = ['"Please. Even half. I have not eaten since Tuesday."', '"I can hear them coming. Please."', '"I will remember you for this. I swear."', '"My roommate is sick. Just one thing."'];
const SELL = ['holds out a phone, dead and useless', 'offers a wristwatch', 'offers a student ID like it still matters'];
const EV = [
  { id: 'beg', w: () => 3, f: evBeg }, { id: 'trade', w: () => 2, f: evTrade },
  { id: 'join', w: () => (alive().length < 6 ? 1.4 : 0), f: evJoin }, { id: 'levy', w: () => (G.day >= 3 ? 2 : 0), f: evLevy },
  { id: 'gun', w: () => 1.5, f: evGunfire }, { id: 'rain', w: () => 1.5, f: evRain },
  { id: 'quarrel', w: () => (alive().length >= 2 ? 1.5 : 0), f: evQuarrel }, { id: 'body', w: () => 1.2, f: evBody },
  { id: 'rumor', w: () => 1.5, f: evRumor }, { id: 'dream', w: () => 1, f: evDream },
  { id: 'lights', w: () => 0.9, f: evLights }, { id: 'note', w: () => (G.flags.cache ? 0 : 0.9), f: evNote },
  { id: 'grate', w: () => (G.grateful.length ? 6 : 0), f: evGrateful },
  { id: 'group', w: () => (gLive().length ? 3.2 : 0), f: evGroup }, { id: 'scream', w: () => 1.1, f: evScreams }, { id: 'news', w: () => (G.build.radio ? 2.4 : 0.7), f: evNews }
];
function rollDayEvents() {
  const n = 1 + (chance(0.45) ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const pool = {}; EV.forEach((e) => { const w = e.w(); if (w > 0 && e.id !== G.lastEv) pool[e.id] = w; });
    const id = wpick(pool); G.lastEv = id; EV.find((e) => e.id === id).f(); curArt = null;
  }
}
function evBeg() {
  const p = mkPerson(null, 'visitor'); const need = pick(['food', 'water', 'meds', 'bandage']); curArt = { sp: p.sp, state: (need === 'food' || need === 'water') ? 'starving' : 'sick+hurt' };
  if (chance(0.1)) { p.kid = true; p.sp = CR.Sprites.gen(pick(['kid_boy', 'kid_girl']), rnd(1, 1e6)); p.name = p.sp.name; p.dept = 'a child, alone'; curArt = { sp: p.sp, state: 'starving' }; }
  ask(`${p.name} at the barricade`, `${p.name}, ${p.dept.toLowerCase()}, is hunched outside. ${pick(PLEAD)}\n\nThey need ${ITEMS[need][1].toLowerCase()}.`, [
    { label: `Give 1 ${ITEMS[need][1].toLowerCase()}`, off: inv(need) < 1, fn() { add(need, -1); G.stats.helped++; alive().forEach((s) => hasTrait(s, 'devout') && mood(s, 5)); if (chance(0.5)) G.grateful.push(p.name); log(`You helped ${p.name}.`, 'good'); return chance(0.6) ? 'They cry. They go. You do not know if it mattered.' : '"God will bless you," they whisper.'; } },
    { label: 'Send them away', fn() { G.stats.refused++; moodAll(-1); if (chance(0.3)) G.flags.informant = 2; log(`You turned ${p.name} away.`, 'warn'); return pick(['They stand there a long time before leaving.', 'They curse you quietly and walk off.', 'They do not argue. That is worse.']); } }
  ]);
}
function evTrade() {
  const keys = ['food', 'water', 'meds', 'bandage', 'wood', 'parts', 'cloth', 'ogogoro'];
  const give = pick(keys); let want = pick(keys.filter((k) => k !== give));
  const gq = rnd(1, 3), wq = Math.max(1, gq + rnd(-1, 1)); const p = mkPerson(null, 'visitor'); curArt = { sp: p.sp, state: 'hungry' };
  ask(`${p.name} wants to trade`, `${p.name} offers ${gq} ${ITEMS[give][0]} ${ITEMS[give][1]} for ${wq} ${ITEMS[want][0]} ${ITEMS[want][1]}.`, [
    { label: 'Accept', off: inv(want) < wq, fn() { add(want, -wq); add(give, gq); log(`Traded with ${p.name}.`); return 'Done. Hands shake. Nobody looks at the other.'; } },
    { label: 'Haggle', off: inv(want) < wq, fn() {
      const hs = alive().some((s) => hasTrait(s, 'hustler'));
      if (chance(hs ? 0.7 : 0.4)) { add(want, -wq); add(give, gq + 1); return 'They grumble, then give a little more. Done.'; }
      return chance(0.5) ? 'They spit and walk away.' : (add(want, -wq), add(give, Math.max(1, gq - 1)), 'They cut the deal. You take what is left.');
    } },
    { label: 'Decline', fn() { return 'They shrug and vanish.'; } }
  ]);
}
function evJoin() {
  const p = mkPerson(null, 'joiner'); const thief = chance(0.25); curArt = { sp: p.sp, state: 'hungry' };
  ask(`${p.name} asks to join`, `${p.name}, ${p.dept.toLowerCase()}, stands with hands open. "I can work. I will not eat much."\n\n${TRAITS[p.trait][0]}: ${TRAITS[p.trait][1]}`, [
    { label: 'Let them in', fn() {
      if (thief) { const q = addPerson(p); G.thiefId = q.id; log(`${p.name} joined the shelter.`); return 'They eat first. They look at the supplies a little too long.'; }
      addPerson(p); log(`${p.name} joined the shelter.`, 'good'); return 'They are quiet. They are grateful.';
    } },
    { label: 'Turn them away', fn() { G.stats.refused++; log(`You turned ${p.name} away.`, 'warn'); return 'They go back into the dark.'; } }
  ]);
}
function evLevy() {
  const str = rnd(1, 3);
  ask('A knock you do not like', 'Three armed men. One does the talking, politely. "Compound tax. Food and water. We will be back."', [
    { label: 'Pay (lose 3 supplies)', fn() { let n = 3; ['food', 'water', 'food'].forEach((k) => { if (n > 0 && inv(k) > 0) { add(k, -1); n--; } }); G.flags.levyPaid = 3; log('You paid the bandits.', 'warn'); return 'They take it. One smiles. "Good people."'; } },
    { label: 'Offer ogogoro instead', off: inv('ogogoro') < 1, fn() { if (chance(alive().some((s) => hasTrait(s, 'hustler')) ? 0.7 : 0.45)) { add('ogogoro', -1); G.flags.levyPaid = 2; return 'They laugh, take the bottle and leave. For now.'; } add('ogogoro', -1); G.flags.refused = 2; return 'They take the bottle, then the look in their eyes changes. "That was not the deal."'; } },
    { label: 'Refuse', fn() { G.flags.refused = 2; G.stats.refused++; log('You refused the bandits.', 'bad'); return 'He nods slowly. "Okay." They leave. You will hear from them.'; } }
  ]);
}
function evGunfire() { moodAll(-3); log('Gunfire at the gate, then silence.', 'warn'); say('Gunfire', 'A long burst from the direction of the gate. Then nothing. Nobody speaks for an hour.'); }
function evRain() {
  const q = G.build.bucket ? rnd(3, 5) : 1; add('water', q); moodAll(2);
  say('Rain', G.build.bucket ? `Rain, sudden and heavy. Your bucket catches ${q} sachets worth.` : 'Rain. You hold out every cup and bowl you have. It is not much.');
}
function evQuarrel() {
  const [a, b] = shuffle(alive()).slice(0, 2);
  ask('Raised voices', `${a.name} and ${b.name} are at each other over who has been eating more. It will not end by itself.`, [
    { label: `Back ${a.name}`, fn() { mood(a, 4); mood(b, -5); return `${b.name} turns away.`; } },
    { label: `Back ${b.name}`, fn() { mood(b, 4); mood(a, -5); return `${a.name} turns away.`; } },
    { label: 'Shout both quiet', fn() { mood(a, -2); mood(b, -2); return 'It works. Nobody is happy.'; } }
  ]);
}
function evBody() {
  const who = pick(alive()); curArt = { side: true, sp: CR.Sprites.gen(pick(['refugee', 'boy_hoodie', 'girl_braids', 'father']), rnd(1, 1e6)), kind: 'dead', state: 'dead' };
  ask('A body at the door', `A student you half-recognise lies near the barricade. Still warm. A bag under them.`, [
    { label: 'Search the bag', fn() { G.stats.thefts++; moral(who, 3); const k = pick(['food', 'water', 'cloth', 'meds', 'parts']); const q = rnd(1, 2); add(k, q); return `${q} ${ITEMS[k][0]}. You tell yourself they would not have minded.`; } },
    { label: 'Bury them', off: !alive().some((s) => s.slots > 0), fn() { const w = alive().find((s) => s.slots > 0); w.slots--; w.fatigue += 12; alive().forEach((s) => mood(s, hasTrait(s, 'devout') ? 8 : 3)); return 'You dig with whatever you have. Someone says a prayer.'; } },
    { label: 'Leave it', fn() { moodAll(-1); return 'Nobody mentions it again. Nobody forgets it either.'; } }
  ]);
}
function evRumor() {
  const real = chance(0.7); const day = real ? G.rescueDay + rnd(-4, 6) : G.day + rnd(3, 25);
  const src = G.build.radio ? 'On the radio, between static, a voice says' : 'A passing student whispers';
  ask('A rumour', `${src}: security forces will reach the campus around Day ${Math.max(day, G.day + 2)}.\n\n${G.build.radio ? 'Radio voices can be wrong.' : 'You have no way to check.'}`, [
    { label: 'Believe it', fn() { moodAll(5); return 'Hope is dangerous. It lifts everyone for a while.'; } },
    { label: 'Ignore it', fn() { return 'Rumours cost nothing. Believing them costs everything.'; } }
  ]);
}
function evDream() {
  const s = pick(alive()); mood(s, -6); curArt = { sp: s.sp, state: stateOf(s) + '+tired' };
  say('Nightmares', `${s.name} wakes up shouting. "${pick(['The gate. The gate.', 'I saw my mother. I could not reach her.', 'Somebody is calling my name outside.'])}"\n\n${s.name} does not sleep again.`);
}
function evLights() {
  moodAll(3);
  say('Power', 'For forty minutes the bulbs flicker on. Phones charge. Someone plays music, low. Then it all goes dark again.');
}
function evNote() {
  const l = pick(LOCS.filter((x) => x.risk <= 4)); G.flags.cache = l.id;
  say('A note', `A scrap of paper pushed under the door: "Cache at ${l.name}. Take what you need. Do not trust anyone." No name.`);
}
function evGrateful() {
  const n = G.grateful.shift(); const k = pick(['food', 'water', 'meds', 'cloth']); const q = rnd(1, 3); add(k, q);
  say('Someone remembers', `${n}, the one you helped, comes back to the barricade with ${q} ${ITEMS[k][0]} ${ITEMS[k][1].toLowerCase()}. "I do not forget."`);
  log(`${n} repaid your kindness.`, 'good');
}

/* ---------- day actions ---------- */
const BUILDS = {
  barricade: { n: 'Barricade', cost: () => ({ wood: 4 + 2 * G.build.barricade, parts: G.build.barricade + 1 }), max: 3, desc: 'Fewer and weaker raids.' },
  stove: { n: 'Stove', cost: () => ({ wood: 3, parts: 2 }), max: 1, desc: 'Lets you cook meals.' },
  bed: { n: 'Beds', cost: () => ({ wood: 3, cloth: 3 }), max: 1, desc: 'Better sleep.' },
  bucket: { n: 'Rain bucket', cost: () => ({ parts: 2, cloth: 2 }), max: 1, desc: 'Free water when it rains.' },
  radio: { n: 'Radio', cost: () => ({ parts: 4 }), max: 1, desc: 'Better rumours.' },
  still: { n: 'Still', cost: () => ({ parts: 3, wood: 2 }), max: 1, desc: 'Brew ogogoro.' },
  cupboard: { n: 'Bigger cupboard', cost: () => ({ wood: 4, parts: 1 }), max: 1, desc: '+25 storage.' }
};
function canTask(s) { return s && s.alive && !s.out && s.mood >= 15 && s.fatigue < 95; }
function spend(s) { s.fatigue += 8; }
function useItem(s, k) {
  const own = ((s.pack || {})[k] || 0) > 0;
  if (!own && inv(k) < 1) return;
  if (k === 'food') { s.hunger = Math.max(0, s.hunger - 22); mood(s, -1); s.thirst = Math.min(100, s.thirst + 6); if (!s.sick && chance(0.22)) { s.sick = true; log(`${s.name} has a stomach upset from eating raw food.`, 'warn'); } }
  else if (k === 'meal') { s.hunger = Math.max(0, s.hunger - 60); mood(s, 2); }
  else if (k === 'water') { s.thirst = Math.max(0, s.thirst - 45); }
  else if (k === 'ogogoro') { mood(s, 12); s.fatigue += 10; }
  else if (k === 'meds') { if (!s.sick) return; s.sick = false; }
  else if (k === 'bandage') { if (!s.wound) return; s.wound = false; s.hp = Math.min(100, s.hp + 8); }
  if (own) s.pack[k]--; else add(k, -1);
}
function act(a, d) {
  if (a === 'new') { newGame(); return; }          // there is no game yet on the title screen
  if (!G) return;
  if (CR.Tutorial) CR.Tutorial.act(a, d);
  const s = person(G.sel);
  switch (a) {
    case 'sel': takeControl(+d.id); break;
    case 'use': if (s) useItem(s, d.i); break;
    case 'build': { const B = BUILDS[d.b]; const c = B.cost(); if (canTask(s) && canPay(c) && G.build[d.b] < B.max) { pay(c); G.build[d.b]++; spend(s); log(`${s.name} built: ${B.n}.`, 'good'); } break; }
    case 'cook': if (canTask(s) && G.build.stove && inv('food') && inv('wood')) { const n = Math.min(alive().length, 4, inv('food')); const out = n + (hasTrait(s, 'cook') ? 1 : 0); add('food', -n); add('wood', -1); add('meal', out); spend(s); moodAll(2); const al = alive(); for (let i = 0; i < al.length; i++) for (let j = i + 1; j < al.length; j++) { if (al[i].cid && al[j].cid) ST.bond(al[i], al[j], 1, -1); } if (hasTrait(s, 'cook')) { mood(s, 4); s.trust = clamp((s.trust || 0) + 2, 0, 100); } log(`${s.name} cooked a pot: ${out} meals. The smell brings everyone closer.`, 'good'); } break;
    case 'bandage': if (canTask(s) && inv('cloth') >= 2) { add('cloth', -2); add('bandage', hasTrait(s, 'medic') ? 2 : 1); spend(s); } break;
    case 'club': if (canTask(s) && inv('wood') >= 2) { add('wood', -2); add('club', 1); spend(s); log(`${s.name} made a club.`); } break;
    case 'machete': if (canTask(s) && inv('parts') >= 2 && inv('wood') >= 1) { add('parts', -2); add('wood', -1); add('machete', 1); spend(s); log(`${s.name} made a machete.`); } break;
    case 'brew': if (canTask(s) && G.build.still && inv('food') >= 2) { add('food', -2); add('ogogoro', 1); spend(s); log(`${s.name} brewed ogogoro.`); } break;
    case 'pray': if (canTask(s) && hasTrait(s, 'devout')) { mood(s, 10); spend(s); } break;
    case 'talk': { const t = person(+d.id); if (t && t.alive) { ST.talk(t); flush(); } return; }
    case 'diplo': { if (canTask(s)) { const before = s.slots; PO.menu(s); flush(() => { if (s.alive && s.slots < before && !s.out) { s.out = { mode: 'diplo', back: G.t + 240, what: 'the other groups' }; SIM.abort(s); s.q = []; notice(`${s.name} has gone to speak with the other groups.`); } }); } return; }
    case 'notebook': { showNotebook(+d.id || G.sel); flush(); return; }
    case 'speed': G.speed = ((G.speed || 0) + 1) % 4; chromeSig = ''; chrome(); return;
    case 'simjob': { const j = d.k === 'build' ? { k: 'build', id: d.b } : d.k === 'craft' ? { k: 'craft', id: d.b } : { k: 'cook' }; const r = SIM.order(s.id, j, true); if (!r.ok) toastWhy(r.why); else notice(`${s.name} is on it.`); break; }
    case 'door': doorSheet(); flush(); return;
    case 'wheel': openWheel(d.w); return;
    case 'home': homeMenu(); flush(); return;
    case 'night': return;
    case 'zone': G.pickZone = d.id; G.pickLoc = null; break;
    case 'tab': ui[d.k] = d.t; break;
    case 'recover': G.screen = G.exp ? 'exp' : 'day'; if (G.screen === 'day') ui.day = 'people'; break;
    case 'inv': if (s) { invMenu(s); flush(); } return;
    case 'role': { if (d.r === 'scav') { Object.keys(G.assign).forEach((k) => { if (G.assign[k] === 'scav') G.assign[k] = 'sleep'; }); ui.night = 'where'; } G.assign[d.id] = d.r; break; }
    case 'loc': G.pickLoc = d.id; break;
    case 'begin': beginNight(); return;
    case 'search': search(); return;
    case 'take': takeFound(+d.n); break;
    case 'drop': { const e = G.exp; if (e.bag[d.i] > 0) { e.bag[d.i]--; } break; }
    case 'home': goHome(); return;
    case 'new': newGame(); return;
    case 'back': G.screen = 'day'; G.dayTrip = false; break;
  }
  save(); render();
}

/* ---------- night ---------- */
function beginNight() {
  const sc = alive().find((s) => G.assign[s.id] === 'scav');
  if (sc && !G.pickLoc) return;
  if (!sc) { resolveNight(); return; }
  const trv = CAMPUS.travel(G.shelter, G.pickLoc), tot = Math.max(2, (G.dayTrip ? 3 : 4) - trv);
  if (G.dayTrip) sc.slots = 0;
  G.exp = { day: !!G.dayTrip, xseed: rnd(1, 1e9), xs: [], sid: sc.id, loc: G.pickLoc, hours: tot, total: tot, travel: trv, bag: {}, found: null, noise: 0, dead: false, msg: LOCBY[G.pickLoc].flavor };
  G.screen = 'exp'; log(`${sc.name} slipped out to ${LOCBY[G.pickLoc].name}.`);
  save(); render();
}
const bagUsed = () => Object.values(G.exp.bag).reduce((a, b) => a + b, 0);
const bagCap = () => 8 + (hasTrait(person(G.exp.sid), 'strong') ? 2 : 0);
function search() {
  const e = G.exp, L = LOCBY[e.loc], s = person(e.sid);
  if (e.hours <= 0) return;
  e.hours--; e.noise += rnd(0, 1); e.found = null;
  const p = 0.22 + L.risk * 0.07 + e.noise * 0.025 + (G.tonight.danger === L.id ? 0.15 : 0) + (G.tonight.zone === L.zone ? 0.05 : 0) - (hasTrait(s, 'runner') ? 0.08 : 0);
  if (chance(p)) encounter(L, s); else loot(L);
  finishStep();
}
function spotSearch(idx) {
  const e = G.exp; if (!e || e.hours <= 0) return false; const L = LOCBY[e.loc], s = person(e.sid);
  e.hours--; e.noise += rnd(0, 1); e.found = null;
  const p = 0.08 + (e.day ? 0.08 : 0) + L.risk * 0.035 + e.noise * 0.02 + Math.max(0, (e.total || 4) - e.hours) * 0.012 + (G.tonight.danger === L.id ? 0.06 : 0) - (hasTrait(s, 'runner') ? 0.05 : 0);
  if (chance(p)) encounter(L, s, null, true); else loot(L);
  finishStep(); save(); render(); return true;
}
function forceEnc(k) { const e = G.exp; if (!e) return; encounter(LOCBY[e.loc], person(e.sid), k); e.noise = Math.max(0, e.noise - 2); finishStep(); save(); render(); }
function mountExp() {
  const el = $('#xstage'); const e = G.exp; if (!el || typeof el.appendChild !== 'function' || !e || !CR.Expedition) return;
  const L = LOCBY[e.loc], s = person(e.sid), gp = groupAt(L.id);
  CR.Expedition.attach(el, e, { kind: L.kind === 'misc' ? 'hostel' : L.kind, risk: L.risk, danger: G.tonight.danger === L.id, day: !!e.day, hasGroup: !!(gp && gp.alive), faces: gp ? gp.faces : null, sp: s.sp, state: stateOf(s) });
}
function finishStep() { flush(() => { if (G.exp && G.exp.dead) goHome(true); }); }
function loot(L) {
  const e = G.exp, st = G.locs[L.id];
  if (st.rich <= 0) { e.msg = 'Picked clean. Nothing left worth carrying.'; return; }
  st.rich--; const item = wpick(L.loot); const qty = WEAPON[item] ? 1 : (item === 'food' || item === 'water') ? rnd(2, 4) : rnd(1, 3);
  e.found = { item, qty }; e.msg = `You find ${qty} × ${ITEMS[item][1]}.`;
}
function takeFound(n) {
  const e = G.exp; if (!e.found) return;
  const space = bagCap() - bagUsed(); const t = Math.min(e.found.qty, space, n || 99);
  if (t > 0) { e.bag[e.found.item] = (e.bag[e.found.item] || 0) + t; e.found.qty -= t; }
  if (e.found.qty <= 0) e.found = null;
}
function goHome(forced) {
  if (CR.Expedition) CR.Expedition.stop();
  const e = G.exp, s = person(e.sid);
  if (!e.dead && s.alive) {
    depositBag(e.bag, s);
    s.fatigue += 20 + ((e.total || 4) - e.hours) * 4 + (e.travel || 0) * 5;
    if (!e.day && e.hours <= 0 && chance(0.4)) { const h = rnd(8, 20); if (hurt(s, h, 'Caught by the morning patrol.')) { /* dead */ } else say('Dawn', `${s.name} was out too late. A patrol saw them running. They made it, bleeding.`); }
    if (s.alive) log(`${s.name} returned with ${Object.values(e.bag).reduce((a, b) => a + b, 0)} items.`, 'good');
  } else { log(`${s.name} never came back.`, 'bad'); }
  const mins = Math.round(((e.total || 4) - e.hours + (e.travel || 0) * 2 + (e.waited || 0)) * 60);
  G.exp = null; s.out = null; G.dayTrip = false; s.f = 0; s.x = 14; s.up = 0; s.at = null; s.act = null; s.q = [];
  G.screen = alive().length ? 'day' : 'over';
  if (G.screen === 'day') { G.away = true; try { CR.Sim.advance(Math.max(30, mins)); } catch (err) { reportError(err); } G.away = false; }
  flush(); save(); render();
}
/* what the night looks like at the shelter */
function defense() {
  const guards = alive().filter((s) => G.assign[s.id] === 'guard' && s.mood >= 15);
  const w = weaponsOwned(); let d = G.build.barricade * 1.5;
  guards.forEach((g, i) => { d += 1 + (w[i] ? WEAPON[w[i]] : 0) + (hasTrait(g, 'sleeper') ? 1 : 0) - (g.fatigue > 80 ? 0.5 : 0); });
  return d;
}
function resolveNight() {
  alive().forEach((s) => {
    const r = G.assign[s.id];
    if (r === 'sleep') s.fatigue = Math.max(0, s.fatigue - 35 - (G.build.bed ? 12 : 0));
    else if (r === 'guard') s.fatigue += 18;
  });
  let p = Math.min(0.55, 0.1 + G.day * 0.016) - G.build.barricade * 0.07;
  if (G.flags.refused > 0) p += 0.35; if (G.flags.levyPaid > 0) p -= 0.2; if (G.flags.informant > 0) p += 0.2;
  const guards = alive().filter((s) => G.assign[s.id] === 'guard').length;
  const gr = G.flags.groupRaid && G.groups.find((x) => x.id === G.flags.groupRaid && x.alive);
  if (gr && chance(0.85)) { G.flags.groupRaid = 0; raid(guards, gr); }
  else if (chance(clamp(p, 0.04, 0.85))) raid(guards);
  G.flags.refused = Math.max(0, (G.flags.refused || 0) - 1); G.flags.levyPaid = Math.max(0, (G.flags.levyPaid || 0) - 1); G.flags.informant = Math.max(0, (G.flags.informant || 0) - 1);
  flush(dawn);
}
function raid(guards, grp) { try { raid0(guards, grp); } finally { curArt = null; } }
function raid0(guards, grp) {
  sfx('hit'); buzz([60, 40, 120]);
  const bandits = grp ? true : chance(0.6 + G.day * 0.005);
  const str = grp ? clamp(grp.size + rnd(0, 2) + (grp.att === 'predatory' ? 2 : 0), 2, 9) : bandits ? rnd(3, 6) + Math.floor(G.day / 10) : rnd(1, 3);
  const def = defense();
  curArt = grp ? groupArt(grp) : bandits ? { side: true, sp: CR.Sprites.gen(pick(BANDIT_ARCH), rnd(1, 1e6)), kind: 'aim', state: 'ok' } : { sp: CR.Sprites.gen('refugee', rnd(1, 1e6)), state: 'starving' };
  const base = grp ? `You know these voices. ${grp.name} have come for what they think they are owed.` : bandits ? 'Boots on the stairwell. Voices. A torch beam through the planks.' : 'Whispers at the wall. Hands on the barricade. They want what you have.';
  ask(grp ? `${grp.name} attack` : bandits ? 'Raiders' : 'Intruders', `${base}\n\n${guards ? `${guards} awake on guard.` : 'Nobody is awake. Nobody.'}`, [
    { label: 'Fight', fn() {
      const win = def + rnd(-1, 1) >= str;
      const gs = alive().filter((s) => G.assign[s.id] === 'guard');
      if (win) {
        let t = 'They break and run.';
        if (chance(0.5) && gs.length) { const g = pick(gs); hurt(g, rnd(5, 18), 'Fell defending the shelter.'); if (g.alive) t += ` ${g.name} is hurt.`; }
        if ((bandits && chance(grp ? 0.6 : 0.35)) && gs.length) { G.stats.kills++; const g = pick(gs); moral(g, 8); t += ` One of them does not get up. ${g.name} cannot stop shaking.`; }
        if (grp) { grp.size = Math.max(0, grp.size - rnd(1, 2)); if (grp.size <= 0) grp.alive = false; setRel(grp, -15); }
        log('You held the shelter.', 'good'); return t;
      }
      stealSome(0.5);
      alive().forEach((s) => { if (G.assign[s.id] !== 'scav' && chance(0.5)) hurt(s, rnd(10, 35), 'Killed in the raid.'); });
      log('The shelter was overrun.', 'bad'); return 'They push through. It is quick and ugly. They leave with a lot.';
    } },
    { label: 'Hide and let them take', fn() { stealSome(0.3); moodAll(-4); log('You hid while they took things.', 'warn'); return 'Behind the wall, nobody breathes. They take what they find and go.'; } },
    { label: 'Give 3 food or water', off: inv('food') + inv('water') < 3, fn() { let n = 3; ['food', 'water', 'food', 'water'].forEach((k) => { if (n > 0 && inv(k) > 0) { add(k, -1); n--; } }); if (grp) setRel(grp, 10); else G.flags.informant = 2; return 'They take it. They will be back.'; } }
  ]);
}
function stealSome(f) {
  ['food', 'water', 'meds', 'bandage', 'ogogoro', 'parts', 'wood', 'cloth', 'meal'].forEach((k) => { const l = Math.floor(inv(k) * f * R()); if (l > 0) { add(k, -l); G.stats.lost += l; } });
}

/* ---------- dawn ---------- */
function dawn() {
  if (!G || G.screen === 'over') return;
  const lines = [];
  /* hidden thief */
  if (G.thiefId) { const t = person(G.thiefId); if (t && t.alive && chance(0.5)) { stealSome(0.4); t.alive = false; t.gone = true; lines.push(`${t.name} is gone, and so are some supplies.`); G.thiefId = 0; G.stats.left++; moodAll(-3); } }
  /* daily needs */
  alive().forEach((s) => {
    s.hunger = clamp(s.hunger + 20, 0, 100); s.thirst = clamp(s.thirst + 18, 0, 100); s.slots = 2;
    let dm = -1.5;
    if (s.hunger >= 100) { hurt(s, 12, 'Starved.'); dm -= 6; lines.push(`${s.name} is starving.`); } else if (s.hunger > 70) dm -= 3;
    if (s.thirst >= 100) { hurt(s, 18, 'Died of thirst.'); dm -= 6; lines.push(`${s.name} is dying of thirst.`); } else if (s.thirst > 70) dm -= 3;
    if (!s.alive) return;
    if (s.fatigue > 80) dm -= 3;
    if (s.wound) { hurt(s, 6, 'Bled out.'); dm -= 2; if (s.alive && s.hp > 40 && chance(0.3)) { s.wound = false; lines.push(`${s.name}'s wound has stopped bleeding. It will scar.`); } } if (!s.alive) return;
    if (s.sick) { hurt(s, 6, 'Fever took them.'); dm -= 2; s.fatigue += 8; } if (!s.alive) return;
    if (!s.sick && chance(s.thirst > 70 ? 0.18 : 0.06)) { s.sick = true; lines.push(`${s.name} has a fever.`); }
    if (s.hunger < 50 && s.thirst < 50 && s.fatigue < 60 && !s.wound && !s.sick) { dm += 3; s.hp = Math.min(100, s.hp + 6); }
    mood(s, dm);
  });
  /* breakdowns */
  alive().forEach((s) => {
    if (s.mood < 15 && chance(0.3)) {
      s.alive = false; s.gone = true; s.pack = {}; G.stats.left++; moodAll(-8);
      lines.push(s.cid && CR.Life && CR.Life.turnSurvivor(s) ? `${s.name} is gone. Somebody swears they saw them walk toward the Gate Boys' fire.` : `${s.name} left in the dark and did not come back.`);
    }
  });
  if (G.build.bucket && chance(0.2)) { add('water', 1); lines.push('The bucket caught a little rain.'); }
  PO.tick(); CR.World.tick(); ST.tick(); if (CR.Life) CR.Life.tick();
  lines.forEach((l) => log(l, 'bad'));
  G.day++;
  if (G.day % 4 === 0) LOCS.forEach((l) => { if (G.locs[l.id]) G.locs[l.id].rich = Math.min(l.rich[1], G.locs[l.id].rich + 1); });
  if (!alive().length) { G.screen = 'over'; save(); flush(); return; }
  if (G.day >= G.rescueDay) { G.screen = 'end'; save(); render(); return; }
  rollTonight();
  G.screen = 'day'; G.exp = null; if (CR.Cutaway) CR.Cutaway.refresh(G);
  if (!person(G.sel) || !person(G.sel).alive) G.sel = alive()[0].id;
  log(`Day ${G.day}.`);
  const brief = `${pick(MORNING)}${lines.length ? '\n\n' + lines.join('\n') : ''}`;
  say(`Day ${G.day}`, brief);
  /* a survivor's mood speaks */
  const low = alive().filter((s) => tier(s.mood) >= 2); if (low.length) { const s = pick(low); say(s.name, pick(DIARY[tier(s.mood)])); }
  ST.morning();
  flush();
}

/* ---------- encounters (scavenging) ---------- */
function encounter(L, s, force, noPatrol) { try { encounter0(L, s, force, noPatrol); } finally { curArt = null; } }
function encounter0(L, s, force, noPatrol) {
  const e = G.exp; const w = {};
  w.patrol = 2 + L.risk * 0.7 + (G.tonight.danger === L.id ? 2 : 0) + (G.tonight.zone === L.zone ? 0.5 : 0);
  w.rival = 2; w.injured = 1.5; w.collapse = 1.5; w.noisefall = 1;
  if (groupAt(L.id)) w.people = 3.5;
  if (G.flags.cache === L.id) w.cache = 8;
  if (noPatrol) w.patrol = 0;
  if (force === 'people' && !groupAt(L.id)) return;
  const k = force || wpick(w);
  const hide = () => chance(0.5 + (hasTrait(s, 'runner') ? 0.25 : 0) - e.noise * 0.03);
  const loseBag = () => { const ks = Object.keys(e.bag).filter((x) => e.bag[x] > 0); if (ks.length) { const x = pick(ks); const n = Math.ceil(e.bag[x] / 2); e.bag[x] -= n; return ` You drop ${n} ${ITEMS[x][0]} in the dark.`; } return ''; };
  if (k === 'patrol') {
    encPatrol(L, s, e);
  } else if (k === 'rival') {
    encRival(L, s, e);
  } else if (k === 'people') {
    const g = groupAt(L.id); g.met = true; curArt = groupArt(g);
    const k2 = ['food', 'water', 'meds'].filter((x) => g.stock[x] > 0)[0] || 'food';
    const grab = (n) => { const q = Math.min(n, g.stock[k2] || 0, bagCap() - bagUsed()); g.stock[k2] = Math.max(0, (g.stock[k2] || 0) - q); e.bag[k2] = (e.bag[k2] || 0) + q; return q; };
    if (!g.alive) {
      ask('They did not make it', `${g.name} are all here. Nobody has moved in days. The air is thick. Their supplies are still on the shelves.`, [
        { label: 'Take what they left', fn() { G.stats.thefts++; mood(s, hasTrait(s, 'devout') ? -12 : -6); const q = grab(4); return `You take ${q} × ${ITEMS[k2][1]} from their hands, almost. You will remember the smell.`; } },
        { label: 'Back out and close the door', fn() { mood(s, -2); return 'You close it. You do not tell the others.'; } }
      ]);
    } else if (g.att === 'hostile' || g.att === 'predatory') {
      encHostile(g, L, s, e);
    } else {
      ask(`${g.name}`, `${g.size} people on this floor, ${ITEMS[k2][1].toLowerCase()} stacked behind them. They are ${g.att === 'desperate' ? 'thin and shaking' : g.att === 'friendly' ? 'wary but not unfriendly' : 'watching, hands visible'}.`, [
        { label: 'Steal it while they are afraid', fn() { G.stats.thefts++; moral(s, 9); const q = grab(3); setRel(g, -35); if (chance(0.7)) G.flags.groupRaid = g.id; return `You take ${q}. A girl in the corner stares. You will see her again, in dreams.`; } },
        { label: 'Trade something', off: !Object.values(e.bag).some((v) => v > 0) && inv('food') < 1, fn() { const gx = Object.keys(e.bag).find((x) => e.bag[x] > 0); if (gx) e.bag[gx]--; else add('food', -1); const q = grab(2); setRel(g, 8); mood(s, 3); return `A fair swap. ${q} × ${ITEMS[k2][1]}.`; } },
        { label: g.att === 'desperate' ? 'Leave them 2 food' : 'Leave them be', off: g.att === 'desperate' && inv('food') < 2, fn() { if (g.att === 'desperate') { add('food', -2); g.stock.food += 2; setRel(g, 20); G.stats.helped++; mood(s, 4); return 'They stare at the food like it is a hallucination.'; } mood(s, 1); return 'You back out gently.'; } }
      ]);
    }
  } else if (k === 'injured') {
    curArt = { side: true, sp: CR.Sprites.gen(pick(['boy_hoodie', 'girl_braids', 'refugee']), rnd(1, 1e6)), kind: 'sitfloor', state: 'hurt+hungry' };
    ask('A wounded student', 'Someone is slumped against the wall, hand clamped to a bleeding side. They look up. They do not beg.', [
      { label: 'Use a bandage on them', off: inv('bandage') + inv('cloth') < 1, fn() { if (inv('bandage')) add('bandage', -1); else add('cloth', -1); G.stats.helped++; mood(s, 6); log('Helped a stranger.', 'good'); G.grateful.push('A stranger from the clinic'); return 'They grip your wrist. "Thank you." You leave something of yourself there.'; } },
      { label: 'Take their bag', fn() { G.stats.thefts++; moral(s, 8); const k2 = pick(['food', 'water', 'meds']); e.bag[k2] = (e.bag[k2] || 0) + Math.min(2, bagCap() - bagUsed()); return 'They watch you do it. They do not stop you.'; } },
      { label: 'Walk away', fn() { mood(s, -2); return 'You walk. You can feel their eyes.'; } }
    ]);
  } else if (k === 'collapse') {
    say('The floor gives', `Rotten boards, or a falling shelf. ${s.name} goes down hard.`); const d = rnd(5, 22); hurt(s, d, 'Killed in a fall.'); e.msg = 'You limp on.';
  } else if (k === 'noisefall') {
    e.noise += 3; say('Noise', 'Something clatters. The sound carries. Somewhere below, a door opens.');
  } else if (k === 'cache') {
    const k2 = pick(['food', 'meds', 'water', 'parts']); const q = Math.min(rnd(3, 5), bagCap() - bagUsed()); e.bag[k2] = (e.bag[k2] || 0) + q; G.flags.cache = null;
    say('The cache', `Behind a loose panel: exactly what the note said. ${q} × ${ITEMS[k2][1]}.`);
  }
}

/* ---------- rendering ---------- */
/* The page is a fixed shell: HUD, scene, tabs, one panel that scrolls inside itself, and an action bar.
   Nothing here makes the page itself scroll, so the scene is always in view. */
const ui = { day: 'people', night: 'roles' };
const meter = (label, v, bad = true) => { const cls = bad ? (v > 75 ? 'm-bad' : v > 50 ? 'm-warn' : '') : (v < 25 ? 'm-bad' : v < 50 ? 'm-warn' : ''); return `<div class="meter ${cls}"><span>${label}</span><i><b style="width:${v}%"></b></i></div>`; };
const mini = (label, v, bad = true) => { const cls = bad ? (v > 75 ? 'm-bad' : v > 50 ? 'm-warn' : '') : (v < 25 ? 'm-bad' : v < 50 ? 'm-warn' : ''); return `<div class="${cls}"><i><b style="width:${v}%"></b></i><small>${label}</small></div>`; };
function chipsHtml() {
  const order = ['food', 'meal', 'water', 'wood', 'parts', 'cloth', 'meds', 'bandage', 'ogogoro', 'club', 'machete', 'pistol'];
  return `<div class="chips">${order.filter((k) => inv(k) > 0 || ['food', 'water', 'meds'].includes(k)).map((k) => `<span class="chip ${inv(k) ? (inv(k) <= 2 && ['food', 'water'].includes(k) ? 'low' : '') : 'zero'}">${ITEMS[k][0]}${inv(k)}</span>`).join('')}</div>`;
}
const hud = (title, phase) => `<header class="hud"><button class="menubtn" data-a="menu" aria-label="Menu">☰</button><div class="hudt"><b>${title}</b><span class="phase">${phase}</span></div>${chipsHtml()}</header>`;
const navBtn = (cls, icon, label, attrs, dot) => `<button class="navb ${cls || ''}" ${attrs}><i>${icon}</i><span>${label}</span>${dot ? '<em class="dot"></em>' : ''}</button>`;
const shell = (hudH, stageH, navH, panelH, key, cls = '') => `<div class="shell ${cls}">${hudH}<div class="stage">${stageH}</div><div class="panelwrap"><div class="panel-area" data-tab="${key}">${panelH}</div><nav class="nav">${navH}</nav></div></div>`;
/* a page that fails to draw must never freeze the navigation: show the failure in the panel and keep going */
const safe = (fn, label) => { try { return fn(); } catch (err) { reportError(err); return `<div class="panel"><h3>This page could not load</h3><div class="dim" style="font-size:13px">${label}: ${String(err && err.message || err).replace(/</g, '&lt;')}</div></div>`; } };
const btn = (a, label, ok, extra = '') => `<button data-a="${a}" ${extra} ${ok ? '' : dis(whyNot(a, parseData(extra)))}>${label}</button>`;
const tagsOf = (s, st) => `${/starving/.test(st) ? '<span class="tag bad">starving</span>' : /hungry/.test(st) ? '<span class="tag warn">hungry</span>' : ''}${s.sick ? '<span class="tag warn">sick</span>' : ''}${s.wound ? '<span class="tag bad">hurt</span>' : ''}${/tired/.test(st) ? '<span class="tag">tired</span>' : ''}`;

function peopleTab() {
  return alive().map((s) => { const st = stateOf(s); return `<div class="prow ${s.id === G.sel ? 'sel' : ''}" data-a="sel" data-id="${s.id}">
    <div class="pic">${portrait(s, st, 3)}</div>
    <div><div class="nm"><span>${s.name}${tagsOf(s, st)}</span><span>${TIERN[tier(s.mood)]}</span></div>
    <div class="mini">${mini('Hunger', s.hunger)}${mini('Thirst', s.thirst)}${mini('Tired', s.fatigue)}${mini('Health', s.hp, false)}${mini('Mood', s.mood, false)}</div></div>
    <div class="btns2"><button data-a="talk" data-id="${s.id}" ${s.slots > 0 ? '' : dis(s.name + ' is worn out today.')} title="Talk">💬</button><button data-a="notebook" data-id="${s.id}" title="Notebook">📓</button></div></div>`; }).join('');
}
function storesPanel() {
  const n = Math.max(1, alive().length); const rows = [
    ['🍚', 'Food', inv('food'), `${Math.floor(inv('food') * 3 / n)} days if cooked · ${Math.floor(inv('food') * 0.9 / n)} raw`],
    ['🍲', 'Cooked meals', inv('meal'), 'eat them today'],
    ['💧', 'Water', inv('water'), `${Math.floor(inv('water') * 2.5 / n)} days`],
    ['🪵', 'Wood', inv('wood'), 'fires, building, clubs'], ['⚙️', 'Scrap', inv('parts'), 'building, weapons, radio'], ['🧵', 'Cloth', inv('cloth'), 'bandages, beds, a rain bucket'],
    ['💊', 'Medicine', inv('meds'), 'cures a fever'], ['🩹', 'Bandages', inv('bandage'), 'closes a wound'], ['🍶', 'Ogogoro', inv('ogogoro'), 'lifts a mood, trades well']
  ].filter((r) => r[2] > 0 || ['Food', 'Water', 'Medicine'].includes(r[1]));
  return `<div class="panel"><h3>Cupboard <span class="dim" style="font-size:13px">${stashCount()}/${stashCap()} · feeds ${n} ${n === 1 ? 'person' : 'people'}</span></h3>${rows.map((r) => `<div class="srow2"><span>${r[0]} ${r[1]}</span><b>${r[2]}</b><span class="dim">${r[3]}</span></div>`).join('')}</div>`;
}
function jbtn(label, job, s) { const w = SIM.why(job, s); const d = job.k === 'cook' ? '' : ` data-b="${job.id}"`; return `<button data-a="simjob" data-k="${job.k}"${d} ${w ? dis(w) : ''}>${label}</button>`; }
const costS = (c) => costText(c);
function workTab(s) {
  const uses = ['food', 'meal', 'water', 'meds', 'bandage', 'ogogoro'].map((k) => btn('use', `${ITEMS[k][0]} ${k === 'meds' ? 'Treat sickness' : k === 'bandage' ? 'Treat wound' : k === 'food' ? 'Eat raw (weak, risky)' : k === 'meal' ? 'Eat a cooked meal' : ITEMS[k][1]}`, (inv(k) > 0 || (s.pack && s.pack[k] > 0)) && !(k === 'meds' && !s.sick) && !(k === 'bandage' && !s.wound), `data-i="${k}"`)).join('');
  const tasks = [jbtn(`Cook a pot (${ITEMS.food[0]}×4 + ${ITEMS.wood[0]}) · 40 min`, { k: 'cook' }, s)].concat(Object.entries(SIM.CRAFTS).map(([id, c]) => jbtn(`${c.name} (${costS(c.cost)}) · ${c.min} min`, { k: 'craft', id }, s))).join('');
  const builds = Object.entries(SIM.BUILDS).filter(([, d]) => d.can(G.build)).map(([id, d]) => jbtn(`${d.name} ${costS(d.cost)} · ${Math.round(d.min / 6) / 10} h`, { k: 'build', id }, s)).join('');
  const bq = (G.bq || []).map((q) => `<div class="dim">${SIM.BUILDS[q.id].name}: ${Math.round(100 * q.prog / Math.max(1, q.need))}%${q.who && person(q.who) ? ' · ' + person(q.who).name : ''}</div>`).join('');
  const wb = (w, ic, label) => `<button class="wbtn" data-a="wheel" data-w="${w}"><span class="wbi">${ic}</span>${label}</button>`;
  return `${storesPanel()}<div class="wrow">${wb('stock', '🎒', 'Cupboard')}${wb('craft', '🛠', 'Make')}${wb('cook', '🍲', 'Cook')}${wb('build', '🏠', 'Build')}</div><div class="sub">${s.name} · ${s.out ? 'away' : s.act ? s.act.label : 'free'} · carries ${packCount(s)}/${packCap(s)}</div>
    <div class="sub">Use now</div><div class="row">${uses}</div>${bq ? '<div class="sub">In progress</div>' + bq : ''}`;
}
function facRows() {
  return (G.fac || []).map((f) => `<div class="frow ${f.status === 'active' ? '' : 'gone'}"><span>${f.met ? f.name : 'Unknown group'}<br><small>${LOCBY[f.loc].name}</small></span><span style="text-align:right">${f.status !== 'active' ? 'gone' : f.met ? PO.stance(f) : 'unknown'}<br><small>${f.met && f.status === 'active' ? '~' + PO.size(f) + ' people' : ''}</small></span></div>`).join('');
}
function newsPanel() {
  const n = (G.newsLog || [])[0]; if (!n) return '';
  return `<div class="news"><b>${G.build.radio ? '📻' : '📜'} Day ${n.d}</b> ${n.t}</div>`;
}
function rescueLine() { const w = G.rescueWin; if (!w) return ''; return `<div class="news" style="border-left-color:var(--orange)">⏳ ${G.day >= w[0] ? 'Soldiers could arrive <b>any day now</b>. Hold on.' : `Soldiers expected between <b>Day ${w[0]} and Day ${w[1]}</b>.`}</div>`; }
function worldTab(s) {
  const dip = `<div class="row" style="margin:0 0 8px"><button class="primary" style="flex:1" data-a="diplo" ${canTask(s) ? '' : dis(whyNot('diplo', {}))}>🏛 Send ${s.name} to the other groups</button></div>`;
  if (!G.build.radio) return `${rescueLine()}<div class="panel"><h3>Beyond your walls</h3><div class="dim">You have no radio. What you know of the campus is what the window shows and what visitors tell you. Build a radio to hear the rest.</div></div>${dip}`;
  return `${rescueLine()}${newsPanel()}${dip}${zonePanel()}<div class="sub">The groups</div>${facRows()}`;
}
function notesTab(s) {
  const rows = alive().filter((o) => o.id !== s.id).map((o) => { const r = ST.rel(s, o); const w = r.love >= 2 ? '❤ together' : r.love >= 1 ? '❤ something between them' : r.fond > 60 ? 'very close' : r.fond > 30 ? 'friends' : r.fond > 10 ? 'friendly' : r.fond < -10 ? 'cold' : 'acquaintances'; return `<div class="dim">${o.name}: ${w}${r.tension > 50 ? ' · strained' : ''}</div>`; }).join('');
  return `${rescueLine()}<div class="panel"><h3>${s.name}</h3><div class="dim">${ST.describe(s)}</div><div class="dim" style="margin-top:4px">Trust in you ${Math.round(s.trust || 0)}/100 · ${TRAITS[s.trait][0]}: ${TRAITS[s.trait][1]}</div>
    ${(s.known || []).length ? '<div class="sub">What you know</div>' + s.known.map((k) => `<div class="dim">• ${k}</div>`).join('') : '<div class="dim" style="margin-top:6px">You do not know them well yet. Talk to them.</div>'}${rows ? '<div class="sub">With the others</div>' + rows : ''}</div>
    ${CR.Life ? CR.Life.notes() : ''}${CR.Lore ? CR.Lore.panel(G.day) : ''}<div class="sub">Lately</div><div class="log">${G.log.slice(0, 10).map((l) => `<div class="${l.c}">${l.t}</div>`).join('')}</div>`;
}
function renderDayOld() {
  const s = person(G.sel) || alive()[0]; if (s && G.sel !== s.id) G.sel = s.id;
  const tab = ['people', 'work', 'world', 'notes'].includes(ui.day) ? ui.day : 'people';
  const panel = safe({ people: peopleTab, work: () => workTab(s), world: () => worldTab(s), notes: () => notesTab(s) }[tab], tab);
  const t = (id, icon, label, dot) => navBtn(tab === id ? 'on' : '', icon, label, `data-a="tab" data-k="day" data-t="${id}"`, dot);
  const nav = t('people', '👥', 'Group') + t('work', '🎒', 'Items') + t('world', '🌍', 'World', (G.envoys || []).length) + t('notes', '📓', 'Journal') + navBtn('night', '🌙', 'Night', 'data-a="night"');
  return shell(hud(`Day ${G.day}`, `${LOCBY[G.shelter].name} · ${G.floors} floors`), '<div id="cutaway"></div>', nav, panel, 'day:' + tab, 'tall');
}
function renderNight() {
  const trip = !!G.dayTrip; const sc = alive().find((s) => G.assign[s.id] === 'scav'); const tab = trip ? 'where' : (sc ? ui.night : 'roles');
  const roles = `<p class="dim" style="margin-bottom:8px;font-size:13px">Defense ${defense().toFixed(1)}. Sleepers recover. Guards watch the barricade. One may go out.</p>` + alive().map((s) => `<div class="nrow"><span><b>${s.name}</b> <span class="dim" style="font-size:12px">tired ${Math.round(s.fatigue)}</span></span><span class="row" style="margin:0">${['sleep', 'guard', 'scav'].map((r) => `<button class="${G.assign[s.id] === r ? 'on' : ''}" data-a="role" data-id="${s.id}" data-r="${r}" ${r === 'scav' && (s.hp < 25 || s.mood < 15) ? dis(s.hp < 25 ? s.name + ' is too hurt to go out.' : s.name + ' is too broken to go out tonight.') : ''}>${r === 'sleep' ? 'Sleep' : r === 'guard' ? 'Guard' : 'Go out'}</button>`).join('')}</span></div>`).join('');
  const sz = LOCBY[G.shelter].zone, pz = G.pickZone || sz;
  const zoneBtns = Object.entries(CAMPUS.ZONES).map(([k, z]) => `<button class="${pz === k ? 'on' : ''}" data-a="zone" data-id="${k}">${z.short} <span class="dim">${CAMPUS.DIST[sz][k]}h</span>${G.tonight.zone === k ? ' <span class="tag bad">patrols</span>' : ''}</button>`).join('');
  const locList = LOCS.filter((l) => l.zone === pz && l.id !== G.shelter).map((l) => `<button class="${G.pickLoc === l.id ? 'on' : ''}" data-a="loc" data-id="${l.id}"><b>${l.name}</b> <span class="risk">${'●'.repeat(l.risk)}</span>${G.tonight.danger === l.id ? ' <span class="tag bad">patrols ' + (trip ? 'today' : 'tonight') + '</span>' : ''}${G.flags.cache === l.id ? ' <span class="tag warn">cache?</span>' : ''}${G.locs[l.id].rich <= 0 ? ' <span class="tag">picked clean</span>' : ''}${groupAt(l.id) && groupAt(l.id).met ? ` <span class="tag">${groupAt(l.id).alive ? ATTN[groupAt(l.id).att] : 'silent'}</span>` : ''}</button>`).join('');
  const warn = trip ? `<div class="news" style="border-left-color:var(--bad)">⚠ Bandits patrol openly in daylight. Expect more patrols and less cover. The night is darker, but no safer.</div>` : '';
  const where = sc ? `${warn}<h3>Where is ${sc.name} going?</h3><p class="dim" style="font-size:13px;margin:2px 0 6px">From ${LOCBY[G.shelter].name}. Walking eats ${trip ? 'daylight' : 'night'}-hours: ${CAMPUS.DIST[sz][pz]}h to ${CAMPUS.ZONES[pz].name}.</p><div class="row">${zoneBtns}</div><div class="locs">${locList}</div>` : '<p class="dim">Choose someone to go out in the Roles tab.</p>';
  const goAttr = `data-a="begin" ${sc && !G.pickLoc ? dis('Choose where ' + sc.name + ' is going first.') : ''}`;
  const nav = trip ? navBtn('', '←', 'Back', 'data-a="back"') + navBtn('go', '🚪', 'Go out', goAttr)
    : navBtn(tab === 'roles' ? 'on' : '', '🛏', 'Roles', 'data-a="tab" data-k="night" data-t="roles"') + navBtn(tab === 'where' ? 'on' : '', '🗺', 'Where', 'data-a="tab" data-k="night" data-t="where"', sc && !G.pickLoc) + navBtn('', '←', 'Back', 'data-a="back"') + navBtn('go', '🌙', sc ? 'Go out' : 'Hold night', goAttr);
  const stage = memoize('qd' + G.day, () => CR.Scenes.quad({ seed: G.day }));
  return shell(hud(trip ? 'Leaving the shelter' : `Night ${G.day}`, trip ? 'Daylight · bandits are out' : 'Nightfall'), stage, nav, safe(() => (tab === 'roles' ? roles : where), tab), 'night:' + tab, 'wide');
}
function renderExp() {
  const e = G.exp, L = LOCBY[e.loc], s = person(e.sid);
  const bag = Object.entries(e.bag).filter(([, v]) => v > 0).map(([k, v]) => `<button data-a="drop" data-i="${k}" title="drop one">${ITEMS[k][0]} ${v}</button>`).join('') || '<span class="dim">Empty</span>';
  const f = e.found;
  const panel = `<div class="panel story">${e.msg}</div><div class="panel"><b>Bag ${bagUsed()}/${bagCap()}</b> <span class="dim">(tap to drop one)</span><div class="bag">${bag}</div>${f ? `<div class="sub">Found</div><div class="row"><button class="primary" data-a="take" data-n="99">Take ${f.qty} × ${ITEMS[f.item][1]}</button><button data-a="take" data-n="1">Take 1</button><button data-a="take" data-n="0">Leave</button></div>` : ''}</div><div class="dim" style="font-size:13px">Health ${Math.round(s.hp)} · Noise ${e.noise} · ${e.hours} search${e.hours === 1 ? '' : 'es'} left</div><div class="dim" style="font-size:13px;margin-top:6px">Tap to walk. Tap glowing spots to search. Tap a wardrobe to hide. Stay out of the pale cones. Stairs go up and down. The green door is home.</div>`;
  const nav = navBtn('go', '🏠', e.hours <= 0 ? 'Run home' : 'Head home', 'data-a="home"');
  return shell(hud(L.name, `${s.name} · ${e.day ? Math.ceil(e.hours) + ' hr of daylight left' : Math.ceil(e.hours) + ' hr until dawn'}`), '<div id="xstage"></div>', nav, panel, 'exp', 'tall');
}

/* ---------- how it ended ---------- */
const ENDINGS = {
  chidera: { good: 'Chidera opened a two-bed clinic in Enugu within three years. Above the door: her father\'s name.', mid: 'Chidera finished her degree and kept the notebook. She still writes the names.', bad: 'Chidera left nursing. She says she cannot hold another hand while it goes cold.' },
  tunde: { good: 'Tunde became the lawyer who asks the first question: are you safe? He found his mother.', mid: 'Tunde passed the bar. He keeps a ledger of every promise he made in the dark.', bad: 'Tunde took a job with the same kind of men as his father. He tells himself it is temporary.' },
  bashir: { good: 'Bashir hosts a morning show. Every Friday he reads one name from the hostel, live. His mother got her dialysis.', mid: 'Bashir makes people laugh on the radio, and sleeps with the lights on.', bad: 'Bashir has not spoken on air since. The jokes stopped, and nobody noticed the silence.' },
  amina: { good: 'Amina posted her application from the first post office that opened. Edinburgh said yes.', mid: 'Amina practises pharmacy in Kano and reads every label twice. The engagement is still unsettled.', bad: 'Amina married the man she met twice. She keeps the folder in a drawer.' },
  emeka: { good: 'Emeka built a radio network for a hundred villages. He sent the retired teacher everything he owed her.', mid: 'Emeka got his visa and left. The radio he built in the hostel still works.', bad: 'Emeka cannot fix what is broken. He tries every night.' },
  ngozi: { good: 'Ngozi\'s brand has a shop in Surulere with her mother\'s name on the sign.', mid: 'Ngozi sells wigs from a stall and counts every naira twice. She laughs a little less loud.', bad: 'Ngozi left Lagos. She told nobody where.' },
  segun: { good: 'Segun leads a small church with a leaking roof. He preaches about doubt, and the pews are full.', mid: 'Segun still leads the songs. He says the words are enough for now.', bad: 'Segun stopped going to church. His father came to find him, and neither of them spoke.' },
  hauwa: { good: 'Hauwa sits in a legislature, in a room with a window. When men look away, she waits.', mid: 'Hauwa trains community watch groups in Maiduguri. Never tell a stranger your name.', bad: 'Hauwa never sleeps in a room with a door she cannot reach.' },
  obinna: { good: 'Obinna coaches boys on a dusty pitch in Nnewi. He told his father he was proud of him first.', mid: 'Obinna plays five-a-side on Saturdays and tells the story of the stairs to no one.', bad: 'Obinna does not run anymore. He stands very still when it is loud.' },
  funke: { good: 'Funke has a daughter. She named her for the night you stayed beside her.', mid: 'Funke cooks for a church kitchen. Kunle sends money. They speak, sometimes.', bad: 'Funke lost the baby in the second week. She still cooks, enough for one more than there is.' },
  dan: { good: 'Dan cleared his debt and found work with his hands. He deals cards only for fun.', mid: 'Dan is clean, mostly. He checks the door twice.', bad: 'Dan is still a name on somebody\'s list.' },
  ada: { good: 'Mama Ada opened a small canteen in Awka. All three of her children came to the opening.', mid: 'Mama Ada cooks for forty students again. She still counts, every night, from habit.', bad: 'Mama Ada never got the injections she needed. Her canteen is a locked room now.' },
  bello: { good: 'Mr. Bello took his grandsons fishing. The younger one fell asleep on his shoulder.', mid: 'Mr. Bello keeps a gate again. He still checks it twice.', bad: 'Mr. Bello keeps his boots by the door every night, ready.' },
  grace: { good: 'Dr. Grace wrote the plan for the relief effort. Chike came home.', mid: 'Dr. Grace returned to teaching. She marks harder now, and forgives faster.', bad: 'Dr. Grace keeps a list of everyone she could not help. It is longer now.' }
};
function endLine(s) {
  const level = (s.trust >= 50 && s.mood >= 40) ? 'good' : (s.mood < 30 ? 'bad' : 'mid'); const t = ENDINGS[s.cid]; if (t) return t[level];
  return { good: `${ST.first(s)} stayed close afterwards. The letters still come.`, mid: `${ST.first(s)} went home. You hear from them at Christmas.`, bad: `${ST.first(s)} does not talk about the siege.` }[level];
}
function epilogue(rescued) {
  const out = []; const dead = G.dead || [];
  out.push(`<h2>The people</h2>` + G.S.map((s) => {
    let line; const d = dead.find((x) => x.cid === s.cid);
    if (s.alive) line = endLine(s); else if (d) line = `${ST.first(s)} died on day ${d.day}. ${alive().length ? ST.first(alive()[0]) + ' still says the name.' : ''}`; else line = `${ST.first(s)} walked into the dark and was not seen again.`;
    return `<div class="person"><div class="pic">${CR.Sprites.render(s.sp, s.alive ? 'blink' : 'blink', { scale: 3, state: s.alive ? stateOf(s) : 'dead' })}</div><div><b>${s.name}</b><div class="story" style="font-size:14px">${line}</div></div></div>`;
  }).join(''));
  const couples = []; const seen = new Set(); G.S.forEach((a) => G.S.forEach((b) => { if (a.id < b.id) { const r = ST.rel(a, b); if (r.love >= 1 && !seen.has(a.id + b.id)) { seen.add(a.id + b.id); couples.push(a.alive && b.alive ? `${a.name} and ${b.name} stayed together.` : `${a.name} and ${b.name} found each other here, and one of them did not get to leave.`); } } }));
  if (couples.length) out.push(`<h2>Love</h2>` + couples.map((c) => `<div class="story" style="font-size:14px">${c}</div>`).join(''));
  const zl = Object.values(G.zones || {}).map((z) => { const h = z.holder ? PO.fac(z.holder) : null; return `<div class="story" style="font-size:14px">${z.name}: ${h ? h.name : 'abandoned'}.</div>`; }).join('');
  const gl = (G.fac || []).map((f) => `<div class="story" style="font-size:14px">${f.name}: ${f.status !== 'active' ? 'gone. The rooms stand open.' : `${f.members.length} named survivors, about ${PO.size(f)} in all. ${f.p >= 25 ? 'They count you a friend.' : f.p <= -25 ? 'They remember you as an enemy.' : 'They hardly know your name.'}`}</div>`).join('');
  out.push(`<h2>The campus</h2>${zl}<div class="sub" style="margin-top:10px">The groups</div>${gl}`);
  const r = G.rep || {}; const tags = []; if (r.honor >= 4) tags.push('someone who keeps their word'); if (r.honor <= -3) tags.push('someone who breaks it'); if (r.fear >= 4) tags.push('someone to be afraid of'); if (r.wealth >= 6) tags.push('a good trader');
  const owed = (G.ledger || []).filter((l) => l.status === 'default').length;
  out.push(`<h2>What they will say about you</h2><div class="story" style="font-size:14px">${tags.length ? 'You are remembered as ' + tags.join(', and ') + '.' : 'You are remembered as someone who was there.'}${owed ? ` ${owed} debt${owed > 1 ? 's' : ''} to you went unpaid.` : ''}</div>`);
  return out.join('');
}
function renderEnd() {
  const mor = G.stats.thefts + G.stats.kills * 2 - G.stats.helped;
  const verdict = mor <= -2 ? 'You stayed human. It cost you.' : mor <= 3 ? 'You did what you had to. Most of it you can live with.' : 'You survived. Some of what you did you will carry for the rest of your life.';
  return `<div class="fullpage"><div class="endwrap"><div class="title" style="margin:0"><h1 style="font-size:34px;letter-spacing:.2em">DAY ${G.day}</h1><div class="loc" style="margin-bottom:12px">Soldiers reach the campus</div></div>
  <div class="story">The sound of engines. Then voices that sound like they are in charge. After ${G.day} days, it is over.</div>${epilogue(true)}
  <div class="sub" style="margin-top:14px">Stolen from others ${G.stats.thefts} · Killed ${G.stats.kills} · Helped ${G.stats.helped} · Turned away ${G.stats.refused}</div><div class="story" style="margin:8px 0 16px"><i>${verdict}</i></div>
  <div class="btns" style="display:flex;gap:8px"><button class="primary" style="flex:1" data-a="new">Play again</button></div><div style="height:20px"></div></div></div>`;
}
function renderOver() {
  const fallen = (G.dead || []).map((d) => `<div class="story" style="font-size:14px">${d.name}, day ${d.day}.</div>`).join('');
  return `<div class="fullpage"><div class="endwrap"><div class="title" style="margin:0"><h1 style="font-size:34px;letter-spacing:.2em">NO ONE LEFT</h1><div class="loc">Day ${G.day}</div></div>
  <div class="story">The shelter is quiet. Nobody found it for a long time.</div><h2>Those who were here</h2>${fallen}${epilogue(false).split('<h2>The campus</h2>')[1] ? '<h2>The campus</h2>' + epilogue(false).split('<h2>The campus</h2>')[1] : ''}
  <div class="btns" style="display:flex;gap:8px;margin-top:16px"><button class="primary" style="flex:1" data-a="new">Try again</button></div><div style="height:20px"></div></div></div>`;
}
function renderTitle() {
  const has = (() => { try { return !!localStorage.getItem('crisis_save'); } catch (e) { return false; } })();
  return `<div class="fullpage"><div class="title"><div class="crest">${CR.Scenes.logo(5)}</div><h1>CRISIS</h1><div class="loc">Veritas University</div>
  <div class="btns"><button class="primary" data-a="new">New game</button>${has ? '<button class="primary" style="background:var(--vgreen);border-color:var(--vgreen);color:#fff" data-a="resume">Continue</button>' : ''}<button data-a="howto">How to play</button><button data-a="settings">Settings</button><button data-a="about">About</button></div>
  <div class="note">A work of fiction. Characters, events and the siege are imagined and are not based on real events at the real institution.</div></div></div>`;
}
/* the sheet opens exactly over the panel area, so the scene stays in view */
function placeModal() {
  const el = $('#modal'); if (!el || !el.style) return;
  const app = (typeof document !== 'undefined' && document.querySelector) ? document.querySelector('#app') : null;
  const pw = (typeof document !== 'undefined' && document.querySelector) ? document.querySelector('.panelwrap') : null;
  if (pw && pw.getBoundingClientRect) { const r = pw.getBoundingClientRect(); el.classList.remove('full'); el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.width = r.width + 'px'; el.style.height = r.height + 'px'; }
  else { el.classList.add('full'); el.style.left = '0'; el.style.top = '0'; el.style.width = '100%'; el.style.height = '100%'; }
}
if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('resize', placeModal);
function render() {
  try { render0(); } catch (err) {
    reportError(err); const app = $('#app'); if (!app) return;
    app.innerHTML = `<div class="fullpage"><div class="endwrap"><h2>Something went wrong</h2><div class="story dim" style="font-size:13px">${String(err && err.message || err).replace(/</g, '&lt;')}</div><div class="btns" style="display:flex;gap:8px;margin-top:14px"><button class="primary" style="flex:1" data-a="recover">Go back to the shelter</button></div></div></div>`;
  }
}
function render0() {
  const app = $('#app'); if (!app) return;
  const prev = app.querySelector ? app.querySelector('.panel-area') : null; const prevKey = prev && prev.dataset ? prev.dataset.tab : null; const prevTop = prev ? prev.scrollTop : 0;
  if (!G) { app.innerHTML = renderTitle(); placeModal(); try { if (CR.Audio) CR.Audio.mood('title'); } catch (e) {} return; }
  const f = { day: renderDay, night: renderDay, exp: renderExp, end: renderEnd, over: renderOver }[G.screen] || renderDay;
  if (G.screen === 'night') G.screen = 'day';
  app.innerHTML = f();
  if (G.screen === 'day') mountHouse();
  if (G.screen === 'exp') mountExp(); else if (CR.Expedition) CR.Expedition.stop();
  if (CR.Tutorial) CR.Tutorial.place();
  const cur = app.querySelector ? app.querySelector('.panel-area') : null; if (cur && cur.dataset && cur.dataset.tab === prevKey) cur.scrollTop = prevTop;
  placeModal(); if (CR.UI) CR.UI.soon();
  try { if (CR.Audio) CR.Audio.mood(G.screen); } catch (e) {}
}
document.addEventListener('click', (e) => {
  const dz = e.target.closest('[aria-disabled="true"]'); if (dz && dz.dataset.a) { toastWhy(dz.dataset.why); return; }
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; const a = b.dataset.a;
  try { if (CR.Audio) CR.Audio.start(); } catch (x) {}
  if (CR.Menu && (a === 'menu' || a === 'howto' || a === 'settings' || a === 'about')) { CR.Menu.open(a === 'menu' ? 'pause' : a, { from: a === 'menu' ? null : (G ? 'pause' : 'close') }); return; }
  if (a === 'resume') { sfx('tap'); if (load()) render(); else render(); return; }
  if (!G && a !== 'new') return;
  if (modalOpen) { const me = $('#modal'); if (me && me.classList.contains('hidden') && !Q.length) modalOpen = false; else if (G && G.screen !== 'over') return; }
  sfx('tap'); act(a, b.dataset);
});

/* ---------- the tap-to-move shelter: what each object does, and how people carry themselves ---------- */
function poseFor(s) {
  const st = stateOf(s), h = hashN(s.id * 7 + G.day * 3);
  if (s.hp < 35 || (s.sick && s.hp < 60) || (/starving/.test(st) && s.hp < 50) || s.fatigue >= 72) return 'sleep';
  if (s.trait === 'devout' && s.mood < 65 && h % 3 === 0) return 'pray';
  if (s.mood < 30) return 'sitfloor';
  return ['idle', 'sit', 'idle', 'sitfloor', 'sit'][h % 5];
}
function barkFor(sid) {
  const s = person(sid); if (!s || !s.alive) return ''; const c = ST.cd(s); if (!c) return '';
  const st = stateOf(s); let cat = 'idle';
  if (/starving|hungry/.test(st)) cat = 'hungry'; else if (/sick|hurt/.test(st)) cat = 'scared'; else if (s.mood < 35) cat = 'grief'; else if (s.mood > 75) cat = 'happy'; else if (chance(0.2)) cat = 'night';
  const arr = (c.barks && (c.barks[cat] || c.barks.idle)) || []; if (!arr.length) return '';
  return `<b>${ST.first(s)}</b> ${ST.voiced(s, pick(arr))}`;
}
function openWork(s) {
  const t = canTask(s); const ch = [];
  const add2 = (label, ok, fn) => ch.push({ label, off: !ok, fn() { fn(); return ''; } });
  add2('Cook a pot (up to 4 food + 1 wood)', t && G.build.stove && inv('food') && inv('wood'), () => act('cook', {}));
  add2('Make a bandage (2 cloth)', t && inv('cloth') >= 2, () => act('bandage', {}));
  add2('Make a club (2 wood)', t && inv('wood') >= 2, () => act('club', {}));
  add2('Make a machete (2 scrap + wood)', t && inv('parts') >= 2 && inv('wood'), () => act('machete', {}));
  add2('Brew ogogoro (2 food)', t && G.build.still && inv('food') >= 2, () => act('brew', {}));
  Object.entries(BUILDS).forEach(([k, B2]) => { const full = G.build[k] >= B2.max; if (!full) add2(`Build: ${B2.n} (${costText(B2.cost())})`, t && canPay(B2.cost()), () => act('build', { b: k })); });
  ch.push({ label: 'Leave it' });
  ask('The work table', `<i>${s.name} stands at the table. What needs doing?</i>`, ch, { sp: s.sp, state: stateOf(s) });
}
function lookOut(s) {
  const d = LOCBY[G.tonight.danger]; const z = Object.values(G.zones || {}).filter((q) => q.holder && PO.fac(q.holder) && PO.fac(q.holder).met).map((q) => `${q.name}: ${PO.fac(q.holder).name} (${q.tension > 60 ? 'on the brink' : q.tension > 35 ? 'tense' : 'quiet'})`);
  say('From the window', `<i>${pick(MORNING)}</i>\n\nYou watch the dark lines of the campus. Tonight, torchlight moves near <b>${d.name}</b>: patrols, most likely.${z.length ? '\n\n' + z.join('\n') : ''}`, { sp: s.sp, state: stateOf(s) });
}
function startDayTrip(s) { G.dayTrip = true; G.screen = 'night'; G.assign = {}; alive().forEach((x) => { G.assign[x.id] = x.id === s.id ? 'scav' : 'sleep'; }); G.pickZone = LOCBY[G.shelter].zone; G.pickLoc = null; ui.night = 'where'; }
function useObject(obj, sid) {
  const s = person(sid); if (!s || !s.alive) return; G.sel = sid; if (CR.Tutorial) CR.Tutorial.notify('object');
  switch (obj) {
    case 'bed': if (s.slots > 0) { s.slots--; s.fatigue = Math.max(0, s.fatigue - 28); mood(s, 2); log(`${s.name} rested.`); } else say(s.name, `<i>${ST.first(s)} cannot rest; there is too much to do.</i>`); break;
    case 'stove': if (!G.build.stove) say('No stove', '<i>You have not built a stove yet. The work table can make one.</i>'); else act('cook', {}); break;
    case 'table': openWork(s); break;
    case 'radio':
      sfx('radio');
      if (!G.build.radio) say('No radio', '<i>Nobody has built a radio yet.</i>');
      else if (s.slots > 0) { s.slots--; const b = CR.World.bulletin('radio'); G.newsLog = G.newsLog || []; G.newsLog.unshift({ d: G.day, t: b.text }); G.newsLog.length = Math.min(G.newsLog.length, 6); say('On the radio', `<i>${ST.first(s)} turns the dial through the static.</i>\n\n“${b.text}”`); }
      else say(s.name, '<i>Too tired to listen.</i>');
      break;
    case 'window': lookOut(s); break;
    case 'cupboard': invMenu(s); break;
    case 'door': {
      const bad = s.hp < 25 || s.mood < 15 || s.slots < 1;
      ask('The door', `<i>${pick(['Voices outside, then none.', 'A boot on gravel, slow.', 'Somewhere nearby a door slams, and nobody answers it.'])}</i>\n\n⚠ <b>Bandits are out on the campus in daylight.</b> Going out now is dangerous: more patrols, less cover. Night is no safer, only darker.`, [
        { label: `Go out now (${s.name})`, off: bad, why: s.slots < 1 ? `${s.name} has no tasks left today.` : `${s.name} is in no state to go out.`, fn() { startDayTrip(s); return ''; } },
        { label: 'Wait inside' }], { sp: s.sp, state: stateOf(s) }); break;
    }
    case 'mat': if (hasTrait(s, 'devout')) act('pray', {}); else { mood(s, 1); say(s.name, `<i>${ST.first(s)} sits on the mat a while, and breathes.</i>`); } break;
  }
  flush(); save(); render();
}
function mountCutaway() {
  const el = $('#cutaway'); if (el && typeof el.appendChild === 'function' && CR.Cutaway) CR.Cutaway.attach(el, G);
}

/* ---------- menus, settings, saving ---------- */
if (CR.Menu) CR.Menu.hooks = {
  info: () => (G ? { day: G.day, place: LOCBY[G.shelter].name, alive: alive().length } : null),
  hasGame: () => !!G && G.screen !== 'end' && G.screen !== 'over',
  save: () => { if (G) save(); },
  restart: () => { newGame(); },
  quit: () => { if (G) save(); G = null; Q.length = 0; modalOpen = false; const m = $('#modal'); if (m) m.classList.add('hidden'); if (CR.Cutaway) CR.Cutaway.reset(); render(); },
  hasSave: () => { try { return !!localStorage.getItem('crisis_save'); } catch (e) { return false; } },
  deleteSave: () => { try { localStorage.removeItem('crisis_save'); } catch (e) {} },
  onPause: (p) => { try { if (CR.Audio && CR.Audio.ctx) { if (p) CR.Audio.ctx.suspend(); else CR.Audio.ctx.resume(); } } catch (e) {} }
};
if (CR.Settings) { CR.Settings.load(); CR.Settings.onChange = (k) => { if (['master', 'music', 'sfx', 'sound', 'haptics', 'tutorialSeen'].includes(k)) return; memoMap.clear(); portraitCache.clear(); if (typeof document !== 'undefined' && document.querySelector && !document.querySelector('#menu.hidden')) { /* menu open: the page redraws behind it */ } render(); }; }
if (typeof window !== 'undefined' && window.addEventListener) { window.addEventListener('pagehide', () => { if (G) save(); }); }
if (typeof document !== 'undefined' && document.addEventListener) { document.addEventListener('visibilitychange', () => { if (document.hidden && G) save(); }); }

/* ---------- host: the tools the story, politics and voice modules use ---------- */
const host = {
  get G() { return G; }, alive, person, log, add, inv, mood, moodAll, hurt, kill, say, ask, flush, stateOf, stealSome, joinNamed
};
host.knock = knockRun;
CR.Story.host = host;
if (CR.Expedition) CR.Expedition.hooks = { holeUp: () => holeUpSheet(), modalOpen: () => modalOpen, search: (i) => spotSearch(i), spotted: () => forceEnc('patrol'), meet: (k) => forceEnc(k), stateNow: () => (G.exp ? stateOf(person(G.exp.sid)) : 'ok'),
  exit: () => { const s = person(G.exp.sid); ask('Head home?', '<i>Whatever you are carrying goes back to the shelter with you.</i>', [{ label: 'Head home', fn() { flush(() => goHome()); return ''; } }, { label: 'Stay a little longer' }], { sp: s.sp, state: stateOf(s) }); flush(); } };
if (CR.Cutaway) CR.Cutaway.hooks = { G: () => G, person: (id) => person(id), stateOf, poseFor, selected: () => G.sel, select: (id) => { G.sel = id; if (CR.Tutorial) CR.Tutorial.notify('select'); render(); }, use: useObject, talk: (tid, sid) => { G.sel = sid; act('talk', { id: tid }); }, talkMenu: (tid) => { act('talk', { id: tid }); }, bark: barkFor, modalOpen: () => modalOpen, notify: (n) => { if (CR.Tutorial) CR.Tutorial.notify(n); }, egg: () => { if (CR.Life) CR.Life.egg(); } };
[['beg', 'visitor', 3, evBeg], ['trade', 'visitor', 2, evTrade], ['levy', 'politics', 1.6, evLevy, () => G.day >= 3], ['gun', 'camp', 1.2, evGunfire], ['rain', 'camp', 1.2, evRain], ['body', 'horror', 1.1, evBody], ['note', 'camp', 0.8, evNote, () => !G.flags.cache], ['grate', 'camp', 5, evGrateful, () => G.grateful.length], ['scream', 'horror', 1.1, evScreams]].forEach(([id, kind, w, fn, when]) => {
  ST.add({ id: 'legacy_' + id, kind, door: ['beg', 'trade', 'levy'].includes(id), w, cd: 4, when: when ? () => when() : undefined, run() { fn(); curArt = null; } });
});

/* ---------- v2 runtime: the real-time house ---------- */
const SIM = CR.Sim, HOUSE = CR.House;
const CAUSE = { starvation: 'Starved.', thirst: 'Died of thirst.', wounds: 'Bled out.', sickness: 'Fever took them.', 'a raid': 'Killed in a raid.', fighting: 'Killed fighting at the door.' };
const notice = (t) => { try { if (CR.UI && CR.UI.toast) CR.UI.toast(t); } catch (e) {} };
const SPEEDI = ['⏸', '▶', '▶▶', '▶▶▶'];
const stripT = (t) => String(t).replace(/^\d\d:\d\d /, '');

function takeControl(id) { G.sel = id; const p = person(id); if (p && p.act && p.act.interrupt && /^(life|chat)$/.test(p.act.k)) SIM.abort(p); chromeSig = ''; }
function chatLine(a, b) { const c = ST.cd(a); if (!c || !c.barks) return ''; const arr = c.barks.idle || []; return arr.length ? String(ST.voiced(a, pick(arr))).replace(/<[^>]+>/g, '') : ''; }

/* ---------- words for needs, so the screen can say "hungry" instead of "62" ---------- */
function needWords(s) {
  const w = [];
  if (s.wound) w.push('bleeding'); if (s.sick) w.push('sick');
  if (s.hunger >= 85) w.push('starving'); else if (s.hunger >= 55) w.push('hungry');
  if (s.thirst >= 85) w.push('desperate for water'); else if (s.thirst >= 50) w.push('thirsty');
  if (s.fatigue >= 85) w.push('exhausted'); else if (s.fatigue >= 60) w.push('tired');
  if (s.mood < 28) w.push('low in spirit');
  return w.length ? w.join(', ') : 'managing';
}
function badges(s) {
  const b = [];
  if (s.wound) b.push(['🩸', 'red']); if (s.sick) b.push(['🤒', 'grn']);
  if (s.hunger >= 85) b.push(['🍞', 'red']); else if (s.hunger >= 55) b.push(['🍞', 'amb']);
  if (s.thirst >= 50) b.push(['💧', s.thirst >= 85 ? 'red' : 'blu']);
  if (s.fatigue >= 70) b.push(['🌙', 'amb']); if (s.mood < 28) b.push(['☁', 'gry']);
  if (s.act && s.act.k === 'watch') b.push(['👁', 'amb']);
  return b.slice(0, 2).map(([e, c]) => `<i class="bd ${c}">${e}</i>`).join('');
}
const PHASEN = { dawn: 'Dawn', day: 'Day', dusk: 'Dusk', night: 'Night' };
let chromeSig = '';
function chrome() {
  if (!G || typeof document === 'undefined') return;
  const el = document.getElementById('clk'); if (el) { const t = `Day ${G.day} · ${SIM.clock(G.t)}`; if (el.textContent !== t) el.textContent = t; }
  const ph = document.getElementById('phz'); if (ph) { const t = PHASEN[SIM.phaseOf(G.t)] + (G.speed === 0 ? ' · paused' : ''); if (ph.textContent !== t) ph.textContent = t; }
  const sig = G.speed + '|' + Object.keys(G.inv).map((k) => k + G.inv[k]).join(',');
  if (sig !== chromeSig) { chromeSig = sig; const sb = document.getElementById('spdb'); if (sb) sb.textContent = SPEEDI[G.speed || 0]; const ch = document.querySelector('.hud .chips'); if (ch) ch.outerHTML = chipsHtml(); }
}
let panelT = 0, pointerDown = false;
if (typeof document !== 'undefined' && document.addEventListener) { document.addEventListener('pointerdown', () => { pointerDown = true; }, true); const up = () => { setTimeout(() => { pointerDown = false; }, 250); }; document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true); }
function dayPanel() {
  const s = person(G.sel) || alive()[0]; if (!s) return ['people', ''];
  const tab = ['people', 'work', 'world', 'notes'].includes(ui.day) ? ui.day : 'people';
  return [tab, safe({ people: peopleTab, work: () => workTab(s), world: () => worldTab(s), notes: () => notesTab(s) }[tab], tab)];
}
function refreshPanel() {
  if (typeof document === 'undefined' || !G || G.screen !== 'day' || modalOpen || pointerDown) return;
  const pa = document.querySelector('.panel-area'); if (!pa) return; const [tab, html] = dayPanel(); if (pa.dataset.tab !== 'day:' + tab) return;
  if (pa._h !== html) { const top = pa.scrollTop; pa.innerHTML = html; pa._h = html; pa.scrollTop = top; if (CR.UI) CR.UI.soon(); }
}
function renderDay() {
  const s = person(G.sel) || alive()[0]; if (s && G.sel !== s.id) G.sel = s.id; chromeSig = '';
  const [tab, panel] = dayPanel();
  const t = (id, icon, label, dot) => navBtn(tab === id ? 'on' : '', icon, label, `data-a="tab" data-k="day" data-t="${id}"`, dot);
  const nav = t('people', '👥', 'Group') + t('work', '🎒', 'Items') + t('world', '🌍', 'World', (G.envoys || []).length) + t('notes', '📓', 'Journal');
  const hudH = `<header class="hud"><button class="menubtn" data-a="menu" aria-label="Menu">☰</button><div class="hudt"><b id="clk">Day ${G.day} · ${SIM.clock(G.t)}</b><span class="phase" id="phz">${PHASEN[SIM.phaseOf(G.t)]}${G.speed === 0 ? ' · paused' : ''}</span></div>${chipsHtml()}<button id="spdb" class="spd" data-a="speed" aria-label="Speed">${SPEEDI[G.speed || 0]}</button></header>`;
  return shell(hudH, '<div id="hstage"></div>', nav, panel, 'day:' + tab, 'v2old');
}
function mountHouse() { const el = $('#hstage'); if (el && typeof el.appendChild === 'function' && HOUSE) HOUSE.attach(el, G); }

/* ---------- the clock loop ---------- */
function stepV2(dt) {
  if (!G) return;
  if (G.screen === 'day') {
    if (Q.length && !modalOpen) flush();
    else if (!modalOpen && !CR.paused) { try { SIM.drive(dt); } catch (err) { reportError(err); G.speed = 0; chromeSig = ''; } if (Q.length && !modalOpen) flush(); }
  }
  chrome(); panelT += dt; if (panelT > 2.5) { panelT = 0; refreshPanel(); }
}

/* ---------- what the simulation tells the game ---------- */
const simHost = {
  get G() { return G; }, R, inv, add,
  log: (t, c) => { log(t, c); if (c === 'good' || c === 'bad') notice(stripT(t)); },
  bond: (a, b, f, t) => { try { if (a.cid && b.cid) ST.bond(a, b, f, t); } catch (e) { reportError(e); } },
  kill: (s, c) => kill(s, CAUSE[c] || String(c)),
  bestWeapon,
  halt: () => !G.away && (modalOpen || Q.length > 0),
  chatLine,
  controlled: () => G.sel,
  onSelfCare: (p, what) => notice(`${p.name} stopped to ${what}.`),
  onBuilt: (id, p) => { sfx('open'); if (CR.Tutorial && CR.Tutorial.notify) CR.Tutorial.notify('built'); },
  onLook: (p, f) => lookSheet(p, f),
  onUse: (p, what) => useStation(p, what),
  onDawn: (day) => dawnV2(day),
  onHour: (h, day) => hourV2(h, day),
  onRaidWarn: (r) => raidWarn(r),
  onRaidDone: (o) => raidDone(o)
};
SIM.init(simHost);

function dawnV2(day) {
  const lines = [];
  if (G.thiefId) { const t = person(G.thiefId); if (t && t.alive && chance(0.5)) { stealSome(0.4); t.alive = false; t.gone = true; lines.push(`${t.name} is gone, and so are some supplies.`); G.thiefId = 0; G.stats.left++; moodAll(-3); } }
  alive().forEach((s) => { s.slots = 3; });
  alive().forEach((s) => {
    if (s.mood < 15 && chance(0.3)) {
      s.alive = false; s.gone = true; s.pack = {}; G.stats.left++; moodAll(-8);
      lines.push(s.cid && CR.Life && CR.Life.turnSurvivor(s) ? `${s.name} is gone. Somebody swears they saw them walk toward the Gate Boys' fire.` : `${s.name} left in the dark and did not come back.`);
    }
  });
  PO.tick(); CR.World.tick(); ST.tick(); if (CR.Life) CR.Life.tick();
  try { ST.morning({ n: 0 }); } catch (e) { reportError(e); }
  lines.forEach((l) => log(l, 'bad'));
  if (day % 4 === 0) LOCS.forEach((l) => { if (G.locs[l.id]) G.locs[l.id].rich = Math.min(l.rich[1], G.locs[l.id].rich + 1); });
  if (!alive().length) { G.screen = 'over'; save(); flush(); render(); return; }
  if (day >= G.rescueDay) { G.screen = 'end'; save(); render(); return; }
  rollTonight();
  const n = 2 + (chance(0.55) ? 1 : 0) + (day % 6 === 0 ? 1 : 0); const hrs = []; while (hrs.length < n) { const h = rnd(8, 23); if (!hrs.includes(h)) hrs.push(h); } G.sched = hrs.sort((a, b) => a - b);
  if (!person(G.sel) || !person(G.sel).alive) G.sel = alive()[0].id;
  log(`Day ${day}.`); notice(`Day ${day}. ${pick(MORNING)}`);
  if (lines.length) say(`Day ${day}`, lines.join('\n'));
  flush();
}
function hourV2(h, day) {
  if (G.sched && G.sched.length && h >= G.sched[0]) { G.sched.shift(); try { ST.morning({ n: 1, mixed: true }); } catch (e) { reportError(e); } flush(); }
  returnParties();
  if (h % 3 === 0) save();
}

/* ---------- raids: the watch decides how much you know ---------- */
const banditCache = new Map();
function banditSp(key, i) { const k = key + ':' + i; if (!banditCache.has(k)) { banditCache.set(k, CR.Sprites.gen(['bandit_soldier', 'bandit_heavy', 'bandit_scout', 'bandit_soldier'][i % 4], (key * 31 + i * 97) | 0)); if (banditCache.size > 40) banditCache.delete(banditCache.keys().next().value); } return banditCache.get(k); }
function raidWarn(r) {
  if (G.away || !r.warned) return;
  const lk = SIM.lookout(); if (!lk) return;
  r.choice = 'hold';
  const arts = [{ side: true, sp: banditSp(r.born, 0), kind: 'aim', state: 'ok' }, { sp: lk.sp, state: stateOf(lk) }];
  const ch = [
    { label: 'Hold the line (barricade, everyone awake)', fn() { r.choice = 'hold'; return ''; } },
    { label: 'Lights out. Silence. Let them pass.', fn() { r.choice = 'dark'; return ''; } },
    { label: 'Fight them at the door', fn() { r.choice = 'fight'; return ''; } },
    { label: 'Pay them to leave (some food and water)', fn() { r.choice = 'pay'; return ''; } }
  ]; ch.prompt = 'They are half an hour away. What do you do?';
  ask('Figures at the gate', `${bubbleLine(lk, `${r.size > 2 ? 'Several' : 'Two'} of them. Armed. Coming up the path.`)}`, ch, arts);
}
const bubbleLine = (s, text) => ST.bubble(ST.first(s), 'you', text);
function raidDone(o) {
  const lost = Object.entries(o.lost || {}).map(([k, v]) => `${v} ${ITEMS[k][1].toLowerCase()}`).join(', ');
  const T = {
    passed: 'You sat in the dark and held your breath. Boots on the path, then nothing. They went past.',
    paid: `They took the offer and the bags, and left. It will not hold for long.${lost ? ` You gave up ${lost}.` : ''}`,
    repelled: 'The barricade held. They tried the door twice, cursed, and went away.',
    'repelled-damaged': 'They broke some of the barricade before they gave up. It will need fixing.',
    breached: `They got in. By the time they left the room was torn apart.${lost ? ` They took ${lost}.` : ''}${o.hurt && o.hurt.length ? ` ${o.hurt.join(' and ')} ${o.hurt.length > 1 ? 'were' : 'was'} hurt.` : ''}`
  };
  const bad = o.result === 'breached';
  say(bad ? 'They broke in' : 'The raid', T[o.result] || 'It is over.', { side: true, sp: banditSp((G.pend && G.pend.born) || G.t, 1), kind: bad ? 'aim' : 'walk', state: 'ok' });
  log(bad ? 'Raiders broke in.' : 'A raid was turned away.', bad ? 'bad' : 'good'); sfx(bad ? 'alarm' : 'tap'); if (bad) buzz([80, 40, 80]);
}

/* ---------- the window and the radio: two different kinds of knowing ---------- */
function lookSheet(p, f) {
  const top = SIM.floors() - 1, night = SIM.isNight(G.t), seen = [];
  (G.yard || []).filter((v) => v.until > G.t).forEach((v) => seen.push(v.text));
  if (G.pend) seen.push(`${Math.min(G.pend.size, 4)} armed people are coming up the path.`);
  const d = LOCBY[(G.tonight || {}).danger];
  if (d && f >= 1) seen.push(night ? `Torchlight moves near ${d.name}.` : `Figures cross open ground near ${d.name}.`);
  if (f >= Math.max(2, top)) Object.values(G.zones || {}).forEach((q) => { if (q.tension > 55) seen.push(`Smoke and raised voices from ${q.name}.`); else if (q.holder && q.tension > 30) seen.push(`${q.name} looks tense.`); });
  if (!seen.length) seen.push(pick(night ? ['Nothing moves. Somewhere a dog stops barking.', 'The dark is total. You count your own breaths.', 'A far-off fire, too small to name.'] : ['The path is empty. The grass has started to take it.', 'Heat on the roofs. Nothing walking.', 'A plastic bag crosses the yard in the wind. Nothing else.']));
  say(f === 0 ? 'From the ground-floor window' : `From the window, floor ${f + 1}`, `<i>${f >= top ? 'You can see most of the campus from here.' : f === 0 ? 'You can see the yard and the path to the door.' : 'You can see the yard and a good way beyond it.'}</i>\n\n${seen.map((t) => '• ' + t).join('\n')}`, { sp: p.sp, state: stateOf(p) });
}
function useStation(p, what) {
  if (what === 'door') { doorSheet(p); return; }
  if (what === 'radio') {
    sfx('radio'); const b = CR.World.bulletin('radio'); G.newsLog = G.newsLog || []; G.newsLog.unshift({ d: G.day, t: b.text }); G.newsLog.length = Math.min(G.newsLog.length, 6);
    say('On the radio', `<i>${ST.first(p)} turns the dial through the static.</i>\n\n“${b.text}”`, { sp: p.sp, state: stateOf(p) });
  }
}
function worldSheet() {
  const s = person(G.sel);
  if (!G.build.radio) { ask('Beyond the walls', `${rescueLine()}<div class="dim">You have no radio. Everything beyond your own door is rumour. You hear what visitors tell you, and what the window shows.</div>`, [{ label: 'Close' }], { icon: '🌍' }); return; }
  ask('The wider campus', `${rescueLine()}${newsPanel()}${zonePanel()}<div class="sub">The groups</div>${facRows()}`, [{ label: 'Close' }], { icon: '🌍' });
}

/* ---------- menus ---------- */
function homeMenu() {
  const s = person(G.sel);
  const ch = [
    { label: '🎒 Items and the cupboard', fn() { invMenu(s); return ''; } },
    { label: '📓 Journal and how it happened', fn() { ask('Journal', notesTab(s), [{ label: 'Close' }], { icon: '📓' }); return ''; } },
    { label: '🌍 The wider campus', fn() { worldSheet(); return ''; } },
    { label: '📜 Copy a problem report', fn() { copyReport(); return ''; } },
    { label: '⚙ Pause, settings, help', fn() { setTimeout(() => { if (CR.Menu) CR.Menu.open('pause', { from: null }); }, 0); return ''; } },
    { label: 'Close' }
  ];
  ask('Menu', `<i>Day ${G.day}, ${SIM.clock(G.t)}. ${LOCBY[G.shelter].name}.</i>`, ch, { icon: '☰' });
}
function selfMenu(s) {
  const watch = { null: 'none', early: 'early (8 pm to 1 am)', late: 'late (1 am to 5:30 am)' };
  const ch = [
    { label: 'Items and pack', fn() { invMenu(s); return ''; } },
    { label: 'Notebook', fn() { showNotebook(s.id); return ''; } },
    { label: `Night watch: ${watch[s.shift || null]}`, fn() { s.shift = s.shift === null || !s.shift ? 'early' : s.shift === 'early' ? 'late' : null; G.watchSet = true; notice(`${s.name}: night watch ${watch[s.shift || null]}.`); return ''; } },
    { label: 'Close' }
  ];
  ask(`${s.name} (you)`, `<i>${s.act ? s.act.label : 'Doing nothing'}. ${needWords(s)}.</i>\n\n${ST.describe(s)}`, ch, { sp: s.sp, state: stateOf(s) });
}
function otherMenu(t) {
  const me = person(G.sel); if (!me) return;
  const ch = [
    { label: `Talk to ${t.name} (as ${me.name})`, off: t.out, why: `${t.name} is away.`, fn() { ST.talk(t); return ''; } },
    { label: `Become ${t.name}`, fn() { takeControl(t.id); return ''; } },
    { label: t.auto === false ? 'Let them find their own work' : 'Have them wait for orders', fn() { t.auto = t.auto === false; notice(`${t.name} will ${t.auto ? 'find useful work' : 'wait for orders'}.`); return ''; } },
    { label: `Send ${t.name} out to scavenge`, off: t.out || t.hp < 25 || t.mood < 15, why: t.out ? `${t.name} is already away.` : `${t.name} is in no state to go.`, fn() { pickDest(t, 'auto'); return ''; } },
    { label: `${t.name}'s notebook`, fn() { showNotebook(t.id); return ''; } },
    { label: 'Close' }
  ];
  ask(t.name, `<i>${t.out ? 'Away. Back about ' + SIM.clock(t.out.back || G.t) + '.' : (t.act ? t.act.label : 'Doing nothing') + '. ' + needWords(t) + '.'}</i>`, ch, { sp: t.sp, state: stateOf(t) });
}

/* ---------- going out ---------- */
const hashS = (str) => hashN(String(str).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
const FLOORS = { hostel: [3, 6], class: [2, 4], hall: [1, 3], cafe: [1, 2], clinic: [1, 3], admin: [3, 5], library: [2, 4], chapel: [1, 2], field: [0, 0], gate: [1, 1], misc: [2, 3] };
function floorsOf(l) { const r = FLOORS[l.kind] || [2, 3]; return r[0] + hashS(l.id) % (r[1] - r[0] + 1); }
function intelOf(l) {
  const fl = floorsOf(l); const rich = (G.locs[l.id] || {}).rich || 0;
  const loot = rich >= 5 ? 'well stocked' : rich >= 3 ? 'some left' : rich >= 1 ? 'little left' : 'picked clean';
  const risk = l.risk >= 5 ? 'deadly' : l.risk >= 4 ? 'very dangerous' : l.risk >= 3 ? 'dangerous' : l.risk >= 2 ? 'some risk' : 'quiet';
  const f = (G.fac || []).find((x) => x.loc === l.id && x.status === 'active'); const g = groupAt(l.id);
  const people = f ? (f.met ? `${f.name} (about ${PO.size(f)})` : 'a group holds it') : (g && g.alive ? 'survivors inside' : 'nobody known');
  return { fl, loot, risk, people, hot: G.tonight && G.tonight.danger === l.id };
}
function destLabel(l, d) {
  const i = intelOf(l);
  return `<b>${l.name}</b> · ${i.fl ? i.fl + (i.fl > 1 ? ' floors' : ' floor') : 'open ground'} · ${d} hr away<small>🎒 ${i.loot} · ⚠ ${i.risk}${i.hot ? ' · patrols tonight' : ''} · 👥 ${i.people}</small>`;
}
function pickDest(s, mode, page) {
  page = page || 0; const per = 6;
  const all = LOCS.filter((l) => l.id !== G.shelter).map((l) => ({ l, d: CAMPUS.travel(G.shelter, l.id) })).sort((a, b) => a.d - b.d || a.l.name.localeCompare(b.l.name));
  const ch = all.slice(page * per, page * per + per).map(({ l, d }) => ({ label: destLabel(l, d), fn() { if (mode === 'ctrl') startControlled(s, l.id); else sendOut(s, l.id); return ''; } }));
  if ((page + 1) * per < all.length) ch.push({ label: 'Farther places…', fn() { pickDest(s, mode, page + 1); return ''; } });
  if (page > 0) ch.push({ label: 'Closer places…', fn() { pickDest(s, mode, page - 1); return ''; } });
  ch.push({ label: 'Never mind' }); ch.prompt = 'Where?';
  ask(mode === 'ctrl' ? 'Where to?' : `Where should ${s.name} go?`, mode === 'ctrl' ? `<i>You will take ${s.name} there yourself, step by step.</i>` : `<i>${s.name} goes alone. You will not see it. You will only learn how it ended.</i>`, ch, { sp: s.sp, state: stateOf(s) });
}
function doorSheet(who) {
  const s = who || person(G.sel); if (!s) return; const night = SIM.isNight(G.t);
  const bad = s.out || s.hp < 25 || s.mood < 15 || s.fatigue > 92;
  const others = alive().filter((x) => x.id !== s.id && !x.out && x.hp >= 25 && x.mood >= 15);
  const ch = [
    { label: `Go yourself (${s.name}) and guide them`, off: bad, why: `${s.name} is in no state to go out.`, fn() { pickDest(s, 'ctrl'); return ''; } },
    { label: 'Send someone else (they go alone)', off: !others.length, why: 'Nobody else is fit to go.', fn() { pickWho(others); return ''; } },
    { label: 'Stay inside' }
  ];
  ask('The door', `<i>${pick(['Voices outside, then none.', 'A boot on gravel, slow.', 'Somewhere nearby a door slams, and nobody answers it.'])}</i>\n\n⚠ <b>Bandits are out on the campus${night ? ' in the dark' : ' in daylight'}.</b> ${night ? 'Night is darker, and no safer.' : 'There is less cover by day, and more patrols.'}`, ch, { sp: s.sp, state: stateOf(s) });
}
function pickWho(others) {
  const ch = others.map((o) => ({ label: `${o.name}<small>${needWords(o)}${o.pack && Object.keys(o.pack).length ? ' · carrying a pack' : ''}</small>`, fn() { pickDest(o, 'auto'); return ''; } })); ch.push({ label: 'Never mind' });
  ask('Who goes?', '<i>They will go on their own. You will not see it.</i>', ch, { icon: '🚪' });
}
function startControlled(s, locId) {
  const L = LOCBY[locId]; const trv = CAMPUS.travel(G.shelter, locId), tot = Math.max(2, 4 - trv); const dayish = !SIM.isNight(G.t);
  G.exp = { day: dayish, xseed: rnd(1, 1e9), xs: [], sid: s.id, loc: locId, hours: tot, total: tot, travel: trv, bag: {}, found: null, noise: 0, dead: false, msg: L.flavor, floors: floorsOf(L) };
  s.out = { mode: 'ctrl', loc: locId }; SIM.abort(s); s.q = []; G.dayTrip = dayish; G.screen = 'exp'; log(`${s.name} slipped out to ${L.name}.`); save(); render();
}
function sendOut(s, locId) {
  const L = LOCBY[locId]; const trv = CAMPUS.travel(G.shelter, locId); const hours = Math.max(3, trv * 2 + 3);
  SIM.abort(s); s.q = []; s.out = { mode: 'auto', loc: locId, back: G.t + hours * 60 };
  log(`${s.name} slipped out toward ${L.name}.`); notice(`${s.name} has gone to ${L.name}. Back in about ${hours} hours.`);
}
function returnParties() {
  G.S.filter((s) => s.alive && s.out && s.out.mode !== 'ctrl' && s.out.back <= G.t).forEach((s) => {
    const o = s.out; s.out = null; s.f = 0; s.x = 14; s.up = 0; s.at = null; s.act = null;
    if (o.mode === 'auto') resolveScav(s, o); else { log(`${s.name} is back from ${o.what || 'their errand'}.`, 'good'); notice(`${s.name} is back.`); }
  });
}
function resolveScav(s, o) {
  const L = LOCBY[o.loc]; const st = G.locs[L.id]; const bag = {}; const cap = bagCapOf(s); let used = 0; const lines = []; let dead = false, wounded = 0;
  const weapon = bestWeapon();
  for (let i = 0; i < 3 && !dead; i++) {
    const pEnc = clamp(0.2 + L.risk * 0.06 + (G.tonight && G.tonight.danger === L.id ? 0.12 : 0) - (hasTrait(s, 'runner') ? 0.1 : 0) - weapon * 0.03, 0.05, 0.8);
    if (chance(pEnc)) {
      const r = R();
      if (r < 0.04 + L.risk * 0.012 - weapon * 0.01) { dead = true; lines.push('A burst from the dark.'); }
      else if (r < 0.34 + L.risk * 0.03) { const h = rnd(8, 26); wounded += h; lines.push(pick([`A patrol saw ${ST.first(s)} and fired.`, `${ST.first(s)} fell through a rotten stair.`, 'A rival scavenger swung first.'])); }
      else if (r < 0.55) { Object.keys(bag).forEach((k) => delete bag[k]); used = 0; lines.push(pick(['Held up at gunpoint. The bag was taken.', 'Someone stronger took what was found.'])); }
      else lines.push(pick(['Hid behind a door for an hour while boots passed.', 'A patrol went by. ' + ST.first(s) + ' held their breath.']));
    } else if (st && st.rich > 0 && used < cap) {
      st.rich--; const item = wpick(L.loot); let qty = WEAPON[item] ? 1 : (item === 'food' || item === 'water') ? rnd(2, 4) : rnd(1, 3); qty = Math.min(qty, cap - used); bag[item] = (bag[item] || 0) + qty; used += qty;
    }
  }
  const got = Object.entries(bag).map(([k, v]) => `${v} ${ITEMS[k][1].toLowerCase()}`).join(', ');
  s.fatigue = clamp(s.fatigue + 25, 0, 100); s.hunger = clamp(s.hunger + 12, 0, 100); s.thirst = clamp(s.thirst + 12, 0, 100);
  if (dead) { kill(s, 'Killed by a patrol out on the campus.'); log(`${s.name} never came back from ${L.name}.`, 'bad'); return; }
  depositBag(bag, s); if (wounded) hurt(s, wounded, 'Caught by a patrol.');
  const txt = `<i>${ST.first(s)} comes back from ${L.name}${wounded ? ', bleeding' : ''}${got ? `, carrying ${got}` : ', with nothing'}.</i>${lines.length ? '\n\n' + lines.join(' ') : ''}`;
  say(`${s.name} is back`, txt, { sp: s.sp, state: stateOf(s) }); log(`${s.name} returned from ${L.name}${got ? ' with ' + got : ' empty-handed'}.`, got ? 'good' : '');
}
const bagCapOf = (s) => 8 + (hasTrait(s, 'strong') ? 2 : 0);

/* ---------- taps on the house ---------- */
let tallyKnocks = [];
function tallyKnock() {
  const now = Date.now(); tallyKnocks = tallyKnocks.filter((t) => now - t < 14000); tallyKnocks.push(now); sfx('hit');
  const groups = []; tallyKnocks.forEach((t, i) => { if (i === 0 || t - tallyKnocks[i - 1] > 650) groups.push(1); else groups[groups.length - 1]++; });
  const n = groups.length; if (n >= 3 && groups[n - 3] === 3 && groups[n - 2] === 2 && groups[n - 1] === 1) { tallyKnocks = []; setTimeout(() => { if (CR.Life && CR.Life.egg) { CR.Life.egg(); flush(); } }, 700); return true; }
  return false;
}
function giveOrder(s, j) { const r = SIM.order(s.id, j.job, true); if (!r.ok) toastWhy(r.why); }
function tapStation(id) {
  const s = person(G.sel); if (!s || !s.alive || s.out) return;
  if (id === 'yard' || id === 'door') { const r = SIM.order(s.id, { k: 'use', st: 'door', what: 'door', min: 2, label: 'At the door' }, true); if (!r.ok) toastWhy(r.why); return; }
  if (id === 'cupboard') { resourceWheel(s); return; }
  if (id === 'bench') { openWheel('craft'); return; }
  if (id === 'stove') { openWheel('cook'); return; }
  if ((SIM.stations()[id] || {}).built === false) { buildWheel(s, SIM.stations()[id].id === 'roof' ? 'roof' : (Object.values(SIM.BUILDS).find((d) => d.at === id) || {}).at || id); return; }
  if (id === 'tally') tallyKnock();
  const S = SIM.stations(); const st = S[id]; if (!st) return;
  const jobs = SIM.jobsAt(id, s);
  if (jobs.length === 1) { giveOrder(s, jobs[0]); return; }
  const ch = jobs.map((j) => ({ label: j.label, off: !!j.why, why: j.why, fn() { giveOrder(s, j); return ''; } })); ch.push({ label: 'Close' });
  ask(st.label, `<i>${s.name} (you): ${s.act ? s.act.label.toLowerCase() : 'free'}.</i>`, ch, { sp: s.sp, state: stateOf(s) }); flush();
}
function tapFloor(f, x) { const s = person(G.sel); if (!s || !s.alive || s.out) return; SIM.order(s.id, { k: 'walk', pt: { f, x } }, true); }
function tapPerson(id) {
  const t = person(id); if (!t || !t.alive) return;
  if (id === G.sel) { selfMenu(t); flush(); } else { takeControl(id); render(); }
}
const yardSp = new Map();
function yardList() {
  const looking = SIM.lookout() || G.S.some((s) => s.alive && !s.out && s.act && s.act.k === 'look' && s.act.walkLeft <= 0);
  if (!looking) return [];
  const out = (G.yard || []).filter((v) => v.until > G.t).map((v, i) => ({ id: 'y' + i, sp: v.sp, kind: v.kind, x: -12 - i * 11, state: v.state }));
  if (G.pend) for (let i = 0; i < Math.min(4, G.pend.size); i++) out.push({ id: 'r' + i, sp: banditSp(G.pend.born, i), kind: 'aim', x: -12 - (out.length + i) * 9, state: 'ok' });
  return out;
}
/* ---------- encounters decided by stats, shown as scenes (no player skill) ---------- */
function sceneHtml(pl, plKind, foes) {
  const SDx = CR.Side; if (!SDx) return '';
  const one = (sp, kind, state, dir) => `<div class="scf">${SDx.render(sp, kind, { scale: 3, state: state || 'ok', dir })}</div>`;
  return `<div class="scn">${one(pl.sp, plKind, stateOf(pl), 1)}<div class="scgap"></div>${foes.map((f) => one(f.sp, f.kind || 'idle', f.state, -1)).join('')}</div>`;
}
const sig = (x) => 1 / (1 + Math.exp(-2.2 * x));
/* how strong is this person for this kind of moment. Every factor is visible to the player. */
function powerFor(s, mode) {
  const f = []; const add = (t, d) => { if (d) f.push({ t, d }); }; const e = G.exp || { noise: 0 };
  const w = bestWeapon(); add(w ? ['a club', 'a machete', 'a pistol'][w - 1] || 'armed' : 'unarmed', w ? 0.35 * w : -0.25);
  if (hasTrait(s, 'strong')) add('strong', mode === 'flee' ? 0 : 0.3); if (hasTrait(s, 'hardened')) add('hardened', mode === 'fight' || mode === 'threaten' ? 0.25 : 0);
  if (hasTrait(s, 'runner')) add('fast', mode === 'flee' || mode === 'hide' ? 0.4 : 0); if (hasTrait(s, 'devout') && (mode === 'fight' || mode === 'threaten')) add('devout', -0.15);
  if (hasTrait(s, 'hustler') && mode === 'talk') add('smooth talker', 0.35);
  if (s.hp < 70) add('hurt', (s.hp - 70) / 120); if (s.wound) add('bleeding', -0.25); if (s.sick) add('feverish', -0.2);
  if (s.hunger >= 70) add('hungry', -0.25); if (s.thirst >= 70) add('thirsty', -0.2); if (s.fatigue >= 70) add('exhausted', -0.3); if (s.mood < 30) add('shaken', -0.15);
  if (mode === 'hide' || mode === 'flee') { add('noisy', -0.05 * Math.min(8, e.noise || 0)); if (G.exp && G.exp.sneak) add('sneaking', mode === 'hide' ? 0.4 : 0); if (G.exp && bagUsed() >= 6) add('heavy bag', -0.2); }
  if (mode === 'hide' && G.exp && !G.exp.day) add('night cover', 0.3);
  if (mode === 'hide' && G.exp && G.exp.day) add('daylight', -0.3);
  return { v: f.reduce((a, x) => a + x.d, 0), f };
}
function oddsText(p, f, extra) {
  const label = p >= 0.75 ? 'Good odds' : p >= 0.5 ? 'Fair odds' : p >= 0.3 ? 'Poor odds' : 'Slim odds';
  const why = f.slice().sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 3).map((x) => (x.d > 0 ? '+' : '−') + ' ' + x.t).join(', ');
  return `<small>${label}${why ? ' · ' + why : ''}${extra ? ' · ' + extra : ''}</small>`;
}
function odds(s, mode, foePower) { const P = powerFor(s, mode); return { p: clamp(sig(P.v - foePower), 0.05, 0.95), f: P.f }; }
function showScene(title, text, pl, plKind, foes) { say(title, text, { html: sceneHtml(pl, plKind, foes) }); }

function encPatrol(L, s, e) {
  const n = 1 + (chance(0.5) ? 1 : 0) + (L.risk >= 4 ? 1 : 0); const sps = []; for (let i = 0; i < n; i++) sps.push(CR.Sprites.gen(pick(BANDIT_ARCH), rnd(1, 1e6)));
  const foes = (k, st) => sps.map((sp) => ({ sp, kind: k, state: st }));
  const F = 1.0 + n * 0.3 + L.risk * 0.08;
  const hide = odds(s, 'hide', F - 0.4), fight = odds(s, 'fight', F), run = odds(s, 'flee', F - 0.2);
  const loseBag = () => { const ks = Object.keys(e.bag).filter((x) => e.bag[x] > 0); if (ks.length) { const x = pick(ks); const q = Math.ceil(e.bag[x] / 2); e.bag[x] -= q; return ` You drop ${q} ${ITEMS[x][0]} in the dark.`; } return ''; };
  const ch = [
    { label: `Hide${oddsText(hide.p, hide.f)}`, fn() { if (chance(hide.p)) { e.msg = 'They pass. You count to a thousand.'; showScene('They pass', `Their torches slide over the wall above you. Boots. A cough. Then the corridor is empty.`, s, 'sitfloor', foes('walk', 'ok')); return ''; } hurt(s, rnd(10, 25), 'Shot by a patrol.'); showScene('Found', `A torch swings back and stops on you. A beating. You crawl away.${loseBag()}`, s, 'sitfloor', foes('aim', 'ok')); return ''; } },
    { label: `Fight${oddsText(fight.p, fight.f)}`, off: !bestWeapon(), why: 'You have nothing to fight with.', fn() { if (chance(fight.p)) { G.stats.kills++; moral(s, 6); showScene('It is over fast', `You are not sure you can stand. They are not standing either.`, s, 'aim', foes('dead', 'dead')); return ''; } hurt(s, rnd(20, 45), 'Killed by a patrol.'); showScene('It goes badly', `They were more, and readier. The floor comes up to meet you.`, s, 'sitfloor', foes('aim', 'ok')); return ''; } },
    { label: `Run${oddsText(run.p, run.f)}`, fn() { e.noise += 3; const t = loseBag(); if (chance(run.p)) { showScene('You get away', `Something whines past your ear. You do not stop.${t}`, s, 'run', foes('aim', 'ok')); return ''; } hurt(s, rnd(8, 20), 'Shot in the back.'); showScene('Not fast enough', `A burst. A burning line across your back.${t}`, s, 'limp', foes('aim', 'ok')); return ''; } }
  ];
  ask('Patrol', `Torch beams. Voices. ${n > 1 ? n + ' armed men sweep' : 'An armed man sweeps'} the corridor. You are in their path.`, ch, { html: sceneHtml(s, 'sneak', foes('walk', 'ok')) });
}
function encRival(L, s, e) {
  const r = mkPerson(null, 'visitor'); const k2 = () => pick(Object.keys(L.loot).filter((x) => !WEAPON[x]));
  const hungry = chance(0.5); const F = 0.7 + (hungry ? 0.2 : 0);
  const th = odds(s, 'threaten', F - 0.1), fi = odds(s, 'fight', F);
  const foe = (k) => [{ sp: r.sp, kind: k, state: hungry ? 'hungry' : 'ok' }];
  const ch = [
    { label: 'Split it', fn() { const q = k2(); e.bag[q] = (e.bag[q] || 0) + (bagUsed() < bagCap() ? 1 : 0); mood(s, 2); showScene('You share', `${r.name} nods once. Neither of you says thank you.`, s, 'idle', foe('idle')); return ''; } },
    { label: `Threaten them off${oddsText(th.p, th.f, hungry ? 'they look weak' : '')}`, fn() { G.stats.thefts++; moral(s, 3); const q = k2(); if (chance(th.p)) { e.bag[q] = (e.bag[q] || 0) + Math.min(2, bagCap() - bagUsed()); showScene('They back off', `${r.name} looks at your hands, then your face, and leaves the room to you.`, s, 'aim', foe('sitfloor')); return ''; } hurt(s, rnd(5, 15), 'Stabbed over scraps.'); showScene('They do not back off', `${r.name} swings first. You get away with a cut and nothing else.`, s, 'sitfloor', foe('aim')); return ''; } },
    { label: `Fight for it${oddsText(fi.p, fi.f)}`, fn() { G.stats.thefts++; moral(s, 6); const q = k2(); if (chance(fi.p)) { e.bag[q] = (e.bag[q] || 0) + Math.min(3, bagCap() - bagUsed()); if (chance(0.15)) { G.stats.kills++; moral(s, 5); } showScene('You win it', `${r.name} stays down. Your hands are not steady.`, s, 'aim', foe('dead')); return ''; } hurt(s, rnd(10, 28), 'Stabbed over scraps.'); showScene('You lose it', `${r.name} is stronger than they looked. You leave bleeding.`, s, 'sitfloor', foe('aim')); return ''; } },
    { label: 'Back away', fn() { return 'Neither of you says anything. You go.'; } }
  ];
  ask('Another scavenger', `${r.name} is also out here, ${hungry ? 'thin and pale' : 'steady'}, eyes on the same room as you.`, ch, { html: sceneHtml(s, 'idle', foe('idle')) });
}
function encHostile(g, L, s, e) {
  const n = Math.min(3, Math.max(1, g.size)); const sps = (g.faces && g.faces.length ? g.faces : [CR.Sprites.gen('refugee', 7)]).slice(0, n);
  const foes = (k) => sps.map((sp) => ({ sp, kind: k, state: 'ok' })); const F = 0.9 + g.size * 0.12;
  const fi = odds(s, 'fight', F), ta = odds(s, 'talk', F + 0.1);
  ask(`${g.name}`, `You walked into ${g.name}'s floor. They were waiting. ${g.size} of them. Somebody has a blade.`, [
    { label: `Fight${oddsText(fi.p, fi.f)}`, off: !bestWeapon(), why: 'You have nothing to fight with.', fn() { if (chance(fi.p)) { G.stats.kills++; moral(s, 8); setRel(g, -25); G.flags.groupRaid = g.id; g.size = Math.max(1, g.size - 1); showScene('You get out', `Someone does not. They will come for you.`, s, 'aim', foes('dead')); return ''; } hurt(s, rnd(20, 45), 'Killed by ' + g.name + '.'); showScene('It goes badly', `There were too many. The floor is cold.`, s, 'sitfloor', foes('aim')); return ''; } },
    { label: 'Hand over your bag', fn() { Object.keys(e.bag).forEach((x) => { e.bag[x] = 0; }); mood(s, -4); showScene('They take everything', `They let you walk. That is the mercy.`, s, 'idle', foes('aim')); return ''; } },
    { label: `Try to talk${oddsText(ta.p, ta.f)}`, fn() { if (chance(ta.p)) { setRel(g, 10); showScene('They let you go', `Something in your voice works. They lower the blade.`, s, 'idle', foes('idle')); return ''; } hurt(s, rnd(10, 25), 'Beaten to death by ' + g.name + '.'); showScene('It does not work', `The first blow comes before you finish the sentence.`, s, 'sitfloor', foes('aim')); return ''; } }
  ], { html: sceneHtml(s, 'idle', foes('aim')) });
}

/* ---------- holing up until the patrols change: allowed, and it costs ---------- */
function holeUpSheet() {
  const e = G.exp; if (!e) return; const s = person(e.sid); const L = LOCBY[e.loc];
  const found = clamp(0.12 + L.risk * 0.05 + e.noise * 0.02 + (e.day ? 0.12 : 0) - (e.sneak ? 0.06 : 0), 0.05, 0.85);
  ask('Hole up here?', `<i>You find a corner and wait for the patrols to change.</i>\n\n<b>It costs:</b> six hours. ${s.name} gets hungrier and thirstier, and the house waits without them.\n<b>It gives:</b> some rest, quiet noise, and a fresh sweep of the building with more time to search.\n<b>The risk:</b> about ${Math.round(found * 100)}% chance you are found while you sleep (${e.day ? 'it is daylight, so more people are about' : 'darkness helps'}).`, [
    { label: 'Hole up for six hours', fn() { s.fatigue = clamp(s.fatigue - 22, 0, 100); s.hunger = clamp(s.hunger + 12, 0, 100); s.thirst = clamp(s.thirst + 14, 0, 100); e.noise = 0; e.waited = (e.waited || 0) + 6; e.hours = Math.min(e.total, e.hours + 3); G.exp.xs = []; if (chance(found)) { Q.push({ title: 'Found', text: 'Footsteps stop outside your hiding place.', choices: [{ label: 'Continue', fn() { forceEnc('patrol'); return ''; } }], art: { sp: s.sp, state: stateOf(s) } }); return ''; } return `<i>Six hours of dust and thirst. Nobody found you. You wake to different light, and the building feels different.</i>`; } },
    { label: 'Keep going' }
  ], { sp: s.sp, state: stateOf(s) });
}

/* ---------- wheels ---------- */
const WHEEL = CR.Wheel;
const plainCost = (c) => Object.entries(c).map(([k, v]) => v + ' ' + (k === 'parts' ? 'scrap' : k)).join(', ');
const BICON = { stove: 'wood', bench: 'tools', barr1: 'wood', barr2: 'wood', barr3: 'wood', bunk: 'bed', bucket: 'water', filter: 'water', garden: 'bread', radio: 'radio', alarm: 'bolt', curtains: 'cloth', infirm: 'meds', cupboard: 'bag', still: 'ogogoro' };
function wheelOrder(s, job) { const r = SIM.order(s.id, job, true); if (!r.ok) toastWhy(r.why); else notice(`${s.name} is on it.`); }
function craftWheel(s) {
  WHEEL.open({ title: 'Make', items: Object.entries(SIM.CRAFTS).map(([id, c]) => { const w = SIM.why({ k: 'craft', id }, s); return { id, label: c.name, icon: Object.keys(c.out)[0], sub: `${plainCost(c.cost)} · ${c.min} min`, off: !!w, why: w }; }), onPick: (it) => wheelOrder(s, { k: 'craft', id: it.id }) });
}
function cookWheel(s) {
  const opts = [['Small pot', 2], ['Full pot', 4]];
  WHEEL.open({ title: 'Cook', items: opts.map(([label, n]) => { const w = SIM.why({ k: 'cook', n }, s) || (inv('food') < n ? `You need ${n} food for that.` : null); return { id: n, label, icon: 'meal', sub: `${n} food + 1 wood · ${n === 2 ? 25 : 40} min`, off: !!w, why: w }; }), onPick: (it) => wheelOrder(s, { k: 'cook', n: it.id }) });
}
function buildWheel(s, only) {
  const items = Object.entries(SIM.BUILDS).filter(([, d]) => d.can(G.build) && (!only || d.at === only)).map(([id, d]) => { const w = SIM.why({ k: 'build', id }, s); return { id, label: d.name, icon: BICON[id] || 'tools', sub: `${plainCost(d.cost)} · ${Math.round(d.min / 6) / 10} h`, off: !!w, why: w }; });
  if (!items.length) { toastWhy('Nothing more to build here.'); return; }
  WHEEL.open({ title: 'Build', items, onPick: (it) => wheelOrder(s, { k: 'build', id: it.id }) });
}
function resourceWheel(s) {
  const items = Object.keys(ITEMS).filter((k) => inv(k) > 0).map((k) => ({ id: k, label: ITEMS[k][1], icon: k, count: inv(k) }));
  if (!items.length) { toastWhy('The cupboard is empty.'); return; }
  WHEEL.open({ title: 'Cupboard', items, onPick: (it) => itemWheel(s, it.id) });
}
function itemWheel(s, k) {
  const usable = ['food', 'meal', 'water', 'meds', 'bandage', 'ogogoro'].includes(k); const room = packCount(s) < packCap(s);
  const others = alive().filter((o) => o.id !== s.id && !o.out);
  WHEEL.open({ title: ITEMS[k][1], items: [
    { id: 'use', label: k === 'meds' || k === 'bandage' ? 'Treat' : k === 'food' ? 'Eat raw' : k === 'water' ? 'Drink' : 'Use', icon: k, off: !usable || (k === 'meds' && !s.sick) || (k === 'bandage' && !s.wound), why: !usable ? 'It is not something you use directly.' : k === 'meds' ? `${s.name} is not sick.` : `${s.name} has no wound.` },
    { id: 'take', label: 'Carry', icon: 'bag', sub: 'to pack', off: !room || inv(k) < 1, why: !room ? `${s.name}'s pack is full.` : 'None left.' },
    { id: 'give', label: 'Give', icon: 'people', sub: 'to someone', off: !others.length || inv(k) < 1, why: 'Nobody else is here.' },
    { id: 'back', label: 'Put back', icon: 'house', sub: 'from pack', off: !(s.pack && s.pack[k] > 0) || stashRoom() < 1, why: !(s.pack && s.pack[k] > 0) ? `${s.name} is not carrying any.` : 'The cupboard is full.' }
  ], onPick: (it) => {
    if (it.id === 'use') { useItem(s, k); flush(); save(); render(); }
    else if (it.id === 'take') { add(k, -1); s.pack = s.pack || {}; s.pack[k] = (s.pack[k] || 0) + 1; notice(`${s.name} takes ${ITEMS[k][1].toLowerCase()}.`); save(); render(); }
    else if (it.id === 'back') { s.pack[k]--; if (!s.pack[k]) delete s.pack[k]; add(k, 1); save(); render(); }
    else if (it.id === 'give') WHEEL.open({ title: 'Give to', items: others.map((o) => ({ id: o.id, label: ST.first(o), icon: 'people', sub: `${packCount(o)}/${packCap(o)} carried`, off: packCount(o) >= packCap(o), why: `${o.name}'s pack is full.` })), onPick: (w) => { const o = person(w.id); add(k, -1); o.pack = o.pack || {}; o.pack[k] = (o.pack[k] || 0) + 1; o.trust = clamp((o.trust || 0) + 1, 0, 100); notice(`${o.name} takes it. They remember.`); save(); render(); } });
  } });
}
function openWheel(kind) {
  const s = person(G.sel); if (!s || s.out) return;
  if (kind === 'craft') { if (!G.build.bench) { buildWheel(s, 'bench'); return; } craftWheel(s); }
  else if (kind === 'cook') { if (!G.build.stove) { buildWheel(s, 'stove'); return; } cookWheel(s); }
  else if (kind === 'build') buildWheel(s);
  else if (kind === 'stock') resourceWheel(s);
}

/* ---------- testers: copy a report, export a save ---------- */
function reportText() {
  try { return JSON.stringify({ v: 'crisis-v2', day: G.day, clock: SIM.clock(G.t), screen: G.screen, speed: G.speed, floors: G.floors, build: G.build, inv: G.inv, people: G.S.map((s) => ({ n: s.name, a: s.alive, o: !!s.out, hp: Math.round(s.hp), h: Math.round(s.hunger), t: Math.round(s.thirst), f: Math.round(s.fatigue), m: Math.round(s.mood), act: s.act ? s.act.k : null })), log: G.log.slice(0, 20).map((l) => l.t), errors: (window.__errors || []).slice(-5) }); } catch (e) { return 'report failed: ' + e.message; }
}
function copyReport() { const t = reportText(); try { navigator.clipboard.writeText(t).then(() => notice('Report copied. Paste it to the developer.'), () => notice('Could not copy. Long-press the text instead.')); } catch (e) { notice('Could not copy the report.'); } }

function badgeNames(s) {
  const b = [];
  if (s.wound) b.push('blood'); if (s.sick) b.push('sick');
  if (s.hunger >= 55) b.push('bread'); if (s.thirst >= 50) b.push('water');
  if (s.fatigue >= 70) b.push('moon'); if (s.mood < 28) b.push('cloud');
  if (s.act && s.act.k === 'watch') b.push('eye');
  return b.slice(0, 2);
}
if (HOUSE) HOUSE.hooks = { badges: badgeNames, G: () => G, person, selected: () => G.sel, stateOf, modalOpen: () => modalOpen, step: stepV2, tapPerson, tapStation, tapFloor, yard: yardList };

/* test hook (used by the smoke test; harmless in the browser) */
if (typeof window !== 'undefined') window.__crisis = { forceEnc, holeUpSheet, openWheel, goHome, get G() { return G; }, newGame, act, Q, dawn: dawnV2, search, nextModal, host, Sim: CR.Sim, stepV2, tapStation, tapFloor, tapPerson, doorSheet, pickDest, sendOut, startControlled, returnParties, lookSheet, homeMenu, get modalOpen() { return modalOpen; } };
render();
})();
