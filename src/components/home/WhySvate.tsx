import Image from "next/image";
import Link from "next/link";
import { Sparkles, Beaker, Leaf, MapPin } from "lucide-react";

const features = [
  {
    title: "Effortless Beauty",
    description: "Fewer steps, refined results — beauty that fits your pace.",
    icon: Sparkles,
  },
  {
    title: "Smart Formulas",
    description: "Multifunctional products engineered for real skin, real days.",
    icon: Beaker,
  },
  {
    title: "Clean & Conscious",
    description: "Thoughtfully sourced ingredients you can feel good about.",
    icon: Leaf,
  },
  {
    title: "Made for India",
    description: "Shade ranges and textures tested for Indian skin tones.",
    icon: MapPin,
  },
];

export function WhySvate() {
  return (
    <section className="bg-svate-beige/25 py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 md:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Before / After */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-luxury">
            <Image
              src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=700&auto=format&fit=crop"
              alt="Natural look before SVATE"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 25vw"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-svate-espresso">
              Before
            </span>
          </div>
          <div className="relative mt-6 aspect-[3/4] overflow-hidden rounded-2xl shadow-luxury sm:mt-10">
            <Image
              src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=700&auto=format&fit=crop"
              alt="Radiant look after SVATE"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 25vw"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-svate-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
              After
            </span>
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="font-serif text-2xl tracking-widest text-svate-espresso sm:text-3xl">
            WHY SVATE?
          </h2>
          <ul className="mt-8 space-y-6">
            {features.map(({ title, description, icon: Icon }) => (
              <li key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-svate-gold/15">
                  <Icon className="h-5 w-5 text-svate-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-svate-espresso">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-svate-mocha">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/about"
            className="mt-10 inline-flex items-center justify-center rounded-full border border-svate-espresso px-8 py-3 text-sm font-semibold uppercase tracking-widest text-svate-espresso transition-colors hover:bg-svate-espresso hover:text-svate-ivory"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
