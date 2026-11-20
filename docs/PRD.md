# Hundo Pizza Ordering App — Product Requirements Document

Version 1.2 · 20 November 2026 · Status: Draft for review

Changes in v1.2: new Section 15, Demo Mode, under which the MVP runs with zero paid or approval-gated services (OTP shown on screen, simulated payments, free maps, one-tap test logins for every role); brand assets, fonts and tokens are scraped directly from hundopizza.com with the included script (`scripts/scrape-brand-assets.mjs`); font-licensing items removed.

Changes in v1.1: Supabase as the single database and auth provider; Firebase limited to push notifications; Supabase Realtime replaces polling; platform split (mobile-first PWA for customers, riders and kitchen; desktop web for admins and outlet managers); new Section 14 defining a design language matched to hundopizza.com.

---

## 1. Overview

### 1.1 Summary

Hundo Pizza is a Mumbai pizza brand with multiple outlets, delivering from Cuffe Parade to Malad, 11:30 AM to 4:00 AM daily. Today, online orders flow through Zomato. This product is Hundo's own direct-ordering platform: a single Next.js application where customers order, outlets prepare, Hundo's own riders deliver, and admins manage everything from one place.

The customer and rider experiences ship as a mobile-first Progressive Web App (installable to the home screen, push notifications, full-screen). The admin and outlet manager experiences are desktop-browser-first, where dense dashboards and analytics work best. Both are served from the same Next.js codebase. The whole product uses Hundo's existing brand design language from hundopizza.com (Section 14).

It is a single-brand, multi-outlet system. It is not a multi-restaurant marketplace.

### 1.2 Problem

Ordering through aggregators costs Hundo commission on every order, hides customer data (phone numbers, order history, preferences), limits control over menu presentation (for example, promoting Alt-Dough), and gives no unified view of operations across outlets.

### 1.3 Goals

The MVP must let a customer place and pay for an order, route it to the correct outlet, let that outlet prepare it, let a Hundo rider deliver it, and let admins monitor all of this live. Success means real customers completing real orders end to end without staff falling back to phone calls or WhatsApp to coordinate.

### 1.4 Non-goals (MVP)

Native iOS/Android apps, multi-restaurant marketplace features, live GPS map tracking of riders, loyalty programs, and third-party delivery integration are explicitly out of scope for the MVP.

### 1.5 Success metrics (first 90 days after launch)

| Metric | Target |
|---|---|
| Checkout conversion (cart → paid order) | ≥ 60% |
| Payment success rate (online) | ≥ 95% |
| Median order-to-delivery time | ≤ 40 minutes |
| Orders requiring manual phone coordination | < 5% |
| Share of Hundo's total orders placed direct | ≥ 15% |

---

## 2. Users and Roles

All roles use the same application. Access is controlled by a `role` on the user record plus, for staff, an `outletId` that scopes what they can see.

| Role | Who | Scope | Primary surface |
|---|---|---|---|
| Customer | Anyone ordering | Own orders and addresses | `/` (shop) |
| Super Admin | Hundo owners / head office | All outlets | `/admin` |
| Outlet Manager | Manager of one outlet | Own outlet | `/admin` (filtered) |
| Kitchen Staff | Outlet kitchen | Own outlet's active orders | `/kitchen` |
| Rider | Hundo delivery staff | Orders assigned to them | `/rider` |

### 2.0 Platform by role

| Role | Platform | Primary device | Design target |
|---|---|---|---|
| Customer | Installable PWA | Phone | Mobile-first, 360–430 px wide, scales up gracefully to desktop |
| Rider | Installable PWA | Phone (often one-handed, outdoors) | Mobile-only, large tap targets, high contrast |
| Kitchen Staff | Browser / installed PWA | 10-inch tablet, landscape | Tablet-first, large type |
| Outlet Manager | Desktop browser | Laptop / desktop | Desktop-first (≥ 1280 px), usable on tablet |
| Super Admin | Desktop browser | Laptop / desktop | Desktop-first (≥ 1280 px), usable on tablet |

Admin screens must remain functional on a phone for emergencies (accepting an order, closing an outlet), but are not optimized for it.

### 2.1 Permissions matrix

| Capability | Customer | Kitchen | Rider | Outlet Mgr | Super Admin |
|---|---|---|---|---|---|
| Browse menu, place order | ✓ | | | | |
| View own orders | ✓ | | ✓ (assigned) | | |
| View outlet order queue | | ✓ | | ✓ | ✓ (all) |
| Confirm / reject order | | | | ✓ | ✓ |
| Mark Preparing / Ready | | ✓ | | ✓ | ✓ |
| Assign rider | | | | ✓ | ✓ |
| Mark Picked up / Delivered | | | ✓ | ✓ | ✓ |
| Collect COD payment | | | ✓ | | |
| Toggle item availability | | ✓ | | ✓ | ✓ |
| Edit menu, prices | | | | | ✓ |
| Manage outlets, zones, staff | | | | | ✓ |
| View dashboards | | | | ✓ (own) | ✓ (all) |
| Issue refunds | | | | | ✓ |

