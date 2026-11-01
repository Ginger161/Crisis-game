/* CRISIS — storylets (camp life, humor, relationships, romance, grief, horror)
   Faction and war storylets live in politics.js. Character beats live in cast.js. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const S = C.Story;
const H = () => S.host;
const { speak, render, portrait, bond, rel, pick, chance, rnd, clamp, first, mem, setMem, cd } = S;
const ask = (t, txt, ch, art) => H().ask(t, txt, ch, art), say = (t, txt, art) => H().say(t, txt, art);
const mood = (s, n) => H().mood(s, n), all = (n) => H().moodAll(n);
const fond = (a, b) => rel(a, b).fond;
const adult = (s) => (cd(s) ? cd(s).age : 20) >= 18;
/* who can fall for whom. Set `into: 'm' | 'f' | 'any'` on a character in cast.js or groups.js. Default: the other sex. Both people must be open to it. */
const opens = (a, b) => { const ca = cd(a), cb = cd(b); if (!ca || !cb) return false; const into = ca.into || (ca.sex === 'm' ? 'f' : 'm'); return into === 'any' || into === cb.sex; };
const compatible = (a, b) => opens(a, b) && opens(b, a);
const other = (s, x, not) => x.al.filter((o) => o.id !== s.id && !(not || []).includes(o.id));

/* =====================  CAMP LIFE  ===================== */
S.add({ id: 'meal_together', kind: 'camp', w: 2.2, cast: { A: (s) => s.hunger < 88, B: (s, x, o) => s.hunger < 88 && fond(o.A, s) >= 0 },
  run(x, { A, B }) {
    ask('A shared meal', `The pot is thin tonight: more water than anything. ${first(A)} and ${first(B)} sit across from one another, each waiting for the other to take the first spoon.\n\n${speak(A, `Eat. I already had mine.`)}\n\n<i>Everyone in the room knows that is a lie.</i>`, [
      { label: 'Make them split it evenly', fn() { bond(A, B, 5, -2, 'shared a meal'); mood(A, 3); mood(B, 3); return `<i>They eat slowly. Somebody almost laughs.</i>`; } },
      { label: `Give ${first(A)} the larger share`, fn() { mood(A, 4); mood(B, -2); bond(A, B, 2, 3); return `${speak(B, `It is fine. It is fine. Eat.`)}`; } },
      { label: 'Say nothing and let them sort it out', fn() { bond(A, B, 3, 0, 'ate together'); return `<i>They both leave a little in the bowl for a third person who is not there.</i>`; } }
    ], portrait(A));
  } });

S.add({ id: 'story_fire', kind: 'camp', w: 2, cast: { A: (s) => (s.known || []).length > 0 && s.mood > 25 },
  run(x, { A }) {
    const memory = pick(A.known);
    ask('A story by candlelight', `Nobody wants to sleep. The candle gutters. ${first(A)} starts talking, mostly to the flame.\n\n<i>${memory}</i>\n\n${speak(A, `Funny. When it was happening I did not think it mattered. Now I think about it every night.`)}`, [
      { label: 'Ask what happened next', fn() { bond(A, A, 0, 0); A.trust = clamp((A.trust || 0) + 4, 0, 100); mood(A, 4); return speak(A, `You really want to know? Okay. Come closer. I will tell it properly.`); } },
      { label: 'Listen quietly', fn() { A.trust = clamp((A.trust || 0) + 3, 0, 100); mood(A, 3); return `<i>${first(A)} talks until the candle dies. Then the room is dark, and nobody minds.</i>`; } },
      { label: 'Change the subject', fn() { mood(A, -3); A.trust = clamp((A.trust || 0) - 2, 0, 100); return speak(A, `Sorry. I am talking too much.`); } }
    ], portrait(A));
  } });

