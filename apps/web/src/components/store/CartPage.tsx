"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { formatINR } from "@svateh/core";
import type { ProductCard } from "@svateh/db";
import { CartLines, FreeShippingBar } from "./CartDrawer";
import { useCart } from "./cart-context";
import { ProductVisual } from "./ProductVisual";

export function CouponField() {
  const { couponCode, setCoupon, quote } = useCart();
  const [code, setCode] = useState(couponCode);
  return (
    <div>
      {/* Not a <form>: this field also sits inside the checkout form. */}
      <div className="flex gap-2">
        <label htmlFor="coupon" className="sr-only">
          Coupon code
        </label>
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (code.trim()) setCoupon(code);
            }
          }}
          placeholder="Coupon code"
          className="field !rounded-full uppercase"
        />
        {couponCode ? (
          <button
            type="button"
            onClick={() => {
              setCoupon("");
              setCode("");
            }}
            className="btn-outline !border-ink/30 !px-4"
          >
            Remove
          </button>
        ) : (
          <button type="button" onClick={() => setCoupon(code)} className="btn-plum !px-5" disabled={!code.trim()}>
            Apply
          </button>
        )}
      </div>
      {quote?.coupon ? <p className={`mt-2 text-xs ${quote.coupon.valid ? "text-violet" : "text-red-700"}`}>{quote.coupon.message}</p> : null}
    </div>
  );
}

export function CartPage({ recommendations }: { recommendations: ProductCard[] }) {
  const { lines, quote, ready, add } = useCart();
  const hasErrors = quote?.lines.some((l) => l.error);
  const inCart = new Set(lines.flatMap((l) => (l.kind === "product" ? [l.productId] : l.selections.map((s) => s.productId))));
  const recs = recommendations.filter((p) => !inCart.has(p._id) && p.inStock).slice(0, 3);

  if (ready && !lines.length) {
    return (
      <div className="py-20 text-center">
        <p className="display text-5xl">Your bag is empty.</p>
        <p className="mt-4 text-sm text-ink/70">Pamper yourself — the world can wait.</p>
        <Link href="/shop" className="btn-plum mt-8">
          Explore the edit
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <div>
        {quote ? (
          <div className="mb-4 bg-white p-5">
            <FreeShippingBar quote={quote} />
          </div>
        ) : null}
        <div className="bg-white px-5">
          <CartLines />
        </div>
        {recs.length ? (
          <div className="mt-10">
            <p className="eyebrow !text-violet">Complete your look</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {recs.map((p) => {
                const v = p.variants.find((x) => x.inStock)!;
                return (
                  <div key={p._id} className="flex items-center gap-3 bg-white p-3">
                    <Link href={`/products/${p.slug}`} className="relative h-16 w-14 shrink-0 overflow-hidden">
                      <ProductVisual name={p.name} image={p.images[0]} hex={v?.hex} sizes="56px" className="absolute inset-0" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg leading-tight">{p.name}</p>
                      <p className="text-xs text-ink/60">{formatINR(v?.price ?? p.price)}</p>
                    </div>
                    <button onClick={() => add({ kind: "product", productId: p._id, sku: v.sku, qty: 1 }, { silent: true })} className="flex h-9 w-9 items-center justify-center rounded-full bg-plum text-white" aria-label={`Add ${p.name}`}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      <aside className="h-fit space-y-5 bg-white p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl">Order summary</h2>
        <CouponField />
        <dl className="space-y-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatINR(quote?.subtotal ?? 0)}</dd>
          </div>
          {quote?.discount ? (
            <div className="flex justify-between text-violet">
              <dt>Discount</dt>
              <dd>−{formatINR(quote.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between text-ink/70">
            <dt>Shipping</dt>
            <dd>{quote ? (quote.shippingFee ? formatINR(quote.shippingFee) : "Free") : "—"}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium">
            <dt>Estimated total</dt>
            <dd>{formatINR(quote?.total ?? 0)}</dd>
          </div>
        </dl>
        {hasErrors ? <p className="rounded-lg bg-red-50 p-3 text-xs text-red-800">Please fix the items marked above before checking out.</p> : null}
        <Link href={hasErrors ? "#" : "/checkout"} aria-disabled={hasErrors} className={`btn-plum w-full ${hasErrors ? "pointer-events-none opacity-50" : ""}`}>
          Checkout securely
        </Link>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink/60">
          <ShieldCheck className="h-3.5 w-3.5" /> UPI · Cards · Netbanking · Cash on Delivery
        </p>
      </aside>
    </div>
  );
}
