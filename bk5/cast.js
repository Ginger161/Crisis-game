/* CRISIS — the cast
   Fourteen authored survivors. Four are drawn at random each run, so the dynamics are different every time.
   Authors write in plain English; voice.js turns it into each person's own way of speaking. The player is never told the voice.
   axes (0..1): warm, brave, funny, guard (how closed they are), pious, order (rule-follower)
   topics: things the player can talk about. They unlock with trust. layer: surface | secret | wound | dream
   beats: personal story moments, each fired when its conditions are met.  fx keys: t=trust m=mood all=moodAll hp flag inv{item:n} fond{id:n}
   ties: [otherId, how they know each other, starting fondness]  (only used if both are in the run) */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const list = [];
const add = (c) => list.push(c);

add({
  id: 'chidera', name: 'Chidera', sex: 'f', age: 20, arch: 'girl_nursing', ov: { skin: '#8d5a3b', hair: 'braids', hairc: '#14100d' }, role: 'Nursing, 200L', home: 'Enugu', faith: 'christian', trait: 'medic',
  voice: { base: 'mix', dialect: 'igbo', density: 0.5, faith: 'christian' }, axes: { warm: 0.9, brave: 0.4, funny: 0.4, guard: 0.3, pious: 0.8, order: 0.7 },
  bio: `Second-year nursing student from Enugu. Hums hymns while she works. Keeps a small notebook and will not say what is in it.`, wants: `to become the nurse her father never had`, fears: `a patient she cannot save`,
  acts: ['writing in her notebook', 'humming a hymn', 'folding bandages', 'praying the rosary'],
  ties: [['segun', 'fellowship friends', 25], ['funke', 'church choir', 20]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Where she is from', lines: [`I am from Enugu. Coal city, you know?`, `My mother sells provisions near the market. Every Saturday I help her count the day's money before I come back to school.`, `I miss the smell of the place. Hot oil, wet dust, people shouting prices.`], learn: `From Enugu. Her mother sells provisions at the market.` },
    { id: 'father', layer: 'wound', trust: 25, title: 'Her father', lines: [`My father died when I was fifteen. An ulcer. We did not have money for the operation, so we waited for the money, and the money did not come.`, `That is why I am here. If a person is sick and nobody comes, I do not want it to be because nobody was trained.`], learn: `Her father died of an untreated ulcer when she was fifteen.`, flag: 'chi_father' },
    { id: 'failed', layer: 'secret', trust: 45, title: 'What she is hiding', lines: [`I failed Anatomy last semester. I told my mother I passed.`, `Every time somebody here gets sick I think: this is the exam. This is the one I cannot lie about.`, `Please do not tell anyone. I could not bear it if they looked at me differently.`], learn: `She failed Anatomy and lied to her mother about it.`, flag: 'chi_failed' },
    { id: 'clinic', layer: 'dream', trust: 65, title: 'What she wants', lines: [`A clinic in my village. Two beds, a drip stand, a nurse who answers the door at night.`, `Do you think a place like that could still exist, after all this?`], learn: `She dreams of a two-bed clinic in her village.`, flag: 'chi_dream' }
  ],
  beats: [
    { id: 'chi_book', day: 3, trust: 20, title: 'The notebook', lines: [`~You find Chidera crouched in a corner, writing by the light of a candle stub. She snaps the notebook shut when you come close.`, `"It is nothing, Oga. Only names."`, `~She writes down every person she treats. Date, wound, what she did. A ledger of small mercies.`],
      choices: [{ label: 'Ask her to read you a page', fx: { t: 8, m: 4, flag: 'chi_ledger' }, reply: `You want to hear it? Okay. "Day three. Tunde. Cut on the hand. Cleaned with boiled water. He did not cry. He pretended it was a pen." I wrote that one twice because it made me smile.` }, { label: 'Tell her paper is precious', fx: { t: -8, m: -3 }, reply: `Yes, Oga. I understand.` }, { label: 'Add a name to the page yourself', fx: { t: 12, flag: 'chi_ledger' }, reply: `Hm. Okay. I will write it. Thank you.` }] },
    { id: 'chi_surgery', day: 10, trust: 45, need: (x) => x.anyHurt, title: 'The razor and the thread', lines: [`~Someone is bleeding and the wound is deeper than a bandage can hold. Chidera has washed her hands three times. They are still shaking.`, `"I have only seen it done. I have never done it. Oga, I cannot do it alone. Please. Stay."`],
      choices: [{ label: 'Hold the light and stay beside her', fx: { t: 15, m: 6, flag: 'chi_surgery_ok', heal: 25 }, reply: `Do not look away. Please. Hold it there. If my hands shake, tell me. I am doing this.` }, { label: 'Tell her to find someone else', fx: { t: -15, m: -8, hp: -12 }, reply: `There is nobody else. That is the whole point.` }] }
  ],
  barks: { idle: [`I am counting the bandages again.`, `Does anyone want tea? Warm water, I mean.`, `Wash your hands. Please. All of you.`], hungry: [`My head is light. It is only hunger.`, `I keep dreaming of akara.`], scared: [`Lord, be near us.`, `Please do not go out alone tonight.`], happy: [`Look. A clean sheet. We are rich.`, `I laughed today. I did not know I still could.`], grief: [`I will write the name down tonight.`, `He was not alone. Remember that.`], night: [`I keep listening for breathing.`, `The hymn is the only thing that quiets it.`] }
});

add({
  id: 'tunde', name: 'Tunde', sex: 'm', age: 22, arch: 'boy_law', ov: { skin: '#6b4429', hair: 'fade', hairc: '#0f0b08', glasses: '#17120e' }, role: 'Law, 300L', home: 'Ibadan', faith: 'christian', trait: 'hustler',
  voice: { base: 'en', dialect: 'yoruba', density: 0.35, faith: 'christian' }, axes: { warm: 0.6, brave: 0.6, funny: 0.6, guard: 0.5, pious: 0.4, order: 0.9 },
  bio: `Third-year law student who argues with everyone and enjoys it. Believes in rules because he has seen what happens without them.`, wants: `to become a human rights lawyer`, fears: `turning into his father`,
  acts: ['reading a ruined law textbook', 'rehearsing an argument aloud', 'sorting the supplies by priority', 'mending his glasses with tape'],
  ties: [['ngozi', 'same lecture hall, always disagreeing', 5], ['hauwa', 'debate society rivals', 15]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Ibadan. Mapo Hall, the old roofs, the noise.`, `My mother taught primary school. Forty children in a room, and she knew each name. I think that is where I got my argument.`], learn: `From Ibadan. His mother taught primary school.` },
    { id: 'law', layer: 'surface', trust: 15, title: 'Why law', lines: [`Because the loudest person should not always win.`, `People think law is about rules. It is about who gets protected when the rules are inconvenient.`, `Right now we are inventing a small country in this hostel, Oga. We should do it properly.`], learn: `He wants fair rules, even here.` },
    { id: 'father', layer: 'secret', trust: 40, title: 'His father', lines: [`My father was a customs officer. We had a big house, a generator, a car with a driver. Nobody ever asked how.`, `My school fees were paid with bribes. Every naira of my education is dirty. That is the thing I cannot argue my way out of.`], learn: `His fees were paid with his father's bribes.`, flag: 'tun_father' },
    { id: 'mother', layer: 'wound', trust: 60, title: 'His mother', lines: [`She left when I was sixteen. She would not eat in that house anymore.`, `I did not understand. I hated her for months. Now I think she was the only honest person in the family.`, `If we get out of here, I want to find her.`], learn: `His mother left over his father's corruption. He wants to find her.`, flag: 'tun_mother' }
  ],
  beats: [
    { id: 'tun_rules', day: 4, trust: 15, title: 'A fair share', lines: [`~Tunde has written a list on the wall in charcoal: WHO EATS, WHEN, AND HOW MUCH.`, `"If we do not decide this together, we will decide it badly one night, when someone is hungry enough. I propose a ration, equal for all, no exceptions. Oga, what do you say?"`],
      choices: [{ label: 'Adopt his rations', fx: { t: 10, m: 3, flag: 'fair_rations' }, reply: `Good. Then the rule protects us from ourselves.` }, { label: 'Say the strong eat more', fx: { t: -12, m: -4, flag: 'strong_eat' }, reply: `Then you are making a very small kingdom, Oga. I hope it is a kind one.` }, { label: 'Tell him to run it himself', fx: { t: 6, flag: 'tun_judge' }, reply: `You are handing me power. I will try to deserve it.` }] },
    { id: 'tun_bribe', day: 11, trust: 40, need: (x) => x.pol, title: 'The offer', lines: [`~A messenger from another faction pulls Tunde aside. You see money, real naira, folded small. Tunde does not take it. He walks back, pale.`, `"They want me to sign a paper saying their blockade of the water is legal. A lawyer's signature, Oga. They are offering me food for three days."`],
      choices: [{ label: 'Take it. We are hungry.', fx: { t: -10, m: -6, flag: 'tun_sold', inv: { food: 3 } }, reply: `Then I am my father's son after all. I will sign. I will not forget it.` }, { label: 'Refuse. Principle matters.', fx: { t: 12, m: 4, flag: 'tun_held' }, reply: `Thank you. I needed someone to say it so I did not have to be the only one.` }] }
  ],
  barks: { idle: [`I am drafting. Do not read over my shoulder.`, `Everything here has a rule if you look for it.`, `I would object, but there is no judge.`], hungry: [`Hunger makes bad lawyers. And worse brothers.`, `A fair share. That is all I ask.`], scared: [`Stay behind the barricade. Please. Be sensible.`, `If I die, someone must tell my mother.`], happy: [`Order, Oga. Even here, it pays.`, `I won an argument! Nobody noticed. It still counts.`], grief: [`He deserved a trial, a witness, a record. We were not given any.`, `We must remember the name. That is the least.`], night: [`I cannot sleep. The silence has a verdict in it.`, `Who guards the guards? I wonder at night.`] }
});

