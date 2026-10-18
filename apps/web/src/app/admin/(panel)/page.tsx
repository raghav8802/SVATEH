import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { formatDate, formatINR, labelOf, ORDER_STATUSES } from "@svateh/core";
import { Page, Product, connectDB, dashboardStats, getSettings } from "@svateh/db";
import { SeedButton } from "@/components/admin/SeedButton";
import { StatusBadge, card } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { razorpayConfigured } from "@/lib/razorpay";
import { s3Configured } from "@/lib/s3";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const admin = await requireAdminPage();
  const { denied } = await searchParams;
  await connectDB();
  const [settings, productCount, placeholderPages] = await Promise.all([getSettings(), Product.countDocuments(), Page.countDocuments({ $or: [{ intro: /PLACEHOLDER/ }, { "sections.body": /PLACEHOLDER/ }] })]);
  const placeholderProducts = await Product.countDocuments({ $or: [{ ingredients: /PLACEHOLDER/ }, { description: /PLACEHOLDER/ }] });
  const manager = admin.role !== "editor";
  const stats = manager ? await dashboardStats() : null;
  const max = Math.max(1, ...(stats?.days.map((d: any) => d.revenue) ?? [1]));

  const checklist = [
    { done: productCount > 0, label: "Add products (or install starter content)", href: "/admin/r/products" },
    { done: s3Configured(), label: "Connect AWS S3 for image uploads (environment variables)", href: "/admin/help#setup" },
    { done: razorpayConfigured(), label: "Connect Razorpay for online payments (environment variables)", href: "/admin/help#setup" },
    { done: !!process.env.RESEND_API_KEY, label: "Connect Resend for order emails (environment variables)", href: "/admin/help#setup" },
    { done: !!settings.contactEmail, label: "Add your support email and contact details", href: "/admin/r/settings" },
    { done: placeholderPages === 0, label: `Replace placeholder text in policies & About page${placeholderPages ? ` (${placeholderPages} left)` : ""}`, href: "/admin/r/pages" },
    { done: placeholderProducts === 0, label: `Replace placeholder product copy & ingredients${placeholderProducts ? ` (${placeholderProducts} left)` : ""}`, href: "/admin/r/products" },
  ];
  const pending = checklist.filter((c) => !c.done);

  return (
    <>
      <div className="mb-8">
        <p className="text-sm text-ink/60">Welcome back{admin.name ? `, ${admin.name.split(" ")[0]}` : ""}.</p>
        <h1 className="font-display text-4xl">Dashboard</h1>
      </div>
      {denied ? <p className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Your role doesn’t have access to that page. Ask the store owner if you need it.</p> : null}

      {pending.length && admin.role !== "editor" ? (
        <section className={`${card} mb-6`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl">Launch checklist</h2>
              <p className="text-xs text-ink/60">
                {checklist.length - pending.length} of {checklist.length} done
              </p>
            </div>
            {productCount === 0 && admin.role === "owner" ? <SeedButton /> : null}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                {c.done ? <CheckCircle2 className="h-4 w-4 text-green-700" /> : <Circle className="h-4 w-4 text-ink/30" />}
                {c.done ? <span className="text-ink/50 line-through">{c.label}</span> : <Link href={c.href} className="hover:text-violet hover:underline">{c.label}</Link>}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Today’s revenue", value: formatINR(stats.today.revenue), sub: `${stats.today.orders} orders` },
              { label: "Last 30 days", value: formatINR(stats.month.revenue), sub: `${stats.month.orders} orders` },
              { label: "To pack & ship", value: String(stats.toFulfil), sub: "Placed or packed", href: "/admin/orders?status=placed" },
              { label: "Needs attention", value: String(stats.pendingReviews + stats.newMessages), sub: `${stats.pendingReviews} reviews · ${stats.newMessages} messages`, href: "/admin/r/reviews?status=pending" },
            ].map((s) => (
              <div key={s.label} className={card}>
                <p className="text-xs text-ink/55">{s.label}</p>
                <p className="mt-2 font-display text-3xl">{s.href ? <Link href={s.href} className="hover:text-violet">{s.value}</Link> : s.value}</p>
                <p className="mt-1 text-xs text-ink/55">{s.sub}</p>
              </div>
            ))}
          </div>

          <section className={`${card} mt-6`}>
            <h2 className="mb-4 font-display text-xl">Revenue · last 30 days</h2>
            <div className="flex h-40 items-end gap-[3px]" role="img" aria-label="Daily revenue for the last 30 days">
              {stats.days.map((d: any) => (
                <div key={d.date} className="group relative flex-1">
                  <div className="w-full rounded-t bg-violet/80 transition group-hover:bg-blush" style={{ height: `${Math.max(2, (d.revenue / max) * 150)}px` }} />
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-ink px-2 py-1 text-[10px] whitespace-nowrap text-white group-hover:block">
                    {d.date.slice(5)} · {formatINR(d.revenue)} · {d.orders}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <section className={card}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl">Recent orders</h2>
                <Link href="/admin/orders" className="text-xs text-violet underline">All orders</Link>
              </div>
              {stats.recent.length ? (
                <ul className="divide-y divide-ink/5 text-sm">
                  {stats.recent.map((o: any) => (
                    <li key={o._id}>
                      <Link href={`/admin/orders/${o._id}`} className="flex items-center gap-3 py-2.5 hover:text-violet">
                        <span className="w-24 font-medium">{o.number}</span>
                        <span className="flex-1 truncate text-ink/60">{o.shippingAddress?.name}</span>
                        <StatusBadge value={o.status} label={labelOf(ORDER_STATUSES, o.status)} />
                        <span className="w-20 text-right">{formatINR(o.total)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink/55">No orders yet.</p>
              )}
            </section>
            <section className={card}>
              <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Low stock
              </h2>
              {stats.lowStock.length ? (
                <ul className="divide-y divide-ink/5 text-sm">
                  {stats.lowStock.map((p: any) => (
                    <li key={p.sku}>
                      <Link href={`/admin/r/products/${p._id}`} className="flex justify-between gap-2 py-2 hover:text-violet">
                        <span className="truncate">
                          {p.name} — {p.shade}
                        </span>
                        <span className={p.stock === 0 ? "text-red-700" : "text-amber-700"}>{p.stock}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink/55">All shades above {stats.lowStockThreshold} units.</p>
              )}
            </section>
          </div>
          {stats.awaitingPayment ? <p className="mt-4 text-xs text-ink/50">{stats.awaitingPayment} online order(s) awaiting payment — unpaid orders are cancelled automatically after 45 minutes and their stock released.</p> : null}
        </>
      ) : (
        <section className={card}>
          <p className="text-sm">You can manage products, collections, homepage and pages from the menu.</p>
        </section>
      )}
      <p className="mt-8 text-xs text-ink/40">Signed in as {admin.email} · {formatDate(new Date(), true)}</p>
    </>
  );
}
