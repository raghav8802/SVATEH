import type { Metadata } from "next";
import Link from "next/link";
import { formatINR } from "@svateh/core";
import { getByob, listBundles } from "@svateh/db";
import { ProductVisual } from "@/components/store/ProductVisual";
import { EmptyState, PageHero } from "@/components/store/ui";

export const metadata: Metadata = { title: "Bundles & sets", description: "Curated sets that make choosing easy — or build your own bag." };

export default async function BundlesPage() {
  const [bundles, byob] = await Promise.all([listBundles(), getByob()]);
  return (
    <>
      <PageHero eyebrow="Bundles" title={"Curated sets,\nmade easy."} intro="Everything you need for a look, chosen to work together." />
      <section className="bg-cream py-16">
        <div className="container-x">
          {bundles.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bundles.map((b: any) => (
                <Link key={b._id} href={`/bundles/${b.slug}`} className="group flex flex-col bg-white">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <ProductVisual name={b.name} image={b.images?.[0]} className="absolute inset-0 transition duration-500 group-hover:scale-[1.02]" />
                    {b.savings > 0 ? <span className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-plum uppercase">Save {formatINR(b.savings)}</span> : null}
                    {b.isGift ? <span className="absolute top-3 right-3 rounded-full bg-white px-3 py-1 text-[10px] tracking-[0.14em] text-violet uppercase">Gift set</span> : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-display text-3xl">{b.name}</h2>
                    <p className="mt-1 text-xs text-ink/60">{b.items.map((i: any) => i.product.name).join(" + ")}</p>
                    <p className="mt-auto pt-5 text-lg">
                      {formatINR(b.price)} {b.savings > 0 ? <s className="ml-2 text-sm text-ink/45">{formatINR(b.individualTotal)}</s> : null}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Bundles are coming soon" />
          )}
        </div>
      </section>
      {byob ? (
        <section className="bg-violet py-16 text-white">
          <div className="container-x flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="eyebrow">Build your own</p>
              <p className="display mt-3 text-[clamp(40px,5vw,72px)]">{byob.title}</p>
              <p className="mt-3 max-w-md text-sm text-white/80">{byob.intro}</p>
            </div>
            <Link href="/bundles/build-your-own" className="btn-blush">
              Start building
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
