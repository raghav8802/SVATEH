import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@svateh/core";
import { listProducts, listReviews, reviewStats } from "@svateh/db";
import { EmptyState, PageHero, Stars } from "@/components/store/ui";

export const metadata: Metadata = { title: "Reviews", description: "Honest reviews from verified customers." };

type SP = Promise<{ product?: string; rating?: string; photos?: string; page?: string }>;

export default async function ReviewsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [stats, { items, total }, products] = await Promise.all([
    reviewStats(sp.product),
    listReviews({ productId: sp.product, rating: Number(sp.rating) || undefined, withPhotos: sp.photos === "1", limit: 20, skip: (page - 1) * 20 }),
    listProducts(),
  ]);
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, page: undefined, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/reviews${p.toString() ? `?${p}` : ""}`;
  };
  const chip = (active: boolean) => `shrink-0 rounded-full px-4 py-2 text-xs ${active ? "bg-plum text-white" : "border border-ink/20 hover:border-violet"}`;
  return (
    <>
      <PageHero eyebrow="Reviews" title="In their words." intro={stats.count ? `${stats.average.toFixed(1)} out of 5 from ${stats.count} genuine review${stats.count === 1 ? "" : "s"}.` : "Honest feedback from our customers will appear here."} tone="cream" />
      <section className="container-x pb-20">
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
          <Link href={qs({ product: undefined })} className={chip(!sp.product)}>All products</Link>
          {products.map((p) => (
            <Link key={p._id} href={qs({ product: p._id })} className={chip(sp.product === p._id)}>
              {p.name}
            </Link>
          ))}
        </div>
        <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto">
          {[5, 4, 3, 2, 1].map((r) => (
            <Link key={r} href={qs({ rating: sp.rating === String(r) ? undefined : String(r) })} className={chip(sp.rating === String(r))}>
              {r}★
            </Link>
          ))}
          <Link href={qs({ photos: sp.photos === "1" ? undefined : "1" })} className={chip(sp.photos === "1")}>With photos</Link>
        </div>
        {items.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((r: any) => (
              <article key={r._id} className="bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  <span className="text-[11px] text-ink/55">{formatDate(r.createdAt)}</span>
                </div>
                <h2 className="mt-3 font-display text-xl">{r.title}</h2>
                <p className="mt-2 text-sm whitespace-pre-line text-ink/80">{r.body}</p>
                {r.images?.length ? (
                  <div className="mt-3 flex gap-2">
                    {r.images.map((src: string) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt={`Photo from ${r.name}`} className="h-20 w-20 rounded-lg object-cover" loading="lazy" />
                    ))}
                  </div>
                ) : null}
                <p className="mt-4 text-xs text-ink/60">
                  {r.name}
                  {r.verified ? " · Verified purchase" : ""}
                  {r.shade ? ` · ${r.shade}` : ""}
                  {r.product ? (
                    <>
                      {" · "}
                      <Link href={`/products/${r.product.slug}`} className="text-violet underline">
                        Shop {r.product.name}
                      </Link>
                    </>
                  ) : null}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No reviews yet" text="We only publish genuine reviews from real customers. Check back soon." cta={{ label: "Shop the edit", href: "/shop" }} />
        )}
        {total > page * 20 ? (
          <div className="mt-10 text-center">
            <Link href={qs({ page: String(page + 1) })} className="btn-outline !border-ink/30">
              Load more
            </Link>
          </div>
        ) : null}
      </section>
    </>
  );
}
