import "server-only";

import { prisma } from "@/lib/prisma";

export type SavedListingType =
  | "contractor"
  | "project"
  | "equipment"
  | "material"
  | "business";

export async function isListingSaved(
  userId: string | undefined,
  listingType: SavedListingType,
  listingSlug: string,
) {
  if (!userId) return false;
  return Boolean(
    await prisma.savedListing.findUnique({
      where: {
        userId_listingType_listingSlug: { userId, listingType, listingSlug },
      },
      select: { id: true },
    }),
  );
}

export async function getSavedListingSlugs(
  userId: string | undefined,
  listingType: SavedListingType,
) {
  if (!userId) return [];

  const listings = await prisma.savedListing.findMany({
    where: { userId, listingType },
    select: { listingSlug: true },
  });

  return listings.map((listing) => listing.listingSlug);
}
