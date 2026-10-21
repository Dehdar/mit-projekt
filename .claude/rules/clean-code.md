---
paths:
  - "**/*.{js,mjs,ts,jsx,tsx,cs,html,css}"
---

# Clean Code

All code follows Robert C. Martin's *Clean Code*. In practice here:

- **Names reveal intent.** Pick names that say what something is or does (`levelSettings`, `findConflicts`), no abbreviations or encodings. Functions and methods are verbs, classes and data are nouns. Follow each language's casing (camelCase in JavaScript, PascalCase methods in C#).
- **Small functions that do one thing**, at one level of abstraction. Prefer few arguments; pass an object instead of a long argument list.
- **Single responsibility.** A class or file has one reason to change.
- **No hidden side effects.** A function that looks like a query does not also change state; one that changes state says so in its name.
- **No magic numbers.** Use named constants instead of bare literals (as with `LEVEL_COUNT`, `ROTATE_EVERY_SECONDS`, `IDLE_LIMIT_SECONDS`; in C#, `const` or `static readonly`).
- **DRY.** Extract duplicated logic instead of copying it, but don't build abstractions for a single use.
- **Comments explain *why*, not *what*.** If code needs a comment to explain what it does, rename or extract instead. Comments that remain are written in Danish (see CLAUDE.md).
- **Boy Scout Rule.** Leave the code you touch a little cleaner than you found it, but keep it to the code involved in the task. Don't do large unrequested refactors.
