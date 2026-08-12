import type { Metadata } from "next";
import { AnnouncementBar, Header, Footer } from "@/components/home";
import {
  AboutHero,
  OurStory,
  GuidingPrinciples,
  PhilosophyBanner,
} from "@/components/about";

export const metadata: Metadata = {
  title: "About Us | SVATE",
  description:
    "Beauty should never feel complicated. Discover the SVATE story — effortless luxury crafted for real Indian skin and lifestyles.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <AboutHero />
        <OurStory />
        <GuidingPrinciples />
        <PhilosophyBanner />
      </main>
      <Footer />
    </div>
  );
}
