import type { Field, Role } from "./fields";
import {
  BADGES,
  COVERAGES,
  FAQ_CATEGORIES,
  FINISHES,
  HOME_SECTION_TYPES,
  SKIN_DEPTHS,
  THEMES,
  UNDERTONES,
} from "./options";

export type ColumnKind = "text" | "image" | "money" | "bool" | "date" | "badge" | "count" | "ref";

export type Resource = {
  key: string;
  model: string;
  label: string;
  singular: string;
  group: "Catalog" | "Merchandising" | "Content" | "Community" | "Sales" | "Settings";
  description?: string;
  roles: Role[];
  fields: Field[];
  singleton?: boolean;
  /** Admins can view/update but not create (records come from the storefront). */
  noCreate?: boolean;
  list?: {
    titleField: string;
    columns: { field: string; label: string; kind?: ColumnKind }[];
    searchFields?: string[];
    defaultSort?: Record<string, 1 | -1>;
    filters?: { field: string; label: string; options: { value: string; label: string }[] }[];
  };
  /** Unique fields (enforced as DB indexes). */
  unique?: string[];
  /** Storefront URL for "View on site" links. */
  publicPath?: (doc: Record<string, any>) => string | null;
  /** Business rules beyond field validation. Return a list of human-readable problems. */
  rules?: (doc: Record<string, any>) => string[];
  csv?: boolean;
};

const ALL: Role[] = ["owner", "manager", "editor"];
const MANAGERS: Role[] = ["owner", "manager"];

const seo: Field[] = [
  { name: "seoTitle", label: "SEO title", type: "text", section: "Search engines", maxLength: 70, help: "Shown in Google results and browser tabs. Leave blank to use the name." },
  { name: "seoDescription", label: "SEO description", type: "textarea", section: "Search engines", maxLength: 170 },
];

const sortOrder: Field = { name: "sortOrder", label: "Display order", type: "number", default: 0, width: "third", help: "Lower numbers appear first." };

export const products: Resource = {
  key: "products",
  model: "Product",
  label: "Products",
  singular: "Product",
  group: "Catalog",
  roles: ALL,
  unique: ["slug"],
  fields: [
    { name: "name", label: "Product name", type: "text", required: true, section: "Basics", width: "half" },
    { name: "slug", label: "URL slug", type: "slug", from: "name", section: "Basics", width: "half", help: "Leave blank to generate from the name." },
    { name: "productType", label: "Product type", type: "text", section: "Basics", width: "half", placeholder: "Mousse lipstick" },
    { name: "tagline", label: "Short descriptor", type: "text", section: "Basics", width: "half", placeholder: "Soft-focus colour", maxLength: 90 },
    { name: "category", label: "Category", type: "ref", resource: "categories", required: true, section: "Basics", width: "half" },
    { name: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft (hidden)" }, { value: "published", label: "Published (live)" }], default: "draft", section: "Basics", width: "half" },
    { name: "price", label: "Price (₹)", type: "number", min: 0, required: true, section: "Pricing", width: "third" },
    { name: "compareAtPrice", label: "Compare-at price (₹)", type: "number", min: 0, section: "Pricing", width: "third", help: "Original price, shown struck-through. Leave blank if not on offer." },
    { name: "size", label: "Size / quantity", type: "text", section: "Pricing", width: "third", placeholder: "4.5 g" },
    { name: "images", label: "Product images", type: "images", section: "Images", help: "First image is the main one. Drag to reorder." },
    {
      name: "variants",
      label: "Shades / variants",
      type: "array",
      section: "Shades & stock",
      itemLabel: "name",
      addLabel: "Add shade",
      help: "Every product needs at least one. For products without shades add a single variant called “Standard”.",
      fields: [
        { name: "name", label: "Shade name", type: "text", required: true, width: "half" },
        { name: "sku", label: "SKU", type: "text", required: true, width: "half" },
        { name: "hex", label: "Swatch colour", type: "color", width: "third" },
        { name: "stock", label: "Stock", type: "number", min: 0, default: 0, width: "third" },
        { name: "price", label: "Price override (₹)", type: "number", min: 0, width: "third", help: "Optional." },
        { name: "depth", label: "Skin depth", type: "select", options: SKIN_DEPTHS, width: "half" },
        { name: "undertone", label: "Undertone", type: "select", options: UNDERTONES, width: "half" },
        { name: "description", label: "Shade description", type: "text", placeholder: "Warm rosy nude" },
        { name: "image", label: "Shade image", type: "image" },
        { name: "active", label: "Available", type: "boolean", default: true },
      ],
    },
    { name: "badges", label: "Badges", type: "multiselect", options: BADGES, section: "Merchandising", help: "Only use claims you can substantiate." },
    { name: "featured", label: "Show in The SVATEH Edit (homepage)", type: "boolean", section: "Merchandising", width: "half" },
    { name: "isBestseller", label: "Mark as bestseller", type: "boolean", section: "Merchandising", width: "half", help: "Use only with genuine sales evidence." },
    { name: "launchDate", label: "Launch date", type: "date", section: "Merchandising", width: "half", help: "Used for New Arrivals ordering." },
    sortOrder,
    { name: "description", label: "What it is", type: "richtext", section: "Product details" },
    { name: "benefits", label: "Why you’ll love it", type: "list", section: "Product details", addLabel: "Add benefit", help: "Three to five specific, accurate benefits." },
    { name: "texture", label: "Texture", type: "text", section: "Product details", width: "third" },
    { name: "finish", label: "Finish", type: "select", options: FINISHES, section: "Product details", width: "third" },
    { name: "coverage", label: "Coverage", type: "select", options: COVERAGES, section: "Product details", width: "third" },
    { name: "howToUse", label: "How to use (steps)", type: "list", section: "Product details", addLabel: "Add step", help: "Required before publishing." },
    { name: "ingredients", label: "Ingredients (full INCI list)", type: "textarea", section: "Product details", help: "Required before publishing." },
    { name: "shadeGuide", label: "Find your shade guidance", type: "richtext", section: "Product details" },
    {
      name: "faqs",
      label: "Product FAQs",
      type: "array",
      section: "Product details",
      itemLabel: "question",
      addLabel: "Add question",
      fields: [
        { name: "question", label: "Question", type: "text", required: true },
        { name: "answer", label: "Answer", type: "textarea", required: true },
      ],
    },
    { name: "related", label: "Complete your look (related products)", type: "ref", resource: "products", multiple: true, section: "Product details" },
    ...seo,
  ],
  list: {
    titleField: "name",
    columns: [
      { field: "images", label: "", kind: "image" },
      { field: "name", label: "Name" },
      { field: "category", label: "Category", kind: "ref" },
      { field: "price", label: "Price", kind: "money" },
      { field: "variants", label: "Shades", kind: "count" },
      { field: "status", label: "Status", kind: "badge" },
    ],
    searchFields: ["name", "tagline", "variants.name", "variants.sku"],
    defaultSort: { sortOrder: 1, createdAt: -1 },
    filters: [{ field: "status", label: "Status", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] }],
  },
  publicPath: (d) => (d.slug ? `/products/${d.slug}` : null),
  rules: (d) => {
    const problems: string[] = [];
    if (!d.variants?.length) problems.push("Add at least one shade / variant.");
    const skus = (d.variants ?? []).map((v: any) => v.sku);
    if (new Set(skus).size !== skus.length) problems.push("Each shade needs a unique SKU.");
    if (d.status === "published") {
      if (!d.howToUse?.length) problems.push("“How to use” can’t be empty on a published product.");
      if (!d.ingredients?.trim()) problems.push("“Ingredients” can’t be empty on a published product.");
    }
    return problems;
  },
};

