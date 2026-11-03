/* CRISIS — the campus map (designer's building list)
   Zones group buildings that are close together. DIST is the one-way walking time in night-hours between zones.
   Change DIST, loot or risk here and the whole game follows. Nothing else needs editing. */
(function (root) {
'use strict';
const C = root.Crisis = root.Crisis || {};

const ZONES = {
  boysA: { name: "Boys' Side (Hostels A–Q)", short: 'Boys A–Q' },
  boysP: { name: 'Premium Hostels (R, S, T)', short: 'R–T' },
  girls: { name: "Girls' Hostels", short: 'Girls' },
  core: { name: 'Academic Core', short: 'Core' },
  sports: { name: 'Sports Grounds', short: 'Sports' },
  gate: { name: 'School Gate', short: 'Gate' }
};
/* hours of a night spent walking between zones (symmetrical) */
const DIST = {
  boysA: { boysA: 0, boysP: 2, girls: 2, core: 1, sports: 1, gate: 2 },
  boysP: { boysA: 2, boysP: 0, girls: 2, core: 1, sports: 2, gate: 2 },
  girls: { boysA: 2, boysP: 2, girls: 0, core: 1, sports: 2, gate: 2 },
  core: { boysA: 1, boysP: 1, girls: 1, core: 0, sports: 1, gate: 1 },
  sports: { boysA: 1, boysP: 2, girls: 2, core: 1, sports: 0, gate: 1 },
  gate: { boysA: 2, boysP: 2, girls: 2, core: 1, sports: 1, gate: 0 }
};

const LOCS = [];
const add = (o) => LOCS.push(Object.assign({ risk: 2, rich: [4, 8], kind: 'misc', group: false }, o));

/* Boys' Hostels A–Q (one side of the school, beside the eight boys' cafeterias) */
'ABCDEFGHIJKLMNOPQ'.split('').forEach((l) => add({
  id: 'bh' + l, name: `Boys' Hostel ${l}`, zone: 'boysA', kind: 'hostel', group: true, rich: [3, 6], risk: 2,
  loot: { food: 4, water: 3, meds: 1, cloth: 1.2, ogogoro: 0.6, wood: 0.4, bandage: 0.3 },
  flavor: 'Corridors of closed doors. Names still taped on them. Somebody is breathing behind one.'
}));
/* Boys' cafeterias (8) */
for (let i = 1; i <= 8; i++) add({
  id: 'bc' + i, name: `Boys' Cafeteria ${i}`, zone: 'boysA', kind: 'cafe', group: true, rich: [4, 7], risk: 2,
  loot: { food: 7, water: 3, wood: 1, parts: 1 }, flavor: 'Plastic chairs stacked wrong. The smell of old oil and older stew.'
});
/* Premium hostels R, S, T (very close together, opposite side of the school) */
'RST'.split('').forEach((l) => add({
  id: 'bh' + l, name: `Boys' Hostel ${l} (premium)`, zone: 'boysP', kind: 'hostel', group: true, rich: [4, 8], risk: 3,
  loot: { food: 4, water: 4, parts: 2, meds: 1, ogogoro: 1, cloth: 1, pistol: 0.2 },
  flavor: 'Private rooms. Generators. Doors with real locks, and people behind them who can afford to be afraid.'
}));
/* Girls' hostels */
[["Pa-Etos Girls' Hostel", 'pa'], ["New Pa-Etos Girls' Hostel", 'npa'], ["CICL Girls' Hostel", 'cicl'], ["Stanzel Girls' Hostel", 'stz'], ["Old Kelson Girls' Hostel", 'okl'], ["New Kelson Girls' Hostel", 'nkl']].forEach(([n, id]) => add({
  id: 'gh_' + id, name: n, zone: 'girls', kind: 'hostel', group: true, rich: [3, 6], risk: 2,
  loot: { food: 4, water: 3, cloth: 2, meds: 1, bandage: 0.6, ogogoro: 0.2 },
  flavor: 'Fairy lights still hung in a window. Perfume, damp, and the sound of someone whispering a prayer.'
}));
/* Academic core */
['A', 'B', 'C', 'D'].forEach((l) => add({
  id: 'cb' + l, name: `Class Block ${l}`, zone: 'core', kind: 'class', rich: [3, 6], risk: 2,
  loot: { wood: 3.5, parts: 1.5, cloth: 0.6, water: 1.2, food: 0.6 }, flavor: 'Desks overturned. A lecture still written on the board.'
}));
add({ id: 'theatre', name: 'New Theatre', zone: 'core', kind: 'hall', group: true, rich: [4, 7], risk: 3, loot: { cloth: 3, parts: 2, wood: 2, water: 1 }, flavor: 'Tiered seats in the dark. Your footsteps carry.' });
add({ id: 'pg', name: 'Post Graduate Building', zone: 'core', kind: 'class', group: true, rich: [4, 7], risk: 3, loot: { parts: 3, food: 1.5, meds: 0.5, water: 1, cloth: 1 }, flavor: 'Labs and offices. Researchers who never left.' });
add({ id: 'mph', name: 'Multi-Purpose Hall (MPH)', zone: 'core', kind: 'hall', group: true, rich: [4, 7], risk: 3, loot: { water: 3, cloth: 2, wood: 2, food: 1.5 }, flavor: 'A huge dark floor. Mats, bags, bodies sleeping in rows.' });
add({ id: 'ase', name: 'Ase Caf (under the MPH)', zone: 'core', kind: 'cafe', group: true, rich: [4, 8], risk: 3, loot: { food: 6, water: 3, wood: 1, parts: 0.6 }, flavor: 'Under the hall, the dark is thicker. The kitchen still smells of pepper.' });
add({ id: 'law', name: 'Law Faculty', zone: 'core', kind: 'class', rich: [3, 6], risk: 2, loot: { wood: 2, parts: 2, cloth: 1, water: 1 }, flavor: 'A moot court. Black gowns left on hooks.' });
add({ id: 'senate', name: 'Senate Building', zone: 'core', kind: 'admin', group: true, rich: [4, 7], risk: 3, loot: { parts: 3, food: 2, meds: 1, pistol: 0.3, cloth: 1 }, flavor: 'Marble and portraits. Armed men used it as a command post once.' });
add({ id: 'pharm', name: 'Pharmacy Building', zone: 'core', kind: 'clinic', rich: [4, 7], risk: 3, loot: { meds: 6, bandage: 2, parts: 1, water: 0.6 }, flavor: 'Shelves half-emptied. The good drugs are already gone.' });
add({ id: 'med', name: 'Medical Building', zone: 'core', kind: 'clinic', group: true, rich: [4, 7], risk: 3, loot: { meds: 4, bandage: 3, parts: 1, water: 1 }, flavor: 'Skeletons in glass cases. Everyone else is gone.' });
add({ id: 'newmed', name: 'New Medical Building', zone: 'core', kind: 'clinic', rich: [4, 8], risk: 4, loot: { meds: 5, bandage: 3, parts: 2, water: 1, cloth: 1 }, flavor: 'Clean floors and cold corridors. Something heavy was dragged across them.' });
add({ id: 'aud', name: 'Auditorium', zone: 'core', kind: 'hall', group: true, rich: [4, 7], risk: 3, loot: { cloth: 3, wood: 3, parts: 2, water: 1 }, flavor: 'Stage curtains. A thousand empty seats and a few full ones.' });
add({ id: 'clinic', name: 'School Clinic', zone: 'core', kind: 'clinic', group: true, rich: [4, 8], risk: 4, loot: { meds: 5, bandage: 4, cloth: 1, water: 1 }, flavor: 'Bloodstains that are not fresh. Bloodstains that are.' });
add({ id: 'chapel', name: 'The Chapel', zone: 'core', kind: 'chapel', group: true, rich: [4, 7], risk: 1, loot: { cloth: 4, water: 2, food: 2, meds: 1, wood: 1 }, flavor: 'Candles burnt to nubs. People asleep in the pews. Someone is still praying, very quietly.' });
add({ id: 'elib', name: 'E-Library', zone: 'core', kind: 'library', group: true, rich: [4, 7], risk: 2, loot: { parts: 3.5, wood: 2, cloth: 1, water: 1, food: 0.6 }, flavor: 'Rows of dead screens. The server room hums with nothing. Someone has been sleeping under the desks.' });
add({ id: 'newcaf', name: 'New Cafeteria', zone: 'core', kind: 'cafe', group: true, rich: [7, 11], risk: 4, loot: { food: 9, water: 5, wood: 1, parts: 1, ogogoro: 0.3 }, flavor: 'The biggest hall on campus. Everyone knows there is food here. That is the problem.' });
/* Sports */
add({ id: 'basket', name: 'Basketball Court', zone: 'sports', kind: 'field', rich: [3, 5], risk: 3, loot: { water: 2, wood: 1.5, club: 0.5, cloth: 0.6 }, flavor: 'Open ground. A hoop with no net. You feel watched.' });
add({ id: 'volley', name: 'Volleyball Court', zone: 'sports', kind: 'field', rich: [3, 5], risk: 3, loot: { water: 2, wood: 1.5, cloth: 1, club: 0.3 }, flavor: 'Sand blown across the lines. The net has been used for something else.' });
add({ id: 'football', name: 'Football Field', zone: 'sports', kind: 'field', group: true, rich: [4, 7], risk: 4, loot: { water: 2, wood: 2.5, club: 0.6, parts: 1, machete: 0.2 }, flavor: 'The widest, emptiest place on campus. Floodlights dead. Sightlines everywhere.' });
/* Gate */
add({ id: 'gate', name: 'School Gate', zone: 'gate', kind: 'gate', rich: [4, 8], risk: 5, loot: { food: 2, pistol: 1.2, machete: 1, meds: 1, parts: 1.2, bandage: 0.6 }, flavor: 'Where it started. Tyre marks. A burnt vehicle. The air is wrong here.' });

/* floors and layout: four storeys only for the very largest buildings; halls are single rooms; cafeterias are small, except the New Cafeteria */
LOCS.forEach((l) => {
  let f = 2, plan = 'corridor';
  if (/^bh[A-Q]$/.test(l.id)) { f = 2; }
  else if (/^bh[RS]$/.test(l.id)) { f = 3; }
  else if (l.id === 'bhT') { f = 4; }
  else if (l.kind === 'hostel' && /New Pa-Etos/.test(l.name)) { f = 4; }
  else if (l.kind === 'hostel' && /Pa-Etos|CICL|Kelson/.test(l.name)) { f = 3; }
  else if (l.kind === 'hostel') { f = 2; }
  else if (/^bc\d$/.test(l.id) || l.id === 'ase') { f = 1; plan = 'cafsmall'; }
  else if (l.id === 'newcaf') { f = 1; plan = 'bigcaf'; }
  else if (l.id === 'chapel') { f = 1; plan = 'chapel'; }
  else if (l.id === 'theatre' || l.id === 'aud') { f = 1; plan = 'hall'; }
  else if (l.id === 'mph') { f = 2; plan = 'hall'; }
  else if (/^cb[A-D]$/.test(l.id)) { f = 3; plan = 'lecture'; }
  else if (l.id === 'senate') { f = 3; plan = 'office'; }
  else if (l.kind === 'admin' || l.kind === 'misc') { f = 2; plan = 'office'; }
  else if (l.kind === 'field') { f = 0; plan = l.id === 'basket' ? 'courtB' : l.id === 'volley' ? 'courtV' : 'courtF'; }
  else if (l.id === 'gate') { f = 1; plan = 'gate'; }
  else if (l.id === 'clinic') { f = 1; plan = 'clinic'; }
  else if (l.kind === 'clinic') { f = 2; plan = 'clinic'; }
  else if (l.kind === 'library') { f = 2; plan = 'library'; }
  else if (l.kind === 'class') { f = 2; plan = 'lecture'; }
  l.floors = f; l.plan = plan;
  if (l.kind === 'cafe') l.loot.knife = (l.loot.knife || 0) + 0.7;
  if (l.id === 'gate') l.loot.bullets = 2.4; else if (['senate', 'aud', 'bhR', 'bhS', 'bhT'].includes(l.id)) l.loot.bullets = 0.7; else if (l.kind === 'hostel') l.loot.knife = (l.loot.knife || 0) + 0.25;
});
const BY = Object.fromEntries(LOCS.map((l) => [l.id, l]));
const hostels = () => LOCS.filter((l) => l.kind === 'hostel');
const travel = (fromId, toId) => DIST[BY[fromId].zone][BY[toId].zone];

/* The world beyond the wall is never visited. It reaches you as news, rumour, and radio. */
const NEWS = [
  'Reports say the roads into Bwari remain blocked by armed groups. Residents are urged to stay indoors.',
  'Security officials say a clearance operation is under way on the outskirts. No timeline was given.',
  'Prices of garri, rice and water have tripled in nearby communities. Some markets are shut.',
  'The FCT administration says it is aware of the situation at the campus and that efforts are being coordinated.',
  'Unconfirmed reports describe a convoy moving along the Abuja road. Nobody has confirmed whose it is.',
  'A helicopter was reported over the area at dusk. It did not land.',
  'A bandit leader is said to have been killed. Officials have not confirmed the claim.',
  'The electricity company says supply to the area will not be restored soon.',
  'Families are asked to wait for official identification after bodies were found along the access road.',
  'Telecom providers say networks in the area are down. Calls to the campus are not connecting.',
  'Churches and mosques in nearby towns are sheltering displaced families. They say they are running out of food.',
  'A statement from the university management said all staff and students should remain where they are.',
  'Residents of nearby villages say they heard heavy gunfire through the night.',
  'Aid agencies say they cannot reach the area while the roads remain unsafe.'
];

C.Campus = { ZONES, DIST, LOCS, BY, hostels, travel, NEWS };
if (typeof module !== 'undefined') module.exports = C.Campus;
})(typeof window !== 'undefined' ? window : globalThis);
