import { getResource } from "@svateh/core";
import { duplicateResourceDoc } from "@svateh/db";
import { ApiError, handler, json } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";

export const POST = handler(async (_req: Request, ctx: { params: Promise<{ resource: string; id: string }> }) => {
  const { resource, id } = await ctx.params;
  const r = getResource(resource);
  if (!r || r.singleton || r.noCreate) throw new ApiError("Unknown resource", 404);
  const admin = await requireAdminApi(r.roles);
  const doc = await duplicateResourceDoc(resource, id, admin);
  if (!doc) throw new ApiError("Not found", 404);
  return json({ doc }, 201);
});