add({
  id: 'bashir', name: 'Bashir', sex: 'm', age: 23, arch: 'boy_hoodie', ov: { skin: '#8d5a3b', hair: 'twists', hairc: '#0f0b08', head: null }, role: 'Mass Comm, 300L', home: 'Kaduna', faith: 'muslim', trait: 'runner',
  voice: { base: 'pg', dialect: 'hausa', density: 0.55, faith: 'muslim' }, axes: { warm: 0.75, brave: 0.5, funny: 0.95, guard: 0.7, pious: 0.6, order: 0.3 },
  bio: `Mass Comm student who narrates everything like a radio presenter. The jokes get louder when he is afraid.`, wants: `to host the morning show`, fears: `silence`,
  acts: ['doing a mock broadcast to nobody', 'tapping out a beat on a bucket', 'telling a story with too many voices', 'staring at the wall'],
  ties: [['emeka', 'roommates', 35], ['amina', 'neighbours from Kaduna', 15]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Kaduna! Home of the best suya, you can quote me.`, `My mother sells groundnuts and gossip. Mostly gossip. If there was a radio in the market, she would have been the star.`], learn: `From Kaduna. His mother sells groundnuts.` },
    { id: 'radio', layer: 'surface', trust: 15, title: 'The radio dream', lines: [`When I was small, I put my ear on our radio until the speaker was warm.`, `One day a man read the news and my whole street went silent to listen. I thought: that is power. A voice that makes a street stop.`], learn: `He wants a voice that makes a street go quiet.` },
    { id: 'brother', layer: 'wound', trust: 45, title: 'His brother', lines: [`My elder brother, Sani. Two years ago bandits came to his village near Birnin Gwari. He did not come back.`, `They gave us the body, a few days after. I did not go to see it. I stayed outside and told jokes to the neighbours.`, `That is why I talk so much, Oga. When I stop talking I can hear that day.`], learn: `His brother was killed by bandits. He jokes so he does not hear it.`, flag: 'bas_brother' },
    { id: 'mother', layer: 'secret', trust: 60, title: 'The money', lines: [`My mother is sick. Kidney. I told everyone I take loans for school. I take them for her dialysis.`, `If I do not get home in time... I do not finish that thought. I joke instead. Tell me a joke. Please.`], learn: `His mother needs dialysis and he borrows to pay for it.`, flag: 'bas_mother' }
  ],
  beats: [
    { id: 'bas_show', day: 4, trust: 15, title: 'The broadcast', lines: [`~Bashir has taken a metal bowl, tied a spoon to it, and is crouched in the corridor whispering into it.`, `"Good evening, citizens of Hostel B. This is your correspondent, live from the end of the world. Tonight's weather: dark. Tomorrow's weather: also dark. And now, sports."`, `~Somebody laughs. Then another. It is the first laughter in days.`],
      choices: [{ label: 'Laugh and ask for more', fx: { t: 10, m: 4, all: 3, flag: 'bas_show' }, reply: `The people demand more! Ladies and gentlemen, I give you: the shortage of garri.` }, { label: 'Tell him to keep quiet', fx: { t: -8, m: -3 }, reply: `Okay, okay. The show is cancelled. Technical issues.` }, { label: 'Ask him to do it every night', fx: { t: 12, all: 3, flag: 'bas_nightly' }, reply: `Every night? Oga. I will not let you down. I never knew I wanted a boss.` }] },
    { id: 'bas_silence', day: 12, trust: 40, need: (x) => x.grief || x.dayGE(12), title: 'When the jokes stop', lines: [`~Bashir sits against the wall, hands over his ears. He is not speaking. He has not spoken since the shooting.`, `"I cannot hear any more. The jokes are not there. Oga, there is nothing in my head but the road."`],
      choices: [{ label: 'Sit with him, say nothing', fx: { t: 15, m: 8, flag: 'bas_held' }, reply: `Thank you. It is... quiet. But the good kind.` }, { label: 'Tell him to be strong', fx: { t: -10, m: -8 }, reply: `Strong. Yes. Of course.` }, { label: 'Tell him a joke of your own', fx: { t: 10, m: 6 }, reply: `That was bad. Oga, that was really bad. Tell another.` }] }
  ],
  barks: { idle: [`Tonight on the news: nothing, nothing and nothing.`, `If I had a microphone I would be dangerous.`, `Abeg, who has seen my shoe? The left one. The brave one.`], hungry: [`My stomach is doing a freestyle.`, `I would sell my voice for a plate of tuwo.`], scared: [`Oga, I am not afraid. I am only vibrating.`, `That sound. Is it just me? Say it is just me.`], happy: [`Tell my mother I was hilarious.`, `We are alive. In my business that is a headline.`], grief: [`No jokes now. Not for him.`, `I will not make light of this. Not this one.`], night: [`I can still hear the road.`, `Say something. Anything. The dark is too quiet.`] }
});

add({
  id: 'amina', name: 'Amina', sex: 'f', age: 21, arch: 'girl_hijab', ov: { skin: '#a8714a', head: 'hijab', headc: '#2f6f55' }, role: 'Pharmacy, 300L', home: 'Kano', faith: 'muslim', trait: 'sleeper',
  voice: { base: 'en', dialect: 'hausa', density: 0.3, faith: 'muslim' }, axes: { warm: 0.5, brave: 0.65, funny: 0.2, guard: 0.75, pious: 0.85, order: 0.95 },
  bio: `Pharmacy student who reads every label twice. Prays on time, even now. She watches the door while others sleep.`, wants: `to fix the drug supply in her country`, fears: `making a mistake that kills someone`,
  acts: ['reading medicine labels', 'praying on a folded sheet', 'counting tablets', 'sitting upright, watching the door'],
  ties: [['hauwa', 'northern sisters in a southern school', 35], ['bashir', 'neighbours from the north', 15]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Kano. My father trades in cloth at Kantin Kwari market. Three generations.`, `I am the first girl in the family to leave for a university. There was an argument. My grandmother won it for me.`], learn: `From Kano. Her father trades in cloth.` },
    { id: 'drugs', layer: 'wound', trust: 25, title: 'Why pharmacy', lines: [`My cousin, Zainab. She had malaria. The tablets from the roadside chemist were fake. Chalk and colour.`, `I was twelve. I held her hand while it happened. That is why I read every label twice, Commander.`], learn: `Her cousin died from counterfeit malaria tablets.`, flag: 'ami_cousin' },
    { id: 'engaged', layer: 'secret', trust: 50, title: 'The engagement', lines: [`I am engaged. He is a good man, my family says. I have met him twice.`, `I did not say no. I did not say yes. I came back here. Now, if I live, I will have to decide whether I am brave enough to disappoint everyone.`], learn: `She is engaged to a man she has met twice.`, flag: 'ami_engaged' },
    { id: 'dream', layer: 'dream', trust: 65, title: 'Her dream', lines: [`There is a scholarship in Edinburgh. Pharmaceutical science. I have the application folder. It is in my bag, wrapped in plastic.`, `If we get out of here, I will post it myself.`], learn: `She has a scholarship application ready for Edinburgh.`, flag: 'ami_dream' }
  ],
  beats: [
    { id: 'ami_count', day: 3, trust: 15, title: 'The count', lines: [`~Amina has laid the medicine out on a cloth: every strip, every ampoule, in rows.`, `"We have eleven doses of paracetamol, four of antibiotics, one of something I cannot read. If I decide who gets what, I will make enemies. If I do not, someone will die of fairness. I need you to give me authority."`],
      choices: [{ label: 'Give her full control of the medicine', fx: { t: 12, flag: 'ami_keeper' }, reply: `Thank you. I will be fair. Nobody will like it.` }, { label: 'Keep it yourself', fx: { t: -6, flag: 'cmd_meds' }, reply: `As you wish. Please do not guess.` }, { label: 'Ask her to teach you', fx: { t: 14, m: 3, flag: 'ami_taught' }, reply: `Yes. Come. I will show you. First, how to read the date.` }] },
    { id: 'ami_prayer', day: 9, trust: 35, title: 'Time to pray', lines: [`~Nightfall. Amina lays her prayer sheet in the narrow space by the window. A gunshot cracks in the distance. She does not look up.`, `"It is time. I will not move. If you want to stand guard, I would be grateful."`],
      choices: [{ label: 'Stand guard while she prays', fx: { t: 14, m: 4, flag: 'ami_guarded' }, reply: `Thank you. Many people watch me pray. Few watch the door for me.` }, { label: 'Tell her to pray quietly', fx: { t: -6 }, reply: `I am being quiet. This is the quiet.` }] }
  ],
  barks: { idle: [`Please keep the lids closed.`, `I have checked again. We have enough, if we are careful.`, `Mind the date on that.`], hungry: [`I have fasted before. This is different.`, `We will manage. We must.`], scared: [`I do not like how quiet it is.`, `Stay low. Stay with the wall.`], happy: [`Alhamdulillah. A little water, a little rest.`, `Today was good. Remember it.`], grief: [`May Allah forgive him. May Allah forgive us.`, `We will bury him properly.`], night: [`I keep the first watch. I sleep little.`, `Someone has to count the breathing.`] }
});

