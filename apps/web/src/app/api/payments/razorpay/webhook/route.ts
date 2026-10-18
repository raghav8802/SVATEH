import { markOrderPaid, markPaymentFailed } from "@svateh/db";
import { json } from "@/lib/api";
import { sendOrderConfirmation } from "@/lib/email";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * Razorpay → Settings → Webhooks: point to https://<domain>/api/payments/razorpay/webhook
 * with events payment.captured, order.paid and payment.failed. This confirms orders
 * even if the customer closes the browser right after paying.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, sig)) return json({ error: "Invalid signature" }, 400);
  try {
    const evt = JSON.parse(raw);
    const payment = evt?.payload?.payment?.entity;
    if ((evt.event === "payment.captured" || evt.event === "order.paid") && payment?.order_id) {
      const paid = await markOrderPaid(payment.order_id, payment.id);
      if (paid) await sendOrderConfirmation(paid);
    } else if (evt.event === "payment.failed" && payment?.order_id) {
      await markPaymentFailed(payment.order_id, payment.error_description ?? "Payment failed");
    }
  } catch (e) {
    console.error("Webhook error", e);
    return json({ error: "Webhook processing failed" }, 500);
  }
  return json({ ok: true });
}
