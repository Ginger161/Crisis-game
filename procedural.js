/* CRISIS — procedural micro-events
   Authored story cards are fixed scenes. These are assembled fresh every time from banks of people, places, objects, senses,
   memories and outcomes, so the same card seldom plays the same way twice. This is where the "generated" feel comes from. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const S = C.Story, P = () => C.Politics, K = () => C.Cast;
const H = () => S.host;
const { speak, portrait, bond, rel, pick, chance, rnd, clamp, first, cd } = S;
const ask = (t, txt, ch, art) => H().ask(t, txt, ch, art), say = (t, txt, art) => H().say(t, txt, art);
const mood = (s, n) => H().moodAll && H().mood(s, n), all = (n) => H().moodAll(n);
const trust = (s, n) => { s.trust = clamp((s.trust || 0) + n, 0, 100); };

const PLACE = ['in the corridor', 'on the stairs', 'by the water store', 'on the roof', 'at the barricade', 'in the room next door', 'under the window', 'at the far end of the hall', 'beside the stove', 'in the stairwell', 'behind the wardrobe', 'on the landing', 'by the washroom door'];
const THING = ['a cracked phone', 'a half-burnt candle', 'a student ID on a lanyard', 'a single sandal', 'a chipped enamel cup', 'a handwritten timetable', 'a bent spoon', 'a sachet of pepper', 'a blue ballpoint pen', 'a child\'s drawing', 'a torn football jersey', 'a laminated prayer card', 'a bag of sweets nobody has opened', 'a keyring with a tiny flag on it', 'a pair of broken sunglasses', 'a rolled-up lecture handout', 'a wedding invitation', 'a pair of reading glasses'];
const SENSE = ['The air smells of kerosene and old rice.', 'Somewhere, a generator coughs and gives up.', 'The harmattan dust has settled on everything.', 'A bat flickers past the window.', 'Wet cloth drips in the dark.', 'The wall is still warm from the day.', 'Far away, a dog barks twice and stops.', 'The light is the colour of weak tea.', 'Nobody has spoken for a while.', 'The mosquito coil has burnt down to a grey curl.'];
const SOUND = ['a slow dragging', 'three soft knocks', 'someone humming', 'a child laughing, once', 'glass, breaking, very far', 'a door that should not be moving', 'breathing, close to the wall'];
const FOOD = ['the last of the garri', 'a tin of sardines', 'two cups of rice', 'a handful of groundnuts', 'the end of the bread'];
const MEMORY = ['the smell of her mother\'s kitchen on a Saturday', 'a football match nobody remembers the score of', 'the sound of the 6 a.m. generator at home', 'a bus ride they took at fifteen', 'the first time they heard their name called on stage', 'a wedding with too much jollof', 'a teacher who believed in them', 'a rainstorm that flooded the street'];
const OUT = {
  warm: ['It lands better than either of you expected.', 'Something in the room loosens, just slightly.', 'For a moment it feels like before.', 'Nobody says anything. Nobody needs to.'],
  mid: ['It is neither good nor bad. It is only a thing that happened.', 'The moment passes, as moments do.', 'Life goes on, in its small and stubborn way.'],
  cold: ['It goes badly. Nobody says so.', 'The silence afterwards is heavier than the argument.', 'You can feel it settle between them.']
};

let N = 0;
function reg(id, kind, w, build, when) {
  S.add({ id: 'mi_' + id, kind, w, cd: 3, when, cast: { A: (s) => s.mood > 15, B: (s, x, o) => s.id !== o.A.id },
    run(x, cs) { const r = build(cs.A, cs.B, x); if (!r) return false; ask(r.title, r.text, r.choices, portrait(cs.A)); return true; } });
}
const warmOrCold = (a, b, dFond, dTension) => { bond(a, b, dFond, dTension); };

/* ---- camp ---- */
reg('found', 'camp', 1.6, (A, B) => { const th = pick(THING), pl = pick(PLACE);
  return { title: 'Something left behind', text: `${first(A)} finds ${th} ${pl}. <i>${pick(SENSE)}</i>\n\n${speak(A, pick(['I think this belonged to somebody.', 'This is stupid. Why does it make me want to cry?', 'Somebody was here before us. Somebody who thought they were coming back.', 'I am keeping it. Do not argue.']))}`, choices: [
    { label: 'Let them keep it', fn() { mood(A, 3); trust(A, 2); return `<i>${first(A)} puts it in a pocket and pats it twice. ${pick(OUT.warm)}</i>`; } },
    { label: 'Add it to the supplies', fn() { H().add(pick(['cloth', 'parts', 'wood']), 1); mood(A, -2); return `<i>It goes in the pile. ${first(A)} does not watch it go.</i>`; } },
    { label: 'Ask who it might have belonged to', fn() { trust(A, 3); mood(A, 2); return `${speak(A, `A girl, I think. Early twenties. She had ${pick(['a laugh you could hear from the stairs', 'a limp she was embarrassed about', 'a boyfriend in another hostel', 'a talent for mimicry'])}. I never knew her name.`)}`; } }] }; });
