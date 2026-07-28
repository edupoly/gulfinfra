"use server";

import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

const materialTypes = new Map([
  ["cement-concrete", "Cement & Concrete"], ["structural-steel", "Structural Steel"],
  ["blocks-masonry", "Blocks & Masonry"], ["waterproofing", "Waterproofing"],
  ["finishing-materials", "Finishing Materials"], ["pipes-valves", "Pipes & Valves"],
  ["electrical-supplies", "Electrical Supplies"], ["hvac-components", "HVAC Components"],
  ["industrial-chemicals", "Industrial Chemicals"], ["safety-products", "Safety Products"],
]);
const constructionSlugs = new Set(["cement-concrete", "structural-steel", "blocks-masonry", "waterproofing", "finishing-materials"]);

export type MaterialDraftState = { success: boolean; message: string; materialId?: string; editToken?: string; errors?: Record<string, string> };
export type MaterialReviewData = {
  slug: string; name: string; materialGroup: string; materialType: string; listingType: string;
  country: string; city: string; supplier: string; priceRange: string; minimumOrder: string;
  availability: string; leadTime: string; compliance: string[]; description: string;
  specifications: Array<{ label: string; value: string }>; phone: string;
  whatsapp: string | null; email: string | null; image: string | null; galleryImages: string[];
  documents: Array<{ name: string; documentType: string; documentUrl: string }>;
};
export type MaterialMediaState = { success: boolean; message: string; review?: MaterialReviewData; errors?: Record<string, string> };
export type MaterialPublishState = { success: boolean; message: string; slug?: string };

const text = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const split = (value: string) => [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
const isUrl = (value: string) => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } };
const parseSpecs = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => { const [label, ...rest] = line.split(":"); return { label: label.trim(), value: rest.join(":").trim() }; }).filter((item) => item.label && item.value);
const slugify = (value: string) => `${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "material"}-${crypto.randomUUID().slice(0, 8)}`;

export async function saveMaterialDraft(_state: MaterialDraftState, data: FormData): Promise<MaterialDraftState> {
  const values = {
    name: text(data, "name"), materialGroup: text(data, "materialGroup"),
    materialTypeSlug: text(data, "materialType"), listingType: text(data, "listingType"),
    supplier: text(data, "supplier"), priceRange: text(data, "priceRange"),
    minimumOrder: text(data, "minimumOrder"), availability: text(data, "availability"),
    leadTime: text(data, "leadTime"), compliance: split(text(data, "compliance")),
    description: text(data, "description"), specifications: parseSpecs(text(data, "specifications")),
    country: text(data, "country"), city: text(data, "city"), phone: text(data, "phone"),
    whatsapp: text(data, "whatsapp"), email: text(data, "email").toLowerCase(),
  };
  const errors: Record<string, string> = {};
  const materialType = materialTypes.get(values.materialTypeSlug);
  const expectedGroup = constructionSlugs.has(values.materialTypeSlug) ? "Construction Materials" : "Industrial Materials";
  if (values.name.length < 5 || values.name.length > 160) errors.name = "Enter a name between 5 and 160 characters.";
  if (!["Construction Materials", "Industrial Materials"].includes(values.materialGroup)) errors.materialGroup = "Select a material group.";
  if (!materialType || values.materialGroup !== expectedGroup) errors.materialType = "Select a valid material type.";
  if (!["For Sale", "Supplier", "Buyer"].includes(values.listingType)) errors.listingType = "Select sale, supplier, or buyer.";
  if (!values.supplier) errors.supplier = "Enter the supplier, company, or buyer name.";
  if (!values.priceRange) errors.priceRange = "Enter a price range or buying budget.";
  if (!values.minimumOrder) errors.minimumOrder = "Enter the minimum order or required quantity.";
  if (!values.availability) errors.availability = "Enter availability.";
  if (!values.leadTime) errors.leadTime = "Enter lead time.";
  if (!values.compliance.length) errors.compliance = "Enter at least one standard or certification.";
  if (values.description.length < 80 || values.description.length > 2000) errors.description = "Use between 80 and 2,000 characters.";
  if (!values.specifications.length) errors.specifications = "Add at least one specification as Label: Value.";
  if (!values.country) errors.country = "Select a country.";
  if (!values.city) errors.city = "Select a city.";
  if (values.phone.length < 7) errors.phone = "Enter a valid phone number.";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email.";
  if (Object.keys(errors).length) return { success: false, message: "Please correct the material details.", errors };

  const [category, country, city] = await Promise.all([
    prisma.category.findUnique({ where: { slug: "construction-materials" }, select: { slug: true } }),
    prisma.country.findUnique({ where: { code: values.country }, select: { code: true } }),
    prisma.city.findFirst({ where: { slug: values.city, countryCode: values.country }, select: { slug: true } }),
  ]);
  if (!category || !country || !city) return { success: false, message: "One or more selected location options are invalid." };
  try {
    const editToken = randomBytes(32).toString("hex");
    const material = await prisma.material.create({
      data: {
        slug: slugify(values.name), categorySlug: category.slug, listingStatus: "draft",
        draftTokenHash: hash(editToken), name: values.name, materialGroup: values.materialGroup,
        materialType: materialType!, materialTypeSlug: values.materialTypeSlug,
        listingType: values.listingType, countryCode: country.code, citySlug: city.slug,
        supplier: values.supplier, priceRange: values.priceRange, minimumOrder: values.minimumOrder,
        availability: values.availability, leadTime: values.leadTime, compliance: values.compliance,
        description: values.description, specifications: values.specifications, phone: values.phone,
        whatsapp: values.whatsapp || null, email: values.email || null, posted: "Draft",
      },
      select: { id: true },
    });
    return { success: true, message: "Material saved as a private draft.", materialId: material.id, editToken };
  } catch (error) {
    console.error("Unable to save material draft", error);
    return { success: false, message: "We could not save the material draft. Please try again." };
  }
}

