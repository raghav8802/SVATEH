import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { formatDate, formatINR, labelOf, ORDER_STATUSES } from "@svateh/core";
import { getOrder } from "@svateh/db";
import { OrderActions } from "@/components/admin/OrderActions";
import { StatusBadge, card } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";

export const metadata = { title: "Order" };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage(["owner", "manager"]);
  const o: any = await getOrder((await params).id);
  if (!o) notFound();
  const a = o.shippingAddress;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className="rounded-full p-2 hover:bg-white" aria-label="Back"><ArrowLeft className="h-4 w-4" /></Link>
        <div className="flex-1">
          <h1 className="font-display text-3xl">{o.number}</h1>
          <p className="text-xs text-ink/55">{formatDate(o.createdAt, true)}</p>
        </div>
        <StatusBadge value={o.status} label={labelOf(ORDER_STATUSES, o.status)} />
        <StatusBadge value={o.paymentStatus} label={`${o.paymentMethod === "cod" ? "COD" : "Online"} · ${o.paymentStatus}`} />
        <Link href={`/admin/orders/${o._id}/print`} target="_blank" className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white px-4 py-2 text-xs hover:border-violet">
          <Printer className="h-3.5 w-3.5" /> Invoice & packing slip
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="mb-3 font-display text-xl">Items</h2>
            <ul className="divide-y divide-ink/5 text-sm">
              {o.lines.map((l: any, i: number) => (
                <li key={i} className="py-3">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">
                      {l.title} × {l.qty}
                      {l.kind !== "product" ? <span className="ml-2 rounded bg-cream px-1.5 py-0.5 text-[10px] uppercase">{l.kind === "bundle" ? "Bundle" : "Build your bag"}</span> : null}
                    </span>
                    <span>{formatINR(l.lineTotal)}</span>
                  </div>
                  <ul className="mt-1 space-y-0.5 text-xs text-ink/60">
                    {l.items.map((it: any) => (
                      <li key={it.sku} className="flex items-center gap-2">
                        {it.hex ? <span className="h-3 w-3 rounded-full border border-ink/10" style={{ background: it.hex }} /> : null}
                        {it.name} — {it.variantName} · SKU {it.sku} · qty {it.qty}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
              {o.discount ? <div className="flex justify-between"><dt>Discount ({o.couponCode})</dt><dd>−{formatINR(o.discount)}</dd></div> : null}
              <div className="flex justify-between"><dt>Shipping ({o.deliveryOption})</dt><dd>{formatINR(o.shippingFee)}</dd></div>
              {o.codFee ? <div className="flex justify-between"><dt>COD fee</dt><dd>{formatINR(o.codFee)}</dd></div> : null}
              <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
            </dl>
          </section>
          <section className={card}>
            <h2 className="mb-3 font-display text-xl">History</h2>
            <ol className="space-y-3 text-sm">
              {[...o.history].reverse().map((h: any, i: number) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet" />
                  <div>
                    <p>
                      <strong>{labelOf(ORDER_STATUSES, h.status)}</strong> {h.note ? `— ${h.note}` : ""}
                    </p>
                    <p className="text-xs text-ink/50">
                      {formatDate(h.at, true)} · {h.by}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <div className="space-y-6">
          <section className={card}>
            <h2 className="mb-4 font-display text-xl">Fulfilment</h2>
            <OrderActions order={o} />
          </section>
          <section className={`${card} text-sm`}>
            <h2 className="mb-3 font-display text-xl">Customer</h2>
            <p>{a.name}</p>
            <p><a href={`mailto:${o.email}`} className="text-violet underline">{o.email}</a></p>
            <p><a href={`tel:${a.phone}`} className="underline">{a.phone}</a></p>
            <p className="mt-3 leading-relaxed text-ink/75">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              {a.landmark ? <><br />Landmark: {a.landmark}</> : null}
              <br />
              {a.city}, {a.state} {a.pincode}
            </p>
            {o.notes ? <p className="mt-3 rounded-lg bg-cream p-3 text-xs">Customer note: {o.notes}</p> : null}
            {o.razorpay?.paymentId ? <p className="mt-3 text-xs text-ink/55">Razorpay payment: {o.razorpay.paymentId}</p> : null}
          </section>
        </div>
      </div>
    </>
  );
}
