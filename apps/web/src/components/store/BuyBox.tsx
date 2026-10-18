"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Minus, Plus, RotateCcw, Truck } from "lucide-react";
import type { ProductDetail } from "@svateh/db";
import { formatINR, labelOf, SKIN_DEPTHS, UNDERTONES } from "@svateh/core";
import { useCart } from "./cart-context";
import { ProductVisual } from "./ProductVisual";
import { Badge, Price, Stars } from "./ui";

type Props = {
  product: ProductDetail;
  dispatchNote: string;
  returnsNote: string;
  freeShippingThreshold: number | null;
  initialShade?: string;
};

export function ProductHero({ product, dispatchNote, returnsNote, freeShippingThreshold, initialShade }: Props) {
  const { add, notify } = useCart();
  const initial =
    product.variants.find((v) => v.name.toLowerCase() === initialShade?.toLowerCase()) ?? product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [sku, setSku] = useState(initial?.sku);
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const v = product.variants.find((x) => x.sku === sku) ?? initial;

  const images = [...(v?.image ? [v.image] : []), ...product.images.filter((i) => i !== v?.image)];

  useEffect(() => setImgIndex(0), [sku]);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e!.isIntersecting && e!.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const addToBag = () => {
    if (!v?.inStock) return notify("This shade is sold out");
    if (qty > v.stock) return notify(`Only ${v.stock} left in this shade`);
    add({ kind: "product", productId: product._id, sku: v.sku, qty });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="relative aspect-square overflow-hidden bg-white sm:aspect-[4/5]">
          <ProductVisual name={product.name} image={images[imgIndex]} hex={v?.hex} priority sizes="(max-width:1024px) 100vw, 55vw" className="absolute inset-0" />
          <div className="absolute top-4 left-4 flex gap-1.5">
            {product.badges.map((b) => (
              <Badge key={b} value={b} />
            ))}
          </div>
        </div>
        {images.length > 1 ? (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button key={src} onClick={() => setImgIndex(i)} className={`relative h-20 w-20 shrink-0 overflow-hidden ${i === imgIndex ? "ring-2 ring-violet" : "opacity-70 hover:opacity-100"}`} aria-label={`Image ${i + 1}`}>
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Buy box */}
      <div>
        {product.category ? <p className="eyebrow !text-violet">{product.category.name}</p> : null}
        <h1 className="display mt-3 text-[clamp(44px,6vw,76px)]">{product.name}</h1>
        <p className="mt-3 text-sm text-ink/70">{[product.productType, product.tagline, product.size].filter(Boolean).join(" · ")}</p>
        {product.rating.count > 0 ? (
          <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-xs text-ink/70 hover:text-violet">
            <Stars value={product.rating.average} /> {product.rating.average} · {product.rating.count} review{product.rating.count === 1 ? "" : "s"}
          </a>
        ) : null}
        <Price price={v?.price ?? product.price} compareAt={product.compareAtPrice} className="mt-6 block text-2xl" />
        <p className="mt-1 text-[11px] text-ink/55">Inclusive of all taxes</p>

        {product.variants.length > 1 || product.variants[0]?.name !== "Standard" ? (
          <fieldset className="mt-8">
            <legend className="mb-3 text-xs tracking-wide">
              Shade: <strong>{v?.name}</strong>
              {v?.description ? <span className="text-ink/60"> — {v.description}</span> : null}
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((x) => (
                <label key={x.sku} title={x.name + (x.inStock ? "" : " — sold out")} className="cursor-pointer">
                  <input type="radio" name="shade" value={x.sku} checked={x.sku === v?.sku} onChange={() => setSku(x.sku)} className="peer sr-only" />
                  <span className={`relative block h-10 w-10 rounded-full border border-ink/15 ring-offset-2 ring-offset-cream transition peer-checked:ring-2 peer-checked:ring-violet peer-focus-visible:ring-2 peer-focus-visible:ring-blush ${x.inStock ? "" : "opacity-40"}`} style={{ background: x.hex || "#eee" }}>
                    {!x.inStock ? <span className="absolute top-1/2 left-1/2 h-px w-12 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink/50" /> : null}
                  </span>
                  <span className="sr-only">{x.name}</span>
                </label>
              ))}
            </div>
            {v && (v.depth || v.undertone) ? (
              <p className="mt-3 text-xs text-ink/60">
                Best for {[labelOf(SKIN_DEPTHS, v.depth), v.undertone ? `${labelOf(UNDERTONES, v.undertone).toLowerCase()} undertones` : ""].filter(Boolean).join(" skin with ")}
              </p>
            ) : null}
          </fieldset>
        ) : null}

        <div className="mt-8 flex items-stretch gap-3">
          <div className="flex items-center rounded-full border border-ink/25">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3.5" aria-label="Decrease quantity">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm" aria-live="polite" aria-label="Quantity">
              {qty}
            </span>
            <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="p-3.5" aria-label="Increase quantity">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button ref={buttonRef} onClick={addToBag} disabled={!v?.inStock} className="btn-plum flex-1">
            {v?.inStock ? `Add to bag · ${formatINR((v.price ?? product.price) * qty)}` : "Sold out"}
          </button>
        </div>
        {v?.inStock && v.stock <= 5 ? <p className="mt-2 text-xs text-violet">Only {v.stock} left in this shade</p> : null}

        <ul className="mt-8 space-y-3 border-t border-ink/10 pt-6 text-sm">
          <li className="flex gap-3">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span>
              {dispatchNote}
              {freeShippingThreshold != null ? ` · Free shipping over ${formatINR(freeShippingThreshold)}` : ""}
            </span>
          </li>
          {returnsNote ? (
            <li className="flex gap-3">
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                {returnsNote} ·{" "}
                <a href="/returns-policy" className="underline">
                  Returns policy
                </a>
              </span>
            </li>
          ) : null}
        </ul>
      </div>

      {/* Sticky mobile add-to-bag */}
      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 p-3 backdrop-blur transition-transform lg:hidden ${showSticky ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!showSticky}>
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 shrink-0 rounded-full border border-ink/10" style={{ background: v?.hex || "var(--blush)" }} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg leading-none">{product.name}</p>
            <p className="truncate text-[11px] text-ink/60">{v?.name}</p>
          </div>
          <button onClick={addToBag} disabled={!v?.inStock} tabIndex={showSticky ? 0 : -1} className="btn-plum !px-5 !py-3">
            {v?.inStock ? `Add · ${formatINR(v.price ?? product.price)}` : "Sold out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AddAllButton({ items, label = "Add all to bag", className = "btn-plum" }: { items: { productId: string; sku: string }[]; label?: string; className?: string }) {
  const { addMany } = useCart();
  return (
    <button onClick={() => addMany(items.map((i) => ({ kind: "product" as const, productId: i.productId, sku: i.sku, qty: 1 })))} disabled={!items.length} className={className}>
      {label}
    </button>
  );
}
