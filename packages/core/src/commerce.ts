import { z } from "zod";

/* ---------------- Cart input (sent by the browser) ---------------- */

export const selectionSchema = z.object({ productId: z.string().regex(/^[a-f0-9]{24}$/i), sku: z.string().min(1) });

export const cartLineSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("product"), productId: z.string().regex(/^[a-f0-9]{24}$/i), sku: z.string().min(1), qty: z.number().int().min(1).max(20) }),
  z.object({ kind: z.literal("bundle"), bundleId: z.string().regex(/^[a-f0-9]{24}$/i), selections: z.array(selectionSchema).min(1), qty: z.number().int().min(1).max(10) }),
  z.object({ kind: z.literal("byob"), selections: z.array(selectionSchema).min(1), qty: z.number().int().min(1).max(5) }),
]);

export type CartLineInput = z.infer<typeof cartLineSchema>;
export type Selection = z.infer<typeof selectionSchema>;

export const cartSchema = z.object({
  lines: z.array(cartLineSchema).max(50),
  couponCode: z.string().trim().toUpperCase().max(40).optional().default(""),
  pincode: z.string().trim().optional().default(""),
  deliveryOption: z.enum(["standard", "express"]).optional().default("standard"),
  paymentMethod: z.enum(["razorpay", "cod"]).optional(),
});
export type CartInput = z.infer<typeof cartSchema>;

export const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().regex(/^(\+?91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().trim().min(3, "Enter your address").max(150),
  line2: z.string().trim().max(150).optional().default(""),
  landmark: z.string().trim().max(100).optional().default(""),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().trim().min(2, "Choose your state"),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
});
export type Address = z.infer<typeof addressSchema>;

