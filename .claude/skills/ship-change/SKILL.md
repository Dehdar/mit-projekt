---
name: ship-change
description: Deliver a finished change to Rotating Sudoku as a pull request for the owner to review. Use when a change is ready to commit; never push directly to main.
---

# Shipping a change

`main` is protected: changes reach it through a pull request that the owner (@Dehdar) reviews and merges. Never push to `main`, never force-push, and never merge your own pull request.

## Steps

1. **One idea per pull request.** If you made several unrelated changes (for example new Mochi lines and a new level rule), split them into separate branches and PRs so each can be approved or rejected on its own.
2. **Branch** from an up-to-date `main` with a short descriptive name: `creative/<topic>`, for example `creative/sharper-mochi-lines`.
3. **Check** that the full test suite passes:

   ```bash
   dotnet test tests/RotatingSudoku.UiTests
   ```

   Do not open a PR with failing tests.
4. **Commit** in English, imperative mood, with a short subject line and a body that says *why*. End the message with the co-author line given in the session's instructions.
5. **Push** the branch and **open the PR** with the GitHub CLI (`gh`; if it is not on the PATH, use `"C:\Program Files\GitHub CLI\gh.exe"`):

   ```bash
   git push -u origin creative/<topic>
   gh pr create --base main --title "<what changes for the player>" --body-file <file>
   ```

## The PR description

Write it for the owner, who decides as a game designer, not as a code reviewer:

- **What the player will notice**, in one or two sentences.
- **Why it makes the game more engaging.**
- **Before and after** for copy changes (for example old and new Mochi lines), and a screenshot for visual changes.
- **Risks**, such as a change to the save format or to difficulty.
- **How it was tested**: the test results and what you checked in the playtest.

End the description with the attribution line given in the session's instructions.
