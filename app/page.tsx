import {
  FeaturedBusinessOpportunities,
  FeaturedContractors,
  FeaturedEquipment,
  FeaturedMaterials,
  FeaturedRfqs,
  LatestProjects,
} from "@/components/home/HomeListingSections";
import {
  FeaturedSuppliers,
  SuccessStories,
  Testimonials,
} from "@/components/home/HomeTrustSections";
import { GccCountries } from "@/components/home/GccCountries";
import { GccMarketplaceOpportunities } from "@/components/home/GccMarketplaceOpportunities";
import { HomeHero } from "@/components/home/HomeHero";
import { WhyChooseGulfBuildHub } from "@/components/home/WhyChooseGulfBuildHub";
import { getAllBusinessOpportunities } from "@/services/business-opportunity-service";
import { getAllContractors } from "@/services/contractor-service";
import { getAllEquipment } from "@/services/equipment-service";
import { getAllMaterials } from "@/services/material-service";
import { getAllProjectTenders } from "@/services/project-tender-service";
import { getRfqs } from "@/app/rfqs/data";

export default async function HomePage() {
  const [contractors, projects, equipment, materials, opportunities, rfqs] = await Promise.all([
    getAllContractors(),
    getAllProjectTenders(),
    getAllEquipment(),
    getAllMaterials(),
    getAllBusinessOpportunities(),
    getRfqs(),
  ]);

  return (
    <main className="w-full">
      <HomeHero />
      <GccCountries />
      {/* <section id="categories" className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Browse Categories</p>
            <h2 className="text-3xl font-bold text-slate-900">Explore marketplace categories</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const href =
              category.slug === "contractors"
                ? "/contractors"
                : category.slug === "projects-tenders"
                  ? "/projects-tenders"
                  : category.slug === "equipment-marketplace"
                    ? "/equipment-marketplace"
                    : category.slug === "construction-materials"
                      ? "/construction-materials"
                      : category.slug === "business-opportunities"
                        ? "/business-opportunities"
                  : "/";

            return (
              <Link
                key={category.slug}
                href={href}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
              <div className="mb-3 text-3xl">{category.icon}</div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-slate-900">{category.name}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {category.listingCount.toLocaleString()} Listings
                </span>
              </div>
                <p className="mt-3 text-sm text-slate-600">{category.description}</p>
              </Link>
            );
          })}
        </div>
      </section> */}
      <FeaturedContractors listings={contractors} />
      <LatestProjects listings={projects} />
      <FeaturedEquipment listings={equipment} />
      <FeaturedMaterials listings={materials} />
      <FeaturedBusinessOpportunities listings={opportunities} />
      <FeaturedRfqs listings={rfqs} />
      <FeaturedSuppliers materials={materials} />
      <SuccessStories />
      <Testimonials />
      <WhyChooseGulfBuildHub />
      <GccMarketplaceOpportunities />
    </main>
  );
}
