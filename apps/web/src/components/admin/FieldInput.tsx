"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, Plus, Trash2, X } from "lucide-react";
import { defaultsFor, slugify, type Field } from "@svateh/core";
import { ImageInput, ImagesInput } from "./MediaInputs";
import { RefInput, useRefOptions } from "./RefInput";
import { RichTextEditor } from "./RichTextEditor";

export type Values = Record<string, any>;

let keySeq = 0;
export const withKey = (o: Values): Values => ({ ...o, __k: o._id ?? `k${++keySeq}` });

const widthClass = (f: Field) => (f.width === "half" ? "sm:col-span-3" : f.width === "third" ? "sm:col-span-2" : "sm:col-span-6");

export const isVisible = (f: Field, values: Values) => !f.showIf || f.showIf.equals.includes(String(values[f.showIf.field] ?? ""));

function Toggle({ checked, onChange, id, disabled }: { checked: boolean; onChange: (v: boolean) => void; id: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? "bg-violet" : "bg-ink/20"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function ListInput({ value, onChange, addLabel }: { value: string[]; onChange: (v: string[]) => void; addLabel?: string }) {
  const list = value ?? [];
  const set = (i: number, v: string) => onChange(list.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const n = [...list];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j]!, n[i]!];
    onChange(n);
  };
  return (
    <div className="space-y-2">
      {list.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="w-5 pt-3 text-right text-xs text-ink/40">{i + 1}.</span>
          <textarea value={v} rows={1} onChange={(e) => set(i, e.target.value)} className="field min-h-[46px] flex-1 resize-y" />
          <div className="flex pt-2">
            <button type="button" onClick={() => move(i, -1)} className="p-1 text-ink/40 hover:text-ink" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => move(i, 1)} className="p-1 text-ink/40 hover:text-ink" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="p-1 text-ink/40 hover:text-red-700" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, ""])} className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-3 py-1.5 text-xs hover:border-violet">
        <Plus className="h-3 w-3" /> {addLabel ?? "Add"}
      </button>
    </div>
  );
}

function ItemTitle({ field, item, index }: { field: Extract<Field, { type: "array" }>; item: Values; index: number }) {
  const key = field.itemLabel;
  const sub = field.fields.find((f) => f.name === key);
  const options = useRefOptions(sub?.type === "ref" ? sub.resource : "__none");
  let label = key ? item[key] : "";
  if (sub?.type === "ref" && label) label = options?.find((o) => o.value === label)?.label ?? "…";
  if (sub?.type === "select" && label) label = sub.options.find((o) => o.value === label)?.label ?? label;
  return (
    <span className="flex items-center gap-2 truncate">
      {item.hex ? <span className="h-4 w-4 shrink-0 rounded-full border border-ink/10" style={{ background: item.hex }} /> : null}
      {label || `Item ${index + 1}`}
    </span>
  );
}

function ArrayInput({ field, value, onChange, path }: { field: Extract<Field, { type: "array" }>; value: Values[]; onChange: (v: Values[]) => void; path: string }) {
  const list: Values[] = (value ?? []).map((v) => (v.__k ? v : withKey(v)));
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const update = (i: number, item: Values) => onChange(list.map((x, j) => (j === i ? item : x)));
  const move = (i: number, d: number) => {
    const n = [...list];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j]!, n[i]!];
    onChange(n);
  };
  const add = (copyFrom?: Values) => {
    const base = copyFrom ? { ...copyFrom, _id: undefined, sku: copyFrom.sku ? `${copyFrom.sku}-2` : undefined } : defaultsFor(field.fields);
    const item = withKey(base);
    onChange([...list, item]);
    setOpen((o) => ({ ...o, [item.__k]: true }));
  };
  return (
    <div className="space-y-2">
      {list.map((item, i) => {
        const isOpen = open[item.__k] ?? !item._id;
        return (
          <div key={item.__k} className="rounded-lg border border-ink/15 bg-white">
            <div className="flex items-center gap-1 px-3 py-2">
              <button type="button" onClick={() => setOpen((o) => ({ ...o, [item.__k]: !isOpen }))} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium" aria-expanded={isOpen}>
                {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                <ItemTitle field={field} item={item} index={i} />
              </button>
              <button type="button" onClick={() => move(i, -1)} className="p-1 text-ink/40 hover:text-ink" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => move(i, 1)} className="p-1 text-ink/40 hover:text-ink" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => add(item)} className="p-1 text-ink/40 hover:text-ink" aria-label="Duplicate" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
              <button
                type="button"
                onClick={() => window.confirm("Remove this item?") && onChange(list.filter((_, j) => j !== i))}
                className="p-1 text-ink/40 hover:text-red-700"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {isOpen ? (
              <div className="border-t border-ink/10 p-4">
                <FieldGrid fields={field.fields} values={item} onChange={(k, v) => update(i, { ...item, [k]: v })} pathPrefix={`${path}.${i}`} />
              </div>
            ) : null}
          </div>
        );
      })}
      <button type="button" onClick={() => add()} className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-3 py-1.5 text-xs hover:border-violet">
        <Plus className="h-3 w-3" /> {field.addLabel ?? "Add item"}
      </button>
    </div>
  );
}

