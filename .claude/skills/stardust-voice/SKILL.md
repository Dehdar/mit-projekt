---
name: stardust-voice
description: Write, review and improve the lines of Stardust, the young unicorn in mascot.js, so they are warm, funny, varied and in character, in both English and Danish. Use when asked to add, change or review Stardust's lines, moods or personality.
---

# Stardust's voice

Stardust is the game's personality. Children aged 6–12 hear her after almost every tap, so her lines shape how the game feels as much as the puzzles do.

## Who Stardust is

- A young unicorn who is still learning magic. Her spells go slightly wrong: she sneezes glitter, her wand slips, a rainbow comes out as soup. That is her humour, and the joke is always on her.
- The child is the expert; Stardust is the happy helper who holds the crayons.
- **Praise the method, not the child.** Name what they did ("You checked the row and the column!"), not what they are ("You're so clever!").
- **Comfort after a mistake.** A wrong picture is practice, never a failure. Point gently to where to look ("Check the row for a twin."), or share that her own spells wobble too.
- She reacts to what just happened; a line that fits any event is a weak line.

## Hard rules

- **Never nag.** No idle begging, no "hurry", no sad face when the child stops, no "don't go", no "come back tomorrow", no guilt about breaks. The game has no idle event on purpose.
- **Never sarcastic, never blames.** No taunts, no "wrong!", no swearing symbols, no teasing about speed.
- **No numbers.** The board shows pictures (heart, star, moon, flower, raindrop, crown, gem, rainbow, unicorn), so lines talk about pictures, rows, columns and boxes, never digits.
- **No time pressure or losing.** There is no clock and no game over.
- **For every child.** Unicorns and rainbows are the theme, but no line assumes the player's gender.

## Where the lines live

- `LINES` in `mascot.js`: one table per language (`en`, `da`), one array per event.
- Events and when they fire: `start` (level begins), `select` (empty cell picked), `right` / `wrong` (picture placed), `sweep` (a row, column or box completed), `erase`, `rotate` (the board twirls after enough correct pictures), `won` (level complete), `finished` (all levels done).
- One picture gets one reaction: the level ending wins over a `sweep`, a `sweep` over a twirl (`rotate`), and a twirl over `right` or `wrong`.
- She comments on `select`, `right` and `rotate` only half the time (`FREQUENT_EVENTS`), so she does not chatter; `wrong` always gets a comforting line.
- `MOODS` maps each event to a face: `happy` (resting and `start`), `thinking` (`select`), `celebrating` (`right`, `sweep`, `won`, `finished`), `comforting` (`wrong`, `erase`), `oops` (`rotate`). A line must fit the face it is shown with.
- `pickLine` never repeats the previous line, but small arrays still feel repetitive. Frequent events (`start`, `select`, `right`, `wrong`, `rotate`) need the most lines: at least five each.

## What makes a good line

- **Short.** Fits the speech bubble in one to three lines on a phone: aim for 60 characters, never above 90.
- **Simple words** a six-year-old knows when it is read aloud.
- **One idea per line**, with any joke at the end.
- **Specific to the event** and, where possible, to pictures, lines or the twirl ("Achoo! I sneezed glitter and the board did a twirl.").
- **Varied rhythm:** mix one-word cheers, questions and tiny stories so a run of lines does not sound the same.

## Process

1. Read every line for the events you are working on, in both languages.
2. Rate each line: keep, sharpen or replace, against the hard rules first. Say briefly why for anything you change.
3. Write new lines in English first, then write the Danish lines **as Danish**, not word-for-word translations. Wordplay should work in each language; the two arrays do not need the same length or the same jokes.
4. Keep every event key present in both `en` and `da`.
5. Check the `MOODS` face still fits each changed event.
6. Run the UI tests (`dotnet test` in `tests/RotatingSudoku.UiTests`). `StardustTests` checks that every event has lines in both languages and that no line contains a digit, and that she speaks and goes quiet.
7. Play a level with the `playtest` skill and read the lines in the bubble in both languages: check they fit, are not cut off at phone width, and suit the face.

## Adding a new event or mood

A new event (for example an offer of the magic wand) is a feature, not just copy: follow the `game-feature` skill, call `stardust("newEvent")` from `game.js`, add the event to `MOODS` and to both `LINES` tables, and add a UI test that she reacts. A new mood also needs an inline SVG in `index.html` (reuse the `#stardust-head` drawing) and a `#mascot[data-mood]` rule in `style.css`, with its animation stopped under `prefers-reduced-motion`.
