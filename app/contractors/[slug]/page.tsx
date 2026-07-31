import { notFound } from "next/navigation";
import { ContractorDetail } from "@/components/contractors/ContractorDetail";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import { getCurrentUser } from "@/lib/auth";
import { isListingSaved } from "@/lib/saved-listings";
import { getContractorBySlug } from "@/services/contractor-service";

export default async function ContractorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const contractor = await getContractorBySlug(slug);

  if (!contractor) {
    notFound();
  }
  const user = await getCurrentUser();
  const saved = await isListingSaved(user?.id, "contractor", slug);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ContractorDetail contractor={contractor} saveControl={<SaveListingButton listingType="contractor" listingSlug={slug} initialSaved={saved} />} />
    </main>
  );
}
