# SVATEH E‑commerce — Build Plan (draft for approval)

Sources: client blueprint PDF (20 pages + journeys + build stages) and the violet/white/plum/blush/gold HTML reference.

---

## 1. Architecture (one Vercel deploy)

```
svateh/                         ← pnpm + Turborepo monorepo
├─ apps/
│  └─ web/                      ← Next.js 15 (App Router, TypeScript)
│     ├─ app/(store)/…          ← public storefront (frontend)
│     ├─ app/admin/…            ← client admin panel (no-code management)
│     └─ app/api/…              ← backend REST endpoints (route handlers)
├─ packages/
│  ├─ db/                       ← Mongoose models + MongoDB Atlas connection
│  ├─ core/                     ← business logic: pricing, cart, coupons, stock, shade matching, orders
│  ├─ validation/               ← Zod schemas shared by forms + API
│  └─ ui/                       ← design‑system components (brand tokens)
└─ turbo.json / vercel.json
```

- **Why one Next.js app:** storefront, admin and API ship together as a single Vercel project — one deploy, one domain, one set of env vars. Backend logic lives in `packages/` so it stays cleanly separated from UI.
- **Database:** MongoDB Atlas via Mongoose (connection cached for serverless).
- **Images:** AWS S3, uploaded **directly from the browser** using presigned URLs (avoids Vercel's 4.5 MB request limit). Optional CloudFront in front of S3. Served through `next/image`.
- **Auth:** Auth.js — admin login (email + password, roles) and optional customer accounts. Guest checkout always allowed.
- **Payments:** Razorpay (UPI/cards/netbanking) + Cash on Delivery, both toggleable from admin. Order marked paid **only** after server‑side signature/webhook verification.
- **Email:** transactional emails (order confirmation, shipped, contact‑form copy, password reset) via Resend or AWS SES.
- **Rendering:** product/collection pages statically generated + revalidated on admin save (fast + SEO), cart/checkout dynamic.

## 2. Design system (from the HTML reference)

| Token | Hex | Use |
|---|---|---|
| Midnight Violet | `#381A40` | primary surfaces, footer, headings |
| Deep Plum | `#261732` | header, hero background, dark sections |
| Blush | `#E7A8B9` | primary buttons, accents |
| Gold | `#C8A45D` | eyebrows, marquee, highlights, borders |
| Cream | `#F7F2EA` | page background |
| White / Ink | `#FFFFFF` / `#281E2C` | cards / body text |

Fonts: **Playfair Display** (display/headings) + **DM Sans** (body). Pill buttons, uppercase letter‑spaced labels, gold marquee strip, large tight serif headlines, soft circular blush/gold motifs. Fully responsive, mobile‑first (sticky Add to Bag on mobile).

## 3. Storefront pages (mapped to the PDF)

| # | Page | Notes |
|---|---|---|
| 1 | **Home** | Announcement bar, header, hero, The Edit, Beauty That Does More, Shop Your Mood, 5‑Minute Face, Why SVATEH, Shade Finder CTA, Girls/Community, Reviews, Our Story, Newsletter, footer. **Every section editable, re‑orderable and hideable from admin.** |
| 2 | Shop All (“The Edit”) | Category filter (only non‑empty categories), price/finish/coverage/shade filters, sort, Quick Add |
| 3 | Category pages | Face / Lips / Cheeks / Eyes — auto‑hidden from menu when empty |
| 4 | Product detail | Gallery, price, size, shade swatches, rating, Add to Bag, delivery info, What it is, Why you'll love it, Texture/finish/coverage, How to use, Ingredients, Find your shade, Reviews, Complete your look, Shipping/returns FAQ. Admin **blocks publishing** if How to Use or Ingredients is empty. |
| 5 | Shade Finder | Depth → Undertone → (optional) existing foundation → recommendation → Shop My Shade. Matching matrix editable in admin. |
| 6 | Shop by Mood | Landing + one page per mood (Pink, Nude, Soft Glam, Date Night, Glow Mode) with products, application order, look image/video, bundle |
| 7 | Shop the Routine | Routines with steps, individual + combined price, “Add all to bag” |
| 8 | Bundles + Build Your Own Bag | Curated bundles with savings; BYOB: face → cheek → lip picker with stock/variant validation and admin‑configured discount |
| 9 | New Arrivals / Bestsellers | Collection filters; “Bestseller” computed from real orders (or manually flagged); pre‑launch label switch (“New Launches”) |
| 10 | SVATEH Girls / Community | Creator/customer posts (image/video/Instagram link) linked to products, with “permission obtained” checkbox |
| 11 | About | Rich‑text sections editable in admin |
| 12 | Reviews | Verified‑purchase reviews only, photo uploads, admin moderation, filters by product/shade/rating. No ratings shown until real reviews exist. |
| 13 | FAQ | Categorised accordions, managed in admin |
| 14 | Contact | Form (name, email, order #, message) → saved in admin + emailed; contact details from settings |
| 15 | Shipping / Returns / Privacy / Terms | Rich‑text policy pages in admin |
| 16 | Cart (drawer + page) | “Your SVATEH Bag”, qty/remove, free‑shipping progress bar, Complete Your Look, coupon, checkout |
| 17 | Checkout | Contact → address (PIN code validation + serviceability) → delivery option → payment (Razorpay/COD rules) → review → place order. Idempotent (no duplicate orders), stock re‑checked. |
| 18 | Order confirmation | Order #, items/shades, amount, address, ETA, tracking link, support link + email |
| 19 | Search / Account / Track order | Search by name/category/shade; account with order history & addresses; guest order lookup by order # + email |
| 20 | Footer | Shop / Discover / Help / Follow / Newsletter / Legal — links and socials from admin |

Plus: SEO (per‑page meta, Open Graph, sitemap.xml, robots.txt, product JSON‑LD), 404 page, cookie notice, analytics hook (GA4 / Meta Pixel IDs entered in admin).

## 4. Admin panel — what the client can do without touching code

- **Dashboard:** today's orders, revenue, low‑stock alerts, pending reviews/messages.
- **Products:** create/edit, drag‑drop image upload to S3, shades/variants (name, hex swatch, SKU, price, stock, image), categories, finish/coverage/undertone attributes, badges, SEO fields, publish/draft.
- **Collections / Moods / Routines / Bundles / Build‑Your‑Own‑Bag rules.**
- **Shade Finder:** edit depth/undertone options and the shade‑matching table.
- **Homepage builder:** edit text, images, buttons of every section; toggle on/off; reorder; announcement bar & marquee text.
- **Pages:** About, policies, FAQ — rich‑text editor.
- **Orders:** view, filter, change status (placed → packed → shipped → delivered / cancelled / refunded), add courier + tracking number (auto‑emails customer), print invoice/packing slip, export CSV.
- **Customers, Reviews (approve/reject), Community posts, Contact messages, Newsletter subscribers (CSV export).**
- **Coupons:** % / flat, min order, expiry, usage limit.
- **Shipping & payments:** free‑shipping threshold, flat charges, COD on/off + COD limits, serviceable PIN codes, Razorpay on/off.
- **Site settings:** logo, brand name, contact email/phone/WhatsApp, social links, SEO defaults, analytics IDs, brand colours.
- **Admin users & roles:** Owner, Manager, Editor (content only).

## 5. Data models (MongoDB)

`Product` (with embedded `variants`), `Category`, `Collection` (moods/new/bestsellers), `Routine`, `Bundle`, `ByobConfig`, `ShadeFinderConfig`, `Review`, `CommunityPost`, `Order`, `Customer`, `Cart` (guest + user), `Coupon`, `Page`, `FaqItem`, `HomepageSection`, `SiteSettings`, `ShippingSettings`, `ContactMessage`, `Subscriber`, `AdminUser`, `AuditLog`.

## 6. Delivery phases (follows the PDF's “What to build first”)

1. **Foundation** — monorepo, design system, DB models, S3 upload, admin auth, site settings.
2. **Stage 1 (launch essentials)** — Home, Shop All, categories, PDP, cart, checkout (Razorpay + COD), confirmation + emails, About, Contact, FAQ, policies, search, account/order tracking; admin for all of these.
3. **Stage 2 (conversion)** — Shade Finder, Shop by Mood, Routines, Bundles, Complete Your Look, reviews.
4. **Stage 3 (ecosystem)** — Community, Build Your Own Bag, gifting; loyalty/referrals left as future scope.
5. **Handover** — seed script with demo content (clearly marked placeholder), `.env.example`, step‑by‑step Vercel + Atlas + S3 + Razorpay setup guide, and a non‑technical **Admin User Guide** for the client.

## 7. Confirmed decisions

- **Brand name: SVATEH everywhere** (logo, titles, emails, metadata), domain svateh.com. Overrides the PDF's "SVATE"; also stored as an admin setting.
- **Payments:** Razorpay + Cash on Delivery (each toggleable in admin). Currency ₹ INR.
- **Email:** Resend (DNS records on svateh.com needed at deploy time).
- **Scope:** all 3 stages; loyalty/referrals left as future scope.

Still needed later (not blocking — placeholders until then): real product data and shade range, policy texts, contact details, logo files, campaign photography.
