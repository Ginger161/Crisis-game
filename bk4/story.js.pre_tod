/* CRISIS — story engine
   Storylets: small stories with conditions. Each names the people it needs ("cast slots") and picks the best fit from whoever is alive.
   The director chooses what happens each morning, balancing dread against warmth so the run has a pulse.
   Memory: G.mem holds flags that later stories read ("you let her sleep in the cold" comes back). Relationships: G.rel, one entry per pair. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const V = () => C.Voice, K = () => C.Cast;
let H = null;                      // host: the game gives us its tools
const defs = [];
const add = (d) => { defs.push(Object.assign({ kind: 'camp', w: 1, cd: 4 }, d)); };

/* ---------- small helpers ---------- */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const chance = (p) => Math.random() < p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cd = (s) => (s && s.cid ? K().by[s.cid] : null);
const first = (s) => (s.name || '').replace(/^(Mama|Mr\.|Dr\.)\s+/, '');
const key = (a, b) => [a, b].sort().join('|');

/* ---------- memory ---------- */
const mem = (k) => (H.G.mem || {})[k];
const setMem = (k, v) => { H.G.mem = H.G.mem || {}; H.G.mem[k] = v === undefined ? H.G.day : v; };

/* ---------- relationships ---------- */
function rel(a, b) {
  const G = H.G; G.rel = G.rel || {}; const rk = (x) => (typeof x === 'string' ? x : x && x.cid ? x.cid : x && x.id != null ? 'p' + x.id : String(x)); const k = key(rk(a), rk(b));   /* strangers who joined have no cast id: key them by their person id */
  return G.rel[k] || (G.rel[k] = { fond: 0, tension: 0, love: 0, hist: [] });
}
function bond(a, b, fond, tension, note) {
  const r = rel(a, b); r.fond = clamp(r.fond + (fond || 0), -50, 100); r.tension = clamp(r.tension + (tension || 0), 0, 100);
  if (note) { r.hist.push({ d: H.G.day, n: note }); if (r.hist.length > 12) r.hist.shift(); }
  return r;
}
function initRel() {
  const al = H.alive();
  al.forEach((a) => { const c = cd(a); (c.ties || []).forEach(([oid, how, f]) => { const b = al.find((x) => x.cid === oid); if (b) { const r = rel(a, b); if (!r.how) { r.how = how; r.fond = Math.max(r.fond, f); } } }); });
}

/* ---------- speaking ---------- */
function voiced(s, text, o) { const c = cd(s); return c ? V().say(c.voice, text, Object.assign({ id: s.cid }, o || {})) : text; }
let CUR = null;
/* the player IS the person they have selected. "you" in a label means that person, never an unnamed stranger */
function avatar() { const g = H && H.G; return g && g.S ? g.S.find((x) => x.id === g.sel && x.alive) || null : null; }
function bubble(name, to, text) {
  const me = avatar(); const mine = me ? first(me) : null;
  if (to === 'you') to = mine || 'you';
  if (mine && name === mine && (!to || to === mine)) { const c = CUR && [CUR.A, CUR.B, CUR.C].filter(Boolean).find((q) => q !== me); to = c ? first(c) : 'everyone'; }
  const tag = (n) => (mine && n === mine ? `${n} <b class="me">(you)</b>` : n);
  return `<div class="bub"><div class="who">${tag(name)}${to ? ` <i>to</i> ${tag(to)}` : ''}</div>“${text}”</div>`;
}
function target(s) { const me = avatar(); const ids = [CUR && CUR.A, CUR && CUR.B, CUR && CUR.C].filter(Boolean); const o = ids.find((q) => q !== s && q !== me) || ids.find((q) => q !== s); if (o && ids.length >= 2) return first(o); return me && me !== s ? first(me) : 'everyone'; }
function speak(s, text, o) { return bubble(first(s), (o && o.to) || target(s), voiced(s, text, o)); }
/* beat/topic lines: '~' = narration, "quoted" = speech by s */
function render(s, lines) {
  return lines.map((l) => {
    if (l.startsWith('~')) return `<i>${l.slice(1)}</i>`;
    const m = l.match(/^"([\s\S]*)"$/); return speak(s, m ? m[1] : l);
  }).join('\n\n');
}
const portrait = (s, anim) => ({ sp: s.sp, state: H.stateOf(s), anim: anim || 'blink' });