---

## 3. Scope

### 3.1 MVP (must ship)

Platform: installable PWA (web app manifest, service worker, app icons and splash in Hundo branding, install prompt), push notifications via Firebase Cloud Messaging for riders (new assignment) and customers (order confirmed, out for delivery, delivered), real-time order updates via Supabase Realtime.

Customer: phone OTP login, menu browsing with customization, cart, saved addresses with serviceability check, checkout with Razorpay or COD, order status page, order history, reorder.

Operations: automatic outlet routing by pincode, outlet order queue, kitchen view, rider assignment, rider app, COD collection, outlet open/close and item availability toggles.

Admin: menu and pricing management, outlet and delivery-zone management, staff management, live order monitor across outlets, basic dashboard, order cancellation and refund.

### 3.2 Phase 2

Live GPS rider tracking on a map, coupons and promo codes, ratings and reviews, WhatsApp/SMS notifications, marketing push campaigns, scheduled orders, catering inquiry flow, loyalty points, advanced analytics (cohorts, item performance, peak hours), automatic rider assignment, offline menu caching.

### 3.3 Out of scope

Multi-restaurant marketplace, third-party delivery partners, native mobile apps, table reservations, dine-in ordering.

---

## 4. Functional Requirements — Customer

| ID | Requirement | Priority |
|---|---|---|
| C-01 | Customer logs in with Indian mobile number and a 6-digit OTP. New numbers create an account automatically. Name is collected at first checkout. In Demo Mode the OTP is displayed on screen instead of sent by SMS (Section 15). | MVP |
| C-02 | Guest browsing is allowed; login is required only at checkout. Cart persists through login. | MVP |
| C-03 | Before showing the menu, the customer sets a delivery location (pincode or saved address). The app determines the serving outlet and shows that outlet's menu availability. If no outlet serves the pincode, show a clear "we don't deliver here yet" message. | MVP |
| C-04 | Menu is organized by category (Pizzas, Pastas, Sides, Beverages, Desserts) with veg/non-veg markers, images, descriptions and prices. Unavailable items are shown greyed out, not hidden. | MVP |
| C-05 | Items support customization groups: size (single choice, required), crust including Alt-Dough (single choice, required for pizzas), extra toppings (multiple choice, optional, max limit). Each option can add a price delta. | MVP |
| C-06 | Cart shows line items with chosen options, quantity controls, item subtotal, delivery fee, packaging charge, GST, and grand total. All totals are recalculated server-side. | MVP |
| C-07 | Customer can save multiple addresses with label (Home/Work/Other), flat/building, street, landmark, pincode, and a map pin. | MVP |
| C-08 | Checkout offers online payment and Cash on Delivery. Online payment is simulated in Demo Mode and uses Razorpay (UPI, cards, netbanking, wallets) in Live Mode. COD can be disabled per outlet or above an order value cap. | MVP |
| C-09 | After placing an order, the customer sees an order status page with a progress timeline, outlet name, items, total, and rider name and phone once assigned. Status updates live via Supabase Realtime (no refresh needed). | MVP |
| C-09a | Customer is prompted (once, after first order) to enable push notifications and receives pushes for Confirmed, Out for delivery and Delivered. | MVP |
| C-09b | Customer is offered "Add to Home Screen" after first successful order (Android native prompt; iOS shows a short visual guide). | MVP |
| C-10 | Customer can cancel only while the order is in Placed status. After that, cancellation requires calling the outlet. | MVP |
| C-11 | Order history lists past orders with a one-tap Reorder that rebuilds the cart (skipping items now unavailable, with a notice). | MVP |
| C-12 | If the serving outlet is closed (outside hours or manually closed), the customer can browse but checkout is blocked with the next opening time shown. | MVP |
| C-13 | Live rider location on a map. | Phase 2 |
| C-14 | Apply coupon codes. | Phase 2 |
| C-15 | Rate order and leave review after delivery. | Phase 2 |

---

## 5. Functional Requirements — Admin and Outlet Manager

| ID | Requirement | Priority |
|---|---|---|
| A-01 | Live order board showing active orders as columns by status (Placed, Confirmed, Preparing, Ready, Out for delivery). Super Admin can filter by outlet; Outlet Manager sees only their outlet. New orders appear instantly via Supabase Realtime and trigger a sound alert. Designed for a desktop browser at ≥ 1280 px. | MVP |
| A-02 | Order detail view: customer name and phone, address with map link, items with options, payment method and status, full status history with timestamps and who changed it. | MVP |
| A-03 | Confirm or reject a Placed order. Rejection requires a reason and triggers a refund for prepaid orders. Orders not confirmed within 5 minutes are highlighted. | MVP |
| A-04 | Assign a rider to an order from the list of on-duty riders at that outlet, showing each rider's current active order count. | MVP |
| A-05 | Reassign an order to a different outlet (for example, if an outlet is overloaded). | MVP |
| A-06 | Menu management (Super Admin): create and edit categories, items, images, prices, customization groups and options, veg flag, sort order. Menu is shared across outlets; availability is per outlet. | MVP |
| A-07 | Per-outlet item availability toggle (sold out today), usable by Outlet Manager and Kitchen. | MVP |
| A-08 | Outlet management (Super Admin): name, address, phone, operating hours, open/closed override, serviceable pincodes, delivery fee, minimum order value, COD enabled flag. | MVP |
| A-09 | Staff management (Super Admin): add staff by phone number, assign role and outlet, deactivate. | MVP |
| A-10 | Dashboard showing, for a selected date range and outlet: order count, gross revenue, average order value, cancellation rate, average time from Placed to Delivered, revenue split online vs COD, top 10 items. | MVP |
| A-11 | COD reconciliation: per rider, per day, cash collected vs orders delivered, with a "cash handed over" confirmation by the manager. | MVP |
| A-12 | Cancel any order and issue full or partial refund via Razorpay (Super Admin). | MVP |
| A-13 | Customer lookup by phone with order history. | MVP |
| A-14 | Export orders to CSV for a date range. | MVP |
| A-15 | Coupon management, advanced analytics, automatic rider assignment. | Phase 2 |

