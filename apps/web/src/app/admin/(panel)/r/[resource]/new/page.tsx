import { notFound } from "next/navigation";
import { getResource } from "@svateh/core";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { requireAdminPage } from "@/lib/auth";

export default async function NewResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const r = getResource((await params).resource);
  if (!r || r.singleton || r.noCreate) notFound();
  await requireAdminPage(r.roles);
  return <ResourceForm resourceKey={r.key} initial={null} mode="new" />;
}
