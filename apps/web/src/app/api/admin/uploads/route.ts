import { z } from "zod";
import { handler, json, readJson } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";
import { uploadRequestSchema, uploadTarget } from "@/lib/uploads";

const schema = uploadRequestSchema.extend({ folder: z.string().regex(/^[a-z0-9-]+$/).max(30).optional() });

export const POST = handler(async (req: Request) => {
  await requireAdminApi();
  const input = schema.parse(await readJson(req));
  return json(await uploadTarget(input, input.folder || "media", { maxBytes: 20 * 1024 * 1024 }));
});
