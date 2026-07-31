import { notFound } from "next/navigation";
import { ProjectTenderDetail } from "@/components/projects/ProjectTenderDetail";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import { getCurrentUser } from "@/lib/auth";
import { isListingSaved } from "@/lib/saved-listings";
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
  const user = await getCurrentUser();
  const saved = await isListingSaved(user?.id, "project", slug);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ProjectTenderDetail project={project} saveControl={<SaveListingButton listingType="project" listingSlug={slug} initialSaved={saved} />} />
    </main>
  );
}
