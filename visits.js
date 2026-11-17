/* CRISIS — visits (DIPLOMACY.md 1.11, 1.12, 1.5)
   One of yours walks to a group's place at night. One thing gets done there, then they walk home.
   Amends that must be made in person are made here. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
let H = null;   /* set by game.js: { G, ask, say, flush, add, inv, alive, person, mood, moodAll, hurt, kill, remember, toReport, barter, stateOf, first, travel, sfx } */
const P = () => C.Politics, K = () => C.Cast, Vc = () => C.Voice, S = () => C.Story;
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = (a) => a[Math.floor(Math.random() * a.length)], chance = (p) => Math.random() < p, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const G = () => H.G();
const first = (s) => H.first(s);
const cast = (cid) => (cid && K().by[cid]) || null;
const sexOf = (s) => { const c = s && (s.sex ? s : cast(s.cid)); if (c && c.sex) return c.sex; return s && s.sp && /girl|woman|mother|nurse|cafe_woman/.test(s.sp.arch) ? 'f' : 'm'; };
const his = (s) => ({ f: 'her', m: 'his' }[sexOf(s)] || 'their'), he = (s) => ({ f: 'she', m: 'he' }[sexOf(s)] || 'they'), him = (s) => ({ f: 'her', m: 'him' }[sexOf(s)] || 'them');
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const NAME = (k) => P().NAME[k] || k;
const STOCK = ['food', 'water', 'meds', 'parts', 'cloth'];
const GIVE = ['food', 'water', 'meds', 'bandage', 'parts', 'wood', 'cloth', 'ogogoro', 'meal'];
const SHORT = { kitchen: 'the Kitchen', gate: 'the Gate Boys', chapel: 'the Chapel', medical: 'the Medical Wing', hustlers: 'the Hustlers', theatre: 'the Theatre Council', union: 'the Union', terrace: 'the Terrace', tech: 'the Tech Guild', pitch: 'the Pitch Boys', sisters: 'the Sisterhood', staff: 'the Staff Compound', security: 'Security', mph: 'the MPH Camp' };
const short = (f) => SHORT[f.id] || f.name.replace(/^The /, 'the ');

/* how far, and when they would be home */
const hours = (f) => { try { return H.travel(f.loc) || 0; } catch (e) { return 1; } };
const backAt = (f, t) => t + Math.round((hours(f) * 2 + 1.5) * 60);
const clock = (t) => { const h = Math.floor((t % 1440) / 60); return h === 0 ? 'midnight' : h < 12 ? `${h}am` : h === 12 ? 'noon' : `${h - 12}pm`; };

/* who can be visited: groups you have met that still exist */
const visitable = () => P().live().filter((f) => f.met && f.status === 'active');

/* ---------- what they say when your runner arrives ---------- */
const PLACE = {
  kitchen: (h, r) => `${h} lets ${r} in at the back, past the bins. A pot is on the fire with only water in it, and a woman stirs it anyway.`,
  gate: (h, r) => `Two boys search ${r} at the barrier, slowly, taking their time about it. ${h} watches from a plastic chair. A row of shoes is lined up along the wall. Nobody is wearing them.`,
  chapel: (h, r) => `The pews have been pushed to the walls. People sleep in rows on the floor and somebody is always praying. ${h} leads ${r} past the shapes in sheets by the vestry door.`,
  medical: (h, r) => `The clinic smells of bleach, and of something under the bleach. ${h} keeps ${r} at the door. "Wash your hands. Then talk."`,
  hustlers: (h, r) => `Music from a phone somewhere, low. ${h} counts something under a blanket while ${r} talks, and does not stop counting.`,
  theatre: (h, r) => `The Council sits on the stage under one lamp. ${h} writes ${r}'s name in a book before anything else is said.`,
  union: (h, r) => `Posters on every wall, half of them torn down and put back up. ${h} looks at ${r} the way you look at a vote that has not been counted.`,
  terrace: (h, r) => `A generator hums. Somebody upstairs is frying with real oil. ${h} does not offer ${r} any, and makes sure ${r} can smell it.`,
  tech: (h, r) => `Wires everywhere, and a laptop with a cracked screen running off a car battery. ${h} does not look up from it.`,
  pitch: (h, r) => `They are doing push-ups on the pitch in the dark. ${h} finishes the set before coming over, breathing hard.`,
  sisters: (h, r, s) => sexOf(s) === 'm' ? `${r} waits outside Stanzel Hall for a long time. Then ${h} opens the door a hand's width and talks to ${him(s)} through the gap. No man goes in.` : `${r} waits outside Stanzel Hall for a long time. Then ${h} opens the door and pulls ${him(s)} in quickly, and bolts it twice.`,
  staff: (h, r) => `An office in the Senate with the curtains drawn. ${h} sits. ${r} is left standing.`,
  security: (h, r) => `The guardhouse. A radio that only hisses. ${h} keeps a hand near the belt the whole time.`,
  mph: (h, r) => `Hundreds of people on mats in the hall, coughing in the dark. A child follows ${r} all the way to ${h} and holds onto ${r}'s clothes.`
};
/* how they greet your runner: a line spoken, or a thing done */
const MOODLINE = {
  strangers: { say: 'Who sent you?' },
  enemies: { do: () => 'Nobody lowers their weapon.' },
  hostile: { do: (h, r) => `Nobody offers ${r} a seat.` },
  wary: { say: 'You walked here in the dark for something. Say it.' },
  good: { do: (h, r) => `${h} finds ${r} somewhere to sit, and water.` },
  allies: { do: (h, r) => `${h} takes ${r} by both hands, like family.` }
};

