export function AboutHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#E9DDCF]/85" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <h1 className="mb-4 text-center font-serif text-4xl font-medium text-svate-espresso lg:text-6xl">
          Pamper Yourself. The World Can Wait.
        </h1>
        <p className="mx-auto max-w-2xl text-center font-sans text-base text-svate-espresso/80 lg:text-lg">
          Beauty should never feel complicated. In a world that constantly
          demands more, we encourage women to pause, breathe, and choose
          themselves.
        </p>
      </div>
    </section>
  );
}