add({
  id: 'emeka', name: 'Emeka', sex: 'm', age: 24, arch: 'boy_nerd', ov: { skin: '#a8714a', hair: 'short', glasses: '#17120e' }, role: 'Computer Science, 400L', home: 'Onitsha', faith: 'christian', trait: 'fragile',
  voice: { base: 'mix', dialect: 'igbo', density: 0.35, faith: 'christian' }, axes: { warm: 0.55, brave: 0.3, funny: 0.45, guard: 0.6, pious: 0.4, order: 0.6 },
  bio: `Fourth-year computer science student who fixes things and apologises while doing it. Cannot stand being useless.`, wants: `to leave Nigeria`, fears: `being ordinary and stuck`,
  acts: ['soldering a wire with a heated nail', 'taking a radio apart', 'drawing circuits in the dust', 'staring at a dead laptop'],
  ties: [['bashir', 'roommates', 35], ['ngozi', 'she once bought his hacked software', 5]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Onitsha. Main Market. My uncle sells car spare parts. I grew up in a place where everything gets repaired, nothing gets replaced.`, `That is why I am good with my hands. In my family, to throw something away is a kind of sin.`], learn: `From Onitsha. His family repairs everything.` },
    { id: 'japa', layer: 'dream', trust: 25, title: 'Leaving', lines: [`I want to leave. Canada, Germany, anywhere with power that stays on.`, `People call it japa like it is a joke. For me it is arithmetic. I have worked it out: this country will not use what I can do.`], learn: `He wants to leave Nigeria. He calls it arithmetic.`, flag: 'emk_japa' },
    { id: 'scam', layer: 'secret', trust: 50, title: 'The side work', lines: [`My school fees were paid by a thing I am ashamed of. I wrote scripts for a group. Fake investment pages. People lost money.`, `I told myself the victims were rich. I met one. A retired teacher. She cried on the phone. I stopped. I still have the money.`], learn: `He wrote scam scripts to pay school fees. He stopped, but still has the money.`, flag: 'emk_scam' },
    { id: 'sister', layer: 'wound', trust: 60, title: 'His sister', lines: [`My sister Ada. Last year, travelling to Port Harcourt, her bus never arrived. We know nothing.`, `I built a tracker, an app, a hundred things. Nothing helped. That is why I cannot stop fixing. If I stop, I have to know it was not enough.`], learn: `His sister vanished on a bus last year. Fixing things keeps him from that.`, flag: 'emk_sister' }
  ],
  beats: [
    { id: 'emk_radio', day: 5, trust: 20, need: (x) => !x.hasRadio, title: 'A small miracle', lines: [`~Emeka has gutted a torch, a dead charger and something from the roof. He wipes his hands.`, `"I think I can make it listen. A radio. Real radio. I need parts, Oga. And I need you to trust me."`],
      choices: [{ label: 'Give him what he needs', fx: { t: 12, m: 4, flag: 'emk_radio_build', inv: { parts: -3 } }, reply: `Okay. Okay. It might not work. It will. Do not watch me, I get nervous.` }, { label: 'We cannot afford the parts', fx: { t: -8, m: -4 }, reply: `I understand. It was only an idea.` }] },
    { id: 'emk_refund', day: 13, trust: 40, need: (x) => x.flag('emk_scam'), title: 'The money in his bag', lines: [`~Emeka puts a roll of cash in front of you. Old, dirty naira, tied with a rubber band.`, `"It is useless here, I know. But it is not mine. Can you do something with it? Buy something, trade it, feed someone? I want it to do some good."`],
      choices: [{ label: 'Use it to trade with the others', fx: { t: 12, m: 5, flag: 'emk_atoned', inv: { food: 2, water: 2 } }, reply: `Thank you. It is the first time it has felt clean.` }, { label: 'Keep it for the group', fx: { t: 5, inv: { food: 1 } }, reply: `Yes, fine. Whatever helps.` }] }
  ],
  barks: { idle: [`I can fix that. Probably.`, `Do not touch the red wire. It is not what it looks like.`, `Everything is a circuit if you squint.`], hungry: [`My hands are shaking and I cannot solder.`, `I keep counting kilobytes of food.`], scared: [`Please tell me you have a plan.`, `I am not good at this part.`], happy: [`It works! It actually works!`, `We have a signal. A little one, but real.`], grief: [`I could have fixed it. If I had known.`, `I keep trying to repair what cannot be repaired.`], night: [`I dream in code. Tonight it will not compile.`, `Do you hear that? Probably the generator.`] }
});

add({
  id: 'ngozi', name: 'Ngozi', sex: 'f', age: 19, arch: 'girl_fashion', ov: { skin: '#c68a5c', hair: 'weave', hairc: '#14100d' }, role: 'Business Admin, 100L', home: 'Lagos', faith: 'christian', trait: 'hustler',
  voice: { base: 'pg', dialect: 'igbo', density: 0.45, faith: 'christian' }, axes: { warm: 0.55, brave: 0.7, funny: 0.8, guard: 0.7, pious: 0.5, order: 0.3 },
  bio: `First-year student who sells things. Hair, data, snacks, secrets. Her laughter is a performance and she knows it.`, wants: `her own fashion brand`, fears: `being poor again`,
  acts: ['re-braiding her own hair', 'counting an imaginary profit', 'applying lip gloss in a cracked mirror', 'sorting cloth by colour'],
  ties: [['tunde', 'argue in the same lecture hall', 5], ['obinna', 'neighbours in Lagos', 20]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Lagos. Surulere. Do not ask me which street. It is the kind of place where your mother knows what you ate yesterday.`, `I sold shoes on the pavement at fourteen. Did you ever sell anything at fourteen? Then do not talk.`], learn: `From Surulere, Lagos. She sold shoes on the pavement at fourteen.` },
    { id: 'hustle', layer: 'surface', trust: 15, title: 'The business', lines: [`Every girl in my hostel buys her hair from me. Weave, wigs, braids, everything. I have a shop in my wardrobe.`, `You think that is small? Wait till you see my ledger. That is how I will pay my fees, Oga. My own money. No man.`], learn: `She runs a hair business out of her wardrobe.` },
    { id: 'mother', layer: 'wound', trust: 40, title: 'Her mother', lines: [`My mother had a shop. Fabric. She borrowed, then borrowed again. When the loan people came, they took the stock and the keys.`, `I stood outside and watched. I was ten. I decided I would never owe anybody. Never. That is why I smile first.`], learn: `Loan collectors took her mother's shop when she was ten.`, flag: 'ngo_mother' },
    { id: 'afraid', layer: 'secret', trust: 60, title: 'What she is afraid of', lines: [`I am afraid all the time. I do not look like it, do I? That is the job.`, `If I am quiet, I think about her. The shop. If I am loud, I do not. So I am loud, Oga. Please do not fix it.`], learn: `She is loud so she does not have to think about the shop.`, flag: 'ngo_afraid' }
  ],
  beats: [
    { id: 'ngo_price', day: 4, trust: 15, title: 'Everything has a price', lines: [`~Ngozi is sitting on a stack of cloth like a market queen. Two boys are haggling with her over a candle.`, `"Three stones of garri for this one, my brother. It is the last candle in this block. Light has a price. It always did."`],
      choices: [{ label: 'Tell her to share it', fx: { t: -4, m: 2 }, reply: `Share! My own candle? Okay, okay. Take it. But it is a loan.` }, { label: 'Ask for a cut', fx: { t: 8, flag: 'ngo_cut', inv: { food: 1 } }, reply: `A cut! Now you are speaking my language. Ten percent.` }, { label: 'Admire the hustle', fx: { t: 10, m: 4 }, reply: `Thank you! Finally, somebody who sees me.` }] },
    { id: 'ngo_market', day: 9, trust: 35, need: (x) => x.pol, title: 'Market day', lines: [`~Word comes that there will be a market in the New Cafeteria. Ngozi's eyes light up.`, `"Oga. If you give me stock and a day, I can double it. I know how to talk to traders. Let me go."`],
      choices: [{ label: 'Send her with a bag of goods', fx: { t: 12, flag: 'ngo_market', inv: { cloth: -1 } }, reply: `I will not fail. Watch me.` }, { label: 'Too dangerous', fx: { t: -6 }, reply: `Fine. But you are wasting a talent.` }] }
  ],
  barks: { idle: [`If this was Lagos I would have sold it by now.`, `Nothing is free. Not even this air.`, `Do not look at me. I am working.`], hungry: [`My stomach is crying.`, `I would marry a man for suya right now.`], scared: [`Do not leave me alone. I am joking. I am not joking.`, `My heart is beating like a generator.`], happy: [`See? I told you I would find something.`, `Profit! Small, small, but profit.`], grief: [`Please, do not make me laugh.`, `I do not even have a joke for this.`], night: [`I keep adding numbers to sleep.`, `Please talk to me. Quietly.`] }
});

