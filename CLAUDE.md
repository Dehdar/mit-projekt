# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Rainbow Kingdom Sudoku: a standalone browser game for children aged 6–12, in plain HTML/CSS/JavaScript, with the game files at the repository root. Cells show pictures instead of digits. 20 levels on a board that grows from 4x4 to 6x6 to 9x9; from level 3 the board twirls 90° after every few correct pictures. There is no timer and no game over: finishing a level earns stars, and a first visit opens with a short lesson the child plays. Stardust, a young unicorn, cheers the player on. The repository, the test project and the Pages URL keep the old name \ The game rules are in the "Rules" section of `README.md`; read it before changing them.
The game itself has no build step, no package manager, no dependencies and no linter; only the UI tests (C#/.NET) need building.
It is published with GitHub Pages from the root of `main` (https://dehdar.github.io/rotating-sudoku/); `.nojekyll` makes Pages serve the files as they are.

## Running

Open `index.html` directly in a browser, or serve the repo root with any static server. `tools/serve.ps1` is a dependency-free static server (PowerShell 7, `HttpListener`): `pwsh -File tools/serve.ps1` (defaults: root `.`, port 5173). `.claude/launch.json` defines the `sudoku` preview server using it.

## UI tests

Playwright for .NET with NUnit, in `tests/RotatingSudoku.UiTests/` (.NET 10 SDK; Node.js is not installed). Run from that folder:

```bash
dotnet test
dotnet test --filter "FullyQualifiedName~StardustTests"
dotnet test --filter "Name=TheBoardTwirlsAQuarterTurnAfterEnoughCorrectDigits"
```

The first time on a new machine, build and install the browser with `pwsh bin/Debug/net10.0/playwright.ps1 install chromium`.

- Tests open `index.html` from the repo root straight from disk (`file://`), so no server is needed.
- `SudokuTest` (base class) makes every test repeatable: it installs Playwright's fake clock paused, so time only moves with `Game.WaitSecondsAsync`, and fixes `Math.random` at 0.4, so puzzles are fixed and Stardust always comments. `Game.FixRandomAsync` overrides it for one test.
- `SavedGame` seeds a known game: by default the 9x9 board on level 16 (`FirstNineByNineLevel`) with two empty cells, so one entry does not win; `Level`, `Shape`, `Oopsies`, `EmptyCells` and `Twirls` (`null` stands for a save from before the twirl) can be set. `SavedProgress` seeds stars. Both implement `ISavedData`, and `RawSave` stores any data under any key (for example an old save); `SudokuPage.OpenAsync` takes several at once.
- `BoardShape` mirrors the shapes in `sudoku.js`, each with a known solved board; `Cell` works on any size. `BoardLogic` calls `sudoku.js` inside the page for rules a player cannot see (such as a puzzle having exactly one solution).
- `SudokuPage` is the page object holding locators and user actions; it finds cells using the board size of the game it opened. `EnterDigitAsync` clicks picture buttons by position (1 is the first), so it works in both languages; `PictureButton(name)` finds one by its English name, and `Symbols` maps digits to those names. A twirl starts from the unturned position, so call `WaitForTheBoardToStopTurningAsync` before asserting that the board did *not* turn. Assertions stay in the test classes.
- `OpenNewGameAsync` is a first visit, so it shows the lesson; `Lesson`, `LessonButton(name)`, `LessonEmptyCells` and `PlayTheLessonAsync` drive it. Seeded saves skip it. `StardustSpeech` is her bubble, and `StardustLines` reads her line tables in the page.
- The game is tested through what a player or screen reader sees: cells have `role="button"` and an `aria-label` with the picture's name (`Empty cell` when empty), picture buttons sit in a group named `Pictures`, lesson cells have `role="img"`, the lesson is a dialog named `How to play`, and Stardust's bubble has `role="status"`. Test ids exist only where nothing user-visible identifies an element: `data-testid="cell"` / `"board"`.

## Conventions

- **Language:** everything is in English: code, comments, docs, commit messages and the default UI language. Danish exists only as a UI translation (`da` in `i18n.js`, `LINES.da` in `mascot.js`). The game is called "Rainbow Kingdom Sudoku" in both languages.
- **Persistence:** the game in progress is saved to `localStorage` under `rainbow-kingdom`, the stars and whether the lesson was done under `rainbow-kingdom-progress` and the language under `rotating-sudoku-language`; saves under the old `rotating-sudoku` key are ignored. All access goes through `readStorage` / `writeStorage`, which tolerate storage being unavailable, and loaded data is validated (a board must match its level's size). If you change the saved state shape, keep loading older saves working (see `withMissingTwirlsCounted` in `game.js`) or bump the key.
- No frameworks or ES modules; keep it that way unless asked.
- **Clean Code:** all code follows Robert C. Martin's *Clean Code*; the concrete rules are in `.claude/rules/clean-code.md` and load only when working on code files (not Markdown).
- **UI tests:** every change adds, updates or removes UI tests, and the tests follow Clean Code too; the rules are in `.claude/rules/ui-tests.md`.

## Rainbow Kingdom Sudoku architecture

Classic scripts loaded in order from `index.html`, sharing globals (order matters, each may only use what loads before it):

1. `storage.js` — `readStorage` / `writeStorage`, `localStorage` wrapped in `try/catch`.
2. `dom.js` — `forceReflow` and `restartAnimation(element, className)`, used to replay CSS animations.
3. `i18n.js` — `TRANSLATIONS.da` / `TRANSLATIONS.en`, `translate(key, ...args)` (entries may be functions taking args), `currentLanguage`, `toggleLanguage`, `translatePage`. Static text in the HTML is translated via `data-i18n="key"` attributes and aria-labels via `data-i18n-label="key"`; the pictures' names are in `symbolNames`.
4. `sudoku.js` — pure board logic with no DOM access. Every function takes a board shape `{ size, boxRows, boxColumns }` from `BOARD_SHAPES` as its first argument: `FOUR_BY_FOUR` (2x2 boxes), `SIX_BY_SIX` (boxes 2 rows tall, 3 columns wide) and `NINE_BY_NINE`. A board is a `size * size` number array, `EMPTY` is 0; `cellCountOf(shape)` and `digitsOf(shape)` give its size and digits. Puzzle generation (`makePuzzle(shape, clues)` removes digits only while `hasUniqueSolution` holds), `solvePuzzle`, `findConflicts`, `isSolved`, `completedUnitsThrough`, and the row/column/box helpers.
5. `symbols.js` — the pictures that stand for the digits: `SYMBOLS` (heart, star, moon, flower, raindrop, crown, gem, rainbow, unicorn for 1–9), `symbolNameFor(digit)`, and `createIcon` / `showSymbol`, which draw from the SVG sprite at the top of `index.html` with `<use>`. Boards keep the numbers; only the page shows pictures. Each picture has its own silhouette and outline, so colour is never the only cue.
6. `cells.js` — `createCell`, `borderClassesFor` and `showCellPicture`: how a board cell is drawn, shared by the game and the lesson.
7. `mascot.js` — "Stardust", a young unicorn still learning magic, who cheers the player on. Exposes `stardust(event)` and `silenceStardust()`. Events: `start`, `select`, `rotate` (the board twirled), `right`, `sweep` (a row, column or box completed), `wrong`, `erase`, `won`, `finished`; she comments on `select`, `right` and `rotate` only half the time. Has its own per-language line tables (`LINES`) and `MOODS` (`happy`, `thinking`, `celebrating`, `comforting`, `oops`). Mood SVGs are inline in `index.html`, share the `#stardust-head` drawing in the sprite, and are switched via `#mascot[data-mood]`. She never nags, shoves or shakes the board.
8. `lesson.js` — the first lesson: two 4x4 boards (one, then two empty cells) where the row, column and box around the empty cell light up. `openLesson(onClose)` and `isLessonOpen()`; while it is open the game behind it is `inert`. It never touches the game state, oopsies or stars.
9. `game.js` — game flow and rendering. The levels are data: `LEVELS` has one entry per level, `{ land, shape, clues, twirlEvery }` (`twirlEvery` is the number of correct digits between twirls, `null` for none; lands are not shown yet), read through `levelSettings(level)` and `currentShape()`. A single `state` object (`level`, `puzzle`, `solution`, `board`, `oopsies`, `wandsUsed`, `twirls`, `status`: one of `STATUS`, which is `playing`, `won` or `finished`) is the source of truth and is saved as JSON, so its keys must not be renamed. `oopsies` counts digits that did not match the solution; `wandsUsed` is reserved and stays 0. Every change calls `saveGame()` then `refreshGame()` (board, stats, twirl, overlay), then notifies Stardust (`stardust(stardustReactionTo(...))`: the level ending wins over a sweep, a sweep over a twirl, a twirl over right or wrong); `showLevel()` builds the cells and number buttons for the level's board size and uses `refreshGameWithoutAnimation()` on start and reload.
   - **Twirl:** when the correct digits on the board reach the next multiple of `twirlEvery`, `state.twirls` goes up and the board's `--rot` follows it; the board glows (`twirl-soon`) one correct digit before. Counting the board, not key presses, means re-entering a digit cannot farm twirls.
   - **Sweep:** a correct digit that completes a row, column or box plays a wave over its cells and a short banner named after how the line looks on the turned board (`visibleKindOf`).
   - **Stars:** finishing a level earns the stars in `STARS` (one for finishing, one for at most `CAREFUL_OOPSIES_LIMIT` oopsies). They are kept per level in a separate `progress` object (`{ starsByLevel, lessonDone }`) and `keepBestStars` never lowers them; the level-complete overlay lists every star.
   - **Lesson:** `needsLesson()` shows the lesson on a first visit. `lessonDone` is `null` in progress saved before the lesson existed; start-up then sets it, counting players with stars or a game in progress as done, and saves it at once so a lesson left halfway comes back. The `?` button replays it, and keys are ignored while it is open.

When adding a user-visible string, add it to **both** `en` and `da` (in `i18n.js`, or `LINES` in `mascot.js`). A new picture needs a `<symbol>` in the sprite and a name in `symbolNames` in both languages.

## Subagents

`.claude/agents/` holds the project's subagents. Only the creative director changes code; the other three read, test or research and report:

- **`creative-director`** owns how engaging the game is. It preloads the project skills in `.claude/skills/`: `stardust-voice`, `game-feature`, `level-design`, `playtest` and `ship-change`. The skills also work on their own in any session. Changes from the agent arrive as one pull request per idea; `main` is protected and the owner merges.
- **`code-reviewer`** reviews a pull request against `.claude/rules/clean-code.md` (including DRY, KISS and YAGNI) and posts its findings as review comments. It never edits, approves or merges.
- **`manual-tester`** plays the whole game in the browser preview with the `playtest` skill and reports whether it is fully playable, with bugs ranked by severity. It never fixes code.
- **`game-researcher`** researches the puzzle-game market and the psychology of engagement and addiction, and proposes ranked, sourced ideas, steering clear of manipulative dark patterns. It never changes the game; the creative director builds what the owner picks.

## Claude Code settings

`.claude/settings.json` is shared through git: it allows the routine build, test and read-only git/`gh` commands without prompting, and denies pushing to `main`, force-pushing and merging pull requests. Personal settings go in `.claude/settings.local.json`, which git ignores. Connectors such as Google Drive belong to the user's claude.ai account, not to this repo; agents without a `tools:` line inherit them.