/* the one who meets your runner: the envoy you know, or whoever is up */
function hostOf(f) {
  const here = f.members.filter((m) => !f.missing.includes(m) && cast(m));
  const env = P().envoyOf(f); const seen = f.seen || [];
  if (env && here.includes(env) && (!seen.length || chance(0.5))) return env;
  return pick(here.filter((m) => m !== f.leader).concat(chance(0.25) && f.leader ? [f.leader] : [])) || env || f.leader;
}
const sayAs = (cid, text) => { const c = cast(cid); if (!c) return `<i>${text}</i>`; return S().bubble(c.name, 'you', Vc().say(c.voice, text, { id: c.id })); };
const artOf = (s, cid, f) => { const a = [{ sp: s.sp, state: H.stateOf(s) }]; if (cid) { try { a.push({ sp: P().face(cid), state: f.food < P().size(f) * 0.5 ? 'hungry' : 'ok' }); } catch (e) {} } return a; };

/* ---------- amends in person ---------- */
const AMEND_LABEL = { confess: 'Tell them everything you did', hearing: 'Stand before the hearing', fight: 'Stand with them when it comes to blood', rescue: 'Go with them to bring someone out', apology: 'Make the apology', watch: 'Stand the night watch with them' };
/* goods from the house worth at least v, cheapest first, without touching the last of the food and water */
function goodsWorth(v, prefer) {
  const val = (k) => P().value({ [k]: 1 }); const out = {}; let got = 0;
  const order = (prefer ? [prefer] : []).concat(['parts', 'cloth', 'wood', 'ogogoro', 'bandage', 'meds', 'water', 'food'].filter((k) => k !== prefer));
  for (const k of order) { let have = H.inv(k) - (['food', 'water'].includes(k) && k !== prefer ? 3 : 0); while (have > 0 && got < v) { out[k] = (out[k] || 0) + 1; got += val(k); have--; } if (got >= v) break; }
  return got >= v ? out : null;
}
/* what a gift-amends group asks for, as goods you could carry tonight (null if you cannot) */
function amendsGoods(f) {
  const a = P().AMENDS[f.id]; if (!a || !a.gift || !f.grudge || f.grudge.blood || f.grudge.forever) return null; const w = a.gift;
  const owed = (G().ledger || []).filter((l) => l.fid === f.id && l.dir === 'owe' && l.status === 'open').reduce((t, l) => t + P().value(l.items), 0);
  const took = f.grudge.took || 0;
  if (w.item) { const n = w.n || Math.max(1, took + (w.over || 0)); return H.inv(w.item) >= n ? { [w.item]: n } : null; }
  if (w.double) return goodsWorth(Math.max(4, owed * 2, took * 2));
  if (w.cut) return goodsWorth(Math.max(3, Math.ceil(owed * w.cut)));
  if (w.n) return goodsWorth(w.n, 'food');
  return null;
}
const takeGoods = (f, items) => Object.entries(items).forEach(([k, n]) => { H.add(k, -n); if (STOCK.includes(k)) f[k] = (f[k] || 0) + n; });

/* ---------- the visit ---------- */
const V = {};
V.visitable = visitable;
V.backAt = backAt;
V.clock = clock;
V.hours = hours;

/* Begin the night: the runner leaves, and you are there with them for what happens at the other end */
V.go = function (s, fid, then) {
  const f = P().fac(fid); const g = G(); if (!f || !s) { if (then) then(); return; }
  s.out = { mode: 'visit', fid, loc: f.loc, back: backAt(f, g.t), note: '' }; s.q = [];
  g.visitDay = g.day; f.envoyDay = g.day;                     /* tonight's visit is tomorrow's diplomatic moment (1.11) */
  f.met = true; s.visits = (s.visits || 0) + 1;
  arrive(s, f);
  H.flush(then);
};

