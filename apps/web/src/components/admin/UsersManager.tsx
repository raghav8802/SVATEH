"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormError, postJson } from "@/components/store/forms";

type U = { _id: string; name: string; email: string; role: string; active: boolean; lastLoginAt?: string };

const ROLE_HELP: Record<string, string> = {
  owner: "Everything, including admin users",
  manager: "Everything except admin users",
  editor: "Products, collections, homepage & pages — no orders, customers or settings",
};

export function UsersManager({ users, me }: { users: U[]; me: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-[11px] tracking-wide text-ink/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {users.map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3">
                  {u.name} {u._id === me ? <span className="text-xs text-ink/50">(you)</span> : null}
                  <span className="block text-xs text-ink/55">{u.email}</span>
                </td>
                <td className="px-4 py-3">
                  <select disabled={busy} value={u.role} onChange={(e) => act(() => postJson(`/api/admin/users/${u._id}`, { role: e.target.value }, "PATCH"))} className="field !w-auto !py-1.5">
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input type="checkbox" disabled={busy || u._id === me} checked={u.active} onChange={(e) => act(() => postJson(`/api/admin/users/${u._id}`, { active: e.target.checked }, "PATCH"))} className="accent-violet" aria-label="Active" />
                </td>
                <td className="px-4 py-3 text-right">
                  {u._id !== me ? (
                    <div className="flex justify-end gap-3 text-xs">
                      <button
                        disabled={busy}
                        onClick={() => {
                          const pw = window.prompt(`New password for ${u.email} (10+ characters)`);
                          if (pw) act(() => postJson(`/api/admin/users/${u._id}`, { password: pw }, "PATCH"));
                        }}
                        className="underline"
                      >
                        Reset password
                      </button>
                      <button disabled={busy} onClick={() => window.confirm(`Remove ${u.email}?`) && act(() => fetch(`/api/admin/users/${u._id}`, { method: "DELETE" }).then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); }))} className="text-red-700 underline">
                        Remove
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FormError msg={error} />
      <form
        className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const d = Object.fromEntries(new FormData(form).entries());
          act(async () => {
            await postJson("/api/admin/users", d);
            form.reset();
          });
        }}
      >
        <h2 className="font-display text-xl sm:col-span-2">Add a team member</h2>
        <div>
          <label className="label" htmlFor="u-name">Name</label>
          <input id="u-name" name="name" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="u-email">Email</label>
          <input id="u-email" name="email" type="email" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="u-pass">Temporary password (10+ characters)</label>
          <input id="u-pass" name="password" type="text" minLength={10} required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="u-role">Role</label>
          <select id="u-role" name="role" defaultValue="editor" className="field">
            <option value="owner">Owner — {ROLE_HELP.owner}</option>
            <option value="manager">Manager — {ROLE_HELP.manager}</option>
            <option value="editor">Editor — {ROLE_HELP.editor}</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <button disabled={busy} className="btn-plum !py-2.5">Add user</button>
          <p className="mt-2 text-xs text-ink/55">Share the temporary password privately; they can change it under their name in the menu.</p>
        </div>
      </form>
    </div>
  );
}

export function MyAccountForm({ id, name }: { id: string; name: string }) {
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="grid max-w-md gap-4 rounded-2xl bg-white p-6 shadow-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg("");
        setError("");
        const d = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
        if (d.password && d.password !== d.confirm) return setError("Passwords don’t match.");
        try {
          await postJson(`/api/admin/users/${id}`, { name: d.name, password: d.password || "" }, "PATCH");
          setMsg("Saved ✓");
        } catch (err: any) {
          setError(err.message);
        }
      }}
    >
      <div>
        <label className="label" htmlFor="m-name">Name</label>
        <input id="m-name" name="name" defaultValue={name} required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="m-pass">New password (leave blank to keep)</label>
        <input id="m-pass" name="password" type="password" minLength={10} autoComplete="new-password" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="m-confirm">Confirm new password</label>
        <input id="m-confirm" name="confirm" type="password" autoComplete="new-password" className="field" />
      </div>
      <FormError msg={error} />
      <button className="btn-plum !py-2.5">Save</button>
      {msg ? <p className="text-xs text-green-700">{msg}</p> : null}
    </form>
  );
}
