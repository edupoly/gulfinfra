import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const quotation = await prisma.vendorQuotation.findFirst({
    where: { id, status: "awarded", OR: [{ supplierId: user.id }, { rfq: { buyerId: user.id } }] },
    include: { rfq: { include: { buyer: { select: { fullName: true, company: true, email: true } } } }, supplier: { select: { fullName: true, company: true, email: true } } },
  });
  if (!quotation) return new Response("Award letter not found", { status: 404 });
  const buyer = quotation.rfq.buyer?.company ?? quotation.rfq.buyer?.fullName ?? quotation.rfq.buyer?.email ?? "Buyer";
  const supplier = quotation.companyName ?? quotation.supplier?.company ?? quotation.supplier?.fullName ?? quotation.vendorName;
  const content = [
    "GULFINFRAHUB - AWARD LETTER",
    "",
    `Date: ${(quotation.rfq.awardedAt ?? quotation.updatedAt).toLocaleDateString("en-GB")}`,
    `RFQ: ${quotation.rfq.reference}`,
    `Project: ${quotation.rfq.projectName}`,
    `Requirement: ${quotation.rfq.title}`,
    "",
    `Buyer: ${buyer}`,
    `Awarded supplier: ${supplier}`,
    `Awarded amount: ${quotation.offerAmount}`,
    `Delivery time: ${quotation.deliveryLeadtime}`,
    `Warranty: ${quotation.warranty ?? "As agreed"}`,
    `Payment terms: ${quotation.paymentTerms ?? "As agreed"}`,
    "",
    "This letter records the buyer's award decision on GulfInfraHub. The parties should execute their final commercial agreement separately.",
  ].join("\n");
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${quotation.rfq.reference}-award-letter.txt"`,
    },
  });
}
