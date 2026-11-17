# Crisis: groups and diplomacy

Status: DRAFT 2. Nothing built. Numbers marked *(hidden)* are for the sim only; the player never sees them.

**Decided by the user:** only individuals join or leave (no merges) · allies give one fixed lasting perk each · natures vary per game · no meters, standing is shown through behaviour and words · politics is a real path, but ignoring it never makes things worse · six major groups (Kitchen, Gate Boys, Chapel, Medical, Hustlers, Council-and-Union) are always in play, plus six of the seven minor groups each game · when one of the 14 main characters is in your house, their old group has scenes about it.

**Decided by me (question 3):** each group keeps two memories of you, **respect** (standing) and **fear**. Reason: it lets the Gate Boys deal with you because they fear you, lets the Pitch Boys come to test you because they fear you, and lets the Chapel pull away from you because you frighten them, all without showing a second meter. The player only ever sees the result.

**Decided by the user (round 3):** any met group can send envoys (resources, alliance, pleas, and more), paced by the door budget in 1.20 · the Theatre takeover happens every game, but the challenger varies (1.21) · people leaving you drift away over several days first (1.14) · the tone is very dark and stays that way (Part 0).

## Part 0. Tone and what is shown on screen (standing rules)
- **The tone is very dark.** Outcomes are not softened. People are beaten, hanged, shot, left in drains, and the game says so plainly. Nothing is gratuitous for its own sake, but nothing is looked away from either.
- **If it happens to someone on screen, it is shown on screen, and also on the card.** Anyone in the house or yard when something happens to them gets a visible change: a pose, a prop, a movement, a sound. Examples: an envoy waits in the yard; a nurse kneels by the injured person; the Kitchen's pot is left on the step; an ally's mark is painted on the door while you watch; a person drifting away sits apart, facing the wall; a joiner walks in with their bundle; a body is brought back to the door in a wheelbarrow.
- **If it happens off screen, only the card (and rumours) tell it.** Runs, other groups' places, the Theatre takeover, a collapse across campus: cards, rumours, the radio, and what your people say.

This builds on what is already in `politics.js` (opinion per group, pacts, ledger, envoys, zones, rumours, raids between groups) and on the secrets already written for the 52 group members in `groups.js`. Most story turns below come straight from those secrets.

---

## Part 1. The rules

### 1.1 Meeting a group
- At the start every group is a **Stranger** and is not in your list.
- You **meet** a group when: your runner scavenges a place they hold, their envoy comes to your door, or one of your people already belongs to them (that group starts met and warm, as the code does now: +14 per member of theirs in your house).
- Strangers never raid you and never send demands. The one exception is the Gate Boys, whose first contact is a toll at your door (see their sheet).
- A stranger group that has **heard of you** (you scavenged near their place, or one of their friends knows you) may send an envoy to introduce themselves, plead for help, or offer a trade. That envoy is how you meet them.
- Doing nothing: groups you never visit stay strangers or wary, and the world goes on without you. You lose the perks, nothing else.

### 1.2 Standing: six stages, in words
Standing *(hidden)* runs from −100 to +100.

| Stage | *(hidden)* | What you see |
|---|---|---|
| Strangers | not met | Not in your list. Their people on runs watch you and keep their distance. |
| Wary | −14 to +14 | Guards stop your runner and ask what you want. Trades at 1.5× price. No loans, no favours. Envoys rare (only for business). |
| On good terms | +15 to +39 | Your runner is waved in by name. Fair prices. They lend small amounts, share news, and send word when raiders are near them. |
| Allies | +40 and an alliance promise (1.8) | Their mark is painted on your door. Their perk is on. They answer calls for help, and they call on you. |
| Hostile | −15 to −44 | Runners turned away at their ground. Prices 2×. Their people insult yours on runs. Groups whose nature allows it may raid. |
| Enemies | −45 or less | No trade at all. Runners in their ground are chased or caught. Raids if their nature allows. They tell stories about you to others. |

- **No flicker:** a stage changes only when standing passes the line by 5 *(hidden)*. Every change shows once in the world: the envoy says it, or your runner notices (a guard who used to joke now points a stick).
- **Drift:** standing slowly fades toward Wary when nothing happens *(0.4 a day, as now)*. Allies don't fade while the alliance holds.
- **The group's tile** in the People and Groups screen shows the stage word, their mark, their place, and the leader's face.

### 1.3 Deeds: what moves standing
Standing moves through what you do. A visit's talk only nudges it (±3 at most).

| Deed | *(hidden)* change |
|---|---|
| Fair trade | +1 |
| Gift | +2 per unit of value, at most +12 a day to one group |
| Answered a plea for help | +15 |
| Kept a promise or paid a debt on time | +10 / +8 |
| Sheltered someone they sent to you | +12 |
| Spared one of their people who was at your mercy | +10 |
| Refused a plea | −3 |
| Paid a debt late | −5 for each day late |
| Threatened them | −10 (fear +10) |
| Sided against them in a dispute | −15 |
| Took from a pile marked as theirs | −20 (−30 if your runner was seen) |
| Broke a promise | −25, and −5 with each group friendly to them |
| Hurt one of their people | −30 |
| Killed one of their people | −50, and they hold a grudge (1.5) |

### 1.4 Values: each group judges by its own
Every sheet lists **admires** and **cannot forgive**.
- A deed the group **admires** counts 1.5× to 2×. Example: a gift of food to the MPH Camp raises the Kitchen too (+5), because feeding the weak is what they admire.
- A deed the group **cannot forgive** starts a grudge (1.5), even when it was done to someone else.