function arrive(s, f) {
  const st = P().stage(f); const cid = hostOf(f); const hc = cast(cid); const h = hc ? hc.name : 'Someone'; const r = first(s);
  if (cid) P().meet(f, cid);
  const o = s.out; o.host = cid;
  const ml = MOODLINE[st] || MOODLINE.wary;
  const text = `<i>${(PLACE[f.id] || ((hh, rr) => `${hh} meets ${rr} at the door.`))(h, r, s)}</i>\n\n${ml.say ? sayAs(cid, ml.say) : `<i>${ml.do(h, r)}</i>`}`;
  const ch = [];
  /* amends first, in red, while they hold a grudge */
  const a = P().AMENDS[f.id]; const gr = f.grudge;
  if (gr && !gr.forever) {
    if (gr.blood && !(a && a.visit)) {
      if (f.id === 'gate' && gr.by === s.id) ch.push({ label: `<span class="vamend">Leave ${r} with them</span>`, fn() { return amendGive(s, f); } });
      const goods = goodsWorth(15);
      ch.push({ label: `<span class="vamend">Pay for the blood</span>`, sub: goods ? P().itemText(goods) + ', and whatever they do to ' + r : '', off: !goods, why: 'You do not have enough to pay for a life.', fn() { return amendBlood(s, f, goods); } });
    } else if (a && a.visit) ch.push({ label: `<span class="vamend">${AMEND_LABEL[a.visit]}</span>`, fn() { return amendVisit(s, f, a.visit); } });
    else { const goods = amendsGoods(f); ch.push({ label: `<span class="vamend">Give them what they asked for</span>`, sub: goods ? P().itemText(goods) : '', off: !goods, why: 'You do not have what they asked for.', fn() { takeGoods(f, goods); P().gift(f, goods); s.out.note = `${first(s)} carried what ${short(f)} asked for to their door. It is settled.`; return `<i>They count it in front of ${r}, slowly, twice.</i>\n\n${sayAs(cid, 'It is finished. Do not make us say it again.')}`; } }); }
  }
  if (st !== 'enemies') ch.push({ label: 'Trade', icon: 'bag', sub: { strangers: 'Their prices, not yours', wary: 'Their prices, not yours', good: 'Fair prices', allies: 'Fair prices', hostile: 'They will make you pay for it' }[st], fn() { return trade(s, f); } });
  ch.push({ label: 'Ask', sub: st === 'good' || st === 'allies' ? '' : 'What is going on out there', off: st === 'hostile' || st === 'enemies', why: 'They will not tell you anything.', fn() { return askMenu(s, f, st); } });
  ch.push({ label: 'Give', off: !GIVE.some((k) => H.inv(k) > 0), why: 'You have nothing to give.', fn() { return giveMenu(s, f, st); } });
  const pr = promises(f, st); if (pr.length) ch.push({ label: 'Promise', sub: pr.length === 1 ? pr[0].short : '', fn() { return promiseMenu(s, f, pr); } });
  ch.push({ label: 'Threaten', fn() { return threaten(s, f, st); } });
  if (st !== 'enemies') ch.push({ label: 'Sit and talk', sub: hc ? `${h.replace(/^(Fr\.|Dr\.|Prof\.|Sgt\.|Mr\.|Mrs\.|Mama|Nurse|Chef|Captain) /, '')} has the night` : '', fn() { return sit(s, f, st, cid); } });
  ch.push({ label: 'Go home', fn() { s.out.note = s.out.note || `${first(s)} went to ${short(f)} and came back without doing anything.`; return ''; } });
  ch.prompt = `What does ${r} do?`;
  H.ask(f.name, text, ch, artOf(s, cid, f));
}
/* a sub-menu's Back returns to the arrival card */
const back = (s, f) => ({ label: 'Back', fn() { arrive(s, f); return ''; } });

/* ---------- trade ---------- */
const RATE = { strangers: 1.5, wary: 1.5, good: 1, allies: 1, hostile: 2 };
function trade(s, f) {
  const st = P().stage(f); const sz = P().size(f); const theirs = {};
  STOCK.forEach((k) => { const spare = Math.min(8, Math.floor((f[k] || 0) - (['food', 'water'].includes(k) ? sz * 0.6 : 1))); if (spare > 0) theirs[k] = spare; });
  if (!Object.keys(theirs).length) { s.out.note = `${short(f)} had nothing to trade.`; return `<i>${cap(short(f))} open their stores to show ${first(s)}. There is nothing on the shelves worth the walk.</i>`; }
  const orig = Object.assign({}, theirs);
  const rate = clamp((RATE[st] || 1.5) - P().envoyScore(s, f) / 250, 0.85, 2.2);
  const want = STOCK.slice().sort((a, b) => (f[a] || 0) / (a === 'food' || a === 'water' ? sz : 3) - (f[b] || 0) / (b === 'food' || b === 'water' ? sz : 3))[0];
  H.barter({ name: f.name, theirs, rate, want, src: 'inv', onDone(t) {
    const moved = []; Object.keys(Object.assign({}, orig, t)).forEach((k) => { const d = (t[k] || 0) - (orig[k] || 0); if (!d) return; if (STOCK.includes(k)) f[k] = Math.max(0, (f[k] || 0) + d); moved.push([k, d]); });
    P().deed(f, 'trade', { tags: ['deal'] });
    const got = moved.filter(([, d]) => d < 0).map(([k, d]) => `${-d} ${NAME(k)}`).join(' and ');
    s.out.note = `${first(s)} traded with ${short(f)}${got ? ' and came back with ' + got : ''}.`;
  } });
  if (!s.out.note) s.out.note = `${first(s)} went to ${short(f)} to trade, and came back with nothing.`;
  return '';
}