export function FieldControl({ f, value, onChange, values, id, path }: { f: Field; value: any; onChange: (v: any) => void; values: Values; id: string; path: string }) {
  const ro = !!f.readOnly;
  switch (f.type) {
    case "text":
    case "url":
    case "email":
      return <input id={id} type={f.type === "text" ? "text" : f.type} value={value ?? ""} readOnly={ro} maxLength={"maxLength" in f ? f.maxLength : undefined} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={`field ${ro ? "bg-[#FAF8FA] text-ink/70" : ""}`} />;
    case "textarea":
      return <textarea id={id} value={value ?? ""} readOnly={ro} rows={ro ? 4 : 3} maxLength={f.maxLength} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={`field resize-y ${ro ? "bg-[#FAF8FA] text-ink/70" : ""}`} />;
    case "richtext":
      return <RichTextEditor id={id} value={value ?? ""} onChange={onChange} />;
    case "slug":
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink/40">/</span>
          <input id={id} value={value ?? ""} onChange={(e) => onChange(slugify(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""))} placeholder={slugify(String(values[f.from] ?? "")) || "auto"} className="field font-mono text-xs" />
          <button type="button" className="shrink-0 text-xs text-violet underline" onClick={() => onChange(slugify(String(values[f.from] ?? "")))}>
            Generate
          </button>
        </div>
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value ?? "") ? value : "#ffffff"} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-11 w-12 cursor-pointer rounded-lg border border-ink/20 bg-white p-1" aria-label={`${f.label} picker`} />
          <input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="#E7A8B9" className="field font-mono text-xs" />
        </div>
      );
    case "number":
      return <input id={id} type="number" inputMode="decimal" value={value ?? ""} readOnly={ro} min={f.min} max={f.max} step={f.step ?? "any"} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className={`field ${ro ? "bg-[#FAF8FA] text-ink/70" : ""}`} />;
    case "boolean":
      return <Toggle id={id} checked={!!value} onChange={onChange} disabled={ro} />;
    case "date":
      return <input id={id} type="date" value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value || null)} className="field" />;
    case "image":
      return ro ? (value ? <ImageInput value={value} onChange={() => {}} /> : <p className="text-sm text-ink/50">—</p>) : <ImageInput value={value ?? ""} onChange={onChange} folder={path.split(".")[0] === "variants" ? "products" : "media"} />;
    case "images":
      return ro ? (
        <div className="flex flex-wrap gap-2">
          {(value ?? []).map((u: string) => (
            <a key={u} href={u} target="_blank" rel="noreferrer" className="block h-24 w-24 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
            </a>
          ))}
          {!(value ?? []).length ? <p className="text-sm text-ink/50">—</p> : null}
        </div>
      ) : (
        <ImagesInput value={value ?? []} onChange={onChange} />
      );
    case "select":
      return (
        <select id={id} value={value ?? ""} disabled={ro} onChange={(e) => onChange(e.target.value)} className="field">
          {!f.required ? <option value="">—</option> : null}
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "multiselect": {
      const list: string[] = value ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {f.options.map((o) => {
            const on = list.includes(o.value);
            return (
              <button key={o.value} type="button" aria-pressed={on} onClick={() => onChange(on ? list.filter((x) => x !== o.value) : [...list, o.value])} className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-violet bg-violet text-white" : "border-ink/20 hover:border-violet"}`}>
                {o.label}
              </button>
            );
          })}
        </div>
      );
    }
    case "ref":
      return ro ? <RefReadOnly resource={f.resource} value={value} /> : <RefInput resource={f.resource} value={value} onChange={onChange} multiple={f.multiple} />;
    case "list":
      return <ListInput value={value ?? []} onChange={onChange} addLabel={f.addLabel} />;
    case "array":
      return <ArrayInput field={f} value={value ?? []} onChange={onChange} path={path} />;
  }
}

function RefReadOnly({ resource, value }: { resource: string; value: string }) {
  const options = useRefOptions(resource);
  return <p className="field bg-[#FAF8FA] text-ink/70">{options?.find((o) => o.value === value)?.label ?? "—"}</p>;
}

export function FieldGrid({ fields, values, onChange, pathPrefix = "", errors = {} }: { fields: Field[]; values: Values; onChange: (k: string, v: any) => void; pathPrefix?: string; errors?: Record<string, string> }) {
  return (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-6">
      {fields.filter((f) => isVisible(f, values)).map((f) => {
        const path = pathPrefix ? `${pathPrefix}.${f.name}` : f.name;
        const id = `f-${path.replace(/\./g, "-")}`;
        const inline = f.type === "boolean";
        return (
          <div key={f.name} className={widthClass(f)}>
            {inline ? (
              <div className="flex items-start gap-3 pt-1">
                <FieldControl f={f} value={values[f.name]} onChange={(v) => onChange(f.name, v)} values={values} id={id} path={path} />
                <label htmlFor={id} className="text-sm">
                  {f.label}
                  {f.help ? <span className="mt-0.5 block text-xs text-ink/50">{f.help}</span> : null}
                </label>
              </div>
            ) : (
              <>
                <label htmlFor={id} className="label">
                  {f.label}
                  {f.required ? <span className="text-red-700"> *</span> : null}
                </label>
                <FieldControl f={f} value={values[f.name]} onChange={(v) => onChange(f.name, v)} values={values} id={id} path={path} />
                {f.help ? <p className="mt-1 text-xs text-ink/50">{f.help}</p> : null}
              </>
            )}
            {errors[path] ? <p className="mt-1 text-xs text-red-700">{errors[path]}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
