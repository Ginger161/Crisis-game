# CRISIS — Design (v2: "The House")

*Direction chosen: a TWoM-style shelter sim (A) with the campus as a node map and the 14 groups as an important but secondary layer (E). Time is visible. People act on their own.*

## 1. What it should feel like
You are the commander of one hostel and the 4–6 people in it. The game is **the house**: you watch people live in it, and you steer. The things that must land:
1. **A person doing something unprompted** (cooking because the pot is low, praying, comforting someone, stealing a meal at 3 a.m.).
2. **The dread of the night** (dark, quiet, a guard at the window, a sound).
3. **Relationships** that change what people do.
4. **Resourcefulness**: crafting and building your way out of scarcity.
5. **Life**: random occurrences that happen *in the house, at a time of day*, not in a pop-up.

Not the core: politics. The groups matter as visitors, traders, threats and consequences.

## 2. Time (visible, and the spine of everything)
- A clock (HH:MM) and a day counter are always on screen. The game starts **Day 1, 08:00**.
- Real-time with pause. Speeds: **⏸ 0, ▶ 1× = 6 game-min per second, ▶▶ 2× = 12, ▶▶▶ 4× = 30.** A day is 4 minutes at 1×, 2 minutes at 2×.
- **Sheet open = paused.** Any decision pauses the world. Orders can be given while paused.
- Phases: dawn 05:30–07:00, day 07:00–18:00, dusk 18:00–20:00, night 20:00–05:30.
- Every action takes time and shows a progress bar at its station. There is no "2 tasks per day".
- **Rescue:** a hidden day inside a announced 5-day window (as now).

## 3. The house
A hostel cross-section, **3–6 floors** (random per run), drawn zoomed out. Each floor is 200 wide with a stairwell in the middle. Characters are small (about 40% of floor height) and walk, climb stairs, sit, kneel and sleep.

