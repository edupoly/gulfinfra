import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withdrawProjectApplication } from "@/app/project-applications/actions";
import { AccountDashboardShell } from "@/components/account/AccountDashboardShell";

export const dynamic = "force-dynamic";

export default async function MyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { status = "" } = await searchParams;
  const statuses = ["submitted", "under_review", "shortlisted", "accepted", "rejected", "withdrawn"];
  const applications = await prisma.projectApplication.findMany({
    where: { applicantId: user.id, ...(statuses.includes(status) ? { status } : {}) },
    include: { projectTender: { select: { slug: true, title: true, client: true, location: true, deadline: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <AccountDashboardShell user={user}>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wider text-amber-700">Applicant workspace</p><h1 className="mt-2 text-4xl font-black text-[#0b1f3a]">My Applications</h1><p className="mt-2 text-slate-600">Track project and tender applications submitted by your account.</p></div><Link href="/projects-tenders" className="rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950">Browse projects</Link></div>
      <form className="mt-8 flex max-w-sm gap-2"><select name="status" defaultValue={statuses.includes(status) ? status : ""} className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}</select><button className="rounded-xl bg-[#0b1f3a] px-5 py-3 font-black text-white">Filter</button></form>
      <div className="mt-5 space-y-4">{applications.map((application) => <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase text-amber-700">{application.proposedRole}</p><h2 className="mt-1 text-xl font-black text-[#0b1f3a]">{application.projectTender.title}</h2><p className="mt-1 text-sm text-slate-500">{application.projectTender.client} · submitted {application.submittedAt.toLocaleDateString("en-GB")}</p></div><div className="md:text-right"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{application.status.replace("_", " ")}</span><div className="mt-3 flex flex-wrap gap-2"><Link href={`/my-applications/${application.id}`} className="rounded-lg bg-[#0b1f3a] px-4 py-2 text-sm font-black text-white">View timeline</Link>{application.status === "submitted" && <Link href={`/projects-tenders/${application.projectTender.slug}/apply`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-blue-700">Edit</Link>}{["submitted", "under_review", "shortlisted"].includes(application.status) && <form action={withdrawProjectApplication.bind(null, application.id)}><button className="rounded-lg bg-red-50 px-4 py-2 text-sm font-black text-red-700">Withdraw</button></form>}</div></div></div></article>)}{!applications.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><h2 className="text-xl font-black text-[#0b1f3a]">No applications found</h2><Link href="/projects-tenders" className="mt-3 inline-block font-black text-blue-700">Find a project →</Link></div>}</div>
    </AccountDashboardShell>
  );
}
