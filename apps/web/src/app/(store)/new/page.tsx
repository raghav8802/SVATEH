import type { Metadata } from "next";
import { Catalog, parseQuery, type SearchParams } from "@/components/store/Catalog";

export const metadata: Metadata = { title: "New arrivals", description: "The latest launches." };

export default async function NewPage({ searchParams }: { searchParams: SearchParams }) {
  return <Catalog eyebrow="Just landed" title="New Arrivals" intro="Our latest launches — first look, first access." query={{ ...parseQuery(await searchParams), newArrivals: true }} showCategoryTabs={false} />;
}
