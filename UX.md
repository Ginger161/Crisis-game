# CRISIS — Interface rules (v2)

One idea: **the house is the interface.** Everything that can be shown in the world is shown in the world. Chrome (buttons, panels, chips) exists only for what the world cannot show.

## 1. The screen (390×844 reference, portrait)

```
┌──────────────────────────────┐
│ ☰   Day 3 · 14:20      ⏸ ▶▶  │  top bar, 44px. 3 things only.
├──────────────────────────────┤
│                              │
│        THE HOUSE             │  stage: everything left over (~70%)
│   floors, people, stations,  │
│   bubbles, progress bars     │
│                              │
├──────────────────────────────┤
│ (Chi)(Tun)(Ami)(Eme)    🚪   │  people strip, 64px: the party, plus the Door
└──────────────────────────────┘
```

That is the whole persistent UI. **Five targets in the bar, one strip, nothing else.** No bottom tab bar, no stat chips, no side panels, no permanent resource list.

### What is in each part
- **☰ (left):** opens the Menu sheet: Items, Journal, World, Settings, Save/Report. These are things you *read*, not things you do all the time.
- **Day · clock (centre):** always visible. Day number plus 24-hour time. Night dims the whole screen, so time also reads without numbers. The 5-day rescue window is *not* here (it lives in the Journal).
- **Speed (right):** one button that cycles ⏸ → ▶ → ▶▶ → ▶▶▶. It shows the current state. Tap to cycle; long-press to pause. A sheet being open pauses the world and the button shows ⏸ dimmed.
- **People strip:** one portrait per person. Portrait only; no numbers. A portrait gains a **ring or badge only when something is wrong** (see §4). The selected person has a bright border.
- **Door 🚪 (right end of the strip):** the one way out of the house. Same size as a portrait.

## 2. The five laws

1. **Show it where it happens.** Progress is a bar at the station. Speech is a bubble over the speaker. Hunger is a face and a posture, not a number. A job is visible as a person doing it.
2. **Absence means fine.** Nothing is drawn for a normal state. If a portrait has no badge the person is fine. If the top bar has no chip there is no supply emergency. Anything that is always on screen stops meaning anything.
3. **One thing asks for you at a time.** There is one decision sheet at a time. Notices queue; they do not stack.
4. **Tap the thing, not a menu.** To do something with the cupboard, tap the cupboard. To send someone to the stove, tap the stove. No "Work tab".
5. **Never lose the house.** No sheet covers more than 55% of the screen. The house stays visible and (when it is a notice, not a decision) keeps running.

## 3. Interaction grammar

| You tap | Result |
|---|---|
| A person (house or strip) | Select. A small card appears *next to them* (not a sheet): name, what they are doing, their two worst needs as words ("Hungry", "Exhausted"), and three buttons: **Talk · Items · Orders**. |
| A station | A small menu *anchored to the station*, listing only what is possible there, each line with its cost and time. Unavailable lines stay visible, greyed, and tapping one says why. |
| An empty floor | The selected person walks there. |
| The stairs | The selected person goes to the next floor in the direction tapped. |
| The Door | The **Go-out** sheet: who, what they carry, where. |
| The cupboard | The Stores sheet (grid, give/take). |
| ☰ | The Menu sheet. |

- **Pressing a person who is busy** shows what they are doing and offers *Do this next* / *Do this now* (interrupts).
- **Long-press anything** shows a one-line explanation. This replaces every tutorial blurb.
- **Selection is one person** at a time. There is no multi-select.

## 4. Status language (what appears on a portrait or a figure)

| State | Portrait | In the house |
|---|---|---|
| Hungry (≥ 55) | Amber dot | Holds stomach, slower walk |
| Starving (≥ 85) | Red dot, pulses | Slumps, stumbles |
| Thirsty | Blue drop | Licks lips, shaky |
| Tired | Moon | Yawns, slower |
| Sick | Green wave | Coughs, hunches |
| Wounded | Red cross | Limps, drips |
| Low mood (< 28) | Grey cloud | Sits alone, avoids others |
| On watch | Eye | At the post |
| Dead | Cross over eyes (as always) | Body stays until buried |