export const categories: Resource = {
  key: "categories",
  model: "Category",
  label: "Categories",
  singular: "Category",
  group: "Catalog",
  roles: ALL,
  unique: ["slug"],
  description: "Face, Lips, Cheeks, Eyes… Categories with no published products are hidden from the menu automatically.",
  fields: [
    { name: "name", label: "Name", type: "text", required: true, width: "half" },
    { name: "slug", label: "URL slug", type: "slug", from: "name", width: "half" },
    { name: "intro", label: "Short introduction", type: "textarea" },
    { name: "image", label: "Image", type: "image" },
    { name: "showInMenu", label: "Show in menu", type: "boolean", default: true, width: "half" },
    sortOrder,
    ...seo,
  ],
  list: { titleField: "name", columns: [{ field: "name", label: "Name" }, { field: "showInMenu", label: "In menu", kind: "bool" }, { field: "sortOrder", label: "Order" }], defaultSort: { sortOrder: 1 } },
  publicPath: (d) => (d.slug ? `/shop/${d.slug}` : null),
};

export const moods: Resource = {
  key: "moods",
  model: "Mood",
  label: "Moods",
  singular: "Mood",
  group: "Merchandising",
  roles: ALL,
  unique: ["slug"],
  description: "Pink Mood, Nude Mood, Soft Glam, Date Night, Glow Mode…",
  fields: [
    { name: "name", label: "Name", type: "text", required: true, width: "half" },
    { name: "slug", label: "URL slug", type: "slug", from: "name", width: "half" },
    { name: "tagline", label: "Tagline", type: "text", placeholder: "fresh, flushed, playful" },
    { name: "description", label: "Description", type: "richtext" },
    { name: "color", label: "Mood colour", type: "color", width: "half" },
    { name: "image", label: "Finished look image", type: "image" },
    { name: "videoUrl", label: "Tutorial video URL", type: "url", help: "YouTube or Instagram link (optional)." },
    { name: "products", label: "Products needed", type: "ref", resource: "products", multiple: true },
    {
      name: "steps",
      label: "Application order",
      type: "array",
      itemLabel: "title",
      addLabel: "Add step",
      fields: [
        { name: "title", label: "Step", type: "text", required: true, width: "half" },
        { name: "product", label: "Product", type: "ref", resource: "products", width: "half" },
        { name: "text", label: "How", type: "textarea" },
      ],
    },
    { name: "bundle", label: "Complete-look bundle", type: "ref", resource: "bundles" },
    { name: "active", label: "Live on site", type: "boolean", default: true, width: "half" },
    sortOrder,
    ...seo,
  ],
  list: { titleField: "name", columns: [{ field: "image", label: "", kind: "image" }, { field: "name", label: "Name" }, { field: "tagline", label: "Tagline" }, { field: "active", label: "Live", kind: "bool" }], defaultSort: { sortOrder: 1 } },
  publicPath: (d) => (d.slug ? `/moods/${d.slug}` : null),
};

