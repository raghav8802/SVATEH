"use client";

import Link from "next/link";

const HERO_VIDEO =
  "/Eyelash serum Videography _ B roll _ Creative Cosmetics Video.mp4";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <h1 className="mb-10 text-center font-serif text-4xl leading-tight tracking-tight text-svateh-espresso sm:mb-12 sm:text-5xl lg:mb-16 lg:text-6xl">
        Pamper Yourself.
        <br />
        The World Can Wait.
      </h1>

      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
        <div className="flex flex-col items-start">
          <p className="max-w-md text-base text-svateh-mocha sm:text-lg">
            Minimal steps. Maximum you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center rounded-full bg-[#C8A66A] px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-gold transition-opacity hover:opacity-90"
            >
              Shop Now
            </Link>
            <Link
              href="/find-your-shade"
              className="inline-flex items-center justify-center rounded-full border border-svateh-espresso px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-svateh-espresso transition-colors hover:bg-svateh-espresso hover:text-svateh-ivory"
            >
              Find Your Shade
            </Link>
          </div>
        </div>

        <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-luxury-lg">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="SVATEH beauty film"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
