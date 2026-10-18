import { connectDB } from "../connect";
import { ContactMessage, Order, Product, Review } from "../models";
import { getShipping } from "./singletons";
import { escapeRegex, isObjectId, plain } from "./util";

const COUNTED = { paymentStatus: { $in: ["paid", "cod"] }, status: { $nin: ["cancelled", "refunded", "pending_payment"] } };

function istStartOfDay(daysAgo = 0) {
  // India Standard Time is UTC+5:30 with no DST.
  const now = new Date(Date.now() + 330 * 60_000);
  now.setUTCHours(0, 0, 0, 0);
  return new Date(now.getTime() - 330 * 60_000 - daysAgo * 86400_000);
}

export async function dashboardStats() {
  await connectDB();
  const shipping = await getShipping();
  const low = shipping.lowStockThreshold ?? 5;
  const today = istStartOfDay(0);
  const since30 = istStartOfDay(29);
  const [todayAgg, monthAgg, daily, toFulfil, pendingReviews, newMessages, lowStock, recent, awaitingPayment] = await Promise.all([
    Order.aggregate([{ $match: { ...COUNTED, createdAt: { $gte: today } } }, { $group: { _id: null, n: { $sum: 1 }, revenue: { $sum: "$total" } } }]),
    Order.aggregate([{ $match: { ...COUNTED, createdAt: { $gte: since30 } } }, { $group: { _id: null, n: { $sum: 1 }, revenue: { $sum: "$total" } } }]),
    Order.aggregate([
      { $match: { ...COUNTED, createdAt: { $gte: since30 } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } }, revenue: { $sum: "$total" }, n: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.countDocuments({ status: { $in: ["placed", "packed"] } }),
    Review.countDocuments({ status: "pending" }),
    ContactMessage.countDocuments({ status: "new" }),
    Product.aggregate([
      { $unwind: "$variants" },
      { $match: { "variants.active": { $ne: false }, "variants.stock": { $lte: low } } },
      { $project: { name: 1, status: 1, shade: "$variants.name", sku: "$variants.sku", stock: "$variants.stock" } },
      { $sort: { stock: 1 } },
      { $limit: 20 },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(8).select("number email total status paymentMethod paymentStatus createdAt shippingAddress.name").lean(),
    Order.countDocuments({ status: "pending_payment" }),
  ]);
  const days: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(istStartOfDay(i).getTime() + 330 * 60_000).toISOString().slice(0, 10);
    const row = daily.find((r: any) => r._id === d);
    days.push({ date: d, revenue: row?.revenue ?? 0, orders: row?.n ?? 0 });
  }
  return plain({
    today: { orders: todayAgg[0]?.n ?? 0, revenue: todayAgg[0]?.revenue ?? 0 },
    month: { orders: monthAgg[0]?.n ?? 0, revenue: monthAgg[0]?.revenue ?? 0 },
    days,
    toFulfil,
    awaitingPayment,
    pendingReviews,
    newMessages,
    lowStock,
    lowStockThreshold: low,
    recent,
  });
}

export async function listOrders(opts: { q?: string; status?: string; payment?: string; page?: number; from?: string; to?: string; all?: boolean }) {
  await connectDB();
  const filter: Record<string, any> = {};
  if (opts.status) filter.status = opts.status;
  if (opts.payment) filter.paymentMethod = opts.payment;
  if (opts.q) {
    const rx = new RegExp(escapeRegex(opts.q.trim()), "i");
    filter.$or = [{ number: rx }, { email: rx }, { phone: rx }, { "shippingAddress.name": rx }, { trackingNumber: rx }];
  }
  if (opts.from || opts.to) {
    filter.createdAt = {};
    if (opts.from) filter.createdAt.$gte = new Date(opts.from);
    if (opts.to) filter.createdAt.$lte = new Date(new Date(opts.to).getTime() + 86400_000);
  }
  const page = Math.max(1, opts.page ?? 1);
  let q = Order.find(filter).sort({ createdAt: -1 });
  if (!opts.all) q = q.skip((page - 1) * 25).limit(25);
  const [items, total] = await Promise.all([q.lean(), Order.countDocuments(filter)]);
  return plain({ items, total, page, pages: Math.max(1, Math.ceil(total / 25)) });
}

export async function getOrder(id: string) {
  await connectDB();
  if (!isObjectId(id)) return null;
  return plain(await Order.findById(id).lean<any>());
}