export const routines: Resource = {
  key: "routines",
  model: "Routine",
  label: "Routines",
  singular: "Routine",
  group: "Merchandising",
  roles: ALL,
  unique: ["slug"],
  fields: [
    { name: "name", label: "Name", type: "text", required: true, width: "half" },
    { name: "slug", label: "URL slug", type: "slug", from: "name", width: "half" },
    { name: "summary", label: "Summary", type: "text", placeholder: "Everyday wear" },
    { name: "description", label: "Why these work together", type: "richtext" },
    { name: "image", label: "Image", type: "image" },
    {
      name: "steps",
      label: "Steps (in application order)",
      type: "array",
      itemLabel: "title",
      addLabel: "Add step",
      fields: [
        { name: "title", label: "Step name", type: "text", required: true, width: "half", placeholder: "Skin" },
        { name: "product", label: "Product", type: "ref", resource: "products", required: true, width: "half" },
        { name: "text", label: "Why / how", type: "textarea" },
      ],
    },
    { name: "active", label: "Live on site", type: "boolean", default: true, width: "half" },
    sortOrder,
    ...seo,
  ],
  list: { titleField: "name", columns: [{ field: "name", label: "Name" }, { field: "steps", label: "Steps", kind: "count" }, { field: "active", label: "Live", kind: "bool" }], defaultSort: { sortOrder: 1 } },
  publicPath: (d) => (d.slug ? `/routines#${d.slug}` : null),
};

export const bundles: Resource = {
  key: "bundles",
  model: "Bundle",
  label: "Bundles",
  singular: "Bundle",
  group: "Merchandising",
  roles: MANAGERS,
  unique: ["slug"],
  fields: [
    { name: "name", label: "Name", type: "text", required: true, width: "half" },
    { name: "slug", label: "URL slug", type: "slug", from: "name", width: "half" },
    { name: "tagline", label: "Tagline", type: "text" },
    { name: "description", label: "Description", type: "richtext" },
    { name: "images", label: "Images", type: "images" },
    {
      name: "items",
      label: "Included products",
      type: "array",
      itemLabel: "product",
      addLabel: "Add product",
      fields: [
        { name: "product", label: "Product", type: "ref", resource: "products", required: true, width: "half" },
        { name: "quantity", label: "Quantity", type: "number", min: 1, default: 1, width: "half" },
      ],
    },
    { name: "price", label: "Bundle price (₹)", type: "number", min: 0, required: true, width: "half", help: "Check margins before discounting. The storefront shows savings versus individual prices automatically." },
    { name: "isGift", label: "Gift set", type: "boolean", width: "half" },
    { name: "active", label: "Live on site", type: "boolean", default: true, width: "half" },
    sortOrder,
    ...seo,
  ],
  list: { titleField: "name", columns: [{ field: "images", label: "", kind: "image" }, { field: "name", label: "Name" }, { field: "price", label: "Price", kind: "money" }, { field: "items", label: "Items", kind: "count" }, { field: "active", label: "Live", kind: "bool" }], defaultSort: { sortOrder: 1 } },
  publicPath: (d) => (d.slug ? `/bundles/${d.slug}` : null),
  rules: (d) => (d.items?.length ? [] : ["Add at least one product to the bundle."]),
};

