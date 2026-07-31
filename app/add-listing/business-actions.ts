"use server";

import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { BLOCKED_ACTIVITY_MESSAGE, getActivityRestriction, getCurrentUser } from "@/lib/auth";

export type BusinessDraftState = { success: boolean; message: string; opportunityId?: string; editToken?: string; errors?: Record<string, string> };
export type BusinessReviewData = {
  slug: string; title: string; section: string; category: string; investment: string;
  country: string; city: string; contact: string; phone: string; whatsapp: string | null;
  description: string; image: string | null; galleryImages: string[];
  documents: Array<{ name: string; documentType: string; documentUrl: string }>;
};
export type BusinessMediaState = { success: boolean; message: string; review?: BusinessReviewData; errors?: Record<string, string> };
export type BusinessPublishState = { success: boolean; message: string; slug?: string };

const text = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const isUrl = (value: string) => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } };
const slugify = (value: string) => `${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "opportunity"}-${crypto.randomUUID().slice(0, 8)}`;

export async function saveBusinessDraft(_state: BusinessDraftState, data: FormData): Promise<BusinessDraftState> {
  const restriction = await getActivityRestriction();
  if (restriction) return { success: false, message: restriction };
  const values = {
    title: text(data, "title"), section: text(data, "section"), category: text(data, "category"),
    investment: text(data, "investment"), country: text(data, "country"), city: text(data, "city"),
    contact: text(data, "contact").toLowerCase(), phone: text(data, "phone"),
    whatsapp: text(data, "whatsapp"), description: text(data, "description"),
  };
  const errors: Record<string, string> = {};
  if (values.title.length < 5 || values.title.length > 180) errors.title = "Enter a title between 5 and 180 characters.";
  if (!["Businesses for Sale", "Businesses Wanted", "Investment Opportunities"].includes(values.section)) errors.section = "Select a valid opportunity type.";
  if (!values.category) errors.category = "Enter a business category.";
  if (!values.investment) errors.investment = "Enter the asking price, budget, or investment.";
  if (!values.country) errors.country = "Select a country.";
  if (!values.city) errors.city = "Select a city.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact)) errors.contact = "Enter a valid contact email.";
  if (values.phone.length < 7) errors.phone = "Enter a valid phone number.";
  if (values.description.length < 100 || values.description.length > 2500) errors.description = "Use between 100 and 2,500 characters.";
  if (Object.keys(errors).length) return { success: false, message: "Please correct the opportunity details.", errors };
  const [category, country, city] = await Promise.all([
    prisma.category.findUnique({ where: { slug: "business-opportunities" }, select: { slug: true } }),
    prisma.country.findUnique({ where: { code: values.country }, select: { code: true } }),
    prisma.city.findFirst({ where: { slug: values.city, countryCode: values.country }, select: { slug: true } }),
  ]);
  if (!category || !country || !city) return { success: false, message: "One or more selected location options are invalid." };
  try {
    const editToken = randomBytes(32).toString("hex");
    const opportunity = await prisma.businessOpportunity.create({
      data: {
        slug: slugify(values.title), categorySlug: category.slug, listingStatus: "draft",
        draftTokenHash: hash(editToken), title: values.title, section: values.section,
        businessCategory: values.category, investment: values.investment,
        countryCode: country.code, citySlug: city.slug, contact: values.contact,
        phone: values.phone, whatsapp: values.whatsapp || null,
        description: values.description, postedDate: "Draft",
      },
      select: { id: true },
    });
    return { success: true, message: "Opportunity saved as a private draft.", opportunityId: opportunity.id, editToken };
  } catch (error) {
    console.error("Unable to save business opportunity", error);
    return { success: false, message: "We could not save the opportunity draft. Please try again." };
  }
}

