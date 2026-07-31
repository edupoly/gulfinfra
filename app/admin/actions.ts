"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AdminListingType =
  | "contractor"
  | "project"
  | "equipment"
  | "material"
  | "business"
  | "rfq";

const listingTypes = new Set<AdminListingType>([
  "contractor",
  "project",
  "equipment",
  "material",
  "business",
  "rfq",
]);

type FeatureableListingType = Exclude<AdminListingType, "rfq">;

export async function setListingFeatured(
  type: FeatureableListingType,
  id: string,
  featured: boolean,
) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  if (!id) throw new Error("INVALID_LISTING");

  if (type === "contractor") {
    const listing = await prisma.contractor.findUnique({ where: { id }, select: { listingStatus: true } });
    if (!listing || (featured && listing.listingStatus !== "published")) throw new Error("LISTING_NOT_PUBLISHED");
    await prisma.contractor.update({ where: { id }, data: { featured } });
  } else if (type === "project") {
    const listing = await prisma.projectTender.findUnique({ where: { id }, select: { listingStatus: true } });
    if (!listing || (featured && listing.listingStatus !== "published")) throw new Error("LISTING_NOT_PUBLISHED");
    await prisma.projectTender.update({ where: { id }, data: { featured } });
  } else if (type === "equipment") {
    const listing = await prisma.equipment.findUnique({ where: { id }, select: { listingStatus: true } });
    if (!listing || (featured && listing.listingStatus !== "published")) throw new Error("LISTING_NOT_PUBLISHED");
    await prisma.equipment.update({ where: { id }, data: { featured } });
  } else if (type === "material") {
    const listing = await prisma.material.findUnique({ where: { id }, select: { listingStatus: true } });
    if (!listing || (featured && listing.listingStatus !== "published")) throw new Error("LISTING_NOT_PUBLISHED");
    await prisma.material.update({ where: { id }, data: { featured } });
  } else {
    const listing = await prisma.businessOpportunity.findUnique({ where: { id }, select: { listingStatus: true } });
    if (!listing || (featured && listing.listingStatus !== "published")) throw new Error("LISTING_NOT_PUBLISHED");
    await prisma.businessOpportunity.update({ where: { id }, data: { featured } });
  }

  revalidatePath("/admin/listings");
  revalidatePath("/admin/overview");
  revalidatePath("/");
  revalidatePath("/contractors");
  revalidatePath("/projects-tenders");
  revalidatePath("/equipment-marketplace");
  revalidatePath("/construction-materials");
  revalidatePath("/business-opportunities");
}

export async function moderateListing(
  type: AdminListingType,
  id: string,
  decision: "approve" | "reject" | "hold",
) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  if (!listingTypes.has(type) || !id) throw new Error("INVALID_LISTING");

  let current: { status: string } | null;
  if (type === "contractor") {
    const row = await prisma.contractor.findUnique({ where: { id }, select: { listingStatus: true } });
    current = row ? { status: row.listingStatus } : null;
  } else if (type === "project") {
    const row = await prisma.projectTender.findUnique({ where: { id }, select: { listingStatus: true } });
    current = row ? { status: row.listingStatus } : null;
  } else if (type === "equipment") {
    const row = await prisma.equipment.findUnique({ where: { id }, select: { listingStatus: true } });
    current = row ? { status: row.listingStatus } : null;
  } else if (type === "material") {
    const row = await prisma.material.findUnique({ where: { id }, select: { listingStatus: true } });
    current = row ? { status: row.listingStatus } : null;
  } else if (type === "business") {
    const row = await prisma.businessOpportunity.findUnique({ where: { id }, select: { listingStatus: true } });
    current = row ? { status: row.listingStatus } : null;
  } else {
    current = await prisma.rfq.findUnique({ where: { id }, select: { status: true } });
  }
  if (!current || current.status === "draft") throw new Error("LISTING_NOT_SUBMITTED");

  const status =
    decision === "approve"
      ? "published"
      : decision === "hold"
        ? "on_hold"
        : "rejected";
  let publicPath = "";
  let detailPath = "";

  if (type === "contractor") {
    const listing = await prisma.contractor.update({
      where: { id },
      data: { listingStatus: status, ...(decision === "approve" ? {} : { featured: false }) },
      select: { slug: true },
    });
    publicPath = "/contractors";
    detailPath = `/contractors/${listing.slug}`;
  } else if (type === "project") {
    const listing = await prisma.projectTender.update({
      where: { id },
      data: { listingStatus: status, ...(decision === "approve" ? {} : { featured: false }) },
      select: { slug: true },
    });
    publicPath = "/projects-tenders";
    detailPath = `/projects-tenders/${listing.slug}`;
  } else if (type === "equipment") {
    const listing = await prisma.equipment.update({
      where: { id },
      data: { listingStatus: status, ...(decision === "approve" ? {} : { featured: false }) },
      select: { slug: true },
    });
    publicPath = "/equipment-marketplace";
    detailPath = `/equipment-marketplace/${listing.slug}`;
  } else if (type === "material") {
    const listing = await prisma.material.update({
      where: { id },
      data: { listingStatus: status, ...(decision === "approve" ? {} : { featured: false }) },
      select: { slug: true },
    });
    publicPath = "/construction-materials";
    detailPath = `/construction-materials/${listing.slug}`;
  } else if (type === "business") {
    const listing = await prisma.businessOpportunity.update({
      where: { id },
      data: { listingStatus: status, ...(decision === "approve" ? {} : { featured: false }) },
      select: { slug: true },
    });
    publicPath = "/business-opportunities";
    detailPath = `/business-opportunities/${listing.slug}`;
  } else {
    await prisma.rfq.update({ where: { id }, data: { status } });
    publicPath = "/rfqs";
  }

  revalidatePath("/admin/listings");
  revalidatePath("/admin/overview");
  revalidatePath("/admin/categories");
  revalidatePath("/my-listings");
  revalidatePath(publicPath);
  if (detailPath) revalidatePath(detailPath);
}

export async function setUserBlocked(userId: string, shouldBlock: boolean, data: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  if (!userId || userId === admin.id) throw new Error("INVALID_USER");

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target || target.role === "admin") throw new Error("INVALID_USER");

  const reason = String(data.get("reason") ?? "").trim().slice(0, 500);
  await prisma.user.update({
    where: { id: userId },
    data: {
      blockedAt: shouldBlock ? new Date() : null,
      blockedReason: shouldBlock ? reason || "Blocked by administrator" : null,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/overview");
  revalidatePath("/add-listing");
  revalidatePath("/my-listings");
}