export const reviews: Resource = {
  key: "reviews",
  model: "Review",
  label: "Reviews",
  singular: "Review",
  group: "Community",
  roles: MANAGERS,
  noCreate: true,
  description: "Customer reviews arrive here as “Pending”. Approve genuine reviews to publish them. Never invent reviews.",
  fields: [
    { name: "status", label: "Status", type: "select", options: [{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved (live)" }, { value: "rejected", label: "Rejected" }], default: "pending", width: "half" },
    { name: "verified", label: "Verified purchase", type: "boolean", width: "half", readOnly: true },
    { name: "product", label: "Product", type: "ref", resource: "products", readOnly: true },
    { name: "name", label: "Name", type: "text", readOnly: true, width: "half" },
    { name: "email", label: "Email", type: "email", readOnly: true, width: "half" },
    { name: "rating", label: "Rating", type: "number", readOnly: true, width: "third" },
    { name: "shade", label: "Shade", type: "text", readOnly: true, width: "third" },
    { name: "title", label: "Title", type: "text", readOnly: true },
    { name: "body", label: "Review", type: "textarea", readOnly: true },
    { name: "images", label: "Customer photos", type: "images", readOnly: true },
    { name: "reply", label: "Public reply from SVATEH", type: "textarea" },
  ],
  list: {
    titleField: "title",
    columns: [{ field: "product", label: "Product", kind: "ref" }, { field: "name", label: "Name" }, { field: "rating", label: "★" }, { field: "verified", label: "Verified", kind: "bool" }, { field: "status", label: "Status", kind: "badge" }, { field: "createdAt", label: "Date", kind: "date" }],
    searchFields: ["name", "title", "body"],
    defaultSort: { createdAt: -1 },
    filters: [{ field: "status", label: "Status", options: [{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }] }],
  },
};

export const community: Resource = {
  key: "community",
  model: "CommunityPost",
  label: "SVATEH Girls",
  singular: "Community post",
  group: "Community",
  roles: ALL,
  description: "Real creator and customer content. Only publish content you have permission to use.",
  fields: [
    { name: "creatorName", label: "Creator name", type: "text", required: true, width: "half" },
    { name: "handle", label: "Social handle", type: "text", width: "half", placeholder: "@name" },
    { name: "platform", label: "Platform", type: "select", options: [{ value: "instagram", label: "Instagram" }, { value: "youtube", label: "YouTube" }, { value: "customer", label: "Customer photo" }, { value: "other", label: "Other" }], default: "instagram", width: "half" },
    { name: "kind", label: "Content type", type: "select", options: [{ value: "grwm", label: "GRWM" }, { value: "swatch", label: "Shade swatch" }, { value: "demo", label: "Product demo" }, { value: "look", label: "Finished look" }], default: "look", width: "half" },
    { name: "image", label: "Image / thumbnail", type: "image", required: true },
    { name: "link", label: "Link to post / video", type: "url" },
    { name: "caption", label: "Caption", type: "textarea" },
    { name: "products", label: "Products used (Shop the look)", type: "ref", resource: "products", multiple: true },
    { name: "permissionConfirmed", label: "I have permission to use this content", type: "boolean", required: true },
    { name: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }], default: "draft", width: "half" },
    sortOrder,
  ],
  list: { titleField: "creatorName", columns: [{ field: "image", label: "", kind: "image" }, { field: "creatorName", label: "Creator" }, { field: "kind", label: "Type", kind: "badge" }, { field: "status", label: "Status", kind: "badge" }], defaultSort: { sortOrder: 1, createdAt: -1 } },
  rules: (d) => (d.status === "published" && !d.permissionConfirmed ? ["Confirm you have permission before publishing."] : []),
};

export const homeSections: Resource = {
  key: "home",
  model: "HomeSection",
  label: "Homepage",
  singular: "Homepage section",
  group: "Content",
  roles: ALL,
  description: "Every block on the homepage. Toggle “Visible”, change the order, or edit text and images.",
  fields: [
    { name: "type", label: "Section type", type: "select", options: HOME_SECTION_TYPES, required: true, width: "half" },
    { name: "enabled", label: "Visible", type: "boolean", default: true, width: "third" },
    sortOrder,
    { name: "theme", label: "Background", type: "select", options: THEMES, width: "half", showIf: { field: "type", equals: ["intro", "multiUse", "routine", "why", "shadeFinder", "newsletter", "banner", "productGrid", "moods", "community", "reviews"] } },
    { name: "eyebrow", label: "Small label above title", type: "text", showIf: { field: "type", equals: ["hero", "intro", "productGrid", "multiUse", "moods", "routine", "why", "shadeFinder", "community", "reviews", "story", "newsletter", "banner"] } },
    { name: "title", label: "Title", type: "textarea", help: "Press Enter for a line break.", showIf: { field: "type", equals: ["hero", "intro", "productGrid", "multiUse", "moods", "routine", "why", "shadeFinder", "community", "reviews", "story", "newsletter", "banner"] } },
    { name: "subtitle", label: "Subtitle", type: "text", showIf: { field: "type", equals: ["hero", "intro", "story"] } },
    { name: "body", label: "Text", type: "textarea", showIf: { field: "type", equals: ["hero", "marquee", "intro", "productGrid", "multiUse", "moods", "routine", "why", "shadeFinder", "community", "story", "newsletter", "banner"] }, help: "For the gold strip, separate phrases with ✦" },
    { name: "image", label: "Image", type: "image", showIf: { field: "type", equals: ["hero", "story", "shadeFinder", "banner", "multiUse"] } },
    { name: "products", label: "Products to show", type: "ref", resource: "products", multiple: true, showIf: { field: "type", equals: ["productGrid", "hero"] }, help: "Leave empty to show products marked “Show in The SVATEH Edit”." },
    {
      name: "items",
      label: "Items",
      type: "array",
      itemLabel: "title",
      showIf: { field: "type", equals: ["multiUse", "routine", "why"] },
      fields: [
        { name: "title", label: "Title", type: "text", required: true, width: "half" },
        { name: "href", label: "Link", type: "text", width: "half", placeholder: "/products/…" },
        { name: "text", label: "Text", type: "textarea" },
        { name: "image", label: "Image", type: "image" },
      ],
    },
    { name: "quote", label: "Quote", type: "text", showIf: { field: "type", equals: ["story"] } },
    { name: "ctaLabel", label: "Button label", type: "text", width: "half", showIf: { field: "type", equals: ["hero", "intro", "productGrid", "multiUse", "moods", "routine", "why", "shadeFinder", "community", "story", "banner"] } },
    { name: "ctaHref", label: "Button link", type: "text", width: "half", placeholder: "/shop", showIf: { field: "type", equals: ["hero", "intro", "productGrid", "multiUse", "moods", "routine", "why", "shadeFinder", "community", "story", "banner"] } },
    { name: "cta2Label", label: "Second button label", type: "text", width: "half", showIf: { field: "type", equals: ["hero"] } },
    { name: "cta2Href", label: "Second button link", type: "text", width: "half", showIf: { field: "type", equals: ["hero"] } },
  ],
  list: { titleField: "title", columns: [{ field: "sortOrder", label: "#" }, { field: "type", label: "Type", kind: "badge" }, { field: "title", label: "Title" }, { field: "enabled", label: "Visible", kind: "bool" }], defaultSort: { sortOrder: 1 } },
  publicPath: () => "/",
};

export const pages: Resource = {
  key: "pages",
  model: "Page",
  label: "Pages",
  singular: "Page",
  group: "Content",
  roles: ALL,
  unique: ["slug"],
  description: "About, Shipping Policy, Returns, Privacy, Terms and any extra page. Pages are available at svateh.com/<slug>.",
  fields: [
    { name: "title", label: "Title", type: "text", required: true, width: "half" },
    { name: "slug", label: "URL slug", type: "slug", from: "title", width: "half" },
    { name: "eyebrow", label: "Small label", type: "text", width: "half" },
    { name: "kind", label: "Layout", type: "select", options: [{ value: "story", label: "Brand story (alternating images)" }, { value: "policy", label: "Policy / text page" }], default: "policy", width: "half" },
    { name: "intro", label: "Opening statement", type: "textarea" },
    {
      name: "sections",
      label: "Sections",
      type: "array",
      itemLabel: "heading",
      addLabel: "Add section",
      fields: [
        { name: "heading", label: "Heading", type: "text" },
        { name: "body", label: "Text", type: "richtext" },
        { name: "image", label: "Image", type: "image" },
      ],
    },
    { name: "ctaLabel", label: "Closing button label", type: "text", width: "half" },
    { name: "ctaHref", label: "Closing button link", type: "text", width: "half" },
    { name: "published", label: "Published", type: "boolean", default: true },
    ...seo,
  ],
  list: { titleField: "title", columns: [{ field: "title", label: "Title" }, { field: "slug", label: "URL" }, { field: "published", label: "Live", kind: "bool" }, { field: "updatedAt", label: "Updated", kind: "date" }], defaultSort: { title: 1 } },
  publicPath: (d) => (d.slug ? `/${d.slug}` : null),
};

export const faqs: Resource = {
  key: "faqs",
  model: "Faq",
  label: "FAQs",
  singular: "FAQ",
  group: "Content",
  roles: ALL,
  fields: [
    { name: "category", label: "Category", type: "select", options: FAQ_CATEGORIES, required: true, width: "half" },
    sortOrder,
    { name: "question", label: "Question", type: "text", required: true },
    { name: "answer", label: "Answer", type: "richtext", required: true },
    { name: "published", label: "Published", type: "boolean", default: true },
  ],
  list: {
    titleField: "question",
    columns: [{ field: "question", label: "Question" }, { field: "category", label: "Category", kind: "badge" }, { field: "published", label: "Live", kind: "bool" }],
    defaultSort: { category: 1, sortOrder: 1 },
    searchFields: ["question"],
    filters: [{ field: "category", label: "Category", options: FAQ_CATEGORIES }],
  },
  publicPath: () => "/faq",
};

export const coupons: Resource = {
  key: "coupons",
  model: "Coupon",
  label: "Coupons",
  singular: "Coupon",
  group: "Sales",
  roles: MANAGERS,
  unique: ["code"],
  fields: [
    { name: "code", label: "Code", type: "text", required: true, width: "half", help: "Customers type this at checkout (not case-sensitive)." },
    { name: "active", label: "Active", type: "boolean", default: true, width: "half" },
    { name: "description", label: "Internal note", type: "text" },
    { name: "type", label: "Discount type", type: "select", options: [{ value: "percent", label: "Percentage off" }, { value: "flat", label: "Flat ₹ off" }, { value: "freeShipping", label: "Free shipping" }], default: "percent", width: "half" },
    { name: "value", label: "Value", type: "number", min: 0, width: "half", help: "e.g. 10 for 10% or ₹10." },
    { name: "minOrder", label: "Minimum order (₹)", type: "number", min: 0, width: "third" },
    { name: "maxDiscount", label: "Max discount (₹)", type: "number", min: 0, width: "third", help: "Caps percentage discounts." },
    { name: "usageLimit", label: "Total uses allowed", type: "number", min: 0, width: "third", help: "Blank = unlimited." },
    { name: "startsAt", label: "Starts", type: "date", width: "half" },
    { name: "expiresAt", label: "Expires", type: "date", width: "half" },
    { name: "usedCount", label: "Times used", type: "number", default: 0, readOnly: true },
  ],
  list: { titleField: "code", columns: [{ field: "code", label: "Code" }, { field: "type", label: "Type", kind: "badge" }, { field: "value", label: "Value" }, { field: "usedCount", label: "Used" }, { field: "expiresAt", label: "Expires", kind: "date" }, { field: "active", label: "Active", kind: "bool" }], defaultSort: { createdAt: -1 } },
};

export const contactMessages: Resource = {
  key: "messages",
  model: "ContactMessage",
  label: "Messages",
  singular: "Message",
  group: "Sales",
  roles: MANAGERS,
  noCreate: true,
  csv: true,
  fields: [
    { name: "status", label: "Status", type: "select", options: [{ value: "new", label: "New" }, { value: "replied", label: "Replied" }, { value: "closed", label: "Closed" }], default: "new" },
    { name: "name", label: "Name", type: "text", readOnly: true, width: "half" },
    { name: "email", label: "Email", type: "email", readOnly: true, width: "half" },
    { name: "phone", label: "Phone", type: "text", readOnly: true, width: "half" },
    { name: "orderNumber", label: "Order number", type: "text", readOnly: true, width: "half" },
    { name: "message", label: "Message", type: "textarea", readOnly: true },
    { name: "note", label: "Internal note", type: "textarea" },
  ],
  list: {
    titleField: "name",
    columns: [{ field: "name", label: "Name" }, { field: "email", label: "Email" }, { field: "orderNumber", label: "Order" }, { field: "status", label: "Status", kind: "badge" }, { field: "createdAt", label: "Received", kind: "date" }],
    defaultSort: { createdAt: -1 },
    searchFields: ["name", "email", "orderNumber", "message"],
    filters: [{ field: "status", label: "Status", options: [{ value: "new", label: "New" }, { value: "replied", label: "Replied" }, { value: "closed", label: "Closed" }] }],
  },
};

export const subscribers: Resource = {
  key: "subscribers",
  model: "Subscriber",
  label: "Subscribers",
  singular: "Subscriber",
  group: "Sales",
  roles: MANAGERS,
  noCreate: true,
  csv: true,
  unique: ["email"],
  fields: [
    { name: "email", label: "Email", type: "email", required: true },
    { name: "source", label: "Source", type: "text", readOnly: true },
    { name: "unsubscribed", label: "Unsubscribed", type: "boolean" },
  ],
  list: { titleField: "email", columns: [{ field: "email", label: "Email" }, { field: "source", label: "Source" }, { field: "unsubscribed", label: "Unsubscribed", kind: "bool" }, { field: "createdAt", label: "Joined", kind: "date" }], defaultSort: { createdAt: -1 }, searchFields: ["email"] },
};

/* ---------------- Singletons ---------------- */

export const settings: Resource = {
  key: "settings",
  model: "SiteSettings",
  label: "Site settings",
  singular: "Site settings",
  group: "Settings",
  roles: MANAGERS,
  singleton: true,
  fields: [
    { name: "brandName", label: "Brand name", type: "text", default: "SVATEH", required: true, section: "Brand", width: "half" },
    { name: "tagline", label: "Tagline", type: "text", default: "Pamper Yourself. The World Can Wait.", section: "Brand", width: "half" },
    { name: "logo", label: "Logo (optional)", type: "image", section: "Brand", help: "Leave blank to use the brand name in Playfair Display." },
    { name: "favicon", label: "Favicon / app icon", type: "image", section: "Brand" },
    { name: "colorViolet", label: "Midnight Violet", type: "color", default: "#381A40", section: "Brand colours", width: "third" },
    { name: "colorPlum", label: "Deep Plum", type: "color", default: "#261732", section: "Brand colours", width: "third" },
    { name: "colorBlush", label: "Blush", type: "color", default: "#E7A8B9", section: "Brand colours", width: "third" },
    { name: "colorGold", label: "Gold", type: "color", default: "#C8A45D", section: "Brand colours", width: "third" },
    { name: "colorCream", label: "Cream", type: "color", default: "#F7F2EA", section: "Brand colours", width: "third" },
    { name: "colorInk", label: "Text", type: "color", default: "#281E2C", section: "Brand colours", width: "third" },
    { name: "announcementEnabled", label: "Show announcement bar", type: "boolean", default: true, section: "Announcement bar" },
    { name: "announcementText", label: "Announcement text", type: "text", section: "Announcement bar", placeholder: "Free shipping on orders above ₹999" },
    { name: "announcementLink", label: "Announcement link", type: "text", section: "Announcement bar" },
    { name: "bestsellersLabel", label: "Bestsellers label", type: "text", default: "New Launches", section: "Navigation", help: "Use “New Launches” or “Meet the Collection” until you have genuine sales data, then switch to “Bestsellers”.", width: "half" },
    { name: "showShadeFinder", label: "Show Shade Finder in menu", type: "boolean", default: true, section: "Navigation", width: "half" },
    { name: "showCommunity", label: "Show SVATEH Girls in menu", type: "boolean", default: true, section: "Navigation", width: "half" },
    { name: "showBundles", label: "Show Bundles in menu", type: "boolean", default: true, section: "Navigation", width: "half" },
    { name: "contactEmail", label: "Support email", type: "email", section: "Contact details", width: "half" },
    { name: "phone", label: "Phone", type: "text", section: "Contact details", width: "half", help: "Only show a verified number." },
    { name: "whatsapp", label: "WhatsApp number", type: "text", section: "Contact details", width: "half", placeholder: "919876543210" },
    { name: "supportHours", label: "Support hours", type: "text", section: "Contact details", width: "half", placeholder: "Mon–Sat, 10am–6pm IST" },
    { name: "responseTime", label: "Expected response time", type: "text", section: "Contact details", width: "half", placeholder: "Within 24 hours" },
    { name: "address", label: "Registered business address", type: "textarea", section: "Contact details", help: "Leave blank until verified." },
    { name: "businessDisclosure", label: "Business disclosure (footer)", type: "textarea", section: "Contact details", placeholder: "Company name, GSTIN, grievance officer…" },
    {
      name: "socials",
      label: "Social links",
      type: "array",
      section: "Social",
      itemLabel: "platform",
      addLabel: "Add social link",
      help: "Only add channels that are live and maintained.",
      fields: [
        { name: "platform", label: "Platform", type: "select", options: [{ value: "instagram", label: "Instagram" }, { value: "youtube", label: "YouTube" }, { value: "facebook", label: "Facebook" }, { value: "pinterest", label: "Pinterest" }, { value: "x", label: "X / Twitter" }, { value: "linkedin", label: "LinkedIn" }], required: true, width: "half" },
        { name: "url", label: "URL", type: "url", required: true, width: "half" },
      ],
    },
    { name: "newsletterTitle", label: "Footer signup title", type: "text", default: "Join the SVATEH Girls", section: "Footer" },
    { name: "newsletterText", label: "Footer signup text", type: "text", default: "New launches, looks and first access — straight to your inbox.", section: "Footer" },
    { name: "footerNote", label: "Footer line", type: "text", default: "Pamper yourself. The world can wait.", section: "Footer" },
    { name: "seoTitle", label: "Default page title", type: "text", default: "SVATEH — Luxury beauty. Simplified.", section: "Search engines & sharing" },
    { name: "seoDescription", label: "Default description", type: "textarea", default: "Multifunctional makeup made for Indian skin. Pamper yourself. The world can wait.", section: "Search engines & sharing" },
    { name: "ogImage", label: "Social share image", type: "image", section: "Search engines & sharing", help: "1200×630 recommended." },
    { name: "ga4Id", label: "Google Analytics 4 ID", type: "text", section: "Analytics", placeholder: "G-XXXXXXX", width: "half" },
    { name: "metaPixelId", label: "Meta Pixel ID", type: "text", section: "Analytics", width: "half" },
    { name: "cookieNotice", label: "Cookie notice text", type: "text", default: "We use essential cookies to run the store and, with your consent, analytics to improve it.", section: "Analytics" },
  ],
};

export const shipping: Resource = {
  key: "shipping",
  model: "ShippingSettings",
  label: "Shipping & payments",
  singular: "Shipping & payments",
  group: "Settings",
  roles: MANAGERS,
  singleton: true,
  fields: [
    { name: "freeShippingThreshold", label: "Free shipping above (₹)", type: "number", min: 0, default: 999, section: "Standard delivery", width: "third", help: "Blank = never free." },
    { name: "standardFee", label: "Standard delivery fee (₹)", type: "number", min: 0, default: 79, section: "Standard delivery", width: "third" },
    { name: "standardEta", label: "Standard delivery time", type: "text", default: "4–7 business days", section: "Standard delivery", width: "third" },
    { name: "expressEnabled", label: "Offer express delivery", type: "boolean", default: false, section: "Express delivery" },
    { name: "expressFee", label: "Express fee (₹)", type: "number", min: 0, default: 149, section: "Express delivery", width: "half" },
    { name: "expressEta", label: "Express delivery time", type: "text", default: "1–3 business days", section: "Express delivery", width: "half" },
    { name: "serviceability", label: "Where do you deliver?", type: "select", options: [{ value: "all", label: "All Indian PIN codes" }, { value: "list", label: "Only the PIN codes / prefixes listed below" }], default: "all", section: "Serviceable areas" },
    { name: "pincodes", label: "Serviceable PIN codes or prefixes", type: "textarea", section: "Serviceable areas", help: "Comma or line separated. A prefix like 110 covers every PIN starting with 110." },
    { name: "blockedPincodes", label: "Non-serviceable PIN codes or prefixes", type: "textarea", section: "Serviceable areas" },
    { name: "razorpayEnabled", label: "Accept online payments (Razorpay: UPI, cards, netbanking)", type: "boolean", default: true, section: "Payments" },
    { name: "codEnabled", label: "Offer Cash on Delivery", type: "boolean", default: true, section: "Payments" },
    { name: "codFee", label: "COD fee (₹)", type: "number", min: 0, default: 0, section: "Payments", width: "third" },
    { name: "codMinOrder", label: "COD minimum order (₹)", type: "number", min: 0, section: "Payments", width: "third" },
    { name: "codMaxOrder", label: "COD maximum order (₹)", type: "number", min: 0, default: 5000, section: "Payments", width: "third" },
    { name: "codBlockedPincodes", label: "PIN codes / prefixes without COD", type: "textarea", section: "Payments" },
    { name: "dispatchNote", label: "Dispatch note (shown on product pages)", type: "text", default: "Dispatched within 24–48 hours", section: "Messages" },
    { name: "returnsNote", label: "Returns note (shown on product pages)", type: "text", default: "Easy returns on damaged or incorrect products", section: "Messages" },
    { name: "lowStockThreshold", label: "Low-stock alert at", type: "number", min: 0, default: 5, section: "Messages", help: "Dashboard warns when a shade drops to this level." },
  ],
};

export const shadeFinder: Resource = {
  key: "shade-finder",
  model: "ShadeFinderConfig",
  label: "Shade Finder",
  singular: "Shade Finder",
  group: "Merchandising",
  roles: ALL,
  singleton: true,
  description: "Recommendations must use SVATEH’s real shade range. Add one row per skin depth + undertone combination.",
  fields: [
    { name: "enabled", label: "Shade Finder is live", type: "boolean", default: true },
    { name: "title", label: "Title", type: "text", default: "Find your shade" },
    { name: "intro", label: "Intro", type: "textarea", default: "Three quick questions and we’ll match you to your SVATEH shade." },
    {
      name: "matches",
      label: "Shade matches",
      type: "array",
      itemLabel: "shadeName",
      addLabel: "Add match",
      fields: [
        { name: "depth", label: "Skin depth", type: "select", options: SKIN_DEPTHS, required: true, width: "half" },
        { name: "undertone", label: "Undertone", type: "select", options: UNDERTONES, required: true, width: "half" },
        { name: "product", label: "Product", type: "ref", resource: "products", required: true, width: "half" },
        { name: "shadeName", label: "Shade name (must match the product’s shade)", type: "text", required: true, width: "half" },
        { name: "explanation", label: "Why this matches", type: "textarea" },
      ],
    },
    {
      name: "brandMatches",
      label: "Existing foundation matches (optional step)",
      type: "array",
      itemLabel: "brandShade",
      addLabel: "Add brand match",
      fields: [
        { name: "brand", label: "Brand", type: "text", required: true, width: "half" },
        { name: "brandShade", label: "Their shade", type: "text", required: true, width: "half" },
        { name: "product", label: "SVATEH product", type: "ref", resource: "products", required: true, width: "half" },
        { name: "shadeName", label: "SVATEH shade", type: "text", required: true, width: "half" },
        { name: "explanation", label: "Note", type: "text" },
      ],
    },
  ],
};

export const byob: Resource = {
  key: "build-your-bag",
  model: "ByobConfig",
  label: "Build Your Own Bag",
  singular: "Build Your Own Bag",
  group: "Merchandising",
  roles: MANAGERS,
  singleton: true,
  fields: [
    { name: "enabled", label: "Build Your Own Bag is live", type: "boolean", default: false },
    { name: "title", label: "Title", type: "text", default: "Build Your Own SVATEH Bag" },
    { name: "intro", label: "Intro", type: "textarea", default: "Choose a face, cheek and lip favourite — we’ll bag them together." },
    { name: "image", label: "Image", type: "image" },
    {
      name: "steps",
      label: "Steps",
      type: "array",
      itemLabel: "label",
      addLabel: "Add step",
      fields: [
        { name: "label", label: "Step label", type: "text", required: true, placeholder: "Choose your face product" },
        { name: "help", label: "Help text", type: "text" },
        { name: "products", label: "Eligible products", type: "ref", resource: "products", multiple: true },
      ],
    },
    { name: "discountType", label: "Saving", type: "select", options: [{ value: "none", label: "No discount" }, { value: "percent", label: "Percentage off" }, { value: "flat", label: "Flat ₹ off" }], default: "none", width: "half", help: "Check margins before adding a discount." },
    { name: "discountValue", label: "Saving value", type: "number", min: 0, default: 0, width: "half" },
  ],
};

export const RESOURCES: Resource[] = [
  products,
  categories,
  moods,
  routines,
  bundles,
  shadeFinder,
  byob,
  homeSections,
  pages,
  faqs,
  community,
  reviews,
  coupons,
  contactMessages,
  subscribers,
  settings,
  shipping,
];

export const RESOURCE_MAP: Record<string, Resource> = Object.fromEntries(RESOURCES.map((r) => [r.key, r]));

export const getResource = (key: string) => RESOURCE_MAP[key];

export const canEdit = (r: Resource, role: Role) => r.roles.includes(role);
