"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type OwnedListingType =
  | "contractor"
  | "project"
  | "equipment"
  | "material"
  | "business";

const validTypes = new Set<OwnedListingType>([
  "contractor",
  "project",
  "equipment",
  "material",
  "business",
]);

const value = (data: FormData, name: string, max: number) =>
  String(data.get(name) ?? "").trim().slice(0, max);
const optional = (data: FormData, name: string, max: number) =>
  value(data, name, max) || null;
const integer = (data: FormData, name: string) => {
  const raw = value(data, name, 20);
  return raw ? Number.parseInt(raw, 10) : null;
};
const lines = (data: FormData, name: string) =>
  [...new Set(value(data, name, 5000).split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean))];
const json = (data: FormData, name: string) => {
  const raw = value(data, name, 10_000);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    throw new Error("INVALID_JSON");
  }
};

async function ownedListing(type: OwnedListingType, id: string, userId: string) {
  if (type === "contractor") return prisma.contractor.findFirst({ where: { id, ownerId: userId }, select: { id: true, slug: true } });
  if (type === "project") return prisma.projectTender.findFirst({ where: { id, ownerId: userId }, select: { id: true, slug: true } });
  if (type === "equipment") return prisma.equipment.findFirst({ where: { id, ownerId: userId }, select: { id: true, slug: true } });
  if (type === "material") return prisma.material.findFirst({ where: { id, ownerId: userId }, select: { id: true, slug: true } });
  return prisma.businessOpportunity.findFirst({ where: { id, ownerId: userId }, select: { id: true, slug: true } });
}

