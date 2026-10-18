import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings, listCommunity } from "@svateh/db";
import { SocialIcon } from "@/components/store/SocialIcon";
import { EmptyState, PageHero } from "@/components/store/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `${s.brandName} Girls`, description: "Real girls. Real skin. Real looks." };
}

export default async function CommunityPage() {
  const [posts, s] = await Promise.all([listCommunity(), getSettings()]);
  return (
    <>
      <PageHero eyebrow={`${s.brandName} Girls`} title={`Real Girls.\nReal Skin.\nReal ${s.brandName}.`} intro="Get-ready-with-me videos, swatches and looks from our community — shared with permission." />
      <section className="bg-cream py-16">
        <div className="container-x">
          {posts.length ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {posts.map((p: any) => (
                <article key={p._id} className="mb-4 break-inside-avoid bg-white">
                  <a href={p.link || undefined} target={p.link ? "_blank" : undefined} rel="noopener noreferrer" className="relative block aspect-[4/5]">
                    <Image src={p.image} alt={`${p.creatorName}${p.caption ? ` — ${p.caption}` : ""}`} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] tracking-[0.14em] text-violet uppercase">{p.kind}</span>
                  </a>
                  <div className="p-5">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {p.platform !== "customer" && p.platform !== "other" ? <SocialIcon platform={p.platform} className="h-3.5 w-3.5" /> : null}
                      {p.handle || p.creatorName}
                    </p>
                    {p.caption ? <p className="mt-2 text-sm text-ink/70">{p.caption}</p> : null}
                    {p.products?.length ? (
                      <div className="mt-4">
                        <p className="eyebrow mb-2 !text-violet">Shop the look</p>
                        <div className="flex flex-wrap gap-2">
                          {p.products.map((pr: any) => (
                            <Link key={pr._id} href={`/products/${pr.slug}`} className="rounded-full border border-ink/15 px-3 py-1.5 text-xs hover:border-violet">
                              {pr.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Our community wall is coming soon" text={`Tag us on Instagram wearing ${s.brandName} — with your permission, your look could be featured here.`} cta={{ label: "Shop the edit", href: "/shop" }} />
          )}
        </div>
      </section>
    </>
  );
}
