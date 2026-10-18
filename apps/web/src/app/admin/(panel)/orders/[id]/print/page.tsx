import { notFound } from "next/navigation";
import { formatDate, formatINR } from "@svateh/core";
import { getOrder, getSettings } from "@svateh/db";
import { requireAdminPage } from "@/lib/auth";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata = { title: "Invoice" };

export default async function PrintOrder({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage(["owner", "manager"]);
  const [o, s]: any = await Promise.all([getOrder((await params).id), getSettings()]);
  if (!o) notFound();
  const a = o.shippingAddress;
  return (
    <div className="mx-auto max-w-3xl bg-white p-10 text-sm text-black print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <section>
        <div className="flex items-start justify-between border-b pb-6">
          <div>
            <p className="font-display text-3xl tracking-[0.16em]">{s.brandName}</p>
            {s.address ? <p className="mt-2 whitespace-pre-line text-xs">{s.address}</p> : null}
            {s.businessDisclosure ? <p className="mt-1 whitespace-pre-line text-xs">{s.businessDisclosure}</p> : null}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Invoice</p>
            <p>{o.number}</p>
            <p>{formatDate(o.createdAt)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 py-6">
          <div>
            <p className="font-semibold">Ship to</p>
            <p>{a.name}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}</p>
          </div>
          <div>
            <p className="font-semibold">Payment</p>
            <p>{o.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)"} · {o.paymentStatus}</p>
            <p>{o.email}</p>
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y text-left">
              <th className="py-2">Item</th>
              <th className="py-2">Qty</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {o.lines.map((l: any, i: number) => (
              <tr key={i} className="border-b align-top">
                <td className="py-2">
                  {l.title}
                  <div className="text-xs text-gray-600">{l.items.map((it: any) => `${it.name} — ${it.variantName} (${it.sku})`).join("; ")}</div>
                </td>
                <td className="py-2">{l.qty}</td>
                <td className="py-2 text-right">{formatINR(l.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-4 w-64 space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(o.subtotal)}</span></div>
          {o.discount ? <div className="flex justify-between"><span>Discount</span><span>−{formatINR(o.discount)}</span></div> : null}
          <div className="flex justify-between"><span>Shipping</span><span>{formatINR(o.shippingFee)}</span></div>
          {o.codFee ? <div className="flex justify-between"><span>COD fee</span><span>{formatINR(o.codFee)}</span></div> : null}
          <div className="flex justify-between border-t pt-1 font-semibold"><span>Total</span><span>{formatINR(o.total)}</span></div>
          <p className="text-[10px] text-gray-500">Prices inclusive of applicable taxes.</p>
        </div>
      </section>

      <section className="mt-16 border-t-2 border-dashed pt-10" style={{ breakBefore: "page" }}>
        <p className="text-lg font-semibold">Packing slip · {o.number}</p>
        <p className="mt-2">{a.name} · {a.city} {a.pincode} · {a.phone}</p>
        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="border-y text-left"><th className="py-2">✓</th><th className="py-2">Product</th><th className="py-2">Shade</th><th className="py-2">SKU</th><th className="py-2">Qty</th></tr>
          </thead>
          <tbody>
            {o.lines.flatMap((l: any) => l.items).map((it: any, i: number) => (
              <tr key={i} className="border-b"><td className="py-2">☐</td><td className="py-2">{it.name}</td><td className="py-2">{it.variantName}</td><td className="py-2">{it.sku}</td><td className="py-2">{it.qty}</td></tr>
            ))}
          </tbody>
        </table>
        {o.notes ? <p className="mt-4">Customer note: {o.notes}</p> : null}
      </section>
    </div>
  );
}
