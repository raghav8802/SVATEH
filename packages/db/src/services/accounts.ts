import bcrypt from "bcryptjs";
import { connectDB } from "../connect";
import { AdminUser, Customer, Order, Review, Subscriber, ContactMessage, Product } from "../models";
import { isObjectId, plain, randomToken, sha256 } from "./util";

/* ---------------- Admin users ---------------- */

export async function adminCount() {
  await connectDB();
  return AdminUser.countDocuments();
}

export async function verifyAdmin(email: string, password: string) {
  await connectDB();
  const u = await AdminUser.findOne({ email: email.toLowerCase().trim(), active: true }).lean<any>();
  if (!u || !(await bcrypt.compare(password, u.passwordHash ?? ""))) return null;
  await AdminUser.updateOne({ _id: u._id }, { $set: { lastLoginAt: new Date() } });
  return { id: String(u._id), email: u.email as string, name: u.name as string, role: u.role as "owner" | "manager" | "editor" };
}

export async function getAdmin(id: string) {
  await connectDB();
  if (!isObjectId(id)) return null;
  const u = await AdminUser.findOne({ _id: id, active: true }).select("-passwordHash -resetTokenHash").lean<any>();
  return u ? { id: String(u._id), email: u.email as string, name: u.name as string, role: u.role as "owner" | "manager" | "editor" } : null;
}

export async function listAdmins() {
  await connectDB();
  return plain(await AdminUser.find().select("-passwordHash -resetTokenHash").sort({ createdAt: 1 }).lean());
}

export async function createAdmin(data: { name: string; email: string; password: string; role: string }) {
  await connectDB();
  const exists = await AdminUser.findOne({ email: data.email.toLowerCase().trim() });
  if (exists) throw new Error("An admin with this email already exists.");
  const u = await AdminUser.create({ name: data.name, email: data.email, role: data.role, passwordHash: await bcrypt.hash(data.password, 12) });
  return { id: String(u._id), email: u.email, name: u.name, role: u.role };
}

export async function updateAdmin(id: string, data: { name?: string; role?: string; active?: boolean; password?: string }) {
  await connectDB();
  const set: Record<string, any> = {};
  if (data.name !== undefined) set.name = data.name;
  if (data.role !== undefined) set.role = data.role;
  if (data.active !== undefined) set.active = data.active;
  if (data.password) set.passwordHash = await bcrypt.hash(data.password, 12);
  if (data.role !== undefined || data.active === false) {
    // Never allow removing the last active owner.
    const target = await AdminUser.findById(id).lean<any>();
    if (target?.role === "owner" && (data.role !== "owner" || data.active === false)) {
      const owners = await AdminUser.countDocuments({ role: "owner", active: true, _id: { $ne: id } });
      if (owners === 0) throw new Error("There must be at least one active owner.");
    }
  }
  await AdminUser.updateOne({ _id: id }, { $set: set });
}

export async function deleteAdmin(id: string) {
  await connectDB();
  const target = await AdminUser.findById(id).lean<any>();
  if (target?.role === "owner") {
    const owners = await AdminUser.countDocuments({ role: "owner", active: true, _id: { $ne: id } });
    if (owners === 0) throw new Error("There must be at least one active owner.");
  }
  await AdminUser.deleteOne({ _id: id });
}

/* ---------------- Password reset (admins + customers) ---------------- */

export async function createResetToken(kind: "admin" | "customer", email: string) {
  await connectDB();
  const M: any = kind === "admin" ? AdminUser : Customer;
  const u = await M.findOne({ email: email.toLowerCase().trim() }).lean();
  if (!u) return null;
  const token = randomToken(32);
  await M.updateOne({ _id: u._id }, { $set: { resetTokenHash: sha256(token), resetExpires: new Date(Date.now() + 3600_000) } });
  return token;
}

export async function resetPassword(kind: "admin" | "customer", token: string, password: string) {
  await connectDB();
  const M: any = kind === "admin" ? AdminUser : Customer;
  const u = await M.findOne({ resetTokenHash: sha256(token), resetExpires: { $gt: new Date() } }).lean();
  if (!u) return false;
  await M.updateOne({ _id: u._id }, { $set: { passwordHash: await bcrypt.hash(password, 12), resetTokenHash: "", resetExpires: null } });
  return true;
}

/* ---------------- Customers ---------------- */

