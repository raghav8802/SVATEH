"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { openRazorpay } from "@/lib/razorpay-client";
import { FormError, postJson } from "./forms";

export function PayRetry({ number, token }: { number: string; token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <div>
      <FormError msg={error} />
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const r = await postJson("/api/payments/razorpay/retry", { number, token });
            if (!r.alreadyPaid) {
              const res = await openRazorpay(r.razorpay, `Order ${number}`);
              if (!res.ok) throw new Error(res.reason === "failed" ? `Payment failed: ${res.message}` : "Payment was not completed.");
              await postJson("/api/payments/razorpay/verify", res.response);
            }
            router.refresh();
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
        className="btn-blush mt-3"
      >
        {busy ? "Opening…" : "Complete payment"}
      </button>
    </div>
  );
}

export function AccountActions() {
  return (
    <button
      onClick={async () => {
        await fetch("/api/account/logout", { method: "POST" });
        window.location.href = "/";
      }}
      className="text-xs tracking-[0.18em] text-ink/60 uppercase underline-offset-4 hover:underline"
    >
      Sign out
    </button>
  );
}
