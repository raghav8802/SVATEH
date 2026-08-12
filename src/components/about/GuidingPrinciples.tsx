import { Leaf, Eye, Gem, type LucideIcon } from "lucide-react";

const principles: {
  title: string;
  copy: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Mission",
    icon: Leaf,
    copy: "To simplify beauty by creating innovative, multifunctional makeup products that empower every woman to feel confident in minutes.",
  },
  {
    title: "Vision",
    icon: Eye,
    copy: "To become India's most loved modern beauty brand by redefining luxury through simplicity, innovation, and inclusivity.",
  },
  {
    title: "Core Values",
    icon: Gem,
    copy: "Simplicity • Innovation • Clean Beauty • Skin First • Confidence • Authenticity • Inclusivity • Empowerment",
  },
];

export function GuidingPrinciples() {
  return (
    <section className="bg-[#FAF7F5] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center font-serif text-3xl text-svate-espresso lg:text-4xl">
          Our Guiding Principles
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {principles.map(({ title, copy, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#E9DDCF]/30 bg-white p-8 text-center lg:p-10"
            >
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-svate-gold/15">
                <Icon className="h-6 w-6 text-svate-gold" strokeWidth={1.5} />
              </div>
              <h3 className="mb-4 font-serif text-xl tracking-wide text-svate-espresso uppercase">
                {title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-svate-mocha lg:text-base">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