export const checkoutSchema = cartSchema.extend({
  idempotencyKey: z.string().min(10).max(64),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  address: addressSchema,
  paymentMethod: z.enum(["razorpay", "cod"]),
  marketingOptIn: z.boolean().optional().default(false),
  notes: z.string().trim().max(300).optional().default(""),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

/* ---------------- Priced cart (computed on the server) ---------------- */

export type QuoteItem = {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  variantName: string;
  hex?: string;
  image?: string;
  unitPrice: number;
  qty: number;
};

export type QuoteLine = {
  key: string;
  kind: CartLineInput["kind"];
  title: string;
  subtitle?: string;
  href?: string;
  image?: string;
  qty: number;
  unitPrice: number;
  compareAt?: number;
  lineTotal: number;
  items: QuoteItem[];
  bundleId?: string;
  error?: string;
};

export type ShippingConfig = {
  freeShippingThreshold?: number | null;
  standardFee?: number | null;
  standardEta?: string;
  expressEnabled?: boolean;
  expressFee?: number | null;
  expressEta?: string;
  serviceability?: string;
  pincodes?: string;
  blockedPincodes?: string;
  razorpayEnabled?: boolean;
  codEnabled?: boolean;
  codFee?: number | null;
  codMinOrder?: number | null;
  codMaxOrder?: number | null;
  codBlockedPincodes?: string;
};

export type CouponDoc = {
  code: string;
  type: "percent" | "flat" | "freeShipping";
  value?: number | null;
  minOrder?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount?: number;
  startsAt?: Date | string | null;
  expiresAt?: Date | string | null;
  active?: boolean;
};

export type Quote = {
  lines: QuoteLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  coupon?: { code: string; message: string; valid: boolean };
  shippingFee: number;
  codFee: number;
  total: number;
  freeShippingThreshold: number | null;
  amountToFreeShipping: number;
  deliveryOptions: { id: "standard" | "express"; label: string; fee: number; eta: string }[];
  deliveryOption: "standard" | "express";
  pincode?: { value: string; serviceable: boolean; codAvailable: boolean; message?: string };
  payment: { razorpay: boolean; cod: boolean; codReason?: string };
  errors: string[];
};

export const round2 = (n: number) => Math.round(n * 100) / 100;

const parseList = (s?: string) =>
  (s ?? "")
    .split(/[\s,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);

const matchesAny = (pin: string, list: string[]) => list.some((p) => pin.startsWith(p));

export function checkPincode(pin: string, cfg: ShippingConfig) {
  if (!/^[1-9][0-9]{5}$/.test(pin)) return { serviceable: false, codAvailable: false, message: "Enter a valid 6-digit PIN code" };
  const blocked = parseList(cfg.blockedPincodes);
  let serviceable = !matchesAny(pin, blocked);
  if (serviceable && cfg.serviceability === "list") serviceable = matchesAny(pin, parseList(cfg.pincodes));
  if (!serviceable) return { serviceable: false, codAvailable: false, message: "Sorry, we don’t deliver to this PIN code yet." };
  const codAvailable = !!cfg.codEnabled && !matchesAny(pin, parseList(cfg.codBlockedPincodes));
  return { serviceable: true, codAvailable, message: undefined };
}

export function evaluateCoupon(c: CouponDoc | null | undefined, subtotal: number, now = new Date()) {
  if (!c || !c.active) return { valid: false, discount: 0, freeShipping: false, message: "This code isn’t valid." };
  if (c.startsAt && new Date(c.startsAt) > now) return { valid: false, discount: 0, freeShipping: false, message: "This code isn’t active yet." };
  if (c.expiresAt && new Date(c.expiresAt) < now) return { valid: false, discount: 0, freeShipping: false, message: "This code has expired." };
  if (c.usageLimit && (c.usedCount ?? 0) >= c.usageLimit) return { valid: false, discount: 0, freeShipping: false, message: "This code has reached its usage limit." };
  if (c.minOrder && subtotal < c.minOrder)
    return { valid: false, discount: 0, freeShipping: false, message: `Add ${formatINR(c.minOrder - subtotal)} more to use this code.` };
  let discount = 0;
  if (c.type === "percent") {
    discount = Math.round((subtotal * (c.value ?? 0)) / 100); // whole rupees
    if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  } else if (c.type === "flat") discount = c.value ?? 0;
  discount = round2(Math.min(discount, subtotal));
  const freeShipping = c.type === "freeShipping";
  return { valid: true, discount, freeShipping, message: freeShipping ? "Free shipping applied." : `You saved ${formatINR(discount)}.` };
}

/** Pure total calculation once lines are priced. */
export function finalizeQuote(args: {
  lines: QuoteLine[];
  cfg: ShippingConfig;
  coupon?: CouponDoc | null;
  couponCode?: string;
  pincode?: string;
  deliveryOption?: "standard" | "express";
  paymentMethod?: "razorpay" | "cod";
  errors?: string[];
}): Quote {
  const { lines, cfg } = args;
  const errors = [...(args.errors ?? [])];
  const valid = lines.filter((l) => !l.error);
  const subtotal = round2(valid.reduce((s, l) => s + l.lineTotal, 0));
  const itemCount = valid.reduce((s, l) => s + l.qty, 0);

  let discount = 0;
  let freeShipFromCoupon = false;
  let coupon: Quote["coupon"];
  if (args.couponCode) {
    const res = evaluateCoupon(args.coupon, subtotal);
    coupon = { code: args.couponCode, message: res.message, valid: res.valid };
    if (res.valid) {
      discount = res.discount;
      freeShipFromCoupon = res.freeShipping;
    }
  }

  const afterDiscount = round2(subtotal - discount);
  const threshold = cfg.freeShippingThreshold ?? null;
  const freeStandard = freeShipFromCoupon || (threshold !== null && afterDiscount >= threshold);
  const deliveryOptions: Quote["deliveryOptions"] = [
    { id: "standard", label: "Standard delivery", fee: freeStandard ? 0 : (cfg.standardFee ?? 0), eta: cfg.standardEta ?? "" },
  ];
  if (cfg.expressEnabled) deliveryOptions.push({ id: "express", label: "Express delivery", fee: cfg.expressFee ?? 0, eta: cfg.expressEta ?? "" });
  const chosen = deliveryOptions.find((o) => o.id === args.deliveryOption) ?? deliveryOptions[0]!;
  const shippingFee = valid.length ? chosen.fee : 0;

  let pincode: Quote["pincode"];
  if (args.pincode) {
    const r = checkPincode(args.pincode, cfg);
    pincode = { value: args.pincode, ...r };
  }

  let codReason: string | undefined;
  let cod = !!cfg.codEnabled;
  if (cod && cfg.codMaxOrder && afterDiscount > cfg.codMaxOrder) {
    cod = false;
    codReason = `Cash on Delivery is available on orders up to ${formatINR(cfg.codMaxOrder)}.`;
  }
  if (cod && cfg.codMinOrder && afterDiscount < cfg.codMinOrder) {
    cod = false;
    codReason = `Cash on Delivery is available on orders above ${formatINR(cfg.codMinOrder)}.`;
  }
  if (cod && pincode && !pincode.codAvailable) {
    cod = false;
    codReason = "Cash on Delivery isn’t available for this PIN code.";
  }
  const codFee = args.paymentMethod === "cod" && cod ? (cfg.codFee ?? 0) : 0;

  const total = round2(afterDiscount + shippingFee + codFee);
  return {
    lines,
    itemCount,
    subtotal,
    discount,
    coupon,
    shippingFee,
    codFee,
    total,
    freeShippingThreshold: threshold,
    amountToFreeShipping: threshold !== null && !freeStandard ? round2(Math.max(0, threshold - afterDiscount)) : 0,
    deliveryOptions,
    deliveryOption: chosen.id,
    pincode,
    payment: { razorpay: cfg.razorpayEnabled !== false, cod, codReason },
    errors,
  };
}

/* ---------------- Formatting ---------------- */

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: 0 });
export const formatINR = (n: number | null | undefined) => inr.format(n ?? 0);

export const formatDate = (d: Date | string | null | undefined, withTime = false) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
        timeZone: "Asia/Kolkata",
      })
    : "";
