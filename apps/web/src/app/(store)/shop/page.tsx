import type { Metadata } from "next";
import { Catalog, parseQuery, type SearchParams } from "@/components/store/Catalog";
import { getSettings } from "@svateh/db";

export const metadata: Metadata = { title: "Shop all", description: "Your everyday essentials, thoughtfully chosen." };

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const s = await getSettings();
  return <Catalog eyebrow={`The ${s.brandName} Edit`} title="The Edit" intro="Your everyday essentials, thoughtfully chosen." query={parseQuery(await searchParams)} />;
}