S.add({ id: 'whot_night', kind: 'camp', w: 1.4, cast: { A: (s) => cd(s) && (cd(s).axes.funny > 0.6 || s.cid === 'dan'), B: (s) => s.mood > 20 },
  run(x, { A, B }) {
    ask('Whot', `${first(A)} has torn the cereal box into cards. He deals with a flourish he must have practised in mirrors.\n\n${speak(A, `One game. The loser does the dishes. Today there are no dishes, so the loser does a dance.`)}`, [
      { label: 'Play', fn() { const win = chance(0.5); bond(A, B, 6, 0, 'cards'); all(2); return win ? `<i>You win. ${first(B)} has to dance. It is terrible. It is perfect.</i>` : `<i>You lose. You dance. They will talk about it for weeks.</i>`; } },
      { label: 'Watch from the corner', fn() { all(1); return `<i>Laughter, on a night when laughter is a kind of food.</i>`; } },
      { label: 'End it, it is too loud', fn() { all(-2); A.trust = clamp((A.trust || 0) - 3, 0, 100); return `<i>The cards go away. So does the warmth.</i>`; } }
    ], portrait(A));
  } });

S.add({ id: 'lullaby', kind: 'camp', w: 1.2, cast: { A: (s) => cd(s) && cd(s).axes.warm > 0.8 && s.mood > 20 },
  run(x, { A }) {
    say('Someone sings', `Past midnight, ${first(A)} starts to hum. It is an old song, one of those that are older than the people singing them.\n\n<i>One by one, the room goes quiet. It is the first real sleep in days.</i>\n\n${speak(A, `Sleep. I will watch.`)}`, portrait(A));
    all(4); A.trust = clamp((A.trust || 0) + 2, 0, 100);
  } });

S.add({ id: 'prayer_circle', kind: 'camp', w: 1.3, cast: { A: (s) => cd(s) && cd(s).axes.pious > 0.75 && s.mood > 20 }, when: (x) => x.tension > 30,
  run(x, { A }) {
    ask('Prayer', `${first(A)} kneels by the window and does not ask anyone to join. Two people do anyway. Then three.\n\n<i>Voices low. Hands, foreheads, floor. Not everyone believes, but everyone stays.</i>`, [
      { label: 'Join them', fn() { all(4); bond(A, A, 0, 0); A.trust = clamp((A.trust || 0) + 4, 0, 100); return `<i>You do not pray, exactly. You stay. It counts.</i>`; } },
      { label: 'Stand guard so they can', fn() { all(3); A.trust = clamp((A.trust || 0) + 6, 0, 100); return speak(A, `Thank you. We feel safer when somebody is watching.`); } },
      { label: 'Tell them to hurry up', fn() { all(-1); A.trust = clamp((A.trust || 0) - 6, 0, 100); return ''; } }
    ], portrait(A, 'pray'));
  } });

/* =====================  HUMOR  ===================== */
S.add({ id: 'jollof_war', kind: 'humor', w: 1.8, cast: { A: (s) => true, B: (s, x, o) => s.cid !== o.A.cid && cd(s) && cd(o.A) && cd(s).home !== cd(o.A).home },
  run(x, { A, B }) {
    ask('The great jollof argument', `It begins with a sentence nobody can remember, and ends with ${first(A)} from ${cd(A).home} and ${first(B)} from ${cd(B).home} standing nose to nose.\n\n${speak(A, `If you add that much tomato, it is stew. Call it stew.`)}\n\n${speak(B, `It is not stew! Where is your respect?`)}`, [
      { label: `Back ${first(A)}`, fn() { bond(A, B, -2, 4); mood(A, 4); all(1); return `<i>${first(A)} bows, as if they have won a war. ${first(B)} is wounded. It is the funniest thing that has happened in days.</i>`; } },
      { label: `Back ${first(B)}`, fn() { bond(A, B, -2, 4); mood(B, 4); all(1); return `<i>Cheers go up. ${first(A)} threatens to leave the shelter. They do not.</i>`; } },
      { label: 'Declare it a draw', fn() { bond(A, B, 5, -3); all(2); return `<i>You are not thanked. But you have kept a peace the size of a plate.</i>`; } }
    ], portrait(A));
  } });

