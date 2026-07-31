import { EquipmentBrowser } from "@/components/equipment/EquipmentBrowser";
import { DirectoryHero } from "@/components/directory/DirectoryHero";
import {
  getAllEquipment,
  getEquipmentFilters,
} from "@/services/equipment-service";
import { getCurrentUser } from "@/lib/auth";
import { getSavedListingSlugs } from "@/lib/saved-listings";

export default async function EquipmentMarketplacePage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const [equipment, filters, savedSlugs] = await Promise.all([
    getAllEquipment(),
    getEquipmentFilters(),
    getSavedListingSlugs(user?.id, "equipment"),
  ]);

  return (
    <main className="w-full pb-10">
      <DirectoryHero category="equipment" title="Equipment Marketplace" description="Buy, rent, or source heavy equipment across the Gulf from verified equipment owners, dealers, rental companies, and buyers." searchPlaceholder="e.g. Excavator, Crane, Generator" countries={filters.countries} cities={filters.cities} ctaLabel="Post Equipment Listing" />
      <div className="mx-auto max-w-[1440px] px-6">
      <EquipmentBrowser
        initialSearch={query.search ?? ""}
        equipment={equipment}
        equipmentTypes={filters.equipmentTypes}
        countries={filters.countries}
        savedSlugs={savedSlugs}
      />
      </div>
    </main>
  );
}