| Floor | Stations |
|---|---|
| **0 Ground** | Door (barricade), Cupboard (group store), Workbench, Table (eating), Stove, Water store |
| **1** | Bunks (sleeping), Prayer mat, Infirmary bed (buildable) |
| **2…top-1** | Extra bunks, Garden (buildable), Upper barricade (buildable) |
| **Top** | Look-out post (watch), Radio, Tally wall (days; the author's note) |

Ground floor is where life and risk meet; the top is where you see danger coming.

## 4. People (autonomy)
Each person has: **hunger, thirst, fatigue, warmth, health, mood**, a **trait** (skill), a **relationship** with each other person, and a **current action** shown above their head.

Rates per game-minute (balanced by the bots):
| Need | Change | Notes |
|---|---|---|
| Hunger | +0.028 (≈ +40/day) | cooked meal −50, raw food −20 |
| Thirst | +0.025 (≈ +36/day) | water −45 |
| Fatigue | +0.075 awake, −0.25 asleep | |
| Warmth | night in Harmattan −0.04, with blanket/fire less | cold → sickness |

**Decision rule** (when idle; re-evaluated every minute; first match wins):
1. **Emergency**: health < 20 → to a bed, rest.
2. **Eat**: hunger ≥ 55 → fetch a meal from the cupboard and eat at the table (10 min). Raw food only if hunger ≥ 80.
3. **Drink**: thirst ≥ 50 → drink (3 min).
4. **Sleep**: fatigue ≥ 85, or night and not on watch and fatigue ≥ 40 → bunk until fatigue < 15 or 06:00.
5. **Watch**: on the schedule → go to the post (or door) and stand watch.
6. **Orders**: take the next job the player gave them.
7. **Auto-work** (default on): the most pressing job they are good at (cook if meals are low, fetch water, repair, craft bandages if none).
8. **Life**: chat with a nearby idle person, pray, write, exercise, tinker, sit. Each of these is a small mood and relationship effect with a bubble line in their own voice.

**Unprompted events** the simulation raises by itself: arguments over food, someone sharing a meal, comforting a crying person, theft at night when starving and trust is low, a nightmare, a prayer circle, a person refusing an order when mood < 25, and a person quietly leaving or turning (existing rare rules).

## 5. Orders (the controls)
- **Tap a person** → select. **Tap a station** → a small sheet of jobs available there; choose one and the selected person walks over and does it. **Tap the floor/stairs** → walk.
- **Group tab**: each person's needs, current action, order queue, **night watch shift (Early 20:00–01:00, Late 01:00–05:30, or Sleep)**, and an **Auto** switch.
- **Items tab**: cupboard, packs, eat/use, crafting list, building list.
- **Bottom row:** Group · Items · World · Journal · Door (go out). Time controls sit in the header.

## 6. Resources, building, crafting
Cupboard 40 slots (+25 upgrade), packs 6 each. Consumption for four people ≈ 4.4 food/day cooked-equivalent and 3.6 water/day, which is deliberately more than the starting stock lasts, so expeditions and growing food are required.

**Build** (a person walks to the site; progress bar; strong builders faster):
| Build | Cost | Time |
|---|---|---|
| Stove | 3 wood, 2 scrap | 2 h |
| Workbench | 3 wood, 1 scrap | 1.5 h |
| Barricade L1 / L2 / L3 | 4 wood+1 scrap / 6+2 / 8+3 | 1.5 / 2.5 / 4 h |
| Bunk | 3 wood, 3 cloth | 2 h |
| Rain catcher | 2 scrap, 2 cloth | 1.5 h |
| Water filter | 3 scrap, 2 cloth | 2 h |
| Rooftop garden | 4 wood, 2 cloth, 2 food (seed) | 3 h → first harvest after 6 days |
| Radio | 4 scrap | 3 h |
| Alarm line (tin cans) | 2 scrap | 1 h |
| Blackout curtains | 4 cloth | 1.5 h |
| Infirmary bed | 3 wood, 3 cloth | 2 h |
| Bigger cupboard | 4 wood, 1 scrap | 2 h |
| Still | 3 scrap, 2 wood | 2.5 h |

**Craft** (at the workbench): bandage (2 cloth, 15 min), club (2 wood, 30 min), machete (2 scrap + 1 wood, 1 h), candle stub (1 cloth, 10 min), cook a pot at the stove (up to 4 food + 1 wood → 4 meals, 40 min).

## 7. Night, threats, attention
- **Attention** (0–100) is how much the campus notices you. It rises with **light** (lit candle/stove at night, no blackout), **noise** (fights, building at night, crying, alarms) and falls in the dark and quiet. Raid chance per night grows with attention and day number.
- **The watch** is what makes night playable. A person at the post sees things coming ~30 minutes early. They can raise the alarm, and you can choose: **lights out and silence**, **reinforce**, **fight**, **pay**, **parley**. Nobody awake → you find out at the door.
- **Knocks** happen at the door at any hour (already built), with who-answers.
- **Raids** resolve with the existing defence rules, but now guard schedule, barricade level, alarm line and weapons all visibly matter.

## 8. Weather, season, health
- Each run picks a **season**: **Harmattan** (dry, cold nights, no rain, dust, colds) or **Rains** (storms, mud, fever risk, rain catcher works). It changes water, warmth and sickness.
- **Illness**: fever (bad water, mosquitoes), stomach (raw food), cold (no warmth). Spreads between people who share a room; an infirmary bed isolates. Medicine cures; rest helps.
- **Injury**: wounds bleed until bandaged.

## 9. Going out (the campus)
The door opens **Go out**: pick a person, their pack/weapon, and a destination on the **campus map** (zones and buildings, with travel time and a rumour of danger). The existing controlled run plays (walk, search, hide, sneak, patrols). The house keeps living while they are away: elapsed time is simulated for everyone else on return, and events that happened are reported.

## 10. The 14 groups
Run as now (trade, raids, pacts, wars, gist, favours, nemesis, turning), but they **reach you through the door and the radio**, and their effect shows up as visitors, offers, threats and news. There is no required micromanagement of them.

## 11. Escalation (the arc)
- Days 1–6: learn the house, stock thin. Days 7–14: cold/rain, first sickness, first raid, groups start to move. Days 15+: stores of loot run low, groups starve, desperation. The rescue window closes the arc.
- Locations deplete and refill slowly; the nearest ones go first.

## 12. Tester readiness (non-negotiable)
1. **No dead ends.** Every modal chain has a way out. A watchdog detects "no input possible" and offers recovery.
2. **Error boundaries** around the simulation tick and every screen; failures are shown, logged and survivable.
3. **Versioned saves** (v2), three rotating autosaves, load validates and falls back; Export/Import.
4. **Report a problem**: copies a compact JSON (version, day, clock, last 30 log lines, last errors, party state) to the clipboard.
5. **Seeded, headless simulation** with 1,000+ runs per build: invariants (no NaN, no negative stock, nobody in two places, nobody stuck > 12 h, every order resolves), balance targets, content fuzzing (every story card with every cast combination renders without "undefined").
6. **Browser tests** of every screen and flow at phone size; screenshot review.
7. **Performance**: simulation steps are cheap; drawing only updates changed actors; target 60 fps on a mid phone.
8. A written **QA checklist** for human testers and a feedback form template.

## 13. Build order
1. Clock + needs + autonomy (headless, tested).
2. The house (multi-floor drawing) and actors moving by the simulation.
3. Orders, stations, building and crafting.
4. Night: attention, watch, threats.
5. Expedition integration and time-away simulation.
6. Content hooks (stories fire in the house, at times).
7. Hardening, QA, tester package.