---

## 6. Functional Requirements — Kitchen and Rider

### 6.1 Kitchen

| ID | Requirement | Priority |
|---|---|---|
| K-01 | Tablet-friendly screen showing Confirmed and Preparing orders for the kitchen's outlet, oldest first, with large text for items and customizations (crust and toppings prominent). | MVP |
| K-02 | One-tap transitions: Confirmed → Preparing → Ready. | MVP |
| K-03 | Timer on each order showing minutes since confirmation; orders over 15 minutes highlighted. | MVP |
| K-04 | Item availability toggle accessible from the kitchen screen. | MVP |

### 6.2 Rider

| ID | Requirement | Priority |
|---|---|---|
| R-01 | Rider logs in with phone OTP and sets themselves On duty / Off duty. Rider installs the PWA and must allow notifications to go on duty. | MVP |
| R-01a | Rider receives a push notification (with sound) when an order is assigned, even with the app closed. Tapping it opens that order. | MVP |
| R-02 | Mobile list of assigned orders with customer name, tap-to-call phone, full address, landmark, and a "Navigate" button that opens Google Maps directions. | MVP |
| R-03 | Status actions: Picked up (from Ready → Out for delivery) and Delivered. | MVP |
| R-04 | For COD orders, the Delivered action requires confirming the amount collected (cash or UPI to outlet QR). | MVP |
| R-05 | Delivery history and daily summary (orders delivered, cash collected). | MVP |
| R-06 | Share live location while on delivery. | Phase 2 |

---

## 7. Order Lifecycle and Outlet Routing

### 7.1 State machine

Every order moves through a fixed set of states. Transitions are enforced in a single server-side function; no other code changes order status directly. Each transition writes a row to `OrderStatusHistory` with actor and timestamp.

```
PENDING_PAYMENT ──(payment captured)──► PLACED
PENDING_PAYMENT ──(payment failed/timeout 15 min)──► PAYMENT_FAILED

PLACED ──(manager confirms)──► CONFIRMED
PLACED ──(manager rejects / customer cancels)──► CANCELLED

CONFIRMED ──(kitchen starts)──► PREPARING
PREPARING ──(kitchen done)──► READY
READY ──(rider picks up)──► OUT_FOR_DELIVERY
OUT_FOR_DELIVERY ──(rider delivers)──► DELIVERED

CONFIRMED / PREPARING / READY / OUT_FOR_DELIVERY ──(admin cancels)──► CANCELLED
```

COD orders skip `PENDING_PAYMENT` and are created directly as `PLACED`.

### 7.2 Allowed transitions by role

| From → To | Allowed roles |
|---|---|
| PLACED → CONFIRMED | Outlet Manager, Super Admin |
| PLACED → CANCELLED | Customer (own order), Outlet Manager, Super Admin |
| CONFIRMED → PREPARING | Kitchen, Outlet Manager, Super Admin |
| PREPARING → READY | Kitchen, Outlet Manager, Super Admin |
| READY → OUT_FOR_DELIVERY | Assigned Rider, Outlet Manager, Super Admin (requires rider assigned) |
| OUT_FOR_DELIVERY → DELIVERED | Assigned Rider, Outlet Manager, Super Admin |
| Any active → CANCELLED | Super Admin |

### 7.3 Outlet routing

Each outlet has a list of serviceable pincodes. When the customer sets a delivery location, the system finds outlets serving that pincode. If exactly one, it is selected. If several, the nearest open outlet (straight-line distance from the address pin) is selected. If none are open, checkout is blocked. The routing decision is stored on the order at placement and can be overridden later only by an admin (A-05). Pincode-based zones are chosen for the MVP because they are easy for staff to edit; polygon zones are a Phase 2 option.

---

## 8. Payments

All payment code goes through a `PaymentProvider` interface with two implementations: `MockPaymentProvider` (Demo Mode, Section 15) and `RazorpayPaymentProvider` (Live Mode). The flow below describes Live Mode; the mock follows the same states, so switching providers changes no order logic.

