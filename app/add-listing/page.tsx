import type { Metadata } from "next";
import { ListingTypeSelector } from "@/components/listings/ListingTypeSelector";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getLocations } from "@/services/location-service";
import { getMarketplaceTaxonomy } from "@/services/taxonomy-service";

export const metadata: Metadata = {
  title: "Add Listing | GulfBuildHub",
  description: "Choose the type of listing you want to publish on GulfBuildHub.",
};

export default async function AddListingPage() {
  const user = await getCurrentUser();
  const [{ countries, cities }, taxonomy] = await Promise.all([getLocations(), getMarketplaceTaxonomy()]);
  if (user?.blockedAt) {
    return (
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center bg-[#f4f7fb] px-4 py-12">
        <div className="max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-wider text-red-700">Account blocked</p>
          <h1 className="mt-3 text-3xl font-black text-[#0b1f3a]">Listing activity is unavailable</h1>
          <p className="mt-3 text-slate-600">
            An administrator has blocked your account. You cannot add or publish listings.
            {user.blockedReason ? ` Reason: ${user.blockedReason}` : ""}
          </p>
          <Link href="/contact" className="mt-6 inline-block rounded-xl bg-[#0b1f3a] px-5 py-3 font-black text-white">
            Contact support
          </Link>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f4f7fb] px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <ListingTypeSelector
          contractorTypes={taxonomy.contractorTypes}
          projectTenderTypes={taxonomy.projectTenderTypes}
          countries={countries}
          equipmentTypes={taxonomy.equipmentTypes}
          constructionMaterialTypes={taxonomy.constructionMaterialTypes}
          industrialMaterialTypes={taxonomy.industrialMaterialTypes}
          businessCategories={taxonomy.businessCategories}
          cities={cities}
        />
      </div>
    </main>
  );
}
