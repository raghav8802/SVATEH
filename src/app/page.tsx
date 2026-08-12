import {
  AnnouncementBar,
  Header,
  HeroSection,
  BrandBadges,
  BestSellers,
  ShopByCollection,
  WhySvate,
  CustomerReviews,
  Footer,
} from "@/components/home";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-svate-ivory">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <BrandBadges />
        <BestSellers />
        <ShopByCollection />
        <WhySvate />
        <CustomerReviews />
      </main>
      <Footer />
    </div>
  );
}
