import type { Metadata } from "next";
import { ResetForm } from "@/components/store/forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <section className="container-x max-w-md py-16">
      <h1 className="display mb-8 text-5xl">New password</h1>
      <div className="bg-white p-6 sm:p-8">{token ? <ResetForm token={token} /> : <p className="text-sm">This link is invalid. Please request a new one.</p>}</div>
    </section>
  );
}
