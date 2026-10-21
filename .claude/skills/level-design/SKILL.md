---
name: level-design
description: Tune the difficulty curve, add or remove levels, or design special levels for Rotating Sudoku. Use when asked about levels, difficulty, pacing, timers, clue counts or rotation speed.
---

# Level design

## How difficulty works today

All of it is in `game.js`:

- `LEVEL_COUNT` (20) and `FIRST_LEVEL` (1).
- `EASIEST_LEVEL` `{ clues: 44, minutes: 15 }` and `HARDEST_LEVEL` `{ clues: 24, minutes: 6 }`.
- `levelSettings(level)` interpolates linearly between them, rounding time to `TIME_STEP_SECONDS` (30 s).
- `ROTATE_EVERY_SECONDS` (10) is the same on every level.
- `makePuzzle(clues)` in `sudoku.js` only removes a digit while the puzzle keeps a unique solution, so very low clue counts are a target, not a guarantee; below about 22 clues generation gets slow and often stops early.

## Design principles

- **A curve, not a ramp.** Linear difficulty feels flat. Consider an easy first level that teaches the rotation, a steady climb, and occasional breather levels after spikes.
- **Change one dial at a time** per level so players can feel what got harder: fewer clues, less time, or faster rotation.
- **Milestones keep players going.** Levels 5, 10, 15 and 20 are natural places for something special (a faster rotation, a Mochi boss line, a different board colour).
- **Fair, not cruel.** Every level must be solvable in the time given by a decent player. As a rule of thumb, allow at least 15 seconds per empty cell on early levels and 8 on late levels.

## Changing the number of levels

The level count appears in more places than `LEVEL_COUNT`. Update all of them together:

- `game.js`: `LEVEL_COUNT`.
- `i18n.js`: `finishedTitle` in both `en` and `da` ("You beat all 20 levels!").
- `mascot.js`: `LINES.en.finished` and `LINES.da.finished` mention 20.
- `README.md`: the Rules section.
- Tests: `LastLevel` in `LevelEndTests.cs` and every `"N / 20"` text in the test classes.

Saved games store only `level`, so a save on a level higher than the new `LEVEL_COUNT` fails `isValidSave` and starts over at level 1. If you lower the count, say so in the PR.

## Special levels

If a level needs its own rule (for example faster rotation), express it as data, such as a per-level override in `levelSettings`, not as `if (level === 10)` branches spread through the code. Follow the `game-feature` skill for anything the player sees, including a short overlay or Mochi line that tells them what is different.

## Verify

1. Add or update UI tests for any changed rule, using a seeded `SavedGame` at the level in question.
2. Run the suite: `dotnet test tests/RotatingSudoku.UiTests`.
3. Play at least the first level and one changed level with the `playtest` skill.
