# AGENTS.md — Rules for any AI agent or developer working on Hundo

This file is the single source of truth for **how** we build. The **what** lives in
[docs/PRD.md](docs/PRD.md). The **order** lives in [docs/PLAN.md](docs/PLAN.md) and
[docs/phases/](docs/phases/). Answered questions live in [docs/DECISIONS.md](docs/DECISIONS.md).
Phase status lives in [docs/PROGRESS.md](docs/PROGRESS.md).

If this file, the PRD and a decision in DECISIONS.md disagree, the order of precedence is:
**DECISIONS.md → AGENTS.md → PRD.md**. If you notice a conflict, stop and ask; do not pick one silently.

---

## 0. The phase workflow (mandatory, never skip)

The project is built in phases (`docs/phases/phase-N-*.md`). Every phase has three gates.

### Gate A — Before writing any code in a phase
1. Read the phase file, `docs/PROGRESS.md` and `docs/DECISIONS.md`.
2. Confirm the previous phase is marked **Done (user signed off)** in PROGRESS.md. If not, stop.
3. List every **Open question** in the phase file that has no answer in DECISIONS.md, plus any new
   question you discovered while reading the code/PRD. Ask the user all of them **in one batch**,
   each with a recommended default and why.
4. Wait for answers. Record each answer in DECISIONS.md (`D-<phase>.<n>`), then mark the phase
   **In progress** in PROGRESS.md.
5. **Never guess a product/business decision** (prices, rules, copy, who-can-do-what, limits,
   timings, data shown to whom). If a new one appears mid-phase, stop and ask.
   Purely technical choices that stay inside these rules (naming, file layout inside a folder,
   which helper to write) you decide yourself; log the non-obvious ones in DECISIONS.md.

### Gate B — While building
- Build in vertical slices (DB → server function → action → UI → test), not layer by layer.
- Every task in the phase file is checked off in the phase file as it lands.
- Tests are written with the code, not after (see §3).

