# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Rotating Sudoku: a standalone browser game in plain HTML/CSS/JavaScript, with the game files at the repository root. The board rotates 90° every 10 s; 20 levels with fewer clues and less time per level. The game rules are in the "Rules" section of `README.md`; read it before changing them.
The game itself has no build step, no package manager, no dependencies and no linter; only the UI tests (C#/.NET) need building.
It is published with GitHub Pages from the root of `main` (https://dehdar.github.io/rotating-sudoku/); `.nojekyll` makes Pages serve the files as they are.

## Running

Open `index.html` directly in a browser, or serve the repo root with any static server. `tools/serve.ps1` is a dependency-free static server (PowerShell 7, `HttpListener`): `pwsh -File tools/serve.ps1` (defaults: root `.`, port 5173). `.claude/launch.json` defines the `sudoku` preview server using it.

## UI tests

Playwright for .NET with NUnit, in `tests/RotatingSudoku.UiTests/` (.NET 10 SDK; Node.js is not installed). Run from that folder:

```bash
dotnet test
dotnet test --filter "FullyQualifiedName~MochiTests"
dotnet test --filter "Name=TimeCountsDownEverySecond"
```

The first time on a new machine, build and install the browser with `pwsh bin/Debug/net10.0/playwright.ps1 install chromium`.

- Tests open `index.html` from the repo root straight from disk (`file://`), so no server is needed.
- `SudokuTest` (base class) makes every test repeatable: it installs Playwright's fake clock paused, so time only moves with `Game.WaitSecondsAsync`, and fixes `Math.random` at 0.4, so puzzles are fixed and Mochi always comments but never pushes.
- `SavedGame` seeds a known board into `localStorage` (two empty cells by default, so one entry does not win); `SudokuPage` is the page object holding locators and user actions. Assertions stay in the test classes.
- The game exposes test hooks only where nothing user-visible identifies an element: `data-testid="cell"` / `"board"`; Mochi's bubble has `role="status"`.

## Conventions

- **Language:** everything is in English: code, comments, docs, commit messages and the default UI language. Danish exists only as a UI translation (`da` in `i18n.js`, `LINES.da` in `mascot.js`). The game is called "Rotating Sudoku" in both languages.
- **Persistence:** progress is saved to `localStorage` under `rotating-sudoku` and the language under `rotating-sudoku-language`. All access goes through `readStorage` / `writeStorage`, which tolerate storage being unavailable, and loaded data is validated. If you change the saved state shape, keep loading older saves working (see the `solution` backfill in `resumeOrStartGame` in `game.js`) or bump the key.
- No frameworks or ES modules; keep it that way unless asked.
- **Clean Code:** all code follows Robert C. Martin's *Clean Code*; the concrete rules are in `.claude/rules/clean-code.md` and load only when working on code files (not Markdown).
- **UI tests:** every change adds, updates or removes UI tests, and the tests follow Clean Code too; the rules are in `.claude/rules/ui-tests.md`.

## Rotating Sudoku architecture

Classic scripts loaded in order from `index.html`, sharing globals (order matters, each may only use what loads before it):

1. `storage.js` — `readStorage` / `writeStorage`, `localStorage` wrapped in `try/catch`.
2. `dom.js` — `forceReflow` and `restartAnimation(element, className)`, used to replay CSS animations.
3. `i18n.js` — `TRANSLATIONS.da` / `TRANSLATIONS.en`, `translate(key, ...args)` (entries may be functions taking args), `currentLanguage`, `toggleLanguage`, `translatePage`. Static text in the HTML is translated via `data-i18n="key"` attributes.
4. `sudoku.js` — pure board logic with no DOM access: a board is an 81-number array, `EMPTY` is 0. Puzzle generation (`makePuzzle` removes digits only while `hasUniqueSolution` holds), `solvePuzzle`, `findConflicts`, `isSolved`, and the row/column/box helpers.
5. `mascot.js` — "Mochi" the cat, who taunts the player. Exposes `mochi(event)` and `silenceMochi()`. Events: `start`, `select`, `rotate`, `right`, `wrong`, `erase`, `won`, `lost`, `finished`, plus internal `slow` and `push`. Has its own per-language line tables (`LINES`), an idle timer and a random "shove" that shakes the board. Mood SVGs are inline in `index.html` and switched via `#mascot[data-mood]`.
6. `game.js` — game flow and rendering. A single `state` object (`level`, `puzzle`, `solution`, `board`, `timeLeft`, `status`: one of `STATUS`) is the source of truth and is saved as JSON, so its keys must not be renamed. Every change calls `saveGame()` then `refreshGame()` (board, stats, rotation, overlay, timer), then notifies the mascot; `refreshGameWithoutAnimation()` is used on start and reload. Rotation is derived from elapsed time (`ROTATE_EVERY_SECONDS`), not stored. The difficulty curve lives in `levelSettings(level)`.

When adding a user-visible string, add it to **both** `en` and `da` (in `i18n.js`, or `LINES` in `mascot.js`).

## Creative director agent

`.claude/agents/creative-director.md` is a subagent that owns how engaging the game is. It preloads the project skills in `.claude/skills/`: `mochi-trash-talk`, `game-feature`, `level-design`, `playtest` and `ship-change`. The skills also work on their own in any session. Changes from the agent arrive as one pull request per idea; `main` is protected and the owner merges.
