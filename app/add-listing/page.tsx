import type { Metadata } from "next";
import { ListingTypeSelector } from "@/components/listings/ListingTypeSelector";
import {
  cities,
  constructionMaterialTypes,
  contractorTypes,
  countries,
  equipmentTypes,
  industrialMaterialTypes,
  projectTenderTypes,
} from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Add Listing | GulfBuildHub",
  description: "Choose the type of listing you want to publish on GulfBuildHub.",
};

export default function AddListingPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f4f7fb] px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <ListingTypeSelector
          contractorTypes={contractorTypes}
          projectTenderTypes={projectTenderTypes}
          countries={countries}
          equipmentTypes={equipmentTypes}
          constructionMaterialTypes={constructionMaterialTypes}
          industrialMaterialTypes={industrialMaterialTypes}
          cities={cities}
        />
      </div>
    </main>
  );
}
