import Link from "next/link";

export function FindYourShadeBanner() {
  return (
    <section className="bg-svateh-espresso">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 sm:py-14 lg:flex-row lg:px-8 lg:text-left">
        <div>
          <p className="text-caption font-sans uppercase text-svateh-gold">
            Shade Finder
          </p>
          <h2 className="mt-2 font-serif text-2xl text-svateh-ivory sm:text-3xl">
            Find your foundation shade in under 30 seconds
          </h2>
          <p className="mt-2 max-w-xl text-sm text-svateh-sand">
            Four quick questions. One Skin Tint match made for Indian skin tones.
          </p>
        </div>
        <Link
          href="/find-your-shade"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#C8A66A] px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-gold transition-opacity hover:opacity-90"
        >
          Find Your Shade
        </Link>
      </div>
    </section>
  );
}