/* ---------- ask ---------- */
function news(f) {
  const g = G(); const out = [];
  const raid = g.flags && g.flags.groupRaid && (g.groups || []).find((x) => x.id === g.flags.groupRaid);
  if (raid && raid.fid !== f.id && P().fac(raid.fid)) out.push([`${P().fac(raid.fid).name} have been asking about your house. How many of you. Who keeps watch.`, [P().fac(raid.fid)]]);
  (g.wars || []).filter((w) => w.on).forEach((w) => { const a = P().fac(w.a), b = P().fac(w.b); if (a && b) out.push([`${a.name} and ${b.name} are fighting. People have died on both sides this week.`, [a, b]]); });
  P().live().filter((o) => o.id !== f.id && o.food < P().size(o) * 0.4).forEach((o) => out.push([`${o.name} are starving. Their children have stopped crying, which is worse.`, [o]]));
  P().live().filter((o) => o.id !== f.id && o.grudge).forEach((o) => out.push([`${o.name} say your name the way people say the name of someone they will one day see again.`, [o]]));
  P().live().filter((o) => o.id !== f.id && o.leader && f2o(f, o) < -20).forEach((o) => out.push([`Nobody here trusts ${short(o)}. ${(P().leaderOf(o) || {}).name || 'Their leader'} has been seen talking to the Gate Boys.`, [o]]));
  const fresh = out.filter(([t]) => !(g.rumors || []).some((r) => r.t === t));
  return fresh.length ? pick(fresh) : [pick(['The soldiers on the Abuja road are taking money now, not names.', 'Somebody saw lights in the Senate building. Nobody lives there.', 'They say the water in the Hostel C tank is bad. Three people are sick from it.', 'A boy from the south hostels went to the gate to trade and has not come back.']), []];
}
const f2o = (a, b) => { try { return P().f2o(a, b); } catch (e) { return 0; } };
function askMenu(s, f, st) {
  const cid = s.out.host; const r = first(s); const sz = P().size(f);
  const loanK = ['food', 'water', 'meds'].filter((k) => (f[k] || 0) > (k === 'meds' ? 4 : sz * 0.7)).sort((a, b) => (f[b] || 0) - (f[a] || 0))[0];
  const ch = [{ label: 'What is going on out there', fn() {
    const [t, fs] = news(f); P().rumor(t, 0.7, fs); s.out.note = `${first(s)} heard at ${short(f)}: ${t.charAt(0).toLowerCase() + t.slice(1)}`;
    return sayAs(cid, t);
  } }];
  if (st === 'good' || st === 'allies') {
    const big = st === 'allies'; const n = big ? 8 : 4, owe = big ? 11 : 6, days = big ? 7 : 5;
    ch.push({ label: big ? 'A big loan' : 'A small loan', sub: loanK ? `${n} ${NAME(loanK)}, ${owe} back in ${days} days` : 'They have nothing to spare', off: !loanK, why: 'They have nothing to spare.', fn() {
      const yes = chance(0.55 + P().envoyScore(s, f) / 100 + (f.p - 15) / 120);
      if (!yes) { s.out.note = `${short(f)} would not lend ${first(s)} anything.`; return sayAs(cid, 'Not this week. Ask me when we are not counting grains.'); }
      f[loanK] -= n; H.add(loanK, n); G().ledger.push({ id: Date.now() + Math.random(), fid: f.id, dir: 'owe', items: { [loanK]: owe }, due: G().day + days, status: 'open' });
      s.out.note = `${short(f)} lent ${first(s)} ${n} ${NAME(loanK)}. You owe them ${owe} by day ${G().day + days}.`;
      return `${sayAs(cid, `${owe} back by day ${G().day + days}. We write it down. We always write it down.`)}\n\n<i>${r} carries it home under ${his(s)} shirt.</i>`;
    } });
    ch.push({ label: 'Warn us if anyone comes for us', fn() {
      f.warnUntil = G().day + 10; const g = G(); const raid = g.flags && g.flags.groupRaid && (g.groups || []).find((x) => x.id === g.flags.groupRaid);
      if (raid && raid.fid !== f.id) { const rf = P().fac(raid.fid); s.out.note = `${short(f)} told ${first(s)} that ${rf ? rf.name : raid.name} are coming for you.`; return sayAs(cid, `You did not hear it from us. ${rf ? rf.name : raid.name}. Soon. Sleep in your shoes.`); }
      s.out.note = `${short(f)} said they would send word if anyone moves against you.`; return sayAs(cid, 'Nobody that we know of. If that changes, somebody will knock on your door before they do.');
    } });
    const fresh = f.members.filter((m) => m !== f.leader && m !== cid && !f.missing.includes(m) && !(f.seen || []).includes(m) && cast(m));
    ch.push({ label: 'Who here should we know', off: !fresh.length, why: 'You have met everyone worth meeting here.', fn() {
      const m = pick(fresh); const c = cast(m); P().meet(f, m); const t = (c.topics || []).find((q) => q.layer !== 'secret'); if (t) P().know(m, t.lines[0], 'told');
      s.out.note = `${first(s)} met ${c.name} at ${short(f)}.`;
      return `<i>${cast(cid) ? cast(cid).name : 'They'} call${cast(cid) ? 's' : ''} someone over. ${c.name}. ${c.role || ''}.</i>\n\n${t ? sayAs(m, t.lines[0]) : ''}`;
    } });
  }
  ch.push(back(s, f));
  H.ask('Ask', `<i>${r} asks.</i>`, ch, artOf(s, cid, f)); return '';
}

