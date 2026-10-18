import type { Metadata } from "next";
import { listProducts } from "@svateh/db";
import { CartPage } from "@/components/store/CartPage";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default async function Cart() {
  const recommendations = await listProducts({ featured: true, limit: 8 });
  return (
    <section className="container-x py-12 sm:py-16">
      <h1 className="display mb-10 text-[clamp(44px,6vw,80px)]">Your SVATEH Bag</h1>
      <CartPage recommendations={recommendations} />
    </section>
  );
}