reg('ritual', 'camp', 1.2, (A) => ({ title: 'A small ritual', text: `${first(A)} has started touching the doorframe three times before going out, and saying a name. <i>${pick(SENSE)}</i>\n\nNobody has mentioned it. Everybody has noticed.`, choices: [
  { label: 'Join them, quietly', fn() { trust(A, 5); mood(A, 4); all(1); return `<i>The next day, two others are doing it. By the end of the week, the whole shelter is.</i>`; } },
  { label: 'Ask what it is for', fn() { trust(A, 3); return speak(A, pick(['It is so I remember I came back.', 'It is a name. You would not know them.', 'It is nothing. Habit. Please forget it.'])); } },
  { label: 'Say nothing', fn() { return `<i>Some things are better left alone to work.</i>`; } }] }));
reg('game', 'camp', 1.4, (A, B) => { const g = pick(['guess the sound', 'name that song', 'count the rats', 'twenty questions about the neighbours', 'who can be quiet the longest']);
  return { title: 'A game', text: `${first(A)} and ${first(B)} have invented a game: <b>${g}</b>. There are rules, and the rules are changing as they play.\n\n${speak(B, `That does not count! You moved!`)}`, choices: [
    { label: 'Play', fn() { warmOrCold(A, B, 4, -2); all(2); return `<i>${pick(OUT.warm)}</i>`; } },
    { label: 'Referee', fn() { warmOrCold(A, B, 2, -3); return `<i>Nobody likes your ruling. Everybody respects it.</i>`; } },
    { label: 'Tell them to keep it down', fn() { all(-1); return `<i>The game ends. The quiet is not an improvement.</i>`; } }] }; });
reg('sing', 'camp', 1.1, (A) => ({ title: 'A song from before', text: `${first(A)} hums something from the radio, back when there was a radio. ${pick(SENSE)}\n\n<i>By the second verse, you realise you know the words.</i>`, choices: [
  { label: 'Join in', fn() { all(3); trust(A, 3); return `<i>Not well. Not loud. But for three minutes the shelter is a different place.</i>`; } },
  { label: 'Ask for another', fn() { mood(A, 4); return speak(A, `If you insist. This one is slow.`); } },
  { label: 'Hush them', fn() { mood(A, -4); trust(A, -3); return `<i>${first(A)} stops. The silence is a thing with edges.</i>`; } }] }));
reg('dream', 'camp', 1.2, (A) => ({ title: 'What they dreamed', text: `${first(A)} wakes before the others and sits on the edge of the bed.\n\n${speak(A, `I dreamed of ${pick(MEMORY)}. It was so clear I could taste it. Then I woke up here.`)}`, choices: [
  { label: 'Ask them to tell you all of it', fn() { trust(A, 5); mood(A, 3); return `<i>It takes a long time. It is a good dream. You both pretend it is only a story.</i>`; } },
  { label: 'Tell them one of yours', fn() { trust(A, 6); mood(A, 2); return `<i>You say it softly. ${first(A)} listens as if it matters. It does.</i>`; } },
  { label: 'Say dreams are a luxury', fn() { trust(A, -4); mood(A, -3); return speak(A, `Yes, Oga. You are right.`); } }] }));
