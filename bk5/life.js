/* CRISIS — a living campus
   Things that happen between other people whether or not you are watching, and that you can step into or stay out of:
     threads   background stories (affairs, betrayals, debts, feuds, weddings, missing people, accusations) that advance by themselves
     gist      the way you hear about them, from your own people, in their own voices
     nemesis   people who hold a grudge against you and escalate: notes, sabotage, ambush, showdown
     turning   ordinary people, and even your own, can cross over and become bandits
     favours   requests, people asking to join you, and favours that come back
   plus a set of everyday Nigerian moments, and the hidden note from the author. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const S = C.Story, P = C.Politics, V = C.Voice, K = () => C.Cast;
const H = () => S.host, G = () => S.host.G;
const { pick, chance, rnd, clamp, first, speak, portrait, bond } = S;
const ask = (t, x, c, a) => H().ask(t, x, c, a), say = (t, x, a) => H().say(t, x, a);
const all = (n) => H().moodAll(n), mood = (s, n) => H().mood(s, n);
const cn = (cid) => (K().by[cid] || { name: 'Someone' }).name;
const npc = (cid, text) => { const c = K().by[cid]; if (!c) return `<i>${text}</i>`; return S.bubble(c.name, 'you', V.say(c.voice, text, { id: cid })); };
const art = (cid, st) => ({ sp: P.face(cid), state: st || 'ok' });
const facOf = (cid) => (G().fac || []).find((f) => f.members.includes(cid));
const nonLeaders = (f) => f.members.filter((m) => m !== f.leader);
const pickMember = (f) => { const m = nonLeaders(f); return m.length ? pick(m) : null; };
const leaderName = (f) => (f.leader ? cn(f.leader) : 'their leader');
const trust = (s, n) => { s.trust = clamp((s.trust || 0) + n, 0, 100); };
const L = {};

/* ---------- people moving, dying, turning ---------- */
function moveMember(cid, toId) {
  const f = facOf(cid), t = P.fac(toId); if (!f || !t || f === t) return false;
  f.members = f.members.filter((m) => m !== cid); if (f.leader === cid) f.leader = f.members[0] || null; t.members.push(cid); return true;
}
function removeMember(cid, why) {
  const f = facOf(cid); if (!f) return false; f.members = f.members.filter((m) => m !== cid); if (f.leader === cid) f.leader = f.members[0] || null; f.morale = clamp(f.morale - 8, 0, 100);
  const g = G(); g.fallen = g.fallen || []; g.fallen.push({ id: cid, name: cn(cid), group: f.id, day: g.day, why }); return true;
}
L.turnBandit = function (cid, why) {
  const g = G(); g.turned = g.turned || []; if (g.turned.some((t) => t.cid === cid)) return false;
  const from = facOf(cid); if (!from || from.id === 'gate') return false; if (!moveMember(cid, 'gate')) return false;
  g.turned.push({ cid, day: g.day, from: from.id, why: why || '' });
  P.rumor(`${cn(cid)} of ${from.name} has been seen with the Gate Boys, rifle and all. ${why === 'hunger' ? 'Some say hunger did it.' : 'Nobody saw it coming, or everybody did.'}`, 0.8, [from]);
  from.morale = clamp(from.morale - 6, 0, 100); return true;
};
L.turnSurvivor = function (s) {
  if (!s.cid || (s.trust || 0) >= 55 || !chance(0.22)) return false; const g = G(), gate = P.fac('gate'); if (!gate || gate.status !== 'active') return false;
  g.turned = g.turned || []; gate.members.push(s.cid); g.turned.push({ cid: s.cid, day: g.day, from: 'party', why: 'broke', sid: s.id });
  P.rumor(`${s.name} is with the Gate Boys now. They walked out of a shelter in the dark.`, 0.7, [gate]); return true;
};
function rejoin(cid) {
  const g = G(), s = g.S.find((x) => x.cid === cid && !x.alive && x.gone); if (!s) return null;
  s.alive = true; s.gone = false; s.hunger = 60; s.thirst = 50; s.mood = 45; s.hp = Math.max(s.hp, 60); s.trust = 20; s.wound = false; s.wnd = null;
  const gate = P.fac('gate'); if (gate) gate.members = gate.members.filter((m) => m !== cid); const t = (g.turned || []).find((q) => q.cid === cid); if (t) t.rejoined = true; g.stats.left = Math.max(0, g.stats.left - 1); return s;
}

/* ---------- nemesis ---------- */
L.nem = function (f, reason, heat) {
  const g = G(); if (!f || f.status !== 'active') return null; g.nem = g.nem || [];
  let n = g.nem.find((x) => x.fid === f.id && !x.resolved);
  if (n) { n.heat = clamp(n.heat + heat, 0, 100); n.reason = reason; return n; }
  if (g.nem.filter((x) => !x.resolved).length >= 3) return null;
  const cid = pickMember(f) || f.members[0]; if (!cid) return null;
  n = { id: 'n' + (g.nemSeq = (g.nemSeq || 0) + 1), fid: f.id, cid, reason, heat: clamp(heat, 0, 100), born: g.day, resolved: false, last: 0 }; g.nem.push(n); return n;
};
function nemTick() {
  const g = G(); (g.nem || []).forEach((n) => { if (n.resolved) return; const f = P.fac(n.fid); if (!f || f.status !== 'active' || !f.members.includes(n.cid)) { const alt = f && f.status === 'active' ? pickMember(f) : null; if (alt) n.cid = alt; else { n.resolved = true; return; } } n.heat = clamp(n.heat + 1 + (f.p < -50 ? 1 : 0), 0, 100); if (n.heat < 8) n.resolved = true; });
}

/* ---------- background threads ---------- */
const spot = () => pick(['the water point', 'the generator house', 'the chapel steps', 'behind the cafeteria', 'the hostel roof', 'the clinic corridor', 'the football field', 'the back stairwell']);
function pairAcross(diffSex) {
  const fs = P.live().filter((f) => f.id !== 'gate' && f.members.length > 1); if (fs.length < 2) return null;
  for (let t = 0; t < 14; t++) { const f1 = pick(fs), f2 = pick(fs.filter((f) => f.id !== f1.id)); const a = pickMember(f1), b = pickMember(f2); if (!a || !b) continue; if (diffSex && K().by[a].sex === K().by[b].sex) continue; return { fa: f1.id, fb: f2.id, a, b }; }
  return null;
}
function pairWithin(diffSex) {
  const fs = P.live().filter((f) => f.id !== 'gate' && nonLeaders(f).length > 1); if (!fs.length) return null;
  for (let t = 0; t < 14; t++) { const f = pick(fs), ms = nonLeaders(f); const a = pick(ms), b = pick(ms.filter((m) => m !== a)); if (!a || !b) continue; if (diffSex && K().by[a].sex === K().by[b].sex) continue; return { fa: f.id, fb: f.id, a, b }; }
  return null;
}
function single() { const fs = P.live().filter((f) => f.id !== 'gate' && f.members.length > 1); if (!fs.length) return null; const f = pick(fs), a = pickMember(f); return a ? { fa: f.id, fb: null, a, b: null } : null; }
const ctx = (th) => ({ A: cn(th.a), B: th.b ? cn(th.b) : '', f1: P.fac(th.fa), f2: th.fb ? P.fac(th.fb) : null, sp: spot() });
const rum = (t, sure, fs) => P.rumor(t, sure, fs.filter(Boolean));
const TH = {};

