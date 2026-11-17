/* CRISIS — the manual. Reference, not a tutorial: everything the game does, findable in two taps.
   The building and crafting pages are generated from the game's own tables (Crisis.Sim.BUILDS / CRAFTS), so costs,
   times and requirements can never drift from what the game really does. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const I = () => C.Icons;
/* an icon the set has, or the nearest one it does (never a blank square) */
const ALIAS = { flag: 'target', hand: 'tap', box: 'bag', stove: 'fire', bench: 'tools', bench2: 'tools', bucket: 'water', filter: 'water', garden: 'herbs', alarm: 'bolt', curtains: 'hush', infirm: 'bed', cupboard: 'bag', still: 'ogogoro', brazier: 'fire', rack: 'weed', bunk: 'bed', mend: 'tools', cigs: 'cigarettes', herbal: 'meds', door: 'door' };
const ic = (k) => { const S = I(); if (!S || !S.html) return ''; const n = S.names && S.names.indexOf(k) >= 0 ? k : ALIAS[k] && (!S.names || S.names.indexOf(ALIAS[k]) >= 0) ? ALIAS[k] : 'tools'; return S.html(n); };
const item = (k) => (I() && I().item ? I().item(k) : '');

/* every material and item: what it is, where it comes from, what it is for */
const MAT = {
  food: ['Food', 'material', 'Kitchens, canteens, other groups, the rooftop garden, trades at the door.', 'Eaten raw in a pinch (weak, can make you sick). Cooked at the stove into meals. Also brews ogogoro and plants gardens.'],
  meal: ['Cooked meal', 'food', 'Cooked at the stove: up to 4 food and 1 wood make up to 4 meals.', 'Feeds properly and lifts the mood of whoever eats it.'],
  water: ['Water', 'material', 'Taps, tanks, the rain catcher, trades.', 'Drunk every day; runs out faster than food. Herbal medicine needs it.'],
  wood: ['Wood', 'material', 'Furniture in every building, broken-up crates (crowbar), rubble.', 'Most building, clubs, fires (cooking, the brazier), boarding windows.'],
  parts: ['Scrap', 'material', 'Offices, workshops, cars, lockers, broken machines.', 'Most building, knives, machetes, crowbars, lockpicks, mending tools.'],
  cloth: ['Cloth', 'material', 'Hostel rooms, wardrobes, laundry, the dead.', 'Bandages, blankets, bunks, curtains, filters, mending tools.'],
  elec: ['Electronics', 'material', 'Offices, labs, the radio station, other groups.', 'The radio and the alarm line.'],
  meds: ['Medicine', 'medicine', 'Clinics, the pharmacy, other groups, rare trades. Or brewed as herbal medicine.', 'Knocks an infection back; brings an illness down a level, often clears a mild one.'],
  bandage: ['Bandage', 'medicine', 'Made from 2 cloth at the workbench, or found.', 'Dresses a wound for two days. A dressed wound heals; an open one bleeds and goes bad.'],
  herbs: ['Herbs', 'material', 'The rooftop garden.', 'Herbal medicine (3 herbs and 1 water).'],
  tobacco: ['Tobacco', 'material', 'The rooftop garden, trades.', 'Rolled into cigarettes with paper.'],
  paper: ['Paper', 'material', 'Offices, the library, lecture halls.', 'Rolling cigarettes.'],
  weed: ['Weed', 'habit', 'The weed patch on the roof, other groups.', 'Cured into loud on the drying rack. Calms, and some come to need it.'],
  loud: ['Loud', 'habit', 'Cured from 3 weed on the drying rack.', 'A strong smoke. Lifts the mood a lot; habit-forming. Worth a lot in trade.'],
  cigarettes: ['Cigarettes', 'habit', 'Rolled (4 at a time), found, traded.', 'A small comfort, and a currency. Some people get hooked.'],
  ogogoro: ['Ogogoro', 'habit', 'Brewed at the still from 2 food and 1 wood.', 'Local gin. Comfort and courage, a strong trade good, and a habit for some.'],
  blanket: ['Blanket', 'comfort', 'Made from 3 cloth at the workbench, or found.', 'Keeps a sleeper warm on a cold night: one blanket, one person.'],
  bullets: ['Bullets', 'ammunition', 'Patrols, soldiers, armed groups, rare finds.', 'One per pistol shot. A pistol with no bullets cannot be used.'],
  toolkit: ['Tool kit', 'tool', 'Rare: crates and lockers at the gate, the halls, the cafeterias, the courts, the chapel.', 'Needed to build the better workbench. Not used up.']
};
/* tools and weapons: what each one does, how fast it wears, how hard it hits */
const GEAR = [
  ['club', 'Weapon', 'The weakest weapon. Better than bare hands.', 'Wears fast in fights and cracks.', 1],
  ['knife', 'Weapon', 'Quick and quiet. Close work.', 'Wears in fights and can snap.', 2],
  ['machete', 'Weapon', 'Hits hard. Two strokes and it is over.', 'Wears slowly; chips and cracks in the end.', 3],
  ['pistol', 'Weapon', 'The strongest weapon. Every shot is heard across the campus.', 'Needs one bullet per shot. Never wears out.', 4],
  ['crowbar', 'Tool and weapon', 'Forces locked doors (10 min, loud), breaks emptied furniture into firewood, and swings hard in a fight.', 'Wears with every use; bends and breaks.', 3],
  ['lockpick', 'Tool', 'Opens locked doors and boxes quietly (25 min).', 'A pick can snap in the lock (about 3 tries in 10).', 0],
  ['shovel', 'Tool', 'Digs through rubble on a run (40 min) and clears rubble in the house.', 'Wears with each dig and breaks.', 0],
  ['toolkit', 'Tool', 'Lets you build the better workbench.', 'Never used up.', 0]
];
/* what each building does, beyond its cost */
const BUILT = {
  stove: 'Cook raw food into meals (needs 1 wood each time).', bench: 'Unlocks crafting.', bench2: 'Unlocks machetes, crowbars, shovels and mending tools. Needs a tool kit to build.',
  doorfix: 'Repairs a damaged door. A damaged door makes raids worse.', barr1: 'Strengthens the door against raids.', barr2: 'Stronger again. Needs Barricade I.', barr3: 'The strongest door. Needs Barricade II.',
  bunk: 'One more bed: a bed is warmer and more restful than the floor.', bucket: 'Collects rainwater on the roof, more in the rainy season.', filter: 'Cleaner water: stops stomach sickness spreading through it.',
  garden: 'Grows food, herbs and tobacco every six days.', radio: 'News from outside, rumours of rescue, and some trades.', alarm: 'Warns of raiders at the door: a better defence.',
  curtains: 'Hide your light at night: raiders pass more often, and the room is warmer.', infirm: 'A proper bed for the sick and the badly hurt: they mend faster and do not spread illness.',
  cupboard: 'Holds more of everything.', still: 'Brews ogogoro.', weed: 'Grows weed every four days.', brazier: 'A fire at night: the strongest warmth there is.', rack: 'Cures weed into loud.'
};
const WHERE = { stove: 'the stove spot', bench: 'the workbench spot', door: 'the door', stairs: 'by the stairs', roof: 'the roof', filter: 'the water spot', garden: 'the roof', radio: 'the radio spot', infirm: 'the sick-bed spot', cupboard: 'the cupboard', still: 'the still spot', patch: 'the roof', brazier: 'the brazier spot', rack: 'the rack spot' };
/* what each craft is for, and what kind of thing it makes */
const MADE = {
  bandage: ['Medicine', 'Dresses a wound for two days.'], blanket: ['Comfort', 'Warmth for one sleeper on a cold night.'], club: ['Weapon', 'A first weapon.'], knife: ['Weapon', 'Quick and quiet.'],
  machete: ['Weapon', 'Hits hard.'], crowbar: ['Tool and weapon', 'Forces doors, breaks furniture into wood, fights.'], lockpick: ['Tool', 'Opens locks quietly. Makes two.'], shovel: ['Tool', 'Digs through rubble.'],
  mend: ['Repair', 'Takes the most worn tool or weapon back from the edge.'], herbal: ['Medicine', 'One medicine, slowly, from the garden.'], cigs: ['Trade / habit', 'Makes four.'],
  ogogoro: ['Trade / habit', 'Makes two bottles.'], loud: ['Trade / habit', 'One strong smoke from three weed.']
};
const name = (k) => (MAT[k] ? MAT[k][0] : k === 'parts' ? 'Scrap' : k.charAt(0).toUpperCase() + k.slice(1));
const cost = (o) => Object.entries(o || {}).map(([k, n]) => `<span class="mchip">${item(k)}${n} ${esc(name(k).toLowerCase())}</span>`).join('');
const mins = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`);
const P = (t) => `<p>${t}</p>`, H = (t) => `<h3 class="msec">${t}</h3>`;
const card = (head, body, tags) => `<div class="mcard"><div class="mch">${head}</div>${tags ? `<div class="mtags">${tags}</div>` : ''}<div class="mcb">${body}</div></div>`;
const tag = (t, kind) => `<span class="mtag ${kind || ''}">${esc(t)}</span>`;

function crafting() {
  const CR = (C.Sim && C.Sim.CRAFTS) || {};
  const where = (d) => (d.needs === 'still' ? 'The still' : d.needs === 'rack' ? 'The drying rack' : d.tier === 2 ? 'Better workbench' : 'Workbench');
  const groups = [['Workbench', 'Everything here needs the workbench built.'], ['Better workbench', 'Needs the better workbench (built on top of the workbench, with a tool kit).'], ['The still', 'Needs the still, and a workbench.'], ['The drying rack', 'Needs the drying rack, and a workbench.']];
  let html = P('Crafting turns materials into things you need. Pick someone, tap the workbench (or open <b>Work</b>), and choose what to make. They walk over and work until it is done; the materials are used at the start and given back if the work is stopped part-way.');
  groups.forEach(([g, note]) => {
    const list = Object.values(CR).filter((d) => where(d) === g); if (!list.length) return;
    html += H(g) + `<p class="dim">${note}</p><div class="mcards">` + list.map((d) => {
      const m = MADE[d.id] || ['', '']; const out = Object.entries(d.out || {}).map(([k, n]) => `${n} ${name(k).toLowerCase()}`).join(', ');
      return card(`${ic(d.id === 'mend' ? 'tools' : d.id === 'cigs' ? 'cigarettes' : d.id === 'herbal' ? 'meds' : d.id === 'loud' ? 'weed' : d.id)}<b>${esc(d.name)}</b>`,
        `<div class="mrow2">${cost(d.cost)}</div><div class="dim">${mins(d.min)}${out ? ' · makes ' + esc(out) : ''}</div><div>${esc(m[1])}</div>`,
        tag(m[0], /Weapon/.test(m[0]) ? 'w' : /Tool/.test(m[0]) ? 't' : /Medicine/.test(m[0]) ? 'm' : ''));
    }).join('') + '</div>';
  });
  html += H('Cooking') + P('Cooking is done at the <b>stove</b>, not the workbench. One cooking takes up to 4 food and 1 wood and gives that many cooked meals (a born cook makes one extra). Without a stove, people eat raw food when they are hungry enough, and raw food can make them sick.');
  return html;
}
function building() {
  const B = (C.Sim && C.Sim.BUILDS) || {};
  return P('Building improves the house for good. Empty spots in the house show what can go there. Pick someone and tap the spot (or open <b>Work</b>). Junk must be cleared from a spot first, and rubble needs a shovel. One person works on each project at a time.')
    + '<div class="mcards">' + Object.entries(B).map(([id, d]) => card(`${ic(id === 'barr1' || id === 'barr2' || id === 'barr3' || id === 'doorfix' ? 'door' : id === 'bucket' ? 'water' : id === 'infirm' ? 'bed' : id)}<b>${esc(d.name)}</b>`,
      `<div class="mrow2">${cost(d.cost)}${d.tool ? `<span class="mchip">${item(d.tool)}needs a ${esc(name(d.tool).toLowerCase())}</span>` : ''}</div><div class="dim">${mins(d.min)} · at ${esc(WHERE[d.at] || d.at)}</div><div>${esc(BUILT[id] || '')}</div>`)).join('') + '</div>'
    + P('<b>Roof projects</b> (rain catcher, rooftop garden, weed patch) need a house with a roof floor. <b>Boarding a window</b> (2 wood, 1 scrap) is a quick job done at the window itself: a boarded window keeps raiders and the cold out.');
}
function materials() {
  return P('Everything the house uses, where to look for it, and what it is for. Your bag on a run holds about 10 things (some people carry more).')
    + '<div class="mcards">' + Object.entries(MAT).map(([k, m]) => card(`${item(k)}<b>${esc(m[0])}</b>`, `<div><span class="dim">Found:</span> ${esc(m[2])}</div><div><span class="dim">For:</span> ${esc(m[3])}</div>`, tag(m[1]))).join('') + '</div>';
}
function gear() {
  const pips = (n) => (n ? `<span class="mpips">${'●'.repeat(n)}${'○'.repeat(4 - n)}</span>` : '');
  return P('<b>Weapons</b> are for fights. <b>Tools</b> open the way on a run. The crowbar is both. When you choose to fight, you pick what to fight with; each choice shows your odds as dots (more filled dots, better odds).')
    + '<div class="mcards">' + GEAR.map(([k, kind, what, wear, power]) => card(`${item(k) || ic(k)}<b>${esc(name(k))}</b>`, `<div>${esc(what)}</div><div class="dim">${esc(wear)}</div>${power ? `<div>Strength ${pips(power)}</div>` : ''}`, tag(kind, /Weapon/.test(kind) ? 'w' : 't'))).join('') + '</div>'
    + P('Bare hands are always there, and almost always lose. A tool or weapon that wears all the way out breaks and is gone; <b>Mend a tool</b> at the better workbench takes the most worn one back from the edge.');
}
const SECTIONS = [
  ['start', 'The goal', 'flag', () => P('Keep your people alive until help reaches the campus. Nobody knows when: rescue comes some time after day 30, and the radio and other groups only have rumours, some of them wrong.')
    + P('Each day passes in a few minutes. By day your people look after themselves and work; you decide what matters. At 8 in the evening you plan the night: who sleeps, who keeps watch, who goes out. A run happens at night, and the runner must be home by 5.')
    + P('What you do is remembered, by your people and by everyone you meet.')],
  ['people', 'Your people', 'people', () => P('Each person has needs you can see as bars and words: <b>Hunger</b>, <b>Thirst</b>, <b>Tired</b>, <b>Health</b> and <b>Mood</b>. Words like hurt, sick, hungry, broken, tired or filthy tell you how they are.')
    + P('They look after themselves: they eat, drink, sleep, dress their own wounds and take medicine when there is some. Whoever you have selected waits for your orders; you can also tell someone to wait for orders, or to find their own work.')
    + P('Each has a trait (a medic heals better, a cook makes more, a runner is faster and better at hiding, some are devout, some fragile) and a story you learn by talking to them. Low mood makes people refuse orders, cry, or leave. Sitting with them helps.')],
  ['orders', 'Giving orders', 'hand', () => P('Tap a face to pick someone, then tap anything in the house: the cupboard, a bunk, the stove, a window, an empty spot to build on. They walk over and do it. Tap the floor to send them somewhere.')
    + P('The <b>Work</b> tab lists everything there is to do, with what it costs and how long it takes. The <b>Items</b> tab shows what you have. A person page (tap their face again) has talking, sitting with them, their things, their notebook, and the night watch.')],
  ['night', 'The night plan', 'moon', () => P('At 8 in the evening the night plan opens. Drag faces (or tap a face, then a box) into <b>Bunks</b>, <b>Floor</b>, <b>Keep watch</b>, <b>Go out</b> (you walk the run yourself) or <b>Send out alone</b> (they go on their own and come back by dawn).')
    + P('Sleeping in a bunk rests better and is warmer than the floor. A guard stays up, sees raiders coming and makes raids go better. Nobody keeps watch who should be lying down: anyone very weak, bedridden, bleeding from an undressed deep wound or properly sick is refused, and the box says why. A guard who is hurt on watch comes off it and lies down.')],
  ['runs', 'Runs', 'feet', () => P('On a run you walk one person through another building. <b>Tap</b> to walk there, <b>double-tap</b> to run there (twice as fast, twice as loud). Sneak to be quiet. Tap the glowing spots to search them; what you find goes in a sheet where you choose what to carry.')
    + P('<b>Noise</b> spreads in rings, and patrols come to look. Running, breaking things, a crowbar, a gunshot are loud. Hide in a hiding place to let a patrol pass. Locked doors need a crowbar (quick, loud) or lockpicks (slow, quiet); rubble needs a shovel.')
    + P('The run ends when you leave by the way you came in, or at 5 in the morning, when the runner has to head home. Badly hurt runners collapse and crawl home, dropping most of what they carry.')],
  ['danger', 'Danger and fights', 'warn', () => P('When someone finds you, you choose: <b>Fight</b> (pick a weapon; the dots show your odds), <b>Give</b> them what they want, <b>Plead</b>, <b>Hide</b>, or <b>Run</b>. Running always ends with the runner sprinting home; get caught and they are hurt but keep going.')
    + P('Backing out of the weapon picker puts you back in front of them: there is no walking away from an encounter.')
    + P('<b>Raids</b> come at night more than by day, more often the louder and more noticed the house is. A barricaded door, boarded windows, an alarm line, guards who are awake and good weapons all help. You can fight, pay, or sit in the dark and hope.')],
  ['health', 'Health', 'meds', () => P('<b>Wounds</b> come in three depths (graze, deep, grave). An undressed wound bleeds and can go bad; a <b>bandage</b> dresses it for two days and lets it close. An infected wound needs <b>medicine</b>; left alone the infection spreads into the blood.')
    + P('<b>Illness</b> (stomach sickness, chest fever, malaria) gets better or worse each morning. Rest, food, the <b>sick bed</b> and a medic help; medicine knocks it back. Stomach sickness and chest fever spread to others unless the sick sleep in the sick bed, and a water filter stops stomach sickness spreading through the water.')
    + P('Health comes back on its own when someone is fed and rested, faster asleep. The badly hurt and the very ill lie down and do not work. An untreated grave wound can kill in about a week.')],
  ['survive', 'Food, water and cold', 'water', () => P('Everyone needs water every day and food most days. Raw food is weak and can make you sick; cooked meals feed better and lift the mood. Water runs out faster than food.')
    + P('Cold nights cost sleep and health. Warmth for a sleeper comes from a lit <b>brazier</b> (the most), a <b>blanket</b>, a <b>bunk</b> instead of the floor, and <b>curtains</b>; every smashed window left open makes it colder for everyone. Guards on watch feel the cold most.')],
  ['build', 'Building', 'tools', building],
  ['craft', 'Crafting', 'tools', crafting],
  ['mats', 'Materials', 'box', materials],
  ['gear', 'Tools and weapons', 'machete', gear],
  ['habits', 'Habits', 'cigarettes', () => P('Ogogoro, cigarettes, weed and loud are comfort, courage and currency. People who use them a lot can get <b>hooked</b>: without it they crave, their mood drops, and a heavy drinker gets the shakes. You can hide the supply from someone (harder now, easier later) or give it back.')
    + P('They are also the best things to trade, and what the collector and the gangs ask for.')],
  ['door', 'The door and visitors', 'door', () => P('Strangers knock. A knock does not stop the day: whoever answers decides, and the visitor waits outside only so long (armed men least). People you help, refuse or rob come back days later, at your door or in another group.')
    + P('<b>Mai Kudi</b>, the bandits\' collector, comes every few days for a levy. Pay, bargain or refuse, and live with what follows: refusing brings a raid. Trade at the door uses what you have; habits and medicine are worth the most.')],
  ['controls', 'Controls', 'hand', () => P('<b>Phone:</b> tap to choose, tap a face to pick someone, drag the sheet up and down. Double-tap to run on a run. Tap outside a card to close it; a decision folds into a bar instead (tap the bar to bring it back). The back gesture closes the top thing, and on the bare house opens the pause menu.')
    + P('<b>PC:</b> click to choose; right-click or Esc closes. Space pauses, F changes speed, Tab moves between people, E ends the day, I / W / J open Items, World and Journal, number keys pick a choice. On a run, S sneaks and H heads home.')]
];
const Man = {};
Man.index = () => `<p class="dim" style="margin:0 0 10px">Everything the game does, in one place.</p><div class="mtiles">${SECTIONS.map(([id, t, icon]) => `<button class="mtile" data-mn="man" data-s="${id}">${ic(icon)}<b>${esc(t)}</b></button>`).join('')}</div>`;
Man.section = (id) => { const s = SECTIONS.find((x) => x[0] === id); return s ? { title: s[1], html: `<div class="how man">${s[3]()}</div>` } : null; };
C.Manual = Man;
})(typeof window !== 'undefined' ? window : globalThis);
