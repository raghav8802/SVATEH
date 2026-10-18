import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShadeFinder } from "@svateh/db";
import { ShadeFinder } from "@/components/store/ShadeFinder";

export const metadata: Metadata = { title: "Shade Finder", description: "Find your perfect shade in three quick steps." };

export default async function ShadeFinderPage() {
  const cfg = await getShadeFinder();
  if (!cfg) notFound();
  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="container-x">
        <ShadeFinder title={cfg.title} intro={cfg.intro} matches={cfg.matches} brandMatches={cfg.brandMatches} />
      </div>
    </section>
  );
}
