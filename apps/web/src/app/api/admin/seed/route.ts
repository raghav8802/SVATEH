import { seedDatabase } from "@svateh/db/seed";
import { handler, json } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";

/** Owner-only: installs starter content when the store has no products yet. */
export const POST = handler(async () => {
  await requireAdminApi(["owner"]);
  return json(await seedDatabase({ force: false }));
});
