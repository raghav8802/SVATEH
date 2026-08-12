import type { Metadata } from "next";
import { AnnouncementBar, Header, Footer } from "@/components/home";
import {
  Breadcrumbs,
  ProductGallery,
  ProductInfo,
  ProductAccordions,
  CompleteYourLook,
} from "@/components/pdp";

export const metadata: Metadata = {
  title: "Lip & Cheek Tint | SVATE",
  description:
    "A lightweight, blendable tint that melts into your lips & cheeks for a natural flush that lasts all day.",
};

export default function ProductPage() {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <Breadcrumbs />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            <ProductGallery />
            <ProductInfo />
          </div>

          <div className="mx-auto mt-14 max-w-3xl md:mt-16">
            <ProductAccordions />
          </div>

          <CompleteYourLook />
        </div>
      </main>
      <Footer />
    </div>
  );
}
