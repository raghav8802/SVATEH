import Link from "next/link";

export function PhilosophyBanner() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1558171813-4c088753af8f?q=80&w=1600&auto=format&fit=crop)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#F8F6F2]/88" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <blockquote className="mx-auto mb-8 max-w-4xl font-serif text-2xl font-medium leading-relaxed text-svate-espresso md:text-4xl">
          &ldquo;We create products that replace multiple makeup steps with
          smart, high-performance formulas designed for real Indian skin and
          lifestyles.&rdquo;
        </blockquote>

        <Link
          href="/collections"
          className="inline-flex items-center justify-center rounded-xl bg-[#C8A66A] px-8 py-4 text-caption font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#b89559]"
        >
          Explore Our Collection
        </Link>
      </div>
    </section>
  );
}