TH.affair = {
  w: 2, make: () => pairAcross(true),
  L: [(th, c) => `${c.A} from ${c.f1.name} and ${c.B} from ${c.f2.name} have been seen together after dark, at ${c.sp}. Their groups are not friends, you know.`,
      (th, c) => `It is out. ${c.f1.name} and ${c.f2.name} both know about ${c.A} and ${c.B}. They say ${leaderName(c.f1)} slapped ${c.A} in front of everybody.`,
      (th, c) => th.out === 'elope' ? `${c.A} has left ${c.f1.name} and gone to live with ${c.f2.name}, for ${c.B}. Their people are calling it shame. I think it is brave.` : th.out === 'fight' ? `It ended badly. ${c.A} and ${c.B}'s people fought at ${c.sp}. ${cn(th.dead)} did not get up.` : `${c.A} and ${c.B} have ended it. Both groups pretend it never happened. Both are lying.`],
  E: [() => {}, (th, c) => { P.bump(c.f1, c.f2, -8); c.f1.morale = clamp(c.f1.morale - 3, 0, 100); }, (th, c) => {
    const r = th.guard ? 0.6 : th.expose ? 0.05 : 0.3; const x = Math.random();
    if (x < r) { th.out = 'elope'; moveMember(th.a, th.fb); rum(`${c.A} has crossed over to ${c.f2.name} for love. ${c.f1.name} are furious.`, 0.85, [c.f1, c.f2]); P.bump(c.f1, c.f2, -10); }
    else if (x < r + 0.28) { th.out = 'fight'; th.dead = pick([th.a, th.b]); removeMember(th.dead, 'killed over an affair'); rum(`Blood over ${c.A} and ${c.B}. ${cn(th.dead)} is dead.`, 0.9, [c.f1, c.f2]); P.bump(c.f1, c.f2, -22); }
    else { th.out = 'end'; P.bump(c.f1, c.f2, 3); } }],
  O: [(th, c, A) => [
        { label: 'Keep their secret', fn() { th.guard = 1; c.f1.p = clamp(c.f1.p + 2, -100, 100); return `<i>You tell yourself it is not your business to end something that might be the only good thing happening.</i>`; } },
        { label: `Tell ${leaderName(c.f1)}`, fn() { th.expose = 1; c.f1.p = clamp(c.f1.p + 7, -100, 100); return `<i>It is done. You will be remembered as the one who talked.</i>`; } },
        { label: 'Stay out of it', fn() { return `<i>Other people's love is a dangerous place to stand.</i>`; } }],
      (th, c, A) => [
        { label: `Take ${c.A}'s side`, fn() { c.f1.p = clamp(c.f1.p + 6, -100, 100); c.f2.p = clamp(c.f2.p - 5, -100, 100); th.guard = 1; return `<i>Word travels. ${c.f1.name} are pleased, and ${c.f2.name} are not.</i>`; } },
        { label: `Take ${c.B}'s side`, fn() { c.f2.p = clamp(c.f2.p + 6, -100, 100); c.f1.p = clamp(c.f1.p - 5, -100, 100); th.guard = 1; return `<i>Word travels. Somebody makes a note.</i>`; } },
        { label: 'Mind your business', fn() { return `<i>You go back to counting the water.</i>`; } }]]
};
TH.betrayal = {
  w: 1.6, make: single,
  L: [(th, c) => `${c.A} from ${c.f1.name} has been slipping out at night. A runner from the Gate Boys was seen waiting for them at ${c.sp}.`,
      (th, c) => `${c.A} was seen carrying a bag past the guard post. ${c.f1.name} are counting their stores nervously.`,
      (th, c) => th.out === 'stopped' ? `${c.A} was stopped. ${c.f1.name} caught them with the bag. Nobody will say what happened to them.` : th.out === 'caught' ? `${c.A} is gone. ${c.f1.name} found out in time and drove them out, straight to the Gate Boys.` : `${c.A} has gone over to the Gate Boys, and ${c.f1.name}'s food went with them. It is a hard morning over there.`],
  E: [() => {}, (th, c) => { c.f1.food = Math.max(0, c.f1.food - Math.round(P.size(c.f1) * 0.08)); }, (th, c) => {
    if (th.confronted) { th.out = 'stopped'; rum(`${c.A} of ${c.f1.name} was talked out of something.`, 0.5, [c.f1]); return; }
    if (th.warned) { th.out = 'caught'; L.turnBandit(th.a, 'exposed'); return; }
    th.out = 'went'; c.f1.food = Math.max(0, Math.round(c.f1.food * 0.7)); c.f1.water = Math.max(0, Math.round(c.f1.water * 0.8)); c.f1.morale = clamp(c.f1.morale - 12, 0, 100); L.turnBandit(th.a, 'betrayal'); }],
  O: [(th, c) => [
        { label: `Warn ${leaderName(c.f1)}`, fn() { th.warned = 1; c.f1.p = clamp(c.f1.p + 10, -100, 100); G().rep.honor++; return `<i>They look at you for a long moment. "We will handle it."</i>`; } },
        { label: `Talk to ${c.A} quietly`, fn() { if (chance(0.5)) { th.confronted = 1; c.f1.p = clamp(c.f1.p + 5, -100, 100); return `<i>${c.A} listens, and goes pale, and says nothing. By evening the runner has stopped coming.</i>`; } L.nem(c.f1, `you confronted ${c.A}`, 30); return `<i>${c.A} denies it. Their eyes say you have made an enemy.</i>`; } },
        { label: 'Say nothing', fn() { return `<i>You hold it. It is heavier than it looked.</i>`; } }],
      (th, c) => [
        { label: `Tell ${leaderName(c.f1)} now`, fn() { th.warned = 1; c.f1.p = clamp(c.f1.p + 6, -100, 100); return `<i>It might already be too late. It might not.</i>`; } },
        { label: 'Stay out of it', fn() { return `<i>Whatever is coming, it is coming for them.</i>`; } }]]
};
TH.debt = {
  w: 1.4, make: pairAcross.bind(null, false),
  L: [(th, c) => `${c.A} of ${c.f1.name} owes ${c.B} of ${c.f2.name} two bags of rice from before all this. ${c.B} has stopped smiling.`,
      (th, c) => `${c.B}'s boys cornered ${c.A} behind the stores. ${c.A} has a split lip and a new, very short deadline.`,
      (th, c) => th.out === 'paid' ? `It is settled. Somebody paid ${c.A}'s debt to ${c.B}. People are saying it was you, or someone like you.` : th.out === 'mediated' ? `${c.A} and ${c.B} sat down and agreed something. Nobody knows how.` : `${c.A} could not pay. ${c.B}'s people took what ${c.f1.name} had at the stores, and ${c.A} ran.`],
  E: [() => {}, (th, c) => { P.bump(c.f1, c.f2, -6); }, (th, c) => { if (th.paid) { th.out = 'paid'; P.bump(c.f1, c.f2, 8); } else if (th.med) { th.out = 'mediated'; P.bump(c.f1, c.f2, 12); } else { th.out = 'default'; ['food', 'water'].forEach((k) => { const t = Math.min(c.f1[k], 4); c.f1[k] -= t; c.f2[k] += t; }); P.bump(c.f1, c.f2, -14); L.turnBandit(th.a, 'hunger'); } }],
  O: [(th, c) => [
        { label: 'Pay it for them (3 food)', off: H().inv('food') < 3, fn() { H().add('food', -3); th.paid = 1; c.f1.p = clamp(c.f1.p + 14, -100, 100); c.f2.p = clamp(c.f2.p + 4, -100, 100); G().rep.honor++; return `<i>Three bags of nothing, to you. Everything, to them.</i>`; } },
        { label: 'Offer to mediate', fn() { if (chance(0.55 + G().rep.honor * 0.03)) { th.med = 1; c.f1.p = clamp(c.f1.p + 5, -100, 100); c.f2.p = clamp(c.f2.p + 5, -100, 100); return `<i>They agree to talk. That is all you promised.</i>`; } return `<i>${c.B} does not take mediators seriously.</i>`; } },
        { label: 'Stay out of it', fn() { return `<i>A debt is a private thing, until it is a public one.</i>`; } }],
      (th, c) => [
        { label: 'Pay it now (3 food)', off: H().inv('food') < 3, fn() { H().add('food', -3); th.paid = 1; c.f1.p = clamp(c.f1.p + 12, -100, 100); return `<i>You walk it over yourself.</i>`; } },
        { label: 'Leave them to it', fn() { return `<i>You do not look at the stores as you pass.</i>`; } }]]
};
TH.missing = {
  w: 1.3, make: single,
  L: [(th, c) => `${c.A} of ${c.f1.name} has been going door to door asking about a younger brother, last seen at the Auditorium on the first night.`,
      (th, c) => `${c.A} found a shoe that looks like the brother's. Nobody will say whether it is.`,
      (th, c) => th.out === 'alive' ? `${c.A} found their brother alive, in the MPH camp, thin and angry and perfectly fine. ${c.f1.name} cried for an hour.` : `${c.A} found out about their brother. ${c.f1.name} brought a candle and sat with them, and nobody said anything useful.`],
  E: [() => {}, () => {}, (th, c) => { const p = th.helped ? 0.72 : th.hope ? 0.6 : 0.45; if (chance(p)) { th.out = 'alive'; c.f1.morale = clamp(c.f1.morale + 9, 0, 100); } else { th.out = 'dead'; c.f1.morale = clamp(c.f1.morale - 9, 0, 100); } }],
  O: [(th, c) => [
        { label: 'Send someone to help look', fn() { th.helped = 1; c.f1.p = clamp(c.f1.p + 8, -100, 100); return `<i>It costs a night of someone's time. It might cost more. It might return everything.</i>`; } },
        { label: `Tell ${c.A} you will keep an eye out`, fn() { th.hope = 1; c.f1.p = clamp(c.f1.p + 4, -100, 100); return `<i>It costs nothing. It helps, a little.</i>`; } },
        { label: 'Say nothing', fn() { return `<i>You have your own people to count.</i>`; } }],
      (th, c) => [{ label: 'Light a candle for them', fn() { th.hope = 1; all(1); return `<i>You light it at the window. Nobody asks who it is for.</i>` } }, { label: 'Leave it', fn() { return ''; } }]]
};
TH.accused = {
  w: 1.5, make: single,
  L: [(th, c) => `${c.A} of ${c.f1.name} is being accused of stealing from the group's stores. Half the camp believes it.`,
      (th, c) => `${c.f1.name} will hold a hearing at the New Theatre. ${c.A} is saying they are innocent. Everybody says that.`,
      (th, c) => th.out === 'cleared' ? `${c.A} was cleared. Whoever stole it, it was not them. The look on their face when it was read out...` : th.out === 'exiled' ? `${c.A} was put out of ${c.f1.name}. ${th.guilty ? 'They were guilty, people say.' : 'There are some who say they were not.'}` : `${c.A} walked free, and some say it was not right. ${c.f1.name} are quiet and divided.`],
  E: [(th) => { th.guilty = chance(0.45); }, () => {}, (th, c) => { const vouched = th.vouch && !th.against; if (!th.guilty && vouched) th.out = 'cleared'; else if (th.guilty && vouched) { th.out = 'walked'; c.f1.morale = clamp(c.f1.morale - 8, 0, 100); } else { th.out = 'exiled'; removeMember(th.a, 'exiled'); if (chance(0.5)) { /* an exile has nowhere to go */ const g = P.fac('gate'); if (g && g.status === 'active') { g.members.push(th.a); G().turned = G().turned || []; G().turned.push({ cid: th.a, day: G().day, from: th.fa, why: 'exiled' }); } } if (!th.guilty) c.f1.morale = clamp(c.f1.morale - 10, 0, 100); } }],
  O: [(th, c) => [
        { label: `Vouch for ${c.A}`, fn() { th.vouch = 1; c.f1.p = clamp(c.f1.p + 8, -100, 100); G().rep.honor += th.guilty ? -1 : 1; return `<i>Your name is attached to theirs now. That works both ways.</i>`; } },
        { label: `Testify against ${c.A}`, fn() { th.against = 1; c.f1.p = clamp(c.f1.p + (th.guilty ? 6 : -8), -100, 100); G().rep.honor += th.guilty ? 1 : -2; return `<i>You say what you saw, or what you think you saw.</i>`; } },
        { label: 'Stay out of it', fn() { return `<i>You hold your tongue. A hearing is a dangerous room.</i>`; } }],
      (th, c) => [{ label: 'Go and listen at the Theatre', fn() { th.vouch = th.guilty ? 0 : 1; all(-1); return th.guilty ? `<i>It is plain to you, in the second hour, that they did it. You say nothing.</i>` : `<i>It is plain to you, in the second hour, that they did not. You say so, loudly.</i>`; } }, { label: 'Let them handle it', fn() { return ''; } }]]
};
TH.feud = {
  w: 1.6, make: pairAcross.bind(null, false),
  L: [(th, c) => `${c.A} and ${c.B} had words at the water point. ${c.A} said something about ${c.B}'s mother that I will not repeat.`,
      (th, c) => `Both sides have gathered friends. ${c.f1.name} and ${c.f2.name}. It is no longer about the words.`,
      (th, c) => th.out === 'calmed' ? `${c.A} and ${c.B} shook hands. ${c.f1.name} and ${c.f2.name} are stiff but quiet.` : th.out === 'war' ? `${c.f1.name} and ${c.f2.name} came to blows over ${c.A} and ${c.B}. There are bruises, and a grudge that will outlast the siege.` : `Nothing happened, after all. Everyone is almost disappointed.`],
  E: [() => {}, (th, c) => { P.bump(c.f1, c.f2, -8); }, (th, c) => { if (th.calm) { th.out = 'calmed'; P.bump(c.f1, c.f2, 14); } else if (th.stoke || chance(0.4)) { th.out = 'war'; P.bump(c.f1, c.f2, -14); const r = P.fight(c.f1, c.f2); rum(`${c.f1.name} and ${c.f2.name} fought. ${r.winner.name} came out ahead.`, 0.8, [c.f1, c.f2]); } else th.out = 'fizzle'; }],
  O: [(th, c) => [
        { label: 'Calm them down', fn() { if (chance(0.5 + G().rep.honor * 0.04)) { th.calm = 1; G().rep.honor++; return `<i>It takes a sachet of water each and a lot of patience.</i>`; } return `<i>They do not listen to outsiders.</i>`; } },
        { label: 'Quietly stoke it', fn() { th.stoke = 1; G().rep.honor--; return `<i>A word here, a word there. It is surprisingly easy.</i>`; } },
        { label: 'Stay out of it', fn() { return `<i>Neither of them is your friend.</i>`; } }],
      (th, c) => [{ label: 'Try to stop it', fn() { if (chance(0.45 + G().rep.honor * 0.03)) { th.calm = 1; return `<i>You step between them. It works, somehow.</i>`; } return `<i>You are shouted over.</i>`; } }, { label: 'Let it burn', fn() { return ''; } }]]
};
TH.wedding = {
  w: 1.5, make: pairWithin.bind(null, true),
  L: [(th, c) => `${c.A} and ${c.B} of ${c.f1.name} are getting married. In this. Can you believe it?`,
      (th, c) => `${c.f1.name} are planning the wedding for Saturday: one pot of jollof, if they can find the rice, and somebody's cousin who can sing.`,
      (th, c) => th.out === 'attack' ? `The wedding ended in gunfire. ${c.A} and ${c.B} were not hurt, but ${cn(th.dead)} was.` : `They married at ${c.sp}. ${c.f1.name} danced like there was no war. Everyone who could came, and the whole camp ate.`],
  E: [() => {}, () => {}, (th, c) => { if (chance(0.15)) { th.out = 'attack'; const o = nonLeaders(c.f1).filter((m) => m !== th.a && m !== th.b); th.dead = o.length ? pick(o) : th.a; removeMember(th.dead, 'killed at a wedding'); c.f1.morale = clamp(c.f1.morale - 10, 0, 100); } else { th.out = 'ok'; c.f1.morale = clamp(c.f1.morale + (th.gift ? 18 : 12), 0, 100); if (th.gift) c.f1.p = clamp(c.f1.p + 14, -100, 100); } }],
  O: [(th, c) => [
        { label: 'Send a gift (2 food)', off: H().inv('food') < 2, fn() { H().add('food', -2); th.gift = 1; c.f1.p = clamp(c.f1.p + 8, -100, 100); return `<i>A wedding is the one occasion on which nobody turns down a gift.</i>`; } },
        { label: 'Send your good wishes', fn() { c.f1.p = clamp(c.f1.p + 3, -100, 100); return `<i>Cheap. Appreciated anyway.</i>`; } },
        { label: 'Mind your business', fn() { return ''; } }],
      (th, c) => [{ label: 'Send 2 cups of rice', off: H().inv('food') < 2, fn() { H().add('food', -2); th.gift = 1; return `<i>It will be the best jollof of the week, you hope.</i>`; } }, { label: 'Wish them well', fn() { return ''; } }]]
};

