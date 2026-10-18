"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Star, Upload, X } from "lucide-react";
import { uploadFile } from "@/lib/upload-client";

export async function postJson<T = any>(url: string, body: unknown, method = "POST"): Promise<T> {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const run = async (fn: () => Promise<string | void>) => {
    setBusy(true);
    setError("");
    try {
      const msg = await fn();
      setDone(msg || "done");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, done, run, setDone };
}

/** Hidden field that only bots fill in. */
const Honeypot = () => (
  <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden />
);

const formData = (e: React.FormEvent<HTMLFormElement>) => Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;

export function FormError({ msg }: { msg: string }) {
  return msg ? (
    <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
      {msg}
    </p>
  ) : null;
}

export function NewsletterForm({ source = "footer", dark = false }: { source?: string; dark?: boolean }) {
  const s = useSubmit();
  if (s.done) return <p className={`text-sm ${dark ? "text-blush" : "text-violet"}`}>{s.done}</p>;
  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        const d = formData(e);
        s.run(async () => (await postJson("/api/newsletter", { ...d, source })).message);
      }}
    >
      <Honeypot />
      <div className={`flex items-center rounded-full border ${dark ? "border-white/40" : "border-ink/30 bg-white"}`}>
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input id={`nl-${source}`} name="email" type="email" required placeholder="Your email address" className={`min-w-0 flex-1 bg-transparent px-5 py-3 text-sm outline-none ${dark ? "placeholder:text-white/50" : "placeholder:text-ink/40"}`} />
        <button disabled={s.busy} className={`m-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dark ? "bg-blush text-plum" : "bg-plum text-white"}`} aria-label="Subscribe">
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {s.error ? <p className="mt-2 text-xs text-red-300">{s.error}</p> : null}
    </form>
  );
}

export function ContactForm({ defaultOrder = "" }: { defaultOrder?: string }) {
  const s = useSubmit();
  if (s.done)
    return (
      <div className="rounded-2xl bg-white p-8">
        <p className="font-display text-3xl">Thank you.</p>
        <p className="mt-3 text-sm text-ink/70">We’ve received your message and sent a copy to your inbox. We’ll be in touch soon.</p>
      </div>
    );
  return (
    <form
      className="relative grid gap-4 rounded-2xl bg-white p-6 sm:grid-cols-2 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const d = formData(e);
        s.run(() => postJson("/api/contact", d).then(() => undefined));
      }}
    >
      <Honeypot />
      <div>
        <label className="label" htmlFor="c-name">Name *</label>
        <input id="c-name" name="name" required className="field" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="c-email">Email *</label>
        <input id="c-email" name="email" type="email" required className="field" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="c-phone">Phone</label>
        <input id="c-phone" name="phone" type="tel" className="field" autoComplete="tel" />
      </div>
      <div>
        <label className="label" htmlFor="c-order">Order number (if any)</label>
        <input id="c-order" name="orderNumber" defaultValue={defaultOrder} className="field" placeholder="SVH100001" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="c-msg">Message *</label>
        <textarea id="c-msg" name="message" required rows={6} className="field" />
      </div>
      <div className="sm:col-span-2">
        <FormError msg={s.error} />
        <button disabled={s.busy} className="btn-plum mt-2">
          {s.busy ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

export function TrackForm() {
  const s = useSubmit();
  const router = useRouter();
  return (
    <form
      className="grid gap-4 rounded-2xl bg-white p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const d = formData(e);
        s.run(async () => {
          const r = await postJson("/api/orders/track", d);
          router.push(`/order/${r.number}?t=${r.token}`);
        });
      }}
    >
      <div>
        <label className="label" htmlFor="t-num">Order number</label>
        <input id="t-num" name="number" required className="field uppercase" placeholder="SVH100001" />
      </div>
      <div>
        <label className="label" htmlFor="t-email">Email used for the order</label>
        <input id="t-email" name="email" type="email" required className="field" />
      </div>
      <FormError msg={s.error} />
      <button disabled={s.busy} className="btn-plum">
        {s.busy ? "Looking…" : "Track order"}
      </button>
    </form>
  );
}

