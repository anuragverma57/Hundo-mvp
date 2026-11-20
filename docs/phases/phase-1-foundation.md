# Phase 1 — Foundation & brand shell

**Goal:** a deployed, empty-but-real Hundo app: Next.js + Supabase + Prisma schema with RLS, seeded
data, Demo Mode providers, demo login for every role, role-protected routes, Hundo design tokens and
a PWA shell.
**PRD refs:** §2, §9, §10, §11, §12.1 week 1, §14, §15.

## Open questions (answer before any code — Gate A)

| ID | Question | Recommended default |
|---|---|---|
| Q1.1 | Supabase: who creates the project and shares URL + keys + DB URLs? Region? Free tier for demo? | You create it in **ap-south-1 (Mumbai)**, free tier; share keys via a local `.env` (never committed) |
| Q1.2 | Hosting: Vercel account/team to deploy to? Domain for the demo? | Vercel Hobby/Pro under your account; demo on `*.vercel.app`, real domain in Phase 8 |
| Q1.3 | Git: GitHub org/repo name? PR per phase into `main`, CI on GitHub Actions? | `hundo-app` private repo, one branch + PR per phase, GitHub Actions |
| Q1.4 | Is Docker available on your machine (local Supabase for RLS integration tests)? Package manager? | Yes Docker; **pnpm** |
| Q1.5 | Outlets: name, address, phone, lat/lng, hours, serviceable pincodes for each (PRD Q1). If not yet available, may we seed clearly-fake placeholder outlets? | Seed real data if given; otherwise 3 placeholder outlets (South Mumbai, Bandra, Malad) marked `[DEMO]` |
| Q1.6 | Menu: full item list with categories, descriptions, prices, sizes, crusts, toppings, veg flags. Source (Zomato menu, PDF, spreadsheet)? | Provide a spreadsheet; until then seed a placeholder menu built from the website's items (Pink Sauce / Funghi Fusilli / Cajun Penne pastas, Alt-Dough pizzas) with fake prices marked `[DEMO]` |
| Q1.7 | Test accounts: which fake phone numbers to seed for each role? How many riders per outlet? | `+91 90000 000xx` series; 1 super admin, 1 manager + 1 kitchen + 2 riders per outlet, 1 customer |
| Q1.8 | Fonts: does Hundo hold a **web/app license** for TheMixMono (LucasFonts, commercial) to self-host it in the app? | If yes, self-host the two `.otf` files (converted to woff2). If unsure, use a close free fallback during the demo and switch once confirmed |
| Q1.9 | Contrast: white text on Hundo red (`#EC1C24`) is 4.4:1 — below WCAG AA for small text. Approve: white-on-red only for headings, buttons and text ≥ 18.7 px bold; small text sits on white/cream surfaces? | Approve as described |
| Q1.10 | App icon: use the secondary "100" logo (draft in `public/icons/`) as the PWA icon? | Yes, pending Hundo approval in Phase 8 |
| Q1.11 | Firebase project for FCM: create now or in Phase 5? | Phase 5; `PUSH_PROVIDER=off` until then |
| Q1.12 | Sentry now or Phase 7? | Phase 7 |
| Q1.13 | Demo banner copy: use PRD text "Demo mode: OTPs are shown on screen and payments are simulated."? | Yes |
| Q1.14 | Add `Order.isDemo` (PRD §15.4 needs it; §10 omits it)? | Yes, `Boolean @default(false)`, indexed |

## Tasks

### Setup
- [ ] Next.js (latest stable, App Router, TS strict), pnpm, ESLint, Prettier, Vitest, Playwright
- [ ] `src/lib/env.ts` with Zod-validated env + boot guard (live mode with mock provider → refuse start)
- [ ] GitHub repo, Actions CI: lint, typecheck, unit, integration (Supabase in Docker), e2e
- [ ] Vercel project with preview deploys per PR; production URL live

### Database
- [ ] Prisma schema for every model in PRD §10 (+ `DemoOtp`, + decisions from Q1.14); money as `Int` paise; `createdAt/updatedAt`; indexes from §10
- [ ] Supabase trigger: `auth.users` insert → `public.User` row (role CUSTOMER)
- [ ] RLS enabled on **every** table; policies in migrations (customers own rows; staff by `outletId`; riders assigned orders; super admin all)
- [ ] `prisma/seed.ts`: outlets, pincodes, menu, option groups, test users per Q1.5–Q1.7 (idempotent)

### Auth & roles
- [ ] **Spike first (day 1):** demo sign-in that yields a real Supabase session for a phone number (e.g. admin-created user + server-side password sign-in, or a synthetic-email fallback). Record the chosen approach in DECISIONS.md
- [ ] `src/server/providers/` with `otp`, `payments`, `maps`, `push` interfaces + mock implementations; `index.ts` picks by env
- [ ] Login screen: phone → Demo OTP shown in highlighted box with one-tap autofill → verify (5-min expiry, hashed, attempt limit)
- [ ] "Continue as" quick-login buttons (demo only, server-enforced)
- [ ] `requireRole()` + session helpers; middleware/proxy route protection for `/admin`, `/kitchen`, `/rider`
- [ ] Role landing pages (empty shells): `/` customer, `/admin`, `/kitchen`, `/rider`

### Brand & PWA
- [ ] Confirm tokens in DevTools against hundopizza.com; finalize `src/styles/tokens.css`; map into Tailwind; restyle shadcn primitives (Button primary/secondary, Input, Sheet, Dialog, Badge)
- [ ] Fonts per Q1.8
- [ ] Customer header with wordmark + bottom tab bar (Menu, Orders, Account); admin sidebar layout shell
- [ ] Demo banner on every screen
- [ ] `manifest.webmanifest` (draft exists in `public/`), service worker (Serwist), icons, iOS splash set, install prompt plumbing

## Automated tests required
- Unit: env validation + boot guard; OTP generate/verify/expiry/attempts; `requireRole` matrix for all 5 roles.
- Integration (local Supabase): RLS — anon can't read anything private; customer can't read another user's rows; staff limited to own outlet; user trigger creates `User`.
- E2E: log in via OTP as customer; quick-login as each role lands on the right page; a customer visiting `/admin` is redirected.

## Definition of done
- [ ] Production URL deployed from `main`; preview deploys work
- [ ] CI green with all suites
- [ ] All roles can log in in Demo Mode; route protection works
- [ ] Tokens finalized; no hex/font/radius outside `tokens.css` (lint rule or grep check in CI)
- [ ] Lighthouse "installable" passes on the shell

## Manual test checklist (for you)
1. **Phone (Android Chrome):** open the production URL → demo banner visible; Hundo red/black look, TheMixMono (or the approved fallback) fonts.
2. Log in with any 10-digit number → Demo OTP box appears → tap autofill → you're logged in as a customer.
3. Enter a wrong OTP 5+ times → blocked with a friendly message. Wait 5 min with a valid OTP → it's rejected as expired.
4. Log out → "Continue as" → try **each** role: Super Admin → `/admin`, Outlet Manager → `/admin` (shows their outlet name), Kitchen → `/kitchen`, Rider → `/rider`.
5. Logged in as customer, type `/admin`, `/kitchen`, `/rider` in the URL bar → you are blocked/redirected each time.
6. Chrome menu → "Install app" → icon and name "Hundo" on home screen; opens full-screen with the red splash.
7. **iPhone (Safari):** Share → Add to Home Screen → icon and splash look right.
8. **Desktop (≥ 1280 px):** `/admin` shows the sidebar layout with the wordmark.
9. Compare side by side with hundopizza.com: header, button style, heading font. Note anything that feels off.
