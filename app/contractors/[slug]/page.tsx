import { notFound } from "next/navigation";
import { ContractorDetail } from "@/components/contractors/ContractorDetail";
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

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ContractorDetail contractor={contractor} />
    </main>
  );
}
