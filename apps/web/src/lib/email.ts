import "server-only";
import { getSettings, Order } from "@svateh/db";
import { newOrderAdminEmail, orderConfirmationEmail, orderStatusEmail, type EmailBrand, type EmailOrder } from "@svateh/core/emails";
import { siteUrl } from "./site";

export async function sendEmail(msg: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "SVATEH <orders@svateh.com>";
  if (!key) {
    console.info(`[email:dev] To: ${msg.to} — ${msg.subject} (set RESEND_API_KEY to send real emails)`);
    return { ok: true, dev: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: msg.to, subject: msg.subject, html: msg.html, reply_to: msg.replyTo }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
    return { ok: res.ok };
  } catch (e) {
    console.error("Email send failed", e);
    return { ok: false };
  }
}

export async function emailBrand(): Promise<EmailBrand & { notify?: string; responseTime?: string }> {
  const s = await getSettings();
  return {
    brandName: s.brandName || "SVATEH",
    siteUrl: siteUrl(),
    contactEmail: s.contactEmail,
    colorPlum: s.colorPlum,
    colorGold: s.colorGold,
    colorBlush: s.colorBlush,
    notify: process.env.STORE_NOTIFY_EMAIL || s.contactEmail || undefined,
    responseTime: s.responseTime,
  };
}

/** Sends the confirmation once per order (guarded by a DB flag) plus a store notification. */
export async function sendOrderConfirmation(order: EmailOrder & { _id: string }) {
  const claimed = await Order.updateOne({ _id: order._id, confirmationSent: false }, { $set: { confirmationSent: true } });
  if (claimed.modifiedCount !== 1) return;
  const b = await emailBrand();
  const mail = orderConfirmationEmail(b, order);
  await sendEmail({ to: order.email, subject: mail.subject, html: mail.html, replyTo: b.contactEmail || undefined });
  if (b.notify) {
    const n = newOrderAdminEmail(b, order);
    await sendEmail({ to: b.notify, subject: n.subject, html: n.html });
  }
}

export async function sendOrderStatus(order: EmailOrder) {
  if (!["packed", "shipped", "delivered", "cancelled", "refunded"].includes(order.status)) return;
  const b = await emailBrand();
  const mail = orderStatusEmail(b, order);
  await sendEmail({ to: order.email, subject: mail.subject, html: mail.html, replyTo: b.contactEmail || undefined });
}
