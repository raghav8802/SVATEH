import type { Metadata } from "next";
import { getShipping } from "@svateh/db";
import { Checkout } from "@/components/store/Checkout";
import { getCustomerProfile } from "@/lib/auth";
import { razorpayConfigured } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [customer, shipping] = await Promise.all([getCustomerProfile(), getShipping()]);
  return (
    <section className="container-x py-10 sm:py-14">
      <h1 className="display mb-8 text-[clamp(40px,5vw,64px)]">Checkout</h1>
      <Checkout
        customer={customer ? { name: customer.name, email: customer.email, phone: customer.phone ?? "", addresses: customer.addresses ?? [] } : null}
        onlineAvailable={razorpayConfigured() && shipping.razorpayEnabled !== false}
      />
    </section>
  );
}
