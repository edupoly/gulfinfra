import { ContractorBrowser } from "@/components/contractors/ContractorBrowser";
import { DirectoryHero } from "@/components/directory/DirectoryHero";
import { getAllContractors, getContractorFilters } from "@/services/contractor-service";

export default async function ContractorsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const query = await searchParams;
  const [contractors, filters] = await Promise.all([
    getAllContractors(),
    getContractorFilters(),
  ]);

  return (
    <main className="w-full pb-10">
      <DirectoryHero category="contractors" title="Contractors" description="Find reliable contractors for your construction and infrastructure projects across GCC countries." searchPlaceholder="e.g. Civil Contractor, MEP Contractor" countries={filters.countries} cities={filters.cities} ctaLabel="Add Contractor Listing" />
      <div className="mx-auto max-w-[1440px] px-6">
      <ContractorBrowser
        initialSearch={query.search ?? ""}
        contractorTypes={filters.contractorTypes}
        countries={filters.countries}
        cities={filters.cities}
        initialContractors={contractors}
      />
      </div>
    </main>
  );
}