S.add({ id: 'rat_hunt', kind: 'humor', w: 1.4, cast: { A: (s) => cd(s) && cd(s).axes.brave > 0.45, B: (s, x, o) => s.id !== o.A.id },
  run(x, { A, B }) {
    ask('The rat', `A rat the size of a shoe has found the garri. ${first(A)} has a broom. ${first(B)} is standing on a stool and shouting advice.\n\n${speak(B, `Left! No! Your other left!`)}`, [
      { label: 'Join the hunt', fn() { bond(A, B, 4, 0); all(3); H().add('food', chance(0.5) ? 0 : -1); return `<i>The rat escapes through the wall with the dignity of a politician. Everybody laughs until it hurts.</i>`; } },
      { label: 'Let them handle it', fn() { all(2); return `<i>It takes eleven minutes and a lot of noise. The rat wins.</i>`; } },
      { label: 'Throw a shoe', fn() { mood(A, 3); all(2); return `<i>Direct hit. Silence. Then cheering, which is not a thing you expected to hear again.</i>`; } }
    ], portrait(A));
  } });

S.add({ id: 'broadcast', kind: 'humor', w: 2.4, when: (x) => x.al.some((s) => s.cid === 'bashir'), cast: { A: (s) => s.cid === 'bashir' && s.mood > 20 },
  run(x, { A }) {
    ask('Live from the end of the world', `${first(A)} has found a plastic bottle and a stretch of wire. He holds it like a microphone.\n\n${speak(A, `Good evening. This is your correspondent, live from the end of the world. Tonight's top story: I am still handsome. Back to you, nobody.`)}\n\n<i>${x.hasRadio ? 'The radio crackles in the corner as if it wants to reply.' : 'There is no radio. He does the static himself.'}</i>`, [
      { label: 'Applaud', fn() { all(3); A.trust = clamp((A.trust || 0) + 5, 0, 100); return speak(A, `Thank you, thank you. My mother says I have a face for radio. She means it as an insult.`); } },
      { label: 'Ask for the weather', fn() { all(2); return speak(A, `Dark. Tomorrow: dark with a chance of more dark. Brought to you by hunger.`); } },
      { label: 'Tell him to be quiet', fn() { all(-2); A.trust = clamp((A.trust || 0) - 6, 0, 100); return ''; } }
    ], portrait(A));
  } });

S.add({ id: 'bad_poetry', kind: 'humor', w: 1.1, cast: { A: (s) => cd(s) && ['tunde', 'emeka', 'segun'].includes(s.cid) },
  run(x, { A }) {
    ask('A poem', `${first(A)} clears their throat. Everyone knows what is coming.\n\n${speak(A, `Oh, hunger! Oh, thirst! Oh, the unspeakable state of the bucket!`)}\n\n<i>It rhymes in no known language.</i>`, [
      { label: 'Give a standing ovation', fn() { all(3); mood(A, 5); return `<i>It is the worst poem ever written. You will miss it, one day.</i>`; } },
      { label: 'Heckle', fn() { all(2); mood(A, -1); bond(A, A, 0, 0); return `<i>${first(A)} finishes it anyway, with greater force.</i>`; } }
    ], portrait(A));
  } });

/* =====================  PAIRS  ===================== */
S.add({ id: 'quarrel', kind: 'pair', w: (x) => 1 + x.hungry.length * 0.7, cast: { A: (s) => true, B: (s, x, o) => s.id !== o.A.id && rel(o.A, s).tension > 20 }, cd: 3,
  run(x, { A, B }) {
    const r = rel(A, B);
    ask('Raised voices', `${first(A)} and ${first(B)} have been circling each other all day. Something small finally breaks the wall.\n\n${speak(A, `You never listen! You eat the most and you say the least!`)}\n\n${speak(B, `Say that again. Say it, to my face.`)}\n\n<i>${r.how ? `They have known each other as ${r.how}. That makes it worse.` : 'Nobody wants to be next.'}</i>`, [
      { label: `Side with ${first(A)}`, fn() { bond(A, B, -4, 8, 'quarrel'); mood(A, 4); mood(B, -5); B.trust = clamp((B.trust || 0) - 4, 0, 100); return `<i>${first(B)} turns away and says nothing for a long time.</i>`; } },
      { label: `Side with ${first(B)}`, fn() { bond(A, B, -4, 8, 'quarrel'); mood(B, 4); mood(A, -5); A.trust = clamp((A.trust || 0) - 4, 0, 100); return `<i>${first(A)} stalks off to the far end of the corridor.</i>`; } },
      { label: 'Make them both apologise', fn() { bond(A, B, 3, -12, 'made up'); mood(A, -2); mood(B, -2); return `<i>It is stiff. It is awkward. By morning it is mostly forgotten.</i>`; } },
      { label: 'Send them out on a joint task', fn() { bond(A, B, 5, -8, 'worked it out'); return `<i>Carrying water together is a better argument than any words.</i>`; } }
    ], portrait(A));
  } });

