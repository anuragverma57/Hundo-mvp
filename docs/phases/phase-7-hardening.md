# Phase 7 — Dashboard, reconciliation & hardening

**Goal:** owners can measure the business; cash is reconciled; the app is observable, fast,
accessible, secure and visually signed off.
**PRD refs:** A-10, A-11, A-14, §11, §12.2, §14.7, §13.1.

## Open questions (Gate A)

| ID | Question | Recommended default |
|---|---|---|
| Q7.1 | "Gross revenue": order totals including GST and delivery fee? Net of refunds? | Show both: Gross (incl. everything) and Net (minus refunds, minus GST) |
| Q7.2 | Business day boundary: since outlets close at 4 AM, count an order at 2 AM toward the previous day? Cut-off time? | Yes; business day = IST date of (time − 6 h) |
| Q7.3 | CSV export: which columns? Does an accountant need a specific format? | Order no., date/time, outlet, customer name, phone (masked?), items, subtotal, fees, GST, total, payment method/status, status |
| Q7.4 | Should phone numbers be masked in CSV exports? | Masked for Outlet Managers, full for Super Admin |
| Q7.5 | Sentry: who creates the (free) account? | You create; we wire it |
| Q7.6 | Who at Hundo signs off the design (PRD Q10), and in what form (screenshot deck, live walkthrough)? | Screenshot pairs (website vs app) for the 8 screens in PRD §14.7 |
| Q7.7 | Demo orders excluded from dashboards by default? | Yes, with a toggle |

## Tasks
- [ ] Dashboard (date range + outlet): orders, gross/net revenue, AOV, cancellation rate, avg Placed → Delivered, online vs COD split, top 10 items; brand-colored charts (A-10)
- [ ] COD reconciliation per rider per day; "cash handed over" confirmation by the manager (A-11)
- [ ] CSV export for a date range (A-14)
- [ ] Sentry (client + server), with PII scrubbing (no phones/OTPs)
- [ ] Performance: menu < 2 s on mid-range Android 4G; polling endpoint < 200 ms; DB indexes verified with `EXPLAIN`
- [ ] PWA: Lighthouse installability on customer + rider; offline fallback page
- [ ] Accessibility: keyboard, focus rings, labels, contrast AA, 44 px targets; axe checks in Playwright
- [ ] Security pass: run the security review; RLS audit on every table; secrets/server-only audit; rate limits on OTP + order creation; headers (CSP etc.)
- [ ] Design QA: side-by-side screenshots for PRD §14.7 screens

## Automated tests required
- Unit: every metric on a fixture dataset (including cross-midnight business days, refunds, cancellations, demo orders).
- Unit: reconciliation sums; CSV escaping (commas, quotes, Unicode names).
- E2E: dashboard loads for both roles with correct scoping; CSV downloads.
- axe accessibility assertions on main screens.

## Definition of done
- [ ] Lighthouse: PWA installable, Performance ≥ 85 mobile on menu, Accessibility ≥ 95
- [ ] Zero high/critical findings from the security review
- [ ] Design screenshots ready for Hundo

## Manual test checklist (for you)
1. Dashboard for "today" and "last 7 days": numbers match a hand count of the orders you placed during testing (we'll give you the list).
2. An order placed at 2 AM appears under the previous business day.
3. COD reconciliation: per rider totals match; mark "cash handed over" → shows who confirmed and when.
4. Export CSV → opens correctly in Excel/Google Sheets, names with commas intact, totals match the dashboard.
5. Outlet Manager sees only their outlet in dashboard and CSV.
6. Trigger a test error (we'll give a link) → it appears in Sentry with no phone number in it.
7. Run Lighthouse on your phone (or we share the report) → installable + scores above.
8. Review the side-by-side design screenshots → list any mismatch.
