import { formatDate, labelOf, ORDER_STATUSES } from "@svateh/core";
import { listCustomers, listOrders, listResource } from "@svateh/db";
import { ApiError, handler } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";

const cell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // prevent spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows: unknown[][]) => "﻿" + rows.map((r) => r.map(cell).join(",")).join("\n");

export const GET = handler(async (req: Request, ctx: { params: Promise<{ kind: string }> }) => {
  await requireAdminApi(["owner", "manager"]);
  const { kind } = await ctx.params;
  const sp = new URL(req.url).searchParams;
  let rows: unknown[][];
  if (kind === "orders") {
    const { items } = await listOrders({ q: sp.get("q") ?? "", status: sp.get("status") ?? "", from: sp.get("from") ?? "", to: sp.get("to") ?? "", all: true });
    rows = [
      ["Order", "Date", "Status", "Payment", "Payment status", "Customer", "Email", "Phone", "City", "State", "PIN", "Items", "Subtotal", "Discount", "Coupon", "Shipping", "COD fee", "Total", "Courier", "Tracking"],
      ...items.map((o: any) => [
        o.number, formatDate(o.createdAt, true), labelOf(ORDER_STATUSES, o.status), o.paymentMethod, o.paymentStatus, o.shippingAddress?.name, o.email, o.phone,
        o.shippingAddress?.city, o.shippingAddress?.state, o.shippingAddress?.pincode,
        o.lines.map((l: any) => `${l.title}${l.subtitle ? ` (${l.subtitle})` : ""} x${l.qty}`).join("; "),
        o.subtotal, o.discount, o.couponCode, o.shippingFee, o.codFee, o.total, o.courier, o.trackingNumber,
      ]),
    ];
  } else if (kind === "subscribers") {
    const { items } = await listResource("subscribers", { all: true });
    rows = [["Email", "Source", "Unsubscribed", "Joined"], ...items.map((s: any) => [s.email, s.source, s.unsubscribed ? "yes" : "", formatDate(s.createdAt)])];
  } else if (kind === "messages") {
    const { items } = await listResource("messages", { all: true });
    rows = [["Received", "Name", "Email", "Phone", "Order", "Status", "Message"], ...items.map((m: any) => [formatDate(m.createdAt, true), m.name, m.email, m.phone, m.orderNumber, m.status, m.message])];
  } else if (kind === "customers") {
    const all: any[] = [];
    for (let p = 1; ; p++) {
      const res = await listCustomers("", p);
      all.push(...res.items);
      if (p >= res.pages) break;
    }
    rows = [["Name", "Email", "Phone", "Orders", "Spent", "Joined"], ...all.map((c) => [c.name, c.email, c.phone, c.orders, c.spent, formatDate(c.createdAt)])];
  } else throw new ApiError("Unknown export", 404);
  return new Response(toCsv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="svateh-${kind}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
});
