/* CRISIS — political storylets and the outside world
   Envoys, standoffs, market days, council votes, defectors, missing friends, and the news from beyond the wall. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const S = C.Story, P = C.Politics, V = C.Voice, K = () => C.Cast;
const H = () => S.host;
const { pick, chance, rnd, clamp, first, speak, portrait, bond } = S;
const ask = (t, txt, ch, art) => H().ask(t, txt, ch, art), say = (t, txt, art) => H().say(t, txt, art);
const all = (n) => H().moodAll(n), mood = (s, n) => H().mood(s, n);
const fac = (id) => P.fac(id);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const NAME = P.NAME, itemText = P.itemText;
const leaderLine = (f, text) => { const l = P.leaderOf(f); if (!l) return `<i>${text}</i>`; return S.bubble(l.name, 'you', V.say(l.voice, text, { id: l.id })); };

/* ---------- the outside world ---------- */
const W = {
  init(host) { const G = host.G; G.out = { roads: 15, forces: 10, bandits: 75, prices: 100, power: 0, news: [] }; },
  tick() {
    const G = H().G, o = G.out; if (!o) return;
    const left = Math.max(1, G.rescueDay - G.day); const prog = 1 - left / G.rescueDay;
    o.forces = clamp(o.forces + prog * 6 + (Math.random() * 6 - 2), 0, 100); o.bandits = clamp(o.bandits + (Math.random() * 8 - 4) - o.forces * 0.05, 5, 100);
    o.roads = clamp(o.roads + (o.forces - o.bandits) * 0.04 + (Math.random() * 4 - 2), 0, 100); o.prices = clamp(o.prices + (100 - o.roads) * 0.02 + (Math.random() * 6 - 3), 60, 400);
  },
  bulletin(source) {
    const G = H().G, o = G.out, left = Math.max(1, G.rescueDay - G.day);
    const sure = { radio: 0.85, paper: 0.6, rumor: 0.45 }[source] || 0.6; const lie = Math.random() > sure;
    const est = lie ? left + rnd(5, 14) * (chance(0.5) ? 1 : -1) : left + rnd(-2, 3);
    const pool = [];
    if (o.forces > 55) pool.push(`Security forces are said to be gathering at the edge of the district. A source suggests they could move in about ${Math.max(2, est)} days.`);
    if (o.forces <= 55) pool.push(`Officials say a plan is being finalised. Nobody has said when.`, `Reports describe a helicopter at dusk. It did not land.`);
    if (o.roads < 25) pool.push(`The roads into the district remain blocked. Fuel and food are not moving.`);
    if (o.roads > 60) pool.push(`A convoy was seen moving on the access road. Whose, nobody will say.`);
    if (o.prices > 160) pool.push(`Prices of rice and water have more than doubled in nearby towns. Markets are closing early.`);
    if (o.bandits > 70) pool.push(`Villagers describe gunfire through the night and columns of smoke from the hills.`);
    if (o.bandits < 35) pool.push(`A bandit commander is said to have been killed. The claim is disputed.`);
    pool.push(C.Campus.NEWS[rnd(0, C.Campus.NEWS.length - 1)]);
    return { text: pick(pool), source, lie };
  }
};
C.World = W;

