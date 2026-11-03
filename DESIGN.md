# CRISIS — Design v3 ("Like TWoM")

*Status: DRAFT for approval. v2 is kept in `bk3/DESIGN.v2.md`. Anything not changed here stays as v2 says (needs, stations, builds, groups, tester readiness).*

**The goal:** it should feel and play like This War of Mine, set at Veritas University during the siege. Portrait-first mobile game.

---

## 0. The feel (the user's top priority, applies to every phase)
Realism, attention to detail, respect for the environment, and randomness that feels like life, the way TWoM does it. Rules:
1. **Everything is where it would really be, and has a reason.** Meds in the dispensary, notes on the staff-room desk, a mattress dragged against a door by whoever hid here before. No random loot sprinkled for its own sake.
2. **Places tell what happened before you came.** Readable traces (notes, timetables, graffiti with dates, a birthday card, crossed-out names on a ward whiteboard, a blood trail to a body), free to look at.
3. **The world remembers.** What you did stays done, and has consequences days later: the woman you took the meds from is dead in that bed next time; other scavengers strip places between your visits; people talk about what you did.
4. **Randomness comes from situations, not dice.** Events grow out of state (hunger, cold, grief, who is awake, what was said yesterday), never repeat back-to-back, and are small and ordinary more often than dramatic.
5. **Bodies and time are real.** Wounds take days and show (bandages, limping), people get thinner and dirtier, sickness has symptoms, tiredness slows hands.
6. **The environment is alive.** Weather and time of day change how things look and sound (rain through a broken window, Harmattan haze, dogs at night, distant gunfire, the dawn call to prayer).
7. **Felt, not explained.** All of this is shown, never described in UI text.

## 0b. Beyond TWoM (all seven adopted by the user; deeper, not wider)
1. **The campus lives without you.** The 14 groups scavenge, trade, starve, fight and move on their own. You see only evidence: emptied piles with fresh boot prints, new barricades, a settlement gone silent and burned.
2. **Who knows what happened.** Only the runner knows what they did. In the morning you choose: tell the truth, soften it, or say nothing. A lie protects morale now; a witness, a rumour or a returning stranger can expose it later and break trust.
3. **People remember specifics.** They bring up the actual soldier, the actual night, who refused to go out. Grudges and debts form inside the household and change who comforts whom.
4. **Strangers come back.** People you spared, fed, robbed or abandoned reappear days later, at your door or in another group.
5. **The hideout becomes a record.** Empty bunks keep the dead person's things, photos go on the tally wall, graves in the yard that people visit, worn and patched furniture.
6. **Real days in the calendar.** Sundays, Jummah, Ramadan or Christmas inside the siege, the exam that never happens, someone's birthday.
7. **Morals in context.** What you did, to whom, who saw, and who you are (Devout, Hardened, once had nothing) all change the weight.

Lines not to cross: no reflex/skill combat, no crafting or upgrade sprawl, no meters or notifications, politics stays background, no breadth at the cost of detail, no randomness without a situation.

## 0c. Dread (graphics and horror; all six adopted)
1. **Readable darkness, not black.** Cold moonlight ambient: everything visible as desaturated silhouettes, movement always readable. The torch adds colour, detail and warmth where it points, flickers, and makes you easier to see; sneaking cups the torch (smaller, dimmer). Light sources tell stories and warn: moon shafts through windows, fires, a patrol's torch visible from far off. Lightning flashes on rain nights.
2. **Aftermath everywhere and specific.** Blood spray by bullet holes, drag marks, handprints, growing pools; bodies decay over days in place (fresh, flies, bloated, dogs, bones); execution walls, burned rooms, mass graves; bandit warnings in blood; **torture by bandits shown** (their signature): bound victims, the room it happened in, the tools left behind.
3. **Violence on screen.** Blood bursts, crawling wounded, bodies keep their fall pose, screen shake on gunshots, red edge pulse when hurt.
4. **Your people's bodies.** Bloody bandages, limps, thinner, dirtier, shaking, tear tracks.
5. **Atmosphere.** Dust in the beam, smoke, embers, burning buildings on the skyline, muzzle flashes far off, crows, rats, dogs, grain and vignette, colour grading by situation.
6. **Sound.** Wind, dripping, flies near bodies, dogs, distant gunfire, footsteps on the floor above, heartbeat when a patrol is close.

7. **Your death, if they catch you.** When the controlled runner is caught and killed, the end of that run shows what the bandits did: torture, maiming, the shouting for help nobody answers. Shown once, at the death screen, not dwelt on in play.

Lines kept: children are never shown harmed; sexual violence and suicide are implied, never shown. Performance: lighting and particles as one cheap layer, tested at 4x CPU throttle.

## 1. The loop (one day)

```
DAY (real time, in the house)                NIGHT (20:00 → 05:00)
 people live on their own                    1. Night roles screen
 you steer: build, craft, cook, talk,           each person: Bed · Floor · Guard · Go out
   comfort, trade at the door                2. The run (you play one runner)
 visitors knock, the radio talks                + one more may be SENT (runs on its own)
 emergency day trip possible                 3. Home by 05:00, no exceptions
                                             4. Morning report: one card, the whole night
```

Everything in the game hangs off this loop. Nothing interrupts it except a knock or a raid.

## 2. Time: one clock
- **One clock everywhere.** The house clock keeps running while someone is out, so the house and the run share the same minutes. No "searches left" counter.
- Night run: leave 20:00 or later, **back by 05:00 (hard deadline).** At 05:00 you are walked home automatically with whatever you carry. Travel time to the site is taken off the night.
- Searching a pile, opening a lock and clearing rubble each take visible clock time.
- **Day trips:** allowed, near-suicidal. Patrols everywhere, a sniper lane outside, no proper searching (one quick grab at most). For emergencies only (medicine for someone dying).

