import type { Metadata } from "next";
import { setUserBlocked } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "User Management" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: { not: "admin" } },
    select: {
      id: true, email: true, fullName: true, company: true, emailVerifiedAt: true,
      blockedAt: true, blockedReason: true, createdAt: true,
      _count: {
        select: {
          contractors: true, projectTenders: true, equipmentListings: true,
          materialListings: true, businessOpportunities: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminPageHeader title="User management" description="Block or restore user access to marketplace and account activity." />
      <div className="mt-6 flex gap-2 text-xs font-black">
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">
          {users.filter((user) => !user.blockedAt).length} active
        </span>
        <span className="rounded-full bg-red-50 px-3 py-2 text-red-700">
          {users.filter((user) => user.blockedAt).length} blocked
        </span>
      </div>
      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {users.length ? (
          <div className="divide-y divide-slate-100">
            {users.map((user) => {
              const listingCount = Object.values(user._count).reduce((total, count) => total + count, 0);
              const action = setUserBlocked.bind(null, user.id, !user.blockedAt);
              return (
                <article key={user.id} className="p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-black text-[#0b1f3a]">{user.fullName || user.email}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black uppercase ${
                          user.blockedAt ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {user.blockedAt ? "Blocked" : "Active"}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-600">{user.email}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {user.company || "No company"} · {listingCount} listing{listingCount === 1 ? "" : "s"} · Joined {user.createdAt.toLocaleDateString("en-GB")}
                        {!user.emailVerifiedAt ? " · Email unverified" : ""}
                      </p>
                      {user.blockedAt && (
                        <p className="mt-2 text-xs font-bold text-red-700">Reason: {user.blockedReason || "Blocked by administrator"}</p>
                      )}
                    </div>
                    <form action={action} className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
                      {!user.blockedAt && (
                        <input name="reason" maxLength={500} placeholder="Reason for blocking (optional)" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-400" />
                      )}
                      <button type="submit" className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-black ${
                        user.blockedAt ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-red-600 text-white hover:bg-red-700"
                      }`}>
                        {user.blockedAt ? "Unblock user" : "Block user"}
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No users found.</p>
        )}
      </section>
    </>
  );
}
