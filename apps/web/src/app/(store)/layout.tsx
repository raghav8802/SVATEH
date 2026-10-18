import type { Metadata } from "next";
import { getSettings, listCategories } from "@svateh/db";
import { CartDrawer } from "@/components/store/CartDrawer";
import { CartProvider } from "@/components/store/cart-context";
import { Consent } from "@/components/store/Consent";
import { Footer } from "@/components/store/Footer";
import { Header, type NavData } from "@/components/store/Header";
import { getCustomerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.seoTitle || s.brandName, template: `%s | ${s.brandName}` },
    description: s.seoDescription,
    icons: s.favicon ? { icon: s.favicon, apple: s.favicon } : undefined,
    openGraph: { siteName: s.brandName, type: "website", locale: "en_IN", images: s.ogImage ? [s.ogImage] : undefined },
    twitter: { card: "summary_large_image" },
  };
}

const safeColor = (c: string | undefined, fallback: string) => (c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : fallback);

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [s, categories, customer] = await Promise.all([getSettings(), listCategories(), getCustomerSession()]);
  const menuCats = categories.filter((c) => c.showInMenu).map((c) => ({ name: c.name, slug: c.slug }));

  const links: NavData["links"] = [
    { label: "New", href: "/new" },
    { label: s.bestsellersLabel || "Bestsellers", href: "/bestsellers" },
    { label: "Shop by Mood", href: "/moods" },
  ];
  if (s.showBundles) links.push({ label: "Bundles", href: "/bundles" });
  if (s.showShadeFinder) links.push({ label: "Shade Finder", href: "/shade-finder" });
  if (s.showCommunity) links.push({ label: `${s.brandName} Girls`, href: "/community" });

  const nav: NavData = {
    brandName: s.brandName,
    logo: s.logo,
    announcement: s.announcementEnabled && s.announcementText ? { text: s.announcementText, link: s.announcementLink } : null,
    categories: menuCats,
    links,
    signedIn: !!customer,
  };

  const vars = `:root{--violet:${safeColor(s.colorViolet, "#381A40")};--plum:${safeColor(s.colorPlum, "#261732")};--blush:${safeColor(s.colorBlush, "#E7A8B9")};--gold:${safeColor(s.colorGold, "#C8A45D")};--cream:${safeColor(s.colorCream, "#F7F2EA")};--ink:${safeColor(s.colorInk, "#281E2C")}}`;

  return (
    <CartProvider>
      <style dangerouslySetInnerHTML={{ __html: vars }} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header nav={nav} />
      <main id="main">{children}</main>
      <Footer settings={s} categories={menuCats} showBundles={s.showBundles} />
      <CartDrawer />
      <Consent text={s.cookieNotice} ga4Id={s.ga4Id} pixelId={s.metaPixelId} />
    </CartProvider>
  );
}
