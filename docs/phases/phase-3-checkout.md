# Phase 3 — Checkout, payments, customer order flow

**Goal:** a customer can place a real order with COD or a simulated online payment, see a live
status page, view history, reorder and cancel. The order state machine and `PaymentProvider` are
built here, because everything after depends on them.
**PRD refs:** C-01 (name at checkout), C-07, C-08, C-09, C-10, C-11, §7, §8, §15.3.

## Open questions (Gate A)

| ID | Question | Recommended default |
|---|---|---|
| Q3.1 | Maximum COD order value (PRD Q4)? COD enabled at all outlets at launch? | ₹2,000 cap; COD on at all outlets |
| Q3.2 | Customer-facing order number format? | `HP-` + 6 digits, sequential (e.g. HP-104233) |
| Q3.3 | Last-order cut-off before closing (e.g. stop taking orders at 3:45 AM)? | 15 minutes before close |
| Q3.4 | At first checkout: name required, email optional or not asked? | Name required; no email |
| Q3.5 | Customer note ("less spicy", "ring the bell") allowed? Max length? | Yes, 200 characters |
| Q3.6 | Address: is the map pin required? Must the pin match the pincode's area? | Pin required; no strict area check in MVP |
| Q3.7 | Does the customer need a GST invoice/receipt (GSTIN, FSSAI no.) in MVP? | On-screen order summary only; invoice in Phase 2 |
| Q3.8 | After a failed payment, does "Retry" create a new order from the same cart? | Yes; the failed order stays PAYMENT_FAILED |
| Q3.9 | Customer cancel in PLACED: any reason prompt? | Optional reason picker |
| Q3.10 | "Call outlet" number on the status page: each outlet's own phone, or the central 7506534770? | Each outlet's phone |
| Q3.11 | Terms, Privacy and Refund/Cancellation policy pages (Razorpay requires them to go live): who writes the text? | We draft from standard templates; Hundo's legal approves |
| Q3.12 | Saved address labels: Home / Work / Other only? Limit on addresses? | Those three; max 10 |

## Tasks
- [ ] `src/server/orders/stateMachine.ts` + `transitionOrder()` (role table, transaction, history row, `notify()` hook — no-op until Phase 5)
- [ ] `createOrder()`: re-price on server, routing snapshot, address snapshot, item/option snapshots, idempotency key, `isDemo`
- [ ] Addresses: CRUD, Leaflet + OSM map with draggable pin, typed fields, pincode drives routing (C-07)
- [ ] Checkout page: address, name capture, note, payment method, COD rules (outlet flag + cap), outlet-open check, last-order cut-off
- [ ] `PaymentProvider` interface; `MockPaymentProvider`: Hundo-styled sheet with **Pay successfully / Fail payment / Close without paying**; writes `Payment` + simulated webhook rows; same transitions as Razorpay
- [ ] Webhook route skeleton (`/api/webhooks/razorpay`), signature verify interface, event-id idempotency
- [ ] Vercel Cron `/api/cron/payment-timeout` (protected by secret): PENDING_PAYMENT > 15 min → PAYMENT_FAILED
- [ ] Order status page: timeline, outlet, items, total, call-outlet; refresh-based for now (Realtime in Phase 4)
- [ ] Customer cancel in PLACED (+ refund via provider for prepaid; mock refund processes instantly)
- [ ] Order history + Reorder (skips unavailable items with a notice) (C-11)
- [ ] Legal pages per Q3.11 (content may be placeholder until approved)

## Automated tests required
- Unit — state machine: every allowed/blocked transition × role; double-submit; concurrent transition (only one wins).
- Unit — createOrder: re-pricing ignores client prices; COD cap; outlet closed; cut-off; inactive items; idempotency key returns the same order.
- Unit — payment timeout sweep; mock provider success/fail/close → correct states.
- Integration: order + items + history written atomically (failure mid-way leaves nothing); RLS: customer sees only own orders/addresses.
- E2E: COD order end-to-end to PLACED; online success → PLACED; online fail → PAYMENT_FAILED + retry; close without paying → still PENDING then FAILED after sweep (time mocked); cancel in PLACED; reorder.

## Definition of done
- [ ] A real order can be placed on the production URL from a phone
- [ ] All transitions go through `transitionOrder()` (grep: no other `status:` writes)
- [ ] Money paths ≥ 95 % coverage

## Manual test checklist (for you)
1. **Phone:** add a new address — drag the pin, fill fields, save as Home. Edit it. Add a Work address.
2. Checkout with **COD** → order placed → status page shows "Placed", items, total, outlet, call-outlet button (tap → dialer opens).
3. Checkout **online** → simulated sheet → **Pay successfully** → status "Placed", payment shows Paid.
4. Online → **Fail payment** → failed message → Retry → succeeds as a new order.
5. Online → **Close without paying** → order shows pending; after 15 min (or we trigger the sweep) it shows Payment failed.
6. Cart above the COD cap → COD option disabled with a reason.
7. Cancel a PLACED order → status Cancelled; for a prepaid order a refund shows as processed.
8. Order history lists all of the above; **Reorder** a past order → cart rebuilt; make one item unavailable first → notice shows it was skipped.
9. Double-tap "Place order" fast → only **one** order is created.
10. Try to check out when the outlet is closed / after the cut-off → blocked with next opening time.