### 1.5 Grudges and amends
- A grudge drops standing at once to Hostile (or lower), and standing **cannot rise above Wary** until you make **amends**.
- Each group's sheet names its amends. It is always a specific deed, never a payment button. Examples: return what you took plus a gift; hand over the person who did it; bury their dead.
- Killing a group's leader is a grudge with no amends, except at the Chapel, which always forgives once amends are made.
- What the group remembers shows on their page in their words: *"They say your boy took from our store at Hall 3."*

### 1.6 Fear
Fear *(hidden)* runs from 0 to 100 and fades by 3 a day.
- **Rises:** you beat off their raid (+20), you carry out a threat (+15), you kill one of theirs (+25), you have visible strength (more armed people and a strong barricade, up to +15).
- **Effects depend on the group's nature:** cautious groups stop raiding you and pay tolls instead of demanding them; proud groups (Pitch Boys, Security, Union strongmen) come to test you; gentle groups (Chapel, Medical, Sisterhood) pull away, with fewer envoys and no visits to you.
- Fear and respect together: high respect plus high fear makes the Gate Boys treat you as a partner, and makes the Kitchen nervous but fair.

### 1.7 How they find out (witnesses and gossip)
- **Direct:** a deed done to them, or at their place.
- **Seen:** their people were at the place where it happened (every run location has a chance of a group member being there, shown on the scavenge screen as "seen people from the Kitchen here").
- **Gossip:** over the next 1 to 3 days, the deed spreads at half strength to groups friendly with the victim. The Tech Guild hears everything at full strength.
- **Wrong blame:** when one group raids another and your runner was near that night, there is a chance *(15%)* you get the blame. You can clear your name by: (a) the Tech Guild's perk, (b) the true raider's own people talking (via a visit to them), or (c) a returned item that proves it. Wrong blame is marked on the group page as *"They believe..."*.

### 1.8 Promises: objects in your house
| Promise | Terms | Object | Broken when |
|---|---|---|---|
| Debt (you owe) | Borrow N, return N+2 by a day | Chalk tally on the wall | The day passes unpaid (late paying still possible, at a cost) |
| Debt (they owe) | You lend N, they return N+1 by a day | Chalk tally, other wall | They default. Their honour and nature decide if they pay |
| Truce | Neither side raids or takes from the other, 12 days | A knotted cloth on the door | Either side raids, steals or hurts |
| Trade pact | Fair prices both ways, a trade visit costs no runner, 12 days | A tin with their mark on the shelf | Either side cheats |
| Pledge | You promise something specific by a day ("3 medicine by day 9") | A wrapped bundle by the stairs | The day passes |
| Alliance | Lasting, no end date | Their mark painted on the door | You refuse two calls for help, break any other promise to them, or ally with their sworn rival |

- An alliance is offered **by them** once standing reaches +40. They offer it through their envoy, and you accept or not. You cannot demand one.
- **Calls for help:** an ally under attack asks you for one of your people for a night (with a risk of injury) or a bundle of supplies. Refusing once costs standing; refusing twice ends the alliance.

### 1.9 Sworn rivals
Allying a group drops its sworn rivals to Wary at most, and ends any alliance with them.
- Gate Boys ↔ Sisterhood, Security Remnant, Pitch Boys
- Theatre Council ↔ Student Union
- Terrace ↔ MPH Camp

The Chapel and Medical Wing have no sworn rivals.

### 1.10 Natures: drawn each game, hidden
Each group draws one of its natures at the start. A nature sets: whether they raid, price, how fast they forgive (drift and amends cost), how they treat your weakness, how often envoys come, and how fear affects them. Every nature has **tells** that show in the first days of contact, so an attentive player can work it out.

### 1.11 Contact
- **Visit:** in the night plan, send someone to a group's place instead of scavenging. It is a short trip with lower danger than a run. At their place the runner meets whoever is there. Choices: Trade, Ask, Give, Promise, Threaten, or **Sit and talk** (hear news, learn one thing they remember, and meet one of their members, which counts toward that person trusting you). Who you send matters: someone from that group or with ties there does much better (the existing envoy score).
- **Envoy:** each group has one envoy face, always the same person, who comes to your door by day. Kinds: trade offer, plea, warning, invitation (a burial, a meeting, a hearing), demand (toll, tribute), debt due, asking after one of theirs in your house, a member who wants to join, alliance offer, call for help.
- **At most one diplomatic moment a day:** your planned visit, or one envoy. Pleas and calls for help from allies take priority.

### 1.12 The five verbs and what each opens up by stage
| | Wary | On good terms | Allies | Hostile | Enemies |
|---|---|---|---|---|---|
| **Trade** | 1.5× price | fair | fair, and their piles are open (take up to 3 items a visit, and return the favour) | 2× | none |
| **Ask** | news only | small loan, a warning, an introduction to a member | big loan, help on a build or raid, their perk | nothing | nothing |
| **Give** | gift | gift, lend, send aid to their fight | same | gift, amends | amends only |
| **Promise** | truce | truce, trade pact, pledge | (alliance already) pledge | truce | truce only if they fear you |
| **Threaten** | yes | yes (costs more) | breaks the alliance | yes | yes |

Old menu items that go away as buttons: *incite* becomes something only the Hustlers and Tech Guild sell (spread a story), *betray* is just breaking a promise, *broker peace* is offered when you are On good terms with both sides.

### 1.13 Lasting perks
One fixed perk per group, on while you are Allies. It switches off when standing falls below +25 *(hidden)* or the alliance breaks, and the envoy comes to say so. If the group itself is starving or at war, the perk can skip a turn, and they send word.

