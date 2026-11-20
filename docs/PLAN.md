# Hundo — Phase Plan

Goal: ship the PRD v1.2 MVP in Demo Mode as fast as possible **without** shipping bugs, then go live.
Rules for how each phase runs: [AGENTS.md §0](../AGENTS.md) (Gate A questions → build → Gate C tests +
your manual test → sign-off).

## Phases at a glance

| # | Phase | PRD weeks | Outcome you can see | Est. effort* |
|---|---|---|---|---|
| 0 | Docs & brand assets | — | Rules, plan, brand assets, draft tokens | Done |
| 1 | [Foundation](phases/phase-1-foundation.md) | 1 | Deployed app shell in Hundo style; log in as any role via Demo OTP / quick login | 3–4 days |
| 2 | [Location, menu, cart](phases/phase-2-menu-cart.md) | 2 | Pick a pincode → see that outlet's menu → customize pizza → cart with server totals | 3–4 days |
| 3 | [Checkout, payments, customer order flow](phases/phase-3-checkout.md) | 3 | Place a COD or simulated-online order; see status page; history; reorder; cancel | 4–5 days |
| 4 | [Operations core](phases/phase-4-operations.md) | 4 | Live admin board with sound; confirm/reject; kitchen tablet screen; Realtime everywhere | 4–5 days |
| 5 | [Delivery, riders, push](phases/phase-5-delivery.md) | 5 | Rider PWA, assignment, pickup/deliver, COD collect, FCM push; full order loop end-to-end | 4–5 days |
| 6 | [Admin completeness](phases/phase-6-admin.md) | 6 | Menu, outlets, zones, staff, banners, availability, reassign, refunds, customer lookup | 4–5 days |
| 7 | [Dashboard & hardening](phases/phase-7-hardening.md) | 7 | Dashboard, COD reconciliation, CSV, Sentry, Lighthouse/PWA, a11y, security pass, design sign-off | 3–4 days |
| 8 | [Demo, approval, go-live](phases/phase-8-golive.md) | 8 + after | Hundo walkthrough, fixes, Live providers, purge demo, pilot outlet | 2–3 days + external waits |

\*Working days of build time after Gate A answers arrive. The real critical path is **how fast open
questions get answered** — Hundo data (outlets, pincodes, menu, prices) is needed by Phase 1–2.

## How to go fast without breaking things

1. **Answer questions early.** Every phase file lists its open questions. You can answer any phase's
   questions ahead of time; they are recorded in [DECISIONS.md](DECISIONS.md) and Gate A will skip them.
   Send Hundo the data requests (Q1.5, Q1.6, Q2.2–Q2.9, Q3.1, Q4.1, Q5.1) **now** — they block the most.
2. **Start external approvals on day 1** (they don't block the demo but block go-live):
   Razorpay KYC, SMS DLT registration (MSG91), Firebase project, domain.
3. **Vertical slices.** By the end of Phase 3 a real order can be placed even if admin is rough.
4. **Tests ship with code** (AGENTS.md §3). The heavy unit tests sit on the money paths: pricing,
   routing, hours, state machine, payments — where bugs cost money.
5. **Deploy from Phase 1** with preview deployments per PR, so every manual test is on a real URL and
   a real phone.

## Dependency graph

```
P0 ─► P1 ─► P2 ─► P3 ─┬─► P4 ─► P5 ─┬─► P7 ─► P8
                      │             │
                      └──── P6 ─────┘   (P6 can start after P3, in parallel with P4/P5
                                         if there is a second developer)
```

## Data model changes vs PRD §10 (to confirm in the phase that needs them)

The PRD is missing a few things the PRD itself requires. Each is raised as an open question in the
phase where it matters — none will be added silently.

| Gap | Why it's needed | Raised in |
|---|---|---|
| `Order.isDemo` | PRD §15.4 says demo orders carry `isDemo`, but §10 doesn't list it | Q1.14 |
| `Banner` model | PRD §14.2: home banner carousel "managed by admin" | Q2.12 |
| Topping price by size | `Option.priceDelta` is one number; if toppings/Alt-Dough cost more on larger sizes the model must change | Q2.7 |
| Pincode priority | Choosing an outlet when only a pincode (no pin) is known and several outlets serve it | Q2.1 |
| `WebhookEvent` (or unique event id) | PRD §11: webhook idempotency "by Razorpay event ID" | Phase 3 (technical, logged) |
| Payment timeout uses `Order.createdAt` | Fine as is; noted for clarity | — |
| Order ETA | Status page has no ETA in the PRD; customers will expect one | Q4.9 |
| Legal pages | Razorpay live KYC requires Terms, Privacy, Refund policy pages | Q3.11 |

## Things that need a real device (you, during manual tests)

- PWA install on Android (Chrome) and iOS (Safari, 16.4+).
- Push notifications with the app closed (rider + customer), iOS only when installed.
- Rider flow outdoors on mobile data (Realtime drop → polling fallback).
- Kitchen screen on a 10" tablet in landscape.
- Sound alert on the admin board in a real browser tab.
