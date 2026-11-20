# Decisions log

Every answered open question and every notable technical decision, newest at the bottom of each
phase. Format:

```
### D-<phase>.<n> — <short title>   (answers Q<phase>.<n> | technical)
Date: YYYY-MM-DD · Decided by: <name>
Decision: <what was decided, precisely — numbers, rules, copy>
Why / notes: <optional>
```

Precedence: DECISIONS.md overrides AGENTS.md, which overrides PRD.md.

---

## Phase 0 — Docs & assets

### D-0.1 — Repo layout for existing files   (technical)
Date: 2026-11-20 · Decided by: agent
Decision: PRD moved to `docs/PRD.md`; scraper moved to `scripts/scrape-brand-assets.mjs` (path
the PRD specifies).

### D-0.2 — Scraper fixes   (technical)
Date: 2026-11-20 · Decided by: agent
Decision: Fixed four bugs in `scripts/scrape-brand-assets.mjs`:
1. Catastrophic regex backtracking on Squarespace's ~845 KB inline base64 data URIs (the script hung
   at 100 % CPU). Data URIs are now stripped before analysis, and button rules are parsed linearly.
2. No fetch timeout. Added 30 s.
3. `&quot;` HTML entities leaked into image URLs, which duplicated 7 images as `*_quot_` files.
4. Squarespace's built-in fonts (Source Code Pro, Abel, UI/icon fonts) were downloaded (57 files)
   even though the site overrides them. Now skipped; they are still listed in the report.

### D-0.3 — Brand tokens source   (technical)
Date: 2026-11-20 · Decided by: agent
Decision: Draft tokens in `src/styles/tokens.css` come from the site's Squarespace variables and
its custom CSS (see docs/BRAND.md). They are drafts until confirmed in DevTools and approved by
Hundo (Q1.8–Q1.10).

### D-0.4 — Git repository   (partly answers Q1.3)
Date: 2026-11-20 · Decided by: Anurag Verma
Decision: Code lives at https://github.com/anuragverma57/Hundo-mvp (public), default branch `main`.
This clone pushes as `anuragverma57` through a repo-local credential helper
(`gh auth token --user anuragverma57`), because the machine's active `gh` account is different.
Still open for Phase 1: PR-per-phase workflow, GitHub Actions CI.

### D-0.5 — Commercial font files not committed   (technical)
Date: 2026-11-20 · Decided by: agent
Decision: `public/brand/fonts/` (TheMixMono, LucasFonts) is gitignored, because the repo is public and
the font licence doesn't allow redistribution. Each machine re-downloads the fonts with
`node scripts/scrape-brand-assets.mjs`. Phase 1 must decide how fonts reach the Vercel build
(private storage, a private repo, or the approved fallback font). Linked to Q1.8.

---

## Phase 1 — Foundation
_(filled at Gate A)_

## Phase 2 — Location, menu, cart

## Phase 3 — Checkout & payments

## Phase 4 — Operations core

## Phase 5 — Delivery, riders, push

## Phase 6 — Admin completeness

## Phase 7 — Dashboard & hardening

## Phase 8 — Demo, approval, go-live
