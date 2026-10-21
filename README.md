# mit-projekt

Small browser games written in plain HTML, CSS and JavaScript — no frameworks, no build step, no dependencies. The game ideas (in Danish) are described in [ideer.md](ideer.md).

| Game | Folder | Status |
| --- | --- | --- |
| Rotating Sudoku (*Roterende Sudoku*) | [roterende-sudoku/](roterende-sudoku/) | [Play online](https://dehdar.github.io/mit-projekt/roterende-sudoku/) |
| Typing-speed test (*Skrivehastigheds-test*) | — | Not started |

## Rotating Sudoku

A fast-paced sudoku where the board rotates 90° every 10 seconds, so you constantly have to find your bearings again.

**▶ [Play it in your browser](https://dehdar.github.io/mit-projekt/roterende-sudoku/)**

- **20 levels** that get harder as you go: from 44 given digits and 15 minutes on level 1 down to 24 digits and 6 minutes on level 20.
- Every puzzle is generated fresh and is guaranteed to have exactly one solution.
- If the timer runs out, it's **game over**.
- Your progress is saved in the browser, so you continue where you left off. The **reset** button starts over from level 1.
- Mochi the cat keeps you company — and taunts you, and occasionally shoves the board.
- Available in Danish and English (toggle in the game).

### Controls

- Click a cell to select it, then type **1–9** to fill it in.
- **Backspace**, **Delete** or **0** erases a digit.

### Running it

Open `roterende-sudoku/index.html` directly in a browser — that's it.

Alternatively, serve the folder with any static file server. The repo includes one that needs only PowerShell 7:

```bash
pwsh -File tools/serve.ps1 -Root roterende-sudoku -Port 5173
```

Then open <http://localhost:5173/>. Any other static server works too, such as `npx serve roterende-sudoku` or `python -m http.server -d roterende-sudoku`.

## Project structure

```
mit-projekt/
├── roterende-sudoku/     The Rotating Sudoku game
│   ├── index.html        Page markup and Mochi's mood SVGs
│   ├── style.css         Styling and animations
│   ├── storage.js        Safe localStorage access
│   ├── dom.js            Small DOM/animation helpers
│   ├── i18n.js           Danish and English translations
│   ├── sudoku.js         Pure board logic: generating, solving, checking
│   ├── mascot.js         Mochi the cat
│   └── game.js           Game flow, timer, rotation and rendering
├── tests/                UI tests (.NET + Playwright, NUnit)
├── tools/serve.ps1       Tiny static server for local play (PowerShell 7)
├── ideer.md              Game specifications (Danish)
├── CLAUDE.md             Guidance for Claude Code
└── LICENSE               The Unlicense (public domain)
```

## UI tests

The UI tests live in `tests/RoterendeSudoku.UiTests` and use [Playwright for .NET](https://playwright.dev/dotnet/) with NUnit. They require the .NET 10 SDK:

```bash
dotnet test tests/RoterendeSudoku.UiTests
```

The first time on a new machine, build once and install the test browser:

```bash
pwsh tests/RoterendeSudoku.UiTests/bin/Debug/net10.0/playwright.ps1 install chromium
```

The tests open the game straight from disk, so no server is needed. They use a fake clock and a fixed `Math.random`, so they run in a few seconds and give the same result every time.

## License

This project is released into the public domain under [The Unlicense](LICENSE). You are free to use, copy, modify, publish and distribute everything here, for any purpose, without asking and without giving credit.
