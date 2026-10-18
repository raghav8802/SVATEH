import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { formatDate, formatINR, labelOf, ORDER_STATUSES } from "@svateh/core";
import { findOrderForCustomer, getSettings } from "@svateh/db";
import { PayRetry } from "@/components/store/OrderClient";
import { ProductVisual } from "@/components/store/ProductVisual";
import { getCustomerSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

const STEPS = ["placed", "packed", "shipped", "delivered"];

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ number }, { t }, customer, s] = await Promise.all([params, searchParams, getCustomerSession(), getSettings()]);
  const o: any = await findOrderForCustomer(number, { token: t, customerId: customer?.id });
  if (!o) notFound();
  const awaiting = o.status === "pending_payment";
  const ended = ["cancelled", "refunded"].includes(o.status);
  const stepIndex = STEPS.indexOf(o.status);
  const a = o.shippingAddress;

  return (
    <section className="container-x py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          {awaiting ? <Clock className="mx-auto h-12 w-12 text-gold" /> : <CheckCircle2 className="mx-auto h-12 w-12 text-violet" />}
          <p className="eyebrow mt-6 !text-violet">Order {o.number}</p>
          <h1 className="display mt-3 text-[clamp(40px,6vw,76px)]">
            {awaiting ? "Almost there." : ended ? `Order ${labelOf(ORDER_STATUSES, o.status).toLowerCase()}` : `Thank you, ${a.name.split(" ")[0]}.`}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-ink/70">
            {awaiting
              ? "We’re waiting for your payment to be confirmed. If you completed payment, this page will update shortly."
              : ended
                ? "If you have any questions about this order, please contact us."
                : `Your order is confirmed. A confirmation has been sent to ${o.email}.`}
          </p>
          {awaiting && o.paymentMethod === "razorpay" && t ? <PayRetry number={o.number} token={t} /> : null}
        </div>

        {!awaiting && !ended ? (
          <ol className="mt-12 grid grid-cols-4 gap-2" aria-label="Order progress">
            {STEPS.map((st, i) => (
              <li key={st} className="text-center">
                <span className={`mx-auto block h-1.5 rounded-full ${i <= stepIndex ? "bg-violet" : "bg-ink/15"}`} />
                <span className={`mt-2 block text-[10px] tracking-[0.16em] uppercase ${i <= stepIndex ? "text-violet" : "text-ink/45"}`}>{labelOf(ORDER_STATUSES, st)}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {o.trackingNumber ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-violet p-6 text-white">
            <div>
              <p className="eyebrow">Tracking</p>
              <p className="mt-1 text-sm">
                {o.courier ? `${o.courier} · ` : ""}
                {o.trackingNumber}
              </p>
            </div>
            {o.trackingUrl ? (
              <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn-blush">
                Track shipment
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="bg-white p-6">
            <h2 className="font-display text-2xl">Items</h2>
            <ul className="mt-4 divide-y divide-ink/10">
              {o.lines.map((l: any, i: number) => (
                <li key={i} className="flex gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden">
                    <ProductVisual name={l.title} image={l.image} hex={l.items[0]?.hex} sizes="64px" className="absolute inset-0" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">
                      {l.title} {l.qty > 1 ? `× ${l.qty}` : ""}
                    </p>
                    <ul className="text-xs text-ink/60">
                      {l.items.map((it: any) => (
                        <li key={it.sku}>
                          {l.kind === "product" ? "" : `${it.name} — `}
                          {it.variantName}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span className="text-sm">{formatINR(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
              {o.discount ? <div className="flex justify-between text-violet"><dt>Discount {o.couponCode ? `(${o.couponCode})` : ""}</dt><dd>−{formatINR(o.discount)}</dd></div> : null}
              <div className="flex justify-between"><dt>Shipping</dt><dd>{o.shippingFee ? formatINR(o.shippingFee) : "Free"}</dd></div>
              {o.codFee ? <div className="flex justify-between"><dt>COD fee</dt><dd>{formatINR(o.codFee)}</dd></div> : null}
              <div className="flex justify-between pt-2 text-base font-medium">
                <dt>{o.paymentMethod === "cod" && o.paymentStatus !== "paid" ? "Payable on delivery" : "Total paid"}</dt>
                <dd>{formatINR(o.total)}</dd>
              </div>
            </dl>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 text-sm">
              <h2 className="font-display text-2xl">Delivery</h2>
              <p className="mt-3 leading-relaxed">
                {a.name}
                <br />
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                {a.landmark ? <><br />Landmark: {a.landmark}</> : null}
                <br />
                {a.city}, {a.state} {a.pincode}
                <br />
                {a.phone}
              </p>
              {o.deliveryEta ? <p className="mt-3 text-ink/70">Estimated delivery: {o.deliveryEta}</p> : null}
            </div>
            <div className="bg-white p-6 text-sm">
              <h2 className="font-display text-2xl">Details</h2>
              <p className="mt-3">Placed {formatDate(o.createdAt, true)}</p>
              <p>Payment: {o.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)"}</p>
              <p>Status: {labelOf(ORDER_STATUSES, o.status)}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-plum">Continue shopping</Link>
          <Link href={`/contact?order=${o.number}`} className="btn-outline !border-ink/30">Need help?</Link>
        </div>
        <p className="mt-6 text-center text-xs text-ink/55">
          Bookmark this page or use <Link href="/track" className="underline">Track order</Link> any time.
          {s.contactEmail ? <> Questions? <a href={`mailto:${s.contactEmail}`} className="underline">{s.contactEmail}</a></> : null}
        </p>
      </div>
    </section>
  );
}
