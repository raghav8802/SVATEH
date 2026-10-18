import { getResource } from "@svateh/core";
import { saveSingletonDoc } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";

export const PUT = handler(async (req: Request, ctx: { params: Promise<{ resource: string }> }) => {
  const { resource } = await ctx.params;
  const r = getResource(resource);
  if (!r?.singleton) throw new ApiError("Unknown settings", 404);
  const admin = await requireAdminApi(r.roles);
  return json({ doc: await saveSingletonDoc(resource, await readJson(req), admin) });
});
