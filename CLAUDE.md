@AGENTS.md

# Claude Code specifics

All project rules are in AGENTS.md (imported above). These notes add Claude Code mechanics only.

- **Starting a phase:** run `/start-phase N`. It performs Gate A: reads the phase file, collects
  unanswered open questions and asks them with the AskUserQuestion tool (recommended option
  first), records answers in `docs/DECISIONS.md`, then plans tasks.
- **Finishing a phase:** run `/finish-phase N`. It performs Gate C: full test run, self-review
  (use `/code-review` on the phase diff), PROGRESS.md update, and prints the manual test
  checklist. Then it **stops and waits** for the user's results.
- Track phase tasks with the todo list; mirror completed tasks as `[x]` in the phase file.
- When a product question comes up mid-task, stop and ask — do not pick a default silently,
  even in auto mode.
- Before claiming anything works, run the relevant tests and show the result. If something was
  not verified (for example, it needs a real phone), say so explicitly and add it to the manual
  checklist.
- Use the `run` skill or Playwright to look at UI changes on a mobile viewport before handing over.
