"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { CartDrawer } from "@/components/cart/CartDrawer";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collection" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 h-20 border-b border-[#E9DDCF]/30 bg-svate-ivory/80 backdrop-blur-md">
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 flex flex-1 items-center">
            <Link
              href="/"
              className="relative flex h-12 w-12 shrink-0 items-center sm:h-14 sm:w-14"
            >
              <Image
                src="/image-removebg-preview.png"
                alt="SVATE"
                fill
                className="object-contain"
                sizes="56px"
                priority
              />
            </Link>
          </div>

          <nav
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex"
            aria-label="Primary"
          >
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-svate-gold ${
                    active ? "text-svate-gold" : "text-svate-espresso/80"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative z-10 flex flex-1 items-center justify-end gap-4 sm:gap-5">
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="h-5 w-5 text-svate-espresso" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5 text-svate-espresso" strokeWidth={1.5} />
              )}
            </button>
            <button
              type="button"
              aria-label="Search"
              className="text-svate-espresso/80 transition-colors hover:text-svate-gold"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Wishlist"
              className="text-svate-espresso/80 transition-colors hover:text-svate-gold"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label={`Cart, ${itemCount} items`}
              onClick={openCart}
              className="relative text-svate-espresso/80 transition-colors hover:text-svate-gold"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-svate-gold text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            className="border-t border-[#E9DDCF]/30 bg-svate-ivory px-4 py-4 md:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col items-center gap-3 text-center">
              {navLinks.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`block py-2 text-sm font-medium tracking-wide ${
                        active ? "text-svate-gold" : "text-svate-espresso"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
