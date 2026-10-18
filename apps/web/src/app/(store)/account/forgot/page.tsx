import type { Metadata } from "next";
import { ForgotForm } from "@/components/store/forms";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <section className="container-x max-w-md py-16">
      <h1 className="display mb-4 text-5xl">Reset password</h1>
      <p className="mb-8 text-sm text-ink/70">Enter your email and we’ll send you a link to choose a new password.</p>
      <div className="bg-white p-6 sm:p-8">
        <ForgotForm />
      </div>
    </section>
  );
}