/* ---------- give ---------- */
function giveMenu(s, f, st) {
  const cid = s.out.host; const have = GIVE.filter((k) => H.inv(k) > 0);
  const ch = have.slice(0, 7).map((k) => ({ label: cap(NAME(k)), sub: `You have ${H.inv(k)}`, fn() { return amountMenu(s, f, k); } }));
  if (st === 'good' || st === 'allies') { const k = ['food', 'water', 'meds'].find((x) => H.inv(x) >= 6); if (k) ch.push({ label: `Lend them 4 ${NAME(k)}`, sub: `5 back in six days`, fn() { H.add(k, -4); f[k] = (f[k] || 0) + 4; G().ledger.push({ id: Date.now() + Math.random(), fid: f.id, dir: 'owed', items: { [k]: 5 }, due: G().day + 6, status: 'open' }); P().deed(f, 'kindness', { mult: 0.5, tags: ['share'], quiet: true }); s.out.note = `${first(s)} lent ${short(f)} 4 ${NAME(k)}. They owe you 5 by day ${G().day + 6}.`; return sayAs(cid, 'Five back. You have our word, for whatever our word is worth this month.'); } }); }
  const war = (G().wars || []).find((w) => w.on && [w.a, w.b].includes(f.id)); const foe = war && P().fac(war.a === f.id ? war.b : war.a);
  if (foe && foe.status === 'active') ch.push({ label: `Send food for their fight with ${foe.name}`, sub: '3 food and 3 water', off: H.inv('food') < 3 || H.inv('water') < 3, why: 'You do not have it to send.', fn() {
    H.add('food', -3); H.add('water', -3); f.food += 3; f.water += 3; f.morale = clamp((f.morale || 50) + 10, 0, 100);
    P().deed(f, 'aid', { tags: ['loyal', 'courage'].concat(f.id === 'gate' ? ['deal_gate', 'help_gate'] : []), gift: { food: 3 }, text: `When ${foe.name} came for us, you sent food.` });
    P().deed(foe, 'sided', { tags: f.id === 'gate' ? ['deal_gate', 'help_gate'] : [], text: `When we fought ${f.name}, you fed them.` });
    s.out.note = `${first(s)} carried food to ${short(f)} for their fight with ${foe.name}.`; return `<i>They eat it standing up, with their weapons in their other hand.</i>`;
  } });
  ch.push(back(s, f));
  H.ask('Give', `<i>What does ${first(s)} carry over?</i>`, ch, artOf(s, cid, f)); return '';
}
function amountMenu(s, f, k) {
  const cid = s.out.host; const n0 = H.inv(k);
  const ns = [1, 2, 5, 10].filter((n) => n < n0).concat([n0]);
  const ch = ns.map((n) => ({ label: n === n0 && n > 1 ? `All of it (${n})` : `${n}`, fn() { return give(s, f, k, n); } }));
  ch.push({ label: 'Back', fn() { giveMenu(s, f, P().stage(f)); return ''; } });
  H.ask(cap(NAME(k)), `<i>How much ${NAME(k)}?</i>`, ch, artOf(s, cid, f)); return '';
}
function give(s, f, k, n) {
  const cid = s.out.host; const had = !!f.grudge; const hungry = f.food < P().size(f) * 0.5;
  H.add(k, -n); if (STOCK.includes(k)) f[k] = (f[k] || 0) + n;
  P().gift(f, { [k]: n }, { text: P().value({ [k]: n }) >= 5 ? `${first(s)} walked ${NAME(k)} to us in the dark.` : null });
  s.out.note = `${first(s)} gave ${short(f)} ${n} ${NAME(k)}.`;
  if (had && !f.grudge) { s.out.note += ' It settled what was between you.'; return `<i>They count it in front of ${first(s)}.</i>\n\n${sayAs(cid, 'It is finished between us. Not forgotten. Finished.')}`; }
  return hungry && (k === 'food' || k === 'water' || k === 'meal') ? `<i>It is gone before ${first(s)} has finished putting it down. A woman says thank you without looking up.</i>` : `<i>${cast(cid) ? cast(cid).name : 'Someone'} takes it and puts it away. ${n > 3 ? 'A nod.' : 'Nothing is said.'}</i>`;
}

