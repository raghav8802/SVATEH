import Image from "next/image";
import Link from "next/link";

const products = [
  {
    name: "Multi Stick",
    price: "₹995",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
    shades: ["#C8A66A", "#D9B6A3", "#B9806F", "#8A6B5C"],
  },
  {
    name: "Skin Tint",
    price: "₹1,295",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop",
    shades: ["#F5E6D3", "#E8C9A8", "#D4A574", "#A67B5B"],
  },
  {
    name: "Lip & Cheek Tint",
    price: "₹795",
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
    shades: ["#E8A0A0", "#D97B7B", "#C45C5C", "#A83D4A"],
  },
  {
    name: "Brow Definer",
    price: "₹695",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
    shades: ["#9C8C7A", "#8A6B5C", "#6B5344", "#4B3A2F"],
  },
];

export function BestSellers() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 flex items-end justify-between">
        <h2 className="font-serif text-2xl tracking-widest text-svateh-espresso sm:text-3xl">
          BEST SELLERS
        </h2>
        <Link
          href="/collections"
          className="text-xs font-semibold uppercase tracking-widest text-svateh-gold transition-opacity hover:opacity-80 sm:text-sm"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
        {products.map((product) => (
          <article key={product.name} className="group flex flex-col">
            <Link href="/collections" className="block">
              <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-2xl bg-svateh-beige/40">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <h3 className="font-serif text-lg text-svateh-espresso sm:text-xl">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-svateh-mocha">{product.price}</p>
            </Link>
            <div className="mt-3 flex gap-2" aria-label={`${product.name} shades`}>
              {product.shades.map((shade) => (
                <span
                  key={shade}
                  className="h-4 w-4 rounded-full border border-svateh-beige ring-1 ring-transparent transition-shadow hover:ring-svateh-gold"
                  style={{ backgroundColor: shade }}
                  title={shade}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
