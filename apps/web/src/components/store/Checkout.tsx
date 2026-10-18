"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Banknote, CreditCard, Lock } from "lucide-react";
import { formatINR, INDIAN_STATES, type Quote } from "@svateh/core";
import { openRazorpay } from "@/lib/razorpay-client";
import { CouponField } from "./CartPage";
import { useCart } from "./cart-context";
import { FormError, postJson } from "./forms";
import { ProductVisual } from "./ProductVisual";

type Address = { name: string; phone: string; line1: string; line2: string; landmark: string; city: string; state: string; pincode: string };
type Customer = { name: string; email: string; phone: string; addresses: (Address & { label?: string; isDefault?: boolean })[] } | null;

const EMPTY: Address = { name: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "" };
const DRAFT_KEY = "svateh_checkout_draft";

export function Checkout({ customer, onlineAvailable }: { customer: Customer; onlineAvailable: boolean }) {
  const { lines, couponCode, ready, clear } = useCart();
  const router = useRouter();
  const saved = customer?.addresses.find((a) => a.isDefault) ?? customer?.addresses[0];
  const [email, setEmail] = useState(customer?.email ?? "");
  const [addr, setAddr] = useState<Address>(saved ? { ...EMPTY, ...saved } : { ...EMPTY, name: customer?.name ?? "", phone: customer?.phone ?? "" });
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"razorpay" | "cod">(onlineAvailable ? "razorpay" : "cod");
  const [notes, setNotes] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const idem = useRef<{ key: string; hash: string } | null>(null);

  // Restore a guest's draft so a refresh doesn't lose their details.
  useEffect(() => {
    if (customer) return;
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null");
      if (d) {
        setEmail(d.email ?? "");
        setAddr({ ...EMPTY, ...d.addr });
      }
    } catch {
      /* ignore */
    }
  }, [customer]);
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ email, addr }));
    } catch {
      /* ignore */
    }
  }, [email, addr]);

  const pincode = /^[1-9]\d{5}$/.test(addr.pincode) ? addr.pincode : "";

  useEffect(() => {
    if (!ready || !lines.length) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch("/api/cart/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, couponCode, pincode, deliveryOption: delivery, paymentMethod: payment }),
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((q: Quote) => {
          setQuote(q);
          if (payment === "cod" && !q.payment.cod && q.payment.razorpay && onlineAvailable) setPayment("razorpay");
        })
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [ready, lines, couponCode, pincode, delivery, payment, onlineAvailable]);

  const payload = useMemo(
    () => ({ lines, couponCode, pincode: addr.pincode, deliveryOption: delivery, paymentMethod: payment, email, address: addr, marketingOptIn: optIn, notes }),
    [lines, couponCode, delivery, payment, email, addr, optIn, notes],
  );

  if (ready && !lines.length) {
    return (
      <div className="py-20 text-center">
        <p className="display text-5xl">Your bag is empty.</p>
        <Link href="/shop" className="btn-plum mt-8">
          Explore the edit
        </Link>
      </div>
    );
  }

  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setAddr((a) => ({ ...a, [k]: e.target.value }));
  const fe = (k: string) => (fieldErrors[k] ? <p className="mt-1 text-xs text-red-700">{fieldErrors[k]}</p> : null);

  const lineErrors = quote?.lines.filter((l) => l.error) ?? [];
  const pinBad = quote?.pincode && !quote.pincode.serviceable;
  const codDisabled = !quote?.payment.cod;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFieldErrors({});
    const hash = JSON.stringify(payload);
    if (!idem.current || idem.current.hash !== hash) idem.current = { key: crypto.randomUUID(), hash };
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, idempotencyKey: idem.current.key }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setFieldErrors(Object.fromEntries(data.fields.map((f: any) => [f.path.replace(/^address\./, ""), f.message])));
        throw new Error(data.error || "Couldn’t place your order.");
      }
      const done = () => {
        clear();
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        router.push(`/order/${data.order.number}?t=${data.order.token}`);
      };
      if (!data.razorpay) return done();
      const result = await openRazorpay(data.razorpay, `Order ${data.order.number}`);
      if (!result.ok) {
        setError(result.reason === "failed" ? `Payment failed: ${result.message ?? "please try again"}. You haven’t been charged — you can retry or choose Cash on Delivery.` : "Payment was not completed. Your bag is saved — tap “Place order” to try again.");
        return;
      }
      await postJson("/api/payments/razorpay/verify", result.response);
      done();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-10 lg:grid-cols-[1.4fr_1fr]" noValidate>
      <div className="space-y-8">
        <section className="bg-white p-6 sm:p-8">
          <h2 className="mb-5 font-display text-2xl">1. Contact</h2>
          {!customer ? (
            <p className="mb-4 text-xs text-ink/60">
              Have an account?{" "}
              <Link href="/account/login?next=/checkout" className="text-violet underline">
                Sign in
              </Link>{" "}
              — or continue as a guest.
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="co-email">Email *</label>
              <input id="co-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" />
              {fe("email")}
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-xs text-ink/70">
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="accent-violet" /> Email me new launches and offers
          </label>
        </section>

        <section className="bg-white p-6 sm:p-8">
          <h2 className="mb-5 font-display text-2xl">2. Delivery address</h2>
          {customer?.addresses.length ? (
            <div className="mb-5 flex flex-wrap gap-2">
              {customer.addresses.map((a, i) => (
                <button type="button" key={i} onClick={() => setAddr({ ...EMPTY, ...a })} className="rounded-full border border-ink/20 px-4 py-2 text-xs hover:border-violet">
                  {a.label || a.city} · {a.pincode}
                </button>
              ))}
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="co-name">Full name *</label>
              <input id="co-name" required value={addr.name} onChange={set("name")} className="field" autoComplete="name" />
              {fe("name")}
            </div>
            <div>
              <label className="label" htmlFor="co-phone">Mobile number *</label>
              <input id="co-phone" type="tel" required value={addr.phone} onChange={set("phone")} className="field" autoComplete="tel" inputMode="tel" placeholder="10-digit mobile" />
              {fe("phone")}
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="co-l1">Flat, house no., building, street *</label>
              <input id="co-l1" required value={addr.line1} onChange={set("line1")} className="field" autoComplete="address-line1" />
              {fe("line1")}
            </div>
            <div>
              <label className="label" htmlFor="co-l2">Area, locality</label>
              <input id="co-l2" value={addr.line2} onChange={set("line2")} className="field" autoComplete="address-line2" />
            </div>
            <div>
              <label className="label" htmlFor="co-lm">Landmark</label>
              <input id="co-lm" value={addr.landmark} onChange={set("landmark")} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="co-pin">PIN code *</label>
              <input id="co-pin" required value={addr.pincode} onChange={(e) => setAddr((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} className="field" inputMode="numeric" autoComplete="postal-code" />
              {fe("pincode")}
              {quote?.pincode ? <p className={`mt-1 text-xs ${quote.pincode.serviceable ? "text-violet" : "text-red-700"}`}>{quote.pincode.serviceable ? "✓ We deliver here" : quote.pincode.message}</p> : null}
            </div>
            <div>
              <label className="label" htmlFor="co-city">City *</label>
              <input id="co-city" required value={addr.city} onChange={set("city")} className="field" autoComplete="address-level2" />
              {fe("city")}
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="co-state">State *</label>
              <select id="co-state" required value={addr.state} onChange={set("state")} className="field" autoComplete="address-level1">
                <option value="">Choose your state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {fe("state")}
            </div>
          </div>
        </section>

        <section className="bg-white p-6 sm:p-8">
          <h2 className="mb-5 font-display text-2xl">3. Delivery</h2>
          <div className="space-y-3">
            {(quote?.deliveryOptions ?? []).map((o) => (
              <label key={o.id} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 ${delivery === o.id ? "border-violet ring-1 ring-violet" : "border-ink/15"}`}>
                <input type="radio" name="delivery" checked={delivery === o.id} onChange={() => setDelivery(o.id)} className="accent-violet" />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{o.label}</span>
                  <span className="text-xs text-ink/60">{o.eta}</span>
                </span>
                <span className="text-sm">{o.fee ? formatINR(o.fee) : "Free"}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 sm:p-8">
          <h2 className="mb-5 font-display text-2xl">4. Payment</h2>
          <div className="space-y-3">
            {onlineAvailable && quote?.payment.razorpay !== false ? (
              <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 ${payment === "razorpay" ? "border-violet ring-1 ring-violet" : "border-ink/15"}`}>
                <input type="radio" name="payment" checked={payment === "razorpay"} onChange={() => setPayment("razorpay")} className="accent-violet" />
                <CreditCard className="h-5 w-5 text-gold" />
                <span className="flex-1">
                  <span className="block text-sm font-medium">Pay online</span>
                  <span className="text-xs text-ink/60">UPI, cards, netbanking & wallets via Razorpay</span>
                </span>
              </label>
            ) : null}
            <label className={`flex items-center gap-4 rounded-xl border p-4 ${codDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${payment === "cod" ? "border-violet ring-1 ring-violet" : "border-ink/15"}`}>
              <input type="radio" name="payment" checked={payment === "cod"} disabled={codDisabled} onChange={() => setPayment("cod")} className="accent-violet" />
              <Banknote className="h-5 w-5 text-gold" />
              <span className="flex-1">
                <span className="block text-sm font-medium">Cash on Delivery</span>
                <span className="text-xs text-ink/60">{codDisabled ? (quote?.payment.codReason ?? "Not available for this order") : quote && quote.codFee ? `COD fee ${formatINR(quote.codFee)}` : "Pay when your order arrives"}</span>
              </span>
            </label>
          </div>
          <div className="mt-5">
            <label className="label" htmlFor="co-notes">Order notes (optional)</label>
            <input id="co-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} className="field" placeholder="Anything we should know for delivery?" />
          </div>
        </section>
      </div>

      <aside className="h-fit space-y-5 bg-white p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl">5. Review your order</h2>
        <ul className="divide-y divide-ink/10">
          {(quote?.lines ?? []).map((l, i) => (
            <li key={i} className="flex gap-3 py-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden">
                <ProductVisual name={l.title} image={l.image} hex={l.items[0]?.hex} sizes="56px" className="absolute inset-0" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-plum text-[10px] text-white">{l.qty}</span>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{l.title}</p>
                <p className="truncate text-xs text-ink/60">{l.kind === "product" ? l.subtitle : l.items.map((it) => it.variantName).join(" · ")}</p>
                {l.error ? <p className="text-xs text-red-700">{l.error}</p> : null}
              </div>
              <span className="text-sm">{formatINR(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <CouponField />
        <dl className="space-y-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatINR(quote?.subtotal ?? 0)}</dd>
          </div>
          {quote?.discount ? (
            <div className="flex justify-between text-violet">
              <dt>Discount {quote.coupon?.valid ? `(${quote.coupon.code})` : ""}</dt>
              <dd>−{formatINR(quote.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{quote?.shippingFee ? formatINR(quote.shippingFee) : "Free"}</dd>
          </div>
          {quote?.codFee ? (
            <div className="flex justify-between">
              <dt>COD fee</dt>
              <dd>{formatINR(quote.codFee)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-ink/10 pt-3 text-lg font-medium">
            <dt>{payment === "cod" ? "Pay on delivery" : "Total"}</dt>
            <dd>{formatINR(quote?.total ?? 0)}</dd>
          </div>
          <p className="text-[11px] text-ink/55">Inclusive of all taxes. No hidden fees.</p>
        </dl>
        <FormError msg={error} />
        <button type="submit" disabled={busy || !quote || lineErrors.length > 0 || !!pinBad} className="btn-plum w-full !py-4">
          <Lock className="h-3.5 w-3.5" />
          {busy ? "Placing order…" : payment === "cod" ? `Place order · ${formatINR(quote?.total ?? 0)}` : `Pay ${formatINR(quote?.total ?? 0)}`}
        </button>
        <p className="text-center text-[11px] text-ink/55">
          By placing your order you agree to our{" "}
          <Link href="/terms" className="underline">terms</Link>,{" "}
          <Link href="/shipping-policy" className="underline">shipping</Link> and{" "}
          <Link href="/returns-policy" className="underline">returns</Link> policies.
        </p>
      </aside>
    </form>
  );
}