/* ---------- applying outcomes ---------- */
function applyFx(s, fx, text) {
  if (!fx) return;
  const G = H.G;
  if (fx.t) s.trust = clamp((s.trust || 0) + fx.t, 0, 100);
  if (fx.m) H.mood(s, fx.m);
  if (fx.all) H.moodAll(fx.all);
  if (fx.hp) H.hurt(s, -fx.hp, 'The ordeal took its toll.'); // negative hp means damage
  if (fx.heal) { s.hp = Math.min(100, s.hp + fx.heal); s.wound = false; s.wnd = null; }
  if (fx.flag) setMem(fx.flag);
  if (fx.inv) Object.entries(fx.inv).forEach(([k, n]) => H.add(k, n));
  if (fx.fond) Object.entries(fx.fond).forEach(([oid, n]) => { const o = H.alive().find((x) => x.cid === oid); if (o) bond(s, o, n, 0); });
}

/* ---------- context handed to conditions ---------- */
function ctx() {
  const G = H.G, al = H.alive();
  const x = {
    G, al, day: G.day, flag: (k) => !!mem(k), pol: !!(G.fac && G.fac.length), anyHurt: al.some((s) => s.wound || s.hp < 60), grief: !!(G.mem && G.mem._death && G.day - G.mem._death <= 6),
    hasRadio: !!G.build.radio, dayGE: (n) => G.day >= n, hungry: al.filter((s) => s.hunger > 60 || s.thirst > 65), tension: (G.dir && G.dir.tension) || 0, rel, survivors: al
  };
  return x;
}

/* ---------- cast selection ---------- */
function resolveCast(d, x) {
  if (!d.cast) return {};
  const out = {}; const used = new Set();
  for (const slot of Object.keys(d.cast)) {
    const cands = x.al.filter((s) => !used.has(s.id) && d.cast[slot](s, x, out));
    if (!cands.length) return null;
    const best = d.score && d.score[slot] ? cands.map((c) => [c, d.score[slot](c, x, out) + Math.random() * 0.3]).sort((a, b) => b[1] - a[1])[0][0] : pick(cands);
    out[slot] = best; used.add(best.id);
  }
  return out;
}

/* ---------- character beats become storylets ---------- */
function beatDefs() {
  const out = [];
  H.alive().forEach((s) => {
    const c = cd(s); if (!c) return;
    (c.beats || []).forEach((b) => {
      if ((s.beats || {})[b.id]) return; if (H.G.day < b.day || (s.trust || 0) < b.trust) return;
      out.push({ id: 'beat:' + s.cid + ':' + b.id, kind: 'beat', w: 6 + (s.trust || 0) / 30, once: true, cd: 0, _s: s, _b: b });
    });
  });
  return out;
}
function runBeat(d, x) {
  const s = d._s, b = d._b;
  if (b.need && !b.need(x)) return false;
  s.beats = s.beats || {}; s.beats[b.id] = H.G.day;
  const ch = b.choices.map((c) => ({ label: c.label, fn() { applyFx(s, c.fx); if (c.fx && c.fx.t > 0) bond(s, s, 0, 0); return c.reply ? render(s, [`"${c.reply}"`]) : ''; } }));
  H.ask(b.title, render(s, b.lines), ch, portrait(s));
  return true;
}

