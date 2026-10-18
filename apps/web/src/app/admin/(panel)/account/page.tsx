import { MyAccountForm } from "@/components/admin/UsersManager";
import { PageHeader } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";

export const metadata = { title: "My account" };

export default async function MyAccount() {
  const me = await requireAdminPage();
  return (
    <>
      <PageHeader title="My account" description={`${me.email} · ${me.role}`} />
      <MyAccountForm id={me.id} name={me.name} />
    </>
  );
}
