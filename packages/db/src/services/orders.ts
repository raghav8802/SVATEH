import type { CheckoutInput } from "@svateh/core";
import { connectDB } from "../connect";
import { Coupon, Counter, Order, Product, Subscriber } from "../models";
import { priceCart } from "./cart";
import { plain, randomToken } from "./util";

export class CheckoutError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

async function nextOrderNumber() {
  const c = await Counter.findOneAndUpdate({ _id: "order" }, { $inc: { seq: 1 } }, { upsert: true, new: true }).lean<any>();
  return `SVH${100000 + c.seq}`;
}

type StockLine = { productId: string; sku: string; qty: number };

function aggregateStock(lines: { items: { productId: string; sku: string; qty: number }[] }[]): StockLine[] {
  const map = new Map<string, StockLine>();
  for (const l of lines)
    for (const i of l.items) {
      const k = `${i.productId}:${i.sku}`;
      const cur = map.get(k);
      if (cur) cur.qty += i.qty;
      else map.set(k, { productId: String(i.productId), sku: i.sku, qty: i.qty });
    }
  return [...map.values()];
}

/** Atomically decrements stock for every shade; rolls back if any shade is short. */
async function reserveStock(items: StockLine[]) {
  const done: StockLine[] = [];
  for (const it of items) {
    const res = await Product.updateOne(
      { _id: it.productId, variants: { $elemMatch: { sku: it.sku, stock: { $gte: it.qty } } } },
      { $inc: { "variants.$.stock": -it.qty } },
    );
    if (res.modifiedCount !== 1) {
      await restoreStock(done);
      return false;
    }
    done.push(it);
  }
  return true;
}

async function restoreStock(items: StockLine[]) {
  for (const it of items) {
    await Product.updateOne({ _id: it.productId, "variants.sku": it.sku }, { $inc: { "variants.$.stock": it.qty } });
  }
}

export async function createOrder(input: CheckoutInput, customerId?: string | null) {
  await connectDB();
  const existing = await Order.findOne({ idempotencyKey: input.idempotencyKey }).lean<any>();
  if (existing) return plain(existing);

  // The delivery address is the source of truth for serviceability and COD rules.
  const quote = await priceCart({ ...input, pincode: input.address.pincode });
  const lineErrors = quote.lines.filter((l) => l.error).map((l) => l.error!);
  if (!quote.lines.length) throw new CheckoutError("Your bag is empty.");
  if (lineErrors.length) throw new CheckoutError(lineErrors[0]!, 409);
  if (input.couponCode && !quote.coupon?.valid) throw new CheckoutError(quote.coupon?.message ?? "This code isn’t valid.");
  if (!quote.pincode?.serviceable) throw new CheckoutError(quote.pincode?.message ?? "We don’t deliver to this PIN code yet.");
  if (input.paymentMethod === "cod" && !quote.payment.cod) throw new CheckoutError(quote.payment.codReason ?? "Cash on Delivery isn’t available for this order.");
  if (input.paymentMethod === "razorpay" && !quote.payment.razorpay) throw new CheckoutError("Online payment is currently unavailable. Please choose another method.");

  const stock = aggregateStock(quote.lines);
  if (!(await reserveStock(stock))) throw new CheckoutError("Sorry — one of your shades just sold out. Please review your bag.", 409);

  const isCod = input.paymentMethod === "cod";
  const option = quote.deliveryOptions.find((o) => o.id === quote.deliveryOption);
  let order: any;
  try {
    order = await Order.create({
      number: await nextOrderNumber(),
      idempotencyKey: input.idempotencyKey,
      accessToken: randomToken(18),
      customer: customerId || null,
      email: input.email,
      phone: input.address.phone,
      shippingAddress: input.address,
      lines: quote.lines,
      subtotal: quote.subtotal,
      discount: quote.discount,
      couponCode: quote.coupon?.valid ? quote.coupon.code : "",
      shippingFee: quote.shippingFee,
      codFee: quote.codFee,
      total: quote.total,
      deliveryOption: quote.deliveryOption,
      deliveryEta: option?.eta ?? "",
      paymentMethod: input.paymentMethod,
      paymentStatus: isCod ? "cod" : "pending",
      status: isCod ? "placed" : "pending_payment",
      notes: input.notes,
      marketingOptIn: input.marketingOptIn,
      stockReserved: true,
      history: [{ status: isCod ? "placed" : "pending_payment", note: isCod ? "Cash on Delivery order placed" : "Awaiting online payment", by: "customer" }],
    });
  } catch (e: any) {
    // The order was not saved, so the stock we reserved goes back on sale.
    await restoreStock(stock);
    if (e?.code === 11000 && String(e?.message).includes("idempotencyKey")) {
      const o = await Order.findOne({ idempotencyKey: input.idempotencyKey }).lean();
      if (o) return plain(o);
    }
    throw e;
  }

  // Bookkeeping after the order exists must never fail the checkout or touch its stock.
  try {
    if (isCod) await countCoupon(order);
    if (input.marketingOptIn) await Subscriber.updateOne({ email: input.email }, { $setOnInsert: { email: input.email, source: "checkout" } }, { upsert: true });
  } catch (e) {
    console.error("Post-order bookkeeping failed", order.number, e);
  }
  return plain(order.toObject());
}

