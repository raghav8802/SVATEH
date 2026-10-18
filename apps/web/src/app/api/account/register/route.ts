import { z } from "zod";
import { registerCustomer } from "@svateh/db";
import { ApiError, handler, isBot, json, readJson } from "@/lib/api";
import { startCustomerSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(100),
  marketingOptIn: z.boolean().optional(),
});

export const POST = handler(async (req: Request) => {
  const body = await readJson(req);
  if (isBot(body)) return json({ ok: true });
  const data = schema.parse(body);
  try {
    const c = await registerCustomer(data);
    await startCustomerSession(c);
    return json({ ok: true });
  } catch (e: any) {
    throw new ApiError(e.message, 409);
  }
});