add({
  id: 'segun', name: 'Segun', sex: 'm', age: 25, arch: 'boy_fellowship', ov: { skin: '#6b4429', hair: 'short', hairc: '#0f0b08' }, role: 'Microbiology, 400L', home: 'Abeokuta', faith: 'christian', trait: 'devout',
  voice: { base: 'en', dialect: 'yoruba', density: 0.5, faith: 'christian' }, axes: { warm: 0.7, brave: 0.5, funny: 0.4, guard: 0.5, pious: 0.95, order: 0.7 },
  bio: `Fellowship leader who prays aloud and sings off-key. People lean on him. He has not told anyone he is empty.`, wants: `to believe again`, fears: `being exposed as a fraud`,
  acts: ['reading a worn Bible', 'praying under his breath', 'leading a hymn nobody asked for', 'looking at the ceiling'],
  ties: [['chidera', 'fellowship friends', 25], ['funke', 'same church', 25]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Abeokuta. Olumo Rock, the old houses. My father is a pastor of a small church with a leaking roof.`, `I grew up on the front pew. Everything I know about God I learned from a man who also taught me about patience, mostly by lacking it.`], learn: `From Abeokuta. His father is a pastor.` },
    { id: 'faith', layer: 'surface', trust: 20, title: 'His faith', lines: [`People ask me how I stay so sure. I say, one verse at a time. It sounds good. They nod.`, `I keep waiting for it to feel like it used to.`], learn: `He keeps waiting for faith to feel like it used to.`, flag: 'seg_doubt_hint' },
    { id: 'friend', layer: 'wound', trust: 45, title: 'Dapo', lines: [`My friend Dapo. We prayed together every morning for six years. Two years ago, a trailer on the Lagos-Ibadan road. They did not even cover him.`, `I prayed for hours. Nothing answered. Nothing. I have prayed every day since, and each morning it is like speaking into a well.`], learn: `His best friend Dapo died on the road. He has felt nothing when he prays since.`, flag: 'seg_dapo' },
    { id: 'fraud', layer: 'secret', trust: 65, title: 'The confession', lines: [`I do not believe any more, Oga. I do the words. I lead the songs. I hold their hands.`, `The worst part is that it helps them. It helps them more than it ever helped me. Is that a lie, or is it love?`], learn: `He has lost his faith but keeps leading prayers because it helps others.`, flag: 'seg_fraud' }
  ],
  beats: [
    { id: 'seg_lead', day: 3, trust: 15, title: 'Evening prayer', lines: [`~Segun gathers whoever will come. His voice cracks on the second line of the hymn. Nobody laughs.`, `"Would you like to say something, Oga? A word before we sleep? It does not have to be holy."`],
      choices: [{ label: 'Say a few honest words', fx: { t: 10, m: 4, all: 2, flag: 'seg_spoke' }, reply: `That was better than most sermons I have heard. Thank you.` }, { label: 'Decline politely', fx: { t: 0 }, reply: `Of course. Another night.` }, { label: 'Mock the prayer', fx: { t: -14, m: -6 }, reply: `I see. Perhaps you need it more than you know.` }] },
    { id: 'seg_crisis', day: 12, trust: 45, need: (x) => x.grief, title: 'Where is God', lines: [`~After the funeral, Segun stands apart. His hands are shaking. He tears a page from the Bible and holds it up.`, `"I told them He was here. I said it with my whole voice. Where is He, Oga? Tell me. You are the one who decides everything. Tell me where He is."`],
      choices: [{ label: `"Here. In you. In how you carried them."`, fx: { t: 14, m: 8, flag: 'seg_renewed' }, reply: `...I did not expect to hear that from you. Thank you.` }, { label: `"I do not know."`, fx: { t: 8, m: 2, flag: 'seg_honest' }, reply: `That is the most honest thing anyone has said all week. It helps.` }, { label: `"Nowhere. It is just us."`, fx: { t: -10, m: -12, flag: 'seg_broken' }, reply: `Then I have been preaching to an empty room.` }] }
  ],
  barks: { idle: [`Let us thank God for what we have. And for one another.`, `Psalm twenty-three. I know it by heart. It helps.`, `Be gentle with each other. That is the whole law.`], hungry: [`The body complains; the spirit endures. Mostly.`, `I have fasted before. This is not holy.`], scared: [`Lord, give us strength. Please.`, `Do not be afraid. I say it for myself as well.`], happy: [`Look at that. Light through the window. Grace, Oga.`, `We laughed tonight. That is a prayer too.`], grief: [`I will say the words. Somebody must.`, `He is with God. I have to believe that. I have to.`], night: [`I keep the vigil. I do not know for whom.`, `The dark is only the dark. I tell it that.`] }
});

add({
  id: 'hauwa', name: 'Hauwa', sex: 'f', age: 22, arch: 'girl_natural', ov: { skin: '#4a2e1c', hair: 'afro', hairc: '#0f0b08' }, role: 'Political Science, 300L', home: 'Maiduguri', faith: 'muslim', trait: 'hardened',
  voice: { base: 'pg', dialect: 'hausa', density: 0.5, faith: 'muslim' }, axes: { warm: 0.45, brave: 0.95, funny: 0.5, guard: 0.85, pious: 0.7, order: 0.5 },
  bio: `From Borno. She has been afraid before and learned its shape. She is the calmest person in the room when it is worst.`, wants: `to govern, one day, and mean it`, fears: `being helpless again`,
  acts: ['sharpening a stick', 'checking the exits', 'teaching someone to be quiet', 'sitting with her back to the wall'],
  ties: [['amina', 'northern sisters', 35], ['tunde', 'debate rivals', 15]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Maiduguri. You know what is said about it, so I will not say it.`, `It was a city. Markets, football, weddings. Then a lot of things stopped. Not all at once. One road at a time.`], learn: `From Maiduguri.` },
    { id: 'skills', layer: 'surface', trust: 20, title: 'What she knows', lines: [`Do not run in the open. Move in the dark, in the gutter. Eat before you are hungry. Never tell a stranger your name.`, `I am not teaching you to be afraid, Oga. I am teaching you to be useful when you are.`], learn: `She knows how to survive. Never tell a stranger your name.` },
    { id: 'eleven', layer: 'wound', trust: 55, title: 'Eleven days', lines: [`I was twelve when they took me, with eight other girls. I was gone eleven days. Then they let me go. I will not tell you why.`, `I came home and my mother held my face and did not ask. That silence is the kindest thing anyone has ever given me.`, `So when you see me calm, Oga, know that I am not brave. I have just already survived the worst of it.`], learn: `She was taken at twelve for eleven days and returned. She is calm because the worst already happened.`, flag: 'hau_eleven' },
    { id: 'office', layer: 'dream', trust: 65, title: 'What she wants', lines: [`I want an office with a window and a stack of papers that matter.`, `I want to sit across from the men who give orders and make them look at me. Just look. That is all I want from them.`], learn: `She wants to hold office and make powerful men look at her.`, flag: 'hau_dream' }
  ],
  beats: [
    { id: 'hau_watch', day: 3, trust: 15, title: 'The night watch', lines: [`~Hauwa has not slept. She is sitting with her back to the wall, a sharpened table leg across her knees.`, `"Someone will come tonight. I have been listening to the stairs for an hour. We need two people awake and one on the roof. If you do not make the plan, Oga, I will."`],
      choices: [{ label: 'Let her organise the watch', fx: { t: 12, m: 3, flag: 'hau_watch' }, reply: `Good. I will make sure nobody dies stupid.` }, { label: 'Tell her you will decide', fx: { t: 4, flag: 'hau_defer' }, reply: `Then decide quickly. The night is not waiting.` }] },
    { id: 'hau_judgment', day: 11, trust: 40, need: (x) => x.pol, title: 'The prisoner', lines: [`~Someone has been caught stealing from the water store. A boy, thin as a rope. Hauwa holds him by the collar.`, `"What do we do with him, Oga? We can beat him. We can put him out. Or we can feed him, and warn the others. I know what I would do. I want to know what you are."`],
      choices: [{ label: 'Feed him and give him a duty', fx: { t: 10, m: 4, flag: 'hau_mercy' }, reply: `...Good. I did not know whether you would.` }, { label: 'Put him out in the dark', fx: { t: -6, m: -8, flag: 'hau_cruel' }, reply: `Then you will have to carry that. I will help you carry it, because I understand why.` }, { label: 'Let Tunde judge', fx: { t: 4, flag: 'hau_court' }, reply: `A trial. In this? Fine. Let us see if it still works.` }] }
  ],
  barks: { idle: [`Keep your voice down. Voices carry.`, `I was told once that silence is a skill.`, `Know the exits. Always know the exits.`], hungry: [`I have been hungrier. Do not worry about me.`, `Eat slowly. It stays longer.`], scared: [`Do not run. Walk. Low. Follow me.`, `Breathe. Count. We have time.`], happy: [`Look. A small moment. Take it.`, `We are still here. That is a victory.`], grief: [`I have buried before. It does not get easier. It gets familiar.`, `Say the name. It keeps them.`], night: [`I sleep like a soldier. Half.`, `I do not like the quiet. The quiet used to mean something.`] }
});