function spawn() {
  const g = G(); g.threads = g.threads || []; const pool = Object.entries(TH); const live = new Set(g.threads.filter((t) => !t.done).map((t) => t.type));
  for (let t = 0; t < 8; t++) {
    let r = Math.random() * pool.reduce((a, b) => a + b[1].w, 0), pk = pool[0]; for (const it of pool) { if ((r -= it[1].w) < 0) { pk = it; break; } }
    const [type, T] = pk; if (live.has(type) && t < 6) continue; const m = T.make(); if (!m) continue;
    const th = Object.assign({ id: 'th' + (g.thSeq = (g.thSeq || 0) + 1), type, stage: 0, next: g.day + rnd(2, 3), fresh: true, told: false, done: false, born: g.day }, m);
    g.threads.push(th); T.E[0](th, ctx(th)); return th;
  }
  return null;
}
function lifeTick() {
  const g = G(); g.threads = g.threads || []; g.nem = g.nem || []; g.turned = g.turned || []; g.favors = g.favors || [];
  g.threads.forEach((th) => { if (th.done) return; const fa = P.fac(th.fa), fb = th.fb ? P.fac(th.fb) : null; const okA = fa && fa.status === 'active' && fa.members.includes(th.a); const okB = !th.b || (fb && fb.status === 'active' && fb.members.includes(th.b)); if (!okA || !okB) { th.done = true; th.void = true; th.fresh = false; } });
  g.threads.forEach((th) => { if (th.done || g.day < th.next) return; th.stage++; th.next = g.day + rnd(2, 3); const T = TH[th.type]; const c = ctx(th); if (T.E[th.stage]) T.E[th.stage](th, c); th.fresh = true; th.told = false; if (th.stage >= 2) th.done = true; });
  if (g.threads.filter((t) => !t.done).length < 3 && chance(0.55)) spawn();
  if (g.threads.length > 14) g.threads = g.threads.filter((t) => !t.done || !t.told || g.day - t.born < 8);
  /* hunger pushes people toward the people with guns */
  P.live().forEach((f) => {
    if (f.id === 'gate') return; const sz = P.size(f); const desperate = f.food < sz * 0.3 || f.morale < 30; if (!desperate) return;
    if (f.members.length > 2 && f.morale < 25 && chance(0.04)) { const cid = pickMember(f); if (cid) L.turnBandit(cid, 'hunger'); }
    const gate = P.fac('gate'); if (gate && gate.status === 'active' && f.foll > 3 && chance(0.1)) { f.foll--; gate.foll++; if (chance(0.3)) rum(`Some of ${f.name}'s hungry have gone over to the Gate Boys.`, 0.6, [f, gate]); }
  });
  nemTick();
}
L.tick = lifeTick;