### 8.1 Online (Razorpay, Live Mode)

1. Customer taps Pay. The server recomputes the total, creates an `Order` in `PENDING_PAYMENT`, and creates a Razorpay order with the amount in paise and the internal order ID as receipt.
2. The client opens Razorpay Checkout with the Razorpay order ID.
3. On success, the client sends `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature` to the server, which verifies the signature and moves the order to `PLACED`.
4. Independently, a Razorpay webhook (`payment.captured`, `payment.failed`, `refund.processed`) hits a Route Handler, verifies the webhook signature, and applies the same transition idempotently. The webhook is the source of truth; the client callback is a fast path.
5. Orders left in `PENDING_PAYMENT` for 15 minutes are marked `PAYMENT_FAILED` by a scheduled job (Vercel Cron or equivalent).

### 8.2 Cash on Delivery

COD orders are created directly in `PLACED` with `paymentStatus = PENDING`. On delivery the rider confirms collection (R-04), which sets `paymentStatus = PAID` and records the collecting rider. Managers reconcile cash daily (A-11).

### 8.3 Refunds

Rejecting or cancelling a prepaid order triggers a full Razorpay refund via API. Super Admin can issue partial refunds. Refund status is tracked on a `Refund` record and updated by webhook.

### 8.4 Pricing rules

All prices are stored in paise as integers. Order total = sum of (item base price + option deltas) × quantity + delivery fee + packaging charge + GST. Tax rate and charges are configurable per outlet. The client never sends prices; it sends item IDs, option IDs and quantities only.

---

## 9. Technical Architecture

### 9.1 Principles

One Next.js application, one repository, one database, one deployment. No microservices, no separate backend, no message queues, no caching layer in the MVP. Add infrastructure only when a measured problem requires it.

### 9.2 Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), TypeScript | Server Components for reads, Server Actions for mutations, Route Handlers for webhooks |
| Database | Supabase (hosted PostgreSQL) | The single source of truth for all data. Daily backups + point-in-time recovery (Pro plan) |
| ORM / queries | Prisma (server-side) via Supabase's pooled connection | Schema, migrations, seed script; all writes go through server code |
| Auth | Supabase Auth, phone OTP, via `@supabase/ssr` | `public.User.id` = `auth.users.id`; role and outletId read from `User` |
| OTP / SMS | Demo: OTP generated server-side and shown on screen. Live: MSG91 via Supabase Send SMS Hook (or Twilio) | See Section 15. DLT registration needed only for Live |
| Real-time | Supabase Realtime (Postgres changes) | Live order board, kitchen screen, customer status, rider list |
| File storage | Supabase Storage | Menu images, brand assets |
| Push notifications | Firebase Cloud Messaging (FCM) only | Firebase is not used as a database. Web push to PWA on Android and iOS 16.4+ (installed) |
| Payments | Demo: simulated payment screen. Live: Razorpay (Checkout.js + server SDK + webhooks) | See Section 15 |
| Maps | Demo: Leaflet + OpenStreetMap tiles for the address pin, plain `google.com/maps` links for rider navigation (no API key). Live: optionally Google Places autocomplete | See Section 15 |
| UI | Tailwind CSS with Hundo design tokens (Section 14); shadcn/ui primitives restyled to match | Default shadcn look must not ship |
| Validation | Zod | Every Server Action and Route Handler input |
| PWA | Web app manifest + service worker (Serwist or hand-written) | FCM requires `firebase-messaging-sw.js`; merge into one service worker |
| Scheduled jobs | Vercel Cron | Payment timeout sweep |
| Hosting | Vercel (or a single Node server) | |
| Error tracking | Sentry | |
| Testing | Vitest (unit), Playwright (end-to-end) | |

### 9.3 Real-time updates and push

Supabase Realtime streams changes on the `Order` table to subscribed clients. Row Level Security on `Order` decides who receives what: customers see only their own orders, staff only their outlet's, riders only their assigned orders. Screens subscribe through a single `useOrderUpdates` hook, which refetches the affected order through the server after each change event so the UI never trusts raw payloads. If a Realtime connection drops, the hook falls back to polling every 15 seconds until reconnected.

Push notifications are sent server-side: when `transitionOrder()` or rider assignment succeeds, it calls `notify()`, which looks up the recipient's `PushToken` rows and sends via the Firebase Admin SDK. Failed or expired tokens are deleted. Push is a convenience; the app never depends on a push arriving.

### 9.3a Why one database

Supabase and Firebase Firestore are both hosted databases, but running both would split order data across two systems with two security models and constant sync risk. Orders, payments, refunds and reporting are relational and need transactions and SQL aggregation, which Postgres does well and Firestore does poorly. So Supabase holds all data, and Firebase is used only for FCM, where it is the most reliable web-push option.

### 9.4 Folder structure

