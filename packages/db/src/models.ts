import mongoose, { Schema as MongooseSchema, type Model } from "mongoose";

// Mongoose's deep schema type inference is very expensive for large dynamic schemas;
// these models are validated by Zod instead, so they are typed loosely here.
const Schema: any = MongooseSchema;
type Schema = any;
const mg: any = mongoose;
import { RESOURCES, RESOURCE_MAP, type Field, type Resource } from "@svateh/core";

/* ---------------- Resource models generated from field definitions ---------------- */

function fieldDef(f: Field): any {
  switch (f.type) {
    case "number":
      return { type: Number, default: f.default ?? null };
    case "boolean":
      return { type: Boolean, default: f.default ?? false };
    case "date":
      return { type: Date, default: null };
    case "images":
    case "multiselect":
    case "list":
      return { type: [String], default: [] };
    case "ref": {
      const target = RESOURCE_MAP[f.resource]?.model ?? f.resource;
      return f.multiple ? [{ type: Schema.Types.ObjectId, ref: target }] : { type: Schema.Types.ObjectId, ref: target, default: null };
    }
    case "array":
      return { type: [new Schema(shapeFor(f.fields), { _id: true })], default: [] };
    case "select":
      return { type: String, default: f.default ?? "" };
    default:
      return { type: String, default: "default" in f && f.default !== undefined ? f.default : "" };
  }
}

function shapeFor(fields: Field[]) {
  const shape: Record<string, any> = {};
  for (const f of fields) shape[f.name] = fieldDef(f);
  return shape;
}

function modelFor(r: Resource): Model<any> {
  if (mongoose.models[r.model]) return mongoose.models[r.model]!;
  const schema = new Schema(shapeFor(r.fields), { timestamps: true, minimize: false });
  for (const u of r.unique ?? []) schema.index({ [u]: 1 }, { unique: true, sparse: true });
  if (r.key === "products") {
    schema.index({ status: 1, category: 1 });
    schema.index({ "variants.sku": 1 });
  }
  if (r.key === "reviews") schema.index({ product: 1, status: 1 });
  return mg.model(r.model, schema);
}

export const resourceModels: Record<string, Model<any>> = Object.fromEntries(RESOURCES.map((r) => [r.key, modelFor(r)]));
export const modelForResource = (key: string) => resourceModels[key];

export const Product = resourceModels.products!;
export const Category = resourceModels.categories!;
export const Mood = resourceModels.moods!;
export const Routine = resourceModels.routines!;
export const Bundle = resourceModels.bundles!;
export const HomeSection = resourceModels.home!;
export const Page = resourceModels.pages!;
export const Faq = resourceModels.faqs!;
export const CommunityPost = resourceModels.community!;
export const Review = resourceModels.reviews!;
export const Coupon = resourceModels.coupons!;
export const ContactMessage = resourceModels.messages!;
export const Subscriber = resourceModels.subscribers!;
export const SiteSettings = resourceModels.settings!;
export const ShippingSettings = resourceModels.shipping!;
export const ShadeFinderConfig = resourceModels["shade-finder"]!;
export const ByobConfig = resourceModels["build-your-bag"]!;

/* ---------------- Hand-written models ---------------- */

const addressSchema = new Schema(
  {
    label: { type: String, default: "" },
    name: String,
    phone: String,
    line1: String,
    line2: { type: String, default: "" },
    landmark: { type: String, default: "" },
    city: String,
    state: String,
    pincode: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    sku: String,
    name: String,
    slug: String,
    variantName: String,
    hex: String,
    image: String,
    unitPrice: Number,
    qty: Number,
  },
  { _id: false },
);

const orderLineSchema = new Schema(
  {
    key: String,
    kind: { type: String, enum: ["product", "bundle", "byob"] },
    title: String,
    subtitle: String,
    href: String,
    image: String,
    qty: Number,
    unitPrice: Number,
    compareAt: Number,
    lineTotal: Number,
    bundleId: { type: Schema.Types.ObjectId, ref: "Bundle" },
    items: [orderItemSchema],
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    number: { type: String, unique: true, index: true },
    idempotencyKey: { type: String, unique: true, sparse: true },
    accessToken: { type: String, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
    email: { type: String, index: true, lowercase: true, trim: true },
    phone: String,
    shippingAddress: { type: addressSchema },
    lines: [orderLineSchema],
    subtotal: Number,
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    shippingFee: { type: Number, default: 0 },
    codFee: { type: Number, default: 0 },
    total: Number,
    deliveryOption: { type: String, default: "standard" },
    deliveryEta: { type: String, default: "" },
    paymentMethod: { type: String, enum: ["razorpay", "cod"] },
    paymentStatus: { type: String, enum: ["pending", "paid", "cod", "failed", "refunded"], default: "pending" },
    status: {
      type: String,
      enum: ["pending_payment", "placed", "packed", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending_payment",
      index: true,
    },
    razorpay: { orderId: { type: String, index: true }, paymentId: String, signature: String },
    courier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    internalNote: { type: String, default: "" },
    marketingOptIn: { type: Boolean, default: false },
    stockReserved: { type: Boolean, default: true },
    couponCounted: { type: Boolean, default: false },
    confirmationSent: { type: Boolean, default: false },
    history: [{ status: String, note: String, by: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true },
);
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

const CustomerSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    passwordHash: String,
    addresses: [addressSchema],
    resetTokenHash: { type: String, default: "" },
    resetExpires: Date,
    marketingOptIn: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

const AdminUserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    passwordHash: String,
    role: { type: String, enum: ["owner", "manager", "editor"], default: "editor" },
    active: { type: Boolean, default: true },
    resetTokenHash: { type: String, default: "" },
    resetExpires: Date,
    lastLoginAt: Date,
  },
  { timestamps: true },
);

const CounterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });

const AuditLogSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: "AdminUser" },
    adminEmail: String,
    action: String,
    resource: String,
    docId: String,
    summary: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
AuditLogSchema.index({ createdAt: -1 });

const model = (name: string, schema: Schema): Model<any> => (mongoose.models[name] as Model<any>) ?? mg.model(name, schema);

export const Order = model("Order", OrderSchema);
export const Customer = model("Customer", CustomerSchema);
export const AdminUser = model("AdminUser", AdminUserSchema);
export const Counter = model("Counter", CounterSchema);
export const AuditLog = model("AuditLog", AuditLogSchema);
