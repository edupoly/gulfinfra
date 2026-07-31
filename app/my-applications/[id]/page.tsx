import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewProjectApplication, withdrawProjectApplication } from "@/app/project-applications/actions";
import { AccountDashboardShell } from "@/components/account/AccountDashboardShell";

export const dynamic = "force-dynamic";

export default async function ProjectApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const isAdmin = user.role === "admin";
  const application = await prisma.projectApplication.findFirst({
    where: isAdmin ? { id } : { id, OR: [{ applicantId: user.id }, { projectTender: { ownerId: user.id } }] },
    include: { applicant: { select: { email: true, fullName: true, company: true } }, projectTender: { select: { slug: true, title: true, client: true, ownerId: true } }, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!application) notFound();
  const isOwner = application.projectTender.ownerId === user.id;
  const content = (
    <>
      <Link href={isAdmin ? "/admin/project-applications" : isOwner ? "/my-project-applications" : "/my-applications"} className="font-bold text-blue-700">← Back to applications</Link>
      <article className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase text-amber-700">{application.proposedRole}</p><h1 className="mt-2 text-3xl font-black text-[#0b1f3a]">{application.projectTender.title}</h1><p className="mt-2 text-slate-500">{application.companyName} · {application.contactPerson}</p></div><span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase text-slate-700">{application.status.replace("_", " ")}</span></div>
        <dl className="mt-7 grid gap-3 sm:grid-cols-2">{[["Company", application.companyName], ["Contact person", application.contactPerson], ["Email", application.contactEmail], ["Phone", application.contactPhone], ["Proposed role", application.proposedRole], ["Submitted", application.submittedAt.toLocaleString("en-GB")]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-black uppercase text-slate-400">{label}</dt><dd className="mt-1 font-bold text-slate-800">{value}</dd></div>)}</dl>
        <section className="mt-7"><h2 className="text-xl font-black text-[#0b1f3a]">Cover message</h2><p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{application.coverMessage}</p>{application.supportingDocumentUrl && <a href={application.supportingDocumentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-lg border border-slate-300 px-4 py-2 font-black text-blue-700">Open supporting document ↗</a>}</section>
        {isOwner && !isAdmin && ["submitted", "under_review", "shortlisted"].includes(application.status) && <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5"><form action={reviewProjectApplication.bind(null, id, "under_review")}><button className="rounded-lg bg-blue-50 px-4 py-2 font-black text-blue-700">Under review</button></form><form action={reviewProjectApplication.bind(null, id, "shortlisted")}><button className="rounded-lg bg-blue-600 px-4 py-2 font-black text-white">Shortlist</button></form><form action={reviewProjectApplication.bind(null, id, "accepted")}><button className="rounded-lg bg-emerald-600 px-4 py-2 font-black text-white">Accept</button></form><form action={reviewProjectApplication.bind(null, id, "rejected")}><button className="rounded-lg bg-red-50 px-4 py-2 font-black text-red-700">Reject</button></form></div>}
        {!isOwner && !isAdmin && ["submitted", "under_review", "shortlisted"].includes(application.status) && <form action={withdrawProjectApplication.bind(null, id)} className="mt-6 border-t border-slate-200 pt-5"><button className="rounded-lg bg-red-50 px-4 py-2 font-black text-red-700">Withdraw application</button></form>}
      </article>
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-[#0b1f3a]">Status timeline</h2><ol className="mt-5 space-y-4">{application.events.map((event) => <li key={event.id} className="border-l-2 border-amber-400 pl-4"><p className="font-black capitalize text-slate-800">{event.status.replace("_", " ")}</p><p className="text-sm text-slate-500">{event.note}</p><time className="text-xs text-slate-400">{event.createdAt.toLocaleString("en-GB")}</time></li>)}</ol></section>
    </>
  );
  if (isAdmin) {
    return <main className="bg-slate-50 px-4 py-10 sm:px-6"><div className="mx-auto max-w-5xl">{content}</div></main>;
  }
  return <AccountDashboardShell user={user}>{content}</AccountDashboardShell>;
}
