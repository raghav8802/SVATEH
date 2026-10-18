"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, X } from "lucide-react";

export type RefOption = { value: string; label: string; image?: string; shades?: { name: string; sku: string; hex?: string }[] };

const cache = new Map<string, Promise<RefOption[]>>();

export function loadRefOptions(resource: string, refresh = false) {
  if (refresh || !cache.has(resource)) {
    cache.set(
      resource,
      fetch(`/api/admin/refs/${resource}`)
        .then((r) => r.json())
        .then((d) => d.options ?? [])
        .catch(() => []),
    );
  }
  return cache.get(resource)!;
}

export function useRefOptions(resource: string) {
  const [options, setOptions] = useState<RefOption[] | null>(null);
  useEffect(() => {
    if (resource === "__none") return;
    let alive = true;
    loadRefOptions(resource).then((o) => alive && setOptions(o));
    return () => {
      alive = false;
    };
  }, [resource]);
  return options;
}

function Picker({ options, exclude, onPick, placeholder }: { options: RefOption[]; exclude: string[]; onPick: (v: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const filtered = useMemo(() => options.filter((o) => !exclude.includes(o.value) && o.label.toLowerCase().includes(q.toLowerCase())).slice(0, 60), [options, exclude, q]);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="field flex items-center justify-between text-left text-ink/60">
        {placeholder} <ChevronDown className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-ink/15 bg-white shadow-xl">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full border-b border-ink/10 px-3 py-2.5 text-sm outline-none" />
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length ? (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(o.value);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-cream"
                  >
                    {o.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={o.image} alt="" className="h-7 w-7 rounded object-cover" />
                    ) : null}
                    {o.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-ink/50">Nothing found</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function RefInput({ resource, value, onChange, multiple }: { resource: string; value: string | string[] | null; onChange: (v: any) => void; multiple?: boolean }) {
  const options = useRefOptions(resource);
  if (!options) return <div className="field text-ink/40">Loading…</div>;
  const label = (id: string) => options.find((o) => o.value === id)?.label ?? "(deleted item)";

  if (!multiple) {
    const v = (value as string) || "";
    return (
      <div className="flex items-center gap-2">
        <select value={v} onChange={(e) => onChange(e.target.value || null)} className="field">
          <option value="">— None —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const list = (value as string[]) ?? [];
  const move = (i: number, d: number) => {
    const next = [...list];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {list.length ? (
        <ul className="divide-y divide-ink/10 rounded-lg border border-ink/15 bg-white">
          {list.map((id, i) => (
            <li key={id} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="flex-1">{label(id)}</span>
              <button type="button" onClick={() => move(i, -1)} className="p-1 text-ink/50 hover:text-ink" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => move(i, 1)} className="p-1 text-ink/50 hover:text-ink" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onChange(list.filter((x) => x !== id))} className="p-1 text-ink/50 hover:text-red-700" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      ) : null}
      <Picker options={options} exclude={list} onPick={(v) => onChange([...list, v])} placeholder="Add…" />
    </div>
  );
}
