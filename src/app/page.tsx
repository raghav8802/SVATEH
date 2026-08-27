import {
  HeroSection,
  BrandBadges,
  BestSellers,
  ShopByCollection,
  WhySvateh,
  FindYourShadeBanner,
  CustomerReviews,
} from "@/components/home";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BrandBadges />
      <BestSellers />
      <FindYourShadeBanner />
      <ShopByCollection />
      <WhySvateh />
      <CustomerReviews />
    </>
  );
}