/* ---------- envoys: the visits that make the map feel alive ---------- */
S.add({ id: 'envoy', kind: 'politics', door: true, w: (x) => 5, cd: 0, when: (x) => (x.G.envoys || []).length > 0,
  run(x) {
    const G = x.G; const e = G.envoys.shift(); const f = fac(e.fid); if (!f || f.status !== 'active') return false; f.met = true;
    const art = P.faceArt(f); const lead = (t) => leaderLine(f, t);
    const party = x.al; const rep = pick(party);
    if (e.kind === 'trade') {
      const give = pick(['food', 'water', 'meds', 'parts', 'cloth']), get = pick(['food', 'water', 'meds', 'bandage'].filter((k) => k !== give)); const gq = rnd(2, 5), wq = Math.max(1, gq + rnd(-1, 1));
      if (!(f[give] > gq + 2)) return false;
      ask(`${f.name} propose a trade`, `${lead(`We have ${gq} ${NAME[give]} to spare. We could use ${wq} of your ${NAME[get]}.`)}`, [
        { label: 'Accept', off: H().inv(get) < wq, fn() { H().add(get, -wq); H().add(give, gq); f[give] -= gq; f[get] = (f[get] || 0) + wq; f.p = clamp(f.p + 5, -100, 100); return `<i>Fair is fair. They go quietly.</i>`; } },
        { label: 'Haggle for more', off: H().inv(get) < wq, fn() { if (chance(0.5 + f.p / 200)) { H().add(get, -wq); H().add(give, gq + 1); f[give] -= gq + 1; f[get] = (f[get] || 0) + wq; return `<i>A little more. They respect the push.</i>`; } f.p = clamp(f.p - 4, -100, 100); return `<i>They leave without the trade. Not offended. Not pleased.</i>`; } },
        { label: 'Decline', fn() { return `<i>They nod and go.</i>`; } }], art);
    } else if (e.kind === 'pact') {
      const type = pick(['nonaggr', 'trade']); const nm = type === 'nonaggr' ? 'a non-aggression pact' : 'a trade pact';
      ask(`${f.name} offer a pact`, `${lead(`It is a hard season. Let us write it down: ${nm}. For two weeks, at least.`)}`, [
        { label: 'Accept', fn() { G.pacts.push({ type, with: f.id, until: G.day + rnd(10, 16), between: ['player', f.id] }); f.p = clamp(f.p + 8, -100, 100); G.rep.honor++; return `<i>It is signed on a torn page. Both sides keep a copy.</i>`; } },
        { label: 'Ask for something extra', fn() { if (chance(0.5)) { G.pacts.push({ type, with: f.id, until: G.day + 12, between: ['player', f.id] }); H().add('food', 2); return `<i>They add two rations to the bargain. They will remember being pushed.</i>`; } f.p = clamp(f.p - 5, -100, 100); return `<i>No pact. A cold goodbye.</i>`; } },
        { label: 'Refuse', fn() { f.p = clamp(f.p - 3, -100, 100); return `<i>They leave, politely.</i>`; } }], art);
    } else if (e.kind === 'plea') {
      const k = f.food < f.water ? 'food' : 'water'; const q = rnd(3, 6);
      ask(`${f.name} are starving`, `${lead(`We are asking, not demanding. ${q} ${NAME[k]}. Our children have not eaten since yesterday.`)}\n\n<i>${f.members.length ? `${K().by[f.members[0]].name} stands at the back, not meeting your eyes.` : ''}</i>`, [
        { label: `Give ${q} ${NAME[k]}`, off: H().inv(k) < q, fn() { H().add(k, -q); f[k] += q; f.p = clamp(f.p + 20, -100, 100); G.rep.honor += 2; G.stats.helped++; return `<i>They take it in both hands. ${f.name} will not forget the night you fed them.</i>`; } },
        { label: 'Lend it, to be repaid', off: H().inv(k) < q, fn() { H().add(k, -q); f[k] += q; G.ledger.push({ id: Date.now() + Math.random(), fid: f.id, dir: 'owed', items: { [k]: q + 1 }, due: G.day + 6, status: 'open' }); f.p = clamp(f.p + 10, -100, 100); return `<i>A debt, then. Both of you understand it.</i>`; } },
        { label: 'Turn them away', fn() { f.p = clamp(f.p - 18, -100, 100); G.stats.refused++; all(-2); return `<i>They go. Somebody in your group will not look at you for the rest of the day.</i>`; } }], art);
    } else if (e.kind === 'tribute') {
      const k = pick(['food', 'water']); const q = rnd(3, 6);
      ask(`${f.name} want a toll`, `${lead(`You are on our side of the water. A toll, then. ${q} ${NAME[k]}, every week. We will keep the road clear for you.`)}`, [
        { label: 'Pay', off: H().inv(k) < q, fn() { H().add(k, -q); f[k] += q; f.p = clamp(f.p + 6, -100, 100); G.rep.honor--; return `<i>You buy a week. You do not buy respect.</i>`; } },
        { label: 'Refuse', fn() { f.p = clamp(f.p - 15, -100, 100); const g = G.groups.find((q2) => q2.fid === f.id); if (g && chance(0.5)) G.flags.groupRaid = g.id; return `<i>"Then we will see you in the dark."</i>`; } },
        { label: 'Bluff: say you have friends', fn() { const sc = P.myPower() / Math.max(1, P.power(f)); if (sc > 0.6 && chance(0.6)) { f.p = clamp(f.p - 4, -100, 100); G.rep.fear++; return `<i>They study you. They decide not to find out.</i>`; } f.p = clamp(f.p - 22, -100, 100); const g = G.groups.find((q2) => q2.fid === f.id); if (g) G.flags.groupRaid = g.id; return `<i>They did find out.</i>`; } }], art);
    } else if (e.kind === 'call') {
      const enemy = P.live().find((o) => P.atWar(f, o)); if (!enemy) return false;
      ask(`${f.name} call for help`, `${lead(`We are at war with ${enemy.name}. A friend would send help. A friend would not wait to be asked twice.`)}`, [
        { label: 'Send supplies to them', off: H().inv('food') < 3, fn() { H().add('food', -3); f.food += 3; f.morale = clamp(f.morale + 10, 0, 100); f.p = clamp(f.p + 14, -100, 100); enemy.p = clamp(enemy.p - 8, -100, 100); return `<i>You have chosen. ${enemy.name} will learn it.</i>`; } },
        { label: 'Stay out of it', fn() { f.p = clamp(f.p - 6, -100, 100); return `<i>They look at you the way you look at a closed door.</i>`; } },
        { label: `Offer to mediate with ${enemy.name}`, fn() { if (chance(0.45 + G.rep.honor * 0.03)) { P.bump(f, enemy, 25); G.wars.forEach((w) => { if ([w.a, w.b].includes(f.id)) w.on = false; }); G.rep.honor += 2; return `<i>By dawn, two leaders have agreed to stop. It is a miracle, and you are tired.</i>`; } return `<i>Neither side will move. You tried.</i>`; } }], art);
    } else if (e.kind === 'secret') {
      const m = pick(f.members.filter((q) => q !== f.leader)); if (!m) return false; const c = K().by[m]; const line = c.topics && c.topics.find((t) => t.layer === 'secret');
      ask(`${f.name} trust you`, `${lead(`We have decided to tell you something. About one of ours. ${c.name}.`)}\n\n<i>${line ? line.lines[0] : 'A secret, shared the way you share a weight.'}</i>`, [
        { label: 'Keep it', fn() { f.p = clamp(f.p + 12, -100, 100); f.mem.trust = 1; return `<i>It stays with you. You will carry it carefully.</i>`; } },
        { label: 'Use it', fn() { f.p = clamp(f.p - 20, -100, 100); H().add('food', 2); G.rep.honor--; return `<i>It pays, once. It ends the trust forever.</i>`; } }], art);
    } else if (e.kind === 'missing') {
      f.mem.missingAsked = 1; const cid = pick(f.missing); const mc = K().by[cid]; const sv = x.al.find((s) => s.cid === cid); if (!sv) return false;
      ask(`${f.name} ask about ${mc.name}`, `${lead(`We heard ${mc.name} is with you. We have been afraid for days. Is ${mc.name} alive? Is ${mc.name} well?`)}\n\n${speak(sv, `They are asking about me. Oga, tell them I am fine. Or... let me see them. Please.`)}`, [
        { label: `Let ${first(sv)} send word`, fn() { f.p = clamp(f.p + 14, -100, 100); mood(sv, 8); sv.trust = clamp((sv.trust || 0) + 6, 0, 100); G.rep.honor++; return `<i>A scrap of paper, a line in ${first(sv)}'s handwriting. It is carried across the campus by someone running.</i>`; } },
        { label: `Let ${first(sv)} visit for an hour`, off: sv.slots < 1, fn() { sv.slots--; f.p = clamp(f.p + 22, -100, 100); mood(sv, 12); sv.trust = clamp((sv.trust || 0) + 12, 0, 100); G.rep.honor += 2; f.mem.visited = 1; return `<i>${first(sv)} comes back with red eyes and a new weight on their shoulders, and lighter in a way you cannot name.</i>`; } },
        { label: 'Say nothing', fn() { f.p = clamp(f.p - 8, -100, 100); mood(sv, -6); sv.trust = clamp((sv.trust || 0) - 8, 0, 100); return `<i>${first(sv)} will remember that you could have, and did not.</i>`; } }], art);
    } else if (e.kind === 'repaid') { say(`${f.name} paid up`, `${lead(`Here. What we owed. With our thanks.`)}\n\n<i>${itemText(e.items)} are placed in your hands. Honest people are rarer than food.</i>`, art); return true; }
    else if (e.kind === 'default') {
      ask(`${f.name} cannot pay`, `${lead(`We do not have it. We will not have it. I am sorry, truly.`)}`, [
        { label: 'Forgive the debt', fn() { f.p = clamp(f.p + 18, -100, 100); G.rep.honor += 2; return `<i>They almost cry. Debts forgiven are worth more than debts collected.</i>`; } },
        { label: 'Demand it anyway', fn() { f.p = clamp(f.p - 18, -100, 100); const k = Object.keys(e.items)[0]; const q = Math.min(f[k] || 0, 3); f[k] -= q; H().add(k, q); return `<i>You take what they have. They watch you do it.</i>`; } }], art);
    } else if (e.kind === 'due') {
      const l = G.ledger.find((q) => q.fid === f.id && q.dir === 'owe' && q.status === 'open'); if (!l) return false;
      ask(`${f.name} want repaying`, `${lead(`You said ${itemText(l.items)} in five days. It has been five days.`)}`, [
        { label: 'Repay now', off: !Object.entries(l.items).every(([k, n]) => H().inv(k) >= n), fn() { return P.repay(l) ? `<i>Settled. They shake your hand.</i>` : ''; } },
        { label: 'Ask for more time', fn() { l.due = G.day + 3; f.p = clamp(f.p - 8, -100, 100); return `<i>Three days. They are not pleased.</i>`; } },
        { label: 'Refuse', fn() { l.status = 'default'; if (C.Life) C.Life.nem(f, 'you refused to repay what you owe them', 40); f.p = clamp(f.p - 35, -100, 100); G.rep.honor -= 2; const g = G.groups.find((q2) => q2.fid === f.id); if (g) G.flags.groupRaid = g.id; return `<i>"You will see what that costs."</i>`; } }], art);
    }
    return true;
  } });

