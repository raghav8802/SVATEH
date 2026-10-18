import type { Metadata } from "next";
import Link from "next/link";
import { TrackForm } from "@/components/store/forms";
import { PageHero } from "@/components/store/ui";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackPage() {
  return (
    <>
      <PageHero eyebrow="Order tracking" title="Where’s my order?" intro="Enter your order number (from your confirmation email) and the email you ordered with." tone="cream" />
      <section className="container-x grid gap-10 pb-20 md:grid-cols-[1.2fr_1fr]">
        <TrackForm />
        <div className="text-sm text-ink/75">
          <p className="font-display text-2xl text-ink">Have an account?</p>
          <p className="mt-2">
            <Link href="/account" className="text-violet underline">Sign in</Link> to see all your orders.
          </p>
          <p className="mt-8 font-display text-2xl text-ink">Order delayed?</p>
          <p className="mt-2">
            We’re sorry. <Link href="/contact" className="text-violet underline">Contact us</Link> with your order number and we’ll look into it right away.
          </p>
        </div>
      </section>
    </>
  );
}