/* ---------- gist: how you hear about it ---------- */
S.add({ id: 'gist', kind: 'gist', w: 3.2, cd: 1, when: (x) => (x.G.threads || []).some((t) => t.fresh && !t.told), cast: { A: (s) => s.mood > 15 },
  run(x, { A }) {
    const th = x.G.threads.find((t) => t.fresh && !t.told); th.told = true; th.fresh = false; th.known = true;
    const T = TH[th.type], c = ctx(th), body = T.L[th.stage](th, c); th.last = body;
    const lead = pick(['I heard something at the water point.', 'Somebody whispered this to me on the stairs.', 'You will not believe the gist.', 'This is not for everyone, but I will tell you.', 'Come close. This one is big.']);
    const text = `${speak(A, lead + ' ' + body)}`;
    const opts = !th.done && T.O[th.stage] ? T.O[th.stage](th, c, A) : [];
    opts.push({ label: th.done ? 'Take it in' : 'Listen, and say nothing' });
    ask(pick(['Gist', 'Word at the water point', 'You have to hear this', 'What people are saying']), text, opts, art(th.a));
  } });

/* ---------- nemesis ---------- */
S.add({ id: 'nemesis', kind: 'nemesis', w: (x) => 2 + Math.max(0, ...(x.G.nem || []).filter((n) => !n.resolved).map((n) => n.heat)) / 20, cd: 2,
  when: (x) => (x.G.nem || []).some((n) => !n.resolved && n.heat >= 28 && x.G.day - (n.last || 0) >= 2),
  run(x) {
    const g = x.G; const n = g.nem.filter((q) => !q.resolved && q.heat >= 28 && g.day - (q.last || 0) >= 2).sort((a, b) => b.heat - a.heat)[0]; const f = P.fac(n.fid); if (!f || f.status !== 'active') { n.resolved = true; return false; }
    n.last = g.day; const raidId = (g.groups.find((q) => q.fid === f.id) || {}).id; const who = n.cid;
    const settle = (heat) => { n.heat = clamp(n.heat - heat, 0, 100); if (n.heat < 10) { n.resolved = true; } };
    if (n.heat < 50) {
      ask(`A message from ${cn(who)}`, `A folded note under the barricade, in a hand you know. Or a boy at the door, bored, with a message he has clearly been told to deliver properly.\n\n${npc(who, `I have not forgotten. ${n.reason}. Watch yourselves.`)}`, [
        { label: 'Ignore it', fn() { n.heat = clamp(n.heat + 8, 0, 100); return `<i>It is the kind of silence that grows.</i>`; } },
        { label: 'Send word: you will make it right (2 food)', off: H().inv('food') < 2, fn() { H().add('food', -2); f.food += 2; settle(18); f.p = clamp(f.p + 6, -100, 100); return `<i>It buys a little time. It buys a little respect.</i>`; } },
        { label: 'Tell your people to be careful', fn() { all(-1); g.flags.informant = 0; return `<i>Everyone checks the window twice that night.</i>`; } }], art(who, 'ok'));
    } else if (n.heat < 80) {
      const loss = pick(['water', 'wood', 'food']); const q = Math.min(H().inv(loss), rnd(2, 4)); H().add(loss, -q); f[loss] = (f[loss] || 0) + q;
      ask(`${cn(who)} was here`, `In the morning, something is wrong. ${q ? `${q} ${loss === 'wood' ? 'planks' : loss} gone from the stores` : 'The store was opened and nothing taken, which is worse'}, and a mark on the barricade: a hand, drawn in ash.\n\n<i>${n.reason}. This is how the answer begins.</i>`, [
        { label: 'Hunt them down', fn() { const s = pick(H().alive()); if (chance(0.45 + (G().rep.fear || 0) * 0.04)) { settle(30); f.p = clamp(f.p - 10, -100, 100); return `<i>${s.name} comes back with a bruised hand and ${q} ${loss}. The mark on the wall has been scrubbed. It is a kind of answer.</i>`; } H().hurt(s, rnd(8, 18), 'Beaten while hunting a saboteur.'); n.heat = clamp(n.heat + 10, 0, 100); return `<i>${s.name} comes back with nothing and a face you will not forget.</i>`; } },
        { label: 'Buy peace (4 food)', off: H().inv('food') < 4, fn() { H().add('food', -4); f.food += 4; settle(30); return `<i>It is humiliating. It also works.</i>`; } },
        { label: 'Endure it', fn() { n.heat = clamp(n.heat + 6, 0, 100); all(-2); return `<i>You let it go. You are keeping count of how many times you can.</i>`; } }], art(who, 'ok'));
    } else {
      if (raidId) g.flags.groupRaid = raidId;
      ask(`${cn(who)} at the gate`, `They are standing in the open at the end of the corridor, with ${Math.max(2, Math.min(6, f.members.length + 1))} others behind them.\n\n${npc(who, `${n.reason}. Today we finish it.`)}`, [
        { label: 'Fight', fn() { const mine = P.myPower() * (0.8 + Math.random() * 0.5), theirs = P.power(f) * 0.45; if (mine > theirs) { n.resolved = true; removeMember(who, 'killed at a showdown'); f.p = clamp(f.p - 15, -100, 100); f.morale = clamp(f.morale - 10, 0, 100); g.stats.kills++; all(-3); g.flags.groupRaid = 0; return `<i>It is over in a minute and a half. ${cn(who)} is on the ground and not moving, and the others are running. Nobody in your group wants to look at the floor.</i>`; } H().alive().forEach((s) => { if (chance(0.5)) H().hurt(s, rnd(8, 20), 'Beaten in a showdown.'); }); H().stealSome(0.3); n.heat = 60; return `<i>You are outnumbered, and it is not close. They take what they came for, and leave you the bruises.</i>`; } },
        { label: 'Pay them off (3 food, 3 water)', off: H().inv('food') < 3 || H().inv('water') < 3, fn() { H().add('food', -3); H().add('water', -3); f.food += 3; f.water += 3; n.resolved = true; f.p = clamp(f.p + 10, -100, 100); g.flags.groupRaid = 0; return `<i>${cn(who)} counts it. Then nods, once, as if closing a book.</i>`; } },
        { label: 'Apologise, sincerely', fn() { G().rep.honor -= 1; if (chance(0.5)) { n.resolved = true; g.flags.groupRaid = 0; return `<i>${cn(who)} stares at you for a long time. "...Fine."</i>`; } n.heat = clamp(n.heat - 15, 0, 100); return `<i>It is not enough. It is a start.</i>`; } },
        { label: 'Offer a pact', fn() { if (f.p > -65 && chance(0.5)) { n.resolved = true; g.pacts.push({ type: 'nonaggr', with: f.id, until: g.day + 10, between: ['player', f.id] }); g.flags.groupRaid = 0; return `<i>"A pact. Ten days." You both know how fragile ten days can be.</i>`; } return `<i>They laugh at that.</i>`; } }], art(who, 'ok'));
    }
  } });

