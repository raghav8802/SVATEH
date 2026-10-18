import { releaseStaleOrders } from "@svateh/db";
import { json } from "@/lib/api";

/** Called by Vercel Cron (see vercel.json). Returns unpaid online orders' stock to sale. */
export async function GET(req: Request) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ error: "Unauthorized" }, 401);
  }
  const released = await releaseStaleOrders(45);
  return json({ released });
}
