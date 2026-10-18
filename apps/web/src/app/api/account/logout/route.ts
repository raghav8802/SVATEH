import { handler, json } from "@/lib/api";
import { endSession } from "@/lib/auth";

export const POST = handler(async () => {
  await endSession("customer");
  return json({ ok: true });
});
