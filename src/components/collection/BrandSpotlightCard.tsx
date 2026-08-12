import Image from "next/image";
import { Shield } from "lucide-react";

export function BrandSpotlightCard() {
  return (
    <div className="relative col-span-1 min-h-[320px] overflow-hidden rounded-2xl sm:col-span-2 sm:row-span-2 sm:min-h-0">
      <Image
        src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=1200&auto=format&fit=crop"
        alt="Luxury beauty texture"
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw"
      />
      <div className="absolute inset-0 bg-svate-espresso/45" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
        <Shield className="mb-4 h-8 w-8 text-svate-gold" strokeWidth={1.5} />
        <h2 className="font-serif text-3xl font-medium leading-tight">
          Made for Real Indian Skin.
        </h2>
        <p className="mt-3 font-sans text-sm text-white/90">
          Safe, Clean &amp; Dermatologically Tested.
        </p>
      </div>
    </div>
  );
}