**Max two badges on a portrait**, worst first. Everything else is in the person card.

## 5. Alerts (three levels, no others)

| Level | Looks like | Pauses? | Examples |
|---|---|---|---|
| **Ambient** | Bubble over a head or a line of text that fades in the house | No | "Come and eat." A cough. A cry |
| **Notice** | A one-line toast at the top, 4 seconds, tap to open the Journal at that entry | No | Someone finished the stove. Rain caught 3 water. A person dozed on watch |
| **Decision** | A sheet | **Yes** | A knock at the door. A raid. A fight. A dying person |

Rules: at most one toast visible at a time (the next waits). Decision sheets are *only* used when the game needs a choice, never to announce a fact. If it is a fact, it is a notice.

## 6. Sheets

- Slide up from the bottom, **max 55% height**, the house visible and dimmed above. Drag handle on top; tap outside to close (where closing is safe).
- Structure: **title (one line) → body (≤ 45 words) → choices (2–4)**. A choice is a verb ("Open the door", "Send Tunde"), never "OK" or "Continue" except for a pure continue.
- The speaker's portrait, name and addressee ("Tunde → you") sit in the title row. Text is in quotes only if spoken.
- Choices that cost something say what it costs, in the button ("Give 2 food"). Greyed buttons say why when tapped.
- Lists inside a sheet are the only thing that scrolls, with a ▼ arrow when there is more. No scrollbars.

## 7. Type, colour, space

- **Three text sizes:** 16 body, 13 secondary, 22 titles. **Two weights.** Never smaller than 12.
- **Colour has jobs:** cream = text, amber = *needs your attention*, red = danger/damage, green = good result/progress, blue = water/night. Nothing else is coloured. Decoration is the art, not the UI.
- **Backgrounds:** the house is the only illustrated surface. UI surfaces are flat, dark, 85% opaque.
- **Touch:** every target at least 44×44. Primary buttons live in the bottom third (thumb reach). Nothing important in the top corners except the ☰ and the speed button.
- **Spacing:** 8-point grid. 16 px side gutter. Safe-area insets respected so browser bars never hide anything.
- **Motion:** only motion that carries information (walking, bars filling, bubbles). Sheets slide 160 ms. Respect "reduce motion".

## 8. Text rules (tone and length)

- A bubble is ≤ 9 words. A sheet body is ≤ 45 words. A toast is ≤ 10 words.
- Concrete over abstract. "Tunde ate the last meal." Not "Resources are running low."
- Numbers only when the player must decide with them (costs, quantities in a swap). Otherwise words and pictures.
- Past tense for what happened, present for what is. No exclamation marks outside speech.
- Every message names a person or a thing. No anonymous "someone".

## 9. What the old UI loses

| Old | New |
|---|---|
| Heads-up display with many chips | Top bar (3 things) |
| Bottom nav (Group / Items / World / Journal / Night) | ☰ menu + people strip + Door |
| People/Work/World/Notes tabs and the panel area | Person card + station menus + Menu sheet |
| "Night" button | Time passes; night is a state, not an action |
| Scene-above-panel layout | House fills the screen |
| Inventory tab | The cupboard (tap it) and the person card's Items |
| Coach cards anchored to the nav | Coach cards point at the actual thing (the stove, a person), 5 steps max, then long-press for everything else |

## 10. Acceptance checks (testable)

1. At rest on a 390×844 screen the persistent chrome is ≤ 30% of the height.
2. No more than 8 interactive targets are visible outside the house.
3. Every sheet leaves ≥ 45% of the house visible.
4. A new player can give an order (build/cook) in ≤ 3 taps from the house.
5. Each of the 9 states in §4 is distinguishable at a glance in a screenshot test.
6. No text node in the persistent UI is below 12px; all targets ≥ 44px (automated check).
7. Nothing in the UI is scrollable except lists in sheets.
