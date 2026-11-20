# Phase 8 — Demo walkthrough, approval & go-live

**Goal:** Hundo approves the MVP in Demo Mode; then it switches to Live providers and pilots at one
outlet.
**PRD refs:** §12.1 weeks 8 + after, §13, §15.5, §15.6.

## Open questions (Gate A)

| ID | Question | Recommended default |
|---|---|---|
| Q8.1 | Demo walkthrough date and attendees from Hundo (one per role ideally)? | — |
| Q8.2 | Pilot outlet and pilot length? | One outlet, 2 weeks |
| Q8.3 | Status of external approvals: Razorpay KYC, DLT entity + OTP template, MSG91 account, Firebase, Sentry? | Started in Phase 1 |
| Q8.4 | Live domain (e.g. order.hundopizza.com)? Who controls DNS? | Subdomain of hundopizza.com via Squarespace DNS |
| Q8.5 | Import an existing customer list (PRD Q8)? Consent basis? | Only with documented consent; otherwise skip |
| Q8.6 | Should the website's "Give me pizza" button switch from Zomato to the app at pilot, or after rollout? | After the pilot |
| Q8.7 | Support: who answers customer calls/complaints about app orders, and escalation path for app issues? | Outlet phone for orders; a named Hundo person for app issues |

## Tasks
- [ ] Walkthrough script per role; run it with Hundo in Demo Mode; collect feedback into issues
- [ ] Fix feedback (each with a test where relevant); re-run Phase 1–7 manual checklists' critical items
- [ ] `scripts/purge-demo.ts` (`pnpm purge:demo`) with dry-run mode
- [ ] Live providers: Supabase Auth phone OTP + MSG91 Send SMS Hook; `RazorpayPaymentProvider` (Checkout.js, server order, signature verify, webhooks, refunds); optional Google Places
- [ ] Boot guard verified: live mode + any mock provider → refuses to start
- [ ] Go-live checklist PRD §15.6, incl. one real ₹1 payment + refund
- [ ] Playwright suite against production in Live Mode with a staff phone
- [ ] Pilot runbook: what to do if the app is down (fallback to phone), daily check of COD reconciliation

## Automated tests required
- Unit: Razorpay signature verification (valid/invalid/tampered), webhook idempotency by event id, refund webhook.
- Integration: purge script removes only demo data (fixture with mixed data).
- E2E: full path in Live Mode against staging with Razorpay test keys.

## Definition of done
- [ ] Hundo written approval (design + function)
- [ ] Live Mode on production; demo features absent from responses (verified)
- [ ] Pilot outlet live

## Manual test checklist (for you)
1. With Razorpay **test** keys on staging: pay with a test UPI/card → PLACED; fail → PAYMENT_FAILED; refund → processed via webhook.
2. Live OTP: real SMS arrives on your phone within ~10 s; wrong OTP rejected; resend limit works.
3. In Live Mode, confirm the login page has **no** demo OTP box, **no** "Continue as" buttons, **no** demo banner.
4. Production: one real ₹1 order paid by UPI → refund it → money returns.
5. `pnpm purge:demo --dry-run` output reviewed, then real run → demo orders/test accounts gone, real data intact.
6. Pilot day 1: watch the board through one lunch and one late-night window.
