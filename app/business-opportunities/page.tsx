import { BusinessOpportunityBrowser } from "@/components/business/BusinessOpportunityBrowser";
import { DirectoryHero } from "@/components/directory/DirectoryHero";
import { getAllBusinessOpportunities } from "@/services/business-opportunity-service";
import { getLocations } from "@/services/location-service";
import { getMarketplaceTaxonomy } from "@/services/taxonomy-service";
import { getCurrentUser } from "@/lib/auth";
import { getSavedListingSlugs } from "@/lib/saved-listings";

export default async function BusinessOpportunitiesPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const [businessOpportunities, savedSlugs, locations, taxonomy] = await Promise.all([
    getAllBusinessOpportunities(),
    getSavedListingSlugs(user?.id, "business"),
    getLocations(),
    getMarketplaceTaxonomy(),
  ]);
  return <main className="w-full pb-10">
    <DirectoryHero category="business" title="Business Opportunities" description="Discover businesses for sale, wanted acquisitions, franchise setups, joint ventures, and equity investments across GCC commercial centers." searchPlaceholder="e.g. Restaurant, Workshop, Factory" countries={locations.countries} cities={locations.cities} ctaLabel="Post Business Opportunity" />
    <div className="mx-auto max-w-[1440px] px-6"><BusinessOpportunityBrowser initialSearch={query.search ?? ""} opportunities={businessOpportunities} categories={taxonomy.businessCategories.map((item) => item.name)} savedSlugs={savedSlugs} /></div>
  </main>;
}
