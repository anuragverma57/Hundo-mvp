---
description: Gate C — close a phase: full test run, self-review, update progress, hand over the manual test checklist
argument-hint: <phase number, e.g. 2>
---

Finish phase $ARGUMENTS following AGENTS.md §0 Gate C exactly.

1. Confirm every task in `docs/phases/phase-$ARGUMENTS-*.md` is ticked. List any that are not and
   stop if they are required for the Definition of Done.
2. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration && pnpm test:e2e`.
   Show the summary. Fix failures; never skip or weaken tests.
3. Review the full diff of this phase for: correctness bugs, missing `requireRole()` or outlet
   scoping, missing RLS policies, client-sent prices or status, floats in money, timezone or
   midnight-hours mistakes, hardcoded colors/fonts outside tokens.css, Demo-only code reachable in
   live mode. Fix what you find and re-run step 2.
4. Tick the Definition of Done in the phase file. Set PROGRESS.md to "Awaiting manual test".
5. Print the **Manual test checklist** for me:
   - the deployed/preview URL and how to run locally;
   - the test accounts to use;
   - numbered steps with the exact expected result for each;
   - which device/viewport for each step;
   - anything you could not verify automatically.
6. Stop and wait for my results. For each failed item: reproduce with a failing test, fix, then
   repeat from step 2 and give me only the items to re-test.
7. Mark the phase "Done (user signed off)" with the date only after I explicitly say it passes.
