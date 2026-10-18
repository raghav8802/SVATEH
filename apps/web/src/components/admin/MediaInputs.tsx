"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, X } from "lucide-react";
import { uploadFile } from "@/lib/upload-client";

const isVideo = (u: string) => /\.mp4($|\?)/i.test(u);

function Thumb({ src, className = "" }: { src: string; className?: string }) {
  return isVideo(src) ? (
    <video src={src} className={`h-full w-full object-cover ${className}`} muted />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`h-full w-full object-cover ${className}`} />
  );
}

function useUploader(folder: string) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const upload = async (files: File[]) => {
    setError("");
    setBusy((b) => b + files.length);
    const urls: string[] = [];
    for (const f of files) {
      try {
        urls.push(await uploadFile(f, "/api/admin/uploads", folder));
      } catch (e: any) {
        setError(`${f.name}: ${e.message}`);
      } finally {
        setBusy((b) => b - 1);
      }
    }
    return urls;
  };
  return { busy, error, upload, setError };
}

function UrlPrompt({ onAdd }: { onAdd: (url: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        const u = window.prompt("Paste an image URL");
        if (u && /^(https?:\/\/|\/)/.test(u.trim())) onAdd(u.trim());
      }}
      className="inline-flex items-center gap-1 text-xs text-ink/60 underline hover:text-violet"
    >
      <Link2 className="h-3 w-3" /> Use a URL instead
    </button>
  );
}

export function ImageInput({ value, onChange, folder = "media" }: { value: string; onChange: (v: string) => void; folder?: string }) {
  const { busy, error, upload } = useUploader(folder);
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <div className="flex items-start gap-4">
        <div
          onDragOver={(e) => (e.preventDefault(), setDrag(true))}
          onDragLeave={() => setDrag(false)}
          onDrop={async (e) => {
            e.preventDefault();
            setDrag(false);
            const [u] = await upload(Array.from(e.dataTransfer.files).slice(0, 1));
            if (u) onChange(u);
          }}
          className={`relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed ${drag ? "border-violet bg-blush/20" : "border-ink/20 bg-[#FAF8FA]"}`}
        >
          {value ? <Thumb src={value} /> : busy ? <Loader2 className="h-5 w-5 animate-spin text-ink/40" /> : <ImagePlus className="h-6 w-6 text-ink/30" />}
          {value ? (
            <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 rounded-full bg-white p-1 shadow" aria-label="Remove image">
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>
        <div className="space-y-2 pt-1">
          <button type="button" onClick={() => input.current?.click()} className="rounded-full border border-ink/25 px-4 py-2 text-xs hover:border-violet" disabled={busy > 0}>
            {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
          </button>
          <p className="text-[11px] text-ink/50">Drag & drop or click. JPG, PNG or WebP, up to 20 MB.</p>
          <UrlPrompt onAdd={onChange} />
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*,video/mp4"
        className="hidden"
        onChange={async (e) => {
          const [u] = await upload(Array.from(e.target.files ?? []).slice(0, 1));
          if (u) onChange(u);
          e.target.value = "";
        }}
      />
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

export function ImagesInput({ value, onChange, folder = "products" }: { value: string[]; onChange: (v: string[]) => void; folder?: string }) {
  const { busy, error, upload } = useUploader(folder);
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const move = (i: number, d: number) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  const addFiles = async (files: File[]) => {
    const urls = await upload(files);
    if (urls.length) onChange([...value, ...urls]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div key={src + i} className="group relative h-32 w-32 overflow-hidden rounded-lg border border-ink/10 bg-[#FAF8FA]">
            <Thumb src={src} />
            {i === 0 ? <span className="absolute bottom-1 left-1 rounded bg-plum px-1.5 py-0.5 text-[9px] text-white">MAIN</span> : null}
            <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <span className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="rounded-full bg-white p-1 shadow" aria-label="Move left"><ArrowLeft className="h-3 w-3" /></button>
                <button type="button" onClick={() => move(i, 1)} className="rounded-full bg-white p-1 shadow" aria-label="Move right"><ArrowRight className="h-3 w-3" /></button>
              </span>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-full bg-white p-1 shadow" aria-label="Remove"><X className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => (e.preventDefault(), setDrag(true))}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(Array.from(e.dataTransfer.files));
          }}
          className={`flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs text-ink/50 ${drag ? "border-violet bg-blush/20" : "border-ink/20 hover:border-violet"}`}
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {busy ? `Uploading ${busy}…` : "Add images"}
        </button>
      </div>
      <div className="mt-2">
        <UrlPrompt onAdd={(u) => onChange([...value, u])} />
      </div>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/*,video/mp4"
        className="hidden"
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
