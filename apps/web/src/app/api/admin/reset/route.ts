import { z } from "zod";
import { resetPassword } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";

const schema = z.object({ token: z.string().min(10), password: z.string().min(10, "Use at least 10 characters") });

export const POST = handler(async (req: Request) => {
  const { token, password } = schema.parse(await readJson(req));
  if (!(await resetPassword("admin", token, password))) throw new ApiError("This link has expired. Please request a new one.");
  return json({ ok: true });
});