add({
  id: 'obinna', name: 'Obinna', sex: 'm', age: 23, arch: 'boy_gym', ov: { skin: '#6b4429', hair: 'fade', hairc: '#0f0b08', build: 'broad' }, role: 'Economics, 200L', home: 'Nnewi', faith: 'christian', trait: 'strong',
  voice: { base: 'pg', dialect: 'igbo', density: 0.5, faith: 'christian' }, axes: { warm: 0.65, brave: 0.5, funny: 0.7, guard: 0.6, pious: 0.5, order: 0.4 },
  bio: `Gym boy with a big laugh and a small voice when he is alone. Plays strong. Would rather be useful than admired.`, wants: `to play professional football`, fears: `being a coward`,
  acts: ['doing push-ups against the wall', 'tying and retying his shoelaces', 'flexing at his shadow', 'kicking a rolled-up sock'],
  ties: [['ngozi', 'neighbours in Lagos, flirting', 20], ['bashir', 'gym partners', 20]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Nnewi, my brother. The industrial town. We make everything, from spare parts to babies.`, `My father is a machinist. Two fingers short on the left hand, from the lathe. He says it is a signature.`], learn: `From Nnewi. His father is a machinist missing two fingers.` },
    { id: 'football', layer: 'dream', trust: 20, title: 'Football', lines: [`I was in the Anambra junior league. They said I had speed. Then my knee. Now I run only when something is chasing me.`, `You laugh? I still dream I am on the pitch, Oga. The crowd is loud. Somebody throws me the ball.`], learn: `He was a junior league footballer until his knee.` },
    { id: 'father', layer: 'wound', trust: 45, title: 'His father', lines: [`My father never said he was proud. Not once. When I did well he said, you could have done better. When I failed, silence.`, `I came to this university so he could not tell me where to stand. And now I stand in a stairwell, waiting for men with guns, trying to be strong enough for him.`], learn: `His father never said he was proud.`, flag: 'obi_father' },
    { id: 'coward', layer: 'secret', trust: 60, title: 'The first night', lines: [`The first night, when they came through the gate, I ran. I ran. I left a girl on the stairs. I did not look back.`, `She is alive. She does not know I saw her. I act strong so nobody sees the man who ran.`], learn: `On the first night he ran and left a girl behind.`, flag: 'obi_ran' }
  ],
  beats: [
    { id: 'obi_lift', day: 3, trust: 15, title: 'Moving the heavy things', lines: [`~Obinna is shifting a wardrobe across the door by himself, veins standing in his neck. Sweat everywhere.`, `"Do not help me, Oga. I got it. I always got it. Just... stand near, so that if I drop it you can say you tried."`],
      choices: [{ label: 'Help him anyway', fx: { t: 10, m: 3, flag: 'obi_helped' }, reply: `Ah! You are strong too. Do not tell anyone I needed it.` }, { label: 'Let him do it', fx: { t: 4, m: 2 }, reply: `See? Strong. I told you.` }] },
    { id: 'obi_fear', day: 10, trust: 40, title: 'Not tonight', lines: [`~Obinna is standing at the door, boots on. Then he sits. Then he stands. His hand is tight on the frame.`, `"I will go out tonight. Yes. I will go. I will. ...Oga, I cannot make my legs move."`],
      choices: [{ label: 'Tell him it is okay to be afraid', fx: { t: 14, m: 6, flag: 'obi_fear_ok' }, reply: `Nobody has ever said that to me. Nobody. Thank you.` }, { label: 'Order him to go', fx: { t: -10, m: -10, flag: 'obi_forced' }, reply: `Yes, Oga. I will go.` }, { label: 'Go with him', fx: { t: 16, m: 8, flag: 'obi_with' }, reply: `Okay. We go together. I will be loud, you will be smart.` }] }
  ],
  barks: { idle: [`Fifty push-ups. Do not count.`, `If you need something heavy lifted, say so loud.`, `I could take any of them. Probably.`], hungry: [`My muscles are eating themselves.`, `I am a big man. I need more than this.`], scared: [`I am not scared. I am being alert, loudly.`, `Stay behind me. Behind me! Just... a little behind.`], happy: [`That! That is how you move a wardrobe!`, `We are alive and I have not cried. Win.`], grief: [`I will carry him. Do not argue.`, `He was bigger than me, and he is gone.`], night: [`I sleep with my shoes on.`, `If I hear steps I will wake you. Or die first.`] }
});

add({
  id: 'funke', name: 'Funke', sex: 'f', age: 20, arch: 'girl_church', ov: { skin: '#a8714a', hair: 'bun', hairc: '#14100d', head: 'headtie', headc: '#8a3a8a' }, role: 'Mass Comm, 200L', home: 'Osogbo', faith: 'christian', trait: 'cook',
  voice: { base: 'en', dialect: 'yoruba', density: 0.35, faith: 'christian' }, axes: { warm: 0.85, brave: 0.35, funny: 0.45, guard: 0.5, pious: 0.7, order: 0.6 },
  bio: `Soft-spoken, always feeding somebody. Hums while she stirs. Keeps one hand on her stomach and does not know she is doing it.`, wants: `a family and a quiet kitchen`, fears: `being a burden`,
  acts: ['stirring a pot', 'humming', 'writing in a small diary', 'resting one hand on her belly'],
  ties: [['segun', 'same church', 25], ['chidera', 'choir', 20]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Osogbo. My grandmother is a dyer. Adire cloth, blue and white, hung on lines in a yard.`, `She says every cloth remembers who touched it. I think that is how I cook. The food knows.`], learn: `From Osogbo. Her grandmother is an adire dyer.` },
    { id: 'cook', layer: 'surface', trust: 15, title: 'Cooking', lines: [`When there was nothing, my grandmother used to say: a poor kitchen is a test of imagination.`, `So I try. Pepper, a little salt, whatever. The stove does not care about the quantity. It only cares about the love.`], learn: `She cooks to feel useful.` },
    { id: 'secret', layer: 'secret', trust: 45, title: 'The thing she has not said', lines: [`I am going to tell you something. Please do not tell the others yet.`, `I am pregnant. Eight weeks. I found out three days before the gate fell.`, `I do not know if I want it. I do not know if I will be allowed to want it.`], learn: `She is eight weeks pregnant and has told no one.`, flag: 'fun_pregnant' },
    { id: 'him', layer: 'wound', trust: 60, title: 'The father', lines: [`His name is Kunle. He is studying in Manchester. I did not tell him.`, `I told myself I was protecting his scholarship. I think I was protecting myself from his answer.`], learn: `The father is Kunle, studying abroad. He does not know.`, flag: 'fun_kunle' }
  ],
  beats: [
    { id: 'fun_pot', day: 2, trust: 10, title: 'One pot', lines: [`~Funke has turned three handfuls of rice and a tin of tomato into something that smells like Sunday.`, `"Please eat. I know it is small. I will make it again tomorrow. Sit. Sit."`],
      choices: [{ label: 'Tell her it is the best meal in days', fx: { t: 10, m: 6, all: 2, flag: 'fun_loved' }, reply: `Do not say that. I will cry. ...Thank you.` }, { label: 'Ask her to eat first', fx: { t: 14, m: 5, flag: 'fun_cared' }, reply: `You are kind. Hm. I am not hungry. But I will, for you.` }, { label: 'Eat quickly and leave', fx: { t: 0 }, reply: `Okay. Next time, it will be bigger.` }] },
    { id: 'fun_sick', day: 9, trust: 40, need: (x) => x.flag('fun_pregnant'), title: 'The morning', lines: [`~Funke is bent over a bucket. When she lifts her head the colour is gone from her face. She sees you. She knows you have seen.`, `"It is nothing. It is the water. It must be the water. ...Oga. Please. I need it to be the water."`],
      choices: [{ label: 'Quietly ask if she is pregnant', fx: { t: 12, m: 4, flag: 'fun_known' }, reply: `...Yes. How did you know? I thought I was careful.` }, { label: 'Pretend not to notice', fx: { t: 6 }, reply: `Thank you. Thank you for the kindness of not knowing.` }, { label: 'Say nothing, bring her water', fx: { t: 10, m: 3 }, reply: `That is the kindest thing anyone has done for me this week.` }] }
  ],
  barks: { idle: [`Is anyone hungry? I am always asking.`, `The smell of onions. It is almost like home.`, `I will make sure there is enough. Do not worry.`], hungry: [`I am fine. Give mine to someone else.`, `It is not for me I am worried.`], scared: [`Lord, protect us. Protect the little ones.`, `Please do not shout. Please.`], happy: [`See? A little pepper, a little rice. We are rich.`, `I felt something, today. I think it was happiness.`], grief: [`I will cook for the family. It is what I have.`, `Nobody should be hungry when they grieve.`], night: [`I cannot sleep on my back anymore.`, `I will watch with you. I am awake anyway.`] }
});