```
hundo/
├── scripts/
│   ├── scrape-brand-assets.mjs # pulls images, logos, fonts, tokens from hundopizza.com
│   └── purge-demo.ts           # deletes demo orders and test accounts at go-live
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                 # Hundo menu, outlets, test users
├── src/
│   ├── app/
│   │   ├── (shop)/             # customer: menu, cart, checkout, orders, account
│   │   ├── admin/              # super admin + outlet manager
│   │   ├── kitchen/
│   │   ├── rider/
│   │   ├── login/
│   │   └── api/
│   │       ├── webhooks/razorpay/route.ts
│   │       ├── orders/updates/route.ts
│   │       └── cron/payment-timeout/route.ts
│   ├── server/                 # all business logic, server-only
│   │   ├── providers/          # otp, payments, maps, push: mock + live implementations
│   │   ├── orders/             # createOrder, transitionOrder, pricing
│   │   ├── payments/
│   │   ├── routing/            # outlet selection
│   │   ├── menu/
│   │   └── auth/               # session helpers, requireRole()
│   ├── components/
│   │   ├── ui/                 # shadcn
│   │   └── ...                 # shared feature components
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── supabase/           # server + browser clients (@supabase/ssr)
│   │   ├── firebase/           # client messaging init + admin SDK (server-only)
│   │   └── env.ts              # validated env vars
│   ├── styles/
│   │   └── tokens.css          # Hundo design tokens (Section 14)
│   └── middleware.ts           # session refresh + route protection by role
├── public/
│   ├── manifest.webmanifest    # PWA manifest, Hundo name/colors/icons
│   ├── sw.js                   # service worker incl. FCM background handler
│   ├── icons/                  # app icons, maskable, iOS splash
│   └── brand/                  # logo files supplied by Hundo
└── tests/
    └── e2e/
```

Rule: pages and Server Actions are thin. They validate input with Zod, call `requireRole()`, and delegate to a function in `src/server/`. Business rules live only in `src/server/`.

### 9.5 Access control

`middleware.ts` refreshes the Supabase session and blocks unauthenticated access to `/admin`, `/kitchen`, `/rider` by role. Middleware is a convenience, not the security boundary. Two layers enforce access: every Server Action and Route Handler calls `requireRole()` and scopes staff queries by `outletId`; and Row Level Security is enabled on every table so that anything reaching the database through the Supabase client (Realtime, Storage) is restricted per user. The Supabase service-role key exists only on the server and is never shipped to the browser.

---

## 10. Data Model

Core entities (Prisma models). All money fields are integers in paise. All tables have `createdAt` and `updatedAt`.

| Model | Key fields | Notes |
|---|---|---|
| User | id (= auth.users.id), phone (unique), name, role, outletId?, isActive, isOnDuty | role ∈ CUSTOMER, SUPER_ADMIN, OUTLET_MANAGER, KITCHEN, RIDER. Created by trigger on Supabase signup |
| Address | id, userId, label, line1, line2, landmark, pincode, lat, lng | |
| Outlet | id, name, address, phone, lat, lng, openTime, closeTime, isManuallyClosed, deliveryFee, minOrderValue, packagingCharge, taxRateBps, codEnabled, codMaxAmount | Hours span midnight (11:30 → 04:00) |
| ServiceablePincode | outletId, pincode | Composite unique |
| Category | id, name, sortOrder, isActive | |
| MenuItem | id, categoryId, name, description, imageUrl, basePrice, isVeg, isActive, sortOrder | Shared across outlets |
| OptionGroup | id, menuItemId, name, minSelect, maxSelect, sortOrder | e.g. Size (1–1), Crust (1–1), Toppings (0–5) |
| Option | id, optionGroupId, name, priceDelta, isDefault, isVeg | Alt-Dough is an Option under Crust |
| OutletItemAvailability | outletId, menuItemId, isAvailable | Absent row = available |
| Order | id, orderNumber (human-readable), userId, outletId, riderId?, status, paymentMethod, paymentStatus, subtotal, deliveryFee, packagingCharge, tax, total, addressSnapshot (JSON), customerNote, placedAt, deliveredAt | Address copied at placement |
| OrderItem | id, orderId, menuItemId, nameSnapshot, unitPrice, quantity, optionsSnapshot (JSON), lineTotal | Prices and names frozen at order time |
| OrderStatusHistory | id, orderId, fromStatus, toStatus, actorUserId, reason?, createdAt | Full audit trail |
| Payment | id, orderId, razorpayOrderId, razorpayPaymentId, amount, status, method, rawWebhook (JSON) | |
| Refund | id, paymentId, razorpayRefundId, amount, status, reason, createdBy | |
| CodCollection | id, orderId, riderId, amount, mode (CASH/UPI), handedOverAt?, confirmedById? | Reconciliation |
| PushToken | id, userId, fcmToken (unique), platform, userAgent, lastSeenAt | One user may have several devices |

In Live Mode, OTP storage and rate limiting are handled by Supabase Auth. In Demo Mode, a `DemoOtp` table (id, phone, codeHash, expiresAt, attempts) stores generated codes. Row Level Security is enabled on every table; policies are kept in migrations alongside the schema.

Indexes: `Order(outletId, status)`, `Order(userId, createdAt)`, `Order(riderId, status)`, `ServiceablePincode(pincode)`.

---

## 11. Non-functional Requirements

