import { getResource } from "@svateh/core";
import { deleteResourceDoc, getResourceDoc, updateResourceDoc } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function resolve(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const r = getResource(resource);
  if (!r || r.singleton) throw new ApiError("Unknown resource", 404);
  const admin = await requireAdminApi(r.roles);
  return { r, id, admin };
}

export const GET = handler(async (_req: Request, ctx: Ctx) => {
  const { r, id } = await resolve(ctx);
  const doc = await getResourceDoc(r.key, id);
  if (!doc) throw new ApiError("Not found", 404);
  return json({ doc });
});

export const PUT = handler(async (req: Request, ctx: Ctx) => {
  const { r, id, admin } = await resolve(ctx);
  const doc = await updateResourceDoc(r.key, id, await readJson(req), admin);
  if (!doc) throw new ApiError("Not found", 404);
  return json({ doc });
});

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const { r, id, admin } = await resolve(ctx);
  if (!(await deleteResourceDoc(r.key, id, admin))) throw new ApiError("Not found", 404);
  return json({ ok: true });
});
