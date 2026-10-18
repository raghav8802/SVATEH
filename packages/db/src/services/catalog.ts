import { Types } from "mongoose";
import { connectDB } from "../connect";
import {
  Bundle,
  ByobConfig,
  Category,
  CommunityPost,
  Faq,
  HomeSection,
  Mood,
  Page,
  Product,
  Review,
  Routine,
  ShadeFinderConfig,
} from "../models";
import { escapeRegex, isObjectId, plain } from "./util";

export type VariantCard = { _id: string; name: string; sku: string; hex: string; price: number; inStock: boolean; stock: number; image: string; description: string; depth: string; undertone: string };

export type ProductCard = {
  _id: string;
  name: string;
  slug: string;
  productType: string;
  tagline: string;
  price: number;
  compareAtPrice: number | null;
  size: string;
  images: string[];
  badges: string[];
  finish: string;
  coverage: string;
  category: { _id: string; name: string; slug: string } | null;
  variants: VariantCard[];
  inStock: boolean;
  rating: { average: number; count: number };
  createdAt: string;
};

const PUBLISHED = { status: "published" };

function toVariant(p: any, v: any): VariantCard {
  return {
    _id: String(v._id),
    name: v.name,
    sku: v.sku,
    hex: v.hex || "",
    price: v.price ?? p.price,
    stock: v.stock ?? 0,
    inStock: v.active !== false && (v.stock ?? 0) > 0,
    image: v.image || "",
    description: v.description || "",
    depth: v.depth || "",
    undertone: v.undertone || "",
  };
}

export async function ratingSummaries(productIds: string[]) {
  if (!productIds.length) return new Map<string, { average: number; count: number }>();
  const rows = await Review.aggregate([
    { $match: { status: "approved", product: { $in: productIds.map((id) => new Types.ObjectId(id)) } } },
    { $group: { _id: "$product", average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r: any) => [String(r._id), { average: Math.round(r.average * 10) / 10, count: r.count }]));
}

async function toCards(docs: any[]): Promise<ProductCard[]> {
  const ratings = await ratingSummaries(docs.map((d) => String(d._id)));
  return plain(
    docs.map((p) => {
      const variants = (p.variants ?? []).filter((v: any) => v.active !== false).map((v: any) => toVariant(p, v));
      return {
        _id: String(p._id),
        name: p.name,
        slug: p.slug,
        productType: p.productType ?? "",
        tagline: p.tagline ?? "",
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        size: p.size ?? "",
        images: p.images ?? [],
        badges: p.badges ?? [],
        finish: p.finish ?? "",
        coverage: p.coverage ?? "",
        category: p.category && typeof p.category === "object" && p.category.name ? { _id: String(p.category._id), name: p.category.name, slug: p.category.slug } : null,
        variants,
        inStock: variants.some((v: VariantCard) => v.inStock),
        rating: ratings.get(String(p._id)) ?? { average: 0, count: 0 },
        createdAt: p.createdAt,
      } satisfies ProductCard;
    }),
  );
}

export type ProductQuery = {
  category?: string;
  ids?: string[];
  featured?: boolean;
  bestseller?: boolean;
  newArrivals?: boolean;
  finish?: string;
  coverage?: string;
  shade?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "newest" | "name";
  q?: string;
  limit?: number;
};

export async function listProducts(query: ProductQuery = {}): Promise<ProductCard[]> {
  await connectDB();
  const filter: Record<string, any> = { ...PUBLISHED };
  if (query.category) {
    const cat = await Category.findOne({ slug: query.category }).lean<any>();
    if (!cat) return [];
    filter.category = cat._id;
  }
  if (query.ids) filter._id = { $in: query.ids.filter(isObjectId) };
  if (query.featured) filter.featured = true;
  const and: Record<string, any>[] = [];
  if (query.bestseller) and.push({ $or: [{ isBestseller: true }, { badges: "bestseller" }] });
  if (query.finish) filter.finish = query.finish;
  if (query.coverage) filter.coverage = query.coverage;
  if (query.shade) filter["variants.name"] = new RegExp(escapeRegex(query.shade), "i");
  if (query.minPrice != null || query.maxPrice != null) {
    filter.price = {};
    if (query.minPrice != null) filter.price.$gte = query.minPrice;
    if (query.maxPrice != null) filter.price.$lte = query.maxPrice;
  }
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q.trim()), "i");
    const cats = await Category.find({ name: rx }).select("_id").lean();
    and.push({ $or: [{ name: rx }, { tagline: rx }, { productType: rx }, { "variants.name": rx }, { category: { $in: cats.map((c: any) => c._id) } }] });
  }
  if (and.length) filter.$and = and;
  const sorts: Record<string, Record<string, 1 | -1>> = {
    featured: { sortOrder: 1, createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    newest: { launchDate: -1, createdAt: -1 },
    name: { name: 1 },
  };
  const sort = query.newArrivals ? sorts.newest! : sorts[query.sort ?? "featured"]!;
  let q = Product.find(filter).sort(sort).populate("category", "name slug");
  if (query.limit) q = q.limit(query.limit);
  const docs = await q.lean();
  const cards = await toCards(docs);
  if (query.ids && !query.sort) {
    const order = new Map(query.ids.map((id, i) => [id, i]));
    cards.sort((a, b) => (order.get(a._id) ?? 0) - (order.get(b._id) ?? 0));
  }
  return cards;
}

