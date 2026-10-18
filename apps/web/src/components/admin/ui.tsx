import Link from "next/link";
import { formatDate, formatINR } from "@svateh/core";
import type { ColumnKind } from "@svateh/core";

const BADGE_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  approved: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  draft: "bg-ink/10 text-ink/70",
  pending: "bg-amber-100 text-amber-800",
  pending_payment: "bg-amber-100 text-amber-800",
  new: "bg-blush/50 text-plum",
  placed: "bg-blush/50 text-plum",
  packed: "bg-violet/15 text-violet",
  shipped: "bg-blue-100 text-blue-800",
  cod: "bg-amber-50 text-amber-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-ink/10 text-ink/70",
};

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${BADGE_COLORS[value] ?? "bg-ink/5 text-ink/70"}`}>{label ?? value.replace(/_/g, " ")}</span>;
}

export function Cell({ kind, value }: { kind?: ColumnKind; value: any }) {
  switch (kind) {
    case "image": {
      const src = Array.isArray(value) ? value[0] : value;
      return src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-10 w-10 rounded object-cover" />
      ) : (
        <span className="block h-10 w-10 rounded bg-blush/40" />
      );
    }
    case "money":
      return <>{value != null ? formatINR(value) : "—"}</>;
    case "bool":
      return value ? <span className="text-green-700">●</span> : <span className="text-ink/25">○</span>;
    case "date":
      return <>{formatDate(value)}</>;
    case "badge":
      return value ? <StatusBadge value={String(value)} /> : <>—</>;
    case "count":
      return <>{Array.isArray(value) ? value.length : 0}</>;
    case "ref":
      return <>{value?.name ?? value?.title ?? value?.code ?? value?.email ?? "—"}</>;
    default:
      return <>{value === "" || value == null ? "—" : String(value).replace(/\n/g, " ")}</>;
  }
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-ink/60">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      {page > 1 ? <Link href={href(page - 1)} className="rounded-full border border-ink/20 px-3 py-1.5 hover:border-violet">← Prev</Link> : null}
      <span className="text-ink/60">
        Page {page} of {pages}
      </span>
      {page < pages ? <Link href={href(page + 1)} className="rounded-full border border-ink/20 px-3 py-1.5 hover:border-violet">Next →</Link> : null}
    </div>
  );
}

export const card = "rounded-2xl bg-white p-5 shadow-sm sm:p-6";
