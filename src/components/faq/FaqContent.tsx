import { faqNav, faqSections } from "@/lib/faqs";

export function FaqContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <nav
        className="mb-12 flex flex-wrap justify-center gap-2"
        aria-label="FAQ sections"
      >
        {faqNav.map((item) => (
          <a
            key={item.label}
            href={`#${item.id}`}
            className="rounded-full border border-[#E9DDCF] bg-white px-3 py-1.5 text-xs tracking-wide text-svateh-espresso transition-colors hover:border-svateh-gold hover:text-svateh-gold sm:text-sm"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mx-auto max-w-3xl space-y-14">
        {faqSections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h2 className="font-serif text-2xl text-svateh-espresso sm:text-3xl">
              {section.title}
            </h2>
            <div className="mt-6 space-y-8">
              {section.items.map((item) => (
                <div
                  key={item.question}
                  className="border-b border-[#E9DDCF]/50 pb-8 last:border-b-0 last:pb-0"
                >
                  <h3 className="font-serif text-lg text-svateh-espresso sm:text-xl">
                    {item.question}
                  </h3>
                  {item.answer ? (
                    <p className="mt-3 text-sm leading-relaxed text-svateh-mocha sm:text-base">
                      {item.answer}
                    </p>
                  ) : null}
                  {item.bullets ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-svateh-mocha sm:text-base">
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
