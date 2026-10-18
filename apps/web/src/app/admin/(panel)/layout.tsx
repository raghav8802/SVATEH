import { RESOURCES } from "@svateh/core";
import { ContactMessage, Order, Review, connectDB, getSettings } from "@svateh/db";
import { AdminNav, type NavGroup } from "@/components/admin/AdminNav";
import { requireAdminPage } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  await connectDB();
  const [settings, toFulfil, pendingReviews, newMessages] = await Promise.all([
    getSettings(),
    Order.countDocuments({ status: { $in: ["placed", "packed"] } }),
    Review.countDocuments({ status: "pending" }),
    ContactMessage.countDocuments({ status: "new" }),
  ]);
  const badges: Record<string, number> = { reviews: pendingReviews, messages: newMessages };
  const res = (group: string) =>
    RESOURCES.filter((r) => r.group === group && r.roles.includes(admin.role)).map((r) => ({ label: r.label, href: `/admin/r/${r.key}`, badge: badges[r.key] }));
  const manager = admin.role !== "editor";

  const groups: NavGroup[] = [
    { title: "", items: [{ label: "Dashboard", href: "/admin" }, ...(manager ? [{ label: "Orders", href: "/admin/orders", badge: toFulfil }, { label: "Customers", href: "/admin/customers" }] : [])] },
    { title: "Catalog", items: res("Catalog") },
    { title: "Merchandising", items: res("Merchandising") },
    { title: "Content", items: res("Content") },
    { title: "Community", items: res("Community") },
    ...(manager ? [{ title: "Sales & marketing", items: res("Sales") }] : []),
    {
      title: "Settings",
      items: [...res("Settings"), ...(admin.role === "owner" ? [{ label: "Admin users", href: "/admin/users" }] : []), { label: "Help & guide", href: "/admin/help" }],
    },
  ].filter((g) => g.items.length);

  return (
    <div className="lg:pl-64 print:pl-0">
      <AdminNav groups={groups} brand={settings.brandName} admin={admin} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
