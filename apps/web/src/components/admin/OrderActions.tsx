"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES } from "@svateh/core";
import { FormError } from "@/components/store/forms";

const COURIERS = ["Delhivery", "Blue Dart", "DTDC", "Ecom Express", "Xpressbees", "Shadowfax", "India Post", "Shiprocket", "Other"];

export function OrderActions({ order }: { order: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [courier, setCourier] = useState(order.courier ?? "");
  const [trackingNumber, setTracking] = useState(order.trackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? "");
  const [note, setNote] = useState("");
  const [internalNote, setInternal] = useState(order.internalNote ?? "");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const save = async (patch: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setOk("Saved ✓");
      setNote("");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Couldn’t save");
    } finally {
      setBusy(false);
    }
  };

  const willEmail = notify && status !== order.status && ["packed", "shipped", "delivered", "cancelled", "refunded"].includes(status);

  return (
    <div className="space-y-5">
      <div>
        <label className="label" htmlFor="o-status">Status</label>
        <select id="o-status" value={status} onChange={(e) => setStatus(e.target.value)} className="field">
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {status === "cancelled" && order.status !== "cancelled" ? <p className="mt-1 text-xs text-amber-700">Cancelling returns the stock to sale. Refund online payments from your Razorpay dashboard.</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="o-courier">Courier</label>
          <input id="o-courier" list="couriers" value={courier} onChange={(e) => setCourier(e.target.value)} className="field" />
          <datalist id="couriers">
            {COURIERS.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="o-track">Tracking number</label>
          <input id="o-track" value={trackingNumber} onChange={(e) => setTracking(e.target.value)} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="o-url">Tracking link</label>
          <input id="o-url" type="url" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://…" className="field" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="o-note">Note for history (optional)</label>
        <input id="o-note" value={note} onChange={(e) => setNote(e.target.value)} className="field" placeholder="e.g. Handed to courier" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-violet" /> Email the customer about status changes
      </label>
      <FormError msg={error} />
      <div className="flex items-center gap-3">
        <button disabled={busy} onClick={() => save({ status, courier, trackingNumber, trackingUrl, note: note || undefined, notifyCustomer: notify })} className="btn-plum !py-2.5">
          {busy ? "Saving…" : willEmail ? "Save & email customer" : "Save"}
        </button>
        {ok ? <span className="text-xs text-green-700">{ok}</span> : null}
      </div>
      <div className="border-t border-ink/10 pt-5">
        <label className="label" htmlFor="o-internal">Internal note (only visible to admins)</label>
        <textarea id="o-internal" value={internalNote} onChange={(e) => setInternal(e.target.value)} rows={3} className="field" />
        <button disabled={busy} onClick={() => save({ internalNote, notifyCustomer: false })} className="mt-2 rounded-full border border-ink/20 px-4 py-2 text-xs hover:border-violet">
          Save note
        </button>
      </div>
      {order.paymentMethod === "cod" && order.paymentStatus !== "paid" ? (
        <button disabled={busy} onClick={() => save({ paymentStatus: "paid", note: "COD payment collected", notifyCustomer: false })} className="text-xs text-violet underline">
          Mark COD payment as collected
        </button>
      ) : null}
    </div>
  );
}
