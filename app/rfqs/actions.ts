"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type RfqActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
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
    status: text(data, "intent") === "draft" ? "draft" : "published",
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
  if (!values.address) errors.address = "Enter the delivery address.";
  if (!values.deliveryDate) errors.deliveryDate = "Select a delivery date.";
  if (!values.expirationDate) errors.expirationDate = "Select an expiration date.";
  if (!values.phone) errors.phone = "Enter a corporate phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Enter a valid email address.";

  const deliveryDate = new Date(`${values.deliveryDate}T12:00:00.000Z`);
  const expirationDate = new Date(`${values.expirationDate}T12:00:00.000Z`);
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
    deliveryTerms: values.address,
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
    if (id) {
      await prisma.rfq.update({ where: { id }, data: dataToSave });
    } else {
      const sequence = (await prisma.rfq.count()) + 1;
      await prisma.rfq.create({
        data: {
          ...dataToSave,
          reference: `RFQ-${String(sequence).padStart(4, "0")}`,
        },
      });
    }
    revalidatePath("/rfqs");
    return {
      success: true,
      message: id ? "RFQ updated successfully." : "RFQ created successfully.",
    };
  } catch (error) {
    console.error("Unable to save RFQ", error);
    return { success: false, message: "The RFQ could not be saved. Please try again." };
  }
}

export async function setRfqStatus(id: string, status: "published" | "closed") {
  await prisma.rfq.update({ where: { id }, data: { status } });
  revalidatePath("/rfqs");
}

export async function setQuotationStatus(
  id: string,
  status: "accepted" | "declined",
) {
  const quotation = await prisma.vendorQuotation.update({
    where: { id },
    data: { status },
    select: { rfqId: true },
  });
  if (status === "accepted") {
    await prisma.vendorQuotation.updateMany({
      where: { rfqId: quotation.rfqId, id: { not: id }, status: "pending" },
      data: { status: "declined" },
    });
  }
  revalidatePath("/rfqs");
}