async function loadReview(id: string): Promise<BusinessReviewData | null> {
  const row = await prisma.businessOpportunity.findUnique({ where: { id }, include: { country: true, city: true, documents: true } });
  if (!row) return null;
  return {
    slug: row.slug, title: row.title, section: row.section, category: row.businessCategory,
    investment: row.investment, country: row.country.name, city: row.city.name,
    contact: row.contact, phone: row.phone, whatsapp: row.whatsapp,
    description: row.description, image: row.image, galleryImages: row.galleryImages,
    documents: row.documents.map(({ name, documentType, documentUrl }) => ({ name, documentType, documentUrl })),
  };
}

export async function saveBusinessMedia(_state: BusinessMediaState, data: FormData): Promise<BusinessMediaState> {
  const restriction = await getActivityRestriction();
  if (restriction) return { success: false, message: restriction };
  const opportunityId = text(data, "opportunityId"), editToken = text(data, "editToken"), image = text(data, "image");
  const galleryImages = data.getAll("galleryImages").map(String).map((item) => item.trim()).filter(Boolean);
  const names = data.getAll("documentNames").map(String), types = data.getAll("documentTypes").map(String), urls = data.getAll("documentUrls").map(String);
  const documents = urls.map((url, index) => ({ name: names[index]?.trim() ?? "", documentType: types[index]?.trim() || "Other", documentUrl: url.trim() })).filter((item) => item.name || item.documentUrl);
  const errors: Record<string, string> = {};
  if (!image || !isUrl(image)) errors.image = "Add a valid primary image URL.";
  if (galleryImages.length > 6 || galleryImages.some((url) => !isUrl(url))) errors.gallery = "Add up to six valid gallery URLs.";
  if (documents.length > 5 || documents.some((item) => !item.name || !isUrl(item.documentUrl))) errors.documents = "Each document needs a name and valid URL.";
  if (Object.keys(errors).length) return { success: false, message: "Please correct the media details.", errors };
  const draft = await prisma.businessOpportunity.findFirst({ where: { id: opportunityId, listingStatus: "draft", draftTokenHash: hash(editToken) }, select: { id: true } });
  if (!draft) return { success: false, message: "This opportunity draft could not be verified." };
  try {
    await prisma.$transaction([
      prisma.businessOpportunity.update({ where: { id: opportunityId }, data: { image, galleryImages } }),
      prisma.businessOpportunityDocument.deleteMany({ where: { businessOpportunityId: opportunityId } }),
      ...(documents.length ? [prisma.businessOpportunityDocument.createMany({ data: documents.map((item) => ({ businessOpportunityId: opportunityId, ...item })) })] : []),
    ]);
    const review = await loadReview(opportunityId);
    return review ? { success: true, message: "Opportunity media saved.", review } : { success: false, message: "The opportunity could not be loaded." };
  } catch (error) {
    console.error("Unable to save opportunity media", error);
    return { success: false, message: "We could not save the opportunity media." };
  }
}

export async function publishBusiness(_state: BusinessPublishState, data: FormData): Promise<BusinessPublishState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Verify your email before publishing." };
  if (user.blockedAt) return { success: false, message: BLOCKED_ACTIVITY_MESSAGE };
  const opportunityId = text(data, "opportunityId"), editToken = text(data, "editToken");
  const draft = await prisma.businessOpportunity.findFirst({ where: { id: opportunityId, listingStatus: "draft", draftTokenHash: hash(editToken) }, select: { id: true, slug: true } });
  if (!draft) return { success: false, message: "This opportunity draft could not be verified." };
  try {
    await prisma.businessOpportunity.update({ where: { id: draft.id }, data: { listingStatus: "pending", draftTokenHash: null, ownerId: user.id, postedDate: new Date().toLocaleDateString("en-GB") } });
    revalidatePath("/business-opportunities");
    revalidatePath(`/business-opportunities/${draft.slug}`);
    return { success: true, message: "Your business opportunity was submitted for admin approval.", slug: draft.slug };
  } catch (error) {
    console.error("Unable to publish business opportunity", error);
    return { success: false, message: "We could not publish the opportunity. Your draft remains saved." };
  }
}
