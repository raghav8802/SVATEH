import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    name: "Lips",
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop",
    href: "/collections",
  },
  {
    name: "Face",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop",
    href: "/collections",
  },
  {
    name: "Eyes",
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=800&auto=format&fit=crop",
    href: "/collections",
  },
  {
    name: "Accessories",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
    href: "/collections",
  },
];

export function ShopByCollection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <h2 className="mb-10 font-serif text-2xl tracking-widest text-svateh-espresso sm:text-3xl">
        SHOP BY COLLECTION
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
        {collections.map((collection) => (
          <Link
            key={collection.name}
            href={collection.href}
            className="group relative aspect-square overflow-hidden rounded-2xl"
          >
            <Image
              src={collection.image}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-svateh-espresso/70 via-svateh-espresso/20 to-transparent" />
            <span className="absolute bottom-4 left-0 right-0 text-center font-serif text-xl tracking-wide text-white sm:text-2xl">
              {collection.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
