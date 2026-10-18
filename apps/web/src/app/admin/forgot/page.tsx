import { getSettings } from "@svateh/db";
import { AuthShell } from "@/components/admin/AuthForms";
import { ForgotForm } from "@/components/store/forms";

export default async function AdminForgot() {
  const s = await getSettings();
  return (
    <AuthShell title="Reset password" brand={s.brandName}>
      <ForgotForm endpoint="/api/admin/forgot" />
    </AuthShell>
  );
}
