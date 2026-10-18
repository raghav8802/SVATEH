import type { Metadata } from "next";
import Link from "next/link";
import { listCategories, listProducts } from "@svateh/db";
import { ProductGrid } from "@/components/store/ProductCard";
import { PageHero } from "@/components/store/ui";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const [results, cats, suggestions] = await Promise.all([q ? listProducts({ q }) : [], listCategories(), listProducts({ featured: true, limit: 3 })]);
  return (
    <>
      <PageHero eyebrow="Search" title={q ? `“${q}”` : "Search"} intro={q ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Search by product, category or shade."} tone="cream" />
      <section className="container-x pb-20">
        <form action="/search" className="mb-10 flex max-w-xl gap-2">
          <input name="q" defaultValue={q} placeholder="Search products, shades or categories" className="field rounded-full" aria-label="Search" />
          <button className="btn-plum">Search</button>
        </form>
        {results.length ? (
          <ProductGrid products={results} tone="white" />
        ) : q ? (
          <div className="space-y-10">
            <div>
              <p className="font-display text-3xl">No matches for “{q}”.</p>
              <p className="mt-2 text-sm text-ink/70">Check the spelling, try a shade name like “nude” or “berry”, or browse a category:</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {cats.map((c) => (
                  <Link key={c.slug} href={`/shop/${c.slug}`} className="rounded-full border border-ink/20 px-5 py-2.5 text-[11px] tracking-[0.16em] uppercase hover:border-violet">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            {suggestions.length ? (
              <div>
                <p className="eyebrow mb-5 !text-violet">You might like</p>
                <ProductGrid products={suggestions} tone="white" />
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
