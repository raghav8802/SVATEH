import Link from "next/link";
import type { SiteSettingsData } from "@svateh/db";
import { NewsletterForm } from "./forms";
import { SocialIcon } from "./SocialIcon";

export function Footer({ settings, categories, showBundles }: { settings: SiteSettingsData; categories: { name: string; slug: string }[]; showBundles: boolean }) {
  const col = "flex flex-col gap-2.5 text-sm text-white/75";
  const head = "eyebrow mb-4";
  return (
    <footer className="bg-violet text-white">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr] lg:py-20">
        <div>
          <p className="font-display text-[38px] tracking-[0.16em]">{settings.brandName}</p>
          <p className="mt-6 font-display text-2xl">{settings.newsletterTitle}</p>
          <p className="mt-2 max-w-sm text-sm text-white/70">{settings.newsletterText}</p>
          <div className="mt-5 max-w-sm">
            <NewsletterForm source="footer" dark />
          </div>
          {settings.socials?.length ? (
            <div className="mt-8 flex gap-3">
              {settings.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 hover:border-blush hover:text-blush">
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div>
            <p className={head}>Shop</p>
            <nav className={col}>
              <Link href="/shop">All products</Link>
              {categories.map((c) => (
                <Link key={c.slug} href={`/shop/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
              {showBundles ? <Link href="/bundles">Bundles</Link> : null}
              <Link href="/new">New arrivals</Link>
            </nav>
          </div>
          <div>
            <p className={head}>Discover</p>
            <nav className={col}>
              <Link href="/about">Our story</Link>
              <Link href="/moods">Shop by mood</Link>
              {settings.showShadeFinder ? <Link href="/shade-finder">Shade finder</Link> : null}
              <Link href="/routines">Shop the routine</Link>
              {settings.showCommunity ? <Link href="/community">{settings.brandName} Girls</Link> : null}
              <Link href="/reviews">Reviews</Link>
            </nav>
          </div>
          <div>
            <p className={head}>Help</p>
            <nav className={col}>
              <Link href="/faq">FAQs</Link>
              <Link href="/contact">Contact us</Link>
              <Link href="/track">Track your order</Link>
              <Link href="/shipping-policy">Shipping</Link>
              <Link href="/returns-policy">Returns</Link>
            </nav>
          </div>
          <div>
            <p className={head}>Legal</p>
            <nav className={col}>
              <Link href="/privacy-policy">Privacy policy</Link>
              <Link href="/terms">Terms & conditions</Link>
              <Link href="/shipping-policy">Shipping policy</Link>
              <Link href="/returns-policy">Returns & refunds</Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-[10px] tracking-[0.16em] text-white/60 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>
            {settings.footerNote} © {new Date().getFullYear()} {settings.brandName}
          </span>
          {settings.businessDisclosure ? <span className="normal-case tracking-normal whitespace-pre-line">{settings.businessDisclosure}</span> : null}
        </div>
      </div>
    </footer>
  );
}