/* ---------- a standoff over one of the three zones ---------- */
S.add({ id: 'standoff', kind: 'politics', w: 3, cd: 6, tension: 5, when: (x) => x.G.zones && Object.values(x.G.zones).some((z) => z.tension > 62 && z.holder),
  run(x) {
    const G = x.G; const z = Object.values(G.zones).filter((q) => q.tension > 62 && q.holder).sort((a, b) => b.tension - a.tension)[0]; const holder = fac(z.holder);
    const rival = P.live().filter((f) => f.id !== holder.id && z.claimants.includes(f.id)).sort((a, b) => P.power(b) - P.power(a))[0]; if (!rival) return false;
    ask(`Standoff at the ${z.name}`, `You climb to the roof and see it from above: ${holder.name} on one side of the open ground, ${rival.name} on the other. Rifles. Sticks. A few people holding a flag that is not a flag.\n\n<i>Everyone is waiting for somebody else to make the first mistake.</i>`, [
      { label: `Walk out between them`, fn() { const sc = (G.rep.honor * 0.05) + (G.rep.fear * 0.03) + Math.random() * 0.4; if (sc > 0.5) { z.tension = clamp(z.tension - 35, 0, 100); G.rep.honor += 2; P.bump(holder, rival, 20); all(3); return `<i>A thin, terrible silence. Then someone lowers a rifle. Then another. You walk back with a dry mouth, and a very quiet shelter.</i>`; } x.al.forEach((s) => { if (chance(0.3)) H().hurt(s, rnd(5, 15), 'Hit in the crossfire.'); }); z.tension = clamp(z.tension + 10, 0, 100); return `<i>Someone fires. In the second after, nobody remembers who.</i>`; } },
      { label: `Back ${holder.name}`, fn() { holder.p = clamp(holder.p + 15, -100, 100); rival.p = clamp(rival.p - 20, -100, 100); holder.morale = clamp(holder.morale + 10, 0, 100); z.tension = clamp(z.tension - 10, 0, 100); return `<i>You send word. You will be expected to follow it up.</i>`; } },
      { label: `Back ${rival.name}`, fn() { rival.p = clamp(rival.p + 15, -100, 100); holder.p = clamp(holder.p - 20, -100, 100); rival.morale = clamp(rival.morale + 10, 0, 100); z.tension = clamp(z.tension + 8, 0, 100); return `<i>You send word. The side you chose will call it in later.</i>`; } },
      { label: 'Stay inside and pray', fn() { all(-3); return `<i>Whatever happens, it happens without you.</i>`; } }], P.faceArt(holder));
  } });