/* ---------- promise ---------- */
function promises(f, st) {
  const out = []; const has = (t) => P().pactOf(f, t);
  if (!has('nonaggr') && (st !== 'enemies' || (f.fear || 0) >= 40)) out.push({ type: 'nonaggr', label: 'A truce', short: 'A truce', sub: 'Neither side raids or takes from the other for twelve days' });
  if ((st === 'good' || st === 'allies') && !has('trade')) out.push({ type: 'trade', label: 'A trade pact', short: 'A trade pact', sub: 'Fair prices both ways for twelve days' });
  return out;
}
function promiseMenu(s, f, pr) {
  const cid = s.out.host;
  const ch = pr.map((q) => ({ label: q.label, sub: q.sub, fn() {
    const ai = (K().group[f.id] || {}).ai || { honor: 0.5 }; const st = P().stage(f);
    const sc = f.p / 100 + P().envoyScore(s, f) / 90 + (ai.honor || 0.5) * 0.3 + (st === 'hostile' ? -0.1 : 0) + (st === 'enemies' ? (f.fear || 0) / 200 - 0.3 : 0);
    if (sc > 0.35 + Math.random() * 0.25) {
      G().pacts.push({ type: q.type, with: f.id, until: G().day + 12, between: ['player', f.id] });
      P().deed(f, 'kindness', { mult: 0.4, tags: ['written', 'word'], quiet: true, text: q.type === 'trade' ? 'We shook on fair prices. Twelve days.' : 'We shook on a truce. Twelve days. We are counting.' });
      s.out.note = `${first(s)} made ${q.label.toLowerCase().replace(/^a /, 'a ')} with ${short(f)}, until day ${G().day + 12}.`;
      return `${sayAs(cid, 'Twelve days. Break it and everybody on this campus will know by morning.')}\n\n<i>They spit in their palms and shake.</i>`;
    }
    s.out.note = `${short(f)} would not make ${q.label.toLowerCase()} with you.`;
    return sayAs(cid, st === 'hostile' || st === 'enemies' ? 'Your word. What is that worth? Go home.' : 'Perhaps when we know you better.');
  } }));
  ch.push(back(s, f));
  H.ask('Promise', `<i>What does ${first(s)} offer them?</i>`, ch, artOf(s, cid, f)); return '';
}

/* ---------- threaten ---------- */
function threaten(s, f, st) {
  const cid = s.out.host; const r = first(s); const ratio = (P().myPower() * 1.1) / Math.max(1, P().power(f));
  if (ratio > 0.9 && chance(0.7)) {
    P().deed(f, 'threat', { text: `You sent ${r} to our door to threaten us.` });
    let paid = '';
    if ((f.fear || 0) >= 40 && (f.food || 0) > 3) { f.food -= 2; H.add('food', 2); paid = ` They pushed 2 food across the floor to make ${him(s)} leave.`; }
    s.out.note = `${r} threatened ${short(f)}. They backed down.${paid}`;
    return `<i>Nobody moves for a long moment. Then ${cast(cid) ? cast(cid).name : 'someone'} looks away first.${paid}</i>`;
  }
  P().deed(f, 'threat', { mult: 2, text: `You sent ${r} to threaten us. We sent ${him(s)} back to you.` });
  const g = (G().groups || []).find((q) => q.fid === f.id); if (g && chance(0.5)) G().flags.groupRaid = g.id;
  H.hurt(s, rnd(10, 25), `Beaten at ${f.name} for threatening them.`);
  s.out.note = `${r} threatened ${short(f)}. They beat ${him(s)} and threw ${him(s)} out.`;
  return `<i>They laugh. Then three of them take ${r} outside and do it properly, where everyone can watch.</i>`;
}

/* ---------- sit and talk ---------- */
function sit(s, f, st, cid) {
  const r = first(s); const c = cast(cid); const out = [];
  const [t, fs] = news(f); P().rumor(t, 0.6, fs); out.push(sayAs(cid, t));
  const mem = (f.said || []).length ? pick(f.said).t : null;
  if (mem && st !== 'hostile') out.push(`<i>Later, ${c ? c.name : 'someone'} says something about your house:</i> ${sayAs(cid, mem)}`);
  if (c) { const tp = (c.topics || []).filter((q) => q.layer !== 'secret'); for (const q of tp) { if (P().know(cid, q.lines[0], 'told')) break; } }
  const fresh = f.members.filter((m) => m !== cid && !f.missing.includes(m) && !(f.seen || []).includes(m) && cast(m));
  let met = '';
  if (fresh.length && st !== 'hostile') { const m = pick(fresh); P().meet(f, m); met = cast(m).name; out.push(`<i>${met} brings water. ${cap(he(cast(m)))} does not sit, but ${he(cast(m))} listens to every word.</i>`); }
  if (st !== 'hostile') P().deed(f, 'kindness', { mult: 0.25, quiet: true });
  H.mood(s, 2);
  out.push(`<i>${r} walks home a little after ${clock(s.out.back - Math.round(hours(f) * 60))}.</i>`);
  s.out.note = `${r} sat with ${c ? c.name : 'them'} at ${short(f)}. ${t}${met ? ` ${r} met ${met}.` : ''}`;
  H.remember(s, `I sat up half the night at ${short(f)} with ${c ? c.name : 'them'}. They talk like people who have stopped expecting to be rescued.`, { w: 3 });
  return out.join('\n\n');
}

