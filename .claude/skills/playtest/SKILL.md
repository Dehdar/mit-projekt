---
name: playtest
description: Play Rotating Sudoku in the browser preview to judge how a change looks and feels (Mochi's lines, animations, difficulty, layout on a phone). Use after any player-visible change, or to find what to improve next.
---

# Playtesting

Tests prove behaviour; a playtest judges whether it is fun. Do both.

## Start the game

- Start the preview with `preview_start` and the name `sudoku` from `.claude/launch.json`. It serves the repo root on port 5173 with `tools/serve.ps1`.
- If the port is taken, the app may report another port; the script still listens on 5173, so navigate to `http://localhost:5173/`.

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

`puzzle`, `solution` and `board` are arrays of `size * size` numbers (0 = empty), and the size must match the level's board in `LEVELS` (4x4 on levels 1–5, 6x6 on 6–15, 9x9 on 16–20), or the save is ignored. The quickest source is the current game: read `JSON.parse(localStorage.getItem("rainbow-kingdom"))`, change it, and write it back. Stars live under `rainbow-kingdom-progress` as `{ starsByLevel: { "3": 1 } }`. Use `localStorage.setItem("rotating-sudoku-language", "da")` to check the Danish version.

## What to look at

- **First 30 seconds:** is it obvious what to do? Does Mochi's first line land?
- **Twirl:** does the glow warn early enough? Is the turn readable and fun, or disorienting in a bad way? Do the digits stay upright?
- **Mochi:** read several lines per event in the bubble. Are any cut off, repeated too often or out of character?
- **Challenge:** there is no clock, so does the level still make the player think? Is the first level easy enough for a six-year-old?
- **Reward:** does completing a level feel good enough to want the next one? Do the stars show clearly how to earn the missing one?
- **Phone width:** use `resize_window` with the `mobile` preset, then `desktop` again when done. Check the cells and number buttons are easy to tap on every board size.
- **Reduced motion and dark mode:** check new animations and colours with both.

Take a screenshot of anything you change visually and include it in your report or PR.

## Report

Write findings as a short list: what works, what feels off, and one concrete suggestion per problem, ordered by how much it would improve the player's experience.
