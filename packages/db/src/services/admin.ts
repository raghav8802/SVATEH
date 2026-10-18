import { buildZodObject, getResource, slugify, type Field, type Resource } from "@svateh/core";
import { connectDB } from "../connect";
import { AuditLog, resourceModels } from "../models";
import { escapeRegex, isObjectId, plain } from "./util";

export class ValidationError extends Error {
  constructor(public problems: string[]) {
    super(problems.join(" "));
  }
}

const PAGE_SIZE = 25;

function fillSlugs(fields: Field[], data: Record<string, any>) {
  for (const f of fields) {
    if (f.type === "slug" && !data[f.name] && data[f.from]) data[f.name] = slugify(String(data[f.from]));
  }
}

/** Turns Zod issues into messages like "Shades / variants #2: SKU is required". */
function zodProblems(err: any, fields: Field[]): string[] {
  return (err.issues ?? []).map((i: any) => {
    const parents: string[] = [];
    let level: Field[] | undefined = fields;
    const path: (string | number)[] = i.path ?? [];
    path.slice(0, -1).forEach((seg) => {
      if (typeof seg === "number") {
        if (parents.length) parents[parents.length - 1] += ` #${seg + 1}`;
        return;
      }
      const f: Field | undefined = level?.find((x) => x.name === seg);
      parents.push(f?.label ?? seg);
      level = f?.type === "array" ? f.fields : undefined;
    });
    return parents.length ? `${parents.join(" › ")}: ${i.message}` : i.message;
  });
}

export function validateResource(r: Resource, input: Record<string, any>) {
  const data = { ...input };
  fillSlugs(r.fields, data);
  if (r.key === "coupons" && data.code) data.code = String(data.code).trim().toUpperCase().replace(/\s+/g, "");
  const parsed = buildZodObject(r.fields).safeParse(data);
  if (!parsed.success) throw new ValidationError(zodProblems(parsed.error, r.fields));
  const out = parsed.data as Record<string, any>;
  delete out._id;
  const problems = r.rules?.(out) ?? [];
  if (problems.length) throw new ValidationError(problems);
  return out;
}

