import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@svateh/core";
import { getMood, listMoods } from "@svateh/db";
import { LookBuilder } from "@/components/store/LookBuilder";
import { ProductGrid } from "@/components/store/ProductCard";
import { RichText } from "@/components/store/RichText";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await getMood((await params).slug);
  return m ? { title: m.seoTitle || m.name, description: m.seoDescription || m.tagline } : {};
}

const embed = (url: string) => {
  const yt = url.match(/(?:youtu\.be\/|v=|shorts\/)([\w-]{11})/);
  return yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}` : null;
};

export default async function MoodPage({ params }: Props) {
  const m: any = await getMood((await params).slug);
  if (!m) notFound();
  const others = (await listMoods()).filter((x: any) => x.slug !== m.slug);
  const steps = m.steps.filter((s: any) => s.product);
  const video = m.videoUrl ? embed(m.videoUrl) : null;
  return (
    <>
      <section className="grid bg-plum text-white lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-[7vw] lg:py-24">
          <Link href="/moods" className="eyebrow mb-6">
            ← Shop by mood
          </Link>
          <h1 className="display text-[clamp(56px,9vw,128px)]">{m.name}</h1>
          <p className="mt-4 font-display text-2xl text-blush italic">{m.tagline}</p>
          <RichText html={m.description} className="mt-6 max-w-md !text-white/85 [&_a]:!text-blush" />
        </div>
        <div className="relative min-h-[380px]" style={{ background: m.color || "var(--blush)" }}>
          {m.image ? <Image src={m.image} alt={`${m.name} finished look`} fill priority sizes="50vw" className="object-cover" /> : <div className="absolute top-1/2 left-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 shadow-[0_0_0_30px_rgba(255,255,255,.08)]" />}
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="eyebrow !text-violet">Application order</p>
            <h2 className="display mt-4 text-[clamp(40px,5vw,72px)]">Get the look</h2>
            <p className="mt-4 max-w-sm text-sm text-ink/70">Pick your shades and add everything in one go — or tap any product to learn more.</p>
            {video ? (
              <div className="mt-8 aspect-video overflow-hidden rounded-2xl">
                <iframe src={video} title={`${m.name} tutorial`} className="h-full w-full" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />
              </div>
            ) : m.videoUrl ? (
              <a href={m.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-outline mt-8 !border-ink/30">
                Watch the tutorial
              </a>
            ) : null}
          </div>
          {steps.length ? <LookBuilder steps={steps} /> : <ProductGrid products={m.products} tone="white" />}
        </div>
      </section>

      {m.bundle ? (
        <section className="bg-blush py-14 text-plum">
          <div className="container-x flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="eyebrow !text-plum">Complete-look bundle</p>
              <p className="mt-3 font-display text-4xl">{m.bundle.name}</p>
              <p className="mt-1 text-sm">
                {formatINR(m.bundle.price)}
                {m.bundle.savings > 0 ? ` · save ${formatINR(m.bundle.savings)}` : ""}
              </p>
            </div>
            <Link href={`/bundles/${m.bundle.slug}`} className="btn-plum">
              Shop the bundle
            </Link>
          </div>
        </section>
      ) : null}

      {others.length ? (
        <section className="bg-white py-14">
          <div className="container-x">
            <p className="eyebrow mb-5 !text-violet">More moods</p>
            <div className="flex flex-wrap gap-2">
              {others.map((o: any) => (
                <Link key={o.slug} href={`/moods/${o.slug}`} className="flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm hover:border-violet">
                  <span className="h-3 w-3 rounded-full" style={{ background: o.color || "var(--blush)" }} /> {o.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
