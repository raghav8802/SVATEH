import { z } from "zod";

/**
 * Field definitions are the single source of truth for every editable
 * resource: they generate the Mongoose schema (packages/db), the Zod
 * validator used by the admin API, and the admin form UI.
 */

export type Role = "owner" | "manager" | "editor";

export type Option = { value: string; label: string };

type Base = {
  name: string;
  label: string;
  help?: string;
  required?: boolean;
  placeholder?: string;
  /** Groups fields under a heading in the admin form. */
  section?: string;
  /** Layout hint for the admin form grid. */
  width?: "full" | "half" | "third";
  /** Shown in the admin but not editable (e.g. counters). */
  readOnly?: boolean;
  /** Only show this field in the admin form when another field has one of these values. */
  showIf?: { field: string; equals: string[] };
};

export type Field =
  | (Base & { type: "text" | "textarea" | "richtext" | "color" | "url" | "email"; maxLength?: number; default?: string })
  | (Base & { type: "slug"; from: string })
  | (Base & { type: "number"; min?: number; max?: number; step?: number; default?: number })
  | (Base & { type: "boolean"; default?: boolean })
  | (Base & { type: "date" })
  | (Base & { type: "image" })
  | (Base & { type: "images" })
  | (Base & { type: "select"; options: Option[]; default?: string })
  | (Base & { type: "multiselect"; options: Option[] })
  | (Base & { type: "ref"; resource: string; multiple?: boolean })
  | (Base & { type: "list"; addLabel?: string })
  | (Base & { type: "array"; fields: Field[]; itemLabel?: string; addLabel?: string });

export type FieldType = Field["type"];

const objectId = /^[a-f0-9]{24}$/i;

const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

function fieldToZod(f: Field): z.ZodTypeAny {
  let s: z.ZodTypeAny;
  // Plain-English messages for the admin (instead of "expected string, received undefined").
  const req = `${f.label} is required`;
  const bad = `${f.label} is invalid`;
  switch (f.type) {
    case "text":
    case "textarea":
    case "richtext":
    case "url":
    case "color": {
      let str = z.string({ error: f.required ? req : bad }).trim();
      if ("maxLength" in f && f.maxLength) str = str.max(f.maxLength, `${f.label} must be ${f.maxLength} characters or fewer`);
      if (f.type === "color") str = str.regex(/^(#[0-9a-f]{3,8})?$/i, "Use a hex colour like #E7A8B9");
      s = f.required ? str.min(1, req) : str.optional().default("");
      return s;
    }
    case "email": {
      const str = z.string().trim().toLowerCase();
      return f.required
        ? str.pipe(z.email(`${f.label} must be a valid email`))
        : str.refine((v) => v === "" || z.email().safeParse(v).success, `${f.label} must be a valid email`).optional().default("");
    }
    case "slug": {
      const str = z
        .string({ error: req })
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");
      return str;
    }
    case "number": {
      let n = z.coerce.number({ error: f.required ? req : `${f.label} must be a number` });
      if (f.min !== undefined) n = n.min(f.min, `${f.label} must be at least ${f.min}`);
      if (f.max !== undefined) n = n.max(f.max, `${f.label} must be at most ${f.max}`);
      return f.required
        ? z.preprocess(emptyToUndefined, n)
        : z.preprocess(emptyToUndefined, n.optional()).transform((v) => (v === undefined ? (f.default ?? null) : v));
    }
    case "boolean":
      return z.coerce.boolean().optional().default(f.default ?? false);
    case "date":
      return z.preprocess(emptyToUndefined, z.coerce.date().optional()).transform((v) => v ?? null);
    case "image":
      return f.required ? z.string({ error: req }).min(1, req) : z.string().optional().default("");
    case "images":
      return z.array(z.string().min(1)).optional().default([]);
    case "select": {
      const values = f.options.map((o) => o.value) as [string, ...string[]];
      const e = z.enum(values, { error: f.required ? req : bad });
      return f.required ? e : z.preprocess(emptyToUndefined, e.optional()).transform((v) => v ?? f.default ?? "");
    }
    case "multiselect": {
      const values = f.options.map((o) => o.value) as [string, ...string[]];
      return z.array(z.enum(values, { error: bad })).optional().default([]);
    }
    case "ref": {
      const id = z.string({ error: req }).regex(objectId, f.required ? req : bad);
      if (f.multiple) return z.array(id).optional().default([]);
      return f.required ? id : z.preprocess(emptyToUndefined, id.optional()).transform((v) => v ?? null);
    }
    case "list":
      return z
        .array(z.string().trim())
        .optional()
        .default([])
        .transform((a) => a.filter(Boolean));
    case "array":
      return z.array(buildZodObject(f.fields)).optional().default([]);
  }
}

export function buildZodObject(fields: Field[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    if (f.readOnly) continue;
    shape[f.name] = fieldToZod(f);
  }
  // `_id` is preserved for array sub-documents so edits keep identity.
  shape._id = z.string().optional();
  return z.object(shape);
}

export function defaultsFor(fields: Field[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    switch (f.type) {
      case "boolean":
        out[f.name] = f.default ?? false;
        break;
      case "number":
        out[f.name] = f.default ?? null;
        break;
      case "images":
      case "multiselect":
      case "list":
      case "array":
        out[f.name] = [];
        break;
      case "ref":
        out[f.name] = f.multiple ? [] : null;
        break;
      case "select":
        out[f.name] = f.default ?? "";
        break;
      case "date":
        out[f.name] = null;
        break;
      default:
        out[f.name] = "default" in f && f.default !== undefined ? f.default : "";
    }
  }
  return out;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
