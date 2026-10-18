import { z } from "zod";
import { deleteAdmin, updateAdmin } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).optional(),
  role: z.enum(["owner", "manager", "editor"]).optional(),
  active: z.boolean().optional(),
  password: z.union([z.string().min(10, "Use at least 10 characters"), z.literal("")]).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handler(async (req: Request, ctx: Ctx) => {
  const me = await requireAdminApi();
  const { id } = await ctx.params;
  const data = schema.parse(await readJson(req));
  // Everyone may change their own name/password; only owners manage others and roles.
  if (id !== me.id || data.role !== undefined || data.active !== undefined) await requireAdminApi(["owner"]);
  try {
    await updateAdmin(id, data);
  } catch (e: any) {
    throw new ApiError(e.message, 409);
  }
  return json({ ok: true });
});

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const me = await requireAdminApi(["owner"]);
  const { id } = await ctx.params;
  if (id === me.id) throw new ApiError("You can’t delete your own account.", 409);
  try {
    await deleteAdmin(id);
  } catch (e: any) {
    throw new ApiError(e.message, 409);
  }
  return json({ ok: true });
});
