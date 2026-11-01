# CRISIS — how it fits together

Open `index.html` in a browser (or serve the folder and install it as an app). Everything is plain JavaScript, no build step.

## The screen
A fixed shell that never scrolls: **header** (day, place, supplies) → **scene** (always visible) → **tabs** → **one panel that scrolls inside itself** → **action bar**.
Choices and conversations open as a sheet that covers only the panel area, never the scene. The height follows the *visible* area, so phone address bars and toolbars never hide the buttons (`index.html` measures `visualViewport`; `style.css` honours safe areas).
On a wide screen or a phone on its side, the scene sits left and the panel right.

## Files
| File | What it is |
|---|---|
| `game.js` | The core loop, survivors, scavenging, rendering, endings |
| `cutaway.js` | The tap-to-move shelter |
| `sprites.js`, `side.js`, `scenes.js`, `emblem.js` | Pixel art: front portraits, side-view skeleton figures, animated places, the crest |
| `campus.js` | Every building, zone, travel time, loot and risk. **Edit distances here.** |
| `cast.js` | The 14 deep characters |
| `groups.js` | The 14 groups and 52 supporting characters (3 personal story beats each are generated from their own words) |
| `voice.js` | The hidden voices: Pidgin rules and dialect word lists. **Please proof these.** |
| `story.js` | Story cards, the director that paces dread against warmth, conversations, relationships, memory |
| `storylets.js` | Authored story cards (camp life, humor, romance, grief, horror) |
| `procedural.js` | Story cards assembled fresh from banks every time (the "generated" feel) |
| `politics.js`, `polylets.js` | The 14 groups' own lives, diplomacy, debts, wars, envoys, the outside news |
| `CAST.md` | Everyone, their group and voice (generated; re-run `gen-cast-doc.js` from the scratch folder or ask) |
| `WORLD.md` | The visual and world bible |

## Adding things
- **A story card:** `S.add({ id, kind, w, cast:{A:..,B:..}, when:(x)=>.., run(x,{A,B}){ ask(title, text, choices, portrait(A)) } })` in `storylets.js`. `kind` is one of camp, humor, pair, romance, grief, horror, politics, world, visitor, crisis. The director does the rest.
- **A procedural card:** add a `reg('name', kind, weight, (A, B) => ({ title, text, choices }))` in `procedural.js`, and add to the banks (`PLACE`, `THING`, `SENSE`, `MEMORY`...) to multiply variety.
- **A character:** add to `groups.js` with `m('id', 'Name', sex, age, arch, role, home, faith, 'voice/dialect', [tags], home line, wound line, secret line, dream line, signature line, look overrides)`. Voice codes: `en`, `pg`, `mix`, plus `/ig`, `/yo`, `/ha`.
- **Who can fall for whom:** add `into: 'm' | 'f' | 'any'` to a character. Default is the other sex, and both people must be open to it.
- **A group's relationships:** `FRIENDS` and `FOES` in `groups.js`.

## Players never see
A character's voice, their group's hidden agenda, or their secret until it is earned through conversation.
