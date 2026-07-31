import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Contact Submissions" };

export default async function AdminContactSubmissionsPage() {
  const submissions = await prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <AdminPageHeader title="Contact submissions" description="Messages submitted through the public contact form." />
        <span className="rounded-full bg-[#0b1f3a] px-4 py-2 text-sm font-black text-white">{submissions.length}</span>
      </div>
      <section className="mt-8 space-y-4">
        {submissions.length ? submissions.map((submission) => (
          <article key={submission.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-[#0b1f3a]">{submission.fullName}</h2>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  <a href={`mailto:${submission.email}`} className="font-bold text-blue-700">{submission.email}</a>
                  <a href={`tel:${submission.phoneOrWhatsapp}`} className="font-bold text-slate-700">{submission.phoneOrWhatsapp}</a>
                </div>
              </div>
              <time className="shrink-0 text-xs font-bold text-slate-500" dateTime={submission.createdAt.toISOString()}>
                {submission.createdAt.toLocaleString("en-GB")}
              </time>
            </div>
            <p className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{submission.message}</p>
          </article>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
            No contact submissions yet.
          </div>
        )}
      </section>
    </>
  );
}
