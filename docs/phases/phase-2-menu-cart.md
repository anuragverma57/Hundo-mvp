# Phase 2 — Location, outlet routing, menu, cart

**Goal:** a customer sets a delivery location, gets routed to the right outlet, browses that outlet's
menu, customizes items (size, crust incl. Alt-Dough, toppings) and builds a cart whose totals are
computed on the server.
**PRD refs:** C-02, C-03, C-04, C-05, C-06, C-12, §7.3, §8.4, §14.2–14.4.

## Open questions (Gate A)

| ID | Question | Recommended default |
|---|---|---|
| Q2.1 | If a pincode is served by several outlets and the customer has only typed a pincode (no map pin yet), which outlet's menu do we show? | Add a `priority` to each outlet–pincode row; use the highest-priority open outlet until a pin is set, then nearest open outlet (PRD rule) |
| Q2.2 | GST: included in menu prices or added at checkout? Rate? (PRD Q3) | Added at checkout, 5 % on food subtotal; confirm whether it also applies to delivery/packaging |
| Q2.3 | Delivery fee: flat per outlet or by distance? Free above an order value? (PRD Q2) | Flat per outlet, no free-delivery threshold in MVP |
| Q2.4 | Packaging charge: flat per order or per item? Amount? | Flat per order, per outlet |
| Q2.5 | Minimum order value per outlet? | ₹199 (confirm) |
| Q2.6 | Online prices: same as Zomato or lower? (PRD Q7) | Hundo to provide the price list |
| Q2.7 | Do topping and crust (Alt-Dough) prices **change with pizza size**? (If yes, the data model needs size-dependent deltas.) | Need Hundo's answer — affects schema |
| Q2.8 | Is Alt-Dough available on every pizza and every size? Price delta? | Hundo to confirm |
| Q2.9 | Max extra toppings per pizza? Do sizes differ per pizza? | 5 toppings; same size set for all pizzas |
| Q2.10 | Half-and-half pizzas in MVP? | No |
| Q2.11 | Per-item photos available (PRD Q9)? If not, what do items without a photo show? | Use available photos; others get a branded placeholder tile (red + wordmark) |
| Q2.12 | Home banner carousel: add a `Banner` model (image, link, sort, active) now, seeded with the website banners, with admin editing in Phase 6? | Yes |
| Q2.13 | Our Story / Reheat / Partners / Feedback: link to hundopizza.com or rebuild in-app? | Link out from the Account screen |
| Q2.14 | "Use my current location" button in MVP? (Needs reverse geocoding.) | No — pincode or saved address only |
| Q2.15 | Guest cart storage: browser-only until login, then merged into the server cart? | Yes (localStorage until login, server after), re-priced on every load |
| Q2.16 | Item descriptions: Hundo writes them, or we draft in the website's voice for approval? | We draft, Hundo approves in Phase 8 |

## Tasks
- [ ] `src/server/routing/`: pincode → candidate outlets → selection (priority / nearest open), with the midnight-crossing hours helper (`isOutletOpen(outlet, at)`, `nextOpeningTime`)
- [ ] Location picker: pincode entry (+ saved addresses once logged in); "we don't deliver here yet" state
- [ ] Home screen: banner carousel (seeded), "Give me pizza" CTA → menu
- [ ] Menu page (server-rendered, cached, revalidated on menu change): categories, veg/non-veg symbols, images, prices, unavailable items greyed (not hidden)
- [ ] Item sheet: option groups with min/max validation, live price; Alt-Dough featured
- [ ] `src/server/menu/` + `src/server/orders/pricing.ts`: `priceCart(outletId, lines)` → line totals, subtotal, fees, GST, total (all paise)
- [ ] Cart: quantity controls, edit options, server totals, min-order message, outlet-closed block with next opening time (C-12)
- [ ] Cart persists through login (C-02)
- [ ] Copy in Hundo voice for empty states and errors

## Automated tests required
- Unit — routing: 0/1/many outlets; closed/manual-closed; priority vs nearest; ties; hours at 11:29, 11:30, 23:59, 00:00, 03:59, 04:00 IST.
- Unit — pricing: every edge case in AGENTS.md §3.1 (deltas, qty, GST rounding, inactive/unavailable item or option, option from another item, min/max violations, tampered IDs).
- Integration: menu availability per outlet (absent row = available).
- E2E (mobile viewport): pincode → menu → customize pizza with Alt-Dough + toppings → cart total matches server.

## Definition of done
- [ ] Pricing and routing ≥ 95 % line coverage
- [ ] Menu page < 2 s on throttled "Fast 4G / mid-tier mobile" in Lighthouse
- [ ] No price ever read from client input (grep/review)

## Manual test checklist (for you)
1. **Phone:** enter a pincode served by one outlet → that outlet's menu shows.
2. Enter a pincode served by none → "we don't deliver here yet" message.
3. Enter an overlapping pincode → the expected outlet (per D-2.1) is chosen.
4. Menu shows categories in order, veg/non-veg symbols, images; mark an item unavailable in the DB (we'll show you how) → it appears greyed, can't be added.
5. Open a pizza → try adding without a size → blocked. Pick size + Alt-Dough + 6 toppings → stops at the max. Price updates as you choose.
6. Add 2 different configurations of the same pizza → 2 separate cart lines.
7. Check the cart math by hand: subtotal, delivery, packaging, GST, total.
8. Go below the minimum order → checkout disabled with a message.
9. Add items as a guest → log in → cart is still there.
10. Simulate a closed outlet (we'll set the time/override) → you can browse, checkout is blocked, next opening time shown (e.g. "Opens 11:30 AM").