S.add({ id: 'night_whisper', kind: 'pair', w: 1.6, cast: { A: (s) => true, B: (s, x, o) => s.id !== o.A.id && fond(o.A, s) > 25 }, cd: 5,
  run(x, { A, B }) {
    ask('Voices after dark', `You wake to whispering. ${first(A)} and ${first(B)}, sitting close, heads almost touching, speaking too low to follow.\n\n<i>${first(B)} laughs, a small helpless sound. ${first(A)} puts a hand over their own mouth.</i>`, [
      { label: 'Listen', fn() { bond(A, B, 2, 0); return `${speak(A, `If we get out, you know what I will do first?`)}\n\n${speak(B, `Sleep for a year.`)}\n\n${speak(A, `No. I will tell my mother I am sorry.`)}`; } },
      { label: 'Turn over and let them talk', fn() { bond(A, B, 4, 0, 'night talks'); A.trust = clamp((A.trust || 0) + 2, 0, 100); return `<i>Some things need no audience.</i>`; } },
      { label: 'Clear your throat loudly', fn() { bond(A, B, -2, 1); return `<i>They scatter. The night feels colder.</i>`; } }
    ], portrait(A));
  } });

/* =====================  ROMANCE  ===================== */
const lovers = (a, b) => rel(a, b).love > 0;
S.add({ id: 'spark', kind: 'romance', w: 3, once: false, cd: 6, cast: { A: (s) => adult(s), B: (s, x, o) => adult(s) && s.id !== o.A.id && rel(o.A, s).fond >= 40 && rel(o.A, s).love === 0 && compatible(o.A, s) },
  run(x, { A, B }) {
    const r = rel(A, B);
    ask('A moment', `You find ${first(A)} and ${first(B)} on the roof, backs against the water tank, sharing something that is probably not enough for two.\n\n<i>${first(A)} looks at ${first(B)} the way you look at a window, when you cannot remember the last time you saw outside.</i>\n\n${speak(B, `Is it terrible that this is the best day I have had in a long time?`)}`, [
      { label: 'Nudge them closer', fn() { r.love = 1; bond(A, B, 10, -5, 'something started'); all(2); return `<i>Neither of them says anything. They do not move apart either.</i>`; } },
      { label: 'Leave them alone', fn() { r.love = 1; bond(A, B, 6, 0, 'something started'); return `<i>You go quietly down the stairs. Behind you, a laugh, then a silence of the right kind.</i>`; } },
      { label: 'Tease them', fn() { r.love = 1; bond(A, B, 4, 2); all(1); return speak(A, `You are the worst, Oga. The very worst.`); } }
    ], portrait(A));
  } });
S.add({ id: 'confide', kind: 'romance', w: 3, cd: 5, cast: { A: (s) => true, B: (s, x, o) => s.id !== o.A.id && rel(o.A, s).love === 1 },
  run(x, { A, B }) {
    const r = rel(A, B);
    ask('What they said to each other', `${first(A)} tells ${first(B)} something they have not told anyone: what keeps them awake. ${first(B)} does not fix it. ${first(B)} just holds the end of the sentence for them.\n\n${speak(B, `You do not have to be fine. Not with me.`)}`, [
      { label: 'Witness it, silently', fn() { r.love = 2; bond(A, B, 10, -5, 'told each other everything'); mood(A, 6); mood(B, 6); return `<i>They do not know you were there. That is how it should be.</i>`; } },
      { label: 'Give them the room', fn() { r.love = 2; bond(A, B, 8, -4); mood(A, 5); mood(B, 5); return `<i>You find something to do far away. You hope it takes a long time.</i>`; } }
    ], portrait(B));
  } });
