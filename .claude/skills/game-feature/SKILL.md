---
name: game-feature
description: Design and build a new gameplay feature for Rotating Sudoku (power-ups, streaks, hints, sounds, achievements, new mechanics) the way this codebase expects. Use when adding or changing anything the player can see or do.
---

# Adding a game feature

## 1. Decide if it is worth building

Before writing code, write a three-line pitch:

- **Player moment:** what the player feels or does differently ("I race to fill a row before the board turns").
- **Why it is more engaging:** tension, reward, surprise, mastery or personality.
- **Cost:** files touched, risk to existing behaviour, effect on the save format.

Prefer features that amplify what makes this game unique: the rotation, the timer pressure and Mochi. Avoid features that remove the challenge (for example unlimited hints) or that need a server, accounts or third-party libraries.

## 2. Fit the architecture

Read `CLAUDE.md` first. The rules that matter most:

- Plain classic scripts, no frameworks, no ES modules, no build step, no dependencies. Load order in `index.html` is `storage.js`, `dom.js`, `i18n.js`, `sudoku.js`, `mascot.js`, `game.js`; a script may only use what loads before it.
- Pure board logic goes in `sudoku.js` (no DOM). Game flow and rendering go in `game.js`. Mochi's reactions go in `mascot.js`.
- `state` in `game.js` is the single source of truth and is saved as JSON. Never rename existing keys. When you add a key, old saves must still load: give it a default when it is missing, as `resumeOrStartGame` does for `solution`.
- Everything that changes state follows the same order: update `state`, `saveGame()`, `refreshGame()`, then `mochi(event)`.
- Every user-visible string goes in **both** `en` and `da` in `i18n.js` (or `LINES` in `mascot.js`). English is the default language.
- Respect `prefers-reduced-motion` for any new animation (see the end of `style.css`), and keep the layout working at phone width.
- Code follows `.claude/rules/clean-code.md`: intention-revealing names, small functions, named constants instead of magic numbers, comments in English that explain *why*.

## 3. Test it

Follow `.claude/rules/ui-tests.md`. Every new behaviour gets a UI test in `tests/RotatingSudoku.UiTests`, written from the player's point of view, using the fake clock and seeded saves from `Support/`. Add locators and actions to `SudokuPage`, keep assertions in the test. The full suite must pass:

```bash
dotnet test tests/RotatingSudoku.UiTests
```

## 4. Check it feels right

Play it with the `playtest` skill. A feature that passes its tests but is confusing, too easy or annoying is not done.

## 5. Document it

Update the Rules or Controls section of `README.md` if the player needs to know about it, and `CLAUDE.md` if it changes the architecture or the saved state.
