"use server";

import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";

export type EquipmentDraftState = { success: boolean; message: string; equipmentId?: string; editToken?: string; errors?: Record<string, string> };
export type EquipmentReviewData = {
  slug: string; title: string; equipmentType: string; listingType: string; condition: string;
  country: string; city: string; brand: string; model: string; year: number;
  operatingHours: number | null; price: string; priceNote: string | null;
  availability: string; location: string; description: string;
  specifications: Array<{ label: string; value: string }>;
  sellerName: string; sellerType: string; phone: string; whatsapp: string | null;
  email: string | null; images: string[];
  documents: Array<{ name: string; documentType: string; documentUrl: string }>;
};
export type EquipmentMediaState = { success: boolean; message: string; review?: EquipmentReviewData; errors?: Record<string, string> };
export type EquipmentPublishState = { success: boolean; message: string; slug?: string };

const text = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const isUrl = (value: string) => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } };
const slugify = (value: string) => `${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "equipment"}-${crypto.randomUUID().slice(0, 8)}`;
const parseSpecifications = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
  const [label, ...rest] = line.split(":");
  return { label: label.trim(), value: rest.join(":").trim() };
}).filter((item) => item.label && item.value);

export async function saveEquipmentDraft(_state: EquipmentDraftState, data: FormData): Promise<EquipmentDraftState> {
  const values = {
    title: text(data, "title"), equipmentType: text(data, "equipmentType"),
    listingType: text(data, "listingType"), condition: text(data, "condition"),
    brand: text(data, "brand"), model: text(data, "model"), year: Number(text(data, "year")),
    operatingHours: text(data, "operatingHours"), price: text(data, "price"),
    priceNote: text(data, "priceNote"), availability: text(data, "availability"),
    country: text(data, "country"), city: text(data, "city"), location: text(data, "location"),
    description: text(data, "description"), specifications: parseSpecifications(text(data, "specifications")),
    sellerName: text(data, "sellerName"), sellerType: text(data, "sellerType"),
    phone: text(data, "phone"), whatsapp: text(data, "whatsapp"),
    email: text(data, "email").toLowerCase(),
  };
  const errors: Record<string, string> = {};
  if (values.title.length < 5 || values.title.length > 160) errors.title = "Enter a title between 5 and 160 characters.";
  if (!values.equipmentType) errors.equipmentType = "Select an equipment type.";
  if (!["For Sale", "For Rent", "Wanted"].includes(values.listingType)) errors.listingType = "Select sale, rent, or wanted.";
  if (!["New", "Excellent", "Good", "Used"].includes(values.condition)) errors.condition = "Select the condition.";
  if (!values.brand) errors.brand = "Enter the brand.";
  if (!values.model) errors.model = "Enter the model.";
  if (!Number.isInteger(values.year) || values.year < 1950 || values.year > new Date().getFullYear() + 1) errors.year = "Enter a valid equipment year.";
  if (!values.price) errors.price = "Enter a price or budget.";
  if (!values.availability) errors.availability = "Enter availability.";
  if (!values.country) errors.country = "Select a country.";
  if (!values.city) errors.city = "Select a city.";
  if (!values.location) errors.location = "Enter the equipment location.";
  if (values.description.length < 80 || values.description.length > 2000) errors.description = "Use between 80 and 2,000 characters.";
  if (!values.specifications.length) errors.specifications = "Add at least one specification using Label: Value.";
  if (!values.sellerName) errors.sellerName = "Enter the seller or buyer name.";
  if (!values.sellerType) errors.sellerType = "Select the account type.";
  if (values.phone.length < 7) errors.phone = "Enter a valid phone number.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email.";
  const hours = values.operatingHours ? Number(values.operatingHours) : null;
  if (hours !== null && (!Number.isInteger(hours) || hours < 0)) errors.operatingHours = "Enter valid operating hours.";
  if (Object.keys(errors).length) return { success: false, message: "Please correct the equipment details.", errors };

  const [category, equipmentType, country, city] = await Promise.all([
    prisma.category.findUnique({ where: { slug: "equipment-marketplace" }, select: { slug: true } }),
    prisma.equipmentType.findUnique({ where: { slug: values.equipmentType }, select: { slug: true } }),
    prisma.country.findUnique({ where: { code: values.country }, select: { code: true } }),
    prisma.city.findFirst({ where: { slug: values.city, countryCode: values.country }, select: { slug: true } }),
  ]);
  if (!category || !equipmentType || !country || !city) return { success: false, message: "One or more selected equipment options are invalid." };

  try {
    const editToken = randomBytes(32).toString("hex");
    const equipment = await prisma.equipment.create({
      data: {
        slug: slugify(values.title), categorySlug: category.slug, listingStatus: "draft",
        draftTokenHash: hash(editToken), title: values.title, equipmentTypeSlug: equipmentType.slug,
        listingType: values.listingType, condition: values.condition, countryCode: country.code,
        citySlug: city.slug, brand: values.brand, model: values.model, year: values.year,
        operatingHours: hours, price: values.price, priceNote: values.priceNote || null,
        availability: values.availability, location: values.location, description: values.description,
        specifications: values.specifications, sellerName: values.sellerName,
        sellerType: values.sellerType, phone: values.phone, whatsapp: values.whatsapp || null,
        email: values.email || null, images: [], posted: "Draft",
      },
      select: { id: true },
    });
    return { success: true, message: "Equipment saved as a private draft.", equipmentId: equipment.id, editToken };
  } catch (error) {
    console.error("Unable to save equipment draft", error);
    return { success: false, message: "We could not save the equipment draft. Please try again." };
  }
}

