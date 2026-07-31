import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminListingManager } from "@/components/admin/AdminListingManager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "All Listings" };

export default async function AdminListingsPage() {
  const [contractors, projects, equipment, materials, opportunities, rfqs] = await Promise.all([
    prisma.contractor.findMany({ select: { id: true, slug: true, name: true, listingStatus: true, featured: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.projectTender.findMany({ select: { id: true, slug: true, title: true, listingStatus: true, featured: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.equipment.findMany({ select: { id: true, slug: true, title: true, listingStatus: true, featured: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.material.findMany({ select: { id: true, slug: true, name: true, listingStatus: true, featured: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.businessOpportunity.findMany({ select: { id: true, slug: true, title: true, listingStatus: true, featured: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.rfq.findMany({ select: { id: true, reference: true, title: true, status: true, postedAt: true }, orderBy: { postedAt: "desc" } }),
  ]);
  const groups = [
    { name: "Contractors", records: contractors.map((item) => ({ id: item.id, type: "contractor" as const, title: item.name, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/contractors/${item.slug}` })) },
    { name: "Projects & Tenders", records: projects.map((item) => ({ id: item.id, type: "project" as const, title: item.title, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/projects-tenders/${item.slug}` })) },
    { name: "Equipment Marketplace", records: equipment.map((item) => ({ id: item.id, type: "equipment" as const, title: item.title, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/equipment-marketplace/${item.slug}` })) },
    { name: "Construction & Industrial Materials", records: materials.map((item) => ({ id: item.id, type: "material" as const, title: item.name, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/construction-materials/${item.slug}` })) },
    { name: "Business Opportunities", records: opportunities.map((item) => ({ id: item.id, type: "business" as const, title: item.title, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/business-opportunities/${item.slug}` })) },
    { name: "RFQs", records: rfqs.map((item) => ({ id: item.id, type: "rfq" as const, title: `${item.reference} — ${item.title}`, status: item.status, featured: false, date: item.postedAt.toISOString(), href: "/rfqs" })) },
  ];

  return (
    <>
      <AdminPageHeader title="All marketplace listings" description="Every marketplace entry, including unpublished records." />
      <AdminListingManager groups={groups} />
    </>
  );
}