S.add({ id: 'closeness', kind: 'romance', w: 2.5, cd: 7, cast: { A: (s) => true, B: (s, x, o) => s.id !== o.A.id && rel(o.A, s).love === 2 },
  run(x, { A, B }) {
    const r = rel(A, B);
    ask('Between the walls', `There is a corner of the shelter nobody goes to anymore. Tonight the blanket is hung across it.\n\n<i>Whatever happens there, happens quietly. In the morning, ${first(A)} is humming and ${first(B)} will not stop smiling at the floor.</i>`, [
      { label: 'Say nothing', fn() { r.love = 3; bond(A, B, 12, -8, 'together'); mood(A, 8); mood(B, 8); all(2); return `<i>It is the best secret in the shelter. Everybody keeps it.</i>`; } },
      { label: 'Tease them gently', fn() { r.love = 3; bond(A, B, 8, -4); mood(A, 5); mood(B, 5); all(3); return `<i>They both throw things at you. It is love, and it is loud.</i>`; } }
    ], portrait(A));
  } });
S.add({ id: 'jealous', kind: 'romance', w: 2, cd: 6, cast: { A: (s) => true, B: (s, x, o) => s.id !== o.A.id && rel(o.A, s).love >= 1, C: (s, x, o) => s.id !== o.A.id && s.id !== o.B.id && rel(o.A, s).fond > 30 },
  run(x, { A, B, C }) {
    ask('Something in the air', `${first(B)} has noticed how long ${first(A)} laughs at ${first(C)}'s jokes. ${first(B)} says nothing, which is a worse kind of noise.\n\n${speak(B, `Go on. Laugh. I am fine.`)}`, [
      { label: 'Talk to them quietly', fn() { bond(A, B, 4, -8); mood(B, 3); return `<i>It is a small thing. It takes an hour to say.</i>`; } },
      { label: 'Stay out of it', fn() { bond(A, B, -6, 10, 'jealousy'); mood(B, -5); return `<i>The silence in the shelter has weight now.</i>`; } },
      { label: `Send ${first(C)} on a watch shift`, fn() { bond(A, B, 1, -3); bond(A, C, -3, 0); return `<i>It buys a little peace. For a little while.</i>`; } }
    ], portrait(B));
  } });

/* =====================  GRIEF  ===================== */
S.add({ id: 'wake', kind: 'grief', w: 6, cd: 1, when: (x) => x.G.dead && x.G.dead.length && x.G.dead[x.G.dead.length - 1].day >= x.G.day - 1 && !mem('wake:' + x.G.dead[x.G.dead.length - 1].cid), cast: { A: (s, x) => { const d = x.G.dead[x.G.dead.length - 1]; return fond(s, { cid: d.cid }) >= -50; } }, score: { A: (s, x) => fond(s, { cid: x.G.dead[x.G.dead.length - 1].cid }) },
  run(x, { A }) {
    const d = x.G.dead[x.G.dead.length - 1]; setMem('wake:' + d.cid); const dc = S.cd({ cid: d.cid });
    const muslim = dc && dc.faith === 'muslim';
    ask(`Burying ${d.name}`, `${muslim ? 'There is no time to wait. The body is washed with what water can be spared, wrapped in the cleanest cloth, and carried out before the light is full.' : 'You wrap the body in a clean sheet. Someone brings a candle. Someone brings the Bible.'}\n\n${speak(A, `Somebody should say something. I... cannot.`)}`, [
      { label: 'Say a few words yourself', fn() { all(-2); A.trust = clamp((A.trust || 0) + 8, 0, 100); mood(A, 5); return `<i>It is not eloquent. It is enough. ${first(A)} puts a hand on your arm and leaves it there.</i>`; } },
      { label: `Let ${first(A)} lead the farewell`, fn() { all(-3); mood(A, 4); bond(A, A, 0, 0); return `${speak(A, `${d.name} was... ${d.name} was one of us. That is all I know how to say.`)}\n\n<i>It is more than enough.</i>`; } },
      { label: 'Bury quickly and move on', fn() { all(-7); A.trust = clamp((A.trust || 0) - 6, 0, 100); return `<i>There is a shovel and a hole. Nobody looks at anybody. Nobody forgets how fast it was.</i>`; } }
    ], portrait(A));
  } });