export async function productFacets() {
  await connectDB();
  const [finishes, coverages] = await Promise.all([Product.distinct("finish", PUBLISHED), Product.distinct("coverage", PUBLISHED)]);
  return { finishes: finishes.filter(Boolean) as string[], coverages: coverages.filter(Boolean) as string[] };
}

/** Categories that have at least one published product (avoids empty menu items). */
export async function listCategories() {
  await connectDB();
  const [cats, counts] = await Promise.all([
    Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
    Product.aggregate([{ $match: PUBLISHED }, { $group: { _id: "$category", n: { $sum: 1 } } }]),
  ]);
  const map = new Map(counts.map((c: any) => [String(c._id), c.n as number]));
  return plain(
    cats
      .map((c: any) => ({ _id: String(c._id), name: c.name, slug: c.slug, intro: c.intro, image: c.image, showInMenu: c.showInMenu, seoTitle: c.seoTitle, seoDescription: c.seoDescription, count: map.get(String(c._id)) ?? 0 }))
      .filter((c) => c.count > 0),
  );
}

export async function getProductDetail(slug: string) {
  await connectDB();
  const doc = await Product.findOne({ slug, ...PUBLISHED }).populate("category", "name slug").lean<any>();
  if (!doc) return null;
  const [card] = await toCards([doc]);
  let related = doc.related?.length ? await listProducts({ ids: doc.related.map(String) }) : [];
  if (!related.length && doc.category) {
    related = (await listProducts({ category: (doc.category as any).slug, limit: 5 })).filter((p) => p._id !== card!._id).slice(0, 4);
  }
  const routines = await Routine.find({ active: true, "steps.product": doc._id }).select("name slug summary").limit(3).lean();
  const moods = await Mood.find({ active: true, products: doc._id }).select("name slug tagline color").limit(5).lean();
  return plain({
    ...card!,
    description: doc.description ?? "",
    benefits: doc.benefits ?? [],
    texture: doc.texture ?? "",
    howToUse: doc.howToUse ?? [],
    ingredients: doc.ingredients ?? "",
    shadeGuide: doc.shadeGuide ?? "",
    faqs: doc.faqs ?? [],
    seoTitle: doc.seoTitle ?? "",
    seoDescription: doc.seoDescription ?? "",
    related,
    routines,
    moods,
  });
}
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductDetail>>>;

export async function allProductSlugs() {
  await connectDB();
  return plain(await Product.find(PUBLISHED).select("slug updatedAt").lean());
}

/* ---------------- Reviews ---------------- */

export async function listReviews(opts: { productId?: string; rating?: number; shade?: string; limit?: number; skip?: number; withPhotos?: boolean } = {}) {
  await connectDB();
  const filter: Record<string, any> = { status: "approved" };
  if (opts.productId && isObjectId(opts.productId)) filter.product = opts.productId;
  if (opts.rating) filter.rating = opts.rating;
  if (opts.shade) filter.shade = opts.shade;
  if (opts.withPhotos) filter["images.0"] = { $exists: true };
  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(opts.skip ?? 0)
      .limit(opts.limit ?? 20)
      .populate("product", "name slug images")
      .select("-email")
      .lean(),
    Review.countDocuments(filter),
  ]);
  return plain({ items, total });
}

export async function reviewStats(productId?: string) {
  await connectDB();
  const match: Record<string, any> = { status: "approved" };
  if (productId && isObjectId(productId)) match.product = new Types.ObjectId(productId);
  const rows = await Review.aggregate([{ $match: match }, { $group: { _id: "$rating", n: { $sum: 1 } } }]);
  const dist = [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: rows.find((x: any) => x._id === r)?.n ?? 0 }));
  const count = dist.reduce((s, d) => s + d.count, 0);
  const average = count ? Math.round((dist.reduce((s, d) => s + d.rating * d.count, 0) / count) * 10) / 10 : 0;
  return { count, average, dist };
}

/* ---------------- Merchandising ---------------- */

export async function listMoods() {
  await connectDB();
  return plain(await Mood.find({ active: true }).sort({ sortOrder: 1 }).select("name slug tagline color image").lean());
}

