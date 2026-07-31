import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProjectApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = await searchParams;
  const statuses = ["submitted", "under_review", "shortlisted", "accepted", "rejected", "withdrawn"];
  const applications = await prisma.projectApplication.findMany({
    where: statuses.includes(status) ? { status } : undefined,
    include: {
      applicant: { select: { email: true, fullName: true, company: true, blockedAt: true } },
      projectTender: { select: { slug: true, title: true, client: true, owner: { select: { email: true, fullName: true, company: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <>
      <AdminPageHeader title="Project applications" description="Inspect applications submitted across projects and tenders." />
      <form className="mt-8 flex max-w-sm gap-2"><select name="status" defaultValue={statuses.includes(status) ? status : ""} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}</select><button className="rounded-xl bg-[#0b1f3a] px-5 py-3 font-black text-white">Filter</button></form>
      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">{applications.map((application) => <article key={application.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center"><div><p className="text-xs font-black uppercase text-amber-700">{application.status.replace("_", " ")}</p><h2 className="mt-1 font-black text-[#0b1f3a]">{application.companyName}</h2><p className="mt-1 text-sm text-slate-500">{application.contactPerson} · {application.contactEmail}</p></div><div><p className="font-bold text-slate-800">{application.projectTender.title}</p><p className="mt-1 text-sm text-slate-500">Owner: {application.projectTender.owner?.company ?? application.projectTender.owner?.fullName ?? application.projectTender.owner?.email ?? "Legacy listing"}</p></div><Link href={`/my-applications/${application.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-black text-blue-700">Inspect</Link></article>)}{!applications.length && <p className="p-10 text-center text-slate-500">No applications found.</p>}</div>
      </section>
    </>
  );
}