**Security.** OTP expiry and rate limits configured in Supabase Auth (5-minute expiry, limited resends per phone). RLS on every table; service-role key server-only. Razorpay signatures verified on every callback and webhook. All secrets in environment variables, validated at boot. Staff queries always scoped by outlet. No price or status values accepted from the client.

**Performance.** Menu page loads in under 2 seconds on a mid-range Android phone over 4G. Menu is server-rendered and cached, revalidated when admin edits the menu. Polling endpoints return in under 200 ms.

**Reliability.** Order creation and payment confirmation are idempotent (safe to retry). Webhook handling is idempotent by Razorpay event ID. Daily database backups with point-in-time recovery.

**Usability.** Customer and rider PWA are mobile-first and must pass Lighthouse PWA installability checks. Kitchen screen designed for a 10-inch tablet in landscape. Admin designed for desktop browsers at ≥ 1280 px. All mobile tap targets at least 44 px. Supported: Chrome Android, Safari iOS 16.4+ (push requires the PWA to be installed on iOS), latest Chrome/Edge/Safari/Firefox on desktop.

**Operating hours.** The system must handle outlet hours that cross midnight (11:30 AM to 4:00 AM) correctly for open/closed checks and for dashboard "business day" grouping (a business day runs from opening to closing, not midnight to midnight).

**Privacy.** Customer phone numbers are visible to riders only for orders assigned to them, and only until delivery plus 2 hours.

---

## 12. Delivery Plan

### 12.1 Milestones (single experienced developer; adjust for team size)

| Week | Milestone | Done when |
|---|---|---|
| 1 | Foundation and brand | Repo, Supabase project, Prisma schema with RLS, seed with real Hundo menu and outlets, Demo Mode providers and one-tap test logins, role middleware, brand assets scraped and design tokens filled from hundopizza.com, PWA shell (manifest, icons, service worker), deployed to production URL |
| 2 | Menu and cart | Customer sets location, sees outlet-routed menu, customizes items, cart with server-computed totals |
| 3 | Checkout and payments | Addresses with OpenStreetMap pin, COD order placement, simulated online payment through `PaymentProvider`, payment timeout cron |
| 4 | Operations core | Order state machine, admin live board, confirm/reject, kitchen screen |
| 5 | Delivery and live updates | Rider PWA, assignment, picked up/delivered, COD collection, Supabase Realtime on all boards, FCM push for riders and customers |
| 6 | Admin completeness | Menu management, outlet and staff management, availability toggles, refunds |
| 7 | Dashboard and hardening | Dashboard metrics, COD reconciliation, CSV export, Playwright end-to-end test, Sentry |
| 8 | Demo and approval | Full walkthrough in Demo Mode for Hundo with all roles; collect feedback and fix |
| After approval | Go live | Register SMS DLT templates, activate Razorpay, switch providers to Live (Section 15.6), pilot at one outlet, then roll out |

### 12.2 Engineering practices

Build vertical slices: by end of week 3 a real order should be placeable, even if admin screens are rough. Deploy from day one and on every merge, with preview deployments for every pull request. Keep business logic in `src/server/` with unit tests for pricing, routing and state transitions, since those are where bugs cost money. Maintain one Playwright test covering the full path from login to delivered for both COD and online payment, and run it in CI. Use Razorpay test mode and a seeded staging database for development. Resist adding infrastructure (Redis, queues, WebSockets) until a measured problem demands it.

---

## 13. Risks and Open Questions

### 13.1 Risks

| Risk | Impact | Mitigation |
|---|---|---|
| SMS DLT registration / Razorpay KYC take weeks | Go-live delayed after approval | Neither blocks the MVP (Demo Mode); start both applications as soon as Hundo approves |
| Demo Mode accidentally used with real customers | Anyone could log in as any phone number by reading the on-screen OTP; fake payments | Persistent Demo banner, boot-time guard (Section 15.5), go-live checklist |
| Staff adoption at outlets | Orders missed, fall back to phone | Sound alerts on new orders, simple tablet UI, pilot at one outlet first |
| Realtime connection drops on weak mobile networks | Stale status on rider/customer screens | Automatic polling fallback in `useOrderUpdates`; refetch on reconnect and on app focus |
| iOS push limitations | iPhone users miss notifications | Push works only for installed PWAs on iOS 16.4+; guide iOS users to install; in-app status is always live regardless |
| Font files not downloadable (Adobe Fonts domain locking) | Typography mismatch | Scraper records family names; load from official source or nearest Google Fonts match |
| Design drift from website | Inconsistent brand | Tokens defined once in `tokens.css`; Hundo signs off a screen-by-screen review in week 7 |
| Running alongside Zomato | Kitchen juggling two systems | Phase 2: consider aggregator integration or a unified kitchen view |

### 13.2 Open questions for Hundo