export async function getMood(slug: string) {
  await connectDB();
  const m = await Mood.findOne({ slug, active: true }).lean<any>();
  if (!m) return null;
  const stepIds = (m.steps ?? []).map((s: any) => s.product).filter(Boolean).map(String);
  const ids = [...new Set([...(m.products ?? []).map(String), ...stepIds])];
  const products = await listProducts({ ids });
  const bundle = m.bundle ? await getBundleById(String(m.bundle)) : null;
  return plain({ ...m, products, bundle, steps: (m.steps ?? []).map((s: any) => ({ ...s, product: products.find((p) => p._id === String(s.product)) ?? null })) });
}

export async function listRoutines() {
  await connectDB();
  const rs = await Routine.find({ active: true }).sort({ sortOrder: 1 }).lean<any[]>();
  const ids = [...new Set(rs.flatMap((r) => (r.steps ?? []).map((s: any) => String(s.product))))];
  const products = await listProducts({ ids });
  return plain(
    rs.map((r) => {
      const steps = (r.steps ?? []).map((s: any) => ({ ...s, product: products.find((p) => p._id === String(s.product)) ?? null })).filter((s: any) => s.product);
      return { ...r, steps, total: steps.reduce((sum: number, s: any) => sum + s.product.price, 0) };
    }),
  );
}

async function bundleView(b: any) {
  const ids = (b.items ?? []).map((i: any) => String(i.product));
  const products = await listProducts({ ids });
  const items = (b.items ?? [])
    .map((i: any) => ({ quantity: i.quantity || 1, product: products.find((p) => p._id === String(i.product)) ?? null }))
    .filter((i: any) => i.product);
  const individualTotal = items.reduce((s: number, i: any) => s + i.product.price * i.quantity, 0);
  const available = items.length === (b.items ?? []).length && items.every((i: any) => i.product.inStock);
  return { ...b, items, individualTotal, savings: Math.max(0, individualTotal - b.price), available };
}

export async function listBundles() {
  await connectDB();
  const bs = await Bundle.find({ active: true }).sort({ sortOrder: 1 }).lean<any[]>();
  return plain(await Promise.all(bs.map(bundleView)));
}

export async function getBundle(slug: string) {
  await connectDB();
  const b = await Bundle.findOne({ slug, active: true }).lean();
  return b ? plain(await bundleView(b)) : null;
}

async function getBundleById(id: string) {
  const b = await Bundle.findOne({ _id: id, active: true }).lean();
  return b ? bundleView(b) : null;
}

export async function getByob() {
  await connectDB();
  const cfg = await ByobConfig.findOne().lean<any>();
  if (!cfg?.enabled) return null;
  const ids = [...new Set((cfg.steps ?? []).flatMap((s: any) => (s.products ?? []).map(String)))] as string[];
  const products = await listProducts({ ids });
  return plain({
    ...cfg,
    steps: (cfg.steps ?? []).map((s: any) => ({ ...s, products: (s.products ?? []).map((id: any) => products.find((p) => p._id === String(id))).filter(Boolean) })),
  });
}

export async function getShadeFinder() {
  await connectDB();
  const cfg = await ShadeFinderConfig.findOne().lean<any>();
  if (!cfg || cfg.enabled === false) return null;
  const ids = [...new Set([...(cfg.matches ?? []), ...(cfg.brandMatches ?? [])].map((m: any) => String(m.product)))];
  const products = await listProducts({ ids });
  const attach = (m: any) => ({ ...m, product: products.find((p) => p._id === String(m.product)) ?? null });
  return plain({
    title: cfg.title,
    intro: cfg.intro,
    matches: (cfg.matches ?? []).map(attach).filter((m: any) => m.product),
    brandMatches: (cfg.brandMatches ?? []).map(attach).filter((m: any) => m.product),
  });
}

/* ---------------- Content ---------------- */

export async function getHomeSections() {
  await connectDB();
  return plain(await HomeSection.find({ enabled: true }).sort({ sortOrder: 1 }).lean<any[]>());
}

export async function getPage(slug: string) {
  await connectDB();
  return plain(await Page.findOne({ slug, published: true }).lean<any>());
}

export async function listPages() {
  await connectDB();
  return plain(await Page.find({ published: true }).select("title slug updatedAt").lean());
}

export async function listFaqs() {
  await connectDB();
  return plain(await Faq.find({ published: true }).sort({ category: 1, sortOrder: 1 }).lean<any[]>());
}

export async function listCommunity(limit = 60) {
  await connectDB();
  const posts = await CommunityPost.find({ status: "published", permissionConfirmed: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(limit).lean<any[]>();
  const ids = [...new Set(posts.flatMap((p) => (p.products ?? []).map(String)))];
  const products = ids.length ? await listProducts({ ids }) : [];
  return plain(posts.map((p) => ({ ...p, products: (p.products ?? []).map((id: any) => products.find((x) => x._id === String(id))).filter(Boolean) })));
}
