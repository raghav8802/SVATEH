import { getSettings } from "@svateh/db";
import { AuthShell } from "@/components/admin/AuthForms";
import { ResetForm } from "@/components/store/forms";

export default async function AdminReset({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const s = await getSettings();
  return (
    <AuthShell title="Choose a new password" brand={s.brandName}>
      {token ? <ResetForm token={token} endpoint="/api/admin/reset" after="/admin/login" minLength={10} /> : <p className="text-sm">This link is invalid.</p>}
    </AuthShell>
  );
}
