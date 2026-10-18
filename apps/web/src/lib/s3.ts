import "server-only";
import crypto from "node:crypto";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

export const s3Configured = () => !!(process.env.S3_BUCKET && process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

let client: S3Client | null = null;
const s3 = () =>
  (client ??= new S3Client({
    region: process.env.AWS_REGION,
    credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
  }));

export const publicBase = () =>
  (process.env.S3_PUBLIC_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`).replace(/\/$/, "");

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
};

export function buildKey(folder: string, filename: string, contentType: string) {
  const ext = ALLOWED_TYPES[contentType] ?? "bin";
  const base = filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "file";
  const d = new Date();
  return `${folder}/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
}

/**
 * Browser uploads go straight to S3 with a short-lived presigned POST, so large
 * images never pass through Vercel functions (which cap request bodies at 4.5 MB).
 */
export async function presignUpload(opts: { folder: string; filename: string; contentType: string; maxBytes: number }) {
  const key = buildKey(opts.folder, opts.filename, opts.contentType);
  const { url, fields } = await createPresignedPost(s3(), {
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Conditions: [
      ["content-length-range", 1, opts.maxBytes],
      ["eq", "$Content-Type", opts.contentType],
    ],
    Fields: { "Content-Type": opts.contentType, "Cache-Control": "public, max-age=31536000, immutable" },
    Expires: 300,
  });
  return { url, fields, publicUrl: `${publicBase()}/${key}` };
}
