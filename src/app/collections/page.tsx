import type { Metadata } from "next";
import {
  CollectionHero,
  FilterToolbar,
  ProductCard,
  BrandSpotlightCard,
} from "@/components/collection";

export const metadata: Metadata = {
  title: "Collections | SVATEH",
  description:
    "Effortless multi-use formulas designed for natural Indian skin tones.",
};

const products = [
  {
    name: "Lip & Cheek Tint",
    price: "₹795",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop",
    shades: ["#E8A0A0", "#D97B7B", "#C45C5C", "#A83D4A"],
  },
  {
    name: "Multi Stick",
    price: "₹995",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop",
    shades: ["#C8A66A", "#D9B6A3", "#B9806F", "#8A6B5C"],
  },
  {
    name: "Lip Glaze",
    price: "₹895",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop",
    shades: ["#F2C4C4", "#E8A0A0", "#D47B8C", "#C45C6A"],
  },
  {
    name: "Skin Tint",
    price: "₹1,295",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
    shades: ["#F5E6D3", "#E8C9A8", "#D4A574", "#A67B5B"],
  },
] as const;

export default function CollectionsPage() {
  return (
    <>
      <CollectionHero />
      <FilterToolbar productCount={8} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          <ProductCard {...products[0]} />
          <ProductCard {...products[1]} />
          <BrandSpotlightCard />
          <ProductCard {...products[2]} />
          <ProductCard {...products[3]} />
        </div>
      </section>
    </>
  );
}
