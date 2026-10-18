import { formatDate, formatINR } from "./commerce";
import { labelOf, ORDER_STATUSES } from "./options";

/** Minimal shapes so templates don't depend on Mongoose types. */
export type EmailBrand = { brandName: string; siteUrl: string; contactEmail?: string; colorPlum?: string; colorGold?: string; colorBlush?: string };

export type EmailOrder = {
  number: string;
  accessToken: string;
  email: string;
  createdAt?: Date | string;
  status: string;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: string;
  shippingAddress: { name: string; line1: string; line2?: string; landmark?: string; city: string; state: string; pincode: string; phone: string };
  lines: { title: string; subtitle?: string; qty: number; lineTotal: number; items: { name: string; variantName: string; qty: number }[]; kind: string }[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  codFee: number;
  total: number;
  deliveryEta?: string;
  courier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(b: EmailBrand, title: string, inner: string) {
  const plum = b.colorPlum || "#261732";
  const gold = b.colorGold || "#C8A45D";
  return `<!doctype html><html><body style="margin:0;background:#F7F2EA;font-family:Helvetica,Arial,sans-serif;color:#281E2C">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F2EA;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff">
<tr><td style="background:${plum};padding:28px;text-align:center;color:#fff;font-family:Georgia,serif;font-size:28px;letter-spacing:6px">${esc(b.brandName)}</td></tr>
<tr><td style="padding:32px 32px 8px"><p style="margin:0 0 6px;color:${gold};font-size:11px;letter-spacing:3px;text-transform:uppercase">${esc(title)}</p>${inner}</td></tr>
<tr><td style="padding:24px 32px 32px;font-size:12px;color:#7a6d7d;border-top:1px solid #eee">
Questions? Reply to this email${b.contactEmail ? ` or write to <a href="mailto:${esc(b.contactEmail)}" style="color:${plum}">${esc(b.contactEmail)}</a>` : ""}.<br>
<a href="${esc(b.siteUrl)}" style="color:${plum}">${esc(b.siteUrl.replace(/^https?:\/\//, ""))}</a> · Pamper yourself. The world can wait.
</td></tr></table></td></tr></table></body></html>`;
}

const button = (b: EmailBrand, href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="background:${b.colorBlush || "#E7A8B9"};color:${b.colorPlum || "#261732"};padding:14px 24px;border-radius:40px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold">${esc(label)}</a></p>`;

function orderTable(o: EmailOrder) {
  const rows = o.lines
    .map(
      (l) => `<tr><td style="padding:10px 0;border-bottom:1px solid #f0e9ee">
<strong>${esc(l.title)}</strong>${l.qty > 1 ? ` × ${l.qty}` : ""}<br>
<span style="font-size:12px;color:#7a6d7d">${l.items.map((i) => `${esc(i.name)} — ${esc(i.variantName)}`).join("<br>")}</span></td>
<td align="right" style="padding:10px 0;border-bottom:1px solid #f0e9ee;white-space:nowrap">${formatINR(l.lineTotal)}</td></tr>`,
    )
    .join("");
  const line = (k: string, v: string, bold = false) =>
    `<tr><td style="padding:4px 0;${bold ? "font-weight:bold" : ""}">${k}</td><td align="right" style="padding:4px 0;${bold ? "font-weight:bold" : ""}">${v}</td></tr>`;
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:16px">${rows}
${line("Subtotal", formatINR(o.subtotal))}
${o.discount ? line(`Discount${o.couponCode ? ` (${esc(o.couponCode)})` : ""}`, "−" + formatINR(o.discount)) : ""}
${line("Shipping", o.shippingFee ? formatINR(o.shippingFee) : "Free")}
${o.codFee ? line("COD fee", formatINR(o.codFee)) : ""}
${line(o.paymentMethod === "cod" ? "Payable on delivery" : "Total paid", formatINR(o.total), true)}
</table>`;
}

const addressBlock = (o: EmailOrder) => {
  const a = o.shippingAddress;
  return `<p style="font-size:13px;line-height:1.6;margin:20px 0 0"><strong>Delivering to</strong><br>${esc(a.name)}<br>${esc(a.line1)}${a.line2 ? `, ${esc(a.line2)}` : ""}${a.landmark ? `<br>Landmark: ${esc(a.landmark)}` : ""}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.pincode)}<br>${esc(a.phone)}</p>`;
};

const orderUrl = (b: EmailBrand, o: EmailOrder) => `${b.siteUrl}/order/${o.number}?t=${o.accessToken}`;

export function orderConfirmationEmail(b: EmailBrand, o: EmailOrder) {
  const html = layout(
    b,
    "Order confirmed",
    `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:30px;margin:0 0 12px">Thank you, ${esc(o.shippingAddress.name.split(" ")[0])}.</h1>
<p style="line-height:1.6;margin:0">Your order <strong>${esc(o.number)}</strong> is confirmed${o.paymentMethod === "cod" ? " — please keep " + formatINR(o.total) + " ready for Cash on Delivery" : ""}. ${o.deliveryEta ? `Estimated delivery: ${esc(o.deliveryEta)}.` : ""} We’ll email you tracking details as soon as it ships.</p>
${orderTable(o)}${addressBlock(o)}${button(b, orderUrl(b, o), "Track your order")}`,
  );
  return { subject: `Your ${b.brandName} order ${o.number} is confirmed`, html };
}

export function orderStatusEmail(b: EmailBrand, o: EmailOrder) {
  const status = labelOf(ORDER_STATUSES, o.status);
  const msgs: Record<string, string> = {
    packed: "Your order has been packed and will be handed to our courier shortly.",
    shipped: "Good news — your order is on its way.",
    delivered: "Your order has been delivered. We hope you love it! We’d be grateful for an honest review.",
    cancelled: "Your order has been cancelled. If you paid online, any refund will be processed to your original payment method.",
    refunded: "Your refund has been processed. It can take 5–7 business days to reflect in your account.",
  };
  const tracking = o.trackingNumber
    ? `<p style="line-height:1.6">${o.courier ? `Courier: <strong>${esc(o.courier)}</strong><br>` : ""}Tracking number: <strong>${esc(o.trackingNumber)}</strong></p>${o.trackingUrl ? button(b, o.trackingUrl, "Track shipment") : ""}`
    : "";
  const html = layout(
    b,
    `Order ${status}`,
    `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:28px;margin:0 0 12px">Order ${esc(o.number)}: ${esc(status)}</h1>
<p style="line-height:1.6">${msgs[o.status] ?? `Your order status is now “${esc(status)}”.`}</p>${tracking}${button(b, orderUrl(b, o), "View order")}`,
  );
  return { subject: `${b.brandName} order ${o.number} — ${status}`, html };
}

export function newOrderAdminEmail(b: EmailBrand, o: EmailOrder) {
  const html = layout(
    b,
    "New order",
    `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:26px;margin:0 0 12px">${esc(o.number)} — ${formatINR(o.total)}</h1>
<p>${o.paymentMethod === "cod" ? "Cash on Delivery" : "Paid online"} · ${esc(o.email)}</p>${orderTable(o)}${addressBlock(o)}${button(b, `${b.siteUrl}/admin/orders`, "Open in admin")}`,
  );
  return { subject: `New order ${o.number} (${formatINR(o.total)})`, html };
}

export function contactAckEmail(b: EmailBrand, name: string, message: string, responseTime?: string) {
  const html = layout(
    b,
    "We got your message",
    `<p style="line-height:1.6">Hi ${esc(name)}, thanks for reaching out. Our team will reply ${esc(responseTime || "as soon as possible")}.</p>
<blockquote style="margin:16px 0;padding-left:16px;border-left:2px solid #E7A8B9;color:#7a6d7d;white-space:pre-wrap">${esc(message)}</blockquote>`,
  );
  return { subject: `We received your message — ${b.brandName}`, html };
}

export function contactNotifyEmail(b: EmailBrand, m: { name: string; email: string; phone?: string; orderNumber?: string; message: string }) {
  const html = layout(
    b,
    "New contact message",
    `<p><strong>${esc(m.name)}</strong> &lt;${esc(m.email)}&gt;${m.phone ? ` · ${esc(m.phone)}` : ""}${m.orderNumber ? `<br>Order: ${esc(m.orderNumber)}` : ""}</p>
<p style="white-space:pre-wrap;line-height:1.6">${esc(m.message)}</p>${button(b, `${b.siteUrl}/admin/r/messages`, "Open messages")}`,
  );
  return { subject: `Contact form: ${m.name}`, html };
}

export function passwordResetEmail(b: EmailBrand, link: string, forAdmin = false) {
  const html = layout(
    b,
    "Reset your password",
    `<p style="line-height:1.6">We received a request to reset your ${forAdmin ? "admin " : ""}password. This link is valid for 1 hour. If you didn’t ask for this, you can ignore this email.</p>${button(b, link, "Choose a new password")}`,
  );
  return { subject: `Reset your ${b.brandName} password`, html };
}

export function welcomeEmail(b: EmailBrand) {
  const html = layout(
    b,
    "Welcome to the SVATEH Girls",
    `<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:28px;margin:0 0 12px">You’re in.</h1><p style="line-height:1.6">Thanks for joining. Expect new launches, looks and first access — never spam.</p>${button(b, `${b.siteUrl}/shop`, "Explore the edit")}`,
  );
  return { subject: `Welcome to ${b.brandName}`, html };
}

export { formatDate };