add({
  id: 'dan', name: 'Dan', sex: 'm', age: 21, arch: 'boy_hustler', ov: { skin: '#8d5a3b', hair: 'cornrows', hairc: '#0f0b08', head: 'cap', headc: '#2a2a30', chain: true }, role: 'Architecture, 200L', home: 'Makurdi', faith: 'christian', trait: 'runner',
  voice: { base: 'pg', dialect: null, density: 0, faith: 'christian', tag: 'my guy' }, axes: { warm: 0.6, brave: 0.4, funny: 0.8, guard: 0.85, pious: 0.3, order: 0.1 },
  bio: `Smooth, quick, and always three steps ahead of the truth. Everyone likes him. Nobody quite knows him.`, wants: `to clear his debt and be free`, fears: `being found out`,
  acts: ['shuffling a deck of cards', 'whistling', 'checking the door twice', 'counting something in his head'],
  ties: [['ngozi', 'does business with her', 15], ['obinna', 'play cards', 15]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Makurdi, my guy. Benue. The yam capital. You have not eaten until you have eaten pounded yam with fresh ogbono.`, `My people farm. My uncle says the land does not lie. I am proof the family can.`], learn: `From Makurdi, Benue. His family farms.` },
    { id: 'cards', layer: 'surface', trust: 15, title: 'Cards', lines: [`Whot, my guy. I can read people at forty paces. How they sit, how they breathe when they hold a bad card.`, `Everybody lies. The trick is to know which lie they need.`], learn: `He reads people like cards.` },
    { id: 'debt', layer: 'secret', trust: 45, title: 'The debt', lines: [`I borrowed money last year from a man in Abuja. It was meant to be small. It is not small anymore.`, `His people have people. They have been in touch since the siege. They want information on this place. Who has what, where.`, `I have told them nothing. Yet. That is the thing I need you to understand: yet.`], learn: `He owes a dangerous man, whose people want information from him.`, flag: 'dan_debt' },
    { id: 'family', layer: 'wound', trust: 60, title: 'Why', lines: [`My father died owing everybody. They came to the funeral for the debt, not for the grief.`, `I swore I would never be that man. Then I borrowed anyway. Look at me, my guy. I am the thing I was afraid of.`], learn: `His father died in debt. He borrowed anyway.`, flag: 'dan_father' }
  ],
  beats: [
    { id: 'dan_cards', day: 3, trust: 12, title: 'One more hand', lines: [`~Dan has a deck of Whot cards made from torn cereal boxes. Three people are already seated around him, grinning.`, `"One hand, my guy. For fun. Stakes: your next watch. If I win, you take mine."`],
      choices: [{ label: 'Play', fx: { t: 8, m: 5, all: 2, flag: 'dan_played' }, reply: `Ha! Now you are talking. Do not worry, I will go easy. A little.` }, { label: 'No gambling', fx: { t: -3 }, reply: `Ah. A serious man. Respect.` }] },
    { id: 'dan_choice', day: 12, trust: 35, need: (x) => x.flag('dan_debt'), title: 'The man at the door', lines: [`~A stranger leaves a folded note by the barricade. Dan reads it. His smile does not move, but his hands do.`, `"They want a map. Where each of us sleeps. What we have. They will leave us alone, they say. For this. For a map."`],
      choices: [{ label: 'Tell him to refuse', fx: { t: 12, m: 4, flag: 'dan_refused' }, reply: `Easy to say. You are not the one they know where to find. ...Okay. Okay. I will refuse. If you stand with me.` }, { label: 'Let him decide', fx: { t: 6, flag: 'dan_free' }, reply: `You trust me. I do not know why. That is a very dangerous thing, Oga.` }, { label: 'Take the note and burn it', fx: { t: 14, m: 5, flag: 'dan_burned' }, reply: `You did that for me? Oga... I will not forget it.` }] }
  ],
  barks: { idle: [`I know a guy who knows a guy.`, `Everyone has a price. I am just sad about mine.`, `Hmm. That is worth something. Nothing here is worthless.`], hungry: [`I can talk myself out of anything but hunger.`, `My guy, I would trade my shoes for a plate of anything.`], scared: [`If it goes bad, I know a way out. A short one.`, `Do not look at the door. Look at me.`], happy: [`Easy money! Well, easy... small.`, `Good people, this lot. Dangerous.`], grief: [`He was a good man. Of all of them, a good man.`, `I did not know how much I liked him until now.`], night: [`I keep the second watch. The first is too honest.`, `Somebody is always watching. It is easier when it is me.`] }
});

add({
  id: 'ada', name: 'Mama Ada', sex: 'f', age: 46, arch: 'cafe_woman', ov: { skin: '#6b4429', hair: 'short', hairc: '#b8b4aa', head: 'headtie', headc: '#c8832b' }, role: 'Cafeteria staff', home: 'Awka', faith: 'christian', trait: 'cook',
  voice: { base: 'pg', dialect: 'igbo', density: 0.7, faith: 'christian' }, axes: { warm: 0.95, brave: 0.7, funny: 0.7, guard: 0.35, pious: 0.75, order: 0.7 },
  bio: `The woman who fed half the campus for eleven years. Everyone is "my child" to her. She limps and says she does not.`, wants: `to see her children again`, fears: `running out of food in front of children`,
  acts: ['counting the last of the rice', 'wiping a spoon on her wrapper', 'singing an old Igbo lullaby', 'sitting down, finally'],
  ties: [['funke', 'she fed her every day', 25], ['obinna', 'he ate three plates a day', 30]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Awka! The blacksmith town. My mother's people have been hammering iron there since before the white man.`, `I came to this school when my husband died. This kitchen became my house. These students became my children.`], learn: `From Awka. She came after her husband died.` },
    { id: 'kids', layer: 'wound', trust: 25, title: 'Her children', lines: [`Three children. My eldest is a teacher. The middle one is in the civil service. My last is in Secondary School in Enugu.`, `I have not heard a word from any of them since the roads shut. I count. Every day I count the days.`], learn: `She has three children and no word since the roads closed.` },
    { id: 'cache', layer: 'secret', trust: 45, title: 'The cache', lines: [`Come close, my child. Listen.`, `Before the gate fell, I took sacks. Rice, beans, palm oil. I hid them in the crawl space behind the old storeroom. Enough for forty days, if you are careful.`, `I kept it quiet because I did not know who to trust. I am telling you because I have decided it is you.`], learn: `Mama Ada hid forty days of food behind the old storeroom.`, flag: 'ada_cache' },
    { id: 'sick', layer: 'secret', trust: 60, title: 'Her sickness', lines: [`I have sugar. The diabetes. I need my injection every morning. I have three vials left. Do not tell the young ones. They will give me their food.`, `I will not be the reason a child goes without.`], learn: `She is diabetic and has three vials of insulin left.`, flag: 'ada_sugar' }
  ],
  beats: [
    { id: 'ada_pot', day: 2, trust: 10, title: 'Enough for everybody', lines: [`~Mama Ada is ladling stew into every bowl, including empty ones that nobody has asked for.`, `"Eat, eat. Do not argue with me. A hungry child cannot hear sense. First eat, then talk."`],
      choices: [{ label: 'Make her sit and eat first', fx: { t: 12, m: 4, flag: 'ada_fed' }, reply: `Ehh! Look at this one! You will spoil me. Okay, I will sit.` }, { label: 'Eat gratefully', fx: { t: 6, m: 3 }, reply: `That is it. Eat. Bless you.` }] },
    { id: 'ada_limp', day: 8, trust: 40, need: (x) => x.flag('ada_sugar'), title: 'The shaking hand', lines: [`~Mama Ada has dropped the ladle. Her hand is trembling. She tucks it under her arm.`, `"Nothing. It is the heat. I will be fine, my child. Go and eat."`],
      choices: [{ label: 'Give her your ration of food', fx: { t: 12, m: 4, heal: 15, inv: { food: -1 } }, reply: `You are a good child. God will repay you. Do not tell the others.` }, { label: 'Use one of the medicine vials', fx: { t: 14, m: 6, heal: 30, inv: { meds: -1 } }, reply: `Chai. My own insulin. Where did you find it? ...Thank you. God bless you.` }, { label: 'Tell the others', fx: { t: -12, m: -4, all: 2 }, reply: `Ehh... you told them. I did not want it. Well, it is out.` }] }
  ],
  barks: { idle: [`A pot is never empty if somebody loves it.`, `My child, come. Sit. You have not eaten.`, `Wash your hands before you touch my food.`], hungry: [`Do not look at me. Look at the children.`, `I have eaten. I always have. Believe me.`], scared: [`God, cover us with your wings. Quick, quick.`, `Come, come, hide behind me. Quickly.`], happy: [`That is the sound of full bellies. Beautiful.`, `A hot meal. For a day, it is a feast.`], grief: [`Oh no. Another child.`, `I fed him for three years. Three years.`], night: [`I sing so they will sleep.`, `Leave a little light. Children are afraid of the dark.`] }
});

