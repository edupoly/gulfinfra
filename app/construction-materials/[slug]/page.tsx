import { notFound } from "next/navigation";
import { MaterialDetail } from "@/components/materials/MaterialDetail";
import { getMaterialBySlug } from "@/services/material-service";

export default async function MaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const material = await getMaterialBySlug(slug);
  if (!material) notFound();
  return <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><MaterialDetail material={material} /></main>;
}
