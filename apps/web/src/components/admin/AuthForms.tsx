"use client";

import Link from "next/link";
import { useState } from "react";
import { FormError, postJson } from "@/components/store/forms";

export function AuthShell({ title, children, brand }: { title: string; children: React.ReactNode; brand: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-plum p-4">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center font-display text-3xl tracking-[0.16em] text-white">
          {brand} <span className="align-middle text-[10px] tracking-[0.2em] text-gold">ADMIN</span>
        </p>
        <div className="rounded-2xl bg-white p-7 shadow-2xl">
          <h1 className="mb-6 font-display text-2xl">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

const data = (e: React.FormEvent<HTMLFormElement>) => Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;

export function AdminLoginForm({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await postJson("/api/admin/login", data(e));
          window.location.href = next;
        } catch (err: any) {
          setError(err.message);
          setBusy(false);
        }
      }}
    >
      <div>
        <label className="label" htmlFor="a-email">Email</label>
        <input id="a-email" name="email" type="email" required autoComplete="username" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="a-pass">Password</label>
        <input id="a-pass" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      <FormError msg={error} />
      <button disabled={busy} className="btn-plum">{busy ? "Signing in…" : "Sign in"}</button>
      <Link href="/admin/forgot" className="text-center text-xs text-ink/60 underline">Forgot password?</Link>
    </form>
  );
}

export function AdminSetupForm({ needsKey }: { needsKey: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await postJson("/api/admin/setup", data(e));
          window.location.href = "/admin";
        } catch (err: any) {
          setError(err.message);
          setBusy(false);
        }
      }}
    >
      <p className="text-sm text-ink/70">Welcome! Create the owner account for this store. You can add more team members later.</p>
      <div>
        <label className="label" htmlFor="s-name">Your name</label>
        <input id="s-name" name="name" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="s-email">Email</label>
        <input id="s-email" name="email" type="email" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="s-pass">Password (10+ characters)</label>
        <input id="s-pass" name="password" type="password" minLength={10} required autoComplete="new-password" className="field" />
      </div>
      {needsKey ? (
        <div>
          <label className="label" htmlFor="s-key">Setup key</label>
          <input id="s-key" name="setupKey" required className="field" />
          <p className="mt-1 text-xs text-ink/50">From the ADMIN_SETUP_KEY environment variable.</p>
        </div>
      ) : null}
      <FormError msg={error} />
      <button disabled={busy} className="btn-plum">{busy ? "Creating…" : "Create owner account"}</button>
    </form>
  );
}
