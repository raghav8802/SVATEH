import { redirect } from "next/navigation";
import { adminCount, getSettings } from "@svateh/db";
import { AdminLoginForm, AuthShell } from "@/components/admin/AuthForms";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if ((await adminCount()) === 0) redirect("/admin/setup");
  if (await getAdminSession()) redirect("/admin");
  const { next } = await searchParams;
  const safe = next?.startsWith("/admin") ? next : "/admin";
  const s = await getSettings();
  return (
    <AuthShell title="Sign in" brand={s.brandName}>
      <AdminLoginForm next={safe} />
    </AuthShell>
  );
}
