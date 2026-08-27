"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const sections = [
  {
    id: "description",
    title: "Description",
    content: (
      <div className="space-y-4 text-base leading-relaxed text-svateh-mocha md:text-lg">
        <p>
          Lip &amp; Cheek Tint is a lightweight, water-light formula that melts
          into skin for a soft, lit-from-within flush. Build from a sheer wash of
          color to a richer stain that stays true through humidity and long days.
        </p>
        <p>
          Shade Rosey Nude is a muted rose with warm undertones — designed to
          flatter natural Indian skin tones without looking chalky or overly cool.
        </p>
        <p>
          Infused with botanical extracts that nourish lips and cheeks while
          delivering buildable pigment with a natural, skin-like finish.
        </p>
      </div>
    ),
  },
  {
    id: "how-to-use",
    title: "How To Use",
    content: (
      <ol className="list-decimal space-y-2 pl-4 text-base leading-relaxed text-svateh-mocha md:text-lg">
        <li>Dot a small amount onto the center of lips or apples of cheeks.</li>
        <li>Blend outward with fingertips or a damp sponge for a seamless flush.</li>
        <li>Layer for more intensity — the formula builds without patchiness.</li>
        <li>Use on lips alone for a soft stain, or pair with Lip Glaze for shine.</li>
      </ol>
    ),
  },
  {
    id: "ingredients",
    title: "Ingredients",
    content: (
      <p className="text-base leading-relaxed text-svateh-mocha md:text-lg">
        Aqua, Caprylic/Capric Triglyceride, Glycerin, Silica, Mica, Iron Oxides
        (CI 77491, CI 77492, CI 77499), Titanium Dioxide (CI 77891),
        Simmondsia Chinensis (Jojoba) Seed Oil, Tocopherol, Sodium Hyaluronate,
        Aloe Barbadensis Leaf Juice, Phenoxyethanol, Caprylyl Glycol. Clean,
        vegan, and cruelty-free.
      </p>
    ),
  },
  {
    id: "shipping",
    title: "Shipping & Returns",
    content: (
      <div className="space-y-4 text-base leading-relaxed text-svateh-mocha md:text-lg">
        <p>
          Orders are typically dispatched within 1–2 business days via express
          partners. Free shipping on orders over ₹1,000.
        </p>
        <p>
          Report damaged, defective, wrong, or missing items within 24 hours
          with an unboxing photo or video for a full refund or free replacement.
          Unused, unopened products may be exchanged once within 7 days of
          delivery. Opened and used makeup cannot be returned for change of
          mind.
        </p>
        <p>
          <a
            href="/shipping-returns"
            className="text-svateh-espresso underline decoration-svateh-gold/60 underline-offset-4 hover:text-svateh-gold"
          >
            Read the full Shipping &amp; Returns policy
          </a>
        </p>
      </div>
    ),
  },
] as const;

export function ProductAccordions() {
  const [openId, setOpenId] = useState<string>("description");

  return (
    <div className="border-t border-[#E9DDCF]/50">
      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div key={section.id} className="border-b border-[#E9DDCF]/50">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? "" : section.id)}
              className="relative flex w-full items-center justify-center py-5 text-center"
            >
              <span className="font-serif text-xl text-svateh-espresso sm:text-2xl">
                {section.title}
              </span>
              <ChevronDown
                className={`absolute right-0 h-5 w-5 text-svateh-espresso/60 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>
            {isOpen && (
              <div className="pb-6 text-left sm:text-center sm:[&_ol]:mx-auto sm:[&_ol]:inline-block sm:[&_ol]:text-left">
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
