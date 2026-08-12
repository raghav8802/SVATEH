"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";

export type ProductCardProps = {
  name: string;
  price: string;
  rating: number;
  image: string;
  shades: readonly string[];
  href?: string;
};

export function ProductCard({
  name,
  price,
  rating,
  image,
  shades,
  href = "/product",
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <article className="group flex h-full flex-col">
      <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-svate-beige/40">
        <Link href={href} className="absolute inset-0 block">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setWishlisted((w) => !w)}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-svate-espresso shadow-sm backdrop-blur-sm transition-colors hover:text-svate-gold"
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? "fill-svate-gold text-svate-gold" : ""}`}
            strokeWidth={1.5}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <Link href={href}>
            <h3 className="font-serif text-lg text-svate-espresso sm:text-xl">
              {name}
            </h3>
          </Link>
          <p className="shrink-0 text-sm font-medium text-svate-espresso">{price}</p>
        </div>

        <p className="mt-1.5 text-sm text-svate-gold" aria-label={`Rated ${rating} out of 5`}>
          ★ {rating.toFixed(1)}
        </p>

        <div className="mt-3 flex gap-2" aria-label={`${name} shades`}>
          {shades.map((shade) => (
            <span
              key={shade}
              className="h-4 w-4 rounded-full border border-[#E9DDCF]"
              style={{ backgroundColor: shade }}
            />
          ))}
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-[#C8A66A] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 sm:mt-auto sm:pt-3"
        >
          Add to Bag
        </button>
      </div>
    </article>
  );
}
