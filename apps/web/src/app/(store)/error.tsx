"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="container-x flex min-h-[50vh] flex-col items-start justify-center py-24">
      <p className="eyebrow mb-4 !text-violet">Something went wrong</p>
      <h1 className="display text-6xl">Please try again.</h1>
      <button onClick={reset} className="btn-plum mt-8">Retry</button>
    </section>
  );
}
