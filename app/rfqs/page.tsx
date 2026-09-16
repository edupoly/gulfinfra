import type { Metadata } from "next";
import { RfqWorkspace, type RfqRecord } from "@/components/rfqs/RfqWorkspace";
import { getCurrentUser } from "@/lib/auth";
import { getRfqs } from "./data";
import { prisma } from "@/lib/prisma";
import { RfqLanding } from "@/components/rfqs/RfqLanding";
import { getLocations } from "@/services/location-service";

export const metadata: Metadata = {
  title: "RFQs | GulfBuildHub",
  description:
    "Create, manage and review construction procurement requests for quotation.",
};

export const dynamic = "force-dynamic";

export default async function RfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string; rfq?: string; edit?: string; view?: string }>;
}) {
  const [rfqs, user, locations, rfqCategories] = await Promise.all([
    getRfqs(),
    getCurrentUser(),
    getLocations(),
    prisma.rfqCategoryOption.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);
  const { create, rfq, edit, view } = await searchParams;
  const showWorkspace = view === "buyers" || create === "1" || Boolean(rfq) || Boolean(edit);

  if (!showWorkspace) {
    const supplierRows = user ? await prisma.vendorQuotation.findMany({
      where: { supplierId: user.id },
      include: { rfq: { select: { reference: true, title: true } } },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }) : [];
    return <RfqLanding
      signedIn={Boolean(user)}
      buyerQuotations={rfqs.slice(0, 3).map((item) => ({
        id: item.id, reference: item.reference, title: item.title, projectName: item.projectName,
        category: item.category, country: item.country, city: item.city, quantity: item.quantity,
        budget: item.budget, expirationDate: item.expirationDate.toISOString(), quotationCount: item._count.quotations,
      }))}
      supplierQuotations={supplierRows.map((item) => ({
        id: item.id, reference: item.rfq.reference, title: item.rfq.title,
        offerAmount: item.offerAmount, status: item.status,
        submittedAt: item.submittedAt?.toISOString() ?? null,
      }))}
    />;
  }
  const editRfq = edit && user
    ? await prisma.rfq.findFirst({ where: { id: edit, buyerId: user.id }, include: { quotations: { select: { id: true } }, _count: { select: { quotations: true } } } })
    : null;
  const records = editRfq && !rfqs.some((item) => item.id === editRfq.id) ? [...rfqs, editRfq] : rfqs;
  const serialized: RfqRecord[] = records.map(({ quotations, _count, ...rfq }) => {
    void quotations;
    return {
      ...rfq,
      deliveryDate: rfq.deliveryDate?.toISOString() ?? null,
      expirationDate: rfq.expirationDate.toISOString(),
      postedAt: rfq.postedAt.toISOString(),
      quotationCount: _count.quotations,
    };
  });

  return (
    <RfqWorkspace
      rfqs={serialized}
      signedInEmail={user?.email ?? null}
      initialCreate={create === "1"}
      initialRfqId={rfq ?? null}
      initialEditRfqId={editRfq?.id ?? null}
      locations={locations}
      categories={rfqCategories.map((item) => item.name)}
    />
  );
}
