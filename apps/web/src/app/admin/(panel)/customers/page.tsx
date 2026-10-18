import Link from "next/link";
import { Download, Search } from "lucide-react";
import { formatDate, formatINR } from "@svateh/core";
import { listCustomers } from "@svateh/db";
import { PageHeader, Pager } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdminPage(["owner", "manager"]);
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { items, total, pages } = await listCustomers(sp.q ?? "", page);
  return (
    <>
      <PageHeader
        title="Customers"
        description="People who created an account. Guest orders are listed under Orders."
        actions={
          <a href="/api/admin/export/customers" className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white px-4 py-2 text-xs hover:border-violet">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </a>
        }
      />
      <form className="relative mb-4 w-64" action="/admin/customers">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink/40" />
        <input name="q" defaultValue={sp.q} placeholder="Name or email" className="field !rounded-full !py-2 pl-9" />
      </form>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-[11px] tracking-wide text-ink/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {items.map((c: any) => (
              <tr key={c._id}>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="text-violet hover:underline">{c.email}</Link>
                </td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3">{formatINR(c.spent)}</td>
                <td className="px-4 py-3 text-ink/60">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {!items.length ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-ink/55">No customers yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink/50">{total} customers</p>
      <Pager page={page} pages={pages} href={(p) => `/admin/customers?page=${p}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`} />
    </>
  );
}