/* ---------- market day at the New Cafeteria ---------- */
S.add({ id: 'market_day', kind: 'politics', w: 0,   /* off: a trip across campus that happened instantly; to be rewritten as a real day trip */ cd: 5, when: (x) => x.G.zones && x.G.zones.newcaf && x.G.zones.newcaf.holder && x.G.zones.newcaf.tension < 50 && x.dayGE(3),
  run(x) {
    const G = x.G, z = G.zones.newcaf, f = fac(z.holder); if (!f) return false;
    const mk = (give, get, gq, wq) => ({ label: `Give ${gq} ${NAME[give]}, get ${wq} ${NAME[get]}`, off: H().inv(give) < gq, fn() { H().add(give, -gq); H().add(get, wq); f[give] = (f[give] || 0) + gq; f[get] = Math.max(0, (f[get] || 0) - wq); f.p = clamp(f.p + 2, -100, 100); G.rep.wealth++; return `<i>Money changes hands, or the thing that stands in for it.</i>`; } });
    const deals = [mk('parts', 'food', 3, 4), mk('cloth', 'water', 2, 3), mk('wood', 'food', 4, 4), mk('food', 'meds', 5, 1), mk('ogogoro', 'food', 1, 4), mk('bandage', 'water', 2, 3)].sort(() => Math.random() - 0.5).slice(0, 4);
    deals.push({ label: 'Walk the market, buy nothing', fn() { all(2); return `<i>You walk past a hundred people being almost normal. A man is selling a single egg. Everyone looks at it as if it were a miracle, and they are right.</i>`; } });
    ask(`Market day, ${z.name}`, `Today, by agreement, ${f.name} open the doors. Stalls made of tables. Bartering. Whispering. The smell of real food, for the first time in days. It will not last, so everyone behaves.\n\n<i>Spies, traders, runners, mothers, all of them under one roof, all of them pretending to be at peace.</i>`, deals, P.faceArt(f));
  } });