## 3. The night roles screen (new)
One card per person, four choices: **Bed** (best rest, needs a bunk), **Floor** (poor rest), **Guard** (needs to be awake; weapon helps), **Go out**.
- **Go out**: one person you control. Optionally **one more** sent on their own to a site you pick; they come back in the morning report (or don't).
- Guards and bed count decide raid outcomes. Shown as plain odds pips, never as numbers in text.

## 4. The run (rebuilt)
**Sites are authored templates, not random corridors.** About 8 to start, mapped onto the campus (hostel floors, a small caf, the New Caf hall, the clinic, Senate, the theatre, a class block, the gate). Each has:
- Large rooms like the hideout (people small, rooms rich), real walls and doorways, 1–4 floors as the campus spec says.
- **Residents or threats with a story** and one hard choice (the scared freshers with food, the sick lecturer with the meds, soldiers at the gate).
- **Loot piles** that show their contents. You pick into your bag; the bag strip shows what's left.
- **Locked doors / cabinets** (crowbar, lockpick) and **rubble** (shovel). Tools open more of every site.
- **Depletion:** what you take stays taken; sites run dry over the weeks, so you go further.

**Danger is physical only.** No dice rolls while searching. A threat is a person standing in the level: you can hear them (noise markers), see their torch, peek through a door, hide, sneak past, backstab (with a knife), or get seen. Walls block sight. Getting seen starts the danger wheel (stats only, visible odds, options locked without the tool).

**Bag size per person** (from traits): 8 to 14 slots. Who you send matters.

## 5. The morning report (new)
One card at 06:00: who came back and with what, who was hurt, what was stolen in a raid, who is sick, and one line from the diary. Then the day starts.

## 6. People: consequences
Mood ladder, visible on the person: **Okay → Sad → Depressed → Broken.**
- Bad deeds (stealing from the helpless, killing, abandoning) push the doer and the others who hear about it down the ladder. Good deeds lift it.
- **Comfort** (talk to someone), a cooked meal, the radio, prayer, a guitar or books lift it.
- **Broken:** refuses orders, may walk out in the night, very rarely joins the bandits. Suicide is only implied, never shown.
- **Diary:** each person writes short first-person lines about what happened (Journal tab). Others react out loud when the runner comes home ("You took it from them?").

## 7. The house: progression
- The game **starts with the hideout cluttered**: junk piles to sort (free materials) and a blocked room or two (needs a shovel). The first hour teaches the game with no tutorial text.
- Builds as v2, plus **production for trade**: ogogoro (still), cigarettes/tobacco (garden), charcoal. These are the currency at the door.
- **Holes** in the house: raids come through weak spots; boarding them up is visible defence.

## 8. The arc (30–45 days)
- Rescue day is hidden (random, 30–45). The player only hears **radio rumours and gossip from other groups**, sometimes wrong or contradicting each other.
- Things get worse in announced phases (dates vary per run):
  1. **Shortages** (around day 8–12): prices at the door rise, water gets scarce.
  2. **Gangs move in** (around day 15–22): raids more frequent, some groups turn predatory.
  3. **Sickness** (around day 24+): cholera or fever spreads; medicine is the currency.
- Season (Harmattan / Rains) as v2.
- **Ending:** a per-person epilogue (as now), shaped by the diary and the deeds.

## 9. Screens and UI
- **Portrait is the default. Landscape only rearranges the layout**: same information, same controls, no exclusive content.
- **First launch:** a bold card says you can turn the phone to landscape or stay in portrait for a different view. Shown at the start only.
- Screens: Title · House · Night roles · Run · Morning report · Sheets/Wheels · End. Nothing else.
- **One visual language** for every sheet, wheel and scene. No instruction paragraphs; mechanics are felt (rule from the user).
- House: status shows on the people in the scene; the roster is compact. Run: the scene takes the space; bag strip at the bottom; the loot grid only appears when a pile is opened.
- Rules kept: ≥44px tap targets, ≥12px text, no page scroll, one speech bubble at a time, "Grace (you) to Tunde" labels.

## 10. Code plan
- **Keep:** `sim.js`, `house.js`, `side.js`, `sprites.js`, all content files (`cast`, `groups`, `politics`, `story`, `storylets`, `life`, `lore`, `campus`), `wheel.js`, `icons.js`, `audio.js`, `voice.js`, the device lab.
- **Rewrite:** `game.js` → small modules (clock/state, night, run, danger, mood, screens). `expedition.js` → site templates + loot piles + tools + physical danger.
- **Retire:** old night screen, `renderDayOld`, `encounter0`, `dawn` (keep one dawn), `cutaway.js`, `bot2.js`, the `?dbg` hook.
- **Saves:** versioned; an old save offers "start fresh" instead of loading broken.

## 11. Build phases (each ends playable and passes the device lab)
1. **Core:** one clock, night roles screen, 05:00 deadline, morning report, one dawn, one danger system, versioned saves.
2. **Run v2:** site templates, large rooms, loot piles, bag sizes, physical danger only, depletion.
3. **Tools:** crowbar / lockpick / shovel, locked doors and rubble at sites and in the house.
4. **People:** mood ladder, comfort, refusals, diary, reactions.
5. **House progression:** clutter start, production and trade, holes.
6. **Arc:** rumours, three phases, epilogues.
7. **UI shell pass:** portrait/landscape layouts, first-launch rotate card, one visual language, cleanup.

## Phase 7 rules from the user (2026-11-03)
- No scrollbars anywhere in the app. Pages and sheets do not scroll; the only things that scroll are lists (and they scroll without a visible bar).
- Outside the torch, a night run is very dim, almost dark: silhouettes only.
