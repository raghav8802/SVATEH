import type { Option } from "./fields";

const opts = (...pairs: [string, string][]): Option[] => pairs.map(([value, label]) => ({ value, label }));

export const SKIN_DEPTHS = opts(
  ["light", "Light"],
  ["light-medium", "Light-Medium"],
  ["medium", "Medium"],
  ["tan", "Tan"],
  ["deep", "Deep"],
);

export const UNDERTONES = opts(
  ["warm", "Warm"],
  ["cool", "Cool"],
  ["neutral", "Neutral"],
  ["olive", "Olive"],
  ["not-sure", "Not sure"],
);

export const FINISHES = opts(
  ["matte", "Matte"],
  ["soft-matte", "Soft matte"],
  ["satin", "Satin"],
  ["natural", "Natural"],
  ["dewy", "Dewy"],
  ["luminous", "Luminous"],
  ["glossy", "Glossy"],
  ["shimmer", "Shimmer"],
);

export const COVERAGES = opts(
  ["sheer", "Sheer"],
  ["light", "Light"],
  ["buildable", "Buildable"],
  ["medium", "Medium"],
  ["full", "Full"],
);

export const BADGES = opts(
  ["new", "New"],
  ["bestseller", "Bestseller"],
  ["limited", "Limited edition"],
  ["back-in-stock", "Back in stock"],
  ["vegan", "Vegan (only if certified)"],
  ["cruelty-free", "Cruelty-free (only if certified)"],
);

export const HOME_SECTION_TYPES = opts(
  ["hero", "Hero banner"],
  ["marquee", "Scrolling gold strip"],
  ["productGrid", "Product grid (The SVATEH Edit)"],
  ["intro", "Big statement + text"],
  ["multiUse", "Beauty That Does More"],
  ["moods", "Shop Your Mood"],
  ["routine", "Your 5-Minute Face"],
  ["why", "Why SVATEH"],
  ["shadeFinder", "Shade Finder call-out"],
  ["community", "SVATEH Girls"],
  ["reviews", "Customer reviews"],
  ["story", "Our Story"],
  ["newsletter", "Newsletter signup"],
  ["banner", "Image banner"],
);

export const THEMES = opts(
  ["plum", "Deep Plum"],
  ["violet", "Midnight Violet"],
  ["cream", "Cream"],
  ["white", "White"],
  ["blush", "Blush"],
  ["gold", "Gold"],
);

export const ORDER_STATUSES = opts(
  ["pending_payment", "Awaiting payment"],
  ["placed", "Placed"],
  ["packed", "Packed"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
  ["refunded", "Refunded"],
);

export const PAYMENT_STATUSES = opts(
  ["pending", "Pending"],
  ["paid", "Paid"],
  ["cod", "Cash on delivery"],
  ["failed", "Failed"],
  ["refunded", "Refunded"],
);

export const FAQ_CATEGORIES = opts(
  ["about", "About SVATEH"],
  ["products", "Products"],
  ["shades", "Shades"],
  ["orders", "Orders"],
  ["shipping", "Shipping"],
  ["payments", "Payments"],
  ["returns", "Returns"],
  ["contact", "Contact"],
);

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

export const labelOf = (options: Option[], value: string | undefined | null) =>
  options.find((o) => o.value === value)?.label ?? value ?? "";
