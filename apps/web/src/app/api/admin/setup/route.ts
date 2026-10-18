import { z } from "zod";
import { adminCount, createAdmin } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { startAdminSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.email("Enter a valid email"),
  password: z.string().min(10, "Use at least 10 characters"),
  setupKey: z.string().optional(),
});

/** First-run only: creates the owner account when no admin exists yet. */
export const POST = handler(async (req: Request) => {
  const data = schema.parse(await readJson(req));
  if ((await adminCount()) > 0) throw new ApiError("Setup is already complete. Please sign in.", 409);
  if (process.env.ADMIN_SETUP_KEY && data.setupKey !== process.env.ADMIN_SETUP_KEY) throw new ApiError("The setup key is incorrect.", 403);
  const a = await createAdmin({ ...data, role: "owner" });
  await startAdminSession({ ...a, role: "owner" } as any);
  return json({ ok: true });
});
