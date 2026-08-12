import Image from "next/image";
import Link from "next/link";

const products = [
  {
    name: "Dewy Skin Tint",
    price: "₹1,295",
    image:
      "https://images.unsplash.com/photo-1631214524020-8e9c8248e1a8?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Sculpting Multi-Stick",
    price: "₹995",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Micro Brow Definer",
    price: "₹695",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Nourishing Lip Glaze",
    price: "₹895",
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
  },
] as const;

export function CompleteYourLook() {
  return (
    <section className="mt-16 border-t border-[#E9DDCF]/50 pt-14 md:mt-20 md:pt-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="font-serif text-3xl text-svate-espresso">
          Complete Your Look
        </h2>
        <Link
          href="/collections"
          className="shrink-0 text-xs font-semibold uppercase tracking-widest text-svate-gold transition-opacity hover:opacity-80 sm:text-sm"
        >
          Shop All Face
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
        {products.map((product) => (
          <Link
            key={product.name}
            href="/product"
            className="group flex flex-col"
          >
            <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-svate-beige/40">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
            <h3 className="font-serif text-base text-svate-espresso sm:text-lg">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-svate-mocha">{product.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
