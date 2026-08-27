import { Star } from "lucide-react";

const reviews = [
  {
    quote:
      "The Multi Stick replaced three products in my bag. Soft, buildable, and actually lasts through Mumbai humidity.",
    author: "Ananya R.",
  },
  {
    quote:
      "Finally a skin tint that matches warm Indian undertones without looking ashy. My everyday essential.",
    author: "Priya M.",
  },
  {
    quote:
      "Clean formulas that feel luxurious. The Lip & Cheek Tint gives the perfect flush in one swipe.",
    author: "Meera K.",
  },
  {
    quote:
      "Minimal steps, maximum glow — SVATEH gets my morning routine down to five minutes.",
    author: "Sana D.",
  },
];

function GoldStars() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4 fill-[#C8A66A] text-[#C8A66A]"
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

export function CustomerReviews() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <h2 className="mb-10 text-center font-serif text-2xl tracking-widest text-svateh-espresso sm:text-3xl">
        LOVED BY THOUSANDS
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reviews.map((review) => (
          <blockquote
            key={review.author}
            className="flex flex-col rounded-2xl bg-white/60 p-6 shadow-luxury"
          >
            <GoldStars />
            <p className="mt-4 flex-1 text-sm leading-relaxed text-svateh-mocha">
              &ldquo;{review.quote}&rdquo;
            </p>
            <footer className="mt-5 font-serif text-base text-svateh-espresso">
              — {review.author}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
