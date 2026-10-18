import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, formatINR, labelOf, ORDER_STATUSES } from "@svateh/core";
import { customerOrders } from "@svateh/db";
import { AddressBook } from "@/components/store/AddressBook";
import { LoginForm, RegisterForm } from "@/components/store/forms";
import { AccountActions } from "@/components/store/OrderClient";
import { getCustomerProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage() {
  const c: any = await getCustomerProfile();
  if (!c) {
    return (
      <section className="container-x py-14 sm:py-20">
        <h1 className="display mb-12 text-[clamp(44px,6vw,80px)]">My account</h1>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="bg-white p-6 sm:p-10">
            <h2 className="mb-6 font-display text-3xl">Sign in</h2>
            <LoginForm />
          </div>
          <div className="bg-white p-6 sm:p-10">
            <h2 className="mb-2 font-display text-3xl">New here?</h2>
            <p className="mb-6 text-sm text-ink/65">Create an account to track orders and save addresses. You can always check out as a guest too.</p>
            <RegisterForm />
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-ink/65">
          Ordered as a guest? <Link href="/track" className="text-violet underline">Track your order</Link>
        </p>
      </section>
    );
  }
  const orders: any[] = await customerOrders(c._id, c.email);
  return (
    <section className="container-x py-14 sm:py-20">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow !text-violet">My account</p>
          <h1 className="display mt-3 text-[clamp(44px,6vw,80px)]">Hello, {c.name?.split(" ")[0]}.</h1>
        </div>
        <AccountActions />
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="mb-4 font-display text-3xl">Orders</h2>
          {orders.length ? (
            <ul className="divide-y divide-ink/10 bg-white">
              {orders.map((o) => (
                <li key={o._id}>
                  <Link href={`/order/${o.number}?t=${o.accessToken}`} className="flex flex-wrap items-center gap-4 p-5 hover:bg-cream">
                    <span className="font-medium">{o.number}</span>
                    <span className="text-xs text-ink/60">{formatDate(o.createdAt)}</span>
                    <span className="rounded-full bg-cream px-3 py-1 text-[10px] tracking-[0.14em] text-violet uppercase">{labelOf(ORDER_STATUSES, o.status)}</span>
                    <span className="flex-1 truncate text-xs text-ink/60">{o.lines.map((l: any) => l.title).join(", ")}</span>
                    <span className="text-sm">{formatINR(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-white p-8 text-sm text-ink/70">
              No orders yet. <Link href="/shop" className="text-violet underline">Start shopping</Link>
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-4 font-display text-3xl">Addresses</h2>
          <AddressBook initial={c.addresses ?? []} />
          <h2 className="mt-10 mb-2 font-display text-3xl">Profile</h2>
          <p className="text-sm text-ink/70">
            {c.name} · {c.email}
          </p>
          <Link href="/account/forgot" className="mt-2 inline-block text-xs underline">Change password</Link>
        </div>
      </div>
    </section>
  );
}
