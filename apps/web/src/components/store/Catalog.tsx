import Link from "next/link";
import { Suspense } from "react";
import { listBundles, listCategories, listProducts, listRoutines, productFacets, type ProductQuery } from "@svateh/db";
import { formatINR } from "@svateh/core";
import { ProductGrid } from "./ProductCard";
import { ShopFilters } from "./ShopFilters";
import { EmptyState, PageHero } from "./ui";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseQuery(sp: Record<string, string | string[] | undefined>): ProductQuery {
  const [min, max] = one(sp.price).split("-");
  return {
    finish: one(sp.finish) || undefined,
    coverage: one(sp.coverage) || undefined,
    shade: one(sp.shade) || undefined,
    sort: (one(sp.sort) as ProductQuery["sort"]) || undefined,
    minPrice: min ? Number(min) : undefined,
    maxPrice: max ? Number(max) : undefined,
  };
}

export async function Catalog({
  eyebrow,
  title,
  intro,
  query,
  activeCategory,
  showCategoryTabs = true,
  emptyText,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  query: ProductQuery;
  activeCategory?: string;
  showCategoryTabs?: boolean;
  emptyText?: string;
}) {
  const [products, categories, facets, routines, bundles] = await Promise.all([listProducts(query), listCategories(), productFacets(), listRoutines(), listBundles()]);
  const routine = routines[0];
  const bundle = bundles.find((b: any) => b.available) ?? bundles[0];
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} tone="cream" />
      <section className="bg-cream pb-20">
        <div className="container-x">
          {showCategoryTabs && categories.length > 1 ? (
            <nav className="no-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0" aria-label="Categories">
              <Link href="/shop" className={`shrink-0 rounded-full px-5 py-2.5 text-[11px] tracking-[0.16em] uppercase ${!activeCategory ? "bg-plum text-white" : "border border-ink/20 hover:border-violet"}`}>
                All
              </Link>
              {categories.map((c) => (
                <Link key={c.slug} href={`/shop/${c.slug}`} className={`shrink-0 rounded-full px-5 py-2.5 text-[11px] tracking-[0.16em] uppercase ${activeCategory === c.slug ? "bg-plum text-white" : "border border-ink/20 hover:border-violet"}`}>
                  {c.name}
                </Link>
              ))}
            </nav>
          ) : null}
          <Suspense>
            <ShopFilters finishes={facets.finishes} coverages={facets.coverages} count={products.length} />
          </Suspense>
          <div className="pt-8">
            {products.length ? <ProductGrid products={products} tone="white" /> : <EmptyState title="Nothing here yet" text={emptyText ?? "Try clearing the filters or browse the full edit."} cta={{ label: "Shop all", href: "/shop" }} />}
          </div>
        </div>
      </section>
      {routine || bundle ? (
        <section className="bg-white py-16">
          <div className="container-x grid gap-4 md:grid-cols-2">
            {routine ? (
              <Link href="/routines" className="group flex flex-col justify-between bg-violet p-8 text-white sm:p-10">
                <p className="eyebrow">Shop the routine</p>
                <p className="mt-6 font-display text-4xl">{routine.name}</p>
                <p className="mt-2 text-sm text-white/75">{routine.steps.map((s: any) => s.title).join(" → ")}</p>
                <span className="mt-8 text-[10px] tracking-[0.2em] text-blush uppercase group-hover:underline">Build the look →</span>
              </Link>
            ) : null}
            {bundle ? (
              <Link href={`/bundles/${bundle.slug}`} className="group flex flex-col justify-between bg-blush p-8 text-plum sm:p-10">
                <p className="eyebrow !text-plum">Bundle & save</p>
                <p className="mt-6 font-display text-4xl">{bundle.name}</p>
                <p className="mt-2 text-sm">
                  {formatINR(bundle.price)}
                  {bundle.savings > 0 ? ` · save ${formatINR(bundle.savings)}` : ""}
                </p>
                <span className="mt-8 text-[10px] tracking-[0.2em] uppercase group-hover:underline">See what’s inside →</span>
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
