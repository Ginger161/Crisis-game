# CRISIS — World & Visual Bible (draft 2)

*A work of fiction. Every character, group and event is invented. The setting borrows the name, layout and look of a real university; nothing here depicts real people or real incidents. The in-game disclaimer must stay.*

---

## 1. Visual direction

**Style:** animated pixel art built from SVG rectangles. People are drawn from the side so they stand on floors, sit on chairs, kneel, lie on beds and bleed on tiles. A front-facing set is used for portraits.

**Palette** (set by the designer; defined in `scenes.js` and `style.css`)

| Token | Hex | Use |
|---|---|---|
| Building orange | `#f6b37f` | Roof bands, pillars, lower walls |
| Building cream | `#f2ebcf` | Walls, UI text |
| Crest | from the real logo | Pixel version in `emblem.js` (green shield, white lettering, blue field, dove, open book, ribbon) |
| Night | `#0c1124` | Sky, shadow |
| Amber | `#ffd070` | Candles, torches, lit windows |

**The crest.** The logo on the university website is a green shield with white "VERITAS" and "UNIVERSITY" lettering, "ABUJA" at the base, a blue inner field with a white dove, light rays, an open book, and a ribbon reading "Seeking the Truth". It has blue inside, not only green and white. The game uses a pixel conversion of it (`emblem.js`). Replace it if you get permission issues or an official pixel version.

**Lighting rules**
1. Rooms are dark. Light comes from small flickering sources: candle, torch, stove, fire barrel.
2. A night layer dims everything. Glows are added on top.
3. Strong vignette. The edges always fall into black.
4. Bandits are the darkest figures on screen.

**Weather and season (per run):** harmattan haze and cold nights, or rainy-season storms and mud. Changes risk and supply.

---

## 2. People

**Engines:** `sprites.js` (front view, portraits), `side.js` (side view, skeleton rig, all poses). Same character spec drives both.

**Side-view poses:** stand, idle, walk, run, sneak, limp, sit on a chair, sit on the floor, kneel and pray, sleep, jump, aim (with muzzle flash), dead.

**Body states (can combine):** healthy, hungry, starving, tired, sick, hurt, broken, dead.
- **Hungry:** slightly gaunt, eye bags, hand held to the stomach.
- **Starving:** grey-yellow skin, hollow cheeks, visible ribs, thin limbs, stooped, trembling.
- **Sick:** green tint, sweat.
- **Hurt:** bandages, blood patches, dripping.
- **Dead:** X-shaped eyes, tongue out, mouth open, pale skin, blood pool, wounds (three gore types), flies. Child figures are shown covered with a cloth instead of wounded.

**Roster (45 types)**

| Group | Types |
|---|---|
| Students (boys) | Gym boy, Bookworm, Hustler, Fellowship boy, Law student, Hoodie boy |
| Students (girls) | Hijabi student, Braids girl, Natural hair girl, Fashionista, Nursing student, Church girl |
| Children | Boy, Girl, Staff kid in school uniform |
| Staff & clergy | Senior lecturer (male), Lecturer (female), Professor in agbada, Professor in iro & buba, Lab technician (male and female), Priest, Sister, Security guard, Hostel porter, Cafeteria woman, Cleaner, Clinic nurse |
| Family | Father, Mother, Grandmother, Grandfather |
| Bandits | Foot soldier, Motorbike scout, Commander, Heavy, Young conscript, Informant, Raider (woman), Kingpin |
| Others | Soldier (rescue), Hunter / vigilante, Scavenger, Refugee, Trader |

Bandits are dangerous because they are organised and armed, not because of how they look. Never tie them to an ethnic or religious group. Keep one or two of them human.

---

## 3. The campus

The player's shelter is one of the hostels, chosen at random each run. Buildings are grouped into **zones**. Walking between zones costs night-hours, so a far building leaves less time to search. Distances are in `campus.js` (`DIST`) and can be edited.

| Zone | Buildings | Walk from Boys A–Q |
|---|---|---|
| **Boys' Side (A–Q)** | Boys' Hostels A–Q (17), Boys' Cafeterias 1–8 | 0 h |
| **Premium Hostels** | Boys' Hostels R, S, T (very close together, opposite side of the school) | 2 h |
| **Girls' Hostels** | Pa-Etos, New Pa-Etos, CICL, Stanzel, Old Kelson, New Kelson | 2 h |
| **Academic Core** | Class Blocks A–D, New Theatre, Post Graduate Building, MPH, Ase Caf (under the MPH), Law Faculty, Senate Building, Pharmacy, Medical Building, New Medical Building, Auditorium, School Clinic, Chapel, E-Library, New Cafeteria | 1 h |
| **Sports Grounds** | Basketball Court, Volleyball Court, Football Field | 1 h |
| **School Gate** | School Gate | 2 h |
| **Outside the wall** | Never visited. It reaches you only as news, rumour and radio. | — |

### Building notes (look, loot, danger)
- **Boys' Hostels A–Q:** long corridors, closed doors with names taped on, laundry lines. Food, water, medicine, ogogoro. Many hold groups of survivors, so these are the main place to trade, steal or be robbed.
- **Boys' Cafeterias 1–8:** plastic chairs, cold counters, smell of oil and old stew. Mostly food. Eight small kitchens, so food is spread thin.
- **Hostels R, S, T (premium):** private rooms, generators, real locks. Better loot (parts, medicine, sometimes a pistol), but people here are richer and better armed. Groups here lean hostile.
- **Girls' Hostels (6):** fairy lights in windows, perfume and damp, whispered prayer. Food, cloth, bandages. Rich in groups that can be allies or enemies.
- **Class Blocks A–D:** desks, boards, ceiling fans. Wood, scrap, little else.
- **New Theatre, Auditorium:** tiered seats, curtains, echoes. Cloth, wood, scrap. Auditorium may house a group.
- **Post Graduate Building:** labs and offices. Scrap, a little food and medicine.
- **MPH and Ase Caf:** a huge hall full of sleeping bodies, and a kitchen under it. Water, cloth and food. Strong chance of a large group.
- **Law Faculty:** moot court, gowns on hooks. Wood and scrap.
- **Senate Building:** marble, portraits, once a bandit command post. Scrap, food, a chance of a pistol.
- **Pharmacy, Medical, New Medical, School Clinic:** the medicine buildings. Risk rises with each: the New Medical Building and the Clinic are the most dangerous because everyone wants them.
- **The Chapel:** stained glass glowing dark blue and amber, an altar, candles, a green-and-white banner, people asleep in the pews. The safest building on campus, and the hardest place to steal from. Low risk, a congregation that has rules, and a price for breaking them.
- **E-Library:** rows of dead screens, shelves, a humming server rack, people sleeping under the desks. Scrap and wiring from the computers, wood from the desks. Quiet and low risk, but cramped, so noise carries.
- **New Cafeteria:** much bigger than the boys' cafeterias. The biggest food source on campus and the most contested place. Everyone knows. Expect a large camp.
- **Basketball, Volleyball, Football:** open ground, dead floodlights, sightlines for snipers. Water, wood, clubs.
- **School Gate:** where it began. A burnt vehicle, tyre marks, razor wire. Weapons and little else. Extreme danger.

### The outside world (news)
You never go out. News arrives on the radio (if you build one) or on a dying phone. It can be hopeful, false or grim. Roads blocked, a convoy rumour, prices tripling, bodies on the access road. Used to hint at rescue and to colour every day.

---

## 4. Open questions
1. Which hostel types should be premium, and should the player ever choose their shelter?
2. How many days should a run last? Currently rescue arrives on a random day between 22 and 34.