export async function updateOwnedListing(data: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") throw new Error("UNAUTHORIZED");
  if (user.blockedAt) throw new Error("ACCOUNT_BLOCKED");
  const type = String(data.get("type") ?? "") as OwnedListingType;
  const id = String(data.get("id") ?? "");
  if (!validTypes.has(type) || !id) throw new Error("INVALID_LISTING");

  const listing = await ownedListing(type, id, user.id);
  if (!listing) throw new Error("LISTING_NOT_OWNED");

  const title = value(data, "title", 180);
  const description = value(data, "description", 3000);
  if (title.length < 2 || description.length < 20) throw new Error("INVALID_LISTING_DATA");

  if (type === "contractor") {
    const contractorTypes = lines(data, "contractorTypes");
    const services = lines(data, "services");
    const areasServed = lines(data, "areasServed");
    const licenses = lines(data, "licenses");
    const countryCodes = lines(data, "countryCode");
    const citySlugs = lines(data, "citySlug");
    const galleryUrls = lines(data, "galleryUrls");
    await prisma.$transaction(async (transaction) => {
      await transaction.contractor.update({
        where: { id },
        data: {
          listingStatus: "pending",
          name: title,
          companyType: value(data, "companyType", 100),
          primaryTypeSlug: contractorTypes[0] || optional(data, "primaryTypeSlug", 160),
          countryCode: countryCodes[0] || null,
          citySlug: citySlugs[0] || null,
          yearEstablished: integer(data, "yearEstablished"),
          employees: optional(data, "employees", 100),
          website: optional(data, "website", 500),
          email: optional(data, "email", 160)?.toLowerCase() || null,
          phone: optional(data, "phone", 40),
          whatsapp: optional(data, "whatsapp", 40),
          address: optional(data, "address", 500),
          description,
          responseTime: optional(data, "responseTime", 100),
          projectsCompleted: integer(data, "projectsCompleted"),
          logoUrl: optional(data, "logoUrl", 500),
        },
      });
      await Promise.all([
        transaction.contractorTypeLink.deleteMany({ where: { contractorId: id } }),
        transaction.contractorService.deleteMany({ where: { contractorId: id } }),
        transaction.contractorAreaServed.deleteMany({ where: { contractorId: id } }),
        transaction.contractorLicense.deleteMany({ where: { contractorId: id } }),
        transaction.contractorCountryLink.deleteMany({ where: { contractorId: id } }),
        transaction.contractorCityLink.deleteMany({ where: { contractorId: id } }),
        transaction.contractorGalleryItem.deleteMany({ where: { contractorId: id } }),
      ]);
      if (contractorTypes.length) await transaction.contractorTypeLink.createMany({ data: contractorTypes.map((contractorTypeSlug) => ({ contractorId: id, contractorTypeSlug })) });
      if (services.length) await transaction.contractorService.createMany({ data: services.map((serviceName) => ({ contractorId: id, serviceName })) });
      if (areasServed.length) await transaction.contractorAreaServed.createMany({ data: areasServed.map((areaName) => ({ contractorId: id, areaName })) });
      if (licenses.length) await transaction.contractorLicense.createMany({ data: licenses.map((licenseName) => ({ contractorId: id, licenseName })) });
      if (countryCodes.length) await transaction.contractorCountryLink.createMany({ data: countryCodes.map((countryCode) => ({ contractorId: id, countryCode })) });
      if (citySlugs.length) await transaction.contractorCityLink.createMany({ data: citySlugs.map((citySlug) => ({ contractorId: id, citySlug })) });
      if (galleryUrls.length) await transaction.contractorGalleryItem.createMany({ data: galleryUrls.map((imageUrl) => ({ contractorId: id, imageUrl })) });
    });
    revalidatePath(`/contractors/${listing.slug}`);
  } else if (type === "project") {
    const projectTypes = lines(data, "projectTypes");
    const countryCodes = lines(data, "countryCodes");
    const citySlugs = lines(data, "citySlugs");
    const sectors = lines(data, "sectors");
    await prisma.$transaction(async (transaction) => {
      await transaction.projectTender.update({
        where: { id },
        data: {
          listingStatus: "pending",
          title,
          summary: value(data, "summary", 500) || null,
          description,
          projectType: optional(data, "projectType", 160),
          status: value(data, "projectStatus", 100),
          budget: optional(data, "price", 100),
          deadline: optional(data, "deadline", 100),
          client: optional(data, "client", 180),
          value: optional(data, "projectValue", 100),
          tenderType: optional(data, "tenderType", 120),
          location: optional(data, "location", 300),
          posted: optional(data, "posted", 100),
          imageUrls: lines(data, "imageUrls"),
        },
      });
      await Promise.all([
        transaction.projectTenderTypeLink.deleteMany({ where: { projectTenderId: id } }),
        transaction.projectTenderCountryLink.deleteMany({ where: { projectTenderId: id } }),
        transaction.projectTenderCityLink.deleteMany({ where: { projectTenderId: id } }),
        transaction.projectTenderSector.deleteMany({ where: { projectTenderId: id } }),
      ]);
      if (projectTypes.length) await transaction.projectTenderTypeLink.createMany({ data: projectTypes.map((projectTenderTypeSlug) => ({ projectTenderId: id, projectTenderTypeSlug })) });
      if (countryCodes.length) await transaction.projectTenderCountryLink.createMany({ data: countryCodes.map((countryCode) => ({ projectTenderId: id, countryCode })) });
      if (citySlugs.length) await transaction.projectTenderCityLink.createMany({ data: citySlugs.map((citySlug) => ({ projectTenderId: id, citySlug })) });
      if (sectors.length) await transaction.projectTenderSector.createMany({ data: sectors.map((sectorName) => ({ projectTenderId: id, sectorName })) });
    });
    revalidatePath(`/projects-tenders/${listing.slug}`);
  } else if (type === "equipment") {
    await prisma.equipment.update({
      where: { id },
      data: {
        listingStatus: "pending",
        title,
        description,
        equipmentTypeSlug: value(data, "equipmentTypeSlug", 160),
        listingType: value(data, "listingType", 100),
        condition: value(data, "condition", 100),
        countryCode: value(data, "countryCode", 10),
        citySlug: value(data, "citySlug", 160),
        brand: value(data, "brand", 120),
        model: value(data, "model", 120),
        year: integer(data, "year") || new Date().getFullYear(),
        operatingHours: integer(data, "operatingHours"),
        price: value(data, "price", 100),
        priceNote: optional(data, "priceNote", 300),
        availability: value(data, "availability", 120),
        location: value(data, "location", 300),
        specifications: json(data, "specifications"),
        sellerName: value(data, "sellerName", 180),
        sellerType: value(data, "sellerType", 120),
        phone: value(data, "phone", 40),
        whatsapp: optional(data, "whatsapp", 40),
        email: value(data, "email", 160).toLowerCase() || null,
        images: lines(data, "images"),
        posted: optional(data, "posted", 100),
      },
    });
    revalidatePath(`/equipment-marketplace/${listing.slug}`);
  } else if (type === "material") {
    await prisma.material.update({
      where: { id },
      data: {
        listingStatus: "pending",
        name: title,
        description,
        materialGroup: value(data, "materialGroup", 100),
        materialType: value(data, "materialType", 160),
        materialTypeSlug: value(data, "materialTypeSlug", 160),
        listingType: value(data, "listingType", 100),
        countryCode: value(data, "countryCode", 10),
        citySlug: value(data, "citySlug", 160),
        supplier: value(data, "supplier", 180),
        priceRange: value(data, "price", 100),
        minimumOrder: value(data, "minimumOrder", 120),
        availability: value(data, "availability", 120),
        leadTime: value(data, "leadTime", 120),
        compliance: lines(data, "compliance"),
        specifications: json(data, "specifications"),
        phone: value(data, "phone", 40),
        whatsapp: optional(data, "whatsapp", 40),
        email: value(data, "email", 160).toLowerCase() || null,
        image: optional(data, "image", 500),
        galleryImages: lines(data, "galleryImages"),
        posted: optional(data, "posted", 100),
      },
    });
    revalidatePath(`/construction-materials/${listing.slug}`);
  } else {
    await prisma.businessOpportunity.update({
      where: { id },
      data: {
        listingStatus: "pending",
        title,
        description,
        section: value(data, "section", 120),
        businessCategory: value(data, "businessCategory", 160),
        investment: value(data, "price", 120),
        countryCode: value(data, "countryCode", 10),
        citySlug: value(data, "citySlug", 160),
        contact: value(data, "email", 160).toLowerCase(),
        phone: value(data, "phone", 40),
        whatsapp: optional(data, "whatsapp", 40),
        image: optional(data, "image", 500),
        galleryImages: lines(data, "galleryImages"),
        postedDate: optional(data, "posted", 100),
      },
    });
    revalidatePath(`/business-opportunities/${listing.slug}`);
  }

  await prisma.savedListing.updateMany({
    where: { listingType: type, listingSlug: listing.slug },
    data: { title },
  });
  revalidatePath("/my-listings");
  redirect("/my-listings#listings");
}

export async function deleteOwnedListing(data: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role === "admin") throw new Error("UNAUTHORIZED");
  if (user.blockedAt) throw new Error("ACCOUNT_BLOCKED");
  const type = String(data.get("type") ?? "") as OwnedListingType;
  const id = String(data.get("id") ?? "");
  if (!validTypes.has(type) || !id) throw new Error("INVALID_LISTING");

  const listing = await ownedListing(type, id, user.id);
  if (!listing) throw new Error("LISTING_NOT_OWNED");

  await prisma.$transaction(async (transaction) => {
    await transaction.savedListing.deleteMany({
      where: { listingType: type, listingSlug: listing.slug },
    });
    if (type === "contractor") await transaction.contractor.delete({ where: { id } });
    else if (type === "project") await transaction.projectTender.delete({ where: { id } });
    else if (type === "equipment") await transaction.equipment.delete({ where: { id } });
    else if (type === "material") await transaction.material.delete({ where: { id } });
    else await transaction.businessOpportunity.delete({ where: { id } });
  });

  revalidatePath("/my-listings");
  revalidatePath("/");
  redirect("/my-listings#listings");
}