/* ---------- council session at the New Theatre ---------- */
S.add({ id: 'council', kind: 'politics', w: 0,   /* off: same reason as market_day */ cd: 6, when: (x) => x.G.zones && x.G.zones.theatre && x.G.zones.theatre.holder && x.dayGE(4),
  run(x) {
    const G = x.G, z = G.zones.theatre, h = fac(z.holder); if (!h) return false;
    const laws = [
      { t: 'Ban raids on the MPH camp', yes: { mph: 15, gate: -15, pitch: -5 }, no: { mph: -10 }, hint: 'It protects the weakest. It also ties the hands of anyone hungry.' },
      { t: 'A tax on food stores to feed the camps', yes: { mph: 12, kitchen: -10, terrace: -15, hustlers: -8 }, no: { mph: -8 }, hint: 'Popular with the poor. Loathed by the rich.' },
      { t: 'No weapons in the Theatre, ever', yes: { theatre: 8, gate: -10, pitch: -12, security: -6 }, no: { theatre: -5 }, hint: 'Safe for talking. Dangerous for the people who do the guarding.' },
      { t: 'All trade must pass through the Theatre', yes: { theatre: 10, hustlers: -18, terrace: -12, kitchen: -5 }, no: { hustlers: 5 }, hint: 'Order, at the price of freedom.' }
    ]; const law = pick(laws); const seats = x.al.filter((s) => ['tunde', 'hauwa', 'grace'].includes(s.cid));
    const apply = (m, mult) => Object.entries(m).forEach(([id, v]) => { const f = fac(id); if (f && f.status === 'active') f.p = clamp(f.p + v * mult, -100, 100); });
    let intro = `The New Theatre. A raised stage, a long table, a very old flag. ${h.name} chair the session. You have been given a vote and a chair, the last empty seat.\n\n<b>Motion:</b> ${law.t}.\n\n<i>${law.hint}</i>`;
    if (seats.length) intro += `\n\n${speak(seats[0], seats[0].cid === 'tunde' ? `Principle first, Oga. What is the law for, if it only protects the strong?` : seats[0].cid === 'hauwa' ? `Do not vote with your fear. Vote with your eyes.` : `Think through the consequences, Commander. Every one.`)}`;
    ask('Council session', intro, [
      { label: 'Vote yes', fn() { apply(law.yes, 1); G.rep.honor++; return `<i>The motion passes, narrowly. The mood of the room tilts like a tray.</i>`; } },
      { label: 'Vote no', fn() { apply(law.no, 1); return `<i>The motion fails. A few people applaud. A few people leave.</i>`; } },
      { label: 'Abstain', fn() { return `<i>Nobody looks surprised. Nobody forgives it either.</i>`; } },
      { label: 'Speak against the council itself', fn() { const u = fac('union'); if (u) u.p = clamp(u.p + 10, -100, 100); h.p = clamp(h.p - 20, -100, 100); z.tension = clamp(z.tension + 12, 0, 100); return `<i>The room goes quiet, and then very loud.</i>`; } }], P.faceArt(h));
  } });

