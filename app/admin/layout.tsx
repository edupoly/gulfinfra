import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard | GulfInfraHub",
    template: "%s | GulfInfraHub Admin",
  },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  return (
    <main className="min-h-screen w-full bg-slate-50">
      <div className="mx-auto grid w-full max-w-[1440px] items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <AdminSidebar
          email={admin.email}
          fullName={admin.fullName || "Administrator"}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
