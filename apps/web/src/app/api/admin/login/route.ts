import { z } from "zod";
import { verifyAdmin } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { startAdminSession } from "@/lib/auth";

const schema = z.object({ email: z.email("Enter a valid email"), password: z.string().min(1, "Enter your password") });

export const POST = handler(async (req: Request) => {
  const { email, password } = schema.parse(await readJson(req));
  const a = await verifyAdmin(email, password);
  if (!a) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    throw new ApiError("Email or password is incorrect.", 401);
  }
  await startAdminSession(a);
  return json({ ok: true });
});
