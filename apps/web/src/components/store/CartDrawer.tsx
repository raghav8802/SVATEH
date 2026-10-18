"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShieldCheck, X } from "lucide-react";
import { formatINR, type Quote } from "@svateh/core";
import { useCart } from "./cart-context";
import { ProductVisual } from "./ProductVisual";

export function FreeShippingBar({ quote }: { quote: Quote }) {
  if (quote.freeShippingThreshold == null || !quote.subtotal) return null;
  const pct = Math.min(100, ((quote.subtotal - quote.discount) / quote.freeShippingThreshold) * 100);
  return (
    <div>
      <p className="mb-2 text-xs">
        {quote.amountToFreeShipping > 0 ? (
          <>
            You’re <strong>{formatINR(quote.amountToFreeShipping)}</strong> away from free shipping.
          </>
        ) : (
          <>✦ You’ve unlocked free shipping.</>
        )}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartLines({ compact = false }: { compact?: boolean }) {
  const { lines, quote, setQty, remove } = useCart();
  return (
    <ul className="divide-y divide-ink/10">
      {lines.map((line, i) => {
        const q = quote?.lines[i];
        return (
          <li key={i} className="flex gap-4 py-4">
            <Link href={q?.href ?? "#"} className={`relative shrink-0 overflow-hidden ${compact ? "h-24 w-20" : "h-28 w-24"}`}>
              <ProductVisual name={q?.title ?? "SVATEH"} image={q?.image} hex={q?.items[0]?.hex} sizes="96px" className="absolute inset-0" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={q?.href ?? "#"} className="font-display text-lg leading-tight hover:text-violet">
                    {q?.title ?? "…"}
                  </Link>
                  {line.kind !== "product" ? <p className="eyebrow mt-0.5 !text-[9px]">{line.kind === "bundle" ? "Bundle" : "Your bag"}</p> : null}
                  {q?.kind === "product" ? (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/65">
                      {q.items[0]?.hex ? <span className="h-3 w-3 rounded-full border border-ink/10" style={{ background: q.items[0].hex }} /> : null}
                      {q.subtitle}
                    </p>
                  ) : (
                    <ul className="mt-1 space-y-0.5 text-[11px] text-ink/65">
                      {q?.items.map((it) => (
                        <li key={it.sku}>
                          {it.name} — {it.variantName}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button onClick={() => remove(i)} className="p-1 text-ink/50 hover:text-ink" aria-label={`Remove ${q?.title ?? "item"}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              {q?.error ? <p className="mt-1 text-xs text-red-700">{q.error}</p> : null}
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center rounded-full border border-ink/20">
                  <button onClick={() => setQty(i, line.qty - 1)} className="p-2" aria-label="Decrease quantity">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm" aria-live="polite">
                    {line.qty}
                  </span>
                  <button onClick={() => setQty(i, line.qty + 1)} className="p-2" aria-label="Increase quantity">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-right text-sm">
                  {q?.compareAt && q.compareAt > q.unitPrice ? <s className="mr-2 text-xs text-ink/45">{formatINR(q.compareAt * line.qty)}</s> : null}
                  {q ? formatINR(q.lineTotal) : ""}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CartDrawer({ upsell }: { upsell?: React.ReactNode }) {
  const { open, setOpen, lines, quote, loading, toast } = useCart();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const hasErrors = quote?.lines.some((l) => l.error);

  return (
    <>
      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-plum px-5 py-3 text-xs tracking-wide text-white shadow-xl" role="status">
          {toast}
        </div>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your bag">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-cream shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h2 className="font-display text-2xl">Your SVATEH Bag</h2>
              <button onClick={() => setOpen(false)} aria-label="Close bag" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
                <p className="font-display text-3xl">Your bag is empty.</p>
                <p className="text-sm text-ink/70">Pamper yourself — the world can wait.</p>
                <Link href="/shop" onClick={() => setOpen(false)} className="btn-plum">
                  Explore the edit
                </Link>
              </div>
            ) : (
              <>
                {quote ? (
                  <div className="border-b border-ink/10 px-5 py-4">
                    <FreeShippingBar quote={quote} />
                  </div>
                ) : null}
                <div className="flex-1 overflow-y-auto px-5">
                  <CartLines compact />
                  {upsell}
                </div>
                <div className="border-t border-ink/10 bg-white px-5 py-5">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span className={loading ? "opacity-50" : ""}>{formatINR(quote?.subtotal ?? 0)}</span>
                  </div>
                  {quote?.discount ? (
                    <div className="mt-1 flex items-center justify-between text-sm text-violet">
                      <span>Discount</span>
                      <span>−{formatINR(quote.discount)}</span>
                    </div>
                  ) : null}
                  <p className="mt-1 text-xs text-ink/60">Shipping and coupons calculated at checkout.</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href="/cart" onClick={() => setOpen(false)} className="btn-outline !border-ink/30 text-ink">
                      View bag
                    </Link>
                    <Link
                      href={hasErrors ? "/cart" : "/checkout"}
                      onClick={() => setOpen(false)}
                      className="btn-plum"
                      aria-disabled={hasErrors}
                    >
                      Checkout
                    </Link>
                  </div>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink/60">
                    <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout · UPI, cards, netbanking & COD
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
