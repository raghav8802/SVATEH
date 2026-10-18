"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { COVERAGES, FINISHES, labelOf } from "@svateh/core";

export function ShopFilters({ finishes, coverages, count }: { finishes: string[]; coverages: string[]; count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(sp.toString());
    if (v) next.set(k, v);
    else next.delete(k);
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };

  const select = "rounded-full border border-ink/20 bg-white px-4 py-2 text-xs outline-none focus:border-violet";
  const active = ["finish", "coverage", "price", "shade"].some((k) => sp.get(k));

  return (
    <div className="flex flex-wrap items-center gap-2 border-y border-ink/10 py-4">
      <span className="mr-1 flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-ink/60 uppercase">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
      </span>
      {finishes.length > 1 ? (
        <select aria-label="Finish" className={select} value={sp.get("finish") ?? ""} onChange={(e) => set("finish", e.target.value)}>
          <option value="">All finishes</option>
          {finishes.map((f) => (
            <option key={f} value={f}>
              {labelOf(FINISHES, f)}
            </option>
          ))}
        </select>
      ) : null}
      {coverages.length > 1 ? (
        <select aria-label="Coverage" className={select} value={sp.get("coverage") ?? ""} onChange={(e) => set("coverage", e.target.value)}>
          <option value="">All coverage</option>
          {coverages.map((c) => (
            <option key={c} value={c}>
              {labelOf(COVERAGES, c)}
            </option>
          ))}
        </select>
      ) : null}
      <select aria-label="Price" className={select} value={sp.get("price") ?? ""} onChange={(e) => set("price", e.target.value)}>
        <option value="">Any price</option>
        <option value="0-799">Under ₹800</option>
        <option value="800-1199">₹800 – ₹1,199</option>
        <option value="1200-">₹1,200 & above</option>
      </select>
      <input
        aria-label="Shade"
        placeholder="Shade (e.g. nude)"
        defaultValue={sp.get("shade") ?? ""}
        onKeyDown={(e) => e.key === "Enter" && set("shade", (e.target as HTMLInputElement).value.trim())}
        onBlur={(e) => e.target.value.trim() !== (sp.get("shade") ?? "") && set("shade", e.target.value.trim())}
        className={`${select} w-40`}
      />
      {active ? (
        <button onClick={() => router.replace(pathname, { scroll: false })} className="text-xs text-violet underline">
          Clear
        </button>
      ) : null}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-ink/60">
          {count} product{count === 1 ? "" : "s"}
        </span>
        <select aria-label="Sort" className={select} value={sp.get("sort") ?? ""} onChange={(e) => set("sort", e.target.value)}>
          <option value="">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">A–Z</option>
        </select>
      </div>
    </div>
  );
}
