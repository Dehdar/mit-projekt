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

Do not wait in real time for a late level or the game-over screen. Set up a save in `localStorage` with `javascript_tool` and reload:

```js
localStorage.setItem("rotating-sudoku", JSON.stringify({
  level: 10, puzzle, solution, board, timeLeft: 30, status: "playing",
}));
location.reload();
```

`puzzle`, `solution` and `board` are 81-number arrays (0 = empty). The quickest source is the current game: read `JSON.parse(localStorage.getItem("rotating-sudoku"))`, change `level` or `timeLeft`, and write it back. Use `localStorage.setItem("rotating-sudoku-language", "da")` to check the Danish version.

## What to look at

- **First 30 seconds:** is it obvious what to do? Does Mochi's first line land?
- **Rotation:** is the 10-second turn readable, or disorienting in a bad way?
- **Mochi:** read several lines per event in the bubble. Are any cut off, repeated too often or out of character?
- **Pressure:** does the last-minute warning create tension? Does game over feel fair?
- **Reward:** does completing a level feel good enough to want the next one?
- **Phone width:** use `resize_window` with the `mobile` preset, then `desktop` again when done.
- **Reduced motion and dark mode:** check new animations and colours with both.

Take a screenshot of anything you change visually and include it in your report or PR.

## Report

Write findings as a short list: what works, what feels off, and one concrete suggestion per problem, ordered by how much it would improve the player's experience.
