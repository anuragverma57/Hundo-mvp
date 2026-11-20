---
description: Gate A — open a phase: check prerequisites, ask its open questions, record decisions, plan tasks
argument-hint: <phase number, e.g. 2>
---

Start phase $ARGUMENTS following AGENTS.md §0 Gate A exactly.

1. Read `docs/PROGRESS.md`. If the previous phase is not "Done (user signed off)", stop and tell me
   what is outstanding. Do not continue.
2. Read `docs/phases/phase-$ARGUMENTS-*.md`, `docs/DECISIONS.md`, and the PRD sections the phase file
   references. Skim the current code so your questions reflect reality.
3. Build the list of **unanswered** open questions: those in the phase file with no matching
   `D-$ARGUMENTS.x` entry in DECISIONS.md, plus any new product/business question you found
   (PRD gaps, contradictions, things the code now makes concrete).
4. Ask them with AskUserQuestion, at most 4 per call, batching until all are asked. For each,
   put your recommended option first, marked "(Recommended)", with a one-line reason. If a question
   needs data (outlet list, prices, pincodes), ask me to paste it or point to a file.
5. Write every answer to `docs/DECISIONS.md` under the phase heading as `D-$ARGUMENTS.<n>`,
   quoting the question ID it answers.
6. Set the phase to "In progress" in `docs/PROGRESS.md` with today's date.
7. Produce the implementation plan as a todo list (vertical slices, tests included in each slice),
   show it to me, then start building.
