import Image from "next/image";

export function OurStory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-sm">
          <Image
            src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=1000&auto=format&fit=crop"
            alt="Confident woman in warm golden hour light"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        <div>
          <h2 className="mb-6 font-serif text-3xl tracking-wide text-svateh-espresso lg:text-4xl">
            OUR STORY
          </h2>
          <div className="space-y-5 font-sans text-base leading-relaxed text-svateh-mocha lg:text-lg">
            <p>
              Life moves fast. Deadlines. Meetings. Assignments. Family.
              Responsibilities. Women spend their entire day taking care of
              everyone else.
            </p>
            <p>
              SVATEH exists to remind every woman that she deserves a moment for
              herself. One swipe. One blend. One minute. That&apos;s all it
              should take to feel beautiful.
            </p>
            <p>
              We believe that luxury isn&apos;t about complexity; it&apos;s about
              the intention behind the ritual. Our formulations are crafted with
              the finest ingredients, designed to melt seamlessly into your skin,
              providing effortless elegance for the modern, discerning soul.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
