import { DashboardSidebar } from "@/components/account/DashboardSidebar";

export function AccountDashboardShell({
  user,
  children,
}: {
  user: {
    email: string;
    fullName: string | null;
    profileImageUrl: string | null;
  };
  children: React.ReactNode;
}) {
  return (
    <main className="w-full bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar
          email={user.email}
          fullName={user.fullName}
          profileImageUrl={user.profileImageUrl}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
