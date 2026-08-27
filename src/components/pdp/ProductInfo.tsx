"use client";

import { useState } from "react";
import {
  Star,
  Heart,
  Share2,
  Layers,
  Blend,
  Sparkles,
  ShieldCheck,
  Truck,
  Banknote,
  Lock,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";

const shades = [
  { name: "Rosey Nude", color: "#D9B6A3" },
  { name: "Soft Blush", color: "#E8A0A0" },
  { name: "Warm Rose", color: "#D97B7B" },
  { name: "Berry Flush", color: "#C45C5C" },
  { name: "Deep Bloom", color: "#A83D4A" },
  { name: "Mauve Kiss", color: "#B9806F" },
] as const;

const benefits = [
  { label: "Multi-Use", icon: Layers },
  { label: "Buildable", icon: Blend },
  { label: "Natural Finish", icon: Sparkles },
  { label: "Dermatologically Tested", icon: ShieldCheck },
] as const;

const guarantees = [
  { label: "Free Shipping over ₹1000", icon: Truck },
  { label: "COD Available", icon: Banknote },
  { label: "Secure Payments", icon: Lock },
  { label: "Easy 7-Day Returns", icon: RotateCcw },
] as const;

export function ProductInfo() {
  const [selectedShade, setSelectedShade] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const shade = shades[selectedShade];
  const unitPrice = 795;
  const total = unitPrice * quantity;

  return (
    <div className="flex flex-col">
      <h1 className="font-serif text-4xl font-medium text-svateh-espresso lg:text-5xl">
        Lip &amp; Cheek Tint
      </h1>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-xl font-medium text-svateh-espresso">₹{unitPrice}</span>
        <span className="text-xs text-svateh-espresso/60">(All taxes included)</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-[#C8A66A] text-[#C8A66A]"
              strokeWidth={0}
            />
          ))}
        </div>
        <span className="text-sm text-svateh-espresso/80">4.9 (128 Reviews)</span>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-svateh-mocha md:text-base">
        A lightweight, blendable tint that melts into your lips &amp; cheeks for a
        natural flush that lasts all day. Formulated with botanical extracts to
        nourish while providing buildable color.
      </p>

      <div className="mt-8 flex flex-wrap gap-4 sm:gap-6">
        {benefits.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-svateh-espresso"
          >
            <Icon className="h-4 w-4 shrink-0 text-[#C8A66A]" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-svateh-espresso">
          Shade: {shade.name}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {shades.map((s, index) => {
            const isSelected = index === selectedShade;
            return (
              <button
                key={s.name}
                type="button"
                aria-label={s.name}
                aria-pressed={isSelected}
                onClick={() => setSelectedShade(index)}
                className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                  isSelected
                    ? "ring-2 ring-[#C8A66A] ring-offset-2 ring-offset-svateh-ivory"
                    : "ring-1 ring-[#E9DDCF]"
                }`}
                style={{ backgroundColor: s.color }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="flex items-center gap-4 rounded-xl border border-svateh-beige bg-svateh-ivory px-4 py-3">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="text-svateh-espresso transition-opacity hover:opacity-60"
          >
            <Minus className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <span className="min-w-[1.5rem] text-center text-sm font-medium" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="text-svateh-espresso transition-opacity hover:opacity-60"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          className="flex-grow rounded-xl bg-[#C8A66A] py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#b89559]"
        >
          Add to Bag — ₹{total.toLocaleString("en-IN")}
        </button>
      </div>

      <div className="mt-5 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setWishlisted((w) => !w)}
          className="inline-flex items-center gap-2 text-sm text-svateh-espresso/80 transition-colors hover:text-svateh-gold"
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? "fill-svateh-gold text-svateh-gold" : ""}`}
            strokeWidth={1.5}
          />
          Add to Wishlist
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm text-svateh-espresso/80 transition-colors hover:text-svateh-gold"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.5} />
          Share
        </button>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[#E9DDCF]/50 pt-8">
        {guarantees.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A66A]" strokeWidth={1.5} />
            <span className="text-xs leading-snug text-svateh-mocha sm:text-sm">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