export async function listResource(
  key: string,
  opts: { q?: string; page?: number; filters?: Record<string, string>; all?: boolean } = {},
) {
  const r = getResource(key)!;
  await connectDB();
  const M = resourceModels[key]!;
  const filter: Record<string, any> = {};
  if (opts.q && r.list?.searchFields?.length) {
    const rx = new RegExp(escapeRegex(opts.q), "i");
    filter.$or = r.list.searchFields.map((f) => ({ [f]: rx }));
  }
  for (const [k, v] of Object.entries(opts.filters ?? {})) if (v && r.list?.filters?.some((f) => f.field === k)) filter[k] = v;
  const page = Math.max(1, opts.page ?? 1);
  const refFields = r.fields.filter((f) => f.type === "ref" && r.list?.columns.some((c) => c.field === f.name));
  let q = M.find(filter).sort(r.list?.defaultSort ?? { createdAt: -1 });
  if (!opts.all) q = q.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
  for (const f of refFields) q = q.populate(f.name, "name title code email");
  const [items, total] = await Promise.all([q.lean(), M.countDocuments(filter)]);
  return plain({ items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
}

export async function getResourceDoc(key: string, id: string) {
  await connectDB();
  if (!isObjectId(id)) return null;
  return plain(await resourceModels[key]!.findById(id).lean());
}

async function audit(admin: { id: string; email: string }, action: string, resource: string, docId: string, summary = "") {
  await AuditLog.create({ admin: admin.id, adminEmail: admin.email, action, resource, docId, summary }).catch(() => {});
}

function duplicateMessage(e: any, r: Resource) {
  if (e?.code !== 11000) return null;
  const field = Object.keys(e.keyPattern ?? {})[0] ?? "value";
  const label = r.fields.find((f) => f.name === field)?.label ?? field;
  return `Another ${r.singular.toLowerCase()} already uses this ${label.toLowerCase()}.`;
}

export async function createResourceDoc(key: string, input: Record<string, any>, admin: { id: string; email: string }) {
  const r = getResource(key)!;
  const data = validateResource(r, input);
  await connectDB();
  try {
    const doc = await resourceModels[key]!.create(data);
    await audit(admin, "create", key, String(doc._id), String(data[r.list?.titleField ?? "name"] ?? ""));
    return plain(doc.toObject());
  } catch (e) {
    const msg = duplicateMessage(e, r);
    if (msg) throw new ValidationError([msg]);
    throw e;
  }
}

export async function updateResourceDoc(key: string, id: string, input: Record<string, any>, admin: { id: string; email: string }) {
  const r = getResource(key)!;
  const data = validateResource(r, input);
  await connectDB();
  try {
    const doc = await resourceModels[key]!.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
    if (doc) await audit(admin, "update", key, id, String(data[r.list?.titleField ?? "name"] ?? ""));
    return doc ? plain(doc) : null;
  } catch (e) {
    const msg = duplicateMessage(e, r);
    if (msg) throw new ValidationError([msg]);
    throw e;
  }
}

export async function deleteResourceDoc(key: string, id: string, admin: { id: string; email: string }) {
  await connectDB();
  const res = await resourceModels[key]!.findByIdAndDelete(id).lean();
  if (res) await audit(admin, "delete", key, id);
  return !!res;
}

export async function duplicateResourceDoc(key: string, id: string, admin: { id: string; email: string }) {
  const r = getResource(key)!;
  await connectDB();
  const src = await resourceModels[key]!.findById(id).lean<any>();
  if (!src) return null;
  const { _id, createdAt, updatedAt, __v, ...rest } = src;
  const titleField = r.list?.titleField ?? "name";
  if (typeof rest[titleField] === "string") rest[titleField] = `${rest[titleField]} (copy)`;
  for (const f of r.fields) if (f.type === "slug") rest[f.name] = `${rest[f.name] || "item"}-copy-${Date.now().toString(36)}`;
  if ("status" in rest && key !== "reviews") rest.status = "draft";
  if (key === "products") rest.variants = (rest.variants ?? []).map((v: any) => ({ ...v, _id: undefined, sku: `${v.sku}-COPY` }));
  const doc = await resourceModels[key]!.create(rest);
  await audit(admin, "duplicate", key, String(doc._id));
  return plain(doc.toObject());
}

export async function getSingletonDoc(key: string) {
  await connectDB();
  return plain(await resourceModels[key]!.findOne().lean());
}

export async function saveSingletonDoc(key: string, input: Record<string, any>, admin: { id: string; email: string }) {
  const r = getResource(key)!;
  const data = validateResource(r, input);
  await connectDB();
  const doc = await resourceModels[key]!.findOneAndUpdate({}, { $set: data }, { new: true, upsert: true }).lean();
  await audit(admin, "update", key, String((doc as any)?._id ?? ""));
  return plain(doc);
}

/** Options for reference pickers in the admin (e.g. choose products for a bundle). */
export async function refOptions(key: string, q = "", ids: string[] = []) {
  const r = getResource(key);
  if (!r) return [];
  await connectDB();
  const titleField = r.list?.titleField ?? "name";
  const filter: Record<string, any> = {};
  if (q) filter[titleField] = new RegExp(escapeRegex(q), "i");
  const select = [titleField, "images", "image", "status", "variants.name", "variants.sku", "variants.hex"].join(" ");
  const docs = await resourceModels[key]!.find(ids.length ? { _id: { $in: ids.filter(isObjectId) } } : filter)
    .select(select)
    .sort({ [titleField]: 1 })
    .limit(ids.length ? 500 : 100)
    .lean<any[]>();
  return plain(
    docs.map((d) => ({
      value: String(d._id),
      label: String(d[titleField] ?? d._id) + (d.status === "draft" ? " (draft)" : ""),
      image: d.images?.[0] ?? d.image ?? "",
      shades: d.variants?.map((v: any) => ({ name: v.name, sku: v.sku, hex: v.hex })) ?? undefined,
    })),
  );
}

export async function recentAudit(limit = 20) {
  await connectDB();
  return plain(await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean());
}
