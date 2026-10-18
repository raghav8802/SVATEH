import "server-only";
import { z } from "zod";
import { ApiError } from "./api";
import { ALLOWED_TYPES, presignUpload, s3Configured } from "./s3";

export const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string(),
  size: z.number().int().positive(),
});

/**
 * Returns where the browser should upload a file. Uses S3 when configured;
 * in local development without AWS keys, falls back to /public/uploads.
 */
export async function uploadTarget(input: z.infer<typeof uploadRequestSchema>, folder: string, opts: { maxBytes: number; imagesOnly?: boolean }) {
  if (!ALLOWED_TYPES[input.contentType]) throw new ApiError("Please upload a JPG, PNG, WebP, AVIF, GIF, SVG or MP4 file.");
  if (opts.imagesOnly && !input.contentType.startsWith("image/")) throw new ApiError("Please upload an image.");
  if (opts.imagesOnly && input.contentType === "image/svg+xml") throw new ApiError("Please upload a JPG, PNG or WebP photo.");
  if (input.size > opts.maxBytes) throw new ApiError(`File is too large (max ${Math.round(opts.maxBytes / 1024 / 1024)} MB).`);
  if (s3Configured()) {
    return { mode: "s3" as const, ...(await presignUpload({ folder, filename: input.filename, contentType: input.contentType, maxBytes: opts.maxBytes })) };
  }
  if (process.env.NODE_ENV !== "production") {
    return { mode: "local" as const, url: "/api/uploads/local", fields: { folder }, publicUrl: "" };
  }
  throw new ApiError("Image uploads aren’t configured. Add the AWS S3 environment variables.", 503);
}