export function ReviewForm({ productId, productName, shades }: { productId: string; productName: string; shades: string[] }) {
  const s = useSubmit();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  if (s.done) return <p className="rounded-xl bg-white p-5 text-sm">{s.done}</p>;
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn-outline !border-ink/30">
        Write a review
      </button>
    );

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setUploadErr("");
    try {
      for (const f of Array.from(files).slice(0, 4 - images.length)) {
        const url = await uploadFile(f, "/api/uploads/review");
        setImages((x) => [...x, url]);
      }
    } catch (e: any) {
      setUploadErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      className="relative grid gap-4 rounded-2xl bg-white p-6 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const d = formData(e);
        s.run(async () => (await postJson("/api/reviews", { ...d, productId, rating, images })).message);
      }}
    >
      <Honeypot />
      <p className="font-display text-2xl sm:col-span-2">Review {productName}</p>
      <div className="sm:col-span-2">
        <span className="label">Your rating *</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button type="button" key={i} role="radio" aria-checked={rating === i} aria-label={`${i} star${i > 1 ? "s" : ""}`} onClick={() => setRating(i)} className="p-1">
              <Star className={`h-7 w-7 ${i <= rating ? "fill-gold text-gold" : "text-ink/25"}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="r-name">Name *</label>
        <input id="r-name" name="name" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="r-email">Email * (not shown publicly)</label>
        <input id="r-email" name="email" type="email" required className="field" />
      </div>
      {shades.length > 1 ? (
        <div className="sm:col-span-2">
          <label className="label" htmlFor="r-shade">Shade</label>
          <select id="r-shade" name="shade" className="field">
            <option value="">—</option>
            {shades.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="sm:col-span-2">
        <label className="label" htmlFor="r-title">Title *</label>
        <input id="r-title" name="title" required className="field" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="r-body">Your review *</label>
        <textarea id="r-body" name="body" required rows={5} className="field" />
      </div>
      <div className="sm:col-span-2">
        <span className="label">Photos (optional, up to 4)</span>
        <div className="flex flex-wrap gap-2">
          {images.map((u) => (
            <span key={u} className="relative h-20 w-20 overflow-hidden rounded-lg bg-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => setImages((x) => x.filter((y) => y !== u))} className="absolute top-1 right-1 rounded-full bg-white p-0.5" aria-label="Remove photo">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {images.length < 4 ? (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/30 text-[10px] text-ink/60">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Add"}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
            </label>
          ) : null}
        </div>
        {uploadErr ? <p className="mt-1 text-xs text-red-700">{uploadErr}</p> : null}
      </div>
      <div className="sm:col-span-2">
        <FormError msg={s.error} />
        <p className="mb-3 text-xs text-ink/60">Reviews are checked before publishing. Purchases are marked “Verified” when your email matches a delivered order.</p>
        <button disabled={s.busy || uploading || !rating} className="btn-plum">
          {s.busy ? "Sending…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}

export function LoginForm({ next = "/account" }: { next?: string }) {
  const s = useSubmit();
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const d = formData(e);
        s.run(async () => {
          await postJson("/api/account/login", d);
          window.location.href = next;
        });
      }}
    >
      <div>
        <label className="label" htmlFor="l-email">Email</label>
        <input id="l-email" name="email" type="email" required className="field" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="l-pass">Password</label>
        <input id="l-pass" name="password" type="password" required className="field" autoComplete="current-password" />
      </div>
      <FormError msg={s.error} />
      <button disabled={s.busy} className="btn-plum">
        {s.busy ? "Signing in…" : "Sign in"}
      </button>
      <Link href="/account/forgot" className="text-center text-xs text-ink/60 underline">
        Forgot your password?
      </Link>
    </form>
  );
}

export function RegisterForm() {
  const s = useSubmit();
  return (
    <form
      className="relative grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const d = formData(e);
        s.run(async () => {
          await postJson("/api/account/register", { ...d, marketingOptIn: d.marketingOptIn === "on" });
          window.location.href = "/account";
        });
      }}
    >
      <Honeypot />
      <div>
        <label className="label" htmlFor="g-name">Name</label>
        <input id="g-name" name="name" required className="field" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="g-email">Email</label>
        <input id="g-email" name="email" type="email" required className="field" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="g-pass">Password (8+ characters)</label>
        <input id="g-pass" name="password" type="password" minLength={8} required className="field" autoComplete="new-password" />
      </div>
      <label className="flex items-start gap-2 text-xs text-ink/70">
        <input type="checkbox" name="marketingOptIn" className="mt-0.5 accent-violet" /> Send me new launches and offers.
      </label>
      <FormError msg={s.error} />
      <button disabled={s.busy} className="btn-blush">
        {s.busy ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

export function ForgotForm({ endpoint = "/api/account/forgot" }: { endpoint?: string }) {
  const s = useSubmit();
  if (s.done) return <p className="rounded-xl bg-white p-5 text-sm">{s.done}</p>;
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const d = formData(e);
        s.run(async () => (await postJson(endpoint, d)).message);
      }}
    >
      <div>
        <label className="label" htmlFor="f-email">Email</label>
        <input id="f-email" name="email" type="email" required className="field" />
      </div>
      <FormError msg={s.error} />
      <button disabled={s.busy} className="btn-plum">
        Send reset link
      </button>
    </form>
  );
}

export function ResetForm({ token, endpoint = "/api/account/reset", after = "/account/login", minLength = 8 }: { token: string; endpoint?: string; after?: string; minLength?: number }) {
  const s = useSubmit();
  if (s.done)
    return (
      <p className="rounded-xl bg-white p-5 text-sm">
        Password updated.{" "}
        <Link href={after} className="text-violet underline">
          Sign in
        </Link>
      </p>
    );
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const d = formData(e);
        s.run(async () => {
          await postJson(endpoint, { token, password: d.password });
        });
      }}
    >
      <div>
        <label className="label" htmlFor="rs-pass">New password ({minLength}+ characters)</label>
        <input id="rs-pass" name="password" type="password" minLength={minLength} required className="field" autoComplete="new-password" />
      </div>
      <FormError msg={s.error} />
      <button disabled={s.busy} className="btn-plum">
        Update password
      </button>
    </form>
  );
}
