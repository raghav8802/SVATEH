import Link from "next/link";
import { Download, Search } from "lucide-react";
import { formatDate, formatINR, labelOf, ORDER_STATUSES } from "@svateh/core";
import { listOrders } from "@svateh/db";
import { PageHeader, Pager, StatusBadge } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";

export const metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdminPage(["owner", "manager"]);
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { items, total, pages } = await listOrders({ q: sp.q, status: sp.status, payment: sp.payment, from: sp.from, to: sp.to, page });
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/orders${p.toString() ? `?${p}` : ""}`;
  };
  const exportQs = new URLSearchParams(Object.entries({ q: sp.q, status: sp.status, from: sp.from, to: sp.to }).filter(([, v]) => v) as [string, string][]);
  return (
    <>
      <PageHeader
        title="Orders"
        description="Update status as you pack and ship — customers are emailed automatically."
        actions={
          <a href={`/api/admin/export/orders?${exportQs}`} className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white px-4 py-2 text-xs hover:border-violet">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </a>
        }
      />
      <div className="mb-3 flex flex-wrap gap-1">
        <Link href={qs({ status: undefined, page: undefined })} className={`rounded-full px-3 py-1.5 text-xs ${!sp.status ? "bg-plum text-white" : "bg-white hover:bg-cream"}`}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s.value} href={qs({ status: s.value, page: undefined })} className={`rounded-full px-3 py-1.5 text-xs ${sp.status === s.value ? "bg-plum text-white" : "bg-white hover:bg-cream"}`}>
            {s.label}
          </Link>
        ))}
      </div>
      <form className="mb-4 flex flex-wrap items-center gap-2" action="/admin/orders">
        {sp.status ? <input type="hidden" name="status" value={sp.status} /> : null}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input name="q" defaultValue={sp.q} placeholder="Order #, name, email, phone" className="field !w-64 !rounded-full !py-2 pl-9" />
        </div>
        <select name="payment" defaultValue={sp.payment ?? ""} className="field !w-auto !rounded-full !py-2">
          <option value="">All payments</option>
          <option value="razorpay">Online</option>
          <option value="cod">COD</option>
        </select>
        <input type="date" name="from" defaultValue={sp.from} className="field !w-auto !rounded-full !py-2" aria-label="From date" />
        <input type="date" name="to" defaultValue={sp.to} className="field !w-auto !rounded-full !py-2" aria-label="To date" />
        <button className="rounded-full bg-plum px-4 py-2 text-xs text-white">Filter</button>
        <span className="ml-auto text-xs text-ink/50">{total} orders</span>
      </form>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-[11px] tracking-wide text-ink/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {items.map((o: any) => (
              <tr key={o._id} className="hover:bg-cream/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o._id}`} className="font-medium hover:text-violet">{o.number}</Link>
                </td>
                <td className="px-4 py-3 text-ink/60">{formatDate(o.createdAt, true)}</td>
                <td className="px-4 py-3">
                  {o.shippingAddress?.name}
                  <span className="block text-xs text-ink/50">{o.shippingAddress?.city}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={o.paymentStatus} label={o.paymentMethod === "cod" ? (o.paymentStatus === "paid" ? "COD · paid" : "COD") : o.paymentStatus} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={o.status} label={labelOf(ORDER_STATUSES, o.status)} />
                </td>
                <td className="px-4 py-3 text-right">{formatINR(o.total)}</td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink/55">No orders found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Pager page={page} pages={pages} href={(p) => qs({ page: String(p) })} />
    </>
  );
}
