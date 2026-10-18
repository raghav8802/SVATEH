"use client";

export type RazorpayOptions = {
  key: string;
  orderId: string;
  amount: number;
  name: string;
  prefill: { name: string; email: string; contact: string };
  color: string;
};

type Result = { ok: true; response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string } } | { ok: false; reason: "dismissed" | "failed"; message?: string };

let loader: Promise<void> | null = null;

function loadScript() {
  if ((window as any).Razorpay) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error("Couldn’t load the payment window. Check your connection and try again."));
    };
    document.body.appendChild(s);
  });
  return loader;
}

/** Opens Razorpay Checkout and resolves when the customer pays, fails or closes it. */
export async function openRazorpay(o: RazorpayOptions, description: string): Promise<Result> {
  await loadScript();
  return new Promise((resolve) => {
    // Razorpay lets the customer retry inside the modal after a failure, so we only
    // remember the error and resolve when they pay or close the window.
    let lastError: string | undefined;
    const rzp = new (window as any).Razorpay({
      key: o.key,
      order_id: o.orderId,
      amount: o.amount,
      currency: "INR",
      name: o.name,
      description,
      prefill: o.prefill,
      theme: { color: o.color },
      handler: (response: any) => resolve({ ok: true, response }),
      modal: { ondismiss: () => resolve({ ok: false, reason: lastError ? "failed" : "dismissed", message: lastError }), confirm_close: true },
    });
    rzp.on("payment.failed", (r: any) => {
      lastError = r?.error?.description ?? "Payment failed";
    });
    rzp.open();
  });
}
