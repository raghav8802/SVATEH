import { listAdmins } from "@svateh/db";
import { UsersManager } from "@/components/admin/UsersManager";
import { PageHeader } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";

export const metadata = { title: "Admin users" };

export default async function UsersPage() {
  const me = await requireAdminPage(["owner"]);
  const users: any = await listAdmins();
  return (
    <>
      <PageHeader title="Admin users" description="Give your team their own logins. Owners manage users; managers run the store; editors manage content only." />
      <UsersManager users={users} me={me.id} />
    </>
  );
}
