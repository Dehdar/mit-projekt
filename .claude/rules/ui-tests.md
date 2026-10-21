---
paths:
  - "**/*.{js,mjs,ts,jsx,tsx,cs,html,css}"
---

# UI tests

## Every change keeps the tests in step

- **New behaviour** gets a new test.
- **Changed behaviour** updates the tests that cover it.
- **Removed behaviour** removes its tests; no skipped or commented-out tests are left behind.
- **Refactoring** (no change in behaviour) must pass the existing tests without changing them. If a test breaks, either the refactoring changed behaviour or the test depends on implementation details; fix whichever is wrong.
- A task is not done until the full test suite passes.

## How the tests are written

Tests are code and follow the Clean Code rules too, including Robert C. Martin's F.I.R.S.T. principles:

- **Fast.** Don't wait with fixed sleeps. Use assertions that wait for the expected state, and control time with a fake clock instead of waiting for real timers (the countdown, the 10-second rotation, Mochi's idle timer).
- **Independent.** Each test starts from a clean page and empty `localStorage`, and never relies on another test having run first.
- **Repeatable.** Never depend on randomness. Set up a known board by seeding the saved game in `localStorage` (or stubbing `Math.random`), so the result is the same on every run.
- **Self-validating.** Every test ends in explicit assertions. No logging, and no screenshots to check by eye.
- **Timely.** Write or update the test together with the change, not afterwards.

In addition:

- **Test what the user sees and does.** Find elements by role, label or visible text, as a user would. Use a `data-testid` only when nothing user-visible identifies the element. Don't assert on internal state, CSS classes used only for styling, or function names.
- **One behaviour per test**, with a name that states it (`shows game over when the time runs out`).
- **Arrange, Act, Assert**, in that order and visibly separated.
- **No duplicated setup.** Shared steps like "start a level with this board" or "enter a digit in a cell" go in helper functions or page objects, but assertions stay in the test so it reads on its own.
