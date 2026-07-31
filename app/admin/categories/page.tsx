import type { Metadata } from "next";
import {
  faBriefcase, faBuilding, faClipboardList, faFileInvoice, faTrowelBricks, faTruckFront,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { countStatuses, StatusCount, type StatusCounts } from "@/components/admin/StatusUI";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Categories" };

const categoryMeta = {
  contractors: { icon: faBuilding, color: "bg-blue-50 text-blue-700" },
  "projects-tenders": { icon: faClipboardList, color: "bg-violet-50 text-violet-700" },
  "equipment-marketplace": { icon: faTruckFront, color: "bg-amber-50 text-amber-700" },
  "construction-materials": { icon: faTrowelBricks, color: "bg-orange-50 text-orange-700" },
  "business-opportunities": { icon: faBriefcase, color: "bg-emerald-50 text-emerald-700" },
  rfqs: { icon: faFileInvoice, color: "bg-cyan-50 text-cyan-700" },
} as const;

export default async function AdminCategoriesPage() {
  const [categories, contractors, projects, equipment, materials, opportunities, rfqs] =
    await Promise.all([
      prisma.category.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
      prisma.contractor.findMany({ select: { listingStatus: true } }),
      prisma.projectTender.findMany({ select: { listingStatus: true } }),
      prisma.equipment.findMany({ select: { listingStatus: true } }),
      prisma.material.findMany({ select: { listingStatus: true } }),
      prisma.businessOpportunity.findMany({ select: { listingStatus: true } }),
      prisma.rfq.findMany({ select: { status: true } }),
    ]);
  const statuses: Record<string, StatusCounts> = {
    contractors: countStatuses(contractors.map((item) => item.listingStatus)),
    "projects-tenders": countStatuses(projects.map((item) => item.listingStatus)),
    "equipment-marketplace": countStatuses(equipment.map((item) => item.listingStatus)),
    "construction-materials": countStatuses(materials.map((item) => item.listingStatus)),
    "business-opportunities": countStatuses(opportunities.map((item) => item.listingStatus)),
    rfqs: countStatuses(rfqs.map((item) => item.status)),
  };
  const rows = [...categories, { slug: "rfqs", name: "RFQs" }].map((category) => ({
    ...category,
    statuses: statuses[category.slug] ?? countStatuses([]),
  }));

  return (
    <>
      <AdminPageHeader title="Categories" description="Listing totals and publication status for each marketplace category." />
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((category) => {
          const meta = categoryMeta[category.slug as keyof typeof categoryMeta];
          const total = Object.values(category.statuses).reduce((sum, count) => sum + count, 0);
          return (
            <article key={category.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`grid size-12 place-items-center rounded-xl ${meta?.color ?? "bg-slate-100 text-slate-700"}`}>
                {meta && <FontAwesomeIcon icon={meta.icon} className="w-5" />}
              </div>
              <h2 className="mt-5 text-lg font-black text-[#0b1f3a]">{category.name}</h2>
              <p className="mt-2 text-4xl font-black text-[#0b1f3a]">{total.toLocaleString()}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <StatusCount label="Published" count={category.statuses.published} tone="emerald" />
                <StatusCount label="Draft" count={category.statuses.draft} tone="slate" />
                <StatusCount label="Pending" count={category.statuses.pending} tone="amber" />
                <StatusCount label="Closed" count={category.statuses.closed} tone="red" />
                <StatusCount label="Rejected" count={category.statuses.rejected} tone="red" />
                <StatusCount label="On hold" count={category.statuses.on_hold} tone="amber" />
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