S.add({ id: 'keepsake', kind: 'grief', w: 3, cd: 3, when: (x) => x.G.dead && x.G.dead.length && x.G.day - x.G.dead[x.G.dead.length - 1].day >= 1 && x.G.day - x.G.dead[x.G.dead.length - 1].day <= 5 && !mem('keep:' + x.G.dead[x.G.dead.length - 1].cid), cast: { A: (s) => true },
  run(x, { A }) {
    const d = x.G.dead[x.G.dead.length - 1]; setMem('keep:' + d.cid);
    const item = { chidera: 'a small notebook full of names', tunde: 'a pair of taped glasses', bashir: 'a plastic bottle with a wire on it', amina: 'a folder in a plastic sleeve', emeka: 'a half-soldered radio', ngozi: 'a mirror with a crack in it', segun: 'a Bible with the corners worn soft', hauwa: 'a sharpened table leg and a folded note', obinna: 'a pair of shoes, laced tight', funke: 'a diary and a small pot', dan: 'a deck of cardboard cards', ada: 'a wooden spoon', bello: 'a polished boot', grace: 'a list on the back of an exam script' }[d.cid] || 'a small bag';
    ask(`What ${d.name} left`, `You find ${item}, tucked where ${d.name} slept. ${first(A)} stands beside you, not touching it.\n\n${speak(A, `We cannot just leave it, Oga. We cannot.`)}`, [
      { label: 'Read it', fn() { all(-3); A.trust = clamp((A.trust || 0) + 3, 0, 100); return `<i>It says more about them than you ever learned in life. You wish you had asked sooner.</i>`; } },
      { label: `Give it to ${first(A)}`, fn() { mood(A, 6); A.trust = clamp((A.trust || 0) + 6, 0, 100); return `<i>${first(A)} holds it against their chest, hard.</i>`; } },
      { label: 'Bury it with them', fn() { all(-2); return `<i>It goes into the earth, at the foot of the grave, where nobody will take it.</i>`; } },
      { label: 'Keep it for the group', fn() { all(2); H().add('cloth', 1); return `<i>Someone says it is not respectful. Someone says it is practical. Both are true.</i>`; } }
    ], portrait(A));
  } });
S.add({ id: 'ghost', kind: 'grief', w: 2, cd: 4, when: (x) => x.G.dead && x.G.dead.length && x.G.day - x.G.dead[x.G.dead.length - 1].day <= 10, cast: { A: (s) => (s.grief || 0) > 3 || s.hunger > 70 },
  run(x, { A }) {
    const d = x.G.dead[x.G.dead.length - 1];
    ask('At the foot of the stairs', `${first(A)} comes back from the night watch with a face like paper.\n\n${speak(A, `I saw ${d.name}. At the foot of the stairs. Standing. Just standing. I said their name and they turned and walked down into the dark.`)}\n\n<i>${first(A)} knows what hunger and grief do to eyes. Knowing does not help.</i>`, [
      { label: 'Sit with them until dawn', fn() { mood(A, 5); A.grief = Math.max(0, (A.grief || 0) - 3); A.trust = clamp((A.trust || 0) + 6, 0, 100); return `<i>Neither of you speaks. At first light the stairs are empty. They always were.</i>`; } },
      { label: 'Say it was only a trick of the dark', fn() { mood(A, -2); return `${speak(A, `Maybe. Yes. Maybe.`)}`; } },
      { label: 'Go and look yourself', fn() { H().mood(A, 2); all(-2); return `<i>There is nothing on the stairs. But a candle you did not light is burning on the third step.</i>`; } }
    ], portrait(A));
  } });

