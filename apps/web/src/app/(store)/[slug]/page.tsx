import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@svateh/core";
import { getPage } from "@svateh/db";
import { RichText } from "@/components/store/RichText";
import { PageHero } from "@/components/store/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPage((await params).slug);
  return p ? { title: p.seoTitle || p.title, description: p.seoDescription || p.intro } : {};
}

/** Admin-managed pages: About, policies, terms, and any custom page. */
export default async function ContentPage({ params }: Props) {
  const p = await getPage((await params).slug);
  if (!p) notFound();

  if (p.kind === "story") {
    return (
      <>
        <PageHero eyebrow={p.eyebrow} title={p.intro || p.title} />
        {p.sections.map((s: any, i: number) => (
          <section key={s._id ?? i} className={i % 2 ? "bg-white" : "bg-cream"}>
            <div className={`container-x grid items-center gap-10 py-16 sm:py-24 ${s.image ? "md:grid-cols-2" : "md:grid-cols-[1fr_1.4fr]"}`}>
              {s.image ? (
                <div className={`relative aspect-[4/5] overflow-hidden ${i % 2 ? "md:order-2" : ""}`}>
                  <Image src={s.image} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
                </div>
              ) : (
                <p className="font-display text-7xl text-blush">{String(i + 1).padStart(2, "0")}</p>
              )}
              <div>
                {s.heading ? <h2 className="display text-[clamp(36px,4.5vw,64px)]">{s.heading}</h2> : null}
                <RichText html={s.body} className="mt-6 max-w-xl" />
              </div>
            </div>
          </section>
        ))}
        {p.ctaLabel && p.ctaHref ? (
          <section className="bg-plum py-20 text-center text-white">
            <Link href={p.ctaHref} className="btn-blush">
              {p.ctaLabel}
            </Link>
          </section>
        ) : null}
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} intro={p.intro} tone="cream" />
      <section className="container-x pb-20">
        <div className="max-w-3xl">
          {p.sections.map((s: any, i: number) => (
            <div key={s._id ?? i} className="border-t border-ink/10 py-8">
              {s.heading ? <h2 className="mb-4 font-display text-3xl">{s.heading}</h2> : null}
              <RichText html={s.body} />
            </div>
          ))}
          <p className="mt-8 text-xs text-ink/50">Last updated {formatDate(p.updatedAt)}</p>
          {p.ctaLabel && p.ctaHref ? (
            <Link href={p.ctaHref} className="btn-plum mt-8">
              {p.ctaLabel}
            </Link>
          ) : null}
        </div>
      </section>
    </>
  );
}
