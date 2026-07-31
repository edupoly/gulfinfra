import type { Metadata } from "next";
import { RfqWorkspace, type RfqRecord } from "@/components/rfqs/RfqWorkspace";
import { getCurrentUser } from "@/lib/auth";
import { getRfqs } from "./data";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "RFQs | GulfInfraHub",
  description:
    "Create, manage and review construction procurement requests for quotation.",
};

export const dynamic = "force-dynamic";

export default async function RfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string; rfq?: string; edit?: string }>;
}) {
  const [rfqs, user] = await Promise.all([getRfqs(), getCurrentUser()]);
  const { create, rfq, edit } = await searchParams;
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
    />
  );
}