/* ---------- one of your own went over ---------- */
S.add({ id: 'turncoat', kind: 'nemesis', w: 5, cd: 2, when: (x) => (x.G.turned || []).some((t) => t.from === 'party' && !t.played && x.G.day - t.day >= 3),
  run(x) {
    const g = x.G, t = g.turned.find((q) => q.from === 'party' && !q.played && g.day - q.day >= 3); t.played = true; const cid = t.cid, c = K().by[cid], s = g.S.find((q) => q.cid === cid), gate = P.fac('gate');
    ask(`${c.name} at the barricade`, `They are not alone. A rifle, a headband, a walk you know and a face you have shared food with. They stop at the line they used to cross every day.\n\n${npc(cid, `It is me. Do not look at me like that.`)}`, [
      { label: 'Beg them to come home', fn() { const p = 0.28 + ((s && s.trust) || 0) / 150; if (chance(p) && H().alive().length < 6 && rejoin(cid)) { all(4); return `${npc(cid, `...Okay. Okay. Just do not say anything. Not to anyone.`)}\n\n<i>${c.name} walks back in. Nobody speaks. Somebody sets down an extra cup.</i>`; } L.nem(gate, `you could not keep ${c.name}`, 15); return `${npc(cid, `No. I cannot.`)}\n\n<i>They turn, and go back to the people who gave them a gun.</i>`; } },
      { label: 'Ask what they want', fn() { if (H().inv('food') >= 3) { return `${npc(cid, `Food. Three. For old times. Then we are even.`)}\n\n<i>You hand it over, or you do not.</i>`; } return `${npc(cid, `You have nothing to give. That is... sad.`)}`; } },
      { label: 'Give them 3 food and let them go', off: H().inv('food') < 3, fn() { H().add('food', -3); if (gate) { gate.food += 3; gate.p = clamp(gate.p + 6, -100, 100); } mood(s || H().alive()[0], 2); return `<i>They take it. They look at you, and look away. It is the last you see of them for some days.</i>`; } },
      { label: 'Shut the door on them', fn() { all(-3); if (gate) { gate.p = clamp(gate.p - 6, -100, 100); L.nem(gate, `you shut the door on ${c.name}`, 28); } return `<i>The sound of the bolt is very loud. Someone in the room starts to cry.</i>`; } }], art(cid, 'hungry'));
  } });