### 1.14 People join and leave, one at a time
**Theirs to you**
- **Who:** only someone you have met (on a visit, a run or at your door).
- **When:** their group is starving (two days with no food), is collapsing, they fell out with their leader (a story turn), or they trust you (On good terms or better, plus two meetings or a personal kindness).
- **How:** they come to your door or ask your runner on a visit. At most one request every 4 days, and only if the house has room.
- **Their old group's reaction:** if they left with a blessing (the group is failing, or the leader agreed), nothing changes. If they ran, the group drops −10 and sends its envoy to ask for them back within 3 days. The Gate Boys hunt anyone who leaves them (see their sheet).
- **What they bring:** their role as a skill (a cook cooks better, a nurse heals), one item, their four layers of story, and their old ties.

**Yours to them**
- **Who:** someone in your house with a group (most of the 14 main characters) or close ties to one.
- **When:** low mood for 3 days or more, and their group is On good terms or better with you; or you did a deed their group cannot forgive (Chidera after you rob the dead).
- **Never sudden. They drift for 3 to 6 days first, and you can see it in the house:**
  - *Days 1 to 2, distant:* they eat apart from the others, give short answers, skip the evening talk, sit by the window facing where their old group is. Their idle lines change ("Mm." "I'm fine."). Work goes a little slower.
  - *Days 3 to 4, restless:* they ask to visit their old group; they give a personal thing away to someone in the house; they sleep badly (seen awake at night); a packed bag appears by their mat.
  - *The leaving:* at night. If someone is awake, it is shown: they walk to the door, and the one awake can try to stop them. If not, the morning card: *"Chidera's mat is empty. Her bag is gone."*
  - *Turning it back:* talk to them (easier the earlier you notice), fix the cause (amends to their group, better mood), or let them visit once. Each stage can be reversed; the bag is unpacked on screen.
- **If they leave on good terms:** their group rises +10, and that person becomes a friend inside the group (they may become the envoy). If they leave angry, they take some food and their group hears why.
- They can come back if their group falls.

### 1.15 Remembered faces (bandits and Gate Boys only)
- A named bandit or Gate Boy who meets your people and **survives** (escapes, is spared, or wins) is remembered.
- When they return, they carry a change: a scar, a promotion, a new weapon, a grudge, or a debt (if you spared them). They say so: *"You again. The one who ran."*
- At most 3 remembered faces at once. Spared ones may come back as an informant, or (Gate Boys) as someone who wants out.

### 1.16 The world goes on without you
Already in the politics tick: groups eat, starve, trade, raid, make and break truces, fight over the three disputed places, and collapse.
- **What you see of it:** marks on walls change when a place changes hands; emptied piles with a group's mark; a burnt room; rumours on the radio and from your people; new faces at someone's door; a group's envoy who suddenly looks thin.
- **When a group collapses:** its members scatter. One or two may come to your door; others go to friendly groups; its place becomes a scavenge spot with traps and leftovers.

### 1.17 Payoffs later, never announced
Personal kindnesses to named people are remembered *(hidden list)*. 3 to 10 days later, one pays off from that group's list (each sheet has examples). No message says it will.

### 1.18 Rotation and pacing
- All six major groups (counting Council and Union as one) are near you every game.
- Six of the seven minor groups are near you. The seventh is "far off": heard about on the radio and in rumours, never visited.
- Natures are drawn fresh every game, so the same group plays differently.
- One diplomatic moment a day at most.

### 1.19 The People and Groups screen (mockup to come before building)
Each group tile: mark, name, stage word, place, leader's face. The group page: what they remember (3 to 5 lines in their words), what you have heard (rumours, with how sure your people are), your people from there, open promises, and members you have met.

### 1.20 How often envoys come (measured)
**What the code does today.** The game never sets `G.player`, and every group starts unmet, so groups send **no envoys at all** in the current build, apart from debt reminders. With that switched on and every group met, a simulation of the real politics tick (300 games of 30 days) gives **0.7 envoys a day, about 21 a game**. They are spread almost evenly across all 14 groups and ignore standing. The Tech Guild sends the most and the Gate Boys the least. Pleas and trade offers make up most of them.

**Why that is too many.** The door already carries Mai Kudi (every 3 to 4 days), strangers, returning visitors and door stories, with at most one knock a day and a quiet gap after. 21 envoys on top of that would fill the door every day.

