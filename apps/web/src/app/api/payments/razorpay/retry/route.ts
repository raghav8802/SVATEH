import { z } from "zod";
import { getSettings, markOrderPaid, Order } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { sendOrderConfirmation } from "@/lib/email";
import { createRazorpayOrder, fetchRazorpayOrderPayments } from "@/lib/razorpay";

const schema = z.object({ number: z.string(), token: z.string() });

/** Lets a customer retry payment for an order that is still awaiting payment. */
export const POST = handler(async (req: Request) => {
  const b = schema.parse(await readJson(req));
  const order = await Order.findOne({ number: b.number, accessToken: b.token }).lean<any>();
  if (!order) throw new ApiError("Order not found.", 404);
  if (order.paymentMethod !== "razorpay" || order.status !== "pending_payment") throw new ApiError("This order no longer needs payment.", 409);

  // If a previous attempt actually succeeded, confirm it instead of charging twice.
  if (order.razorpay?.orderId) {
    const payments = await fetchRazorpayOrderPayments(order.razorpay.orderId);
    const captured = payments.find((p) => p.status === "captured");
    if (captured) {
      const paid = await markOrderPaid(order.razorpay.orderId, captured.id);
      if (paid) await sendOrderConfirmation(paid);
      return json({ alreadyPaid: true });
    }
  }
  const rzp = await createRazorpayOrder(Math.round(order.total * 100), `${order.number}-r${Date.now().toString(36)}`, { order: order.number });
  await Order.updateOne({ _id: order._id }, { $set: { "razorpay.orderId": rzp.id, paymentStatus: "pending" } });
  const settings = await getSettings();
  return json({
    razorpay: {
      key: process.env.RAZORPAY_KEY_ID,
      orderId: rzp.id,
      amount: rzp.amount,
      name: settings.brandName || "SVATEH",
      prefill: { name: order.shippingAddress.name, email: order.email, contact: order.phone },
      color: settings.colorPlum || "#261732",
    },
  });
});