/* ---------- favours, and people asking to join ---------- */
S.add({ id: 'favor', kind: 'favor', door: true, w: 2.4, cd: 3, when: (x) => P.live().some((f) => f.id !== 'gate' && f.members.length > 1),
  run(x) {
    const g = x.G; const fs = P.live().filter((f) => f.id !== 'gate' && f.members.length > 1 && f.p > -45); if (!fs.length) return false; const f = pick(fs), m = pickMember(f); if (!m) return false; f.met = true;
    const kinds = ['message', 'hide', 'vouch', 'escort', 'cover']; if (H().inv('club') + H().inv('machete') + H().inv('pistol') > 0) kinds.push('weapon'); const k = pick(kinds); const A = pick(H().alive()); const record = (kind, extra) => { g.favors = g.favors || []; g.favors.push(Object.assign({ cid: m, fid: f.id, kind, day: g.day, paid: false }, extra || {})); };
    const o = pick(P.live().filter((q) => q.id !== f.id && q.id !== 'gate') || [f]);
    if (k === 'message' && o) ask(`${cn(m)} needs a favour`, `${npc(m, `I need a message taken to ${o.leader ? cn(o.leader) : 'their leader'} of ${o.name}. If I go myself, I will not come back.`)}`, [
      { label: `Send ${first(A)}`, off: A.slots < 1, fn() { A.slots--; if (chance(0.75)) { f.p = clamp(f.p + 8, -100, 100); o.p = clamp(o.p + 3, -100, 100); record('message'); return `<i>${first(A)} comes back at dawn. "Delivered." ${cn(m)} will remember it.</i>`; } H().hurt(A, rnd(6, 16), 'Hurt carrying a message.'); return `<i>${first(A)} was jumped on the way, and the message was never delivered.</i>`; } },
      { label: 'Refuse', fn() { f.p = clamp(f.p - 3, -100, 100); return `<i>${cn(m)} nods, as if they expected it.</i>`; } }], art(m, 'hungry'));
    else if (k === 'hide') ask(`${cn(m)} is running`, `${npc(m, `Hide me tonight. ${leaderName(f)}'s people are looking for me. I will explain after.`)}`, [
      { label: 'Hide them', fn() { f.p = clamp(f.p - 10, -100, 100); record('hide'); all(-1); if (chance(0.3)) L.nem(f, `you hid ${cn(m)} from them`, 22); return `<i>A night in the store cupboard. ${cn(m)} will not tell you what it was about. In the morning there is a nervous knock, and the people at the door move on.</i>`; } },
      { label: 'Turn them away', fn() { f.p = clamp(f.p - 2, -100, 100); return `<i>You do not look back at the door.</i>`; } }], art(m, 'hungry'));
    else if (k === 'vouch') ask(`${cn(m)} needs a name`, `${npc(m, `The council hears my case tomorrow. Tell them you know me. A name from outside goes a long way.`)}`, [
      { label: 'Vouch for them', fn() { f.p = clamp(f.p + 10, -100, 100); record('vouch'); if (chance(0.25)) { g.rep.honor--; return `<i>It turns out you should have asked more questions.</i>`; } return `<i>They were cleared. They thank you with their eyes.</i>`; } },
      { label: 'Refuse', fn() { f.p = clamp(f.p - 4, -100, 100); return `<i>"I understand."</i>`; } }], art(m, 'ok'));
    else if (k === 'escort') ask(`${cn(m)}'s cousin`, `${npc(m, `My cousin is sick. Someone has to walk her to the clinic tonight, and I cannot be seen.`)}`, [
      { label: `Send ${first(A)}`, off: A.slots < 1, fn() { A.slots--; if (chance(0.75)) { f.p = clamp(f.p + 9, -100, 100); record('escort'); mood(A, 3); return `<i>The girl is in a bed by midnight. ${first(A)} gets back at dawn with a story and a bandage in their pocket.</i>`; } H().hurt(A, rnd(8, 18), 'Hurt escorting a sick girl.'); return `<i>They were stopped on the way. ${first(A)} comes back bleeding.</i>`; } },
      { label: 'Refuse', fn() { f.p = clamp(f.p - 4, -100, 100); return ''; } }], art(m, 'hungry'));
    else if (k === 'cover') ask(`${cn(m)} was never gone`, `${npc(m, `If anyone asks, I was here all night with you. Please. I will owe you.`)}`, [
      { label: 'Cover for them', fn() { f.p = clamp(f.p + 6, -100, 100); g.rep.honor--; record('cover'); if (chance(0.25)) { const q = pick(P.live().filter((z) => z.id !== f.id && z.id !== 'gate')); if (q) q.p = clamp(q.p - 6, -100, 100); return `<i>The lie holds, mostly. Somebody saw you, and somebody will talk.</i>`; } return `<i>The lie holds.</i>`; } },
      { label: 'Refuse', fn() { f.p = clamp(f.p - 2, -100, 100); return ''; } }], art(m, 'ok'));
    else if (k === 'weapon') { const w = H().inv('pistol') ? 'pistol' : H().inv('machete') ? 'machete' : 'club'; ask(`${cn(m)} needs a ${w}`, `${npc(m, `Lend me a ${w} for one night. I will bring it back.`)}`, [
      { label: 'Lend it', fn() { H().add(w, -1); f.arms += w === 'pistol' ? 3 : 1; record('weapon', { item: w, ret: chance(0.7) }); f.p = clamp(f.p + 10, -100, 100); return `<i>A ${w} leaves your hands and does not leave your mind.</i>`; } },
      { label: 'Refuse', fn() { f.p = clamp(f.p - 3, -100, 100); return ''; } }], art(m, 'ok')); }
    else return false;
  } });
S.add({ id: 'favor_back', kind: 'favor', door: true, w: 4, cd: 1, when: (x) => (x.G.favors || []).some((q) => !q.paid && x.G.day - q.day >= 4),
  run(x) {
    const g = x.G, q = g.favors.find((z) => !z.paid && g.day - z.day >= 4), f = P.fac(q.fid); q.paid = true; if (!f || f.status !== 'active' || !f.members.includes(q.cid)) return false; const m = q.cid;
    if (q.kind === 'weapon') { if (q.ret) { H().add(q.item, 1); H().add('food', 1); say(`${cn(m)} keeps their word`, `${npc(m, `Here is your ${q.item}. And a little something. Thank you.`)}`, art(m, 'ok')); f.p = clamp(f.p + 6, -100, 100); } else { say(`${cn(m)} does not come`, `<i>The ${q.item} does not come back. Neither does ${cn(m)}, when you send word.</i>`, art(m, 'ok')); f.p = clamp(f.p - 6, -100, 100); L.nem(f, `you lent them a ${q.item} and cannot get it back`, 12); } return true; }
    const reward = pick(['gift', 'warning', 'gift']);
    if (reward === 'gift') { const k = pick(['food', 'water', 'meds', 'cloth']); H().add(k, 3); say(`${cn(m)} remembers`, `${npc(m, `I do not forget a favour. Here. Three ${k}. Do not argue.`)}`, art(m, 'ok')); }
    else { g.flags.levyPaid = 2; say(`A warning from ${cn(m)}`, `${npc(m, `Somebody is planning something for you. Tonight. Keep the lamp low and the door shut.`)}`, art(m, 'ok')); }
    f.p = clamp(f.p + 6, -100, 100); return true;
  } });
S.add({ id: 'join_ask', kind: 'favor', door: true, w: 1.3, cd: 5, when: (x) => x.al.length < 6 && P.live().some((f) => f.id !== 'gate' && f.members.length > 2 && f.p > 5),
  run(x) {
    const f = pick(P.live().filter((q) => q.id !== 'gate' && q.members.length > 2 && q.p > 5)), m = pickMember(f); if (!m) return false;
    const why = pick(['I cannot stay where I am. I will not say why.', 'They want me to do something I will not do.', 'My people are going hungry and I cannot watch it.', 'I would rather be where I am trusted.']);
    ask(`${cn(m)} asks to stay`, `${npc(m, `Let me stay with you. ${why}`)}`, [
      { label: 'Take them in', fn() { const s = H().joinNamed(m); if (s) { f.members = f.members.filter((z) => z !== m); if (f.leader === m) f.leader = f.members[0] || null; f.p = clamp(f.p - 6, -100, 100); H().log(`${cn(m)} joined from ${f.name}.`, 'good'); return `<i>${cn(m)} comes in with a bundle and a look of enormous relief.</i>`; } return `<i>There is no room.</i>`; } },
      { label: 'Refuse', fn() { f.p = clamp(f.p + 2, -100, 100); return `<i>"I understand."</i>`; } }], art(m, 'hungry'));
  } });