### Gate C — Finishing a phase
1. Run the full check: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration && pnpm test:e2e`.
   All green, nothing skipped, no `.only`.
2. Self-review the phase diff for bugs, security (RLS, `requireRole`, outlet scoping) and rule
   violations in this file. Fix what you find.
3. Update PROGRESS.md (status **Awaiting manual test**), and tick the phase's Definition of Done.
4. Give the user the **Manual test checklist** from the phase file — plus anything you added —
   with exact URLs, test accounts, and expected results. Tell them which device to use.
5. Wait. For every failed item: write a failing test that reproduces it, fix, re-run Gate C.
6. Only when the user explicitly says the phase passes, mark it **Done (user signed off)** with
   the date. Do not start the next phase before that.

---

## 1. Architecture rules (from PRD §9)

1. **One Next.js app** (App Router, TypeScript `strict`), one repo, one DB, one deployment.
   No microservices, separate backend, Redis, queues, WebSocket servers or caching layers. Add
   infrastructure only for a measured problem, and only after asking.
2. **Supabase Postgres is the only database.** Firebase is used **only** for FCM push. Never store
   app data in Firestore, localStorage-as-database, or anywhere else.
3. **Prisma** does all server-side reads/writes (pooled connection). The Supabase JS client is used
   in the browser only for Auth session, Realtime and Storage — all of which go through RLS.
4. **Business logic lives only in `src/server/`.** Pages, Server Actions and Route Handlers are
   thin: `zod.parse(input)` → `requireRole(...)` → call one function in `src/server/` → return.
   Every file in `src/server/` starts with `import "server-only"`.
5. **Order status changes only through `transitionOrder()`** (`src/server/orders/`). No other code
   writes `Order.status`. Each transition: validates the state machine (PRD §7.1) and the role
   table (PRD §7.2), runs in a DB transaction, writes `OrderStatusHistory` (from, to, actor,
   reason, timestamp), then calls `notify()`.
6. **Vendor SDKs are imported only in `src/server/providers/*`** (otp, payments, maps, push),
   plus `src/lib/supabase/*` and `src/lib/firebase/*`. Everything else imports from
   `src/server/providers/index.ts`.
7. **Environment variables** are read only through `src/lib/env.ts` (Zod-validated at boot).
   Boot guard: if `APP_MODE=live` and any provider is `mock`, the app refuses to start and logs
   which one.
8. Next.js: the PRD says `middleware.ts`. Use whatever the installed Next.js version calls it
   (`proxy.ts` in Next 16+). Middleware/proxy is a convenience only — never the security boundary.

## 2. Domain rules

### Money
- All money is **integer paise** (`Int`), never floats, never rupees in the DB.
- Total = Σ((item base price + option deltas) × qty) + delivery fee + packaging + GST
  (exact GST/fee rules: see DECISIONS.md).
- **The client never sends prices or totals.** It sends item IDs, option IDs, quantities.
  The server recomputes everything at cart display and again at order creation.
- Prices and names are snapshotted on `OrderItem`; the address is snapshotted on `Order`.

### Orders
- State machine (PRD §7.1):
  `PENDING_PAYMENT → PLACED | PAYMENT_FAILED`; `PLACED → CONFIRMED | CANCELLED`;
  `CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED`;
  any active → `CANCELLED` (Super Admin only). COD orders start at `PLACED`.
- Allowed roles per transition: PRD §7.2. `READY → OUT_FOR_DELIVERY` requires an assigned rider.
- Customer may cancel only in `PLACED`. Rejecting/cancelling a prepaid order triggers a full refund.
- `PENDING_PAYMENT` older than 15 min → `PAYMENT_FAILED` (cron).
- Order creation and payment confirmation are **idempotent** (safe to retry). Webhooks are
  idempotent by provider event ID.

### Routing (PRD §7.3)
- Outlets have serviceable pincodes. One match → that outlet. Several → nearest **open** outlet by
  straight-line distance from the address pin. None open → checkout blocked with next opening time.
- The routing decision is stored on the order; only Super Admin can change it later (A-05).

### Time
- All business time is **Asia/Kolkata**. Store UTC in the DB, convert at the edges.
- Outlet hours cross midnight (11:30 → 04:00). Open/closed checks and "business day" grouping must
  handle this. Never use `new Date().getDay()`-style logic without the outlet-hours helper.

### Access & privacy
- Roles: `CUSTOMER, SUPER_ADMIN, OUTLET_MANAGER, KITCHEN, RIDER` (+ `outletId` for staff).
- Permissions: PRD §2.1. Every Server Action / Route Handler calls `requireRole()`.
- **Every staff query is scoped by `outletId`** (Super Admin excepted).
- **RLS is enabled on every table**; policies live in migrations next to the schema.
- The Supabase service-role key is server-only and never reaches the browser.
- Riders see a customer's phone only for orders assigned to them, until delivery + 2 hours.
- Never log OTPs, full phone numbers, payment signatures or secrets.

### Demo Mode (PRD §15)
- `APP_MODE=demo`: on-screen OTP, "Continue as" quick logins, simulated payments, demo banner on
  every screen, orders get `isDemo = true`.
- `APP_MODE=live`: none of the demo features may exist in any response (server-side checks, not
  just hidden UI).

### Realtime & push
- Screens subscribe only through the `useOrderUpdates` hook. On every change event it **refetches
  through the server** (never trusts the raw payload). Falls back to 15 s polling when the channel
  drops; refetches on reconnect and on window focus.
- Push is sent server-side by `notify()` after a transition or rider assignment. Invalid tokens are
  deleted. The app must work fully with push off.

## 3. Quality rules — "bug-free" is a process, not a hope

1. **Unit tests (Vitest)** for every function in `src/server/`. Mandatory edge cases:
   - pricing: option deltas, quantity, rounding of GST in paise, min order, COD cap, empty cart,
     unavailable/inactive item or option, option from another item, min/max select violations;
   - routing: 0/1/many outlets, closed outlets, ties, hours across midnight (23:59, 00:00, 03:59,
     04:00, 11:29, 11:30), manual close override;
   - state machine: every allowed transition per role, every disallowed one, double-submit,
     concurrent transitions.
2. **Integration tests** against a local Supabase (Docker) for RLS: customer A cannot read B's
   orders; staff of outlet X cannot read outlet Y; rider sees only assigned orders; anon sees nothing
   private. Plus transaction/idempotency tests for order creation and payment confirmation.
3. **Playwright e2e**: each phase adds its flow; the full login → delivered path for COD and online
   payment must stay green from Phase 5 onward. Run on a mobile viewport for customer/rider.
4. Every bug fix starts with a failing test that reproduces it.
5. Never delete, skip or weaken an existing test to make it pass. If a test is wrong, say so and ask.
6. `pnpm typecheck` with `strict` and no `any` in `src/server/`. No `// @ts-ignore` without a
   comment explaining why.
7. Zod on every Server Action and Route Handler input, including webhooks (after signature check).
8. Each phase ends with Gate C (§0). CI runs the same commands on every PR.

## 4. Design rules (PRD §14, details in [docs/BRAND.md](docs/BRAND.md))

- The app must look like hundopizza.com. Tokens are defined **once** in `src/styles/tokens.css`
  and mapped into Tailwind. **No hex value, font family or radius anywhere else.**
- Fonts: TheMixMono-9-Black (headings, nav, buttons), TheMixMono-5-Regular (body).
- One primary and one secondary button style, both from the website. The default shadcn look must
  not ship.
- Order status chips use brand colors **plus an icon**; meaning never depends on color alone.
- Veg/non-veg uses the standard Indian green/brown symbols.
- Copy voice: short, bold, playful, food-forward — for item text, empty states, errors and pushes.
- Platforms: customer & rider = mobile-first PWA (360–430 px); kitchen = 10" tablet landscape;
  admin & outlet manager = desktop ≥ 1280 px (must still work on a phone for emergencies).
- Mobile tap targets ≥ 44 px. WCAG AA contrast (white text on brand red is only 4.4:1 — see
  BRAND.md for where it is allowed).

## 5. Scope discipline

MVP scope is PRD §3.1. **Do not build Phase-2 items** (live GPS map, coupons, ratings, WhatsApp/SMS
notifications, marketing push, scheduled orders, catering flow, loyalty, advanced analytics, auto
rider assignment, offline menu caching) unless the user explicitly moves one into scope and it is
recorded in DECISIONS.md.

## 6. Commands (created in Phase 1)

| Command | Purpose |
|---|---|
| `pnpm dev` | Run app locally |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:integration` | Tests against local Supabase (RLS, transactions) |
| `pnpm test:e2e` | Playwright |
| `pnpm db:migrate` / `pnpm db:seed` | Prisma migrations / seed (menu, outlets, test users) |
| `pnpm brand:scrape` | `node scripts/scrape-brand-assets.mjs` |
| `pnpm purge:demo` | Delete demo orders + test accounts (go-live only) |

## 7. Repo map

```
AGENTS.md / CLAUDE.md        rules (this file) / Claude-specific notes
docs/PRD.md                  product requirements (v1.2)
docs/PLAN.md                 phase plan overview
docs/phases/phase-N-*.md     per-phase: open questions, tasks, tests, manual checklist
docs/DECISIONS.md            answers to open questions + notable technical decisions
docs/PROGRESS.md             phase status board
docs/BRAND.md                brand assets catalogue + extracted design tokens
scripts/                     scrape-brand-assets.mjs, purge-demo.ts
public/brand/                scraped assets (images, fonts, css) + app/ derived logos
public/icons/                PWA icons + splash (drafts, pending Hundo approval)
src/styles/tokens.css        design tokens (draft from scrape)
brand-report.json            scraper output
```
