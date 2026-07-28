import type { Metadata } from "next";
import { RfqWorkspace, type RfqRecord } from "@/components/rfqs/RfqWorkspace";
import { getRfqs } from "./data";

export const metadata: Metadata = {
  title: "RFQs | GulfInfraHub",
  description:
    "Create, manage and review construction procurement requests for quotation.",
};

export const dynamic = "force-dynamic";

export default async function RfqsPage() {
  const rfqs = await getRfqs();
  const serialized: RfqRecord[] = rfqs.map((rfq) => ({
    ...rfq,
    deliveryDate: rfq.deliveryDate?.toISOString() ?? null,
    expirationDate: rfq.expirationDate.toISOString(),
    postedAt: rfq.postedAt.toISOString(),
    quotations: rfq.quotations.map((quotation) => ({
      id: quotation.id,
      vendorName: quotation.vendorName,
      offerAmount: quotation.offerAmount,
      deliveryLeadtime: quotation.deliveryLeadtime,
      technicalSpecification: quotation.technicalSpecification,
      vendorNotes: quotation.vendorNotes,
      pdfUrl: quotation.pdfUrl,
      status: quotation.status,
    })),
  }));

  return <RfqWorkspace rfqs={serialized} />;
}
