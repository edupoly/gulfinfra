import { MaterialBrowser } from "@/components/materials/MaterialBrowser";
import { DirectoryHero } from "@/components/directory/DirectoryHero";
import { getAllMaterials, getMaterialFilters } from "@/services/material-service";
import { getCurrentUser } from "@/lib/auth";
import { getSavedListingSlugs } from "@/lib/saved-listings";

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const [materials, filters, savedSlugs] = await Promise.all([
    getAllMaterials(),
    getMaterialFilters(),
    getSavedListingSlugs(user?.id, "material"),
  ]);
  return <main className="w-full pb-10">
    <DirectoryHero category="materials" title="Construction & Industrial Materials" description="Source construction and industrial materials from verified suppliers and buyers across GCC countries." searchPlaceholder="e.g. Cement, Steel, Pipes, HVAC" countries={filters.countries} cities={filters.cities} ctaLabel="Post Material Listing" />
    <div className="mx-auto max-w-[1440px] px-6"><MaterialBrowser initialSearch={query.search ?? ""} materials={materials} constructionTypes={filters.constructionMaterialTypes} industrialTypes={filters.industrialMaterialTypes} countries={filters.countries} savedSlugs={savedSlugs} /></div>
  </main>;
}
