import { z } from "zod";
import { updateOrderStatus } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";
import { sendOrderStatus } from "@/lib/email";

const schema = z.object({
  status: z.enum(["pending_payment", "placed", "packed", "shipped", "delivered", "cancelled", "refunded"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "cod", "failed", "refunded"]).optional(),
  courier: z.string().trim().max(60).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
  trackingUrl: z.union([z.url(), z.literal("")]).optional(),
  internalNote: z.string().max(2000).optional(),
  note: z.string().max(300).optional(),
  notifyCustomer: z.boolean().optional().default(true),
});

export const PATCH = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const admin = await requireAdminApi(["owner", "manager"]);
  const { id } = await ctx.params;
  const { notifyCustomer, ...patch } = schema.parse(await readJson(req));
  const res = await updateOrderStatus(id, patch, admin.email);
  if (!res) throw new ApiError("Order not found", 404);
  if (res.statusChanged && notifyCustomer) await sendOrderStatus(res.order as any);
  return json({ order: res.order });
});
