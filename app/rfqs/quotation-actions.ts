"use server";

import { revalidatePath } from "next/cache";
import { BLOCKED_ACTIVITY_MESSAGE, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type QuotationActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

const text = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const activeStatuses = ["submitted", "under_review", "shortlisted"] as const;

function refreshRfq(rfqId: string, quotationId?: string) {
  revalidatePath("/rfqs");
  revalidatePath(`/rfqs/${rfqId}`);
  revalidatePath("/my-rfqs");
  revalidatePath("/my-quotations");
  if (quotationId) revalidatePath(`/my-quotations/${quotationId}`);
}

export async function saveQuotation(
  _state: QuotationActionState,
  data: FormData,
): Promise<QuotationActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Sign in to submit a quotation." };
  if (user.blockedAt) return { success: false, message: BLOCKED_ACTIVITY_MESSAGE };

  const id = text(data, "id");
  const rfqId = text(data, "rfqId");
  const intent = text(data, "intent");
  const values = {
    companyName: text(data, "companyName"),
    contactPerson: text(data, "contactPerson"),
    contactEmail: text(data, "contactEmail"),
    contactPhone: text(data, "contactPhone"),
    unitPrice: text(data, "unitPrice"),
    totalPrice: text(data, "totalPrice"),
    currency: text(data, "currency"),
    deliveryLeadtime: text(data, "deliveryLeadtime"),
    warranty: text(data, "warranty"),
    paymentTerms: text(data, "paymentTerms"),
    technicalSpecification: text(data, "technicalSpecification"),
    vendorNotes: text(data, "vendorNotes"),
    pdfUrl: text(data, "pdfUrl"),
    validUntil: text(data, "validUntil"),
  };
  const errors: Record<string, string> = {};
  if (!values.companyName) errors.companyName = "Enter your company name.";
  if (!values.contactPerson) errors.contactPerson = "Enter the contact person.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) errors.contactEmail = "Enter a valid email.";
  if (!values.contactPhone) errors.contactPhone = "Enter a contact phone.";
  if (!values.unitPrice) errors.unitPrice = "Enter the unit price.";
  if (!values.totalPrice) errors.totalPrice = "Enter the total price.";
  if (!values.currency) errors.currency = "Select a currency.";
  if (!values.deliveryLeadtime) errors.deliveryLeadtime = "Enter the delivery time.";
  if (!values.warranty) errors.warranty = "Enter the warranty.";
  if (!values.paymentTerms) errors.paymentTerms = "Enter payment terms.";
  if (values.technicalSpecification.length < 20) errors.technicalSpecification = "Provide at least 20 characters.";
  if (intent !== "draft" && !values.validUntil) errors.validUntil = "Select how long the offer remains valid.";
  if (Object.keys(errors).length) return { success: false, message: "Correct the highlighted fields.", errors };

  const rfq = await prisma.rfq.findUnique({
    where: { id: rfqId },
    select: { id: true, buyerId: true, status: true, expirationDate: true },
  });
  if (!rfq || rfq.status !== "published" || rfq.expirationDate <= new Date()) {
    return { success: false, message: "This RFQ is not accepting quotations." };
  }
  if (rfq.buyerId === user.id) return { success: false, message: "You cannot quote on your own RFQ." };

  const existing = id
    ? await prisma.vendorQuotation.findFirst({ where: { id, supplierId: user.id, rfqId } })
    : await prisma.vendorQuotation.findFirst({ where: { rfqId, supplierId: user.id } });
  if (existing && !["draft", "submitted"].includes(existing.status)) {
    return { success: false, message: "This quotation can no longer be edited." };
  }

  const status = intent === "draft" ? "draft" : "submitted";
  const payload = {
    vendorName: values.companyName,
    offerAmount: `${values.currency} ${values.totalPrice}`,
    deliveryLeadtime: values.deliveryLeadtime,
    technicalSpecification: values.technicalSpecification,
    vendorNotes: values.vendorNotes || null,
    pdfUrl: values.pdfUrl || null,
    status,
    supplierId: user.id,
    companyName: values.companyName,
    contactPerson: values.contactPerson,
    contactEmail: values.contactEmail,
    contactPhone: values.contactPhone,
    unitPrice: values.unitPrice,
    totalPrice: values.totalPrice,
    currency: values.currency,
    warranty: values.warranty,
    paymentTerms: values.paymentTerms,
    validUntil: values.validUntil ? new Date(`${values.validUntil}T12:00:00.000Z`) : null,
    submittedAt: status === "submitted" ? new Date() : existing?.submittedAt,
    withdrawnAt: null,
  };

  const quotation = existing
    ? await prisma.vendorQuotation.update({ where: { id: existing.id }, data: payload })
    : await prisma.vendorQuotation.create({ data: { ...payload, rfqId } });
  await prisma.quotationEvent.create({
    data: { quotationId: quotation.id, actorId: user.id, status, note: status === "draft" ? "Quotation saved as draft." : "Quotation submitted to buyer." },
  });
  refreshRfq(rfqId, quotation.id);
  return { success: true, message: status === "draft" ? "Quotation draft saved." : "Quotation submitted." };
}