add({
  id: 'bello', name: 'Mr. Bello', sex: 'm', age: 52, arch: 'guard', ov: { skin: '#4a2e1c', hair: 'short', hairc: '#b8b4aa', beard: 'stache' }, role: 'Security guard', home: 'Ilorin', faith: 'muslim', trait: 'sleeper',
  voice: { base: 'pg', dialect: 'yoruba', density: 0.6, faith: 'muslim' }, axes: { warm: 0.55, brave: 0.7, funny: 0.4, guard: 0.8, pious: 0.8, order: 0.9 },
  bio: `The guard from the main gate. Quiet, polite, careful with his words and his cigarettes. Knows the campus better than anyone alive.`, wants: `to see his grandchildren`, fears: `being remembered for the night he ran`,
  acts: ['polishing a scuffed boot', 'checking his baton', 'staring at the gate through a window', 'whistling softly'],
  ties: [['ada', 'ate at her kitchen every day for eleven years', 30], ['hauwa', 'she asks him about the layout', 10]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Ilorin, my son. My father was a soldier in the Nigerian Army, in the Congo, you understand. He taught me to stand straight.`, `I did my national service as a corporal. That is a long time ago. But the back remembers.`], learn: `From Ilorin. His father was a soldier.` },
    { id: 'campus', layer: 'surface', trust: 15, title: 'The campus', lines: [`I know every door on this campus, Oga. Fourteen buildings, nine back ways. The cafeteria has a loose bar on the rear window. The clinic has an old tunnel to the generator house.`, `Eleven years, I never went to sleep on duty. Once.`], learn: `He knows every back way on campus.`, flag: 'bel_knows' },
    { id: 'night', layer: 'secret', trust: 50, title: 'The first night', lines: [`On the night it began, I was on the gate. Three of us. I saw the lights from the road. Trucks. Not one, not two.`, `I told the others to hold. Then I ran. I ran to the hostels to warn you all... that is what I told myself later. But my legs did not ask me.`, `The gate fell in four minutes. If I had stayed, perhaps it falls in six. I will not know. I will never know.`], learn: `He ran from the gate on the first night, and has not forgiven himself.`, flag: 'bel_ran' },
    { id: 'family', layer: 'dream', trust: 60, title: 'His grandchildren', lines: [`My daughter in Lagos. Two boys. Five and nine. I have never carried the younger one.`, `If I live I will go and take both of them to fish. Real fish, in a river, in the morning. I have always wanted that.`], learn: `He wants to take his grandsons fishing.`, flag: 'bel_dream' }
  ],
  beats: [
    { id: 'bel_map', day: 3, trust: 15, title: 'The tunnel', lines: [`~Mr. Bello pulls you aside. He has drawn a map on the back of a sachet. Rooms, corridors, a crooked line under the clinic.`, `"My son. If we are ever cornered, there is a way out. Only I know it. I would like to show you, and nobody else."`],
      choices: [{ label: 'Keep it secret with him', fx: { t: 12, flag: 'bel_secret' }, reply: `Good. A secret held by two is a secret still.` }, { label: 'Tell the group so everyone knows', fx: { t: 4, m: 2, all: 2 }, reply: `Hm. Wise, perhaps. Knowledge dies with a man otherwise.` }] },
    { id: 'bel_gate', day: 10, trust: 40, need: (x) => x.flag('bel_ran'), title: 'Return to the post', lines: [`~Mr. Bello is staring toward the gate. His hat is in his hands.`, `"I want to go and look at it. Only look. I have not seen it since. I do not know why. Perhaps I want to say sorry to it."`],
      choices: [{ label: 'Go with him', fx: { t: 16, m: 7, flag: 'bel_forgave' }, reply: `Thank you, my son. I am not afraid with you beside me.` }, { label: 'Tell him it is not his fault', fx: { t: 8, m: 3 }, reply: `Maybe. I will think about it. A man needs time to believe such a thing.` }, { label: 'Forbid it', fx: { t: -6, m: -4 }, reply: `Yes, Oga. As you say.` }] }
  ],
  barks: { idle: [`Everything is in order. For now.`, `I check the door every hour. Habit.`, `Quiet. Listen. That is the generator house.`], hungry: [`A soldier eats when he can.`, `I have had smaller meals in worse places.`], scared: [`Down. Quietly. Away from the window.`, `I have seen this before. Stay behind me.`], happy: [`A cup of tea. Good.`, `Today, a good day. Let us be grateful.`], grief: [`Another one. Another one.`, `I should have been there. I should always have been there.`], night: [`I keep the watch. I always did.`, `Sleep. I am awake.`] }
});

add({
  id: 'grace', name: 'Dr. Grace', sex: 'f', age: 38, arch: 'lect_f', ov: { skin: '#8d5a3b', hair: 'short', hairc: '#0f0b08', head: 'headtie', headc: '#2d5fa0', glasses: '#17120e' }, role: 'Lecturer, Chemistry', home: 'Owerri', faith: 'christian', trait: 'hardened',
  voice: { base: 'en', dialect: 'igbo', density: 0.25, faith: 'christian' }, axes: { warm: 0.5, brave: 0.7, funny: 0.3, guard: 0.7, pious: 0.55, order: 0.85 },
  bio: `A chemistry lecturer who thinks in systems and speaks in complete sentences. Was supposed to be on leave. The siege found her instead.`, wants: `to protect her students`, fears: `failing the ones who trusted her`,
  acts: ['writing a plan on the back of an exam script', 'cleaning her glasses', 'organising a supply list', 'quietly rubbing her temples'],
  ties: [['tunde', 'her best student, argues with her', 30], ['chidera', 'taught her first-year chemistry', 25]],
  topics: [
    { id: 'home', layer: 'surface', trust: 0, title: 'Home', lines: [`Owerri, originally. My father was a headmaster, my mother a nurse. A house that ran on schedule.`, `I wanted to be an engineer. They said girls do chemistry. I did chemistry. I became very good at it, mostly out of spite.`], learn: `From Owerri. She became a chemist out of spite.` },
    { id: 'teach', layer: 'surface', trust: 15, title: 'Teaching', lines: [`The best thing I can do for a young person is to refuse to be impressed by their excuses.`, `And then to forgive them, afterwards. In that order.`], learn: `She refuses to be impressed by excuses, then forgives.` },
    { id: 'son', layer: 'wound', trust: 40, title: 'Her son', lines: [`I have a son, Chike. Nineteen. He studies engineering in Lagos. The last time we spoke, we argued about whether he should come to Abuja for the break.`, `I said no. I said stay in Lagos, stay safe. Then this happened. If anything... I would not have said it, Commander. I would have said come.`], learn: `Her son is in Lagos. Their last conversation was an argument.`, flag: 'gra_son' },
    { id: 'divorce', layer: 'secret', trust: 60, title: 'What she keeps back', lines: [`I was married. For nine years. He was an important man, and he found my importance inconvenient.`, `I left with a suitcase and a child. I swore I would never need anyone to lead me again. So when I start telling you what to do, please understand I do not know how to stop.`], learn: `She left a marriage with a suitcase and a child. She cannot stop leading.`, flag: 'gra_divorce' }
  ],
  beats: [
    { id: 'gra_plan', day: 4, trust: 20, title: 'A plan on paper', lines: [`~Dr. Grace has written eleven points on the back of a past exam script. Water, waste, watch, ration, medicine, the rest. She hands it to you the way she once handed out marks.`, `"I am not giving orders, Commander. I am offering structure. You may rip it up if you wish."`],
      choices: [{ label: 'Adopt her plan', fx: { t: 12, m: 3, flag: 'gra_plan' }, reply: `Good. Then we will be difficult to starve.` }, { label: 'Amend it with her', fx: { t: 14, m: 4, flag: 'gra_partner' }, reply: `Now you are teaching me. I am delighted.` }, { label: 'Tear it up', fx: { t: -14, m: -4 }, reply: `Understood. I will be silent. I do not do it well.` }] },
    { id: 'gra_envoy', day: 9, trust: 40, need: (x) => x.pol, title: 'The negotiator', lines: [`~A faction's runner arrives with a proposal. Dr. Grace reads it twice, circles one line, and slides it toward you.`, `"They want an alliance of convenience. I can negotiate this, but I will need to know your limits. What will you not trade, Commander?"`],
      choices: [{ label: 'Let her negotiate freely', fx: { t: 12, flag: 'gra_envoy_free' }, reply: `Very well. I will bring back the best I can.` }, { label: 'Set strict limits', fx: { t: 8, flag: 'gra_envoy_lim' }, reply: `Then we will be careful. Careful is a kind of victory.` }] }
  ],
  barks: { idle: [`Let us at least be organised.`, `I would mark this, but the paper is needed.`, `Everything has a method. Even this.`], hungry: [`I can teach calmly on a small stomach.`, `We will ration. Properly.`], scared: [`Keep your voices down. Keep your heads clear.`, `Panic is a luxury. We cannot afford it.`], happy: [`This is a good morning. Note it.`, `I am pleased with all of you.`], grief: [`I taught him. I taught her. I will teach this too.`, `We will remember. That is a discipline.`], night: [`I check the stores when I cannot sleep.`, `I keep a list of everyone I could not help.`] }
});

const by = Object.fromEntries(list.map((c) => [c.id, c]));
C.Cast = { list, by, ids: list.map((c) => c.id) };
if (typeof module !== 'undefined') module.exports = C.Cast;
})(typeof window !== 'undefined' ? window : globalThis);
