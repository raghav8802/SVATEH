"use client";

import { useState } from "react";
import { INDIAN_STATES } from "@svateh/core";
import { FormError, postJson } from "./forms";

type Address = { label: string; name: string; phone: string; line1: string; line2: string; landmark: string; city: string; state: string; pincode: string; isDefault: boolean };
const EMPTY: Address = { label: "", name: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "", isDefault: false };

export function AddressBook({ initial }: { initial: Address[] }) {
  const [list, setList] = useState<Address[]>(initial.map((a) => ({ ...EMPTY, ...a })));
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Address>(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (next: Address[]) => {
    setBusy(true);
    setError("");
    try {
      const clean = next.map(({ ...a }) => a);
      await postJson("/api/account/profile", { addresses: clean }, "PATCH");
      setList(next);
      setEditing(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const f = (k: keyof Address, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label">{label}</label>
      <input className="field" value={String(draft[k] ?? "")} onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))} {...props} />
    </div>
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((a, i) => (
          <div key={i} className="rounded-xl border border-ink/10 bg-white p-5 text-sm">
            <p className="font-medium">
              {a.label || "Address"} {a.isDefault ? <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[10px] text-plum">Default</span> : null}
            </p>
            <p className="mt-2 text-ink/70">
              {a.name}, {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode} · {a.phone}
            </p>
            <div className="mt-3 flex gap-4 text-xs">
              <button onClick={() => (setDraft(a), setEditing(i))} className="text-violet underline">Edit</button>
              {!a.isDefault ? <button onClick={() => save(list.map((x, j) => ({ ...x, isDefault: j === i })))} className="underline">Make default</button> : null}
              <button onClick={() => save(list.filter((_, j) => j !== i))} className="text-red-700 underline">Remove</button>
            </div>
          </div>
        ))}
      </div>
      {editing === null ? (
        <button onClick={() => (setDraft({ ...EMPTY, isDefault: !list.length }), setEditing(-1))} className="btn-outline mt-4 !border-ink/30">
          Add address
        </button>
      ) : (
        <form
          className="mt-6 grid gap-4 rounded-xl bg-white p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const next = editing === -1 ? [...list, draft] : list.map((x, j) => (j === editing ? draft : x));
            save(draft.isDefault ? next.map((x) => ({ ...x, isDefault: x === draft })) : next);
          }}
        >
          {f("label", "Label (Home, Work…)")}
          {f("name", "Full name", { required: true })}
          {f("phone", "Mobile", { required: true, inputMode: "tel" })}
          {f("pincode", "PIN code", { required: true, inputMode: "numeric", maxLength: 6 })}
          <div className="sm:col-span-2">{f("line1", "Flat, house, street", { required: true })}</div>
          {f("line2", "Area, locality")}
          {f("landmark", "Landmark")}
          {f("city", "City", { required: true })}
          <div>
            <label className="label">State</label>
            <select className="field" required value={draft.state} onChange={(e) => setDraft((d) => ({ ...d, state: e.target.value }))}>
              <option value="">Choose</option>
              {INDIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs sm:col-span-2">
            <input type="checkbox" checked={draft.isDefault} onChange={(e) => setDraft((d) => ({ ...d, isDefault: e.target.checked }))} className="accent-violet" /> Use as default
          </label>
          <div className="sm:col-span-2">
            <FormError msg={error} />
            <div className="mt-2 flex gap-3">
              <button disabled={busy} className="btn-plum">Save address</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-outline !border-ink/30">Cancel</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