1. How many outlets are there today, and what pincodes does each serve?
2. Should delivery fee vary by distance, or be flat per outlet?
3. Is GST included in menu prices or added at checkout?
4. What is the maximum COD order value Hundo is comfortable with?
5. Do riders belong to a single outlet, or float between outlets?
6. Who confirms orders at each outlet during late-night hours (after midnight)?
7. Should the online menu prices match Zomato prices, or be lower to encourage direct ordering?
8. Is there an existing customer list (phone numbers) to import?
9. Are there higher-quality menu photos than those on the website (the site has banners, but not every menu item)?
10. Who at Hundo approves the design before launch?

---

## 14. Design Language

### 14.1 Principle

The app must look and feel like hundopizza.com, not like a generic food-delivery template. Customers moving from the website to the app should feel they never left Hundo. Every color, font, button and layout pattern comes from the website's existing design; nothing is introduced that the website doesn't already establish, except where the app needs a screen the website has no equivalent for (cart, checkout, tracking, dashboards). Those screens extend the same tokens and component styles rather than inventing new ones.

The app is built for Hundo Pizza (Moorjani Hospitality Private Limited, the brand and trademark owner). All brand assets (logos, banner and product images, fonts, colors) are taken directly from hundopizza.com using the included scraper script.

### 14.2 What is observable on hundopizza.com today

The website is built on Squarespace. Its structure, which the app mirrors:

| Element | On the website | In the app |
|---|---|---|
| Logo | Image wordmark ("Website Title.png") at top of every page, linking home; a secondary logo used for social sharing | Same wordmark in app header and splash screen; secondary logo for app icon if Hundo approves |
| Navigation | Horizontal header nav: Home, Our Story, Reheat, Partners, Feedback, plus Facebook and Instagram icons; collapses to a mobile menu | Customer PWA: same header style with wordmark; bottom tab bar on mobile (Menu, Orders, Account) styled with the same nav typography. Our Story, Reheat, Partners and Feedback link to the website or are reproduced as in-app pages |
| Primary CTA | Header button labelled "Give me pizza" (currently links to Zomato); "Order Now" button under banners | Same button style, shape and label for the main ordering CTA; "Give me pizza" kept as the home-screen CTA and now leads to the in-app menu |
| Hero | Full-width image banners (product banners for pastas, Alt-Dough banner, catering banner) | Home screen opens with the same banner carousel, managed by admin |
| Product copy | Short, bold, playful, food-forward lines ("Smooth, comforting, and always a classic") | Same voice for item descriptions, empty states, errors and notifications |
| Headings | Large bold display headings with exclamation energy ("Alt-Dough!") | Same heading font and weight for screen titles and section headers |
| Contact style | Emoji-led phone line ("🤙🏻 7506534770"), plain email | Same treatment on order status ("Call outlet") and footer |
| Footer | Logo, delivery area line, ownership line, email, phone, "Call for large orders!", social icons | Same footer on customer web views; in the PWA, condensed into the Account screen |
| Feature sections | Image + text blocks (Alt-Dough with Tillage partnership) | Same block pattern for featured items and promos on the home screen |

### 14.3 Asset extraction and design tokens

`scripts/scrape-brand-assets.mjs` (Node 18+, no dependencies) crawls Home, Our Story, Reheat, Partners and Feedback and writes: every image at full resolution to `public/brand/images/` (logos flagged in the manifest), font files from the site's `@font-face` rules to `public/brand/fonts/`, raw stylesheets to `public/brand/css/`, and `brand-report.json` listing Squarespace's CSS custom properties, colors ranked by usage, font families, button CSS rules and an image manifest. It runs once in week 1 and can be rerun whenever the website changes.

If a font is served through Adobe Fonts with domain locking and fails to download, the report still records its family name; load that family from its official source or use the closest Google Fonts match.

From the report, a developer confirms each token against the live site in browser developer tools (inspecting the "Give me pizza" button, header, body text and "Alt-Dough!" heading). They are defined once in `src/styles/tokens.css` and mapped into Tailwind. No hex value, font or radius may appear outside this file.

| Token group | Tokens to extract | Source on site |
|---|---|---|
| Color | `--brand-primary`, `--brand-secondary`, `--bg`, `--surface`, `--text`, `--text-muted`, `--button-bg`, `--button-text`, `--button-hover`, `--link`, `--border` | Header, "Give me pizza" button, page background, body text, footer |
| Typography | `--font-heading`, `--font-body`, `--font-button`, heading sizes (h1–h3), body size, line height, letter-spacing, text transform | "Alt-Dough!" heading, body copy, nav links, buttons |
| Buttons | radius, padding, border width, hover/active states, uppercase or not | "Give me pizza", "Order Now", "Call for Catering" |
| Layout | max content width, section spacing, header height, mobile breakpoint behaviour | Page sections and header |
| Imagery | banner aspect ratios, image corner treatment | Home banners, product images |

App-only states the website lacks (success, warning, error, disabled, focus ring, order status colors) are derived from the brand palette and approved by Hundo, with WCAG AA contrast.

### 14.4 Component rules

Buttons everywhere reuse the website's button style; there is one primary and one secondary button variant, both from the site. Status chips on order screens (Placed, Preparing, Out for delivery, etc.) use brand colors, not a generic traffic-light scheme, with icons so meaning never depends on color alone. Menu item cards use the website's image-first presentation with the playful product copy below. Veg/non-veg markers follow the standard Indian green/brown symbols, as these are regulatory conventions customers expect.

