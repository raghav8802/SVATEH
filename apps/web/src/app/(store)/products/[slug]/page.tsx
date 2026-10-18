import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COVERAGES, FINISHES, formatDate, labelOf } from "@svateh/core";
import { getProductDetail, getSettings, getShipping, listFaqs, listReviews, reviewStats } from "@svateh/db";
import { ProductHero } from "@/components/store/BuyBox";
import { ReviewForm } from "@/components/store/forms";
import { ProductGrid } from "@/components/store/ProductCard";
import { Accordion, RichText } from "@/components/store/RichText";
import { Breadcrumbs, Stars } from "@/components/store/ui";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ shade?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductDetail((await params).slug);
  if (!p) return {};
  return {
    title: p.seoTitle || `${p.name} — ${p.productType}`,
    description: p.seoDescription || p.tagline,
    openGraph: { images: p.images[0] ? [p.images[0]] : undefined },
    alternates: { canonical: `/products/${p.slug}` },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const p = await getProductDetail(slug);
  if (!p) notFound();
  const [shipping, settings, stats, reviews, faqs] = await Promise.all([getShipping(), getSettings(), reviewStats(p._id), listReviews({ productId: p._id, limit: 10 }), listFaqs()]);
  const helpFaqs = faqs.filter((f: any) => ["shipping", "returns"].includes(f.category)).slice(0, 3);
  const attrs = [
    p.texture && { k: "Texture", v: p.texture },
    p.finish && { k: "Finish", v: labelOf(FINISHES, p.finish) },
    p.coverage && { k: "Coverage", v: labelOf(COVERAGES, p.coverage) },
    p.size && { k: "Size", v: p.size },
  ].filter(Boolean) as { k: string; v: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.tagline,
    image: p.images,
    brand: { "@type": "Brand", name: settings.brandName },
    sku: p.variants[0]?.sku,
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      name: v.name,
      price: v.price,
      priceCurrency: "INR",
      availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl()}/products/${p.slug}`,
    })),
    ...(stats.count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: stats.average, reviewCount: stats.count } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section className="container-x pt-6 pb-16 sm:pt-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, ...(p.category ? [{ label: p.category.name, href: `/shop/${p.category.slug}` }] : []), { label: p.name }]} />
        </div>
        <ProductHero product={p} dispatchNote={shipping.dispatchNote} returnsNote={shipping.returnsNote} freeShippingThreshold={shipping.freeShippingThreshold} initialShade={(await searchParams).shade} />
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow !text-violet">The details</p>
            <h2 className="display mt-4 text-[clamp(40px,5vw,68px)]">Everything you want to know.</h2>
            {attrs.length ? (
              <dl className="mt-10 grid grid-cols-2 gap-px bg-ink/10">
                {attrs.map((a) => (
                  <div key={a.k} className="bg-white p-5">
                    <dt className="text-[10px] tracking-[0.2em] text-ink/55 uppercase">{a.k}</dt>
                    <dd className="mt-1 font-display text-xl">{a.v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          <div>
            {p.description ? (
              <Accordion title="What it is" defaultOpen>
                <RichText html={p.description} />
              </Accordion>
            ) : null}
            {p.benefits.length ? (
              <Accordion title="Why you’ll love it" defaultOpen>
                <ul className="space-y-3">
                  {p.benefits.map((b: string, i: number) => (
                    <li key={i} className="flex gap-3 text-[15px]">
                      <span className="text-gold">✦</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </Accordion>
            ) : null}
            {p.howToUse.length ? (
              <Accordion title="How to use">
                <ol className="space-y-4">
                  {p.howToUse.map((s: string, i: number) => (
                    <li key={i} className="flex gap-4 text-[15px]">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blush font-display text-sm text-plum">{i + 1}</span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </Accordion>
            ) : null}
            {p.ingredients ? (
              <Accordion title="Ingredients">
                <p className="text-sm leading-relaxed whitespace-pre-line text-ink/80">{p.ingredients}</p>
              </Accordion>
            ) : null}
            {p.variants.length > 1 ? (
              <Accordion title="Find your shade">
                <RichText html={p.shadeGuide} className="mb-5" />
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {p.variants.map((v) => (
                    <li key={v.sku} className="flex items-center gap-3 text-sm">
                      <span className="h-8 w-8 shrink-0 rounded-full border border-ink/10" style={{ background: v.hex || "#eee" }} />
                      <span>
                        {v.name}
                        {v.description ? <span className="block text-[11px] text-ink/55">{v.description}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
                {settings.showShadeFinder ? (
                  <Link href="/shade-finder" className="mt-6 inline-block text-xs tracking-[0.18em] text-violet uppercase underline-offset-4 hover:underline">
                    Not sure? Use the Shade Finder →
                  </Link>
                ) : null}
              </Accordion>
            ) : null}
            {p.faqs.length ? (
              <Accordion title="Product FAQs">
                <dl className="space-y-5">
                  {p.faqs.map((f: any) => (
                    <div key={f._id}>
                      <dt className="font-medium">{f.question}</dt>
                      <dd className="mt-1 text-sm whitespace-pre-line text-ink/75">{f.answer}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
            ) : null}
            <Accordion title="Shipping, returns & help">
              <ul className="space-y-2 text-sm text-ink/80">
                <li>
                  {shipping.standardEta ? `Standard delivery: ${shipping.standardEta}. ` : ""}
                  {shipping.freeShippingThreshold != null ? `Free shipping on orders over ₹${shipping.freeShippingThreshold}.` : ""}
                </li>
                {shipping.codEnabled ? <li>Cash on Delivery available on eligible orders.</li> : null}
              </ul>
              {helpFaqs.map((f: any) => (
                <div key={f._id} className="mt-4">
                  <p className="font-medium">{f.question}</p>
                  <RichText html={f.answer} className="mt-1 !text-sm" />
                </div>
              ))}
              <p className="mt-4 text-sm">
                <Link href="/shipping-policy" className="underline">Shipping policy</Link> · <Link href="/returns-policy" className="underline">Returns</Link> · <Link href="/faq" className="underline">All FAQs</Link>
              </p>
            </Accordion>
          </div>
        </div>
      </section>

      {p.related.length || p.routines.length ? (
        <section className="bg-cream py-16 sm:py-20">
          <div className="container-x">
            <p className="eyebrow !text-violet">Complete your look</p>
            <h2 className="display mt-4 mb-10 text-[clamp(40px,5vw,68px)]">Pairs beautifully with</h2>
            {p.related.length ? <ProductGrid products={p.related.slice(0, 3)} tone="white" /> : null}
            {p.routines.length || p.moods.length ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {p.routines.map((r: any) => (
                  <Link key={r._id} href={`/routines#${r.slug}`} className="rounded-full bg-violet px-5 py-2.5 text-[11px] tracking-[0.16em] text-white uppercase">
                    Routine: {r.name}
                  </Link>
                ))}
                {p.moods.map((m: any) => (
                  <Link key={m._id} href={`/moods/${m.slug}`} className="rounded-full border border-ink/20 px-5 py-2.5 text-[11px] tracking-[0.16em] uppercase hover:border-violet">
                    {m.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section id="reviews" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow !text-violet">Real reviews</p>
            <h2 className="display mt-4 text-[clamp(40px,5vw,68px)]">{stats.count ? stats.average.toFixed(1) : "Be the first"}</h2>
            {stats.count ? (
              <>
                <Stars value={stats.average} size={16} className="mt-3" />
                <p className="mt-2 text-sm text-ink/60">
                  Based on {stats.count} review{stats.count === 1 ? "" : "s"}
                </p>
                <ul className="mt-6 space-y-1.5">
                  {stats.dist.map((d) => (
                    <li key={d.rating} className="flex items-center gap-3 text-xs">
                      <span className="w-6">{d.rating}★</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                        <span className="block h-full bg-gold" style={{ width: `${(d.count / stats.count) * 100}%` }} />
                      </span>
                      <span className="w-6 text-right text-ink/60">{d.count}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-sm text-ink/70">No reviews yet. Tried {p.name}? We’d love your honest thoughts.</p>
            )}
            <div className="mt-8">
              <ReviewForm productId={p._id} productName={p.name} shades={p.variants.map((v) => v.name)} />
            </div>
          </div>
          <div className="divide-y divide-ink/10">
            {reviews.items.map((r: any) => (
              <article key={r._id} className="py-6 first:pt-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Stars value={r.rating} />
                  <span className="text-xs text-ink/60">
                    {r.name}
                    {r.verified ? " · Verified purchase" : ""}
                    {r.shade ? ` · ${r.shade}` : ""} · {formatDate(r.createdAt)}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink/80">{r.body}</p>
                {r.images?.length ? (
                  <div className="mt-3 flex gap-2">
                    {r.images.map((src: string) => (
                      <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block h-20 w-20 overflow-hidden rounded-lg bg-cream">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Photo from ${r.name}`} className="h-full w-full object-cover" loading="lazy" />
                      </a>
                    ))}
                  </div>
                ) : null}
                {r.reply ? <p className="mt-4 border-l-2 border-blush pl-4 text-sm text-ink/75"><strong>{settings.brandName}:</strong> {r.reply}</p> : null}
              </article>
            ))}
            {reviews.total > reviews.items.length ? (
              <Link href={`/reviews?product=${p._id}`} className="block pt-6 text-xs tracking-[0.18em] text-violet uppercase">
                See all {reviews.total} reviews →
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
