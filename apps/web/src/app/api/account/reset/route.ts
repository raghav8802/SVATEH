import { z } from "zod";
import { resetPassword } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";

const schema = z.object({ token: z.string().min(10), password: z.string().min(8, "Use at least 8 characters").max(100) });

export const POST = handler(async (req: Request) => {
  const { token, password } = schema.parse(await readJson(req));
  if (!(await resetPassword("customer", token, password))) throw new ApiError("This link has expired. Please request a new one.", 400);
  return json({ ok: true });
});
