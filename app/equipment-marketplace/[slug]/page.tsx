import { notFound } from "next/navigation";
import { EquipmentDetail } from "@/components/equipment/EquipmentDetail";
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

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <EquipmentDetail equipment={equipment} />
    </main>
  );
}
