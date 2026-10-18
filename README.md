# SVATEH — e-commerce store

A complete beauty store for **SVATEH** (svateh.com): storefront, no-code admin panel and backend API in one monorepo, deployed to **Vercel** as a single project, with **MongoDB Atlas** for data, **AWS S3** for images, **Razorpay** + Cash on Delivery for payments, and **Resend** for email.

```
svateh/
├─ apps/web/              Next.js 16 app — storefront, /admin panel, /api backend (one Vercel deploy)
│  └─ src/
│     ├─ app/(store)/     Public pages (home, shop, product, moods, routines, bundles, checkout…)
│     ├─ app/admin/       Admin panel (login, dashboard, orders, generic content editor)
│     ├─ app/api/         REST endpoints (cart, checkout, payments, uploads, admin CRUD)
│     ├─ components/      store/ and admin/ UI
│     └─ lib/             auth, S3, Razorpay, email, sanitising
├─ packages/core/         Shared, framework-free: resource/field definitions, pricing, shipping,
│                         coupon & COD rules, validation, email templates
└─ packages/db/           Mongoose models (generated from core's field definitions), services
                          (catalog, cart pricing, orders, accounts, dashboard) and the seed script
```

**How the no-code admin works:** every editable thing (products, moods, homepage blocks, pages, settings…) is declared once in [`packages/core/src/resources.ts`](packages/core/src/resources.ts). That single definition generates the database model, the server-side validation and the admin form. To add a new field for the client, add one line there — nothing else.

---

## 1. Run locally

Requirements: Node 20+, pnpm 10 (`corepack enable`), and MongoDB (local or an Atlas cluster).

```bash
pnpm install
```

```bash
cp .env.example apps/web/.env.local
```

Fill in at least `MONGODB_URI` and `AUTH_SECRET` (`openssl rand -base64 48`). Then:

```bash
pnpm seed
```

```bash
pnpm dev
```

Open http://localhost:3000 for the store and http://localhost:3000/admin for the admin (the first visit asks you to create the owner account).

Without S3 keys, uploads in development are saved to `apps/web/public/uploads`. Without Resend, emails are printed to the terminal. Without Razorpay, checkout offers Cash on Delivery only.

## 2. Deploy to Vercel (one project)

1. Push this repo to GitHub.
2. Vercel → **Add New Project** → import the repo.
3. **Root Directory:** `apps/web`. Leave “Include files outside the root directory” **on** (default) so the shared packages are bundled. Framework is detected as Next.js; the install and build commands are detected automatically from pnpm.
4. Add the environment variables from [`.env.example`](.env.example) (Production + Preview).
5. Deploy. Visit `https://<your-domain>/admin` → create the owner account → **Install starter content** on the dashboard (or start from scratch).
6. Add the domain `svateh.com` under Project → Settings → Domains and set `NEXT_PUBLIC_SITE_URL=https://svateh.com`.

A cron job in [`apps/web/vercel.json`](apps/web/vercel.json) runs daily to cancel abandoned online-payment orders and return their stock. The checkout also does this on every order, so the Hobby plan’s once-a-day limit is fine.

## 3. MongoDB Atlas

1. Create a cluster (M0 is fine to start; M10+ recommended for production backups).
2. Database Access → add a user with read/write on the `svateh` database.
3. Network Access → allow `0.0.0.0/0` (Vercel uses dynamic IPs), or use the Vercel ↔ Atlas integration.
4. Connect → Drivers → copy the URI into `MONGODB_URI` (include `/svateh` as the database name).

## 4. AWS S3 (images)

1. Create a bucket, e.g. `svateh-media` in `ap-south-1` (Mumbai).
2. **Block Public Access:** turn off “Block all public access” (images must be publicly readable), then add this bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{ "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::svateh-media/*" }]
}
```

3. **CORS** (Permissions → CORS) so the browser can upload directly:

```json
[
  {
    "AllowedOrigins": ["https://svateh.com", "https://*.vercel.app", "http://localhost:3000"],
    "AllowedMethods": ["POST", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

4. IAM → create a user with programmatic access and only this policy, then put its keys in `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`:

```json
{
  "Version": "2012-10-17",
  "Statement": [{ "Effect": "Allow", "Action": ["s3:PutObject"], "Resource": "arn:aws:s3:::svateh-media/*" }]
}
```

5. Optional: put CloudFront in front of the bucket and set `S3_PUBLIC_URL` to its URL.

Uploads go **straight from the browser to S3** using short-lived presigned POSTs (5-minute expiry, size and type locked), so they never hit Vercel’s 4.5 MB request limit. Admin uploads allow up to 20 MB; customer review photos up to 5 MB and images only.

## 5. Razorpay

1. Dashboard → Account & Settings → **API Keys** → generate keys → `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`. Use test keys on Preview and live keys on Production.
2. **Webhooks** → add `https://svateh.com/api/payments/razorpay/webhook`, events `payment.captured`, `order.paid` and `payment.failed`, and set a secret → `RAZORPAY_WEBHOOK_SECRET`.

Payment flow: the server prices the cart from the database, reserves stock, creates the order and a Razorpay order, and the customer pays in the Razorpay modal. The order is marked paid **only** after the signature is verified server-side (or via the webhook if the customer closes the browser). Unpaid orders are auto-cancelled after 45 minutes and their stock released. Customers can retry payment from their order page.

## 6. Resend (email)

1. resend.com → add domain `svateh.com` → add the DNS records it shows → verify.
2. Create an API key → `RESEND_API_KEY`. Set `EMAIL_FROM` to an address on that domain.

Emails sent: order confirmation (customer) + new-order alert (store), status updates (packed/shipped with tracking/delivered/cancelled/refunded), contact-form acknowledgement + store copy, password resets, newsletter welcome.

## 7. Before launch — content checklist

The admin dashboard shows a live **Launch checklist**. Starter content is clearly marked `[PLACEHOLDER]`; replace it all:

- Product descriptions, benefits and **full INCI ingredient lists**
- Shade range and the **Shade Finder** matching table (must use validated matching)
- About page, Shipping, Returns, Privacy and Terms (legally reviewed)
- FAQ answers matching real operations
- Support email, phone/WhatsApp, address and business disclosure (only verified details)
- Real product and campaign photography
- Vegan/cruelty-free badges only if certified

No reviews or ratings are seeded, and ratings only appear once real, approved reviews exist.

## 8. Security notes

- Admin and customer sessions are signed JWTs in httpOnly cookies; every admin page and API re-checks the user and role in the database. Roles: owner, manager, editor.
- All prices, stock, coupons, shipping and COD eligibility are computed on the server. Stock is reserved atomically per shade (no overselling) and checkout is idempotent (double clicks create one order).
- Rich text from the admin is sanitised before rendering. CSV exports are protected against spreadsheet formula injection.
- Optional `ADMIN_SETUP_KEY` protects the one-time owner setup screen. To reset a locked-out owner from a terminal:

```bash
pnpm create-admin --email owner@svateh.com --password 'a-long-new-password' --name "Owner"
```

## 9. Useful commands

| Command | What it does |
|---|---|
| `pnpm dev` | Run the store locally |
| `pnpm build` | Production build (what Vercel runs) |
| `pnpm typecheck` | Type-check all packages |
| `pnpm seed` | Install starter content into an empty store (`-- --force` replaces catalogue/content, never orders or users) |
| `pnpm create-admin` | Create or reset an owner account |

See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for the client-facing admin manual (the same guide is built into the admin under **Help & guide**).
