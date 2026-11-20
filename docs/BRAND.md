# Hundo brand — assets & design tokens

Source: hundopizza.com, scraped 2026-11-20 with `scripts/scrape-brand-assets.mjs` (raw output in
`brand-report.json`, `public/brand/`). Draft tokens: [src/styles/tokens.css](../src/styles/tokens.css).
Everything here is **draft until confirmed in DevTools (Phase 1) and approved by Hundo (Phase 7/8)**.

## 1. What the website actually uses

The site is Squarespace 7.1. Squarespace's theme fonts are **Abel / Source Code Pro**, but Hundo's
custom CSS overrides them:

```css
h1, h2, h3, .header-nav-item, .header-menu-nav, .sqs-block-button-element { font-family: 'TheMixMono-9-Black' }
p { font-family: 'TheMixMono-5-Regular' }
```

| Token | Value | Where it comes from |
|---|---|---|
| Brand red | `#EC1C24` | The "bright" section theme background — the first section of every page, so the header sits on red |
| Text on red | white | "bright" theme: headings, paragraphs, nav and buttons are white |
| Black | `#000000` | Wordmark, headings on white sections, borders |
| Navy (accent) | `#253551` | Squarespace accent color; button fill in default themes |
| Charcoal | `#2A2829` | "dark" section (Our Story) |
| Cream | `#E0E0DB` | Squarespace light accent |
| Heading / nav / button font | TheMixMono-9-Black | Custom CSS |
| Body font | TheMixMono-5-Regular | Custom CSS |
| Heading sizes | h1 4rem · h2 2.8rem · h3 2.2rem · h4 1.6rem, line-height 1.4 | Site styles |
| Body | 16px base, line-height 1.7 | Site styles |
| Buttons | **Outline** style, 2px stroke; primary **square**, secondary **pill**; padding 1.2em × 2em; letter-spacing .02em; no uppercase | Body classes `primary-button-style-outline primary-button-shape-square secondary-button-shape-pill` |
| Header | Wordmark left, nav right, "Give me pizza" CTA (primary-inverse button) | Page HTML |
| Banners | 16:9 (2048×1152, 2500×1406), square corners | Images |

### Contrast warning (needs Hundo's OK — Q1.9)
White on `#EC1C24` is **4.41:1**: fine for large or bold text and buttons, **not** AA for small
body text. Proposal: white-on-red only for headings, buttons and text ≥ 18.7 px bold. Small red text on
white uses `--brand-red-text #E2131B` (4.84:1). Black on red is 4.76:1.

### Font licence (needs Hundo's OK — Q1.8)
TheMixMono is a commercial LucasFonts typeface. Embedding it in the app needs a web/app licence.
The `.otf` files are downloaded, and the scrape doesn't tell us the licence terms.

## 2. Asset catalogue (`public/brand/images/`)

| File | What it is | Used on site | Use in app |
|---|---|---|---|
| `Website_Title_b88b13.png` | Wordmark "HUNDO PIZZA" + tagline "100% HEART. 100% PIZZA.", black, transparent | Header, all pages | Header, splash (see derived files) |
| `Hundo_Secondary-Logo_b10ccf.jpg` (2500w) / `_07536c.jpg` (1500w) | Red brush "100" behind black wordmark + tagline, white bg | Social sharing | App icon (draft), About |
| `favicon_672865.ico` | Site favicon | Browser tab | Reference only |
| `Hundo_Website_Banners-01_ec3d4e.png` | "Pasta made the menu and the mooood" banner | Home carousel | Home carousel |
| `Hundo_Website_Banners-02_3fd265.png` | Pink Sauce Pasta banner | Home carousel | Home carousel / item image |
| `Hundo_Website_Banners-03_d6b681.png` | Funghi Fusilli Pasta banner | Home carousel | Home carousel / item image |
| `Hundo_Website_Banners-04_ead07c.png` | Cajun Penne Pasta banner | Home carousel | Home carousel / item image |
| `AltDough_WebsiteBanner_OGGG_1d1a3a.jpg` | "Introducing Alt-Dough" banner | Home | Alt-Dough feature block |
| `Hundo_2023-Catering-Banner_Web_a78274.png` | "Be a good host" catering banner (phone 7506534770) | Home | Account / catering link (catering flow is Phase 2) |
| `DSC00298_05c3fe.jpg` | Two people carrying Hundo boxes | Home | Empty states, splash alt |
| `DSC03508_35b3a8.jpg`, `DSC03583_d9cccf.jpg` | Pizzas in Hundo box (top-down) | Reheat | Item/placeholder imagery |
| `LAH-01665_e404cd.jpg` | Table spread, hands reaching | Our Story | Empty state / About |
| `DSC08433-2_1__15782a.jpg` | Pepperoni pizza + garlic bread spread | Partners | Item/hero imagery |
| `Snapinsta.app_…_26275b.jpg` | Hand holding "100" pizza box | Partners | About / social |
| `Screenshot_2023-05-03_at_1.39.05_AM_608380.png` | Soft Spot plant-based mozzarella (partner product) | Partners | Not for app |
| `Screenshot_2023-05-03_at_1.41.57_AM_068ef8.png` | "better." jackfruit product (partner) | Partners | Not for app |
| `Screenshot_2023-05-03_at_1.25.27_AM_3d5773.png` | Partner's software screenshot | Partners | Not for app |
| `social-accounts_*.svg` | Facebook / Instagram icon sprites | Header/footer | Footer / Account |

There are **no per-item menu photos** beyond the 3 pasta banners and a few pizza shots (Q2.11).

## 3. Derived assets (made in Phase 0 from the files above)

| File | Description |
|---|---|
| `public/brand/app/wordmark-black.png` / `wordmark-white.png` | Wordmark + tagline, trimmed, transparent |
| `public/brand/app/wordmark-title-black.png` / `-white.png` | "HUNDO PIZZA" only (no tagline) — for headers and admin sidebar |
| `public/brand/app/secondary-logo-trimmed.png` | Secondary "100" logo, whitespace trimmed |
| `public/icons/icon-192.png`, `icon-512.png` | PWA icons (secondary logo on white) — **draft, Q1.10** |
| `public/icons/icon-maskable-192.png`, `-512.png` | Maskable icons, logo within 80 % safe zone |
| `public/icons/apple-touch-icon.png` (180), `favicon-32.png`, `favicon.ico` | iOS + browser icons |
| `public/icons/splash-1290x2796.png` | iOS splash base: white wordmark on brand red (full splash set generated in Phase 1) |
| `public/manifest.webmanifest` | Draft manifest (name, short_name, theme/background from brand red) |

At 32 px the full secondary logo is hard to read. Phase 1 should check whether the favicon reads
better as just the red "100" mark (needs a vector or clean crop from Hundo).

## 4. Voice (from site copy)
Short, bold, playful, food-forward. Examples on the site: "Give me pizza", "Smooth, comforting,
and always a classic", "Alt-Dough!", "Be a good host. Make it Hundo.", "Call for large orders!",
emoji-led phone line "🤙🏻 7506534770".

## 5. Re-running the scrape
`node scripts/scrape-brand-assets.mjs` (≈ 75 s). It overwrites `public/brand/{images,fonts,css}`
and `brand-report.json`, but **not** `public/brand/app/` or `public/icons/`.