### 14.5 Admin dashboard styling

Admin and outlet manager screens use the same fonts, colors and buttons, but with a denser desktop layout: a left sidebar (wordmark at top), data tables, and charts in brand colors. They should read as clearly Hundo, while prioritizing scannability over the marketing feel of the customer app.

### 14.6 PWA branding

The manifest's `name` is "Hundo Pizza", `short_name` "Hundo", `theme_color` and `background_color` set from the brand tokens. App icons and maskable icons are produced from Hundo's logo files. The iOS splash screen shows the wordmark on the brand background.

### 14.7 Acceptance

Before launch, Hundo reviews side-by-side screenshots of website and app for the home screen, menu, item detail, cart, checkout, order status, rider screen and admin dashboard, and signs off that the app matches the brand.

---

## 15. Demo Mode (MVP without paid or approval-gated services)

### 15.1 Goal

Until Hundo approves the MVP, nobody testing the app should be blocked by anything that costs money, needs a business account, or needs regulatory approval. Every external service sits behind an interface with a Mock implementation and a Live implementation. One environment variable switches each service. Order logic, screens and database are identical in both modes, so going live is configuration, not a rewrite.

### 15.2 Configuration

```
APP_MODE=demo                # demo | live
OTP_PROVIDER=mock            # mock | supabase
PAYMENT_PROVIDER=mock        # mock | razorpay
MAPS_PROVIDER=osm            # osm | google
PUSH_PROVIDER=fcm            # fcm | off   (FCM is free; "off" if not set up yet)
```

`src/server/providers/index.ts` reads these once at boot (validated by Zod in `env.ts`) and exports `otp`, `payments`, `maps`, `push`. No other file imports a vendor SDK directly.

### 15.3 What each mock does

| Service | Live behaviour | Demo behaviour |
|---|---|---|
| OTP login | SMS sent via Supabase Auth + MSG91 | Server generates a 6-digit code, stores it hashed in `DemoOtp` with 5-minute expiry, and returns it to the login screen, which shows it in a highlighted box ("Demo OTP: 482913") with a one-tap autofill. On correct entry, the server creates or finds the Supabase user with `phone_confirm: true` via the admin API and signs them in, so sessions, RLS and Realtime behave exactly as in Live |
| Quick role login | Not available | Login screen shows "Continue as" buttons for seeded test accounts: Customer, Super Admin, each Outlet Manager, Kitchen per outlet, two Riders per outlet. Lets a tester switch roles in seconds |
| Online payment | Razorpay Checkout | A Hundo-styled payment sheet showing the amount with three buttons: "Pay successfully", "Fail payment", "Close without paying". Each drives the same state transitions as the matching Razorpay outcome (PLACED, PAYMENT_FAILED, left PENDING_PAYMENT for the timeout cron). Simulated webhooks are written to the `Payment` table so admin views and refunds work |
| Refunds | Razorpay refund API | Refund record created and marked processed immediately |
| Address map | Google Places autocomplete + map | Leaflet map with OpenStreetMap tiles and a draggable pin; typed address fields; pincode drives outlet routing as usual |
| Rider navigation | Google Maps directions | Same: plain `https://www.google.com/maps/dir/?api=1&destination=lat,lng` link, which needs no API key in either mode |
| Push notifications | FCM | FCM (free). If not configured, `PUSH_PROVIDER=off` and the app relies on Realtime in-app updates and a sound alert |
| Hosting, database | Vercel, Supabase | Free tiers of the same services |

### 15.4 Demo visibility

Every screen in Demo Mode shows a slim banner, styled with Hundo tokens: "Demo mode: OTPs are shown on screen and payments are simulated." Orders placed in Demo Mode carry `isDemo = true`, which dashboards can filter out and the go-live script deletes.

### 15.5 Safeguards

Demo Mode removes authentication's real protection: anyone can log in as any phone number by reading the on-screen code. Therefore Demo Mode is used only with Hundo staff and invited testers, never advertised to the public or real customers. At boot, if `APP_MODE=live` but any provider is still `mock`, the app refuses to start and logs which provider is wrong; if `APP_MODE=demo`, quick role logins and the on-screen OTP are enabled, and they are compiled out of the response entirely when `APP_MODE=live`.

### 15.6 Go-live checklist (after approval)

1. Register DLT entity and OTP template; configure MSG91 in Supabase Auth's Send SMS Hook; set `OTP_PROVIDER=supabase`.
2. Complete Razorpay KYC; add live keys and webhook secret; set `PAYMENT_PROVIDER=razorpay`; run one real ₹1 payment and refund.
3. Optionally add a Google Maps key and set `MAPS_PROVIDER=google`.
4. Confirm FCM keys; set `PUSH_PROVIDER=fcm`.
5. Delete demo orders and test accounts (`npm run purge:demo`); set `APP_MODE=live`.
6. Run the Playwright end-to-end suite against production in Live Mode with a staff phone.
7. Pilot at one outlet.
