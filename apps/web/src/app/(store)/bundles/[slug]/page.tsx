import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundle } from "@svateh/db";
import { BundleBuilder } from "@/components/store/Bundles";
import { ProductVisual } from "@/components/store/ProductVisual";
import { RichText } from "@/components/store/RichText";
import { Breadcrumbs } from "@/components/store/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b: any = await getBundle((await params).slug);
  return b ? { title: b.seoTitle || b.name, description: b.seoDescription || b.tagline } : {};
}

export default async function BundlePage({ params }: Props) {
  const b: any = await getBundle((await params).slug);
  if (!b) notFound();
  return (
    <section className="container-x py-8 pb-20">
      <Breadcrumbs items={[{ label: "Bundles", href: "/bundles" }, { label: b.name }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="relative aspect-square overflow-hidden lg:sticky lg:top-24 lg:self-start">
          <ProductVisual name={b.name} image={b.images?.[0]} priority sizes="(max-width:1024px) 100vw, 55vw" className="absolute inset-0" />
        </div>
        <div>
          <p className="eyebrow !text-violet">{b.isGift ? "Gift set" : "Bundle"}</p>
          <h1 className="display mt-3 text-[clamp(44px,6vw,76px)]">{b.name}</h1>
          {b.tagline ? <p className="mt-3 text-sm text-ink/70">{b.tagline}</p> : null}
          <RichText html={b.description} className="mt-6" />
          <div className="mt-8">
            <BundleBuilder bundle={b} />
          </div>
        </div>
      </div>
    </section>
  );
}
