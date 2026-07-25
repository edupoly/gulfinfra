import { notFound } from "next/navigation";
import { ProjectTenderDetail } from "@/components/projects/ProjectTenderDetail";
import { getProjectTenderBySlug } from "@/services/project-tender-service";

export default async function ProjectTenderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectTenderBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProjectTenderDetail project={project} />
    </main>
  );
}