/* ---------- amends in person ---------- */
function amendVisit(s, f, kind) {
  const r = first(s); const cid = s.out.host; const c = cast(cid); const hn = c ? c.name : 'Their leader';
  if (kind === 'confess') {
    P().amends(f); H.hurt(s, rnd(4, 9), 'Dug graves at the chapel until both hands bled.'); s.fatigue = clamp((s.fatigue || 0) + 30, 0, 100); H.mood(s, -6);
    const n = pick(['three', 'four', 'five', 'six']); s.out.note = `${r} came back from the Chapel with ${his(s)} hands wrapped in cloth, and would not say what ${he(s)} had been digging.`;
    H.remember(s, `I dug ${n} graves behind the chapel. One of them was small. I cannot stop seeing the size of it.`, { w: 8 });
    return `<i>${r} tells it all. ${hn} listens with eyes shut. When it is done, someone hands ${r} a shovel.</i>\n\n<i>There are ${n} behind the chapel wall, wrapped in curtains. One of them is a child. The ground is hard from the harmattan and ${r} digs until both hands bleed.</i>\n\n${sayAs(P().fac('chapel').leader || cid, 'It is finished between us. Go home before the patrol.')}`;
  }
  if (kind === 'hearing') {
    const fine = goodsWorth(8); const sentence = fine && chance(0.5) ? 'fine' : chance(0.5) ? 'cane' : 'work';
    P().amends(f);
    if (sentence === 'fine') { takeGoods(f, fine); s.out.note = `The Council fined your house ${P().itemText(fine)}. ${r} paid it. It is settled.`; return `<i>The hearing takes two hours. Every wrong is read out from the book.</i>\n\n${sayAs(cid, `The house will pay ${P().itemText(fine)}. Tonight. Then it is closed.`)}\n\n<i>${r} pays it.</i>`; }
    if (sentence === 'cane') { H.hurt(s, rnd(15, 25), 'Caned in front of the Theatre Council.'); H.mood(s, -10); s.out.note = `The Council caned ${r} on the stage, in front of everyone. It is settled.`; H.remember(s, 'They caned me on the stage of the New Theatre. People I know were watching. Some of them clapped.', { w: 9 }); return `<i>The hearing takes two hours. The sentence takes ten minutes. They do it on the stage, under the lamp, and people come in from the halls to watch.</i>`; }
    s.out.back += 24 * 60; s.out.note = `The Council kept ${r} a full day to work off what you owe. It is settled.`; return `${sayAs(cid, `${r} will work for the Council until tomorrow night. Latrines first.`)}\n\n<i>${r} does not come home tonight.</i>`;
  }
  if (kind === 'fight') {
    const gate = P().fac('gate'); const dead = chance(0.06);
    P().amends(f); P().deed(f, 'kindness', { mult: 0.5, tags: ['courage', 'loyal'], quiet: true });
    if (gate && gate.status === 'active') P().deed(gate, 'hurt', { text: `${r} came at our boys with the Pitch Boys.`, heard: `${r} fought beside the Pitch Boys against the Gate Boys.` });
    if (dead) { H.kill(s, 'Killed fighting beside the Pitch Boys.'); return `<i>They go for the Gate Boys' runners at the back of the stadium. It is over in a minute. ${r} is the one who does not get up.</i>\n\n<i>The Pitch Boys carry ${him(s)} back to your door before dawn and lay ${him(s)} on the step, and they stand there with their heads down until somebody opens it.</i>`; }
    H.hurt(s, rnd(15, 35), 'Hurt fighting the Gate Boys with the Pitch Boys.');
    s.out.note = `${r} came back from the pitch bleeding, with a Pitch Boys armband ${he(s)} did not ask for.`;
    return `<i>They go for the Gate Boys' runners at the back of the stadium. It is over in a minute. ${r} hits someone until he stops moving and does not know if he will ever move again.</i>\n\n${sayAs(cid, 'Now we talk.')}`;
  }
  if (kind === 'rescue') {
    const gate = P().fac('gate'); const dead = chance(0.05); const ok = !dead && chance(0.7);
    if (dead) { H.kill(s, 'Killed bringing a girl out of the Gate Boys\' ground.'); P().deed(f, 'kindness', { quiet: true }); return `<i>They go in through the drainage ditch behind the gate. Somebody shouts. There are shots.</i>\n\n<i>The Sisterhood come back without the girl and without ${r}.</i>`; }
    if (chance(0.45)) H.hurt(s, rnd(10, 25), 'Hurt bringing a girl out of the Gate Boys\' ground.');
    if (!ok) { P().deed(f, 'kindness', { mult: 0.5, quiet: true }); s.out.note = `${r} went with the Sisterhood to bring a girl out from the gate. They could not reach her.`; return `<i>They wait in the ditch for three hours. The girl never comes to the window.</i>\n\n${sayAs(cid, 'You came. That counts for something. It does not count for everything.')}`; }
    P().amends(f); if (gate && gate.status === 'active') P().deed(gate, 'took', { quiet: true, text: 'Somebody took a girl out of our ground. We are asking who.' });
    s.out.note = `${r} helped the Sisterhood bring a girl out of the Gate Boys' ground. She is fifteen.`;
    H.remember(s, 'We pulled a girl out through a window at the gate. She did not make a sound the whole way. She is fifteen.', { w: 8 });
    return `<i>They go in through the drainage ditch behind the gate. The girl is waiting at the window. She does not make a sound the whole way back.</i>\n\n${sayAs(cid, 'Now we know what you are.')}`;
  }
  if (kind === 'apology') {
    const eldest = H.alive().slice().sort((a, b) => ageOf(b) - ageOf(a))[0];
    if (eldest && eldest.id !== s.id) { P().deed(f, 'refuse', { quiet: true }); s.out.note = `${short(f)} would not hear an apology from ${r}. They want ${eldest.name}.`; return `<i>${hn} looks past ${r}, at the door.</i>\n\n${sayAs(cid, `I asked for your eldest. Send ${eldest.name}. Do not insult us twice.`)}`; }
    P().amends(f); H.mood(s, -5); s.out.note = `${r} went to the Senate and apologised for the house, on ${his(s)} knees. It is settled.`;
    return `<i>They make ${r} say it twice. The second time on ${his(s)} knees, on the carpet, while somebody writes it down.</i>`;
  }
  if (kind === 'watch') {
    const g = G(); const dawn = Math.ceil((g.t + 1) / 1440) * 1440 + 6 * 60; s.out.back = Math.max(s.out.back, dawn);
    const dead = chance(0.03); P().amends(f);
    if (dead) { H.kill(s, 'Shot standing a night watch at the guardhouse.'); return `<i>${r} stands the watch with them. A little before four, a car comes down the road with its lights off.</i>\n\n<i>${r} is the one standing closest to the barrier.</i>`; }
    if (chance(0.3)) H.hurt(s, rnd(10, 30), 'Shot at standing watch at the guardhouse.');
    s.out.note = `${r} stood the night watch at the guardhouse with Security. It is settled.`;
    return `<i>${r} stands the watch until dawn. Twice there are shots from the road. Nobody talks about them afterwards.</i>\n\n${sayAs(cid, 'You stood. That is all we asked.')}`;
  }
  return '';
}
const ageOf = (s) => (s.age || (cast(s.cid) || {}).age || 25);
function amendBlood(s, f, goods) {
  const r = first(s); const cid = s.out.host; takeGoods(f, goods);
  const dead = chance(0.04); P().amends(f);
  if (dead) { H.kill(s, `Beaten to death at ${f.name}, paying for a life.`); return `<i>They take what ${r} carried. Then they take ${r} into the yard, where the dead one's friends are waiting.</i>\n\n<i>They do not stop when they should.</i>`; }
  H.hurt(s, rnd(20, 35), `Beaten at ${f.name} to pay for a death.`); H.mood(s, -12);
  s.out.note = `${r} paid ${short(f)} for the life your house took. ${cap(he(s))} came back beaten nearly blind. It is settled.`;
  H.remember(s, 'I paid for the one we killed. With food, and then with my face. I let them. I would let them again.', { w: 9 });
  return `<i>They take what ${r} carried. Then they take ${r} into the yard, where the dead one's friends are waiting, and ${r} does not put ${his(s)} hands up.</i>\n\n${sayAs(cid, 'It is paid.')}`;
}
function amendGive(s, f) {
  const r = first(s); P().amends(f); H.moodAll(-12, s);
  s.out.never = true; s.out.note = `${r} did not come back from the gate. The Gate Boys say it is settled.`;
  H.remember(s, 'They asked for the one who did it. I went.', { w: 10 });
  return `<i>${r} tells them it was ${him(s)}. Nobody is surprised. The boys at the barrier stand up.</i>\n\n<i>${r} does not look back at the road home.</i>`;
}

