# Phase 4 — Operations core (live board, confirm/reject, kitchen, Realtime)

**Goal:** outlets can run orders from the app: a live admin board with a sound alert, order
detail, confirm/reject, a kitchen tablet screen, and Supabase Realtime on all order screens
(including the customer status page).
**PRD refs:** A-01, A-02, A-03, A-07, K-01–K-04, §9.3, §11 (operating hours), §14.5.

## Open questions (Gate A)

| ID | Question | Recommended default |
|---|---|---|
| Q4.1 | Who confirms orders after midnight at each outlet (PRD Q6)? Should orders auto-confirm if nobody acts within N minutes? | No auto-confirm in MVP; the 5-min highlight plus a repeating sound; the outlet names a night-shift confirmer |
| Q4.2 | Rejection reasons: fixed list + "Other (type)"? | Item unavailable · Outlet too busy · Address issue · Closing soon · Other |
| Q4.3 | New-order sound: one chime, or repeat until someone opens the order? | Repeat every 10 s until acknowledged |
| Q4.4 | Kitchen login: one shared account per outlet tablet, or per person? | One shared kitchen account per outlet |
| Q4.5 | Should the kitchen see PLACED (not yet confirmed) orders as a heads-up? | No — Confirmed and Preparing only (PRD K-01) |
| Q4.6 | "Sold out today": auto-reset at the start of the next business day, or stay off until toggled? | Auto-reset at opening time next business day |
| Q4.7 | Confirm thresholds: highlight unconfirmed > 5 min; kitchen > 15 min since confirmation? | Yes, as PRD |
| Q4.8 | Kitchen order ticket printing (thermal printer)? | Not in MVP |
| Q4.9 | Show an ETA to the customer? If yes, how is it set (fixed per outlet, or the manager picks at confirm)? | Manager picks at confirm (20/30/45 min), default 35 |
| Q4.10 | Should the outlet manager be able to call the customer from order detail? | Yes, tap-to-call |

## Tasks
- [ ] `useOrderUpdates` hook: Supabase Realtime on `Order` (RLS-filtered) → server refetch; 15 s polling fallback; refetch on reconnect/focus; `/api/orders/updates` fallback route
- [ ] Verify RLS for Realtime per role (customer own, staff outlet, rider assigned)
- [ ] Admin live board (≥ 1280 px): columns Placed → Out for delivery; outlet filter (super admin); new-order sound per Q4.3 (handle browser autoplay unlock); > 5 min highlight
- [ ] Order detail drawer/page: customer, phone, address + map link, items/options, payment, full status history with actor + time (A-02)
- [ ] Confirm / Reject (reason required; prepaid → refund) (A-03), ETA per Q4.9
- [ ] Kitchen screen (10" landscape): Confirmed + Preparing oldest first, big type, crust & toppings prominent, timers, > 15 min highlight, one-tap Preparing → Ready (K-01–K-03)
- [ ] Availability toggle from kitchen and manager (A-07, K-04), auto-reset per Q4.6
- [ ] Customer status page switches to Realtime
- [ ] Status chips: brand colors + icons (PRD §14.4)

## Automated tests required
- Unit: board grouping; thresholds; business-day reset of availability (midnight-crossing).
- Integration: Realtime/RLS — manager of outlet A never receives outlet B events; customer never receives others' events.
- E2E: two browser contexts — customer places order → board shows it without refresh → manager confirms → customer page updates live → kitchen Preparing → Ready.
- E2E: rejection with reason → customer sees Cancelled + refund.

## Definition of done
- [ ] Realtime works on all four screens; killing the network falls back to polling and recovers
- [ ] No staff query unscoped by outlet (review)

## Manual test checklist (for you)
1. **Laptop** `/admin` as Outlet Manager, **phone** as customer. Place an order on the phone → it appears on the board within ~2 s with the sound (click the page once first if the browser asks).
2. Leave it 5 min → highlighted. Open it → detail shows everything incl. status history.
3. Confirm (pick ETA) → phone status page updates without refresh.
4. **Tablet (landscape)** `/kitchen`: order shows with crust/toppings in big type, timer running. Tap Preparing → Ready; board and phone update live.
5. Mark an item sold out from the kitchen → customer menu greys it within a few seconds.
6. Reject another order with a reason → customer sees Cancelled (+ refund if prepaid).
7. Super Admin: filter by outlet works. Manager of outlet A: cannot see outlet B's orders at all.
8. Turn Wi-Fi off on the phone for 30 s, change the order status on the board, turn Wi-Fi on → phone catches up.
9. Leave the board tab in the background 10 min, place an order → sound still plays / board updated when you return.
