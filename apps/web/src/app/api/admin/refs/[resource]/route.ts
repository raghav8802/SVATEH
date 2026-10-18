import { getResource } from "@svateh/core";
import { refOptions } from "@svateh/db";
import { ApiError, handler, json } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";

export const GET = handler(async (req: Request, ctx: { params: Promise<{ resource: string }> }) => {
  await requireAdminApi();
  const { resource } = await ctx.params;
  if (!getResource(resource)) throw new ApiError("Unknown resource", 404);
  const sp = new URL(req.url).searchParams;
  const ids = sp.get("ids")?.split(",").filter(Boolean) ?? [];
  return json({ options: await refOptions(resource, sp.get("q") ?? "", ids) });
});
