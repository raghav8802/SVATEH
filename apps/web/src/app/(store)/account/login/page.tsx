import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/store/forms";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return (
    <section className="container-x max-w-md py-16">
      <h1 className="display mb-8 text-6xl">Sign in</h1>
      <div className="bg-white p-6 sm:p-8">
        <LoginForm next={safeNext} />
      </div>
      <p className="mt-6 text-center text-sm">
        New here? <Link href="/account" className="text-violet underline">Create an account</Link>
      </p>
    </section>
  );
}