/* ---------- talk ---------- */
const TONES = [
  { id: 'comfort', label: 'Comfort them', score: (a, L) => a.warm + (1 - a.guard) * 0.4 + (L === 'wound' ? 0.4 : 0) },
  { id: 'joke', label: 'Lighten it with a joke', score: (a, L) => a.funny + (1 - a.guard) * 0.2 - (L === 'wound' ? 0.7 : 0) },
  { id: 'probe', label: 'Ask a harder question', score: (a, L) => (1 - a.guard) * 0.9 + (L === 'secret' ? 0.3 : 0) - 0.1 },
  { id: 'respect', label: 'Thank them and respect the line', score: (a, L) => a.order * 0.7 + 0.25 },
  { id: 'silent', label: 'Say nothing. Just stay.', score: (a, L) => a.guard * 0.6 + (L === 'wound' ? 0.6 : 0.1) },
  { id: 'push', label: 'Tell them to be stronger', score: (a, L) => a.brave * 0.9 - a.warm * 0.3 - (L === 'wound' ? 0.3 : 0) }
];
const REPLY = {
  warm: ['That helped. Thank you.', 'I did not know I needed to say that out loud.', 'You are easy to talk to, Oga.', 'I feel lighter now.', 'Please keep this between us.'],
  neutral: ['Hm. Okay.', 'Thank you for listening.', 'It is what it is.', 'I should get back to work.'],
  cold: ['I did not want to talk about it like that.', 'Please do not do that again.', 'Forget I said anything.', 'I am tired. Leave me.']
};
function topicsFor(s) {
  const c = cd(s); const done = s.topics || {};
  return (c.topics || []).map((t) => ({ t, done: !!done[t.id], open: (s.trust || 0) >= t.trust }));
}
function talk(s) {
  CUR = { A: s };
  const c = cd(s); if (!c) return false;
  if (s.slots < 1 || s.mood < 12) { H.say(first(s), s.mood < 12 ? render(s, [`~${first(s)} turns away. There is nothing left to say today.`]) : render(s, [`~${first(s)} is worn out. Perhaps tomorrow.`]), portrait(s)); return true; }
  const opts = topicsFor(s);
  const buttons = opts.filter((o) => !o.done && o.open).map((o) => ({ label: `Ask about: ${o.t.title}`, fn() { return startTopic(s, o.t); } }));
  const locked = opts.filter((o) => !o.done && !o.open).length; if (locked) buttons.push({ label: `🔒 ${locked} thing${locked > 1 ? 's' : ''} they are not ready to say yet`, off: true });
  const idleBark = pick((c.barks.idle || ['...']));
  buttons.push({ label: 'Just sit together', fn() { s.slots--; bond(s, s, 0, 0); H.mood(s, 3); s.trust = clamp((s.trust || 0) + 2, 0, 100); return render(s, [`~You sit for a while with ${first(s)}. Neither of you hurries.`, `"${idleBark}"`]); } });
  buttons.push({ label: 'Leave it' });
  H.ask(first(s), render(s, [`~${c.bio}`, `"${pick(c.barks[s.mood < 40 ? 'night' : 'idle'] || c.barks.idle)}"`]), buttons, portrait(s));
  return true;
}
function startTopic(s, t) {
  const c = cd(s); s.slots--; s.topics = s.topics || {}; s.topics[t.id] = H.G.day;
  s.known = s.known || []; if (t.learn && !s.known.includes(t.learn)) s.known.push(t.learn);
  if (t.flag) setMem(t.flag);
  const L = t.layer;
  const tones = TONES.map((o) => ({ o, sc: clamp(o.score(c.axes, L), 0, 1.6) })).sort((a, b) => b.sc - a.sc);
  const offered = tones.length > 4 ? [tones[0], tones[1], tones[tones.length - 1], tones[Math.floor(tones.length / 2)]].filter((v, i, a) => a.indexOf(v) === i) : tones;
  const choices = offered.map(({ o, sc }) => ({
    label: o.label, fn() {
      const out = sc >= 0.95 ? 'warm' : sc >= 0.55 ? 'neutral' : 'cold';
      const dt = { warm: 7, neutral: 2, cold: -5 }[out] + (L === 'wound' || L === 'secret' ? 2 : 0) * (out === 'cold' ? -1 : 1);
      s.trust = clamp((s.trust || 0) + dt, 0, 100); H.mood(s, out === 'warm' ? 5 : out === 'cold' ? -3 : 1);
      setMem('talk_' + s.cid + '_' + t.id + '_' + o.id);
      return render(s, [`"${pick(REPLY[out])}"`]);
    }
  }));
  choices.prompt = 'You say…'; H.ask(t.title, render(s, t.lines), choices, portrait(s));
  return '';
}

