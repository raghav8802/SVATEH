"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, ExternalLink, Trash2 } from "lucide-react";
import { defaultsFor, getResource, type Field } from "@svateh/core";
import { FieldGrid, type Values } from "./FieldInput";
import { loadRefOptions } from "./RefInput";

function groupFields(fields: Field[]) {
  const groups: { title: string; fields: Field[] }[] = [];
  for (const f of fields) {
    const title = f.section ?? "";
    let g = groups.find((x) => x.title === title);
    if (!g) groups.push((g = { title, fields: [] }));
    g.fields.push(f);
  }
  return groups;
}

export function ResourceForm({ resourceKey, initial, mode }: { resourceKey: string; initial: Values | null; mode: "new" | "edit" | "singleton" }) {
  const r = getResource(resourceKey)!;
  const router = useRouter();
  const [values, setValues] = useState<Values>(() => ({ ...defaultsFor(r.fields), ...(initial ?? {}) }));
  const [saved, setSaved] = useState(() => JSON.stringify(values));
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [flash, setFlash] = useState("");
  const dirty = JSON.stringify(values) !== saved;
  const groups = useMemo(() => groupFields(r.fields), [r.fields]);
  const id = values._id as string | undefined;
  const publicUrl = mode !== "new" ? r.publicPath?.(values) : null;
  const title = String(values[r.list?.titleField ?? "name"] ?? "") || (mode === "new" ? `New ${r.singular.toLowerCase()}` : r.singular);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  const save = async () => {
    setBusy(true);
    setProblems([]);
    try {
      const url = mode === "singleton" ? `/api/admin/singleton/${r.key}` : mode === "new" ? `/api/admin/r/${r.key}` : `/api/admin/r/${r.key}/${id}`;
      const res = await fetch(url, { method: mode === "new" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await res.json();
      if (!res.ok) {
        setProblems(data.problems ?? [data.error ?? "Couldn’t save."]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const next = { ...defaultsFor(r.fields), ...data.doc };
      setValues(next);
      setSaved(JSON.stringify(next));
      setFlash("Saved ✓ Changes are live.");
      loadRefOptions(r.key, true);
      if (mode === "new") router.replace(`/admin/r/${r.key}/${data.doc._id}`);
      router.refresh();
    } catch {
      setProblems(["Network error — please try again."]);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete this ${r.singular.toLowerCase()}? This can’t be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/r/${r.key}/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setSaved(JSON.stringify(values));
      loadRefOptions(r.key, true);
      router.push(`/admin/r/${r.key}`);
      router.refresh();
    } else setProblems([(await res.json()).error ?? "Couldn’t delete."]);
  };

  const duplicate = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/r/${r.key}/${id}/duplicate`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (res.ok) router.push(`/admin/r/${r.key}/${data.doc._id}`);
    else setProblems([data.error ?? "Couldn’t duplicate."]);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="pb-24"
    >
      <div className="sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-ink/10 bg-[#F6F3F7]/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        {mode !== "singleton" ? (
          <Link href={`/admin/r/${r.key}`} className="rounded-full p-2 hover:bg-white" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.2em] text-ink/50 uppercase">{r.singular}</p>
          <h1 className="truncate font-display text-2xl">{title}</h1>
        </div>
        {flash ? <span className="text-xs text-green-700" role="status">{flash}</span> : dirty ? <span className="text-xs text-ink/50">Unsaved changes</span> : null}
        {publicUrl ? (
          <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-3 py-2 text-xs hover:border-violet">
            <ExternalLink className="h-3.5 w-3.5" /> View
          </a>
        ) : null}
        {mode === "edit" && !r.noCreate ? (
          <button type="button" onClick={duplicate} disabled={busy} className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-3 py-2 text-xs hover:border-violet">
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </button>
        ) : null}
        {mode === "edit" ? (
          <button type="button" onClick={remove} disabled={busy} className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        ) : null}
        <button type="submit" disabled={busy || (!dirty && mode !== "new")} className="btn-plum !py-2.5">
          {busy ? "Saving…" : mode === "new" ? "Create" : "Save"}
        </button>
      </div>

      {r.description ? <p className="mb-6 max-w-3xl text-sm text-ink/60">{r.description}</p> : null}

      {problems.length ? (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">Please fix the following:</p>
          <ul className="mt-2 list-disc pl-5">
            {problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.title || "main"} className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
            {g.title ? <h2 className="mb-5 font-display text-xl">{g.title}</h2> : null}
            <FieldGrid fields={g.fields} values={values} onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))} />
          </section>
        ))}
      </div>
    </form>
  );
}
