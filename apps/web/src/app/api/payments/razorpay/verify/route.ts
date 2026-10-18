import { z } from "zod";
import { markOrderPaid, Order } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { sendOrderConfirmation } from "@/lib/email";
import { verifyPaymentSignature } from "@/lib/razorpay";

const schema = z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() });

export const POST = handler(async (req: Request) => {
  const b = schema.parse(await readJson(req));
  if (!verifyPaymentSignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature)) {
    throw new ApiError("We couldn’t verify this payment. If money was deducted, it will be confirmed automatically or refunded.", 400);
  }
  const paid = await markOrderPaid(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature);
  if (paid) await sendOrderConfirmation(paid);
  const order = await Order.findOne({ "razorpay.orderId": b.razorpay_order_id }).select("number accessToken").lean<any>();
  if (!order) throw new ApiError("Order not found.", 404);
  return json({ number: order.number, token: order.accessToken });
});
