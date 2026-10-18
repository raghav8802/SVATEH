import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Plus, Search } from "lucide-react";
import { getResource } from "@svateh/core";
import { getSingletonDoc, listResource } from "@svateh/db";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { Cell, PageHeader, Pager } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";

type Props = { params: Promise<{ resource: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props) {
  return { title: getResource((await params).resource)?.label ?? "Admin" };
}

export default async function ResourceListPage({ params, searchParams }: Props) {
  const { resource } = await params;
  const r = getResource(resource);
  if (!r) notFound();
  await requireAdminPage(r.roles);

  if (r.singleton) {
    const doc = await getSingletonDoc(r.key);
    return <ResourceForm resourceKey={r.key} initial={doc} mode="singleton" />;
  }

  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const filters = Object.fromEntries((r.list?.filters ?? []).map((f) => [f.field, sp[f.field] ?? ""]));
  const { items, total, pages } = await listResource(r.key, { q: sp.q, page, filters });
  const cols = r.list?.columns ?? [{ field: r.list?.titleField ?? "name", label: "Name" }];
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/r/${r.key}${p.toString() ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title={r.label}
        description={r.description}
        actions={
          <>
            {r.csv ? (
              <a href={`/api/admin/export/${r.key}`} className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white px-4 py-2 text-xs hover:border-violet">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </a>
            ) : null}
            {!r.noCreate ? (
              <Link href={`/admin/r/${r.key}/new`} className="btn-plum !py-2.5">
                <Plus className="h-3.5 w-3.5" /> New {r.singular.toLowerCase()}
              </Link>
            ) : null}
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {r.list?.searchFields?.length ? (
          <form className="relative" action={`/admin/r/${r.key}`}>
            {Object.entries(filters).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input name="q" defaultValue={sp.q} placeholder="Search…" className="field !w-64 !rounded-full !py-2 pl-9" />
          </form>
        ) : null}
        {(r.list?.filters ?? []).map((f) => (
          <div key={f.field} className="flex flex-wrap gap-1">
            <Link href={qs({ [f.field]: undefined, page: undefined })} className={`rounded-full px-3 py-1.5 text-xs ${!sp[f.field] ? "bg-plum text-white" : "bg-white hover:bg-cream"}`}>
              All
            </Link>
            {f.options.map((o) => (
              <Link key={o.value} href={qs({ [f.field]: o.value, page: undefined })} className={`rounded-full px-3 py-1.5 text-xs ${sp[f.field] === o.value ? "bg-plum text-white" : "bg-white hover:bg-cream"}`}>
                {o.label}
              </Link>
            ))}
          </div>
        ))}
        <span className="ml-auto text-xs text-ink/50">{total} total</span>
      </div>
      {items.length ? (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 text-[11px] tracking-wide text-ink/50 uppercase">
              <tr>
                {cols.map((c) => (
                  <th key={c.field} className="px-4 py-3 font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {items.map((it: any) => (
                <tr key={it._id} className="hover:bg-cream/60">
                  {cols.map((c, i) => (
                    <td key={c.field} className="px-4 py-2.5">
                      {i === 0 || c.field === r.list?.titleField ? (
                        <Link href={`/admin/r/${r.key}/${it._id}`} className={c.kind === "image" ? "block" : "font-medium hover:text-violet"}>
                          <Cell kind={c.kind} value={it[c.field]} />
                        </Link>
                      ) : (
                        <Cell kind={c.kind} value={it[c.field]} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-12 text-center text-sm text-ink/60">
          {sp.q || Object.values(filters).some(Boolean) ? "No matches." : `No ${r.label.toLowerCase()} yet.`}
          {!r.noCreate && !sp.q ? (
            <div className="mt-4">
              <Link href={`/admin/r/${r.key}/new`} className="btn-plum !py-2.5">
                Create the first one
              </Link>
            </div>
          ) : null}
        </div>
      )}
      <Pager page={page} pages={pages} href={(p) => qs({ page: String(p) })} />
    </>
  );
}
