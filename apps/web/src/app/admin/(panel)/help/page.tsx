import Link from "next/link";
import { PageHeader, card } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { razorpayConfigured } from "@/lib/razorpay";
import { s3Configured } from "@/lib/s3";

export const metadata = { title: "Help & guide" };

const H = ({ id, children }: { id?: string; children: React.ReactNode }) => (
  <h2 id={id} className="mb-3 scroll-mt-6 font-display text-2xl">
    {children}
  </h2>
);

export default async function HelpPage() {
  await requireAdminPage();
  const status = [
    { label: "Database (MongoDB Atlas)", ok: true },
    { label: "Image uploads (AWS S3)", ok: s3Configured() },
    { label: "Online payments (Razorpay)", ok: razorpayConfigured() },
    { label: "Razorpay webhook secret", ok: !!process.env.RAZORPAY_WEBHOOK_SECRET },
    { label: "Emails (Resend)", ok: !!process.env.RESEND_API_KEY },
  ];
  const toc = [
    ["products", "Add or edit a product"],
    ["homepage", "Change the homepage"],
    ["merch", "Moods, routines, bundles & Shade Finder"],
    ["orders", "Process an order"],
    ["shipping", "Shipping, COD & payments"],
    ["reviews", "Reviews & SVATEH Girls"],
    ["content", "Pages, policies & FAQs"],
    ["marketing", "Coupons, subscribers & analytics"],
    ["team", "Team access"],
    ["setup", "Technical setup"],
  ];
  const li = "ml-5 list-decimal space-y-1.5 text-sm text-ink/80";
  return (
    <>
      <PageHeader title="Help & guide" description="Everything you can do from this admin — no code needed." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="h-fit space-y-1 text-sm lg:sticky lg:top-6">
          {toc.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded-lg px-3 py-1.5 hover:bg-white">
              {label}
            </a>
          ))}
        </nav>
        <div className="space-y-6">
          <section className={card}>
            <H id="products">Add or edit a product</H>
            <ol className={li}>
              <li>Go to <Link href="/admin/r/products" className="text-violet underline">Products</Link> → <strong>New product</strong>.</li>
              <li>Fill in the name, product type, short descriptor and category. The URL is created automatically.</li>
              <li>Set the price. Use <em>Compare-at price</em> only for genuine offers.</li>
              <li>Drag photos into <strong>Product images</strong>. The first image is the main one; use the arrows to reorder.</li>
              <li>Under <strong>Shades / variants</strong> add each shade with a unique SKU, swatch colour and stock. A product without shades needs one variant called “Standard”.</li>
              <li>Fill in <em>What it is, Why you’ll love it, How to use</em> and the full <em>Ingredients</em> list — the site won’t publish a product without How to use and Ingredients. Until photos are uploaded, a branded placeholder is shown.</li>
              <li>Pick <em>Complete your look</em> products, then set Status to <strong>Published</strong> and Save. Changes are live immediately.</li>
            </ol>
            <p className="mt-3 text-xs text-ink/60">Tip: use <strong>Duplicate</strong> to create a similar product quickly — it’s saved as a draft so nothing goes live by accident. Turn on “Show in The SVATEH Edit” to feature a product on the homepage.</p>
          </section>

          <section className={card}>
            <H id="homepage">Change the homepage</H>
            <p className="text-sm text-ink/80">
              <Link href="/admin/r/home" className="text-violet underline">Homepage</Link> lists every block in order (hero, gold strip, The Edit, moods, Shade Finder…). Open one to change its text, images, buttons and background. Change <em>Display order</em> to move it, or switch off <em>Visible</em> to hide it. Use <strong>Duplicate</strong> to add another banner. The announcement bar, logo, colours and contact details are in <Link href="/admin/r/settings" className="text-violet underline">Site settings</Link>.
            </p>
          </section>

          <section className={card}>
            <H id="merch">Moods, routines, bundles & Shade Finder</H>
            <ul className="ml-5 list-disc space-y-1.5 text-sm text-ink/80">
              <li><strong>Moods</strong> — products needed, application steps, finished-look image/video and an optional bundle.</li>
              <li><strong>Routines</strong> — steps in order; customers pick shades and add everything at once.</li>
              <li><strong>Bundles</strong> — choose products and set the bundle price. Savings are calculated automatically. Check margins before discounting.</li>
              <li><strong>Build Your Own Bag</strong> — choose eligible products per step and an optional saving. Switch it on when ready.</li>
              <li><strong>Shade Finder</strong> — one row per skin depth + undertone pointing to a real product shade. The shade name must match exactly. Optional brand matches power step 3.</li>
            </ul>
          </section>

          <section className={card}>
            <H id="orders">Process an order</H>
            <ol className={li}>
              <li>New orders appear in <Link href="/admin/orders" className="text-violet underline">Orders</Link> with status <em>Placed</em>; you also get an email.</li>
              <li>Print the <strong>Invoice & packing slip</strong> and pack the items (each shade and SKU is listed).</li>
              <li>Set status to <strong>Packed</strong>, then <strong>Shipped</strong> with the courier, tracking number and link. The customer is emailed at each step.</li>
              <li>Mark <strong>Delivered</strong> when it arrives — COD orders are then marked paid automatically.</li>
              <li>To cancel, choose <strong>Cancelled</strong>: stock is returned automatically. Refund online payments from your Razorpay dashboard, then set <strong>Refunded</strong>.</li>
            </ol>
            <p className="mt-3 text-xs text-ink/60">Unpaid online orders (customer closed the payment window) are cancelled automatically after 45 minutes and their stock released.</p>
          </section>

          <section className={card}>
            <H id="shipping">Shipping, COD & payments</H>
            <p className="text-sm text-ink/80">
              In <Link href="/admin/r/shipping" className="text-violet underline">Shipping & payments</Link> set the free-shipping threshold, delivery fees and times, express delivery, serviceable PIN codes, COD on/off with fee and order limits, and PIN codes where COD isn’t available. Customers see these rules instantly in the bag and at checkout.
            </p>
          </section>

          <section className={card}>
            <H id="reviews">Reviews & SVATEH Girls</H>
            <p className="text-sm text-ink/80">
              Customer reviews arrive in <Link href="/admin/r/reviews" className="text-violet underline">Reviews</Link> as <em>Pending</em>. Approve genuine ones to publish; you can add a public reply. “Verified purchase” is set automatically when the reviewer’s email matches a delivered order. Never add invented reviews. For <Link href="/admin/r/community" className="text-violet underline">SVATEH Girls</Link>, only publish content you have permission to use — tick the permission box first.
            </p>
          </section>

          <section className={card}>
            <H id="content">Pages, policies & FAQs</H>
            <p className="text-sm text-ink/80">
              <Link href="/admin/r/pages" className="text-violet underline">Pages</Link> holds About, Shipping Policy, Returns, Privacy and Terms. Replace every “[PLACEHOLDER]” with final, legally reviewed text before launch. Add a new page any time — it appears at svateh.com/your-slug. <Link href="/admin/r/faqs" className="text-violet underline">FAQs</Link> are grouped by category on the FAQ page.
            </p>
          </section>

          <section className={card}>
            <H id="marketing">Coupons, subscribers & analytics</H>
            <p className="text-sm text-ink/80">
              Create <Link href="/admin/r/coupons" className="text-violet underline">Coupons</Link> (percentage, flat or free shipping) with minimum order, limits and dates. Export <Link href="/admin/r/subscribers" className="text-violet underline">Subscribers</Link> to CSV for your email tool. Add your Google Analytics 4 or Meta Pixel ID in Site settings — they load only after a visitor accepts cookies.
            </p>
          </section>

          <section className={card}>
            <H id="team">Team access</H>
            <p className="text-sm text-ink/80">
              Owners can add people under <Link href="/admin/users" className="text-violet underline">Admin users</Link>. <strong>Managers</strong> run everything except users; <strong>Editors</strong> manage products and content only. Everyone can change their own password from their name in the menu.
            </p>
          </section>

          <section className={card}>
            <H id="setup">Technical setup status</H>
            <ul className="space-y-1.5 text-sm">
              {status.map((s) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span className={s.ok ? "text-green-700" : "text-red-700"}>{s.ok ? "●" : "○"}</span> {s.label} {s.ok ? "" : <span className="text-xs text-ink/50">— not configured</span>}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink/60">These are set as environment variables in Vercel (Project → Settings → Environment Variables) and need a redeploy to take effect. See the README in the code repository for step-by-step instructions.</p>
          </section>
        </div>
      </div>
    </>
  );
}
