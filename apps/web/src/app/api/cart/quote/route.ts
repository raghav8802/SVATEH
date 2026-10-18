import { cartSchema } from "@svateh/core";
import { priceCart } from "@svateh/db";
import { handler, json, readJson } from "@/lib/api";

export const POST = handler(async (req: Request) => {
  const input = cartSchema.parse(await readJson(req));
  return json(await priceCart(input));
});
