"use server";

import { revalidatePath } from "next/cache";
import { BLOCKED_ACTIVITY_MESSAGE, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SavedListingType } from "@/lib/saved-listings";
import { getContractorBySlug } from "@/services/contractor-service";
import { getProjectTenderBySlug } from "@/services/project-tender-service";
import { getEquipmentBySlug } from "@/services/equipment-service";
import { getMaterialBySlug } from "@/services/material-service";
import { getBusinessOpportunityBySlug } from "@/services/business-opportunity-service";

export type SavedListingState = {
  success: boolean;
  saved: boolean;
  message: string;
  requiresLogin?: boolean;
};

const types = new Set<SavedListingType>([
  "contractor",
  "project",
  "equipment",
  "material",
  "business",
]);

async function resolveListing(type: SavedListingType, slug: string) {
  if (type === "contractor") {
    const item = await getContractorBySlug(slug);
    return item ? { title: item.name, href: `/contractors/${slug}` } : null;
  }
  if (type === "project") {
    const item = await getProjectTenderBySlug(slug);
    return item ? { title: item.title, href: `/projects-tenders/${slug}` } : null;
  }
  if (type === "equipment") {
    const item = await getEquipmentBySlug(slug);
    return item ? { title: item.title, href: `/equipment-marketplace/${slug}` } : null;
  }
  if (type === "material") {
    const item = await getMaterialBySlug(slug);
    return item ? { title: item.name, href: `/construction-materials/${slug}` } : null;
  }
  const item = await getBusinessOpportunityBySlug(slug);
  return item ? { title: item.title, href: `/business-opportunities/${slug}` } : null;
}

export async function toggleSavedListing(
  state: SavedListingState,
  data: FormData,
): Promise<SavedListingState> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      saved: state.saved,
      message: "Sign in to save this listing.",
      requiresLogin: true,
    };
  }
  if (user.blockedAt) {
    return {
      success: false,
      saved: state.saved,
      message: BLOCKED_ACTIVITY_MESSAGE,
    };
  }

  const listingType = String(data.get("listingType") ?? "") as SavedListingType;
  const listingSlug = String(data.get("listingSlug") ?? "").trim();
  if (!types.has(listingType) || !/^[a-z0-9-]{1,160}$/.test(listingSlug)) {
    return { success: false, saved: state.saved, message: "This listing cannot be saved." };
  }

  const key = {
    userId_listingType_listingSlug: {
      userId: user.id,
      listingType,
      listingSlug,
    },
  };
  const existing = await prisma.savedListing.findUnique({ where: key, select: { id: true } });
  if (existing) {
    await prisma.savedListing.delete({ where: { id: existing.id } });
    revalidatePath("/my-listings");
    return { success: true, saved: false, message: "Removed from saved listings." };
  }

  const listing = await resolveListing(listingType, listingSlug);
  if (!listing) {
    return { success: false, saved: false, message: "This listing is no longer available." };
  }
  await prisma.savedListing.create({
    data: { userId: user.id, listingType, listingSlug, ...listing },
  });
  revalidatePath("/my-listings");
  return { success: true, saved: true, message: "Listing saved." };
}
