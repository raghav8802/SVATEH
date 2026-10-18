import { finalizeQuote, round2, type CartInput, type Quote, type QuoteItem, type QuoteLine } from "@svateh/core";
import { connectDB } from "../connect";
import { Bundle, ByobConfig, Coupon, Product } from "../models";
import { getShipping } from "./singletons";
import { isObjectId } from "./util";

type ProductDoc = { _id: any; name: string; slug: string; price: number; images?: string[]; status: string; variants: any[] };

function variantItem(p: ProductDoc, sku: string, qty: number): { item?: QuoteItem; error?: string; stock: number } {
  const v = p.variants?.find((x) => x.sku === sku && x.active !== false);
  if (!v) return { error: `${p.name}: this shade is no longer available.`, stock: 0 };
  return {
    stock: v.stock ?? 0,
    item: {
      productId: String(p._id),
      sku: v.sku,
      name: p.name,
      slug: p.slug,
      variantName: v.name,
      hex: v.hex || undefined,
      image: v.image || p.images?.[0] || undefined,
      unitPrice: v.price ?? p.price,
      qty,
    },
  };
}

/**
 * Prices a cart entirely on the server from the database — the browser
 * only ever sends product/shade ids and quantities.
 */
export async function priceCart(input: CartInput): Promise<Quote> {
  await connectDB();
  const productIds = new Set<string>();
  const bundleIds = new Set<string>();
  for (const l of input.lines) {
    if (l.kind === "product") productIds.add(l.productId);
    else {
      l.selections.forEach((s) => productIds.add(s.productId));
      if (l.kind === "bundle") bundleIds.add(l.bundleId);
    }
  }
  const [products, bundles, byob, shipping, coupon] = await Promise.all([
    Product.find({ _id: { $in: [...productIds].filter(isObjectId) }, status: "published" }).lean<ProductDoc[]>(),
    Bundle.find({ _id: { $in: [...bundleIds].filter(isObjectId) }, active: true }).lean<any[]>(),
    input.lines.some((l) => l.kind === "byob") ? ByobConfig.findOne().lean<any>() : null,
    getShipping(),
    input.couponCode ? Coupon.findOne({ code: input.couponCode.toUpperCase() }).lean<any>() : null,
  ]);
  const pmap = new Map(products.map((p) => [String(p._id), p]));
  const lines: QuoteLine[] = [];
  const used = new Map<string, number>(); // sku -> qty across the cart

  const reserve = (item: QuoteItem, stock: number) => {
    const total = (used.get(item.sku) ?? 0) + item.qty;
    used.set(item.sku, total);
    if (total > stock) return stock > 0 ? `${item.name} (${item.variantName}): only ${stock} left.` : `${item.name} (${item.variantName}) is out of stock.`;
    return undefined;
  };

  for (const l of input.lines) {
    if (l.kind === "product") {
      const p = pmap.get(l.productId);
      const key = `p:${l.sku}`;
      if (!p) {
        lines.push({ key, kind: "product", title: "Unavailable product", qty: l.qty, unitPrice: 0, lineTotal: 0, items: [], error: "This product is no longer available." });
        continue;
      }
      const { item, error, stock } = variantItem(p, l.sku, l.qty);
      const err = error ?? (item ? reserve(item, stock) : undefined);
      lines.push({
        key,
        kind: "product",
        title: p.name,
        subtitle: item?.variantName,
        href: `/products/${p.slug}`,
        image: item?.image,
        qty: l.qty,
        unitPrice: item?.unitPrice ?? 0,
        lineTotal: err ? 0 : round2((item?.unitPrice ?? 0) * l.qty),
        items: item ? [item] : [],
        error: err,
      });
      continue;
    }

    if (l.kind === "bundle") {
      const b = bundles.find((x) => String(x._id) === l.bundleId);
      const key = `b:${l.bundleId}:${l.selections.map((s) => s.sku).join(",")}`;
      if (!b) {
        lines.push({ key, kind: "bundle", title: "Unavailable bundle", qty: l.qty, unitPrice: 0, lineTotal: 0, items: [], error: "This bundle is no longer available." });
        continue;
      }
      const items: QuoteItem[] = [];
      let error: string | undefined;
      let compareAt = 0;
      for (const bi of b.items ?? []) {
        const p = pmap.get(String(bi.product));
        const sel = l.selections.find((s) => s.productId === String(bi.product));
        if (!p || !sel) {
          error = "Choose a shade for every product in this bundle.";
          continue;
        }
        const r = variantItem(p, sel.sku, (bi.quantity || 1) * l.qty);
        if (r.error || !r.item) {
          error = r.error;
          continue;
        }
        compareAt += r.item.unitPrice * (bi.quantity || 1);
        error = reserve(r.item, r.stock) ?? error;
        items.push(r.item);
      }
      lines.push({
        key,
        kind: "bundle",
        bundleId: String(b._id),
        title: b.name,
        subtitle: items.map((i) => `${i.name} — ${i.variantName}`).join(" · "),
        href: `/bundles/${b.slug}`,
        image: b.images?.[0] ?? items[0]?.image,
        qty: l.qty,
        unitPrice: b.price,
        compareAt: round2(compareAt),
        lineTotal: error ? 0 : round2(b.price * l.qty),
        items,
        error,
      });
      continue;
    }

    // Build Your Own Bag
    const key = `y:${l.selections.map((s) => s.sku).join(",")}`;
    if (!byob?.enabled) {
      lines.push({ key, kind: "byob", title: "Build Your Own Bag", qty: l.qty, unitPrice: 0, lineTotal: 0, items: [], error: "Build Your Own Bag is not available right now." });
      continue;
    }
    const steps: any[] = byob.steps ?? [];
    const items: QuoteItem[] = [];
    let error: string | undefined = l.selections.length !== steps.length ? "Choose one product for every step." : undefined;
    l.selections.forEach((sel, i) => {
      const eligible = (steps[i]?.products ?? []).map(String);
      const p = pmap.get(sel.productId);
      if (!p || !eligible.includes(sel.productId)) {
        error = "One of the products you picked isn’t eligible for this step.";
        return;
      }
      const r = variantItem(p, sel.sku, l.qty);
      if (r.error || !r.item) {
        error = r.error;
        return;
      }
      error = reserve(r.item, r.stock) ?? error;
      items.push(r.item);
    });
    const full = round2(items.reduce((s, i) => s + i.unitPrice, 0));
    let price = full;
    if (byob.discountType === "percent") price = Math.round(full * (1 - (byob.discountValue ?? 0) / 100));
    if (byob.discountType === "flat") price = round2(Math.max(0, full - (byob.discountValue ?? 0)));
    lines.push({
      key,
      kind: "byob",
      title: byob.title || "Build Your Own Bag",
      subtitle: items.map((i) => `${i.name} — ${i.variantName}`).join(" · "),
      href: "/bundles/build-your-own",
      image: byob.image || items[0]?.image,
      qty: l.qty,
      unitPrice: price,
      compareAt: full,
      lineTotal: error ? 0 : round2(price * l.qty),
      items,
      error,
    });
  }

  return finalizeQuote({
    lines,
    cfg: shipping,
    coupon,
    couponCode: input.couponCode || undefined,
    pincode: input.pincode || undefined,
    deliveryOption: input.deliveryOption,
    paymentMethod: input.paymentMethod,
  });
}
