"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { formatINR } from "@svateh/core";
import type { ProductCard } from "@svateh/db";
import { useCart } from "./cart-context";
import { ProductVisual } from "./ProductVisual";

function ShadePicker({ product, value, onChange }: { product: ProductCard; value?: string; onChange: (sku: string) => void }) {
  if (product.variants.length <= 1) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={`${product.name} shade`}>
      {product.variants.map((v) => (
        <button
          key={v.sku}
          type="button"
          role="radio"
          aria-checked={value === v.sku}
          disabled={!v.inStock}
          title={v.name + (v.inStock ? "" : " — sold out")}
          onClick={() => onChange(v.sku)}
          className={`h-8 w-8 rounded-full border border-ink/15 ring-offset-2 transition disabled:opacity-30 ${value === v.sku ? "ring-2 ring-violet" : ""}`}
          style={{ background: v.hex || "#eee" }}
        >
          <span className="sr-only">{v.name}</span>
        </button>
      ))}
    </div>
  );
}

const firstSku = (p: ProductCard) => (p.variants.length === 1 ? p.variants[0]?.sku : undefined);

/** Bundle page: choose a shade for each product, then add the whole bundle. */
export function BundleBuilder({ bundle }: { bundle: { _id: string; name: string; price: number; individualTotal: number; savings: number; items: { quantity: number; product: ProductCard }[] } }) {
  const { add } = useCart();
  const [sel, setSel] = useState<Record<string, string | undefined>>(() => Object.fromEntries(bundle.items.map((i) => [i.product._id, firstSku(i.product)])));
  const complete = bundle.items.every((i) => sel[i.product._id]);
  const soldOut = bundle.items.some((i) => !i.product.inStock);

  return (
    <div>
      <ul className="divide-y divide-ink/10 border-y border-ink/10">
        {bundle.items.map(({ product, quantity }) => {
          const v = product.variants.find((x) => x.sku === sel[product._id]);
          return (
            <li key={product._id} className="flex gap-4 py-5">
              <Link href={`/products/${product.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden">
                <ProductVisual name={product.name} image={v?.image || product.images[0]} hex={v?.hex} sizes="80px" className="absolute inset-0" />
              </Link>
              <div className="flex-1">
                <div className="flex justify-between gap-3">
                  <p className="font-display text-xl">
                    {product.name}
                    {quantity > 1 ? ` × ${quantity}` : ""}
                  </p>
                  <span className="text-sm text-ink/60">{formatINR(product.price * quantity)}</span>
                </div>
                <p className="text-xs text-ink/60">{v ? v.name : product.variants.length > 1 ? "Choose a shade" : product.tagline}</p>
                <ShadePicker product={product} value={sel[product._id]} onChange={(sku) => setSel((s) => ({ ...s, [product._id]: sku }))} />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-xs text-ink/60">Bundle price</p>
          <p className="font-display text-4xl">{formatINR(bundle.price)}</p>
          {bundle.savings > 0 ? (
            <p className="text-sm text-violet">
              <s className="mr-2 text-ink/45">{formatINR(bundle.individualTotal)}</s>You save {formatINR(bundle.savings)}
            </p>
          ) : null}
        </div>
      </div>
      <button
        disabled={!complete || soldOut}
        onClick={() => add({ kind: "bundle", bundleId: bundle._id, qty: 1, selections: bundle.items.map((i) => ({ productId: i.product._id, sku: sel[i.product._id]! })) })}
        className="btn-plum mt-6 w-full"
      >
        {soldOut ? "Currently unavailable" : complete ? "Add bundle to bag" : "Choose all shades to continue"}
      </button>
    </div>
  );
}

type ByobStep = { label: string; help?: string; products: ProductCard[] };

export function ByobBuilder({ steps, discountType, discountValue }: { steps: ByobStep[]; discountType: string; discountValue: number }) {
  const { add } = useCart();
  const [picks, setPicks] = useState<({ productId: string; sku?: string } | null)[]>(steps.map(() => null));

  const items = picks.map((p, i) => {
    if (!p) return null;
    const product = steps[i]!.products.find((x) => x._id === p.productId)!;
    const variant = product.variants.find((v) => v.sku === p.sku);
    return { product, variant };
  });
  const full = items.reduce((s, it) => s + (it ? (it.variant?.price ?? it.product.price) : 0), 0);
  let price = full;
  if (discountType === "percent") price = Math.round(full * (1 - discountValue / 100));
  if (discountType === "flat") price = Math.max(0, full - discountValue);
  const complete = items.every((it) => it?.variant);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <ol className="space-y-12">
        {steps.map((step, i) => (
          <li key={i}>
            <p className="eyebrow !text-violet">Step {i + 1}</p>
            <h2 className="mt-2 font-display text-3xl">{step.label}</h2>
            {step.help ? <p className="mt-1 text-sm text-ink/60">{step.help}</p> : null}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {step.products.map((p) => {
                const picked = picks[i]?.productId === p._id;
                return (
                  <div key={p._id} className={`rounded-2xl border bg-white p-4 transition ${picked ? "border-violet ring-2 ring-violet" : "border-ink/10"}`}>
                    <button
                      type="button"
                      disabled={!p.inStock}
                      onClick={() => setPicks((x) => x.map((v, j) => (j === i ? { productId: p._id, sku: firstSku(p) } : v)))}
                      className="flex w-full items-center gap-3 text-left disabled:opacity-40"
                    >
                      <span className="relative h-16 w-14 shrink-0 overflow-hidden">
                        <ProductVisual name={p.name} image={p.images[0]} sizes="56px" className="absolute inset-0" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-lg leading-tight">{p.name}</span>
                        <span className="text-xs text-ink/60">{formatINR(p.price)}</span>
                      </span>
                      {picked ? <Check className="h-4 w-4 text-violet" /> : null}
                    </button>
                    {picked ? <ShadePicker product={p} value={picks[i]?.sku} onChange={(sku) => setPicks((x) => x.map((v, j) => (j === i ? { productId: p._id, sku } : v)))} /> : null}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      <aside className="h-fit rounded-3xl bg-plum p-8 text-white lg:sticky lg:top-24">
        <p className="eyebrow">Your bag</p>
        <ul className="mt-5 space-y-3 text-sm">
          {steps.map((s, i) => (
            <li key={i} className="flex justify-between gap-3 border-b border-white/10 pb-3">
              <span className="text-white/60">{s.label.replace(/^Choose (your )?/i, "")}</span>
              <span className="text-right">{items[i] ? `${items[i]!.product.name}${items[i]!.variant ? ` — ${items[i]!.variant!.name}` : " (pick a shade)"}` : "—"}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          {price < full ? <s className="text-sm text-white/50">{formatINR(full)}</s> : null}
          <p className="font-display text-4xl">{formatINR(price)}</p>
          {price < full ? <p className="text-sm text-blush">You save {formatINR(full - price)}</p> : null}
        </div>
        <button
          disabled={!complete}
          onClick={() => {
            add({ kind: "byob", qty: 1, selections: picks.map((p) => ({ productId: p!.productId, sku: p!.sku! })) });
            setPicks(steps.map(() => null));
          }}
          className="btn-blush mt-6 w-full"
        >
          {complete ? "Add my bag" : "Complete every step"}
        </button>
      </aside>
    </div>
  );
}
