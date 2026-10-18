import { getResource } from "@svateh/core";
import { createResourceDoc } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";

export const POST = handler(async (req: Request, ctx: { params: Promise<{ resource: string }> }) => {
  const { resource } = await ctx.params;
  const r = getResource(resource);
  if (!r || r.singleton) throw new ApiError("Unknown resource", 404);
  if (r.noCreate) throw new ApiError("These records are created from the storefront.", 405);
  const admin = await requireAdminApi(r.roles);
  return json({ doc: await createResourceDoc(resource, await readJson(req), admin) }, 201);
});
