import {
  HeroSection,
  BrandBadges,
  BestSellers,
  ShopByCollection,
  WhySvate,
  CustomerReviews,
} from "@/components/home";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BrandBadges />
      <BestSellers />
      <ShopByCollection />
      <WhySvate />
      <CustomerReviews />
    </>
  );
}
