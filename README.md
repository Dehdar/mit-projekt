# Rotating Sudoku

A calm sudoku with no timer and no game over, where finishing a level earns stars. (It is being rebuilt as Rainbow Kingdom Sudoku, a game for children.) Written in plain HTML, CSS and JavaScript — no frameworks, no build step, no dependencies.

**▶ [Play it in your browser](https://dehdar.github.io/rotating-sudoku/)**

## Rules

- **No timer and no game over.** Take as long as you like; a level only ends when you solve it.
- **20 levels** that get harder as you go: from 44 given digits on level 1 down to 24 on level 20.
- Every puzzle is generated fresh and is guaranteed to have exactly one solution.
- Finishing a level earns **stars**: one for finishing, and a second "careful" star if you made 2 oopsies or fewer (an oops is a digit that is not the right answer, even if you fix it later). Replaying a level can earn more stars but never takes any away.
- Your game and your stars are saved in the browser, so you continue where you left off. The **Reset game** button starts over from level 1 and keeps your stars.
- Fill in a whole row, column or box correctly and it lights up with a **sweep**.
- The board is not rotating for now; the rotation comes back as a "magic twirl" in a later update.
- Mochi the cat keeps you company — and taunts you, and occasionally shoves the board.
- Available in English and Danish (toggle in the game).

## Controls

- Click a cell to select it, then type **1–9** or use the number buttons.
- **Backspace**, **Delete**, **0** or the **Erase** button clears a digit.

## Running it locally

Open `index.html` directly in a browser — that's it.

Alternatively, serve the folder with any static file server. The repo includes one that needs only PowerShell 7:

```bash
pwsh -File tools/serve.ps1
```

Then open <http://localhost:5173/>. Any other static server works too, such as `npx serve` or `python -m http.server`.

## Project structure

```
rotating-sudoku/
├── index.html        Page markup and Mochi's mood SVGs
├── style.css         Styling and animations
├── storage.js        Safe localStorage access
├── dom.js            Small DOM/animation helpers
├── i18n.js           English and Danish translations
├── sudoku.js         Pure board logic: generating, solving, checking
├── mascot.js         Mochi the cat
├── game.js           Game flow, stars and rendering
├── tests/            UI tests (.NET + Playwright, NUnit)
├── tools/serve.ps1   Tiny static server for local play (PowerShell 7)
├── CLAUDE.md         Guidance for Claude Code
└── LICENSE           The Unlicense (public domain)
```

## UI tests

The UI tests live in `tests/RotatingSudoku.UiTests` and use [Playwright for .NET](https://playwright.dev/dotnet/) with NUnit. They require the .NET 10 SDK:

```bash
dotnet test tests/RotatingSudoku.UiTests
```

The first time on a new machine, build once and install the test browser:

```bash
pwsh tests/RotatingSudoku.UiTests/bin/Debug/net10.0/playwright.ps1 install chromium
```

The tests open the game straight from disk, so no server is needed. They use a fake clock and a fixed `Math.random`, so they run in a few seconds and give the same result every time.

## License

This project is released into the public domain under [The Unlicense](LICENSE). You are free to use, copy, modify, publish and distribute everything here, for any purpose, without asking and without giving credit.