/* ---- humor ---- */
reg('prank', 'humor', 1.6, (A, B) => ({ title: 'The missing shoe', text: `${first(A)} cannot find one shoe. ${first(B)} is looking at the ceiling with great innocence.\n\n${speak(A, `${first(B)}. Where. Is. It.`)}`, choices: [
  { label: 'Side with the prankster', fn() { warmOrCold(A, B, 3, 2); mood(B, 4); all(2); return `<i>The shoe is found in the water bucket. Everyone is delighted except ${first(A)}.</i>`; } },
  { label: 'Make them give it back', fn() { warmOrCold(A, B, 1, -1); mood(A, 3); return `<i>${first(B)} hands it over, cold and a little ashamed.</i>`; } },
  { label: 'Hide the other one too', fn() { warmOrCold(A, B, 4, 0); all(3); return `<i>It is the first time in days that the whole shelter has laughed at once.</i>`; } }] }));
reg('boast', 'humor', 1.3, (A, B) => ({ title: 'A tall story', text: `${first(A)} claims to have once ${pick(['outrun a police van', 'cooked for a governor', 'won a debate against a professor', 'fought a goat and won', 'been on the radio'])}.\n\n${speak(B, `Eh? When? Who saw it? Where is the evidence?`)}`, choices: [
  { label: 'Demand a demonstration', fn() { warmOrCold(A, B, 3, 0); all(2); return `<i>It goes terribly, which was the point.</i>`; } },
  { label: 'Back the story', fn() { mood(A, 4); warmOrCold(A, B, 2, 1); return `<i>${first(A)} straightens up an inch. ${first(B)} mutters about favouritism.</i>`; } },
  { label: 'Change the subject', fn() { return `<i>The story grows in the retelling. By evening it involves two goats.</i>`; } }] }));
/* ---- pairs ---- */
reg('borrow', 'pair', 1.4, (A, B) => ({ title: 'A small favour', text: `${first(A)} wants to borrow ${pick(THING)} from ${first(B)}. ${first(B)} hesitates, and the hesitation is a whole conversation.`, choices: [
  { label: `Tell ${first(B)} to share`, fn() { warmOrCold(A, B, 2, 3); mood(B, -2); return `<i>It is shared. It is also remembered.</i>`; } },
  { label: 'Say ask again tomorrow', fn() { warmOrCold(A, B, 0, -1); return `<i>Nobody is happy. Nobody is angry. It is a mild kind of peace.</i>`; } },
  { label: 'Give them something from the supplies', fn() { H().add('cloth', -1); warmOrCold(A, B, 4, -4); return `<i>The trade is awkward and generous and settles it.</i>`; } }] }), (x) => x.al.length >= 2);
reg('apology', 'pair', 1.3, (A, B) => ({ title: 'Words that will not come', text: `${first(A)} keeps starting toward ${first(B)} and stopping. This has been going on since morning.\n\n<i>${pick(SENSE)}</i>`, choices: [
  { label: 'Nudge them forward', fn() { warmOrCold(A, B, 6, -9); return `${speak(A, `I am sorry about before. I did not mean it. I only meant I was scared.`)}\n\n<i>${pick(OUT.warm)}</i>`; } },
  { label: 'Leave them to it', fn() { warmOrCold(A, B, 1, -2); return `<i>It resolves, or does not. You will not know until tomorrow.</i>`; } },
  { label: 'Make light of it', fn() { warmOrCold(A, B, 3, -4); all(1); return `<i>They both throw things at you. It works.</i>`; } }] }), (x) => x.al.length >= 2);
