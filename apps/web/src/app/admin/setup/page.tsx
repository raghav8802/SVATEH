import { redirect } from "next/navigation";
import { adminCount, getSettings } from "@svateh/db";
import { AdminSetupForm, AuthShell } from "@/components/admin/AuthForms";

export default async function AdminSetup() {
  if ((await adminCount()) > 0) redirect("/admin/login");
  const s = await getSettings();
  return (
    <AuthShell title="Set up your store" brand={s.brandName}>
      <AdminSetupForm needsKey={!!process.env.ADMIN_SETUP_KEY} />
    </AuthShell>
  );
}
