"use client";

import Link from "next/link";
import { useState } from "react";
import { formatINR } from "@svateh/core";
import type { ProductCard } from "@svateh/db";
import { useCart } from "./cart-context";
import { ProductVisual } from "./ProductVisual";

type Step = { title: string; text?: string; product: ProductCard };

/** Routines & moods: shows each step with a shade picker and adds the chosen items individually. */
export function LookBuilder({ steps, dark = false }: { steps: Step[]; dark?: boolean }) {
  const { addMany } = useCart();
  const uniq = steps.filter((s, i) => steps.findIndex((x) => x.product._id === s.product._id) === i);
  const [sel, setSel] = useState<Record<string, string | undefined>>(() =>
    Object.fromEntries(uniq.map((s) => [s.product._id, (s.product.variants.find((v) => v.inStock) ?? s.product.variants[0])?.sku])),
  );
  const [include, setInclude] = useState<Record<string, boolean>>(() => Object.fromEntries(uniq.map((s) => [s.product._id, s.product.inStock])));
  const chosen = uniq.filter((s) => include[s.product._id] && sel[s.product._id]);
  const total = chosen.reduce((sum, s) => sum + (s.product.variants.find((v) => v.sku === sel[s.product._id])?.price ?? s.product.price), 0);
  const muted = dark ? "text-white/65" : "text-ink/60";

  return (
    <div>
      <ol className="space-y-4">
        {steps.map((s, i) => {
          const p = s.product;
          const v = p.variants.find((x) => x.sku === sel[p._id]);
          const first = uniq.indexOf(s) !== -1;
          return (
            <li key={i} className={`flex gap-4 p-4 ${dark ? "bg-white/5" : "bg-white"}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display ${dark ? "bg-gold text-plum" : "bg-blush text-plum"}`}>{i + 1}</span>
              <Link href={`/products/${p.slug}`} className="relative h-20 w-16 shrink-0 overflow-hidden">
                <ProductVisual name={p.name} image={v?.image || p.images[0]} hex={v?.hex} sizes="64px" className="absolute inset-0" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] tracking-[0.2em] uppercase ${dark ? "text-gold" : "text-violet"}`}>{s.title}</p>
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${p.slug}`} className="font-display text-xl hover:underline">
                    {p.name}
                  </Link>
                  <span className="shrink-0 text-sm">{formatINR(v?.price ?? p.price)}</span>
                </div>
                {s.text ? <p className={`mt-1 text-xs ${muted}`}>{s.text}</p> : null}
                {first ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {p.variants.length > 1
                      ? p.variants.map((x) => (
                          <button
                            key={x.sku}
                            type="button"
                            disabled={!x.inStock}
                            onClick={() => setSel((m) => ({ ...m, [p._id]: x.sku }))}
                            aria-pressed={x.sku === v?.sku}
                            title={x.name}
                            className={`h-6 w-6 rounded-full border border-ink/15 ring-offset-1 disabled:opacity-30 ${x.sku === v?.sku ? "ring-2 ring-violet" : ""}`}
                            style={{ background: x.hex || "#eee" }}
                          >
                            <span className="sr-only">{x.name}</span>
                          </button>
                        ))
                      : null}
                    <label className={`ml-auto flex items-center gap-1.5 text-[11px] ${muted}`}>
                      <input type="checkbox" checked={!!include[p._id]} disabled={!p.inStock} onChange={(e) => setInclude((m) => ({ ...m, [p._id]: e.target.checked }))} className="accent-violet" />
                      {p.inStock ? "Include" : "Sold out"}
                    </label>
                  </div>
                ) : (
                  <p className={`mt-1 text-[11px] ${muted}`}>Same product as an earlier step</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm">
          {chosen.length} item{chosen.length === 1 ? "" : "s"} · <strong className="font-display text-2xl">{formatINR(total)}</strong>
        </p>
        <button
          disabled={!chosen.length}
          onClick={() => addMany(chosen.map((s) => ({ kind: "product" as const, productId: s.product._id, sku: sel[s.product._id]!, qty: 1 })))}
          className={dark ? "btn-blush" : "btn-plum"}
        >
          Add {chosen.length === uniq.length ? "all" : "selected"} to bag
        </button>
      </div>
    </div>
  );
}
