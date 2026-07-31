import { ProjectTenderBrowser } from "@/components/projects/ProjectTenderBrowser";
import { DirectoryHero } from "@/components/directory/DirectoryHero";
import { getAllProjectTenders, getProjectTenderFilters } from "@/services/project-tender-service";
import { getCurrentUser } from "@/lib/auth";
import { getSavedListingSlugs } from "@/lib/saved-listings";

export default async function ProjectsTendersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const [projectTenders, filters, savedSlugs] = await Promise.all([
    getAllProjectTenders(),
    getProjectTenderFilters(),
    getSavedListingSlugs(user?.id, "project"),
  ]);

  return (
    <main className="w-full pb-10">
      <DirectoryHero category="projects" title="Projects & Tenders" description="Find the latest construction projects and tenders across GCC countries. Connect with project owners, contractors and suppliers." searchPlaceholder="e.g. Building Construction, Villa Project" countries={filters.countries} cities={filters.cities} ctaLabel="Post Your Project" />
      <div className="mx-auto max-w-[1440px] px-6">
      <ProjectTenderBrowser
        initialSearch={query.search ?? ""}
        projectTenderTypes={filters.projectTenderTypes}
        countries={filters.countries}
        cities={filters.cities}
        initialProjectTenders={projectTenders}
        savedSlugs={savedSlugs}
      />
      </div>
    </main>
  );
}
