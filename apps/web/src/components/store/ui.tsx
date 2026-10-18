import Link from "next/link";
import { Star } from "lucide-react";
import { BADGES, formatINR, labelOf } from "@svateh/core";

export function Stars({ value, size = 12, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} width={size} height={size} className={i <= Math.round(value) ? "fill-gold text-gold" : "text-ink/25"} />
      ))}
    </span>
  );
}

export function Price({ price, compareAt, className = "" }: { price: number; compareAt?: number | null; className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span>{formatINR(price)}</span>
      {compareAt && compareAt > price ? <s className="text-[0.85em] opacity-50">{formatINR(compareAt)}</s> : null}
    </span>
  );
}

export function Badge({ value }: { value: string }) {
  return <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-violet shadow-sm">{labelOf(BADGES, value).replace(/ \(.*\)$/, "")}</span>;
}

export function PageHero({ eyebrow, title, intro, tone = "plum" }: { eyebrow?: string; title: string; intro?: string; tone?: "plum" | "cream" | "violet" }) {
  const toneCls = tone === "cream" ? "bg-cream text-ink" : tone === "violet" ? "bg-violet text-white" : "bg-plum text-white";
  return (
    <section className={`${toneCls} relative overflow-hidden`}>
      <div className="pointer-events-none absolute -right-40 -bottom-48 h-[420px] w-[420px] rounded-full bg-blush opacity-15" />
      <div className="container-x relative py-16 sm:py-24">
        {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
        <h1 className="display max-w-4xl text-[clamp(44px,8vw,104px)] whitespace-pre-line">{title}</h1>
        {intro ? <p className={`mt-6 max-w-xl text-[15px] leading-relaxed ${tone === "cream" ? "text-ink/75" : "text-white/80"}`}>{intro}</p> : null}
      </div>
    </section>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[11px] tracking-wide text-ink/60">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {it.href ? (
              <Link href={it.href} className="hover:text-violet">
                {it.label}
              </Link>
            ) : (
              <span className="text-ink">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EmptyState({ title, text, cta }: { title: string; text?: string; cta?: { label: string; href: string } }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="font-display text-3xl">{title}</p>
      {text ? <p className="mt-3 text-sm text-ink/70">{text}</p> : null}
      {cta ? (
        <Link href={cta.href} className="btn-plum mt-8">
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}

export const themeClass = (t?: string) =>
  ({
    plum: "bg-plum text-white",
    violet: "bg-violet text-white",
    cream: "bg-cream text-ink",
    white: "bg-white text-ink",
    blush: "bg-blush text-plum",
    gold: "bg-gold text-plum",
  })[t || "cream"] ?? "bg-cream text-ink";

export const isDark = (t?: string) => t === "plum" || t === "violet";