**Proposed scheduler** (modelled on top of the real tick, 400 games):
- One knock a day at most (as now), **never more than two days of knocks in a row**.
- No envoys before **day 4** (nights 1 to 3 belong to the house and the tutorial).
- **Each group at most one envoy every 5 days.** Urgent ones (an ally's call for help, a debt due) can come 2 days after the last.
- **Priority on a free door day:** urgent envoy → Mai Kudi if due → an envoy (if none came in the last 2 days) → a stranger or door story. When both an envoy and a stranger are waiting, they **take turns**, so strangers aren't crowded out.
- **Who gets the slot:** an envoy's weight goes up with need (starving, at war, a debt), with closeness (On good terms and Allies send more, Hostile groups send only demands), and for major groups (2× minor). Unanswered envoys go away after 3 days, and the card says so.
- Visits you plan don't use the door.

**What the model gives per 30-day game:** about **7 to 8 envoys**, about 7 Mai Kudi visits, 3 to 4 strangers and door stories, and about **13 quiet days** at the door. Envoys by phase: about 1 in days 1 to 9, 3 to 4 in days 10 to 20, 3 in days 21 to 30. No urgent envoy was ever lost. The current raw code gives a flat spread across groups; the weighting above is meant to fix that, and I'll re-measure it once it's built.

**Built (step 0), measured on the real code** (`P.door`, `P.sent`, `P.expire` in politics.js; `doorOpen`/`markDoor` in story.js; 400 games of 30 days): about **5 to 6 envoys a game** (about 1 in days 1 to 9, 2.3 in days 10 to 20, 2 in days 21 to 30), about 7.4 Mai Kudi visits, about 5 strangers and door stories, about **12 quiet door days**, never more than two knock days in a row. Major groups send about twice as many as minor ones (Medical, Council, Hustlers and Chapel most; Pitch Boys and Terrace least). About 1 plea a game lapses before it reaches you; only lapsed pleas get a line on the morning card. Envoys knock at 10:00, before the returning strangers (11:00) and Mai Kudi (12:00); an urgent envoy on Mai Kudi's day pushes him to the next day. Ignoring an envoy's knock costs a little standing. The rate is a little under the 7 to 8 first proposed, because the higher rate made about 5 envoys a game lapse unseen.

### 1.21 The Theatre crisis (every game, varied challenger)
The New Theatre is the only place with legitimacy. **Every game, between days 8 and 14, someone moves on it.** Who moves depends on the world on day 7: the strongest claimant with a reason. If that group collapses first, the next one moves.

| Challenger | When they are the one | How it goes |
|---|---|---|
| **Student Union** | default, strongest crowd | *Idealists:* a mass march and a vote, few deaths. *Strongmen:* a night of beatings; Council members dragged out. |
| **Staff Compound** | *hoarders* nature, or the Council is starving | "Restoring order." Dr. Hassan's smoke is used on the Theatre; people blinded, some die in the crush at the doors. |
| **The Terrace** | *buying loyalty* nature, rich and scared | Tobe buys it: Gate Boys' guns for hire. The Council is paid off or thrown out. |
| **Gate Boys** | *Predators* or *Breaking apart* with a paranoid Chairman | They take it as a seat of power. Public punishments on the steps. The worst outcome for the campus. |
| **Nobody: the Council falls apart** | Council *paralysed* and starving | Adewale resigns, the Theatre empties, and three groups scramble for it in one night. |

- **Before:** 3 to 5 days of signs: rumours, strange movements seen on runs, the challenger's envoy courting you with a specific ask (people, food, silence), the Council's envoy asking for help.
- **The night:** back the Council, back the challenger, mediate (On good terms with both, or with help from Mallam Idris or the Chapel), warn the Council, or stay out. If you are allied to either side, they call on you.
- **After:** the holder of the Theatre changes how the campus runs: hearings and votes (Council or idealist Union), curfews and purges (strongmen or Staff), tolls on everyone (Gate Boys or Terrace). The Council's hearing perk only works while the Council holds the Theatre. Losers scatter; some come to your door.
- It all happens off screen: you learn it through the cards, rumours, and the people who come to your door after.

---

## Part 2. The six major groups

### KITCHEN COOPERATIVE · New Cafeteria · about 20 to 30 people
- **Leader:** Mama Ada if she is not in your house; if she is, **Chef Bright** (38, stern, orderly, warm; shorts the Terrace in secret and gives the difference to the MPH Camp).
- **Envoy:** **Sani** (44, porter from Katsina, Pidgin first, gentle; his daughter is sick).
- **Admires:** sharing food fairly, feeding the weak, hard work. **Cannot forgive:** stealing food, hoarding while others starve (they hear if your stores are full while the MPH Camp starves). **Amends:** return what was taken plus a gift of food, carried by someone they know.
- **Natures**
  - *Fair cooks:* honest prices, feed the MPH Camp, forgive fast. Tells: Sani never haggles; your runner sees MPH people eating at the back door.
  - *Food lords:* high prices, use food as power, pay the Gate Boys for protection. Never raid, but cut off trade with anyone who crosses them, and tell the MPH Camp who refused to share. Tells: prices go up after each visit; a Gate Boy is lounging at the cafeteria.
  - *Split kitchen:* Bright and Mama Sade run it from two ends. A deal with one angers the other. Tells: two different people answer your runner; Sani says "Which oga you want?"
- **Wants over time:** early wood and water for the fires; middle, guards against the Gate Boys; late, medicine.
- **Gives:** food, cooked meals, salt, news of who is starving.
- **Raids:** never.
- **Ally perk:** a pot comes to your door every third morning: 4 cooked meals.
- **Feuds:** Gate Boys (protection money), Terrace (the shorting), Hustlers (prices).
- **Your people from here:** **Mama Ada** (see Part 4).
- **Story turns**
  1. **The real count.** On a visit (On good terms or better), Mama Sade tells your runner the stores are lower than the Kitchen says. Keep it quiet: Sade trusts you (+10), and if the MPH Camp turns desperate later, the cafeteria is mobbed. Tell Bright: the Kitchen rations early, prices rise, and Sade is shamed (Split kitchen if not already). Tell the MPH Camp: the MPH Camp trusts you (+15), and the Kitchen becomes Hostile.
  2. **Blessing's night runs.** Blessing, who carries food to the MPH Camp at night, is caught by the Terrace. Sani comes to beg you to hide her. Hide her (she sleeps in your store cupboard, on screen): Kitchen +15 and Terrace −20 if they find out. Refuse: the Terrace makes an example of her. Next morning she is found tied to the flagpole outside Hostel T. Sani never knocks on your door again.
  3. **The shorting.** The Terrace finds out Bright has been shorting them. War over the New Cafeteria is coming within 3 days. You can warn the Kitchen, broker a deal (needs On good terms with both), or stay out and watch the cafeteria change hands.
  4. **Sani's daughter.** Sani asks if you have medicine for his daughter. Give it: days later he warns you the night before a robbery or raid (payoff).
- **Payoffs:** a warning of a raid; a sack of rice left at the door; Sani's daughter comes to thank you.

### THE GATE BOYS · main gate area · about 12 to 20, best armed
- **Leader:** **Chairman** (Tony, 33, cold, orderly, dry humour; lost his scholarship to a politician's nephew; sits with the men who killed his cousin to survive).
- **Envoy:** **Jaja** (24, lieutenant, cold, brave; tired of it, feels "like waiting for a bill").
- **Admires:** strength, paying on time, keeping your word, keeping your mouth shut. **Cannot forgive:** being cheated, informing on them, killing their people. **Amends:** pay double what you owe, or hand over whoever did it.
- **First contact:** around day 3 to 5, Jaja comes to your door with a toll: a little food or fuel each few days "for safety". Pay, and you are Wary with them. Refuse, and you start Hostile, but they need a reason (your weakness, your refusal) before they raid.
- **Natures**
  - *Middlemen:* deal with anyone, sell fuel and news, raid only those who refuse to pay or cheat them. Tells: Jaja haggles, then honours the deal exactly.
  - *Predators:* take what they can; raid anyone who looks weak; you can buy them off, but only for a few days at a time. Tells: the toll goes up each time; your runner hears of a hostel stripped bare.
  - *Breaking apart:* some want out. Members come to you for shelter. Chairman grows dangerous and paranoid. Tells: Chop is seen alone at the fence; Jaja's line is "Chairman is not himself."
- **Fear:** high fear turns them into business partners (Middlemen) or makes them move on to weaker targets (Predators).
- **Raids:** yes, by nature.
- **Ally perk:** a word goes out from the gate. Bandit patrols let your runners pass for a small toll instead of attacking, and Mai Kudi's levy is one third lighter. Cost: Sisterhood, Security and Pitch Boys drop to Wary at most.
- **Remembered faces:** yes.
- **Story turns**
  1. **Chop's pipe.** Chop (19, taken off a bus, terrified) asks your runner to help him out through a pipe behind the guardhouse. Help: Chop joins you, and the Gate Boys hunt him: a raid or ambush within a week unless you are strong or allied with the Pitch Boys or Security. Refuse: he tries alone. Two days later he is found in the drain by the guardhouse, and his rifle is left at your door, so you know they know he asked you.
  2. **Water on the step.** Your runner sees Small Wasiu leaving water sachets at a Sisterhood door. His sister is inside. Tell the Sisterhood: they set a trap and Wasiu is caught, or he defects to them (by their nature). Tell the Chairman: Wasiu is shot at the fence where his sister can see, and the Gate Boys trust you (+10). The Sisterhood learns who told. Keep it: Wasiu owes you, and pays later with a warning.
  3. **Jaja's turn.** (Breaking apart only.) Jaja asks your runner whether you would back her if the Chairman fell. Back her: she takes over within a few days and becomes Middlemen. Refuse: nothing changes. Tell the Chairman: Jaja vanishes, and the Gate Boys become Predators.
  4. **The fuel line.** You learn the Terrace sells them fuel (from Tobe or Zee). You can sell that to the Pitch Boys, or keep it.
- **Payoffs:** a patrol that turns away from your runner; a bag left at the door with no note.

### CHAPEL FELLOWSHIP · the chapel · about 14 to 24
- **Leader:** **Fr. Anselm** (55, warm, orderly, devout; has buried 41 people and is losing their names; gives communion bread to anyone because it is bread).
- **Envoy:** **Sr. Bernadette** (48, stern, brave, funny; hides a small pistol from a dying guard).
- **Admires:** mercy, burying the dead, sheltering strangers, sparing enemies. **Cannot forgive:** cruelty to the helpless, killing an unarmed person, robbing the dead. **Amends:** confess on a visit and help bury the dead. They always forgive once amends are made.
- **Natures** (none raid, ever)
  - *Open door:* shelter anyone, ask nothing back. Tells: strangers of every group sleeping in the pews.
  - *Hard-pressed:* too many mouths; they beg and fray; the door begins to close. Tells: Bernadette's pleas come often; Anselm looks thin.
  - *Guarded faith:* someone abused their trust; slow to warm, loyal for good once won. Tells: your runner is questioned at the door; they want to know your name before your need.
- **Fear:** they pull away from people they fear: fewer envoys, no invitations.
- **Wants:** food and medicine for the people they shelter, help with burials, peace between groups.
- **Gives:** shelter for your wounded or sick (a place to rest away from the house), burial help, news, quiet.
- **Ally perk:** your people's mood holds better: grief hits half as hard, and when someone of yours dies, the Chapel comes to bury and mourn with you.
- **Your people from here:** **Chidera, Segun, Funke** (see Part 4).
- **Story turns**
  1. **The wounded bandit.** The Chapel is hiding a wounded bandit. Bernadette asks for medicine for him. Give it: the Chapel +15, and the bandit becomes a remembered face who spares your runner later. Tell the Security Remnant: they drag him out of the chapel and hang him from the mango tree outside. Fr. Anselm cuts him down and buries him himself. The Chapel becomes Hostile, and Security +15.
  2. **The pistol.** Sgt. Okon learns of Bernadette's gun and wants it for his last stand. Bernadette asks you to keep it for her. Take it: you gain a pistol, and Okon is angry if he learns of it. Refuse: Okon takes it, and the Security turn (Okon's last walk) becomes likely.
  3. **Anselm's doubt.** After many burials, Anselm sends for someone devout from your house to talk. Send someone: Anselm keeps going, and the Chapel stays Open door. Don't: the Chapel becomes Hard-pressed.
- **Payoffs:** a blessing that lifts your devout people's mood; someone is taken in when your house is overfull.

### MEDICAL WING · the clinic · about 6 to 12
- **Leader:** **Dr. Ibrahim** (44, stern, orderly, guarded; treats wounded bandits at night for ammunition).
- **Envoy:** **Nurse Patience** (36, warm, brave, funny; skims morphine for the dying at the MPH Camp).
- **Admires:** bringing medicine, protecting healers, honesty about sickness. **Cannot forgive:** stealing their drugs, hiding a contagious sickness, threatening a healer. **Amends:** return the drugs plus medicine of your own; let them examine your sick.
- **Natures** (never raid)
  - *Neutral healers:* treat anyone; price in supplies. Tells: patients from every group in the corridor.
  - *Rationing:* treat only those who bring something. Tells: a list on the door, and Patience apologising.
  - *Secrets:* someone inside sells drugs to the Gate Boys. Tells: a Gate Boy seen leaving at night; prices of medicine at the Hustlers drop.
- **Wants:** medicine, bandages, clean water, guards, alcohol (ogogoro for cleaning).
- **Gives:** treatment for a hurt person (bring them there), medicine at a price, advice on a sickness.
- **Ally perk:** when someone of yours is badly hurt or sick, a nurse comes the next morning and treats them (at most every second day).
- **Your people from here:** **Amina** (see Part 4).
- **Story turns**
  1. **The night patients.** Your runner sees bandits leaving the clinic. Ibrahim asks you to keep it quiet. Keep it: Medical +10, and bandits treat your runners a little more gently. Tell the Security Remnant or Pitch Boys: the clinic is raided, and the Medical Wing becomes Enemies.
  2. **Patience's vials.** (Secrets or Rationing.) Ibrahim asks you to find out who is taking the morphine. The trail leads to Patience. Cover for her, tell Ibrahim, or tell the MPH Camp who has been helping their dying.
  3. **The cholera scare.** A sickness starts at the MPH Camp. The Medical Wing asks for clean water and for you to keep your people away. Help: you avoid the sickness and gain standing with Medical and MPH. Ignore: the sickness may reach your house.
  4. **Mama Rose's bottle.** When one of yours is dying in pain and there is no medicine, Mama Rose comes with a few dark drops. Accept: they die asleep that night, and everyone in the house knows what was done (shown: Rose sitting by the mat, then the blanket pulled up). Refuse: they die slowly over two days, and the house hears it.
  5. **Joel faints.** Joel faints in the middle of treating one of your people. Send him back with kind words, and he grows into a good medic who later joins you if asked.
- **Payoffs:** medicine left at your door after a sickness; Joel comes to your house in an emergency.

### HOSTEL R HUSTLERS · Hostel R and S · about 12 to 18
- **Leader:** **Boss Kelechi** (28, funny, wild, warm; sells to everyone and prays).
- **Envoy:** **Princess Amara** (22, funny, guarded, wild; fearless only on the outside).
- **Admires:** a good deal, discretion, paying debts on time. **Cannot forgive:** welching on a debt, cutting them out of a trade (trading directly with someone they supply). **Amends:** pay what is owed plus a cut.
- **Natures**
  - *Brokers:* buy and sell anything, broker peace between groups for a price. Tells: Mallam Idris is seen at other groups' places.
  - *Loan sharks:* lend freely, collect hard; late payers are raided for the debt. Tells: Amara offers a loan before you ask.
  - *Running scared:* they owe the Gate Boys; desperate; they may sell you out. Tells: their prices swing day to day; Kelechi does not come out to meet you.
- **Raids:** only Loan sharks, and only to collect a debt.
- **Wants:** habit goods (cigarettes, ogogoro, coffee), rare items, information, debts paid.
- **Gives:** anything rare, at a price; information; Mallam Idris as a peacemaker; spreading a story about a group (the old "incite").
- **Ally perk:** a trader stops at your door every third day with fair prices and things you cannot find on runs (medicine, batteries, cigarettes, a lockpick).
- **Your people from here:** **Ngozi, Dan** (see Part 4).
- **Story turns**
  1. **The loan comes due.** (Loan sharks.) Amara offers a generous loan when you are short. It comes due at the worst time. Pay, beg for more time (costs a pledge), or refuse (raid).
  2. **A secret for sale.** Kelechi offers to sell you what the Terrace's steward has been writing in his notebook, or where the Staff Compound hides its stores. What you do with it opens those groups' turns.
  3. **Idris's truce.** Mallam Idris asks you to carry a peace offer between two groups at war. Carry it: both sides +10 if it holds. Read it first: you learn something, and Idris knows you read it.
- **Payoffs:** a discount that appears without explanation; a warning that someone is selling information about you (Ike of the Tech Guild).

### THEATRE COUNCIL and STUDENT UNION · the New Theatre and Halls A to C · rival pair
- **Council leader:** **Prof. Adewale** (61, warm, timid, orderly; eleven constitutions, three things he signed out of fear, in a drawer). **Envoy:** **Ruky** (23, secretary; leaks every vote to the Union).
- **Union leader:** **Barr. Bube** (26, funny, wild, open; plotting to take the Theatre). **Envoy:** **Aisha** (22, PRO; lies to the crowd and calls it hope).
- **Council admires:** law, fair hearings, written agreements. **Cannot forgive:** lawlessness (raids, threats), helping the Union take the Theatre. **Amends:** submit to a hearing at the Theatre and accept its judgement.
- **Union admires:** loyalty, boldness, sharing with "the people". **Cannot forgive:** siding with the Council against them, mocking the people. **Amends:** a public gift to the Union's people (the MPH Camp counts).
- **Natures**
  - Council: *steady* (they hold the Theatre if not betrayed) or *paralysed* (they argue while things collapse). Tells: a steady Council answers your envoy in one day; a paralysed one sends three different answers.
  - Union: *idealists* (they share what they take, hold a vote) or *strongmen* (Bube becomes what he hated). Tells: idealists feed people in the open; strongmen post guards on their own crowd.
- **Raids:** the Union, only strongmen, and only once the takeover begins. The Council never raids.
- **Ally perks:** Council: once every 4 days they hold a hearing and settle one grudge between two of your people. Union: once every 3 days, two volunteers help a build finish faster.
- **Your people from here:** **Tunde, Hauwa, Dr. Grace** (Council; see Part 4).
- **The takeover:** the Theatre crisis (1.21) happens every game; the Union is the most common challenger but not the only one. Ruky's leaks mean the Union knows whatever you told the Council. If the Union moves and loses, Bube is put on trial and asks you to speak for him. If another group takes the Theatre, the Union and the Council may come to you together, enemies with a common enemy.
- **Other turns:** **Sammy's speech** (Sammy rewrites one of Bube's speeches; tell Bube or let it go); **Adewale's drawer** (the Hustlers sell you the papers; you can ruin him or give them back); **Dele's list** (Dele brings you his list of students who stopped eating; with food you can reach a few).
- **Payoffs:** a vote of thanks read at the Theatre (mood boost); a Union volunteer arriving when you are short-handed.