/* ---- horror ---- */
reg('footprints', 'horror', 1.6, (A) => { const pl = pick(PLACE); return { title: 'Fresh footprints', text: `${pl.charAt(0).toUpperCase() + pl.slice(1)}, in the dust, there are footprints. Small. Bare. Fresh. They go in. They do not come out.\n\n${speak(A, `Nobody has been in there. Nobody.`)}`, choices: [
  { label: 'Follow them', fn() { if (chance(0.45)) { H().hurt(A, rnd(5, 14), 'Ambushed following footprints.'); all(-3); return `<i>${pick(['A blade.', 'A pipe.', 'A fall through the floor.'])} ${first(A)} comes back bleeding. Whoever left the prints is long gone.</i>`; } all(-2); H().add('food', 1); return `<i>They end at a cracked window. On the sill: a small bundle of food, left or forgotten.</i>`; } },
  { label: 'Sweep them away', fn() { all(-1); return `<i>By morning, there are new ones. Smaller. Closer.</i>`; } },
  { label: 'Set a watch', fn() { mood(A, -2); all(1); return `<i>You see nothing. That is almost worse.</i>`; } }] }; });
reg('smell', 'horror', 1.2, (A) => ({ title: 'The sweet smell', text: `A sweet, heavy smell is coming from ${pick(PLACE)}. Not rot, exactly. Not yet.\n\n${speak(A, `I know that smell. Please do not make me say what it is.`)}`, choices: [
  { label: 'Seal the room', fn() { H().add('cloth', -1); all(-1); return `<i>It stays shut. The smell stays in the walls.</i>`; } },
  { label: 'Open it and look', fn() { all(-5); mood(A, -4); return `<i>You will not describe what is in there. Somebody will say a prayer. Somebody will be sick.</i>`; } },
  { label: 'Burn something to cover it', fn() { H().add('wood', -1); all(-1); return `<i>The smoke fills the corridor. Nobody mentions the smell again. Nobody forgets it.</i>`; } }] }));
reg('phone', 'horror', 1.1, (A) => ({ title: 'A dead phone, lit', text: `${first(A)}'s phone has been dead for a week. Tonight it lights up. One notification, from a contact saved as <b>${pick(['Mama', 'Daddy', 'My Love', 'Chinedu (Roommate)', 'Pastor', 'Sister Bisi'])}</b>.\n\n${speak(A, `It is not charged. How is it lit? Oga, how is it lit?`)}`, choices: [
  { label: 'Tell them to read it', fn() { mood(A, -5); trust(A, 4); return `<i>It says one word. Not a word you would expect. ${first(A)} turns the phone face-down and will not touch it again.</i>`; } },
  { label: 'Take the phone away', fn() { mood(A, 2); return `<i>The screen goes dark in your hand. Cold, like a stone from a river.</i>`; } },
  { label: 'Tell them it is only residual charge', fn() { mood(A, -2); trust(A, -2); return `${speak(A, `Yes. That must be it.`)}`; } }] }));
reg('headcount', 'horror', 1.0, (A) => ({ title: 'One too many', text: `${first(A)} counts heads at night, as they do. They count again. They count a third time and their voice goes odd.\n\n${speak(A, `We are one more than we should be.`)}`, choices: [
  { label: 'Count again yourself', fn() { all(-2); return `<i>You get the right number. ${first(A)} does not. Neither of you says it.</i>`; } },
  { label: 'Light every candle', fn() { H().add('wood', 0); all(1); return `<i>Fifteen small flames. Nothing in the corners. You do not sleep, but you are glad of the light.</i>`; } },
  { label: 'Tell them they are tired', fn() { mood(A, -3); return `<i>Maybe they are. That is almost the same thing as being wrong.</i>`; } }] }));
reg('writing', 'horror', 1.0, (A) => ({ title: 'New writing on the wall', text: `Overnight, someone has written a name on the wall of the stairwell, in charcoal. Careful letters. Not a name you know.\n\n<i>${pick(SENSE)}</i>`, choices: [
  { label: 'Read it aloud', fn() { all(-3); return `<i>The sound of it in the hall makes it worse. Someone starts to cry, softly, and does not know why.</i>`; } },
  { label: 'Wipe it off', fn() { all(-1); return `<i>It is back by morning, a little lower down.</i>`; } },
  { label: 'Add a name beneath it', fn() { all(2); mood(A, 3); return `<i>Yours? Theirs? A friend's? You keep it to yourself. The wall is quiet after that.</i>`; } }] }));