/* ---------- the director ---------- */
const HUMAN = ['beat', 'camp', 'pair', 'romance', 'grief', 'humor', 'gist', 'favor'];
const DREAD = ['horror', 'crisis', 'nemesis'];
function eligible(d, x) {
  const G = H.G; G.dir = G.dir || { tension: 20, last: [], cool: {} };
  if (d.once && mem('fired:' + d.id)) return null;
  const last = G.dir.cool[d.id]; if (last != null && G.day - last < (d.cd == null ? 4 : d.cd)) return null;
  if (d.when && !d.when(x)) return null;
  if (d.kind !== 'beat' && G.dir.last.slice(-2).includes(d.id)) return null;
  return resolveCast(d, x);
}
function fire(d, cs, x) {
  const G = H.G; G.dir = G.dir || { tension: 20, last: [], cool: {} };
  let ok = true; CUR = d.kind === 'beat' ? { A: d._s } : (cs || {});
  if (d.door && H.knock) ok = H.knock(d, cs, () => d.run(x, cs || {}));
  else if (d.kind === 'beat') ok = runBeat(d, x); else ok = d.run(x, cs || {}) !== false;
  if (ok === false) return false;
  G.dir.cool[d.id] = G.day; G.dir.last.push(d.id); if (G.dir.last.length > 8) G.dir.last.shift();
  if (d.once) setMem('fired:' + d.id);
  if (d.tension) G.dir.tension = clamp(G.dir.tension + d.tension, 0, 100);
  G.stats.storylets = (G.stats.storylets || 0) + 1; G.stats.by = G.stats.by || {}; G.stats.by[d.kind] = (G.stats.by[d.kind] || 0) + 1;
  return true;
}
function chooseFrom(pool, x) {
  const items = []; pool.forEach((d) => { const cs = eligible(d, x); if (cs) items.push([d, cs, Math.max(0.05, typeof d.w === 'function' ? d.w(x, cs) : d.w)]); });
  if (!items.length) return null;
  let r = Math.random() * items.reduce((a, b) => a + b[2], 0); for (const it of items) { if ((r -= it[2]) < 0) return it; } return items[0];
}
/* A morning: at least one human moment, then whatever the tension asks for. */
function morning(opts) {
  const G = H.G; G.dir = G.dir || { tension: 20, last: [], cool: {} };
  const x = ctx(); const pool = defs.concat(beatDefs());
  /* pressure from the state of the shelter */
  const starving = x.al.filter((s) => s.hunger > 85 || s.thirst > 85).length;
  if (!(opts && opts.mixed)) G.dir.tension = clamp(G.dir.tension * 0.82 + 6 + starving * 7 + (x.grief ? 8 : 0) + (x.tension > 70 ? 0 : 0), 0, 100);
  const n = opts && opts.n !== undefined ? opts.n : 2 + (chance(0.55) ? 1 : 0) + (G.day % 6 === 0 ? 1 : 0);
  const chosen = [];
  for (let i = 0; i < n; i++) {
    const t = G.dir.tension;
    let kinds;
    if (i === 0 && !(opts && opts.mixed)) kinds = HUMAN;                                  // always one human moment first
    else if (t > 68) kinds = HUMAN.concat(['humor', 'humor', 'camp']);   // relief
    else if (t < 32) kinds = DREAD.concat(['politics', 'world']);        // the quiet is wrong; make it worse
    else kinds = HUMAN.concat(DREAD, ['politics', 'world', 'visitor']);
    const sub = pool.filter((d) => kinds.includes(d.kind) && !chosen.includes(d.id));
    const it = chooseFrom(sub, x) || chooseFrom(pool.filter((d) => !chosen.includes(d.id)), x);
    if (!it) continue;
    if (fire(it[0], it[1], x)) chosen.push(it[0].id);
  }
  return chosen;
}
/* daily drift of relationships and morale */
function tick() {
  const G = H.G, al = H.alive(); const x = ctx();
  for (let i = 0; i < al.length; i++) for (let j = i + 1; j < al.length; j++) {
    const a = al[i], b = al[j], r = rel(a, b);
    const ok = a.mood > 45 && b.mood > 45 && a.hunger < 70 && b.hunger < 70;
    r.fond = clamp(r.fond + (ok ? 1.3 : -0.3), -50, 100);
    if (a.hunger > 78 || b.hunger > 78 || a.thirst > 85 || b.thirst > 85) r.tension = clamp(r.tension + 3, 0, 100); else r.tension = clamp(r.tension - 0.8, 0, 100);
    if (r.love > 0 && ok) { H.mood(a, 1); H.mood(b, 1); }
  }
  al.forEach((s) => { const c = cd(s); if (!c) return; s.doing = pick(c.acts || ['waiting']); if (!s.trust) s.trust = s.trust || 10; });
}
/* deaths ripple through everyone */
function onDeath(s, why) {
  const G = H.G; setMem('_death'); setMem('dead:' + s.cid);
  G.dir = G.dir || { tension: 20, last: [], cool: {} }; G.dir.tension = clamp(G.dir.tension + 18, 0, 100);
  G.dead = G.dead || []; G.dead.push({ cid: s.cid, name: s.name, day: G.day, sp: s.sp, why: why || '' });
  H.alive().forEach((o) => { const r = rel(s, o); const hit = Math.round(4 + r.fond / 6 + (r.love > 0 ? 12 : 0)); H.mood(o, -hit); o.grief = (o.grief || 0) + Math.max(0, hit - 6); });
}
function describe(s) {          /* a survivor's page: the moment before the attack */
  const c = cd(s); if (!c) return '';
  const L = C.Lore && C.Lore.pastOf(c); return L && L.scene ? `<i>${L.scene}</i>` : '';
}

C.Story = {
  set host(h) { H = h; }, get host() { return H; }, get cur() { return CUR; }, set cur(v) { CUR = v; }, bubble, defs, add, ctx, morning, tick, talk, topicsFor, onDeath, initRel, describe,
  rel, bond, mem, setMem, speak, voiced, render, portrait, applyFx, first, cd, pick, rnd, chance, clamp, key, resolveCast, eligible, fire
};
if (typeof module !== 'undefined') module.exports = C.Story;
})(typeof window !== 'undefined' ? window : globalThis);
