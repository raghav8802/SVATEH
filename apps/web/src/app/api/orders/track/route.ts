import { z } from "zod";
import { findOrderForCustomer } from "@svateh/db";
import { ApiError, handler, json, readJson } from "@/lib/api";

const schema = z.object({ number: z.string().trim().min(3, "Enter your order number"), email: z.email("Enter the email used for the order") });

export const POST = handler(async (req: Request) => {
  const { number, email } = schema.parse(await readJson(req));
  const order: any = await findOrderForCustomer(number, { email });
  if (!order) throw new ApiError("We couldn’t find an order with these details.", 404);
  return json({ number: order.number, token: order.accessToken });
});
