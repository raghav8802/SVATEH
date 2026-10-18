import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_CATEGORIES, labelOf } from "@svateh/core";
import { getSettings, listFaqs } from "@svateh/db";
import { Accordion, RichText } from "@/components/store/RichText";
import { PageHero } from "@/components/store/ui";

export const metadata: Metadata = { title: "FAQs", description: "Answers about our products, shades, orders, shipping, payments and returns." };

export default async function FaqPage() {
  const [faqs, s] = await Promise.all([listFaqs(), getSettings()]);
  const groups = FAQ_CATEGORIES.map((c) => ({ ...c, items: faqs.filter((f: any) => f.category === c.value) })).filter((g) => g.items.length);
  const label = (v: string) => labelOf(FAQ_CATEGORIES, v).replace("SVATEH", s.brandName);
  return (
    <>
      <PageHero eyebrow="Help" title="Questions, answered." intro="Can’t find what you’re looking for? Our team is happy to help." tone="cream" />
      <section className="container-x grid gap-10 pb-20 lg:grid-cols-[220px_1fr]">
        <nav className="no-scrollbar flex gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:self-start" aria-label="FAQ categories">
          {groups.map((g) => (
            <a key={g.value} href={`#${g.value}`} className="shrink-0 rounded-full border border-ink/15 px-4 py-2 text-xs hover:border-violet lg:rounded-none lg:border-0 lg:border-l-2 lg:border-ink/10 lg:px-4 lg:py-1.5 lg:hover:border-violet">
              {label(g.value)}
            </a>
          ))}
        </nav>
        <div>
          {groups.map((g) => (
            <div key={g.value} id={g.value} className="mb-12 scroll-mt-24">
              <h2 className="eyebrow mb-2 !text-violet">{label(g.value)}</h2>
              {g.items.map((f: any) => (
                <Accordion key={f._id} title={f.question}>
                  <RichText html={f.answer} />
                </Accordion>
              ))}
            </div>
          ))}
          <div className="bg-violet p-8 text-white">
            <p className="font-display text-3xl">Still need help?</p>
            <p className="mt-2 text-sm text-white/80">{s.responseTime ? `We usually reply ${s.responseTime.toLowerCase()}.` : "We’ll get back to you soon."}</p>
            <Link href="/contact" className="btn-blush mt-6">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
