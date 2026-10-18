import type { MetadataRoute } from "next";
import { allProductSlugs, listBundles, listCategories, listMoods, listPages } from "@svateh/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  try {
    const [products, categories, moods, bundles, pages] = await Promise.all([allProductSlugs(), listCategories(), listMoods(), listBundles(), listPages()]);
    const fixed = ["", "/shop", "/new", "/bestsellers", "/moods", "/routines", "/bundles", "/shade-finder", "/community", "/reviews", "/faq", "/contact"];
    return [
      ...fixed.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
      ...products.map((p: any) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.9 })),
      ...categories.map((c) => ({ url: `${base}/shop/${c.slug}`, priority: 0.8 })),
      ...moods.map((m: any) => ({ url: `${base}/moods/${m.slug}`, priority: 0.6 })),
      ...bundles.map((b: any) => ({ url: `${base}/bundles/${b.slug}`, priority: 0.6 })),
      ...pages.map((p: any) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: 0.4 })),
    ];
  } catch {
    return [{ url: base }];
  }
}
