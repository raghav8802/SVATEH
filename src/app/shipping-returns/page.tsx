import type { Metadata } from "next";
import Link from "next/link";
import { ShippingReturnsContent } from "@/components/shipping-returns/ShippingReturnsContent";
import { shippingReturnsIntro } from "@/lib/shippingReturns";

export const metadata: Metadata = {
  title: "Shipping & Returns | SVATEH",
  description:
    "SVATE returns, refunds and exchanges — 7 days from delivery, shade help, and how to raise a request.",
};

export default function ShippingReturnsPage() {
  return (
    <>
      <section className="bg-[#E9DDCF]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <p className="text-caption font-sans uppercase text-svateh-espresso/70">
            {shippingReturnsIntro.eyebrow}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium uppercase tracking-wide text-svateh-espresso lg:text-6xl">
            {shippingReturnsIntro.title}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-svateh-espresso/80 md:text-base">
            <span className="font-medium text-svateh-espresso">
              Our promise:{" "}
            </span>
            We want you to find your SVATE shade. Check our{" "}
            <Link
              href="/find-your-shade"
              className="underline decoration-svateh-gold/70 underline-offset-4 transition-colors hover:text-svateh-gold"
            >
              Warm • Cool • Neutral • Olive shade guide
            </Link>{" "}
            before you buy — and if something&apos;s still off, here&apos;s how
            we help.
          </p>
        </div>
      </section>
      <ShippingReturnsContent />
    </>
  );
}
