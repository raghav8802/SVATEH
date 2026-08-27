import type { Metadata } from "next";
import { ShadeFinder } from "@/components/shade-finder";

export const metadata: Metadata = {
  title: "Find Your Shade | SVATEH",
  description:
    "Find your foundation shade in under 30 seconds. Four quick questions, one Skin Tint match made for Indian skin tones.",
};

export default function FindYourShadePage() {
  return (
    <section className="bg-svateh-white">
      <ShadeFinder />
    </section>
  );
}
