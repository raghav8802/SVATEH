import { z } from "zod";
import { verifyCustomer } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { startCustomerSession } from "@/lib/auth";

const schema = z.object({ email: z.email("Enter a valid email"), password: z.string().min(1, "Enter your password") });

export const POST = handler(async (req: Request) => {
  const { email, password } = schema.parse(await readJson(req));
  const c = await verifyCustomer(email, password);
  if (!c) throw new ApiError("Email or password is incorrect.", 401);
  await startCustomerSession(c);
  return json({ ok: true });
});
