import { z } from "zod";
import { addressSchema } from "@svateh/core";
import { updateCustomer } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { getCustomerSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  addresses: z.array(addressSchema.extend({ label: z.string().max(30).optional().default(""), isDefault: z.boolean().optional().default(false) })).max(10).optional(),
});

export const PATCH = handler(async (req: Request) => {
  const s = await getCustomerSession();
  if (!s) throw new ApiError("Please sign in.", 401);
  const data = schema.parse(await readJson(req));
  return json({ customer: await updateCustomer(s.id, data) });
});
