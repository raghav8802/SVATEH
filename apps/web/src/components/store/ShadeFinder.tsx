"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { formatINR, SKIN_DEPTHS, UNDERTONES } from "@svateh/core";
import type { ProductCard } from "@svateh/db";
import { useCart } from "./cart-context";

type Match = { depth: string; undertone: string; shadeName: string; explanation: string; product: ProductCard };
type BrandMatch = { brand: string; brandShade: string; shadeName: string; explanation: string; product: ProductCard };

const DEPTH_SWATCH: Record<string, string> = { light: "#EBCDB0", "light-medium": "#DDB896", medium: "#C99A72", tan: "#A0704C", deep: "#6E452D" };
const UNDERTONE_HINT: Record<string, string> = {
  warm: "Veins look greenish; gold jewellery flatters you.",
  cool: "Veins look bluish; silver jewellery flatters you.",
  neutral: "A mix of both — gold and silver both suit you.",
  olive: "A greenish-grey cast; skin can look ashy in pink-toned bases.",
  "not-sure": "No problem — we’ll recommend a balanced match.",
};

export function ShadeFinder({ title, intro, matches, brandMatches }: { title: string; intro: string; matches: Match[]; brandMatches: BrandMatch[] }) {
  const [step, setStep] = useState(1);
  const [depth, setDepth] = useState("");
  const [undertone, setUndertone] = useState("");
  const [brand, setBrand] = useState("");
  const [brandShade, setBrandShade] = useState("");
  const { add } = useCart();

  const brands = useMemo(() => [...new Set(brandMatches.map((b) => b.brand))].sort(), [brandMatches]);
  const totalSteps = brands.length ? 3 : 2;

  const result = useMemo(() => {
    const bm = brandMatches.find((b) => b.brand === brand && b.brandShade === brandShade);
    if (bm) return { ...bm, via: `Matched from ${bm.brand} ${bm.brandShade}` };
    const m =
      matches.find((x) => x.depth === depth && x.undertone === undertone) ??
      matches.find((x) => x.depth === depth && x.undertone === "not-sure") ??
      matches.find((x) => x.depth === depth);
    return m ? { ...m, via: "" } : null;
  }, [matches, brandMatches, depth, undertone, brand, brandShade]);

  const variant = result?.product.variants.find((v) => v.name.toLowerCase() === result.shadeName.toLowerCase());

  const Option = ({ selected, onClick, children, swatch }: { selected: boolean; onClick: () => void; children: React.ReactNode; swatch?: string }) => (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`flex items-center gap-4 rounded-2xl border bg-white p-4 text-left transition ${selected ? "border-violet ring-2 ring-violet" : "border-ink/10 hover:border-violet/50"}`}>
      {swatch ? <span className="h-12 w-12 shrink-0 rounded-full border border-ink/10" style={{ background: swatch }} /> : null}
      <span className="flex-1">{children}</span>
      {selected ? <Check className="h-4 w-4 text-violet" /> : null}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <h1 className="display text-[clamp(48px,8vw,96px)]">{title}</h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] text-ink/75">{intro}</p>
      </div>

      {step <= totalSteps ? (
        <div className="mb-8 flex items-center justify-between text-xs text-ink/60">
          <span>
            Step {step} of {totalSteps}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <span key={i} className={`h-1.5 w-10 rounded-full ${i < step ? "bg-violet" : "bg-ink/15"}`} />
            ))}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <section>
          <h2 className="mb-5 font-display text-3xl">What’s your skin depth?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SKIN_DEPTHS.map((d) => (
              <Option key={d.value} selected={depth === d.value} swatch={DEPTH_SWATCH[d.value]} onClick={() => (setDepth(d.value), setStep(2))}>
                <span className="font-display text-xl">{d.label}</span>
              </Option>
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section>
          <h2 className="mb-5 font-display text-3xl">And your undertone?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {UNDERTONES.map((u) => (
              <Option key={u.value} selected={undertone === u.value} onClick={() => (setUndertone(u.value), setStep(brands.length ? 3 : 4))}>
                <span className="block font-display text-xl">{u.label}</span>
                <span className="text-xs text-ink/60">{UNDERTONE_HINT[u.value]}</span>
              </Option>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="mt-6 inline-flex items-center gap-1 text-xs text-ink/60 hover:text-violet">
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section>
          <h2 className="mb-2 font-display text-3xl">Already have a foundation match?</h2>
          <p className="mb-5 text-sm text-ink/65">Optional — choose your current brand and shade and we’ll use it to refine the match.</p>
          <div className="grid gap-3 rounded-2xl bg-white p-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="sf-brand">Brand</label>
              <select id="sf-brand" value={brand} onChange={(e) => (setBrand(e.target.value), setBrandShade(""))} className="field">
                <option value="">Choose a brand</option>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sf-shade">Shade</label>
              <select id="sf-shade" value={brandShade} onChange={(e) => setBrandShade(e.target.value)} className="field" disabled={!brand}>
                <option value="">Choose a shade</option>
                {brandMatches
                  .filter((b) => b.brand === brand)
                  .map((b) => (
                    <option key={b.brandShade}>{b.brandShade}</option>
                  ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <button onClick={() => setStep(4)} className="btn-plum">
              {brand && brandShade ? "See my match" : "Skip & see my match"}
            </button>
            <button onClick={() => setStep(2)} className="inline-flex items-center gap-1 text-xs text-ink/60 hover:text-violet">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="overflow-hidden rounded-3xl bg-white">
          {result ? (
            <div className="grid md:grid-cols-[1fr_1.3fr]">
              <div className="flex min-h-64 items-center justify-center p-10" style={{ background: variant?.hex || DEPTH_SWATCH[depth] || "var(--blush)" }}>
                <span className="h-36 w-36 rounded-full border-8 border-white/70 shadow-2xl" style={{ background: variant?.hex || DEPTH_SWATCH[depth] }} />
              </div>
              <div className="p-8 sm:p-10">
                <p className="eyebrow !text-violet">Your match</p>
                <h2 className="mt-3 font-display text-4xl">{result.shadeName}</h2>
                <p className="mt-1 text-sm text-ink/65">
                  {result.product.name}
                  {variant ? ` · ${formatINR(variant.price)}` : ""}
                </p>
                {result.via ? <p className="mt-4 text-xs text-ink/60">{result.via}</p> : null}
                {result.explanation ? <p className="mt-4 text-[15px] leading-relaxed text-ink/80">{result.explanation}</p> : null}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/products/${result.product.slug}?shade=${encodeURIComponent(result.shadeName)}`} className="btn-plum">
                    Shop my shade
                  </Link>
                  {variant?.inStock ? (
                    <button onClick={() => add({ kind: "product", productId: result.product._id, sku: variant.sku, qty: 1 })} className="btn-outline !border-ink/30">
                      Add to bag
                    </button>
                  ) : null}
                </div>
                <button onClick={() => setStep(1)} className="mt-8 text-xs text-ink/60 underline hover:text-violet">
                  Not quite right? Change my answers
                </button>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="font-display text-3xl">We’d love to help personally.</p>
              <p className="mt-3 text-sm text-ink/70">We don’t have a confident match for that combination yet. Tell us about your skin and our team will recommend a shade.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/contact" className="btn-plum">
                  Ask our team
                </Link>
                <button onClick={() => setStep(1)} className="btn-outline !border-ink/30">
                  Start again
                </button>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
