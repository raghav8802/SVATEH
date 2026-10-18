"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SeedButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  return (
    <div>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const res = await fetch("/api/admin/seed", { method: "POST" });
          const d = await res.json();
          setMsg(d.message ?? d.error);
          setBusy(false);
          router.refresh();
        }}
        className="btn-blush !py-2.5"
      >
        {busy ? "Installing…" : "Install starter content"}
      </button>
      {msg ? <p className="mt-2 text-xs">{msg}</p> : null}
    </div>
  );
}
