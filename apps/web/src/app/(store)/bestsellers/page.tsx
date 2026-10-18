import type { Metadata } from "next";
import { getSettings, listProducts } from "@svateh/db";
import { Catalog, parseQuery, type SearchParams } from "@/components/store/Catalog";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: s.bestsellersLabel || "Bestsellers" };
}

/**
 * Shows products marked as bestsellers. Until there is genuine sales data (none marked),
 * it shows the full collection under the label set in Site settings (e.g. "New Launches").
 */
export default async function BestsellersPage({ searchParams }: { searchParams: SearchParams }) {
  const s = await getSettings();
  const hasBestsellers = (await listProducts({ bestseller: true, limit: 1 })).length > 0;
  const label = s.bestsellersLabel || "Bestsellers";
  return (
    <Catalog
      eyebrow={hasBestsellers ? "Most loved" : "Meet the collection"}
      title={label}
      intro={hasBestsellers ? "The shades and formulas our community reaches for most." : "Every product in the edit, ready to meet you."}
      query={{ ...parseQuery(await searchParams), bestseller: hasBestsellers }}
      showCategoryTabs={false}
    />
  );
}