/* ---------- everyday Nigerian moments ---------- */
function ng(id, kind, w, build, when) {
  S.add({ id: 'ng_' + id, kind, w, cd: 4, door: kind === 'visitor', when, cast: { A: (s) => s.mood > 15, B: (s, x, o) => s.id !== o.A.id },
    run(x, cs) { const r = build(cs.A, cs.B, x); if (!r) return false; ask(r.title, r.text, r.choices, portrait(cs.A)); return true; } });
}
ng('batteries', 'visitor', 1.3, (A) => ({ title: 'Batteries', text: `A boy with a tin box appears at the barricade. <b>"Batteries, Oga. Four. They still hold something."</b>\n\n${speak(A, `If the radio is the only thing that tells us anything, that is worth a meal.`)}`, choices: [
  { label: 'Trade 2 food for them', off: H().inv('food') < 2 || !G().build.radio, why: !G().build.radio ? 'You have no radio to put them in.' : 'Needs 2 food.', fn() { H().add('food', -2); const b = C.World.bulletin('radio'); (G().newsLog = G().newsLog || []).unshift({ d: G().day, t: b.text }); G().newsLog.length = Math.min(G().newsLog.length, 6); all(2); return `<i>The radio lives a little longer. Through the static, a flat voice: "${b.text}"</i>`; } },
  { label: 'Haggle', off: !G().build.radio, why: 'You have no radio to put them in.', fn() { if (chance(0.5)) { H().add('food', -1); all(2); return `<i>You win. One meal, four batteries.</i>`; } return `<i>The boy shrugs and closes the tin.</i>`; } },
  { label: 'Send him away', fn() { return `<i>He is gone before you finish the thought.</i>`; } }] }));
ng('paper_news', 'world', 1.5, (A) => ({ title: 'A news sheet', text: `Somebody has been copying out the news by hand: one sheet, passed from block to block, a corner torn off at each stop.\n\n<i>${pick(C.Campus.NEWS)}</i>\n\n${speak(A, `Do you believe it? It has been copied so many times.`)}`, choices: [
  { label: 'Read it aloud to everyone', fn() { all(chance(0.5) ? 2 : -2); return `<i>Everyone listens. Nobody is sure what they just heard.</i>`; } },
  { label: 'Keep it for later', fn() { return `<i>You fold it into your pocket, as if it might be worth something one day.</i>`; } },
  { label: 'Burn it for the fire', fn() { H().add('wood', 1); return `<i>It burns for about a minute. It is the warmest news you have had.</i>`; } }] }));
ng('prayer_warriors', 'camp', 1.4, (A) => ({ title: 'Midnight prayers', text: `At midnight, from the next hostel, a loud, rhythmic, joyful voice: <b>"Every power assigned against us... FIRE!"</b> Something metal is being struck in time.\n\n${speak(A, `They are praying for the whole campus. Or for themselves. Or at the bandits. Hard to tell.`)}`, choices: [
  { label: 'Join in, quietly', fn() { all(3); trust(A, 2); return `<i>You find you know the words. Your people find they do too.</i>`; } },
  { label: 'Ask them to be quieter', fn() { all(-1); return `<i>You cannot tell whether the yelling got louder, or you imagined it.</i>`; } },
  { label: 'Sleep through it', fn() { return `<i>You do not. Nobody does. It is still, somehow, a comfort.</i>`; } }] }));
ng('eagles', 'humor', 1.2, (A) => ({ title: 'The match', text: `Somewhere a radio has found a commentator. <i>Super Eagles. A qualifier, somewhere cold.</i> Heads lift all over the building. Someone is already arguing about the coach.\n\n${speak(A, `If we win, we will eat today. That is a promise I am making to my stomach.`)}`, choices: [
  { label: 'Listen with everyone', fn() { if (chance(0.5)) { all(5); return `<i>A late goal. The whole hostel erupts, bangs on the walls, and for one second nobody is afraid.</i>`; } all(-2); return `<i>A late, ugly equaliser, for the other side. Someone throws a slipper at the radio.</i>`; } },
  { label: 'Keep watch instead', fn() { return `<i>You hear the cheers from the roof. It is an odd sound, from there.</i>`; } }] }));
ng('pastor', 'visitor', 1.2, (A) => ({ title: 'A man of God', text: `A man in a rumpled suit, with a leather Bible and a small bottle of oil, stands at the barricade. <i>"The Lord has sent me to your house with a word."</i>\n\n${speak(A, `Oga... he looks hungry. But he also looks like he means it.`)}`, choices: [
  { label: 'Let him pray with you (and give 1 food)', off: H().inv('food') < 1, fn() { H().add('food', -1); all(4); return `<i>He prays for a long time, and, eventually, eats like a man who has not for days. You feel a little lighter and a little poorer.</i>`; } },
  { label: 'Let him pray, without the food', fn() { all(2); return `<i>He accepts it graciously, and looks at the pot.</i>`; } },
  { label: 'Send him away', fn() { all(-1); return `<i>"God will remember this house," he says, and it is not entirely a blessing.</i>`; } }] }));
ng('toll', 'politics', 0, (A) => ({ title: 'Something small for the boys', text: `Three young men on the path, loose and cheerful, rifles slung. One of them smiles at you like an old friend.\n\n<b>"Oga, small something for the boys. For security. You know how it is."</b>\n\n${speak(A, `It is not a checkpoint. It is a performance of one.`)}`, choices: [
  { label: 'Give them something (1 food)', off: H().inv('food') < 1, fn() { H().add('food', -1); return `<i>"God bless you, Oga!" They are gone, laughing.</i>`; } },
  { label: 'Argue it down', fn() { if (chance(0.5)) { return `<i>"Ah, you are not a small man." They let it go, grinning.</i>`; } H().add('food', -2); all(-1); return `<i>They took twice what they asked.</i>`; } },
  { label: 'Refuse flatly', fn() { all(-2); if (chance(0.4)) H().hurt(A, rnd(4, 12), 'Beaten at a "checkpoint".'); return `<i>The smiling stops. The talking continues, in a different voice.</i>`; } }] }));
ng('corper', 'visitor', 1.2, (A) => ({ title: 'A corper', text: `At the barricade stands a young woman in a khaki shirt and a very serious expression. <i>"I am a corps member. I am posted to the clinic. I was supposed to report on Monday."</i>\n\n${speak(A, `She has a plan. Look at her face. She has a plan.`)}`, choices: [
  { label: 'Share your food with her', off: H().inv('food') < 1, fn() { H().add('food', -1); all(3); trust(A, 2); return `<i>"I am reporting for duty," she says, through a mouthful, and salutes with the spoon.</i>`; } },
  { label: 'Tell her where the clinic is', fn() { all(1); return `<i>She nods and goes. You hope the clinic will recognise her posting.</i>`; } },
  { label: 'Send her on her way', fn() { return `<i>She straightens her shirt, and goes with great dignity.</i>`; } }] }));
ng('japa', 'camp', 1.4, (A, B) => ({ title: 'Japa dreams', text: `${first(A)} and ${first(B)} are talking in whispers, the way people talk about things that cannot be mentioned in daylight.\n\n${speak(A, `Canada. Germany. Anywhere with light that does not leave. If I get out of here, I am not coming back.`)}\n\n${speak(B, `You say that now. You would be on the first flight home the day after you landed.`)}`, choices: [
  { label: `Back ${first(A)}`, fn() { trust(A, 3); bond(A, B, 1, 3); return `<i>Some dreams survive by being said out loud.</i>`; } },
  { label: `Back ${first(B)}`, fn() { trust(B, 3); bond(A, B, 1, 3); return `<i>${first(A)} laughs, a little too hard.</i>`; } },
  { label: 'Say the country needs people who stay', fn() { all(-1); return `<i>Nobody has an answer. Everybody has a view.</i>`; } }] }), (x) => x.al.length >= 2);
