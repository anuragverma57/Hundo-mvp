# Phase 6 — Admin completeness

**Goal:** Hundo staff can run the platform without a developer: menu & pricing, outlets & zones,
staff, banners, availability, outlet reassignment, refunds, and customer lookup.
**PRD refs:** A-05, A-06, A-07, A-08, A-09, A-12, A-13, §8.3, §14.5.

## Open questions (Gate A)

| ID | Question | Recommended default |
|---|---|---|
| Q6.1 | Menu images: who uploads, what aspect ratio, max size? | Super Admin uploads; 1:1 square, ≤ 5 MB, auto-resized |
| Q6.2 | Partial refunds: any rules (max %, reason required)? Refunds on COD orders (cash returned outside the app)? | Reason required; up to the paid amount; COD refunds out of scope (cancel only, log a note) |
| Q6.3 | Can one staff member work at several outlets? | No — one outlet per staff account (as PRD model) |
| Q6.4 | Deactivating staff: sign them out immediately? | Yes, sessions revoked at once |
| Q6.5 | Reassign order to another outlet (A-05): allowed up to which status? What happens to an assigned rider? | Only PLACED or CONFIRMED; rider unassigned; new outlet must re-confirm |
| Q6.6 | Banners: fields needed (image, link to item/category/URL, active from/to, sort)? | All of those |
| Q6.7 | Audit log for menu/price/outlet changes (who changed what)? | Yes, simple change log table |
| Q6.8 | Deleting menu items: hard delete, or deactivate only (keeps history intact)? | Deactivate only |
| Q6.9 | Outlet hours: one daily schedule, or per weekday? | One daily schedule + manual close override (PRD) |

## Tasks
- [ ] Menu management (Super Admin): categories, items, images (Supabase Storage), prices, option groups/options, veg flag, sort order, active flag; menu cache revalidated on save (A-06)
- [ ] Outlet management: details, hours, manual open/close, pincodes (+ priority), delivery fee, min order, packaging, tax, COD flag + cap, UPI QR (A-08)
- [ ] Staff management: add by phone, role, outlet, deactivate (A-09)
- [ ] Banner management (per Q6.6)
- [ ] Availability toggles per outlet in admin (A-07)
- [ ] Reassign order outlet (A-05) through `transitionOrder`-style audited function
- [ ] Refunds: full/partial via `PaymentProvider`; `Refund` records; status via webhook (mock: instant) (A-12)
- [ ] Customer lookup by phone with order history (A-13)
- [ ] Change log (per Q6.7)

## Automated tests required
- Unit: menu validation (min ≤ max select, at least one default for required groups, non-negative prices); refund limits (cumulative partial refunds ≤ paid); reassign rules.
- Integration: only Super Admin can mutate menu/outlets/staff (server + RLS); Storage policies for images.
- E2E: create an item with options → appears on customer menu with correct price; deactivate staff → their session stops working.

## Definition of done
- [ ] Hundo staff can do every A-0x task without SQL
- [ ] Every admin mutation is `requireRole('SUPER_ADMIN')` (or as PRD matrix) and logged

## Manual test checklist (for you)
1. **Desktop** as Super Admin: create a category and a pizza with sizes, crusts (incl. Alt-Dough) and toppings, upload a photo → check it on the phone menu with correct prices.
2. Change a price → the menu updates; **existing orders keep the old price**.
3. Create an outlet, add pincodes, set hours across midnight → routing picks it for those pincodes; open/closed correct at 1 AM and 5 AM (we'll simulate).
4. Add a staff member by phone as Kitchen of that outlet → they can log in and see only that outlet. Deactivate them → kicked out.
5. Add/reorder/disable a home banner → phone home screen reflects it.
6. Reassign a CONFIRMED order to another outlet → it moves boards; the new outlet must confirm.
7. Partial refund ₹50 on a prepaid order, then try refunding more than the remaining amount → blocked.
8. Customer lookup by phone → full history shows.
9. As Outlet Manager: menu/outlet/staff screens are not available.
