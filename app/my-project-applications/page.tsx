import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewProjectApplication } from "@/app/project-applications/actions";
import { AccountDashboardShell } from "@/components/account/AccountDashboardShell";

export const dynamic = "force-dynamic";

export default async function ProjectOwnerApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const projects = await prisma.projectTender.findMany({
    where: { ownerId: user.id },
    select: { id: true, slug: true, title: true, listingStatus: true, applications: { include: { applicant: { select: { email: true, fullName: true } } }, orderBy: { updatedAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <AccountDashboardShell user={user}>
      <p className="text-sm font-black uppercase tracking-wider text-amber-700">Project-owner workspace</p><h1 className="mt-2 text-4xl font-black text-[#0b1f3a]">Received Applications</h1><p className="mt-2 text-slate-600">Review applicants for projects and tenders you published.</p>
      <div className="mt-8 space-y-5">{projects.map((project) => <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-[#0b1f3a]">{project.title}</h2><p className="mt-1 text-sm text-slate-500">{project.applications.length} applications</p></div><Link href={`/projects-tenders/${project.slug}`} className="text-sm font-black text-blue-700">View project</Link></div><div className="mt-5 space-y-3">{project.applications.map((application) => <div key={application.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-black text-slate-900">{application.companyName}</p><p className="text-sm text-slate-500">{application.contactPerson} · {application.proposedRole}</p><p className="mt-1 text-xs font-bold uppercase text-slate-500">{application.status.replace("_", " ")}</p></div><div className="flex flex-wrap gap-2"><Link href={`/my-applications/${application.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-blue-700">Review details</Link>{["submitted", "under_review", "shortlisted"].includes(application.status) && <><form action={reviewProjectApplication.bind(null, application.id, "shortlisted")}><button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white">Shortlist</button></form><form action={reviewProjectApplication.bind(null, application.id, "accepted")}><button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white">Accept</button></form><form action={reviewProjectApplication.bind(null, application.id, "rejected")}><button className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700">Reject</button></form></>}</div></div>)}{!project.applications.length && <p className="text-sm text-slate-500">No applications received.</p>}</div></article>)}{!projects.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><h2 className="text-xl font-black text-[#0b1f3a]">You do not own any project listings</h2><Link href="/add-listing" className="mt-3 inline-block font-black text-blue-700">Add a project listing →</Link></div>}</div>
    </AccountDashboardShell>
  );
}