ng('owambe', 'humor', 1.4, (A) => ({ title: 'A small owambe', text: `${first(A)} has found two cups of rice, a tin of tomato and one remaining Maggi cube, and has declared the evening an <b>owambe</b>.\n\n${speak(A, `Today we are celebrating. I do not know what. We will decide later.`)}`, choices: [
  { label: 'Throw the party (2 food)', off: H().inv('food') < 2, fn() { H().add('food', -2); all(7); trust(A, 4); return `<i>Someone beats a bucket in perfect time. Somebody does the shoulder dance with a sheet around their waist. For two hours the war stands outside, respectfully.</i>`; } },
  { label: 'A quiet one, no food', fn() { all(3); return `<i>Somebody hums, low. It counts.</i>`; } },
  { label: 'Not now', fn() { all(-2); trust(A, -2); return `<i>The tomato goes back in the tin.</i>`; } }] }));
ng('proverb', 'camp', 1.2, (A) => ({ title: 'An old saying', text: `${first(A)} says it flatly, to nobody:\n\n${speak(A, pick(['When two elephants fight, it is the grass that suffers.', 'A man who has no enemies has not told the truth.', 'The river that forgets its source will dry up.', 'However far the stream flows, it never forgets its source.']))}\n\n<i>The room takes it in, each in their own way.</i>`, choices: [
  { label: 'Say it is a lesson for us', fn() { all(2); trust(A, 3); return `<i>${first(A)} looks pleased, and a little surprised to be understood.</i>`; } },
  { label: 'Ask what they mean', fn() { trust(A, 4); return `${speak(A, `Only that it is not our war. And that we are in it anyway.`)}`; } },
  { label: 'Say it is just words', fn() { trust(A, -2); mood(A, -2); return `<i>${first(A)} goes quiet.</i>`; } }] }));
ng('fees', 'humor', 1.3, (A) => ({ title: 'The fees', text: `${first(A)} is staring at the wall with deep resentment.\n\n${speak(A, `Do you know what is the worst part? I paid my school fees on time. On time! And now I am hiding in a storeroom, and the bursar still has my money.`)}`, choices: [
  { label: 'Agree, loudly', fn() { all(3); return `<i>It becomes a group complaint, and a good one. Nothing has ever felt so satisfying.</i>`; } },
  { label: 'Say they will get a refund', fn() { all(2); return `<i>Everyone laughs, and nobody believes it.</i>`; } },
  { label: 'Tell them to focus', fn() { all(-1); return `<i>A fair point, delivered badly.</i>`; } }] }));
ng('fuel', 'visitor', 1.2, (A) => ({ title: 'Fuel', text: `A boy with two jerrycans on a trolley appears at the barricade, with the manner of someone who has run a black-market for years.\n\n<b>"Fuel for your generator, Oga. Special price. Only for you."</b>\n\n${speak(A, `Do not trust a man who says "only for you".`)}`, choices: [
  { label: 'Buy it (3 food)', off: H().inv('food') < 3, fn() { H().add('food', -3); if (chance(0.7)) { all(4); return `<i>For three hours the lights come on, the radio hums, and the shelter looks like a place where people live.</i>`; } return `<i>It was water, mostly, with a little fuel on top.</i>`; } },
  { label: 'Haggle', fn() { if (chance(0.5)) { H().add('food', -1); all(3); return `<i>You win. It is not much. It is enough.</i>`; } return `<i>He shrugs, and takes the trolley away.</i>`; } },
  { label: 'Send him off', fn() { return `<i>"Your loss, Oga."</i>`; } }] }));
ng('area_boys', 'politics', 0, (A) => ({ title: 'Area boys', text: `They are lounging on the wall of the next block, six of them, legs swinging. They saw you coming a long time ago.\n\n<b>"Oga, this is our area. To pass here, you must settle us."</b>\n\n${speak(A, `They are not bandits. They are something older and more annoying.`)}`, choices: [
  { label: 'Settle them (1 food, 1 water)', off: H().inv('food') < 1 || H().inv('water') < 1, fn() { H().add('food', -1); H().add('water', -1); return `<i>"Respect, Oga." They return to their wall.</i>`; } },
  { label: 'Talk your way through', fn() { if (chance(0.5)) { return `<i>"You are a good man." You are allowed past, with a handshake.</i>`; } H().add('food', -1); return `<i>Still cost you, in the end.</i>`; } },
  { label: 'Go the long way round', fn() { A.fatigue += 8; return `<i>It adds half an hour. It also adds nothing to your pride.</i>`; } }] }));

/* ---------- the notes tab ---------- */
L.notes = function () {
  const g = G(); let o = '';
  const th = (g.threads || []).filter((t) => t.known && t.last).slice(-5).reverse();
  if (th.length) o += '<div class="sub">Gist you have heard</div>' + th.map((t) => `<div class="dim" style="margin-bottom:4px">• ${t.last}${t.done ? ' <b>(settled)</b>' : ''}</div>`).join('');
  const nem = (g.nem || []).filter((n) => !n.resolved);
  if (nem.length) o += '<div class="sub">People who want you</div>' + nem.map((n) => `<div class="dim">• ${cn(n.cid)} of ${P.fac(n.fid) ? P.fac(n.fid).name : '?'}: ${n.heat >= 80 ? 'wants it finished' : n.heat >= 50 ? 'is hurting you' : 'is watching you'}</div>`).join('');
  const fv = (g.favors || []).filter((f) => !f.paid);
  if (fv.length) o += '<div class="sub">Favours owed to you</div>' + fv.map((f) => `<div class="dim">• ${cn(f.cid)} (${f.kind})</div>`).join('');
  const tn = (g.turned || []).slice(-4);
  if (tn.length) o += '<div class="sub">Gone over to the Gate Boys</div>' + tn.map((t) => `<div class="dim">• ${cn(t.cid)}${t.rejoined ? ' (came back)' : ''}</div>`).join('');
  return o;
};

/* ---------- the author's easter egg ---------- */
/* EDIT THIS: the note shown when the hidden knock is found. Paragraphs are separated by the commas between the quotes. */
const EGG_NOTE = [
  'If you are reading this, you looked closer than most people do. That is exactly how this game was meant to be played.',
  'I made Crisis because I wanted a Nigerian story told without flinching and without apology: the gist, the hunger, the faith, the jokes you make so you do not cry, and the people you would risk something for. Every character in it is invented. Every feeling is not.',
  'Thank you for staying for the quiet parts.',
  '— Ginger-Eke Chienyegom\nCreator of Crisis'
];
L.egg = function () {
  const st = C.Settings; if (st) st.set('egg', true); const g = G(); let extra = '';
  if (g && !g.flags.egg) { g.flags.egg = 1; all(6); H().add('food', 2); H().add('water', 2); extra = '\n\n<i>Folded inside: a few sachets, and a surprising lightness in the room.</i>'; }
  try { if (C.Audio) { C.Audio.start(); C.Audio.sfx('bell'); } } catch (e) {}
  ask('A note, folded small', EGG_NOTE.join('\n\n') + extra, [{ label: 'Fold it back' }]); H().flush();
};
S.add({ id: 'scratched', kind: 'camp', w: 0.7, cd: 99, once: true, when: (x) => x.day >= 6,
  run() { ask('Scratched into the bunk', `Beside the tally of days on the wall, scratched with a key, small and careful, as if by someone who did not want to be seen doing it:\n\n<b>3 · 2 · 1</b>\n<i>knock on the days</i>\n\nBeneath it, a tiny drawing of a hand.`, [{ label: 'Look closer' }, { label: 'Pretend you did not see it' }]); } });

C.Life = L;
if (typeof module !== 'undefined') module.exports = L;
})(typeof window !== 'undefined' ? window : globalThis);
