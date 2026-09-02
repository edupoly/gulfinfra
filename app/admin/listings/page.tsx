import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminListingManager } from "@/components/admin/AdminListingManager";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "All Listings" };

function reviewDetails<T>(record: T) {
  return JSON.parse(JSON.stringify(record, (key, value) => {
    if (["draftTokenHash", "passwordHash", "tokenHash"].includes(key)) return undefined;
    return value;
  })) as Record<string, unknown>;
}

export default async function AdminListingsPage() {
  const [contractors, projects, equipment, materials, opportunities, rfqs] = await Promise.all([
    prisma.contractor.findMany({ include: { owner: { select: { fullName: true, email: true, company: true } }, contractorTypes: { include: { contractorType: { select: { name: true } } } }, countries: { include: { country: { select: { name: true } } } }, cities: { include: { city: { select: { name: true } } } }, services: true, areasServed: true, licenses: true, galleryItems: true, documents: true, featuredProjects: true }, orderBy: { createdAt: "desc" } }),
    prisma.projectTender.findMany({
      include: {
        owner: { select: { fullName: true, email: true, company: true } },
        projectTenderTypes: { include: { projectTenderType: { select: { name: true } } } },
        countries: { include: { country: { select: { name: true } } } },
        cities: { include: { city: { select: { name: true } } } },
        sectors: true,
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.equipment.findMany({ include: { owner: { select: { fullName: true, email: true, company: true } }, equipmentType: { select: { name: true } }, country: { select: { name: true } }, city: { select: { name: true } }, documents: true }, orderBy: { createdAt: "desc" } }),
    prisma.material.findMany({ include: { owner: { select: { fullName: true, email: true, company: true } }, country: { select: { name: true } }, city: { select: { name: true } }, documents: true }, orderBy: { createdAt: "desc" } }),
    prisma.businessOpportunity.findMany({ include: { owner: { select: { fullName: true, email: true, company: true } }, country: { select: { name: true } }, city: { select: { name: true } }, documents: true }, orderBy: { createdAt: "desc" } }),
    prisma.rfq.findMany({ include: { buyer: { select: { fullName: true, email: true, company: true } }, _count: { select: { quotations: true } } }, orderBy: { postedAt: "desc" } }),
  ]);
  const groups = [
    { name: "Contractors", records: contractors.map((item) => ({ id: item.id, type: "contractor" as const, title: item.name, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/contractors/${item.slug}`, details: reviewDetails(item) })) },
    { name: "Projects & Tenders", records: projects.map((item) => ({ id: item.id, type: "project" as const, title: item.title, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/projects-tenders/${item.slug}`, details: reviewDetails(item) })) },
    { name: "Equipment Marketplace", records: equipment.map((item) => ({ id: item.id, type: "equipment" as const, title: item.title, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/equipment-marketplace/${item.slug}`, details: reviewDetails(item) })) },
    { name: "Construction & Industrial Materials", records: materials.map((item) => ({ id: item.id, type: "material" as const, title: item.name, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/construction-materials/${item.slug}`, details: reviewDetails(item) })) },
    { name: "Business Opportunities", records: opportunities.map((item) => ({ id: item.id, type: "business" as const, title: item.title, status: item.listingStatus, featured: item.featured, date: item.createdAt.toISOString(), href: `/business-opportunities/${item.slug}`, details: reviewDetails(item) })) },
    { name: "RFQs", records: rfqs.map((item) => ({ id: item.id, type: "rfq" as const, title: `${item.reference} — ${item.title}`, status: item.status, featured: false, date: item.postedAt.toISOString(), href: `/rfqs?rfq=${item.id}`, details: reviewDetails(item) })) },
  ];

  return (
    <>
      <AdminPageHeader title="All marketplace listings" description="Every marketplace entry, including unpublished records." />
      <AdminListingManager groups={groups} />
    </>
  );
}
