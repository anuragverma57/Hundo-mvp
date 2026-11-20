# Phase 5 — Delivery, riders, push notifications

**Goal:** close the loop. Managers assign riders; riders use the PWA to pick up, navigate, deliver
and collect COD; FCM push reaches riders and customers. After this phase, the full order path
(login → delivered) works for COD and online, and is covered by Playwright in CI.
**PRD refs:** A-04, R-01–R-05, C-09 (rider info), C-09a, C-09b, §8.2, §9.3, §11 (privacy).

## Open questions (Gate A)

| ID | Question | Recommended default |
|---|---|---|
| Q5.1 | Do riders belong to one outlet or float between outlets (PRD Q5)? | One outlet each (model has a single `outletId`) |
| Q5.2 | Can a rider carry more than one order at a time? Limit? | Yes, up to 3 active |
| Q5.3 | COD by UPI: does each outlet have its own UPI QR? Should the rider app show it? | Yes, upload one QR image per outlet; rider app shows it on the COD screen |
| Q5.4 | Firebase project: who creates it (free) and shares the web config + service account? | You create it; we give step-by-step instructions |
| Q5.5 | Customer sees the rider's real name and phone number? | Yes (PRD C-09) |
| Q5.6 | Can a rider go Off duty while holding active orders? | No — blocked with a message |
| Q5.7 | Push copy: approve playful Hundo-voice copy for Confirmed / Out for delivery / Delivered / New assignment? | We draft, you approve at Gate C |
| Q5.8 | COD amount mismatch (rider collects less/more): allowed with a note, or must match? | Must match the order total; mismatch requires a note and flags for the manager |
| Q5.9 | Riders' phones: mostly Android? Any iPhones (must install the PWA for push)? | Assume Android; iOS supported with the install guide |

## Tasks
- [ ] Rider PWA (`/rider`, mobile-only, high contrast, big targets): On/Off duty (requires notification permission per R-01), assigned list with name, tap-to-call, address, landmark, **Navigate** (Google Maps `dir` link)
- [ ] Assign / reassign rider from board & detail: on-duty riders of that outlet with active-order counts (A-04)
- [ ] Rider actions: Picked up (READY → OUT_FOR_DELIVERY), Delivered; COD confirm amount + mode CASH/UPI → `CodCollection`, `paymentStatus = PAID` (R-03, R-04)
- [ ] Rider history + daily summary (R-05)
- [ ] Privacy: customer phone visible to rider only while assigned and until delivered + 2 h (server-enforced)
- [ ] FCM: client registration, `PushToken` storage (multi-device), merged service worker with background handler, `notify()` via Firebase Admin, invalid-token cleanup; tap opens the order
- [ ] Customer push prompt after first order (C-09a); Add-to-Home-Screen prompt / iOS guide after first order (C-09b)
- [ ] Customer status page shows rider name + phone once assigned
- [ ] Playwright full path (COD + online) in CI

## Automated tests required
- Unit: assignment rules (on-duty, same outlet, limit); off-duty block; COD mismatch; phone-visibility window (delivered + 1:59 visible, + 2:01 hidden).
- Integration: RLS — rider sees only assigned orders; can't read another rider's orders.
- Unit: `notify()` recipient selection per event; invalid token deletion (FCM mocked).
- E2E: full path login → delivered for **COD** and **online** (the PRD's one Playwright test), run in CI.

## Definition of done
- [ ] Full order loop works on real phones
- [ ] App fully usable with `PUSH_PROVIDER=off`

## Manual test checklist (for you)
Use **two phones** (customer + rider) and a **laptop** (manager).
1. Rider phone: install the PWA, log in as Rider, try going On duty without allowing notifications → blocked. Allow → On duty.
2. Manager: assign the rider to a READY order → list shows each rider's active count.
3. Rider phone **with the app closed** → push arrives with sound; tapping it opens that order.
4. Rider: tap-to-call opens dialer; **Navigate** opens Google Maps directions to the pin.
5. Rider: Picked up → customer phone shows "Out for delivery" + push (customer allowed notifications after first order).
6. COD order: Delivered → must confirm amount + Cash/UPI (UPI shows the outlet QR) → customer sees Delivered + push.
7. Enter a different amount → requires a note; manager sees it flagged.
8. Rider tries Off duty with an active order → blocked.
9. Rider history + today's summary (orders, cash) correct.
10. Two hours after delivery, the customer's phone number no longer shows to the rider (we can shift time to test).
11. iPhone customer: install PWA (guide shows), allow notifications → pushes arrive.
12. Turn mobile data off/on during delivery → rider list recovers.