/* ---- the world beyond the shelter ---- */
S.add({ id: 'mi_note', kind: 'world', w: 1.5, cd: 4, when: (x) => (x.G.fac || []).some((f) => f.status === 'active' && f.met), cast: { A: (s) => true },
  run(x, { A }) {
    const f = pick(x.G.fac.filter((q) => q.status === 'active' && q.met)); const o = pick(x.G.fac.filter((q) => q.status === 'active' && q.id !== f.id));
    const msgs = [`Do not trust ${o.name}. They are talking about you.`, `Bring two sachets of water to the ${pick(['stairwell', 'clinic', 'chapel'])} tonight. Say nothing.`, `${o.name} are planning something. Before the weekend.`, `If you want to know where ${o.name} keep their food, ask me at midnight.`];
    ask('A note under the door', `<i>A folded scrap of paper, pushed under the barricade. Block capitals. No name, but the paper is the kind ${f.name} use.</i>\n\n“${pick(msgs)}”`, [
      { label: 'Believe it', fn() { f.p = clamp(f.p + 6, -100, 100); o.p = clamp(o.p - 8, -100, 100); all(-1); return `<i>It might be true. It might be a trap. You act as if it were true, which is a choice with consequences.</i>`; } },
      { label: 'Burn it', fn() { return `<i>You watch the corner curl. You feel like somebody who has refused to be used.</i>`; } },
      { label: 'Show the group', fn() { all(1); A.trust = clamp((A.trust || 0) + 3, 0, 100); return `<i>Everyone reads it. Everyone has a theory. For an hour, you are all on the same side of something.</i>`; } }], P().faceArt ? P().faceArt(f) : undefined);
  } });
S.add({ id: 'mi_smoke', kind: 'world', w: 1.2, cd: 4, tension: 3, cast: { A: (s) => true },
  run(x, { A }) {
    const L = C.Campus.LOCS[rnd(0, C.Campus.LOCS.length - 1)];
    ask('Smoke', `From the roof, ${first(A)} points. A thin grey column, rising from near <b>${L.name}</b>. It was not there this morning.\n\n${speak(A, `Is that a cooking fire? Or something burning?`)}`, [
      { label: 'Send someone to look', fn() { if (chance(0.4)) { H().hurt(A, rnd(4, 12), 'Hurt scouting the smoke.'); return `<i>${first(A)} comes back coughing, with a burn on one arm. It was a store on fire. Nobody was in it.</i>`; } H().add('food', 1); return `<i>A cooking fire. A family you will never meet, trying to eat. You leave a sachet of water on their step.</i>`; } },
      { label: 'Note it and wait', fn() { all(-1); return `<i>By evening, it is gone. You will never know.</i>`; } }], portrait(A));
  } });
S.add({ id: 'mi_rumour_trade', kind: 'world', w: 1.2, cd: 5, cast: { A: (s) => true },
  run(x, { A }) {
    const t = pick(['a convoy was seen on the access road', 'the Gate Boys have a new commander', 'a helicopter dropped something near the hills', 'the clinic has run out of everything', 'somebody saw soldiers at the Bwari junction']);
    ask('A rumour for sale', `A stranger at the barricade offers a rumour for a sachet of water: <i>“${t}.”</i>\n\n<i>${pick(SENSE)}</i>`, [
      { label: 'Pay for it', off: H().inv('water') < 1, fn() { H().add('water', -1); (x.G.newsLog = x.G.newsLog || []).unshift({ d: x.G.day, t: t.charAt(0).toUpperCase() + t.slice(1) + '. (a stranger said so)' }); x.G.newsLog.length = Math.min(x.G.newsLog.length, 6); all(chance(0.5) ? 2 : -1); return `<i>It might be true. It might be what a thirsty man says. You will not know until it matters.</i>`; } },
      { label: 'Send them away', fn() { return `<i>They shrug and go. The rumour goes with them, to somebody less careful.</i>`; } }]);
  } });

C.ProceduralLoaded = true;
if (typeof module !== 'undefined') module.exports = {};
})(typeof window !== 'undefined' ? window : globalThis);
