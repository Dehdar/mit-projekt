---
name: mochi-trash-talk
description: Review and rewrite Mochi the cat's trash-talk lines in mascot.js so they are funnier, more varied and more in character, in both English and Danish. Use when asked to improve, add or review Mochi's lines, jokes, taunts or personality.
---

# Mochi's trash talk

Mochi is the game's personality. Her lines are the main thing players quote and remember, so they deserve the same care as the gameplay.

## Where the lines live

- `LINES` in `mascot.js`: one table per language (`en`, `da`), one array per event.
- Events and when they fire: `start` (level begins), `select` (empty cell picked, commented ~50% of the time), `rotate` (the board twirls after enough correct digits, ~50%), `right` / `wrong` (digit entered), `erase`, `push` (she shoves the board, ~30% of `wrong`, or when clicked), `won` (level complete), `finished` (all levels done).
- One digit gets one reaction: the level ending wins over a `sweep`, a `sweep` over a twirl (`rotate`), and a twirl over `right`.
- There is no clock and no game over, so lines must not mention time running out, being slow or losing.
- `MOODS` maps each event to a face: `trash` (smug), `shocked`, `curious`. A line must fit the face it is shown with.
- `pickLine` never repeats the previous line, but small arrays still feel repetitive. Frequent events (`select`, `wrong`, `right`, `rotate`) need the most lines.

## Who Mochi is

- A smug, theatrical house cat who is convinced she is smarter than the player.
- She is rude to the *player's sudoku skills*, never to the player as a person. No insults about intelligence, looks, age, gender, nationality or anything outside the game.
- Cat logic is her best material: naps, knocking things off tables, treats, judging from a high shelf, 3 a.m. zoomies.
- When the player does well she is in denial ("That doesn't count, I wasn't looking"), not supportive. The grudging respect is the joke.
- She reacts to what just happened; a generic line that fits any event is a weak line.

## What makes a good line

- **Short.** Fits the speech bubble in one or two lines: aim for 60 characters, never above 90.
- **One joke per line**, punchline at the end.
- **Specific to the event** and, where possible, to sudoku or rotation ("Row 3 called. It wants its 7 back.").
- **Varied rhythm**: mix one-word reactions, questions and short stories so a run of lines does not sound the same.
- **Family-friendly**: no swearing, no mean-spirited humour. A ten-year-old and a grandparent should both smile.

## Process

1. Read every line for the events you are working on, in both languages.
2. Rate each line: keep, sharpen or replace. Say briefly why for anything you change.
3. Write new lines in English first, then write the Danish lines **as Danish jokes**, not word-for-word translations. Puns and idioms should work in each language; the two arrays do not need the same length or the same jokes.
4. Keep every event key present in both `en` and `da`; `pickLine` breaks if an array is empty.
5. Check the `MOODS` face still fits each changed event.
6. Run the UI tests (`dotnet test` in `tests/RotatingSudoku.UiTests`). The Mochi tests only check that she speaks or goes quiet, so line changes should not break them; if they do, something structural changed.
7. Play a level with the `playtest` skill and read the lines in the bubble: check they fit and are not cut off on a narrow screen.

## Adding a new event

A new event (for example a comment on a streak of correct digits) is a feature, not just copy: follow the `game-feature` skill, call `mochi("newEvent")` from `game.js`, add the event to `MOODS` and to both `LINES` tables, and add a UI test that she reacts.
