"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BLOCKED_ACTIVITY_MESSAGE, getCurrentUser, normalizeEmail } from "@/lib/auth";

export type RfqActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  rfq?: { id: string; reference: string; status: string };
};

const text = (data: FormData, name: string) =>
  String(data.get(name) ?? "").trim();

export async function saveRfq(
  _state: RfqActionState,
  data: FormData,
): Promise<RfqActionState> {
  const id = text(data, "id");
  const values = {
    projectName: text(data, "projectName"),
    materialService: text(data, "materialService"),
    category: text(data, "category"),
    country: text(data, "country"),
    city: text(data, "city"),
    address: text(data, "address"),
    quantity: text(data, "quantity"),
    unit: text(data, "unit"),
    specifications: text(data, "specifications"),
    notes: text(data, "notes"),
    budget: text(data, "budget"),
    deliveryDate: text(data, "deliveryDate"),
    expirationDate: text(data, "expirationDate"),
    phone: text(data, "phone"),
    email: text(data, "email"),
    boqUrl: text(data, "boqUrl"),
    drawingsUrl: text(data, "drawingsUrl"),
    specificationDocumentUrl: text(data, "specificationDocumentUrl"),
    otherDocumentUrls: text(data, "otherDocumentUrls")
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean),
    status: text(data, "intent") === "draft" ? "draft" : "pending",
  };
  const errors: Record<string, string> = {};

  if (!values.projectName) errors.projectName = "Enter the associated project.";
  if (!values.materialService)
    errors.materialService = "Enter the material or service required.";
  if (!values.category) errors.category = "Select an RFQ category.";
  if (!values.country) errors.country = "Select a GCC country.";
  if (!values.city) errors.city = "Enter a city.";
  if (!values.quantity) errors.quantity = "Enter the required quantity.";
  if (!values.unit) errors.unit = "Select or enter a unit.";
  if (values.specifications.length < 20)
    errors.specifications = "Provide at least 20 characters of specification detail.";
  if (!values.deliveryDate) errors.deliveryDate = "Select a delivery date.";
  if (!values.expirationDate) errors.expirationDate = "Select an expiration date.";
  if (!values.phone) errors.phone = "Enter a corporate phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Enter a valid email address.";

  const deliveryDate = new Date(values.deliveryDate);
  const expirationDate = new Date(values.expirationDate);
  if (Number.isNaN(deliveryDate.getTime()))
    errors.deliveryDate = "Select a valid delivery date.";
  if (Number.isNaN(expirationDate.getTime()))
    errors.expirationDate = "Select a valid expiration date.";
  if (
    !Number.isNaN(deliveryDate.getTime()) &&
    !Number.isNaN(expirationDate.getTime()) &&
    deliveryDate <= expirationDate
  ) {
    errors.deliveryDate = "Delivery must be scheduled after the RFQ closing date.";
  }

  if (Object.keys(errors).length) {
    return { success: false, message: "Please correct the highlighted fields.", errors };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "Sign in before creating or editing an RFQ." };
  }
  if (currentUser?.blockedAt) {
    return { success: false, message: BLOCKED_ACTIVITY_MESSAGE };
  }
  if (
    !id &&
    (!currentUser?.emailVerifiedAt ||
      normalizeEmail(currentUser.email) !== normalizeEmail(values.email))
  ) {
    return {
      success: false,
      message: "Verify the RFQ email with a one-time code before creating it.",
      errors: { email: "This email has not been verified for this RFQ." },
    };
  }

  const dataToSave = {
    title: values.materialService,
    projectName: values.projectName,
    materialService: values.materialService,
    category: values.category,
    country: values.country,
    city: values.city,
    address: values.address || null,
    quantity: values.quantity,
    unit: values.unit,
    specifications: values.specifications,
    notes: values.notes || null,
    budget: values.budget || null,
    urgency: "Medium Urgency",
    deliveryDate,
    expirationDate,
    deliveryTerms: "Not applicable",
    description: values.specifications,
    phone: values.phone,
    email: values.email,
    boqUrl: values.boqUrl || null,
    drawingsUrl: values.drawingsUrl || null,
    specificationDocumentUrl: values.specificationDocumentUrl || null,
    otherDocumentUrls: values.otherDocumentUrls,
    status: values.status,
  };

  try {
    let saved: { id: string; reference: string; status: string };
    if (id) {
      const owned = await prisma.rfq.findFirst({
        where: { id, buyerId: currentUser.id },
        select: { id: true, status: true },
      });
      if (!owned) return { success: false, message: "You cannot edit this RFQ." };
      if (owned.status === "awarded" || owned.status === "cancelled") {
        return { success: false, message: "Awarded or cancelled RFQs cannot be edited." };
      }
      saved = await prisma.rfq.update({ where: { id }, data: dataToSave, select: { id: true, reference: true, status: true } });
    } else {
      saved = await prisma.$transaction(async (tx) => {
        const authorization = await tx.emailOtp.findFirst({
          where: {
            userId: currentUser.id,
            purpose: "rfq_create",
            consumedAt: { not: null },
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { consumedAt: "desc" },
        });
        if (!authorization) throw new Error("RFQ_OTP_REQUIRED");

        const claimed = await tx.emailOtp.updateMany({
          where: { id: authorization.id, usedAt: null },
          data: { usedAt: new Date() },
        });
        if (claimed.count !== 1) throw new Error("RFQ_OTP_REQUIRED");

        const year = new Date().getUTCFullYear();
        const sequence = await tx.rfqSequence.upsert({
          where: { year },
          create: { year, value: 1 },
          update: { value: { increment: 1 } },
          select: { value: true },
        });
        return tx.rfq.create({
          data: {
            ...dataToSave,
            reference: `RFQ-${year}-${String(sequence.value).padStart(5, "0")}`,
            buyerId: currentUser.id,
          },
          select: { id: true, reference: true, status: true },
        });
      });
    }
    revalidatePath("/rfqs");
    revalidatePath("/my-rfqs");
    return {
      success: true,
      message: id ? "RFQ updated successfully." : "RFQ created successfully.",
      rfq: saved,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "RFQ_OTP_REQUIRED") {
      return {
        success: false,
        message: "Your RFQ verification expired or was already used. Request a new code.",
      };
    }
    console.error("Unable to save RFQ", error);
    return { success: false, message: "The RFQ could not be saved. Please try again." };
  }
}