/* =====================  HORROR  ===================== */
S.add({ id: 'knock_3am', kind: 'horror', w: 2.2, tension: 6, cast: { A: (s) => s.mood > 20 },
  run(x, { A }) {
    ask('Knocking at three', `Three soft knocks on the barricade. Then nothing. Then three more.\n\n${speak(A, `Do not open it. Please do not open it.`)}\n\n<i>Whoever it is, they know how many of you are inside. They keep the rhythm perfect.</i>`, [
      { label: 'Ask who it is', fn() { const r = Math.random(); if (r < 0.34) { H().add('water', 2); return `<i>A thin voice, a woman's, begs for water. You pass two sachets through a gap. She whispers thank you in a language you do not know and is gone.</i>`; } if (r < 0.67) { H().stealSome(0.25); return `<i>A man's voice, friendly, very friendly. By the time you realise it is a distraction, the water store has been emptied from the other side.</i>`; } mood(A, -4); all(-2); return `<i>No answer. Only breathing, very close to the wood. Then slow footsteps, going down. Nobody sleeps again.</i>`; } },
      { label: 'Stay silent', fn() { all(-3); return `<i>It lasts eleven minutes. In the morning there is a handprint on the barricade, low, at the height of a child.</i>`; } },
      { label: 'Open the door a crack', fn() { if (chance(0.5)) { H().hurt(A, rnd(8, 20), 'Ambushed at the barricade.'); all(-3); return `<i>A hand around ${first(A)}'s collar. A blade. A struggle. They get free, but not unmarked.</i>`; } all(-1); return `<i>Nobody. Only a rat, and a sachet of water left on the step, as if as a present.</i>`; } }
    ], portrait(A));
  } });
S.add({ id: 'dragging', kind: 'horror', w: 1.6, tension: 5, cast: { A: (s) => cd(s) && cd(s).axes.brave > 0.55 },
  run(x, { A }) {
    ask('Something overhead', `A slow scrape across the ceiling. Stop. Scrape again. Weight, being dragged.\n\n${speak(A, `I am going up. Someone hold the stairs.`)}`, [
      { label: 'Go up with them', fn() { const r = Math.random(); if (r < 0.5) { H().add('cloth', 2); mood(A, -4); all(-3); return `<i>On the next floor, a body in a sheet. Not yours, not a stranger's. Somebody was moving a dead man and got scared. You take his blanket. You do not look at his face.</i>`; } mood(A, -2); return `<i>Nothing. A broken pipe, swinging in its bracket. Nobody laughs.</i>`; } },
      { label: 'Let them go alone', fn() { if (chance(0.5)) { H().hurt(A, rnd(6, 16), 'Hurt investigating a noise.'); } mood(A, -3); return `<i>${first(A)} returns, hand over their mouth. They will not say what they saw.</i>`; } },
      { label: 'Tell everyone to stay put', fn() { all(-2); return `<i>It stops after an hour. The hour feels like a week.</i>`; } }
    ], portrait(A));
  } });
S.add({ id: 'smell_road', kind: 'horror', w: 1.4, tension: 4,
  run(x) {
    ask('The smell', `The wind turns. For the first time in days it blows from the road. It brings something sweet and heavy, a smell you recognise in the body before the mind. Flies gather at the window.\n\n<i>Someone is already gagging. Nobody says what it is.</i>`, [
      { label: 'Seal the windows with cloth', fn() { H().add('cloth', -1); all(-1); return `<i>It helps. It does not help enough.</i>`; } },
      { label: 'Send someone to look', fn() { const s = pick(x.al); mood(s, -9); all(-2); return `<i>${first(s)} comes back and sits on the floor. They count to ninety under their breath before they speak: sixty-one. Some of them are students.</i>`; } },
      { label: 'Endure it', fn() { all(-4); return `<i>Hours. And then, with the shift of the wind, relief. But the smell lives in the cloth.</i>`; } }
    ]);
  } });
