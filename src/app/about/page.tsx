import type { Metadata } from "next";
import {
  AboutHero,
  OurStory,
  GuidingPrinciples,
  PhilosophyBanner,
} from "@/components/about";

export const metadata: Metadata = {
  title: "About Us | SVATEH",
  description:
    "Beauty should never feel complicated. Discover the SVATEH story — effortless luxury crafted for real Indian skin and lifestyles.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <OurStory />
      <GuidingPrinciples />
      <PhilosophyBanner />
    </>
  );
}
