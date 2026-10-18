import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError, handler, json } from "@/lib/api";
import { ALLOWED_TYPES, buildKey, s3Configured } from "@/lib/s3";

/** Development-only fallback when S3 isn't configured. Disabled in production. */
export const POST = handler(async (req: Request) => {
  if (process.env.NODE_ENV === "production" || s3Configured()) throw new ApiError("Not available.", 404);
  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "misc").replace(/[^a-z0-9-]/gi, "") || "misc";
  if (!(file instanceof File) || !ALLOWED_TYPES[file.type]) throw new ApiError("Unsupported file.");
  if (file.size > 20 * 1024 * 1024) throw new ApiError("File too large.");
  const key = buildKey(folder, file.name, file.type);
  const dest = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return json({ publicUrl: `/uploads/${key}` });
});
