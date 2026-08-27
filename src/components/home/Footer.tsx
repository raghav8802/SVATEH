"use client";

import Link from "next/link";

const shopLinks = [
  { href: "/collections", label: "All Products" },
  { href: "/collections", label: "Best Sellers" },
  { href: "/collections", label: "New Arrivals" },
  { href: "/collections", label: "Kits & Sets" },
];

const collectionLinks = [
  { href: "/collections", label: "Lips" },
  { href: "/collections", label: "Face" },
  { href: "/collections", label: "Eyes" },
  { href: "/collections", label: "Skincare" },
  { href: "/collections", label: "Accessories" },
];

const helpLinks = [
  { href: "/find-your-shade", label: "Find Your Shade" },
  { href: "/contact", label: "Contact Us" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
  { href: "/faq", label: "FAQs" },
  { href: "/about", label: "Our Story" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#E9DDCF]/50 bg-svateh-beige/40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-8 lg:px-8">
        <div>
          <h3 className="font-serif text-lg tracking-wide text-svateh-espresso">
            Shop
          </h3>
          <ul className="mt-4 space-y-2.5">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-svateh-mocha transition-colors hover:text-svateh-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-lg tracking-wide text-svateh-espresso">
            Collections
          </h3>
          <ul className="mt-4 space-y-2.5">
            {collectionLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-svateh-mocha transition-colors hover:text-svateh-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-lg tracking-wide text-svateh-espresso">
            Help
          </h3>
          <ul className="mt-4 space-y-2.5">
            {helpLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-svateh-mocha transition-colors hover:text-svateh-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-lg tracking-wide text-svateh-espresso">
            Join SVATEH
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-svateh-mocha">
            Soft launches, shade drops, and early access — straight to your inbox.
          </p>
          <form
            className="mt-5 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Your email"
              className="min-w-0 flex-1 rounded-full border border-[#E9DDCF] bg-white px-4 py-2.5 text-sm text-svateh-espresso placeholder:text-svateh-taupe focus:border-svateh-gold focus:outline-none focus:ring-1 focus:ring-svateh-gold"
            />
            <button
              type="submit"
              className="rounded-full bg-[#C8A66A] px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-[#E9DDCF]/50 py-5 text-center">
        <p className="text-xs tracking-wide text-svateh-taupe">
          © 2026 SVATEH. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
