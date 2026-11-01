# CRISIS — the economy

*How things come in, how they go out, and how much of it there is. Numbers are read from the game's own data, so they stay in step with it. Edit values in `game.js` (stock, consumption, crafting) and `campus.js` (loot, risk, richness).*

## 1. What you start with (every run)
| Item | Start |
|---|---|
| Food | 7–10 |
| Water | 7–10 |
| Wood | 4–6 |
| Scrap | 2–3 |
| Cloth | 1–3 |
| Medicine | 0–2 |
| Bandages | 0–2 |

Enough for a stove (3 wood, 2 scrap) on day one, if you choose to.

## 2. What people need
Per person, per day: hunger rises **+20**, thirst **+18**.

| Eating | Hunger | Notes |
|---|---|---|
| Raw food | −22 | instant, no stove, but −1 mood, +6 thirst, ~22% stomach upset |
| Cooked meal | −60 | +2 mood |
| Water | thirst −45 | one sachet lasts about two and a half days |

So **four people** need about **1.3 cooked meals a day** (or 3.6 raw), and about **1.6 water a day**. Eight food lasts roughly six days cooked, two raw.

**Cooking:** a stove (3 wood, 2 scrap), then "Cook a pot": up to 4 food + 1 wood + one task → up to 4 meals (+1 if the cook is a trait cook). It also lifts everyone's mood and draws people closer. That is the reason to cook.

Wounds and fever drain health daily. Hunger above 70 and thirst above 70 cost mood; at 100 they cost health.

## 3. How things come in
**Scavenging.** One person goes out each night. The trip costs night-hours: nearby buildings leave **4 searches**, far ones **2**. Each search is one spot (1 hour). A search either finds loot (1–3 items, 2–4 for food and water) or triggers an encounter. The bag holds **8 items** (**10** for a strong character), so a typical night brings home **3–9 items**.

Each building has a **richness** (how many times it can be searched, about 3–11) that refills by 1 every 4 days. A picked-clean building gives nothing.

**Other sources:** rain with a bucket, gifts and repaid loans, trading with the 14 groups, favours returned, looting the dead (with consequences), raiding.
**Drains:** raids and theft, tribute, tolls, bribes, supplies spent on gifts and favours.

## 4. What each kind of building gives
| Kind | Examples | Top finds | Risk |
|---|---|---|---|
| hostel (26) | Boys' Hostel A, Boys' Hostel B, Boys' Hostel C | food 38%, water 29%, cloth 11%, medicine 10% | 2.1/5 |
| cafe (10) | Boys' Cafeteria 1, Boys' Cafeteria 2, Boys' Cafeteria 3 | food 58%, water 25%, wood 8%, scrap 8% | 2.3/5 |
| class (6) | Class Block A, Class Block B, Class Block C | wood 47%, scrap 20%, water 16%, cloth 8% | 2.2/5 |
| hall (3) | New Theatre, Multi-Purpose Hall (MPH), Auditorium | cloth 38%, scrap 25%, wood 25%, water 13% | 3/5 |
| admin (1) | Senate Building | scrap 41%, food 27%, medicine 14%, cloth 14% | 3/5 |
| clinic (4) | Pharmacy Building, Medical Building, New Medical Building | medicine 63%, bandages 21%, scrap 10%, water 6% | 3.5/5 |
| chapel (1) | The Chapel | cloth 40%, water 20%, food 20%, medicine 10% | 1/5 |
| library (1) | E-Library | scrap 43%, wood 25%, cloth 12%, water 12% | 2/5 |
| field (3) | Basketball Court, Volleyball Court, Football Field | water 43%, wood 33%, cloth 13%, club 11% | 3.3/5 |
| gate (1) | School Gate | food 29%, pistol 17%, scrap 17%, machete 14% | 5/5 |

## 5. Making things
| Make | Cost |
|---|---|
| Bandage | 2 cloth |
| Club | 2 wood |
| Machete | 2 scrap + 1 wood |
| Ogogoro | 2 food (needs a still) |
| Stove | 3 wood + 2 scrap |
| Rain bucket | 2 scrap + 2 cloth |
| Radio | 4 scrap |
| Bed | 3 wood + 3 cloth |
| Barricade (three levels) | 4 wood + 1 scrap, then more each level |
| Still | 3 scrap + 2 wood |

Each job costs one of a person's **2 tasks per day**.

## 6. Trade value (how groups price things)
Food 1 · water 1 · wood 0.8 · cloth 0.8 · scrap 1.2 · bandages 1.5 · ogogoro 1.5 · cooked meal 1.6 · medicine 3 · club 2 · machete 3 · pistol 6. A group that is short of something values it up to **1.5×**. Reputation and pacts move prices by up to about 18%.

## 7. What is not there yet
- No currency. Trade is barter only.
- No spoilage: food keeps forever.
- No storage limit at the shelter.
- Prices do not move day to day, only by need and reputation.
- Guns have no ammunition.
