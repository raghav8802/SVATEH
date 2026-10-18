import { notFound } from "next/navigation";
import { getResource } from "@svateh/core";
import { getResourceDoc } from "@svateh/db";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { requireAdminPage } from "@/lib/auth";

export default async function EditResourcePage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const r = getResource(resource);
  if (!r || r.singleton) notFound();
  await requireAdminPage(r.roles);
  const doc = await getResourceDoc(r.key, id);
  if (!doc) notFound();
  return <ResourceForm key={id} resourceKey={r.key} initial={doc} mode="edit" />;
}
