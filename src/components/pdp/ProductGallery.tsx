"use client";

import Image from "next/image";
import { useState } from "react";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1200&auto=format&fit=crop",
    alt: "Lip & Cheek Tint bottle",
    label: "Product bottle",
  },
  {
    src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop",
    alt: "Cap close up",
    label: "Cap close up",
  },
  {
    src: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop",
    alt: "Texture swatch",
    label: "Texture swatch",
  },
  {
    src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=800&auto=format&fit=crop",
    alt: "Model cheek application",
    label: "Cheek application",
  },
  {
    src: "https://images.unsplash.com/photo-1631214524020-8e9c8248e1a8?q=80&w=800&auto=format&fit=crop",
    alt: "Shade lineup",
    label: "Shade lineup",
  },
] as const;

export function ProductGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = galleryImages[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-svate-ivory">
        <Image
          src={active.src}
          alt={active.alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1" role="listbox" aria-label="Product images">
        {galleryImages.map((image, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={image.label}
              type="button"
              role="option"
              aria-selected={isActive}
              aria-label={image.label}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl sm:w-20 ${
                isActive
                  ? "ring-2 ring-[#C8A66A] ring-offset-2 ring-offset-svate-ivory"
                  : "ring-1 ring-[#E9DDCF]"
              }`}
            >
              <Image
                src={image.src}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