async function loadReview(id: string): Promise<MaterialReviewData | null> {
  const row = await prisma.material.findUnique({ where: { id }, include: { country: true, city: true, documents: true } });
  if (!row) return null;
  const specifications = Array.isArray(row.specifications) ? row.specifications.filter((item): item is { label: string; value: string } => typeof item === "object" && item !== null && "label" in item && "value" in item && typeof item.label === "string" && typeof item.value === "string") : [];
  return {
    slug: row.slug, name: row.name, materialGroup: row.materialGroup, materialType: row.materialType,
    listingType: row.listingType, country: row.country.name, city: row.city.name, supplier: row.supplier,
    priceRange: row.priceRange, minimumOrder: row.minimumOrder, availability: row.availability,
    leadTime: row.leadTime, compliance: row.compliance, description: row.description, specifications,
    phone: row.phone, whatsapp: row.whatsapp, email: row.email, image: row.image,
    galleryImages: row.galleryImages,
    documents: row.documents.map(({ name, documentType, documentUrl }) => ({ name, documentType, documentUrl })),
  };
}

export async function saveMaterialMedia(_state: MaterialMediaState, data: FormData): Promise<MaterialMediaState> {
  const materialId = text(data, "materialId"), editToken = text(data, "editToken"), image = text(data, "image");
  const galleryImages = data.getAll("galleryImages").map(String).map((item) => item.trim()).filter(Boolean);
  const names = data.getAll("documentNames").map(String), types = data.getAll("documentTypes").map(String), urls = data.getAll("documentUrls").map(String);
  const documents = urls.map((url, index) => ({ name: names[index]?.trim() ?? "", documentType: types[index]?.trim() || "Other", documentUrl: url.trim() })).filter((item) => item.name || item.documentUrl);
  const errors: Record<string, string> = {};
  if (!image || !isUrl(image)) errors.image = "Add a valid primary image URL.";
  if (galleryImages.length > 6 || galleryImages.some((url) => !isUrl(url))) errors.gallery = "Add up to six valid gallery URLs.";
  if (documents.length > 5 || documents.some((item) => !item.name || !isUrl(item.documentUrl))) errors.documents = "Each document needs a name and valid URL.";
  if (Object.keys(errors).length) return { success: false, message: "Please correct the media details.", errors };
  const draft = await prisma.material.findFirst({ where: { id: materialId, listingStatus: "draft", draftTokenHash: hash(editToken) }, select: { id: true } });
  if (!draft) return { success: false, message: "This material draft could not be verified." };
  try {
    await prisma.$transaction([
      prisma.material.update({ where: { id: materialId }, data: { image, galleryImages } }),
      prisma.materialDocument.deleteMany({ where: { materialId } }),
      ...(documents.length ? [prisma.materialDocument.createMany({ data: documents.map((item) => ({ materialId, ...item })) })] : []),
    ]);
    const review = await loadReview(materialId);
    return review ? { success: true, message: "Material media saved.", review } : { success: false, message: "The material draft could not be loaded." };
  } catch (error) {
    console.error("Unable to save material media", error);
    return { success: false, message: "We could not save the material media." };
  }
}

export async function publishMaterial(_state: MaterialPublishState, data: FormData): Promise<MaterialPublishState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Verify your email before publishing." };
  const materialId = text(data, "materialId"), editToken = text(data, "editToken");
  const draft = await prisma.material.findFirst({ where: { id: materialId, listingStatus: "draft", draftTokenHash: hash(editToken) }, select: { id: true, slug: true } });
  if (!draft) return { success: false, message: "This material draft could not be verified." };
  try {
    await prisma.material.update({ where: { id: draft.id }, data: { listingStatus: "published", draftTokenHash: null, ownerId: user.id, posted: new Date().toLocaleDateString("en-GB") } });
    revalidatePath("/construction-materials");
    revalidatePath(`/construction-materials/${draft.slug}`);
    return { success: true, message: "Your material listing has been published.", slug: draft.slug };
  } catch (error) {
    console.error("Unable to publish material", error);
    return { success: false, message: "We could not publish the material. Your draft remains saved." };
  }
}
