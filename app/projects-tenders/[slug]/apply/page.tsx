import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProjectApplicationForm } from "@/components/projects/ProjectApplicationForm";

export const dynamic = "force-dynamic";

export default async function ApplyToProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { slug } = await params;
  const project = await prisma.projectTender.findFirst({
    where: { slug, listingStatus: "published" },
    select: { id: true, slug: true, title: true, client: true, ownerId: true },
  });
  if (!project) notFound();
  if (project.ownerId === user.id) redirect("/my-project-applications");
  const existing = await prisma.projectApplication.findUnique({
    where: { projectTenderId_applicantId: { projectTenderId: project.id, applicantId: user.id } },
  });
  if (existing && existing.status !== "submitted") redirect(`/my-applications/${existing.id}`);

  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href={`/projects-tenders/${slug}`} className="font-bold text-blue-700">← Back to project</Link>
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-sm font-black uppercase tracking-wider text-amber-700">Project application</p>
          <h1 className="mt-2 text-3xl font-black text-[#0b1f3a]">{project.title}</h1>
          <p className="mt-2 text-slate-500">{project.client}</p>
          <div className="mt-7 border-t border-slate-200 pt-7">
            <ProjectApplicationForm
              projectSlug={slug}
              email={user.email}
              defaults={existing}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
