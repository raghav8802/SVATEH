import Link from "next/link";
import { shippingReturnsItems } from "@/lib/shippingReturns";

export function ShippingReturnsContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="space-y-8">
        {shippingReturnsItems.map((item) => (
          <div
            key={item.question}
            className="border-b border-[#E9DDCF]/50 pb-8 last:border-b-0 last:pb-0"
          >
            <h2 className="font-serif text-lg text-svateh-espresso sm:text-xl">
              {item.question}
            </h2>
            {item.answer ? (
              <p className="mt-3 text-sm leading-relaxed text-svateh-mocha sm:text-base">
                {item.email ? (
                  <>
                    Email/message us at{" "}
                    <a
                      href={`mailto:${item.email}`}
                      className="text-svateh-espresso underline decoration-svateh-gold/60 underline-offset-4 transition-colors hover:text-svateh-gold"
                    >
                      {item.email}
                    </a>{" "}
                    with your order ID and photos where relevant — we&apos;ll
                    take it from there.
                  </>
                ) : (
                  item.answer
                )}
              </p>
            ) : null}
            {item.bullets ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-svateh-mocha sm:text-base">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-svateh-mocha">
        Shade questions?{" "}
        <Link
          href="/find-your-shade"
          className="text-svateh-espresso underline decoration-svateh-gold/60 underline-offset-4 transition-colors hover:text-svateh-gold"
        >
          Find your shade
        </Link>
        {" · "}
        <Link
          href="/contact"
          className="text-svateh-espresso underline decoration-svateh-gold/60 underline-offset-4 transition-colors hover:text-svateh-gold"
        >
          Contact us
        </Link>
      </p>
    </div>
  );
}