export async function registerCustomer(data: { name: string; email: string; password: string; marketingOptIn?: boolean }) {
  await connectDB();
  const email = data.email.toLowerCase().trim();
  if (await Customer.findOne({ email })) throw new Error("An account with this email already exists. Try signing in.");
  const c = await Customer.create({ name: data.name, email, passwordHash: await bcrypt.hash(data.password, 12), marketingOptIn: !!data.marketingOptIn });
  // Link previous guest orders placed with the same email.
  await Order.updateMany({ email, customer: null }, { $set: { customer: c._id } });
  if (data.marketingOptIn) await Subscriber.updateOne({ email }, { $setOnInsert: { email, source: "account" } }, { upsert: true });
  return { id: String(c._id), email: c.email!, name: c.name! };
}

export async function verifyCustomer(email: string, password: string) {
  await connectDB();
  const c = await Customer.findOne({ email: email.toLowerCase().trim() }).lean<any>();
  if (!c || !(await bcrypt.compare(password, c.passwordHash ?? ""))) return null;
  await Customer.updateOne({ _id: c._id }, { $set: { lastLoginAt: new Date() } });
  return { id: String(c._id), email: c.email as string, name: c.name as string };
}

export async function getCustomer(id: string) {
  await connectDB();
  if (!isObjectId(id)) return null;
  return plain(await Customer.findById(id).select("-passwordHash -resetTokenHash").lean<any>());
}

export async function updateCustomer(id: string, data: { name?: string; phone?: string; addresses?: any[] }) {
  await connectDB();
  const set: Record<string, any> = {};
  if (data.name !== undefined) set.name = data.name;
  if (data.phone !== undefined) set.phone = data.phone;
  if (data.addresses !== undefined) set.addresses = data.addresses;
  return plain(await Customer.findByIdAndUpdate(id, { $set: set }, { new: true }).select("-passwordHash -resetTokenHash").lean());
}

export async function customerOrders(customerId: string, email: string) {
  await connectDB();
  return plain(
    await Order.find({ $or: [{ customer: customerId }, { email }] })
      .select("number status paymentStatus total createdAt lines.title lines.image accessToken")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
  );
}

export async function listCustomers(q = "", page = 1) {
  await connectDB();
  const filter = q ? { $or: [{ email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }, { name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }] } : {};
  const [items, total] = await Promise.all([
    Customer.find(filter).select("-passwordHash -resetTokenHash").sort({ createdAt: -1 }).skip((page - 1) * 25).limit(25).lean<any[]>(),
    Customer.countDocuments(filter),
  ]);
  const stats = await Order.aggregate([
    { $match: { email: { $in: items.map((i) => i.email) }, paymentStatus: { $in: ["paid", "cod"] } } },
    { $group: { _id: "$email", orders: { $sum: 1 }, spent: { $sum: "$total" } } },
  ]);
  const m = new Map(stats.map((s: any) => [s._id, s]));
  return plain({ items: items.map((i) => ({ ...i, orders: m.get(i.email)?.orders ?? 0, spent: m.get(i.email)?.spent ?? 0 })), total, pages: Math.max(1, Math.ceil(total / 25)) });
}

/* ---------------- Reviews & newsletter from the storefront ---------------- */

export async function submitReview(data: { productId: string; name: string; email: string; rating: number; title: string; body: string; shade?: string; images?: string[] }) {
  await connectDB();
  const product = await Product.findOne({ _id: data.productId, status: "published" }).select("_id").lean();
  if (!product) throw new Error("Product not found.");
  const verified = !!(await Order.exists({
    email: data.email.toLowerCase().trim(),
    status: "delivered",
    "lines.items.productId": data.productId,
  }));
  await Review.create({ product: data.productId, name: data.name, email: data.email.toLowerCase().trim(), rating: data.rating, title: data.title, body: data.body, shade: data.shade ?? "", images: data.images ?? [], verified, status: "pending" });
  return { verified };
}

export async function subscribe(email: string, source = "footer") {
  await connectDB();
  const res = await Subscriber.updateOne({ email: email.toLowerCase().trim() }, { $setOnInsert: { email: email.toLowerCase().trim(), source }, $set: { unsubscribed: false } }, { upsert: true });
  return { created: res.upsertedCount === 1 };
}

export async function saveContactMessage(data: { name: string; email: string; phone?: string; orderNumber?: string; message: string }) {
  await connectDB();
  await ContactMessage.create({ ...data, status: "new" });
}
