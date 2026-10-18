"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { formatINR } from "@svateh/core";
import { useCart } from "./cart-context";

export type NavData = {
  brandName: string;
  logo: string;
  announcement: { text: string; link: string } | null;
  categories: { name: string; slug: string }[];
  links: { label: string; href: string }[];
  signedIn: boolean;
};

export function Header({ nav }: { nav: NavData }) {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  return (
    <>
      {nav.announcement ? (
        <div className="bg-gold px-4 py-2 text-center text-[11px] font-medium tracking-[0.12em] text-plum">
          {nav.announcement.link ? (
            <Link href={nav.announcement.link} className="hover:underline">
              {nav.announcement.text}
            </Link>
          ) : (
            nav.announcement.text
          )}
        </div>
      ) : null}
      <header className={`sticky top-0 z-40 bg-plum/95 text-white backdrop-blur-md transition-shadow ${scrolled ? "shadow-[0_8px_30px_rgba(38,23,50,.25)]" : ""}`}>
        <div className="container-x flex h-[68px] items-center justify-between gap-4 lg:h-[78px]">
          <button className="-ml-2 p-2 lg:hidden" aria-label="Open menu" onClick={() => setMenu(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="font-display text-[26px] tracking-[0.16em] lg:text-[30px]" aria-label={`${nav.brandName} home`}>
            {nav.logo ? <Image src={nav.logo} alt={nav.brandName} width={160} height={40} className="h-8 w-auto object-contain lg:h-9" priority /> : nav.brandName}
          </Link>
          <nav className="hidden items-center gap-5 text-[10px] tracking-[0.18em] whitespace-nowrap uppercase lg:flex xl:gap-7" aria-label="Main">
            <div className="group relative">
              <Link href="/shop" className="flex items-center gap-1 py-6 hover:text-blush">
                Shop <ChevronDown className="h-3 w-3" />
              </Link>
              <div className="invisible absolute top-full left-1/2 w-56 -translate-x-1/2 bg-white py-3 text-ink opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <Link href="/shop" className="block px-5 py-2 hover:bg-cream hover:text-violet">
                  All products
                </Link>
                {nav.categories.map((c) => (
                  <Link key={c.slug} href={`/shop/${c.slug}`} className="block px-5 py-2 hover:bg-cream hover:text-violet">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            {nav.links.map((l) => (
              <Link key={l.href} href={l.href} className={`hover:text-blush ${pathname.startsWith(l.href) ? "text-blush" : ""}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 hover:text-blush" aria-label="Search" onClick={() => setSearch(true)}>
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link href="/account" className="hidden p-2 hover:text-blush sm:block" aria-label="Account">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <button onClick={() => setOpen(true)} className="ml-1 flex items-center gap-2 rounded-full border border-white/70 px-3.5 py-2 text-[10px] tracking-[0.15em] uppercase hover:bg-white hover:text-plum sm:px-[18px] sm:py-2.5" aria-label={`Bag, ${count} items`}>
              <ShoppingBag className="h-3.5 w-3.5 sm:hidden" />
              <span className="hidden sm:inline">Bag</span> {count}
            </button>
          </div>
        </div>
      </header>

      {menu ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-plum text-white">
            <div className="flex h-[68px] items-center justify-between px-5">
              <span className="font-display text-2xl tracking-[0.16em]">{nav.brandName}</span>
              <button aria-label="Close menu" onClick={() => setMenu(false)} className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col px-5 pb-8" aria-label="Mobile">
              <p className="eyebrow mt-4 mb-2">Shop</p>
              <Link href="/shop" className="border-b border-white/10 py-3 font-display text-2xl">
                All products
              </Link>
              {nav.categories.map((c) => (
                <Link key={c.slug} href={`/shop/${c.slug}`} className="border-b border-white/10 py-3 font-display text-2xl">
                  {c.name}
                </Link>
              ))}
              <p className="eyebrow mt-8 mb-2">Discover</p>
              {nav.links.map((l) => (
                <Link key={l.href} href={l.href} className="border-b border-white/10 py-3 text-sm tracking-[0.15em] uppercase">
                  {l.label}
                </Link>
              ))}
              <Link href="/routines" className="border-b border-white/10 py-3 text-sm tracking-[0.15em] uppercase">
                Shop the routine
              </Link>
              <Link href="/about" className="border-b border-white/10 py-3 text-sm tracking-[0.15em] uppercase">
                Our story
              </Link>
              <Link href="/account" className="mt-8 btn-blush">
                {nav.signedIn ? "My account" : "Sign in"}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}

      {search ? <SearchOverlay onClose={() => setSearch(false)} /> : null}
    </>
  );
}

type Hit = { name: string; slug: string; tagline: string; price: number; image: string; hex: string };

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    setBusy(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setHits(d.items ?? []))
        .catch(() => {})
        .finally(() => setBusy(false));
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative bg-cream shadow-2xl">
        <form
          className="container-x flex items-center gap-3 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <Search className="h-5 w-5 shrink-0 text-ink/50" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, shades or categories" className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-ink/35 sm:text-3xl" aria-label="Search" />
          <button type="button" onClick={onClose} aria-label="Close search" className="p-2">
            <X className="h-5 w-5" />
          </button>
        </form>
        {q.trim().length >= 2 ? (
          <div className="container-x max-h-[60vh] overflow-y-auto pb-6">
            {hits.length ? (
              <ul className="divide-y divide-ink/10">
                {hits.map((h) => (
                  <li key={h.slug}>
                    <Link href={`/products/${h.slug}`} className="flex items-center gap-4 py-3 hover:text-violet">
                      <span className="h-12 w-12 shrink-0 rounded-full border border-ink/10" style={{ background: h.image ? `center/cover url(${h.image})` : h.hex || "var(--blush)" }} />
                      <span className="flex-1">
                        <span className="block font-display text-lg">{h.name}</span>
                        <span className="text-xs text-ink/60">{h.tagline}</span>
                      </span>
                      <span className="text-sm">{formatINR(h.price)}</span>
                    </Link>
                  </li>
                ))}
                <li className="pt-4">
                  <Link href={`/search?q=${encodeURIComponent(q)}`} className="text-xs tracking-[0.18em] text-violet uppercase">
                    See all results →
                  </Link>
                </li>
              </ul>
            ) : busy ? (
              <p className="py-4 text-sm text-ink/60">Searching…</p>
            ) : (
              <p className="py-4 text-sm text-ink/70">
                No matches for “{q}”. Try a product name, a shade like “nude”, or{" "}
                <Link href="/shop" className="text-violet underline">
                  browse everything
                </Link>
                .
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
