import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listMoods } from "@svateh/db";
import { EmptyState, PageHero } from "@/components/store/ui";

export const metadata: Metadata = { title: "Shop by mood", description: "Pink Mood, Nude Mood, Soft Glam, Date Night and Glow Mode — complete looks, ready to wear." };

export default async function MoodsPage() {
  const moods = await listMoods();
  return (
    <>
      <PageHero eyebrow="Shop by mood" title={"How do you\nfeel today?"} intro="Pick a mood. We’ll show you the products, the order to apply them, and the finished look." />
      <section className="bg-plum pb-20 text-white">
        <div className="container-x">
          {moods.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moods.map((m: any, i: number) => (
                <Link key={m.slug} href={`/moods/${m.slug}`} className={`group relative block overflow-hidden ${i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}`} style={{ background: m.color || "var(--blush)" }}>
                  <div className={`relative ${i === 0 ? "aspect-square lg:aspect-auto lg:h-full lg:min-h-[640px]" : "aspect-[4/3]"}`}>
                    {m.image ? <Image src={m.image} alt="" fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" /> : <div className="absolute top-1/2 left-1/2 h-3/5 w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 shadow-[0_0_0_24px_rgba(255,255,255,.07)]" />}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum/90 to-transparent p-6 pt-24">
                      <p className="display text-[clamp(32px,4vw,56px)]">{m.name}</p>
                      <p className="mt-2 text-sm text-white/80">{m.tagline}</p>
                      <span className="mt-4 inline-block text-[10px] tracking-[0.2em] text-blush uppercase">Get the look →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Moods are coming soon" />
          )}
        </div>
      </section>
    </>
  );
}
