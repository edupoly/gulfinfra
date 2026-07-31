import { notFound } from "next/navigation";
import { EquipmentDetail } from "@/components/equipment/EquipmentDetail";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import { getCurrentUser } from "@/lib/auth";
import { isListingSaved } from "@/lib/saved-listings";
import { getEquipmentBySlug } from "@/services/equipment-service";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const equipment = await getEquipmentBySlug(slug);

  if (!equipment) {
    notFound();
  }
  const user = await getCurrentUser();
  const saved = await isListingSaved(user?.id, "equipment", slug);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <EquipmentDetail equipment={equipment} saveControl={<SaveListingButton listingType="equipment" listingSlug={slug} initialSaved={saved} />} />
    </main>
  );
}