async function loadReview(id: string): Promise<EquipmentReviewData | null> {
  const row = await prisma.equipment.findUnique({ where: { id }, include: { equipmentType: true, country: true, city: true, documents: true } });
  if (!row) return null;
  const specifications = Array.isArray(row.specifications) ? row.specifications.filter((item): item is { label: string; value: string } => typeof item === "object" && item !== null && "label" in item && "value" in item && typeof item.label === "string" && typeof item.value === "string") : [];
  return {
    slug: row.slug, title: row.title, equipmentType: row.equipmentType.name,
    listingType: row.listingType, condition: row.condition, country: row.country.name,
    city: row.city.name, brand: row.brand, model: row.model, year: row.year,
    operatingHours: row.operatingHours, price: row.price, priceNote: row.priceNote,
    availability: row.availability, location: row.location, description: row.description,
    specifications, sellerName: row.sellerName, sellerType: row.sellerType,
    phone: row.phone, whatsapp: row.whatsapp, email: row.email, images: row.images,
    documents: row.documents.map(({ name, documentType, documentUrl }) => ({ name, documentType, documentUrl })),
  };
}

export async function saveEquipmentMedia(_state: EquipmentMediaState, data: FormData): Promise<EquipmentMediaState> {
  const equipmentId = text(data, "equipmentId"), editToken = text(data, "editToken");
  const images = data.getAll("images").map(String).map((item) => item.trim()).filter(Boolean);
  const names = data.getAll("documentNames").map(String), types = data.getAll("documentTypes").map(String), urls = data.getAll("documentUrls").map(String);
  const documents = urls.map((url, index) => ({ name: names[index]?.trim() ?? "", documentType: types[index]?.trim() || "Other", documentUrl: url.trim() })).filter((item) => item.name || item.documentUrl);
  const errors: Record<string, string> = {};
  if (!images.length || images.length > 8 || images.some((url) => !isUrl(url))) errors.images = "Add between one and eight valid image URLs.";
  if (documents.length > 5 || documents.some((item) => !item.name || !isUrl(item.documentUrl))) errors.documents = "Each document needs a name and valid URL.";
  if (Object.keys(errors).length) return { success: false, message: "Please correct the media details.", errors };
  const draft = await prisma.equipment.findFirst({ where: { id: equipmentId, listingStatus: "draft", draftTokenHash: hash(editToken) }, select: { id: true } });
  if (!draft) return { success: false, message: "This equipment draft could not be verified." };
  try {
    await prisma.$transaction([
      prisma.equipment.update({ where: { id: equipmentId }, data: { images } }),
      prisma.equipmentDocument.deleteMany({ where: { equipmentId } }),
      ...(documents.length ? [prisma.equipmentDocument.createMany({ data: documents.map((item) => ({ equipmentId, ...item })) })] : []),
    ]);
    const review = await loadReview(equipmentId);
    return review ? { success: true, message: "Equipment media saved.", review } : { success: false, message: "The equipment draft could not be loaded." };
  } catch (error) {
    console.error("Unable to save equipment media", error);
    return { success: false, message: "We could not save the equipment media." };
  }
}

export async function publishEquipment(_state: EquipmentPublishState, data: FormData): Promise<EquipmentPublishState> {
  const equipmentId = text(data, "equipmentId"), editToken = text(data, "editToken");
  const draft = await prisma.equipment.findFirst({ where: { id: equipmentId, listingStatus: "draft", draftTokenHash: hash(editToken) }, select: { id: true, slug: true } });
  if (!draft) return { success: false, message: "This equipment draft could not be verified." };
  try {
    await prisma.equipment.update({ where: { id: draft.id }, data: { listingStatus: "published", draftTokenHash: null, posted: new Date().toLocaleDateString("en-GB") } });
    revalidatePath("/equipment-marketplace");
    revalidatePath(`/equipment-marketplace/${draft.slug}`);
    return { success: true, message: "Your equipment listing has been published.", slug: draft.slug };
  } catch (error) {
    console.error("Unable to publish equipment", error);
    return { success: false, message: "We could not publish the equipment. Your draft remains saved." };
  }
}