/* ---------- home again ---------- */
/* called when the visit's time is up; the walk home in the dark can still go wrong */
const report = (s, t) => { if (G().nrep) H.toReport(t); else H.say(`${s.name} is back`, `<i>${t}</i>`, { sp: s.sp, state: H.stateOf(s) }); };
V.back = function (s, o) {
  const f = P().fac(o.fid); const where = f ? short(f) : 'their visit';
  if (o.never) { H.kill(s, 'Given up to the Gate Boys.'); report(s, `${s.name} did not come back from the gate.`); return; }
  s.fatigue = clamp((s.fatigue || 0) + 12, 0, 100);
  const st = f ? P().stage(f) : 'wary'; const risk = st === 'enemies' ? 2.5 : st === 'hostile' ? 1.6 : 1;
  if (chance(0.012 * risk)) { H.kill(s, `Killed walking home from ${where}.`); report(s, `${s.name} never came back from ${where}. ${cap(where)} say ${he(s)} left them before midnight.`); return; }
  let line = o.note || `${s.name} came back from ${where}.`;
  if (chance(0.06 * risk)) { H.hurt(s, rnd(8, 20), `Caught by a patrol walking home from ${where}.`); line += ` A patrol caught ${him(s)} on the way home.`; }
  report(s, line);
};

/* the morning card: a group that promised to warn you keeps its word */
V.dawn = function () {
  const g = G(); const out = []; const raid = g.flags && g.flags.groupRaid && (g.groups || []).find((x) => x.id === g.flags.groupRaid); if (!raid) return out;
  P().live().filter((f) => f.warnUntil >= g.day && f.id !== raid.fid && f.warned !== raid.id).slice(0, 1).forEach((f) => { f.warned = raid.id; const rf = P().fac(raid.fid); out.push(`Someone from ${f.name} knocked once before dawn and was gone. A note under the door: "${rf ? rf.name : raid.name}. Soon."`); });
  return out;
};

Object.defineProperty(V, 'host', { set(h) { H = h; }, get() { return H; } });
C.Visits = V;
if (typeof module !== 'undefined') module.exports = V;
})(typeof window !== 'undefined' ? window : globalThis);
