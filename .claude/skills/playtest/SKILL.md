---
name: playtest
description: Play Rainbow Kingdom Sudoku in the browser preview to judge how a change looks and feels (Stardust's lines, pictures, animations, difficulty, the first lesson, layout on a phone). Use after any player-visible change, or to find what to improve next.
---

# Playtesting

Tests prove behaviour; a playtest judges whether it is fun. Do both.

## Start the game

- Start the preview with `preview_start` and the name `sudoku` from `.claude/launch.json`. It serves the repo root on port 5173 with `tools/serve.ps1`.
- If the port is taken, the app may report another port; the script still listens on 5173, so navigate to `http://localhost:5173/`. Check the page title says "Rainbow Kingdom Sudoku": another port may be serving an older checkout.

## Reach the moment you want to judge

Do not play through every level to reach a late one. The quickest way is to start a fresh level from `javascript_tool`; `startLevel` is a global in `game.js`:

```js
startLevel(16); // the first 9x9 level
```

To judge a specific board (for example one correct digit before a twirl, or one cell from solved), set up a save in `localStorage` and reload:

```js
localStorage.setItem("rainbow-kingdom", JSON.stringify({
  level: 3, puzzle, solution, board, oopsies: 0, wandsUsed: 0, twirls: 0, status: "playing",
}));
location.reload();
```

`puzzle`, `solution` and `board` are arrays of `size * size` numbers (0 = empty), and the size must match the level's board in `LEVELS` (4x4 on levels 1–5, 6x6 on 6–15, 9x9 on 16–20), or the save is ignored. The quickest source is the current game: read `JSON.parse(localStorage.getItem("rainbow-kingdom"))`, change it, and write it back. Stars and the lesson live under `rainbow-kingdom-progress` as `{ starsByLevel: { "3": 1 }, lessonDone: true }`. Use `localStorage.setItem("rotating-sudoku-language", "da")` to check the Danish version.

To see the first lesson again as a new player would, clear both keys and reload:

```js
localStorage.removeItem("rainbow-kingdom");
localStorage.removeItem("rainbow-kingdom-progress");
location.reload();
```

The **?** button replays the lesson without clearing anything.

## What to look at

- **First visit:** does the lesson make the rule clear without reading? Is Skip easy to find, and does level 1 follow smoothly?
- **First 30 seconds:** is it obvious what to do? Does Stardust's first line land?
- **Pictures:** can every picture be told apart at a glance, also on 9x9 at phone width? Check with a greyscale filter (`document.body.style.filter = "grayscale(1)"`) so colour is never the only cue. Given pictures (on a framed tile) must differ from the child's own without colour, and mistakes must never show red.
- **Twirl:** does the glow warn early enough? Is the turn readable and fun, or disorienting in a bad way? Do the pictures stay upright?
- **Stardust:** read several lines per event in the bubble, in both languages. Are any cut off, repeated too often or out of character? She must praise how the child worked something out, comfort after a mistake, and **never nag or blame**: no idle begging, no sarcasm, no numbers. Does each face (happy, thinking, celebrating, comforting, oops) fit its moment?
- **Challenge:** there is no clock, so does the level still make the player think? Is the first level easy enough for a six-year-old?
- **Reward:** does completing a level feel good enough to want the next one? Do the stars show clearly how to earn the missing one?
- **Phone width:** use `resize_window` with the `mobile` preset, then `desktop` again when done. Check the cells and picture buttons are easy to tap on every board size.
- **Reduced motion and dark mode:** check new animations and colours with both. In dark mode (`resize_window` with `colorScheme: "dark"`, then reload) the pictures, Stardust and the lesson must read well on the night sky.

Take a screenshot of anything you change visually and include it in your report or PR.

## Report

Write findings as a short list: what works, what feels off, and one concrete suggestion per problem, ordered by how much it would improve the player's experience.
