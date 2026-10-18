"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { ProductCard as Card } from "@svateh/db";
import { useCart } from "./cart-context";
import { ProductVisual } from "./ProductVisual";
import { Badge, Price, Stars } from "./ui";

export function ProductCard({ product, priority, tone = "cream" }: { product: Card; priority?: boolean; tone?: "cream" | "white" }) {
  const { add, notify } = useCart();
  const firstInStock = product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [sku, setSku] = useState(firstInStock?.sku);
  const variant = product.variants.find((v) => v.sku === sku) ?? firstInStock;
  const hasShades = product.variants.length > 1;

  const quickAdd = () => {
    if (!variant?.inStock) return notify("This shade is out of stock");
    add({ kind: "product", productId: product._id, sku: variant.sku, qty: 1 });
  };

  return (
    <article className={`group flex flex-col ${tone === "white" ? "bg-white" : "bg-cream"}`}>
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5]" aria-label={product.name}>
        <ProductVisual name={product.name} image={variant?.image || product.images[0]} hex={variant?.hex} priority={priority} className="absolute inset-0 transition duration-500 group-hover:scale-[1.02]" />
        {product.images[1] && !variant?.image ? (
          <ProductVisual name={product.name} image={product.images[1]} className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" />
        ) : null}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.badges.slice(0, 2).map((b) => (
            <Badge key={b} value={b} />
          ))}
          {!product.inStock ? <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[9px] font-semibold tracking-[0.16em] text-white uppercase">Sold out</span> : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[22px] leading-tight sm:text-[25px]">
              <Link href={`/products/${product.slug}`} className="hover:text-violet">
                {product.name}
              </Link>
            </h3>
            <p className="mt-1 text-xs text-ink/65">{[product.productType, product.tagline].filter(Boolean).join(" · ")}</p>
          </div>
          <Price price={variant?.price ?? product.price} compareAt={product.compareAtPrice} className="shrink-0 pt-1 text-sm font-medium" />
        </div>
        {product.rating.count > 0 ? (
          <div className="flex items-center gap-1.5 text-[11px] text-ink/60">
            <Stars value={product.rating.average} size={11} /> {product.rating.average} ({product.rating.count})
          </div>
        ) : null}
        {hasShades ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-1" role="radiogroup" aria-label="Shade">
            {product.variants.slice(0, 8).map((v) => (
              <button
                key={v.sku}
                type="button"
                role="radio"
                aria-checked={v.sku === variant?.sku}
                title={v.name + (v.inStock ? "" : " — sold out")}
                onClick={() => setSku(v.sku)}
                className={`relative h-5 w-5 rounded-full border transition ${v.sku === variant?.sku ? "border-violet ring-2 ring-violet ring-offset-2 ring-offset-cream" : "border-ink/15"} ${v.inStock ? "" : "opacity-40"}`}
                style={{ background: v.hex || "#eee" }}
              >
                <span className="sr-only">{v.name}</span>
              </button>
            ))}
            {product.variants.length > 8 ? <span className="text-[11px] text-ink/60">+{product.variants.length - 8}</span> : null}
            <span className="ml-1 truncate text-[11px] text-ink/60">{variant?.name}</span>
          </div>
        ) : null}
        <div className="mt-auto pt-3">
          <button type="button" onClick={quickAdd} disabled={!variant?.inStock} className="btn-plum w-full !py-3">
            {variant?.inStock ? (
              <>
                <Plus className="h-3.5 w-3.5" /> Quick add
              </>
            ) : (
              "Sold out"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, tone }: { products: Card[]; tone?: "cream" | "white" }) {
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-[18px] ${products.length % 4 === 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {products.map((p, i) => (
        <ProductCard key={p._id} product={p} priority={i < 3} tone={tone} />
      ))}
    </div>
  );
}