export async function withdrawQuotation(id: string) {
  const user = await getCurrentUser();
  if (!user || user.blockedAt) return;
  const quotation = await prisma.vendorQuotation.findFirst({
    where: { id, supplierId: user.id, status: { in: [...activeStatuses] } },
    select: { id: true, rfqId: true },
  });
  if (!quotation) return;
  await prisma.$transaction([
    prisma.vendorQuotation.update({ where: { id }, data: { status: "withdrawn", withdrawnAt: new Date() } }),
    prisma.quotationEvent.create({ data: { quotationId: id, actorId: user.id, status: "withdrawn", note: "Quotation withdrawn by supplier." } }),
  ]);
  refreshRfq(quotation.rfqId, id);
}

export async function updateQuotationStatus(id: string, status: "under_review" | "shortlisted" | "rejected" | "awarded") {
  const user = await getCurrentUser();
  if (!user || user.blockedAt) return;
  const quotation = await prisma.vendorQuotation.findFirst({
    where: { id, rfq: { buyerId: user.id }, status: { in: [...activeStatuses] } },
    select: { id: true, rfqId: true },
  });
  if (!quotation) return;

  await prisma.$transaction(async (tx) => {
    await tx.vendorQuotation.update({ where: { id }, data: { status } });
    await tx.quotationEvent.create({ data: { quotationId: id, actorId: user.id, status, note: `Buyer marked quotation as ${status.replace("_", " ")}.` } });
    if (status === "awarded") {
      const others = await tx.vendorQuotation.findMany({
        where: { rfqId: quotation.rfqId, id: { not: id }, status: { in: [...activeStatuses] } },
        select: { id: true },
      });
      await tx.vendorQuotation.updateMany({ where: { id: { in: others.map((item) => item.id) } }, data: { status: "rejected" } });
      if (others.length) {
        await tx.quotationEvent.createMany({
          data: others.map((item) => ({ quotationId: item.id, actorId: user.id, status: "rejected", note: "Another supplier was awarded this RFQ." })),
        });
      }
      await tx.rfq.update({ where: { id: quotation.rfqId }, data: { status: "awarded", awardedAt: new Date() } });
    }
  });
  refreshRfq(quotation.rfqId, id);
}

export async function sendQuotationMessage(
  _state: QuotationActionState,
  data: FormData,
): Promise<QuotationActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Sign in to send a message." };
  if (user.blockedAt) return { success: false, message: BLOCKED_ACTIVITY_MESSAGE };
  const quotationId = text(data, "quotationId");
  const body = text(data, "body");
  const attachmentUrl = text(data, "attachmentUrl");
  if (!body && !attachmentUrl) return { success: false, message: "Enter a message or attach a file URL." };
  if (body.length > 3000) return { success: false, message: "Messages are limited to 3,000 characters." };
  const quotation = await prisma.vendorQuotation.findFirst({
    where: {
      id: quotationId,
      OR: [{ supplierId: user.id }, { rfq: { buyerId: user.id } }],
    },
    select: { id: true, rfqId: true },
  });
  if (!quotation) return { success: false, message: "You cannot access this conversation." };
  await prisma.quotationMessage.create({
    data: { quotationId, senderId: user.id, body: body || "Shared a file.", attachmentUrl: attachmentUrl || null },
  });
  refreshRfq(quotation.rfqId, quotationId);
  return { success: true, message: "Message sent." };
}
