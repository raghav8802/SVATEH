import { checkoutSchema } from "@svateh/core";
import { after } from "next/server";
import { createOrder, getSettings, Order, releaseStaleOrders } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { getCustomerSession } from "@/lib/auth";
import { sendOrderConfirmation } from "@/lib/email";
import { createRazorpayOrder, razorpayConfigured } from "@/lib/razorpay";

export const POST = handler(async (req: Request) => {
  const input = checkoutSchema.parse(await readJson(req));
  if (input.paymentMethod === "razorpay" && !razorpayConfigured()) {
    throw new ApiError("Online payment isn’t set up yet. Please choose Cash on Delivery.", 503);
  }
  // Opportunistically return stock from abandoned online payments (the daily cron is the backstop).
  after(() => releaseStaleOrders(45).catch(() => {}));
  const customer = await getCustomerSession();
  const order: any = await createOrder(input, customer?.id ?? null);
  const done = { number: order.number, token: order.accessToken, total: order.total };

  if (order.paymentMethod === "cod" || order.paymentStatus === "paid") {
    await sendOrderConfirmation(order);
    return json({ order: done });
  }

  // Online payment: create (or reuse) the Razorpay order for this checkout.
  let rzpId: string = order.razorpay?.orderId;
  if (!rzpId) {
    const rzp = await createRazorpayOrder(Math.round(order.total * 100), order.number, { order: order.number });
    rzpId = rzp.id;
    await Order.updateOne({ _id: order._id }, { $set: { "razorpay.orderId": rzpId } });
  }
  const settings = await getSettings();
  return json({
    order: done,
    razorpay: {
      key: process.env.RAZORPAY_KEY_ID,
      orderId: rzpId,
      amount: Math.round(order.total * 100),
      name: settings.brandName || "SVATEH",
      prefill: { name: order.shippingAddress.name, email: order.email, contact: order.phone },
      color: settings.colorPlum || "#261732",
    },
  });
});
