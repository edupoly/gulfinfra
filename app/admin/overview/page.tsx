import type { Metadata } from "next";
import { faLayerGroup, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { countStatuses, StatusCount } from "@/components/admin/StatusUI";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const [contractors, projects, equipment, materials, opportunities, rfqs, userCounts] =
    await Promise.all([
      prisma.contractor.findMany({ select: { listingStatus: true } }),
      prisma.projectTender.findMany({ select: { listingStatus: true } }),
      prisma.equipment.findMany({ select: { listingStatus: true } }),
      prisma.material.findMany({ select: { listingStatus: true } }),
      prisma.businessOpportunity.findMany({ select: { listingStatus: true } }),
      prisma.rfq.findMany({ select: { status: true } }),
      prisma.user.groupBy({
        by: ["role", "blockedAt"],
        _count: { _all: true },
      }),
    ]);
  const statuses = countStatuses([
    ...contractors.map((item) => item.listingStatus),
    ...projects.map((item) => item.listingStatus),
    ...equipment.map((item) => item.listingStatus),
    ...materials.map((item) => item.listingStatus),
    ...opportunities.map((item) => item.listingStatus),
    ...rfqs.map((item) => item.status),
  ]);
  const totalListings = Object.values(statuses).reduce((total, count) => total + count, 0);
  const users = userCounts
    .filter((group) => group.role !== "admin")
    .reduce((total, group) => total + group._count._all, 0);
  const blockedUsers = userCounts
    .filter((group) => group.role !== "admin" && group.blockedAt !== null)
    .reduce((total, group) => total + group._count._all, 0);

  return (
    <>
      <AdminPageHeader title="Dashboard overview" description="A snapshot of marketplace inventory and user activity." />
      <section aria-label="Administration summary" className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#0b1f3a] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white/70">Marketplace listings</p>
            <FontAwesomeIcon icon={faLayerGroup} className="w-6 text-amber-400" />
          </div>
          <p className="mt-3 text-4xl font-black !text-white">{totalListings.toLocaleString()}</p>
          <p className="mt-2 text-xs text-white/60">Records across all marketplace categories</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500">Registered users</p>
            <FontAwesomeIcon icon={faUsers} className="w-6 text-blue-700" />
          </div>
          <p className="mt-3 text-4xl font-black text-[#0b1f3a]">{users.toLocaleString()}</p>
          <p className="mt-2 text-xs text-slate-500">{blockedUsers} blocked account{blockedUsers === 1 ? "" : "s"}</p>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#0b1f3a]">Listing status</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <StatusCount label="Published" count={statuses.published} tone="emerald" />
          <StatusCount label="Draft" count={statuses.draft} tone="slate" />
          <StatusCount label="Pending" count={statuses.pending} tone="amber" />
          <StatusCount label="Closed" count={statuses.closed} tone="red" />
          <StatusCount label="Rejected" count={statuses.rejected} tone="red" />
          <StatusCount label="On hold" count={statuses.on_hold} tone="amber" />
        </div>
      </section>
    </>
  );
}
