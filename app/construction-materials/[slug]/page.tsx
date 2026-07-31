import { notFound } from "next/navigation";
import { MaterialDetail } from "@/components/materials/MaterialDetail";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import { getCurrentUser } from "@/lib/auth";
import { isListingSaved } from "@/lib/saved-listings";
import { getMaterialBySlug } from "@/services/material-service";

export default async function MaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const material = await getMaterialBySlug(slug);
  if (!material) notFound();
  const user = await getCurrentUser();
  const saved = await isListingSaved(user?.id, "material", slug);
  return <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><MaterialDetail material={material} saveControl={<SaveListingButton listingType="material" listingSlug={slug} initialSaved={saved} />} /></main>;
}