S.add({ id: 'voices_hunger', kind: 'horror', w: (x) => (x.hungry.length ? 3 : 0), when: (x) => x.hungry.length > 0, tension: 6, cast: { A: (s) => s.hunger > 78 || s.thirst > 85 },
  run(x, { A }) {
    ask('Mother\'s voice', `${first(A)} is standing at the window, speaking softly to nobody.\n\n${speak(A, `Yes, Mama. I am coming. I am coming. I will carry it.`)}\n\n<i>${first(A)} is reaching for the latch. The window faces a drop of three floors.</i>`, [
      { label: 'Hold them and speak calmly', fn() { mood(A, 3); A.trust = clamp((A.trust || 0) + 8, 0, 100); H().add('food', -1); A.hunger = Math.max(0, A.hunger - 30); return `<i>You feed them a spoon of whatever is left. It is the best medicine. They weep. They sleep.</i>`; } },
      { label: 'Slap them awake', fn() { mood(A, -6); A.trust = clamp((A.trust || 0) - 6, 0, 100); return `<i>${first(A)} comes back to their body, furious, ashamed, and grateful.</i>`; } },
      { label: 'Leave them. It will pass.', fn() { H().hurt(A, rnd(10, 25), 'Fell from a window in a delirium.'); all(-6); return `<i>It did not pass.</i>`; } }
    ], portrait(A));
  } });
S.add({ id: 'child_crying', kind: 'horror', w: 1.4, tension: 7, cast: { A: (s) => s.mood > 25 },
  run(x, { A }) {
    ask('Behind the wall', `At night, a sound through the wall of the next room. A child crying. Not loudly. Steady, the way you cry when you have been doing it for a long time.\n\n${speak(A, `We have to go. Please. We cannot just listen.`)}\n\n<i>The next room has been sealed since the first week.</i>`, [
      { label: 'Break through and look', fn() { if (chance(0.5)) { H().add('food', -1); all(2); return `<i>A boy of seven, filthy, hollow, eyes huge. He takes the food in both hands. He will not say where his people went. He is gone by morning, out through a window.</i>`; } all(-5); return `<i>A tape recorder, a cheap phone on loop. Someone wants you to come to the wall. You think about who.</i>`; } },
      { label: 'Call to the child through the wall', fn() { all(-1); return `<i>The crying stops. After a while, from far away, you hear it again. It is moving.</i>`; } },
      { label: 'Do nothing', fn() { all(-5); mood(A, -6); A.trust = clamp((A.trust || 0) - 6, 0, 100); return speak(A, `I will remember that we did nothing.`); } }
    ], portrait(A));
  } });
S.add({ id: 'fire_neighbour', kind: 'horror', w: 1.3, tension: 6, when: (x) => x.G.groups && x.G.groups.some((g) => g.alive),
  run(x) {
    ask('Fire in the next block', `Orange light on the walls. Smoke through the corridors. In the glow, you see people moving: carrying, running, falling.\n\n<i>Whatever started it, it is spreading toward the stairwell that joins your wing to theirs.</i>`, [
      { label: 'Send people to help', fn() { const hurtSome = x.al.filter(() => chance(0.4)); hurtSome.forEach((s) => H().hurt(s, rnd(5, 18), 'Burned in a fire.')); const g = pick(x.G.groups.filter((q) => q.alive)); if (g) { g.rel = (g.rel || 0) + 25; } all(2); return `<i>You carry buckets until your arms shake. Some of them live because of it. Nobody forgets who came.</i>`; } },
      { label: 'Wall off the stairwell', fn() { H().add('wood', -3); all(-3); return `<i>Every cry you hear is a decision. You do not sleep.</i>`; } },
      { label: 'Loot while they burn', fn() { H().add('food', 3); H().add('water', 2); all(-8); x.G.stats.thefts++; return `<i>It works. It works too well. You will never describe where the food came from.</i>`; } }
    ]);
  } });

C.StoryletsLoaded = true;
if (typeof module !== 'undefined') module.exports = {};
})(typeof window !== 'undefined' ? window : globalThis);