---

## Part 3. The minor groups

### THE TERRACE · Hostel T (premium) · Tobe
- **Leader:** Tobe (24, senator's son, playing king, terrified). **Envoy:** Mr. Alabi (41, steward; keeps a notebook of everything the Okpara family has done).
- **Admires:** money, discretion, respect for rank. **Cannot forgive:** being shamed in public. **Amends:** a private apology through Alabi, plus a gift.
- **Natures:** *gated* (nobody in, sell surplus power and fuel, never raid) · *buying loyalty* (pay groups to guard them, hire Gate Boys, raid the MPH Camp's stores when scared).
- **Ally perk:** generator power for a night every 4 days: light and radio all night (mood up, radio news).
- **Turns:** **Big Chuka wants out** (he asks to join you; Tobe takes it as a betrayal) · **Alabi's notebook** (it can ruin Tobe or expose the Gate Boys' fuel deal) · **Zee's night power** to the Gate Boys.

### TECH GUILD · E-Library · Dr. Folake
- **Leader:** Dr. Folake (33, engineer, warm and stern). **Envoy:** Ike (27, sells information to anyone, including about you).
- **Admires:** knowledge, honesty, fixing things. **Cannot forgive:** lies told to them. **Amends:** bring parts or a working radio part, and tell them the truth.
- **Natures:** *open radio* (share news freely) · *info brokers* (sell everything, including where you sleep). Never raid.
- **Ally perk:** true rumours: every rumour you hear says whether the Guild thinks it is true. Also clears wrong blame.
- **Turns:** **Ike sold you** (you learn someone sold your house's layout; confront Ike or buy back the silence) · **The server in the basement** (everyone's records; groups want it) · **A rescue signal** (they pick it up; it may be real).

### THE PITCH BOYS · south hostels · Captain Femi
- **Leader:** Captain Femi (25, brave, warm, bluffing that they are strong). **Envoy:** Kabiru (24, jokes to hide how scared he is).
- **Admires:** courage, loyalty, standing up to the Gate Boys. **Cannot forgive:** cowardice in a shared fight, dealing with the Gate Boys. **Amends:** fight beside them once.
- **Natures:** *protectors* (they defend anyone in the south hostels) · *bluffers* (loud, and they fold if called). Raid only the Gate Boys, or you if you are allied with the Gate Boys.
- **Fear:** a proud group: when they fear you, they come to test you (a challenge, not a raid: a fight between champions or a show of numbers).
- **Ally perk:** if you are raided, they come running and fight beside you (once a week).
- **Your people from here:** Obinna.
- **Turns:** **Femi's bluff** (they want to hit the Gate Boys; you can join, warn them off, or tell the Gate Boys) · **Emma** from the MPH Camp wants to join them · **Tochi's theft** from their own stores for his brother.

### THE SISTERHOOD · Stanzel Hall · Seun
- **Leader:** Seun (22, hall rep, stern; breaks her own "no men" rule for the bleeding). **Envoy:** Kamsi (20, scout, funny and wild).
- **Admires:** protecting the vulnerable, keeping your word to women. **Cannot forgive:** dealing with the Gate Boys, harm done to a woman. **Amends:** bring someone out who needs saving.
- **Natures:** *fortress* (closed, strict) · *secret network* (they quietly help many, and know everything). Never raid.
- **Ally perk:** their scouts warn you the day before any raid on your house.
- **Turns:** **Girls held by the Gate Boys** (a rescue, with or without the Pitch Boys) · **Nafisa's antibiotics** (she is out; she asks you secretly) · **Wasiu's sister** (from the Gate Boys' sheet).

### STAFF COMPOUND · Senate, PG school, Law · Prof. Nkiruka
- **Leader:** Prof. Nkiruka (57, stern; hoarding in the Senate basement for her grandchildren). **Envoy:** Mrs. Folasade (40, warm, funny, brave).
- **Admires:** manners, standards, respect for age. **Cannot forgive:** disrespect, taking from their stores. **Amends:** a formal apology, in person, by your eldest.
- **Natures:** *aloof* (trade sometimes, stay out of things) · *hoarders* (deny everything, and Dr. Hassan's smoke is used on anyone who comes too close). Raid never; they defend hard.
- **Ally perk:** once a week, if your food hits zero, they send 6 preserved food.
- **Turns:** **The basement** (you learn of the stockpile; tell the MPH Camp and the crowd comes) · **Dr. Hassan's smoke** (he asks you to take it away before he uses it) · **The registrar's records**.

### SECURITY REMNANT · Auditorium and guardhouse · Sgt. Okon
- **Leader:** Sgt. Okon (45, stern, brave; thinking of a last walk into the Gate Boys' camp). **Envoy:** Cpl. Yakubu (30, never fired at a person; ready to stop his sergeant).
- **Admires:** discipline, duty, standing watch. **Cannot forgive:** helping the Gate Boys, cowardice. **Amends:** stand watch with them for a night.
- **Natures:** *last line* (they still guard the campus) · *broken men* (drinking, angry, easily turned). Raid only the Gate Boys.
- **Fear:** proud; when they fear you, they come to set terms.
- **Ally perk:** one guard joins your night watch every night.
- **Your people from here:** Mr. Bello.
- **Turns:** **Okon's last walk** (stop him, go with him, or let him go; if he goes, a Gate Boy wheels his body back to the gatehouse two days later, and Sunday has to deliver his letter) · **Retake the gate** (they ask for your people for one night).

### THE MPH CAMP · Multi-Purpose Hall · Mama Peace
- **Leader:** Mama Peace (50, warm, brave; shelters people others turn away, including a boy with the Chairman's mark). **Envoy:** Rita (25, keeps a padded headcount to get more food).
- **Admires:** sharing, taking people in. **Cannot forgive:** turning the hungry away from your door, hoarding in front of them. **Amends:** feed the camp for a day.
- **Natures:** *organised* (Mama Peace holds it together) · *desperate crowd* (they don't plan raids, but they can mob a place full of food, yours included, when starving; people are trampled at the doors).
- **Ally perk:** many hands: twice a week they lend two people for a build or a haul.
- **Turns:** **The boy with the mark** (the Gate Boys come looking) · **Rita's count** is discovered by the Kitchen · **Zuwaira's silent son** (a child who stopped speaking; a scene with one of your people).

---

## Part 4. Your people and their old groups
When one of these is in your house, their old group knows. These scenes run alongside the group's own turns.

| Person | Group | Scenes |
|---|---|---|
| **Mama Ada** | Kitchen (she was its leader) | Bright sends Sani after a week: *"The Kitchen needs its mama."* She can visit and comes back with food and news. If the Kitchen goes hungry or falls, she wants to go back to save it, and she will leave unless talked round. |
| **Chidera** | Chapel | Anselm sends word that her mother is asking after her. She leaves if you do a deed the Chapel cannot forgive. |
| **Segun** | Chapel | Bernadette wants him back to help with the burials. He takes a night off to help, and comes back quieter. |
| **Funke** | Chapel | The choir. She sings at the Chapel's funerals if you are On good terms, and her mood rises. |
| **Amina** | Medical | Ibrahim asks her to come back for the cholera scare. Lend her for 2 days and the Medical Wing rises sharply. |
| **Ngozi, Dan** | Hustlers | Kelechi wants them on a deal: one goes for a night and brings back a cut. If the Hustlers are Running scared, the Gate Boys may come looking for them. |
| **Tunde, Hauwa, Dr. Grace** | Council | The Council wants their votes and voices before the takeover. One of them may want to go and fight for the Theatre. |
| **Bashir, Emeka** | Tech Guild | Folake asks for help with the radio. Lend one and you get the true-rumour perk for 3 days even without an alliance. |
| **Obinna** | Pitch Boys | Femi calls him to the fight against the Gate Boys. He wants to go. |
| **Mr. Bello** | Security Remnant | Okon asks him to stand at the gate one last time. If Okon makes his last walk, Bello is the one who hears first. |

---

## Part 5. What gets built first (proposed order)
0. ~~Switch envoys on behind the door scheduler in 1.20, and re-measure.~~ Done (see 1.20).
1. ~~People and Groups screen, from a mockup you approve.~~ Done: world.js (map + pull-up list, group page, person page). The "Plan a visit tonight" button waits for step 3.
2. ~~The six stages, deeds, values, grudges and amends on top of the existing standing code.~~ Done: `P.deed`, `P.gift`, VALUES, AMENDS, gossip (friends at half strength, the Tech Guild at full, sworn rivals), grudge ceiling, stage news on the morning card, pacts kept to term. Envoy cards and run deeds (trade, food at their fire, theft seen or unseen, fights) use it. Amends made in person (Chapel, Council, Pitch Boys, Sisterhood, Staff, Security, and any killing) wait for visits in step 3. Not yet wired: hoarding, spared enemies, sheltering their people, the leader-killing case.
3. ~~Visits in the night plan, and envoys under the one-a-day budget.~~ Done: visits.js. A Visit box in the night plan (pick who, then which group; a group's page can plan it ahead). One thing per visit: Trade (1.5x Wary, fair On good terms, 2x Hostile, none for Enemies), Ask (news; On good terms adds a small loan, a warning, an introduction; Allies a big loan), Give (gifts, lending, food for their fight), Promise (truce; trade pact On good terms; Enemies only if they fear you), Threaten, Sit and talk. While they hold a grudge, their amends is the first choice, in red: confess and dig graves (Chapel), a hearing that fines, canes or keeps your runner a day (Council), a fight against the Gate Boys (Pitch Boys), a rescue from the Gate Boys' ground (Sisterhood), an apology only your eldest may make (Staff), a night watch (Security), the goods they asked for (the rest). A killing is paid in goods and a beating; the Gate Boys will also take the killer, if you send them. The runner is home around 1 to 2am; the walk home kills about 1 in 100 (more from Hostile and Enemies groups). What happened is on the morning card. A visit last night means only a plea or an ally's call can knock today.
4. Promises as house objects.
5. Natures and their tells.
6. Perks.
7. Joining and leaving.
8. Story turns, major groups first.
9. Remembered faces.
