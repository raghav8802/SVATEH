import { handler, json, readJson } from "@/lib/api";
import { uploadRequestSchema, uploadTarget } from "@/lib/uploads";

export const POST = handler(async (req: Request) => {
  const input = uploadRequestSchema.parse(await readJson(req));
  return json(await uploadTarget(input, "reviews", { maxBytes: 5 * 1024 * 1024, imagesOnly: true }));
});
