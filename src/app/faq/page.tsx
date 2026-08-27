import type { Metadata } from "next";
import { FaqContent } from "@/components/faq/FaqContent";
import { faqIntro } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "FAQs | SVATEH",
  description:
    "Complete makeup FAQ — the brand, undertones, shade matching, orders, shipping and more.",
};

export default function FaqPage() {
  return (
    <>
      <section className="bg-[#E9DDCF]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="text-caption font-sans uppercase text-svateh-espresso/70">
            Complete Makeup FAQ
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium uppercase tracking-wide text-svateh-espresso lg:text-6xl">
            FAQs
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-xl text-svateh-espresso sm:text-2xl">
            {faqIntro.headline}
          </p>
          {faqIntro.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-svateh-espresso/80 md:text-base"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>
      <FaqContent />
    </>
  );
}