/* ---------- a defector from a failing faction ---------- */
S.add({ id: 'defector', kind: 'politics', door: true, w: 2.2, cd: 6, when: (x) => P.live().some((f) => f.morale < 38 && f.members.length > 2 && f.p > -20) && x.al.length < 6,
  run(x) {
    const G = x.G; const f = P.live().filter((q) => q.morale < 38 && q.members.length > 2 && q.p > -20)[0]; const cid = pick(f.members.filter((m) => m !== f.leader)); if (!cid) return false; const c = K().by[cid];
    const sp = P.face(cid);
    ask(`${c.name} at the barricade`, `${S.bubble(c.name, 'you', V.say(c.voice, `I am from ${f.name}. They are finished. The food is gone and the leader is losing his grip. I can work. I can carry. I am asking, please.`, { id: cid }))}\n\n<i>${c.bio}</i>`, [
      { label: `Take ${c.name} in`, fn() { f.members = f.members.filter((m) => m !== cid); const s = H().joinNamed(cid); if (s) { s.trust = 15; f.p = clamp(f.p - 6, -100, 100); H().log(`${c.name} joined from ${f.name}.`, 'good'); return `<i>${c.name} comes in without a word. It is not clear who is more relieved.</i>`; } return ''; } },
      { label: 'Send them back', fn() { f.p = clamp(f.p + 4, -100, 100); return `<i>${c.name} turns without arguing. Hope is expensive.</i>`; } }], { sp, state: 'hungry' });
  } });

