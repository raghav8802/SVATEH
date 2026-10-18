/** Browser-side upload: asks our API for a presigned target, then sends the file straight to S3. */
export async function uploadFile(file: File, presignEndpoint: string, folder?: string): Promise<string> {
  const res = await fetch(presignEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size, folder }),
  });
  const target = await res.json();
  if (!res.ok) throw new Error(target.error || "Upload failed");

  const form = new FormData();
  for (const [k, v] of Object.entries(target.fields ?? {})) form.append(k, v as string);
  form.append("file", file);
  const up = await fetch(target.url, { method: "POST", body: form });
  if (!up.ok) {
    const data = await up.json().catch(() => null);
    throw new Error(data?.error || "Upload failed — please check the S3 bucket CORS settings.");
  }
  if (target.mode === "local") return (await up.json()).publicUrl;
  return target.publicUrl;
}