export async function setRfqStatus(id: string, status: "published" | "closed") {
  const user = await getCurrentUser();
  if (!user || user.blockedAt) return;
  await prisma.rfq.updateMany({
    where: { id, buyerId: user.id, status: { notIn: ["awarded", "cancelled"] } },
    data: { status: status === "published" ? "pending" : status },
  });
  revalidatePath("/rfqs");
  revalidatePath("/my-rfqs");
}

export async function setQuotationStatus(
  id: string,
  status: "accepted" | "declined",
) {
  const user = await getCurrentUser();
  if (!user || user.blockedAt) return;
  const quotation = await prisma.vendorQuotation.findFirst({
    where: { id, rfq: { buyerId: user.id } },
    select: { id: true, rfqId: true },
  });
  if (!quotation) return;
  const nextStatus = status === "accepted" ? "awarded" : "rejected";
  await prisma.vendorQuotation.update({ where: { id }, data: { status: nextStatus } });
  if (status === "accepted") {
    await prisma.vendorQuotation.updateMany({
      where: { rfqId: quotation.rfqId, id: { not: id }, status: { in: ["submitted", "under_review", "shortlisted"] } },
      data: { status: "rejected" },
    });
    await prisma.rfq.update({ where: { id: quotation.rfqId }, data: { status: "awarded", awardedAt: new Date() } });
  }
  revalidatePath("/rfqs");
  revalidatePath("/my-rfqs");
  revalidatePath("/my-quotations");
}