async function countCoupon(order: any) {
  if (!order.couponCode || order.couponCounted) return;
  // Pipeline update tolerates a missing/null counter on older coupons.
  await Coupon.updateOne({ code: order.couponCode }, [{ $set: { usedCount: { $add: [{ $ifNull: ["$usedCount", 0] }, 1] } } }], { updatePipeline: true } as any);
  await Order.updateOne({ _id: order._id }, { $set: { couponCounted: true } });
}

/** Marks an online order as paid exactly once. Returns the order only if this call made the transition. */
export async function markOrderPaid(razorpayOrderId: string, paymentId: string, signature = "") {
  await connectDB();
  const order = await Order.findOneAndUpdate(
    { "razorpay.orderId": razorpayOrderId, paymentStatus: { $in: ["pending", "failed"] } },
    {
      $set: { paymentStatus: "paid", status: "placed", "razorpay.paymentId": paymentId, "razorpay.signature": signature },
      $push: { history: { status: "placed", note: `Payment received (${paymentId})`, by: "razorpay", at: new Date() } },
    },
    { new: true },
  ).lean<any>();
  if (!order) return null;
  // A stale-order cleanup may have released stock before the payment landed; reserve it again.
  if (!order.stockReserved) {
    const ok = await reserveStock(aggregateStock(order.lines));
    await Order.updateOne(
      { _id: order._id },
      ok ? { $set: { stockReserved: true } } : { $push: { history: { status: "placed", note: "⚠ Paid after stock was released — check stock before packing", by: "system", at: new Date() } } },
    );
  }
  await countCoupon(order).catch((e) => console.error("Coupon count failed", order.number, e));
  return plain(order);
}

export async function markPaymentFailed(razorpayOrderId: string, reason: string) {
  await connectDB();
  await Order.updateOne(
    { "razorpay.orderId": razorpayOrderId, paymentStatus: "pending" },
    { $set: { paymentStatus: "failed" }, $push: { history: { status: "pending_payment", note: `Payment failed: ${reason}`, by: "razorpay", at: new Date() } } },
  );
}

export async function releaseOrderStock(orderId: string) {
  const order = await Order.findOneAndUpdate({ _id: orderId, stockReserved: true }, { $set: { stockReserved: false } }, { new: false }).lean<any>();
  if (order) await restoreStock(aggregateStock(order.lines));
}

/** Cancels online orders that were never paid so their stock goes back on sale. */
export async function releaseStaleOrders(olderThanMinutes = 45) {
  await connectDB();
  const cutoff = new Date(Date.now() - olderThanMinutes * 60_000);
  const stale = await Order.find({ status: "pending_payment", paymentStatus: { $ne: "paid" }, createdAt: { $lt: cutoff } }).select("_id").lean();
  for (const o of stale) {
    await releaseOrderStock(String(o._id));
    await Order.updateOne(
      { _id: o._id, status: "pending_payment" },
      { $set: { status: "cancelled" }, $push: { history: { status: "cancelled", note: "Payment not completed — automatically cancelled", by: "system", at: new Date() } } },
    );
  }
  return stale.length;
}

export async function updateOrderStatus(
  orderId: string,
  patch: { status?: string; courier?: string; trackingNumber?: string; trackingUrl?: string; internalNote?: string; note?: string; paymentStatus?: string },
  by: string,
) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) return null;
  const prevStatus = order.status;
  for (const k of ["courier", "trackingNumber", "trackingUrl", "internalNote"] as const) if (patch[k] !== undefined) (order as any)[k] = patch[k];
  if (patch.paymentStatus) order.paymentStatus = patch.paymentStatus as any;
  if (patch.status && patch.status !== prevStatus) {
    order.status = patch.status as any;
    if (patch.status === "refunded") order.paymentStatus = "refunded";
    if (patch.status === "delivered" && order.paymentMethod === "cod") order.paymentStatus = "paid";
    order.history.push({ status: patch.status, note: patch.note ?? "", by, at: new Date() } as any);
  } else if (patch.note) {
    order.history.push({ status: order.status, note: patch.note, by, at: new Date() } as any);
  }
  await order.save();
  if ((patch.status === "cancelled" || patch.status === "refunded") && prevStatus !== "shipped" && prevStatus !== "delivered") {
    await releaseOrderStock(orderId);
  }
  return { order: plain(order.toObject()), statusChanged: !!patch.status && patch.status !== prevStatus };
}

export async function findOrderForCustomer(number: string, opts: { token?: string; email?: string; customerId?: string }) {
  await connectDB();
  const o = await Order.findOne({ number: number.toUpperCase().trim() }).lean<any>();
  if (!o) return null;
  const ok =
    (opts.token && o.accessToken === opts.token) ||
    (opts.email && o.email === opts.email.toLowerCase().trim()) ||
    (opts.customerId && String(o.customer) === opts.customerId);
  if (!ok) return null;
  const { idempotencyKey, internalNote, razorpay, ...rest } = o;
  return plain({ ...rest, history: (o.history ?? []).map((h: any) => ({ status: h.status, at: h.at, note: h.by === "customer" || h.by === "razorpay" || h.by === "system" ? h.note : "" })) });
}
