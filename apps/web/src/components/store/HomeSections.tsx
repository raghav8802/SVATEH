import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductCard as Card } from "@svateh/db";
import { NewsletterForm } from "./forms";
import { ProductGrid } from "./ProductCard";
import { ProductVisual } from "./ProductVisual";
import { isDark, Stars, themeClass } from "./ui";

export type HomeSection = {
  _id: string;
  type: string;
  theme?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  image?: string;
  products?: string[];
  items?: { title: string; text?: string; image?: string; href?: string }[];
  quote?: string;
  ctaLabel?: string;
  ctaHref?: string;
  cta2Label?: string;
  cta2Href?: string;
};

export type HomeData = {
  productsById: Record<string, Card>;
  featured: Card[];
  moods: { name: string; slug: string; tagline: string; color: string; image: string }[];
  community: { _id: string; creatorName: string; handle: string; image: string; link: string; caption: string }[];
  reviews: { _id: string; name: string; rating: number; title: string; body: string; verified: boolean; product?: { name: string; slug: string } }[];
  brandName: string;
};

const Cta = ({ s, dark, variant }: { s: HomeSection; dark?: boolean; variant?: "blush" | "plum" | "outline" }) =>
  s.ctaLabel && s.ctaHref ? (
    <Link href={s.ctaHref} className={variant === "outline" ? `btn-outline ${dark ? "" : "!border-ink/40"}` : dark || variant === "blush" ? "btn-blush" : "btn-plum"}>
      {s.ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  ) : null;

const Title = ({ children, className = "" }: { children?: string; className?: string }) =>
  children ? <h2 className={`display text-[clamp(44px,7vw,105px)] whitespace-pre-line ${className}`}>{children}</h2> : null;

function Hero({ s, data }: { s: HomeSection; data: HomeData }) {
  const featured = s.products?.map((id) => data.productsById[id]).find(Boolean) ?? data.featured[0];
  return (
    <section className="bg-plum px-3 pb-3 sm:px-[4vw] sm:pb-6">
      <div className="grid gap-3 lg:min-h-[calc(100vh-110px)] lg:grid-cols-2 lg:gap-[18px]">
        <div className="relative flex flex-col justify-center overflow-hidden bg-violet px-6 py-16 text-white sm:px-[7vw]">
          <div className="pointer-events-none absolute -right-56 -bottom-52 h-[430px] w-[430px] rounded-full bg-blush opacity-[.18]" />
          {s.eyebrow ? <p className="eyebrow mb-6">{s.eyebrow}</p> : null}
          <h1 className="display mb-8 text-[clamp(52px,6.4vw,108px)] leading-[0.86] whitespace-pre-line">{s.title}</h1>
          {s.body ? <p className="mb-9 max-w-[440px] text-[15px] leading-[1.75] text-white/85">{s.body}</p> : null}
          <div className="relative flex flex-wrap gap-3">
            {s.ctaLabel && s.ctaHref ? (
              <Link href={s.ctaHref} className="btn-blush">
                {s.ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            {s.cta2Label && s.cta2Href ? (
              <Link href={s.cta2Href} className="btn-outline text-white">
                {s.cta2Label}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden sm:min-h-[560px]" style={{ background: "radial-gradient(circle at 72% 22%,rgba(231,168,185,.75),transparent 18%),linear-gradient(135deg,var(--plum) 0%,var(--violet) 48%,#4d2c52 100%)" }}>
          {s.image ? (
            <Image src={s.image} alt="" fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          ) : (
            <>
              <div className="absolute top-[12%] left-[13%] h-[78%] w-[74%] -rotate-[5deg] rounded-[50%_50%_13%_13%] bg-white shadow-[22px_30px_60px_rgba(0,0,0,.3)]" />
              <div className="absolute top-[6%] right-[5%] h-[min(190px,30vw)] w-[min(190px,30vw)] rounded-full border border-gold shadow-[0_0_0_18px_rgba(200,164,93,.08)]" />
              <div className="absolute top-[9%] left-[7%] z-10 h-[clamp(64px,8vw,105px)] w-[clamp(64px,8vw,105px)] rounded-full shadow-[0_15px_35px_rgba(0,0,0,.25)]" style={{ background: "radial-gradient(circle at 30% 25%,#f7df9d,var(--gold) 55%,#8d6728)" }} />
              {featured ? (
                <Link href={`/products/${featured.slug}`} className="absolute top-[25%] left-[32.5%] z-[5] h-[54%] w-[35%]" aria-label={featured.name}>
                  <div className="relative flex h-full w-full items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,#fff,#eadfe5)] shadow-[15px_25px_45px_rgba(0,0,0,.3)]">
                    <div className="absolute -top-[8%] h-[9%] w-[63%] rounded-t-2xl rounded-b bg-plum" />
                    <span className="font-display text-[clamp(16px,2vw,25px)] tracking-[0.1em] text-violet">{data.brandName}</span>
                    <small className="absolute bottom-[24%] text-[8px] tracking-[0.2em] text-ink">{featured.name.toUpperCase()}</small>
                  </div>
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Marquee({ s }: { s: HomeSection }) {
  const text = s.body || "";
  return (
    <div className="overflow-hidden border-y border-plum bg-gold whitespace-nowrap text-plum" aria-label={text}>
      <div className="animate-marquee inline-flex py-3.5 font-display text-xl" aria-hidden>
        <span className="pr-8">{text}</span>
        <span className="pr-8">{text}</span>
        <span className="pr-8">{text}</span>
        <span className="pr-8">{text}</span>
      </div>
    </div>
  );
}

function SectionHead({ s, dark }: { s: HomeSection; dark: boolean }) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div>
        {s.eyebrow ? <p className={`eyebrow mb-4 ${dark ? "" : "!text-violet"}`}>{s.eyebrow}</p> : null}
        <Title>{s.title}</Title>
      </div>
      {s.body ? <p className={`max-w-[340px] text-sm leading-relaxed ${dark ? "text-white/80" : "opacity-80"}`}>{s.body}</p> : null}
    </div>
  );
}

function ProductGridSection({ s, data }: { s: HomeSection; data: HomeData }) {
  const picked = (s.products ?? []).map((id) => data.productsById[id]).filter(Boolean) as Card[];
  const products = picked.length ? picked : data.featured;
  if (!products.length) return null;
  const dark = isDark(s.theme || "white");
  return (
    <section className={`${themeClass(s.theme || "white")} py-20 sm:py-24`} id="shop">
      <div className="container-x">
        <SectionHead s={s} dark={dark} />
        <ProductGrid products={products.slice(0, 6)} tone={s.theme === "cream" ? "white" : "cream"} />
        {s.ctaLabel ? (
          <div className="mt-12 text-center">
            <Cta s={s} dark={dark} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Intro({ s }: { s: HomeSection }) {
  const dark = isDark(s.theme);
  return (
    <section className={`${themeClass(s.theme)} py-20 sm:py-28`}>
      <div className="container-x grid items-end gap-10 md:grid-cols-2 md:gap-[9vw]">
        <Title>{s.title}</Title>
        <div className="max-w-[470px] text-sm leading-[1.85]">
          {s.eyebrow ? <p className={`eyebrow mb-4 ${dark ? "" : "!text-violet"}`}>{s.eyebrow}</p> : null}
          {s.subtitle ? <p className="mb-4 font-display text-[26px] leading-tight">{s.subtitle}</p> : null}
          {s.body ? <p className="mb-8 opacity-85">{s.body}</p> : null}
          <Cta s={s} dark={dark} />
        </div>
      </div>
    </section>
  );
}

function Items({ s, numbered }: { s: HomeSection; numbered?: boolean }) {
  const dark = isDark(s.theme);
  const items = s.items ?? [];
  return (
    <section className={`${themeClass(s.theme)} py-20 sm:py-24`}>
      <div className="container-x">
        <SectionHead s={s} dark={dark} />
        <div className={`grid gap-4 sm:grid-cols-2 ${items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {items.map((it, i) => {
            const inner = (
              <div className={`flex h-full flex-col ${dark ? "border border-white/15" : "bg-white/70"} p-6 sm:p-8`}>
                {it.image ? (
                  <div className="relative mb-6 aspect-[4/3] overflow-hidden">
                    <Image src={it.image} alt="" fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
                  </div>
                ) : (
                  <span className={`mb-8 font-display text-5xl ${dark ? "text-gold" : "text-blush"}`}>{numbered ? String(i + 1).padStart(2, "0") : "✦"}</span>
                )}
                <h3 className="font-display text-[27px] leading-tight">{it.title}</h3>
                {it.text ? <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-white/75" : "text-ink/70"}`}>{it.text}</p> : null}
                {it.href ? <span className={`mt-auto pt-6 text-[10px] tracking-[0.2em] uppercase ${dark ? "text-blush" : "text-violet"}`}>Discover →</span> : null}
              </div>
            );
            return it.href ? (
              <Link key={i} href={it.href} className="block transition hover:-translate-y-1">
                {inner}
              </Link>
            ) : (
              <div key={i}>{inner}</div>
            );
          })}
        </div>
        {s.ctaLabel ? (
          <div className="mt-12">
            <Cta s={s} dark={dark} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Moods({ s, data }: { s: HomeSection; data: HomeData }) {
  if (!data.moods.length) return null;
  const dark = isDark(s.theme || "plum");
  return (
    <section className={`${themeClass(s.theme || "plum")} py-20 sm:py-24`}>
      <div className="container-x">
        <SectionHead s={s} dark={dark} />
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {data.moods.map((m) => (
            <Link key={m.slug} href={`/moods/${m.slug}`} className="group relative block aspect-[3/4] w-[70%] shrink-0 snap-start overflow-hidden sm:w-auto" style={{ background: m.color || "var(--blush)" }}>
              {m.image ? <Image src={m.image} alt="" fill sizes="(max-width:640px) 70vw, 20vw" className="object-cover transition duration-700 group-hover:scale-105" /> : <div className="absolute top-1/2 left-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 shadow-[0_0_0_18px_rgba(255,255,255,.08)]" />}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum/85 to-transparent p-5 pt-16 text-white">
                <p className="font-display text-[26px] leading-none">{m.name}</p>
                <p className="mt-2 text-[11px] tracking-wide text-white/80">{m.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
        {s.ctaLabel ? (
          <div className="mt-10">
            <Cta s={s} dark={dark} variant="outline" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Routine({ s }: { s: HomeSection }) {
  const dark = isDark(s.theme);
  return (
    <section className={`${themeClass(s.theme)} py-20 sm:py-24`}>
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          {s.eyebrow ? <p className={`eyebrow mb-4 ${dark ? "" : "!text-violet"}`}>{s.eyebrow}</p> : null}
          <Title className="!text-[clamp(36px,4.2vw,64px)]">{s.title}</Title>
          {s.body ? <p className="mt-6 max-w-sm text-sm opacity-80">{s.body}</p> : null}
          <div className="mt-8">
            <Cta s={s} dark={dark} />
          </div>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {(s.items ?? []).map((it, i) => (
            <li key={i} className={`flex items-center gap-5 p-5 ${dark ? "bg-white/5" : "bg-cream"}`}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush font-display text-xl text-plum">{i + 1}</span>
              <span>
                <span className="block font-display text-2xl">{it.title}</span>
                {it.text ? <span className="text-xs opacity-70">{it.text}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ShadeFinderCta({ s }: { s: HomeSection }) {
  const dark = isDark(s.theme || "blush");
  return (
    <section className={`${themeClass(s.theme || "blush")} relative overflow-hidden py-20 sm:py-28`}>
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full border border-plum/30 shadow-[0_0_0_30px_rgba(38,23,50,.05)]" />
      <div className="container-x relative grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          {s.eyebrow ? <p className={`eyebrow mb-4 ${dark ? "" : "!text-violet"}`}>{s.eyebrow}</p> : null}
          <Title>{s.title}</Title>
          {s.body ? <p className="mt-6 max-w-md text-[15px]">{s.body}</p> : null}
          <div className="mt-8">
            <Cta s={s} dark={dark} />
          </div>
        </div>
        {s.image ? (
          <div className="relative aspect-square overflow-hidden rounded-full">
            <Image src={s.image} alt="" fill sizes="40vw" className="object-cover" />
          </div>
        ) : (
          <div className="flex justify-center gap-2" aria-hidden>
            {["#EBCDB0", "#DDB896", "#C99A72", "#A0704C", "#7A4F33"].map((c, i) => (
              <span key={c} className="h-28 w-10 rounded-full border border-white/60 shadow-lg sm:h-44 sm:w-14" style={{ background: c, transform: `translateY(${(i % 2) * 24}px)` }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Community({ s, data }: { s: HomeSection; data: HomeData }) {
  if (!data.community.length) return null;
  const dark = isDark(s.theme);
  return (
    <section className={`${themeClass(s.theme)} py-20 sm:py-24`}>
      <div className="container-x">
        <SectionHead s={s} dark={dark} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.community.slice(0, 8).map((p) => (
            <Link key={p._id} href="/community" className="group relative aspect-[4/5] overflow-hidden bg-blush">
              <Image src={p.image} alt={`${p.creatorName}${p.caption ? ` — ${p.caption}` : ""}`} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] text-ink">{p.handle || p.creatorName}</span>
            </Link>
          ))}
        </div>
        {s.ctaLabel ? (
          <div className="mt-10">
            <Cta s={s} dark={dark} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Reviews({ s, data }: { s: HomeSection; data: HomeData }) {
  if (!data.reviews.length) return null;
  const dark = isDark(s.theme);
  return (
    <section className={`${themeClass(s.theme)} py-20 sm:py-24`}>
      <div className="container-x">
        <SectionHead s={s} dark={dark} />
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
          {data.reviews.slice(0, 6).map((r) => (
            <figure key={r._id} className={`w-[85%] shrink-0 snap-start p-7 sm:w-auto ${dark ? "bg-white/5" : "bg-cream"}`}>
              <Stars value={r.rating} />
              <blockquote className="mt-4">
                <p className="font-display text-xl leading-snug">{r.title}</p>
                <p className="mt-3 line-clamp-5 text-sm opacity-80">{r.body}</p>
              </blockquote>
              <figcaption className="mt-5 text-xs opacity-70">
                {r.name}
                {r.verified ? " · Verified purchase" : ""}
                {r.product ? (
                  <>
                    {" · "}
                    <Link href={`/products/${r.product.slug}`} className="underline">
                      {r.product.name}
                    </Link>
                  </>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/reviews" className={`text-[11px] tracking-[0.2em] uppercase ${dark ? "text-blush" : "text-violet"}`}>
            Read all reviews →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Story({ s }: { s: HomeSection }) {
  return (
    <section className="grid min-h-[600px] bg-plum text-white md:grid-cols-2" id="story">
      <div className="relative min-h-[360px] overflow-hidden" style={{ background: "radial-gradient(circle at 35% 35%,rgba(231,168,185,.8),transparent 19%),linear-gradient(145deg,var(--plum),var(--violet))" }}>
        {s.image ? (
          <Image src={s.image} alt="" fill sizes="50vw" className="object-cover" />
        ) : (
          <>
            <div className="absolute top-[15%] left-[15%] h-[70%] w-[70%] rounded-full border border-gold/75 shadow-[0_0_0_24px_rgba(200,164,93,.08),0_0_0_52px_rgba(231,168,185,.06)]" />
            <div className="absolute right-[5%] bottom-[7%] h-[38%] w-[38%] rounded-full bg-blush opacity-85" />
          </>
        )}
      </div>
      <div className="flex flex-col justify-center px-6 py-20 sm:px-[8vw]">
        {s.eyebrow ? <p className="eyebrow mb-6">{s.eyebrow}</p> : null}
        <Title className="text-gold">{s.title}</Title>
        {s.body ? <p className="mt-8 max-w-[420px] text-sm leading-[1.8] text-white/85">{s.body}</p> : null}
        {s.quote ? <p className="mt-7 border-l border-blush pl-6 font-display text-[23px]">{s.quote}</p> : null}
        <div className="mt-10">
          <Cta s={s} dark />
        </div>
      </div>
    </section>
  );
}

function Newsletter({ s }: { s: HomeSection }) {
  const dark = isDark(s.theme || "gold");
  return (
    <section className={`${themeClass(s.theme || "gold")} py-20`}>
      <div className="container-x grid items-end gap-10 md:grid-cols-2">
        <div>
          {s.eyebrow ? <p className={`eyebrow mb-4 ${dark ? "" : "!text-plum"}`}>{s.eyebrow}</p> : null}
          <Title className="!text-[clamp(40px,5.5vw,80px)]">{s.title}</Title>
        </div>
        <div className="max-w-md">
          {s.body ? <p className="mb-5 text-sm">{s.body}</p> : null}
          <NewsletterForm source="homepage" dark={dark} />
        </div>
      </div>
    </section>
  );
}

function Banner({ s }: { s: HomeSection }) {
  const dark = isDark(s.theme || "plum") || !!s.image;
  return (
    <section className={`${themeClass(s.theme || "plum")} relative overflow-hidden`}>
      {s.image ? (
        <>
          <Image src={s.image} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-plum/45" />
        </>
      ) : null}
      <div className={`container-x relative py-28 sm:py-36 ${s.image ? "text-white" : ""}`}>
        {s.eyebrow ? <p className="eyebrow mb-4">{s.eyebrow}</p> : null}
        <Title>{s.title}</Title>
        {s.body ? <p className="mt-6 max-w-md text-[15px] opacity-90">{s.body}</p> : null}
        <div className="mt-8">
          <Cta s={s} dark={dark} />
        </div>
      </div>
    </section>
  );
}

export function HomeSections({ sections, data }: { sections: HomeSection[]; data: HomeData }) {
  return (
    <>
      {sections.map((s) => {
        switch (s.type) {
          case "hero":
            return <Hero key={s._id} s={s} data={data} />;
          case "marquee":
            return <Marquee key={s._id} s={s} />;
          case "productGrid":
            return <ProductGridSection key={s._id} s={s} data={data} />;
          case "intro":
            return <Intro key={s._id} s={s} />;
          case "multiUse":
          case "why":
            return <Items key={s._id} s={s} />;
          case "moods":
            return <Moods key={s._id} s={s} data={data} />;
          case "routine":
            return <Routine key={s._id} s={s} />;
          case "shadeFinder":
            return <ShadeFinderCta key={s._id} s={s} />;
          case "community":
            return <Community key={s._id} s={s} data={data} />;
          case "reviews":
            return <Reviews key={s._id} s={s} data={data} />;
          case "story":
            return <Story key={s._id} s={s} />;
          case "newsletter":
            return <Newsletter key={s._id} s={s} />;
          case "banner":
            return <Banner key={s._id} s={s} />;
          default:
            return null;
        }
      })}
    </>
  );
}

export { ProductVisual };
