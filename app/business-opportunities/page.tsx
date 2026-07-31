import { BusinessOpportunityBrowser } from "@/components/business/BusinessOpportunityBrowser";
import { DirectoryHero } from "@/components/directory/DirectoryHero";
import { cities, countries } from "@/lib/mock-data";
import { getAllBusinessOpportunities } from "@/services/business-opportunity-service";
import { getCurrentUser } from "@/lib/auth";
import { getSavedListingSlugs } from "@/lib/saved-listings";

export default async function BusinessOpportunitiesPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const [businessOpportunities, savedSlugs] = await Promise.all([
    getAllBusinessOpportunities(),
    getSavedListingSlugs(user?.id, "business"),
  ]);
  return <main className="w-full pb-10">
    <DirectoryHero category="business" title="Business Opportunities" description="Discover businesses for sale, wanted acquisitions, franchise setups, joint ventures, and equity investments across GCC commercial centers." searchPlaceholder="e.g. Restaurant, Workshop, Factory" countries={countries} cities={cities} ctaLabel="Post Business Opportunity" />
    <div className="mx-auto max-w-[1440px] px-6"><BusinessOpportunityBrowser initialSearch={query.search ?? ""} opportunities={businessOpportunities} savedSlugs={savedSlugs} /></div>
  </main>;
}
