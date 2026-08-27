import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import type { ShadeMatch } from "@/lib/shadeFinder";

type ResultStepProps = {
  match: ShadeMatch;
  onRestart: () => void;
};

export function ResultStep({ match, onRestart }: ResultStepProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      id: `skin-tint-${match.id}`,
      name: match.productName,
      shade: match.name,
      price: match.price,
      image: match.image,
    });
  };

  return (
    <div className="mx-auto max-w-xl text-center">
      <p className="text-xs tracking-wide text-svateh-taupe sm:text-sm">
        97% of people found their perfect match with Svateh
      </p>
      <h1 className="mt-4 font-serif text-3xl font-medium lowercase text-svateh-espresso sm:text-4xl">
        your shade is {match.name}
      </h1>
      <p className="mt-2 text-sm lowercase text-svateh-mocha">
        {match.undertoneLabel}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-svateh-beige/40">
          <Image
            src={match.image}
            alt={`${match.productName} in ${match.name}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 280px"
          />
          <span className="absolute right-2 top-2 rounded-full bg-svateh-espresso px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-white sm:text-[10px]">
            Non oxidising
          </span>
        </div>
        <div
          className="aspect-square rounded-2xl"
          style={{ backgroundColor: match.hex }}
          aria-label={`${match.name} swatch`}
        />
      </div>

      <Link
        href="/product"
        className="mt-6 inline-block text-sm lowercase text-svateh-espresso underline decoration-svateh-gold/70 underline-offset-4 transition-colors hover:text-svateh-gold"
      >
        {match.productName.toLowerCase()}
      </Link>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-8 w-full rounded-xl bg-svateh-espresso py-4 text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
      >
        Add to Cart ₹{match.price.toLocaleString("en-IN")}
      </button>

      <button
        type="button"
        onClick={onRestart}
        className="mt-4 text-xs uppercase tracking-widest text-svateh-mocha transition-colors hover:text-svateh-gold"
      >
        Start over
      </button>
    </div>
  );
}
