import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listCategories } from "@svateh/db";
import { Catalog, parseQuery, type SearchParams } from "@/components/store/Catalog";

type Props = { params: Promise<{ category: string }>; searchParams: SearchParams };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = (await listCategories()).find((x) => x.slug === category);
  return c ? { title: c.seoTitle || c.name, description: c.seoDescription || c.intro } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const c = (await listCategories()).find((x) => x.slug === category);
  if (!c) notFound();
  return <Catalog eyebrow="Shop" title={c.name} intro={c.intro} activeCategory={c.slug} query={{ ...parseQuery(await searchParams), category: c.slug }} />;
}