/* ---------- the news ---------- */
S.add({ id: 'news_rumor', kind: 'world', w: (x) => (x.hasRadio ? 3 : 1.2), cd: 2,
  run(x) {
    const G = x.G; const src = x.hasRadio ? 'radio' : chance(0.5) ? 'paper' : 'rumor'; const fresh = (G.rumors || []).filter((r) => G.day - r.d <= 3 && !r.told);
    if (fresh.length && chance(0.7)) { const r = pick(fresh); r.told = 1; const lie = Math.random() > r.sure; const t = lie ? r.t.replace(/hit |took |broke /, 'were rumoured to have ') : r.t; G.newsLog = G.newsLog || []; G.newsLog.unshift({ d: G.day, t: `${t}${lie ? ' (unconfirmed)' : ''}` }); G.newsLog.length = Math.min(G.newsLog.length, 6); say(src === 'radio' ? 'Over the radio' : src === 'phone' ? 'A cracked phone' : 'Word on the stairs', `<i>${src === 'radio' ? 'Between the static, a flat voice:' : 'Somebody whispers, and the whisper travels:'}</i>\n\n“${t}”`); return true; }
    const b = C.World.bulletin(src); G.newsLog = G.newsLog || []; G.newsLog.unshift({ d: G.day, t: b.text }); G.newsLog.length = Math.min(G.newsLog.length, 6);
    say(src === 'radio' ? 'On the radio' : src === 'paper' ? 'A news sheet' : 'A rumour', `<i>${src === 'radio' ? 'The static clears for a moment:' : 'It comes second-hand, third-hand, from somebody who heard it from someone:'}</i>\n\n“${b.text}”\n\n<i>${src === 'radio' ? 'Radios can lie.' : 'You have no way to check it.'}</i>`);
    all(b.text.includes('days') ? 3 : -1); return true;
  } });

/* ---------- a secret from the other side of the wall ---------- */
S.add({ id: 'secret_out', kind: 'politics', w: 1.8, cd: 7, when: (x) => x.dayGE(6),
  run(x) {
    const f = pick(P.live().filter((q) => q.members.length > 1 && q.met)); if (!f) return false; const cid = pick(f.members.filter((m) => m !== f.leader)); const c = K().by[cid]; const sec = c.topics.find((t) => t.layer === 'secret'); if (!sec) return false;
    ask(`A secret about ${c.name}`, `A runner from ${f.name} comes to the barricade, whispering. It is about ${c.name}.\n\n<i>“${V.say(c.voice, sec.lines[0], { id: cid })}”</i>\n\n<i>Whoever sent the runner wants something in return. They do not say what.</i>`, [
      { label: `Warn ${c.name} you know`, fn() { f.p = clamp(f.p + 8, -100, 100); return `<i>They will be grateful, in time. Or they will never forgive the knowing.</i>`; } },
      { label: 'Spread it', fn() { f.p = clamp(f.p - 15, -100, 100); f.morale = clamp(f.morale - 12, 0, 100); C.Politics.rumor(`${c.name} is said to have a secret that would shake ${f.name}.`, 0.8, [f]); H().G.rep.honor--; return `<i>By nightfall, it has done what secrets do.</i>`; } },
      { label: 'Say nothing', fn() { return `<i>You file it with the rest of the things you know and do not use.</i>`; } }], P.faceArt(f));
  } });

C.Polylets = true;
if (typeof module !== 'undefined') module.exports = { World: W };
})(typeof window !== 'undefined' ? window : globalThis);
