import { MaterialBrowser } from "@/components/materials/MaterialBrowser";
import { DirectoryHero } from "@/components/directory/DirectoryHero";
import { getAllMaterials, getMaterialFilters } from "@/services/material-service";

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const query = await searchParams;
  const [materials, filters] = await Promise.all([getAllMaterials(), getMaterialFilters()]);
  return <main className="w-full pb-10">
    <DirectoryHero category="materials" title="Construction & Industrial Materials" description="Source construction and industrial materials from verified suppliers and buyers across GCC countries." searchPlaceholder="e.g. Cement, Steel, Pipes, HVAC" countries={filters.countries} cities={filters.cities} ctaLabel="Post Material Listing" />
    <div className="mx-auto max-w-[1440px] px-6"><MaterialBrowser initialSearch={query.search ?? ""} materials={materials} constructionTypes={filters.constructionMaterialTypes} industrialTypes={filters.industrialMaterialTypes} countries={filters.countries} /></div>
  </main>;
}
