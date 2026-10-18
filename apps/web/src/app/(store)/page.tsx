import { getHomeSections, getSettings, listCommunity, listMoods, listProducts, listReviews } from "@svateh/db";
import { HomeSections, type HomeData, type HomeSection } from "@/components/store/HomeSections";
import { EmptyState } from "@/components/store/ui";

export default async function HomePage() {
  const [sections, settings] = await Promise.all([getHomeSections() as Promise<HomeSection[]>, getSettings()]);
  const types = new Set(sections.map((s) => s.type));
  const ids = [...new Set(sections.flatMap((s) => s.products ?? []))];
  const [picked, featured, moods, community, reviews] = await Promise.all([
    ids.length ? listProducts({ ids }) : [],
    listProducts({ featured: true, limit: 6 }).then((f) => (f.length ? f : listProducts({ limit: 6 }))),
    types.has("moods") ? listMoods() : [],
    types.has("community") ? listCommunity(8) : [],
    types.has("reviews") ? listReviews({ limit: 6 }).then((r) => r.items) : [],
  ]);
  const data: HomeData = {
    productsById: Object.fromEntries(picked.map((p) => [p._id, p])),
    featured,
    moods: moods as any,
    community: community as any,
    reviews: reviews as any,
    brandName: settings.brandName,
  };
  if (!sections.length) {
    return <EmptyState title={`Welcome to ${settings.brandName}`} text="The homepage has no sections yet. Add them in Admin → Homepage." cta={{ label: "Shop", href: "/shop" }} />;
  }
  return <HomeSections sections={sections} data={data} />;
}
