---
name: level-design
description: Tune the difficulty curve, add or remove levels, or design special levels for Rotating Sudoku. Use when asked about levels, difficulty, pacing, board sizes, clue counts or how often the board twirls.
---

# Level design

## How difficulty works today

All of it is in `game.js`:

- `LEVELS`: one entry per level, `{ land, shape, clues, twirlEvery }`. `LEVEL_COUNT` is `LEVELS.length` (20) and `FIRST_LEVEL` is 1; `levelSettings(level)` reads the entry.
- `shape` is a board shape from `BOARD_SHAPES` in `sudoku.js`: 4x4 on levels 1–5 (Rainbow Meadow), 6x6 on levels 6–15 (Crystal Lake, Cloud Castle), 9x9 on levels 16–20 (Starlight Palace). `land` is data only; nothing shows it yet.
- `twirlEvery` is the number of correct digits between two quarter turns of the board; `null` means it never twirls (levels 1 and 2). Wrong digits never count.
- There is no timer and no game over. Stars reward finishing and making at most `CAREFUL_OOPSIES_LIMIT` (2) oopsies.
- `makePuzzle(shape, clues)` in `sudoku.js` only removes a digit while the puzzle keeps a unique solution, so a clue count is a target, not a guarantee. 4x4 and 6x6 boards generate instantly; on 9x9 below about 22 clues generation gets slow and often stops early. After changing clue counts, generate each changed level a few times in the preview and check the counts are reached.

## Design principles

- **Players are 6–12.** The first level of the game must be easy enough for a six-year-old; the last should still make a twelve-year-old think. Challenge is the point, so do not flatten the curve to make it "nicer".
- **A curve, not a ramp.** An easy first level, a steady climb, and a breather after each spike. The first level on a bigger board is a breather: plenty of clues and a slow twirl.
- **Change one dial at a time** per level so players can feel what got harder: fewer clues, a more frequent twirl, or a bigger board. The twirl arrives on level 3 with the same clues as level 2.
- **Milestones keep players going.** The last level of a land (5, 10, 15, 20) is a natural place for something special, such as a faster twirl or a Mochi boss line.
- **Tap size matters.** Keep small boards for young players; 9x9 cells are small on a phone.

## Changing the number of levels

The level count appears in more places than `LEVELS`. Update all of them together:

- `game.js`: the `LEVELS` entries.
- `i18n.js`: `finishedTitle` in both `en` and `da` ("You beat all 20 levels!").
- `mascot.js`: `LINES.en.finished` and `LINES.da.finished` mention 20.
- `README.md`: the Rules section (which levels have which board size).
- Tests: `LastLevel` in `LevelEndTests.cs`, every `"N / 20"` text in the test classes, `FirstNineByNineLevel` in `SavedGame.cs`, and the level numbers in `GrowingBoardsTests.cs` and `TwirlTests.cs`.

`isValidSave` rejects a save whose level no longer exists or whose board size does not match its level's shape, so such a save starts over at level 1. Stars are kept per level number in `rainbow-kingdom-progress`. If you remove, reorder or resize levels, say so in the PR.

## Special levels

If a level needs its own rule, express it as data in its `LEVELS` entry (as `twirlEvery` does), not as `if (level === 10)` branches spread through the code. Follow the `game-feature` skill for anything the player sees, including a short overlay or Mochi line that tells them what is different.

## Verify

1. Add or update UI tests for any changed rule, using a seeded `SavedGame` at the level in question (set `Level` and `Shape` together).
2. Run the suite: `dotnet test tests/RotatingSudoku.UiTests`.
3. Play at least the first level and one changed level with the `playtest` skill.
