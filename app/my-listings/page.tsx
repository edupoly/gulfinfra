import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My Listings | GulfInfraHub" };
export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [contractors, projects, equipment, materials, opportunities] = await Promise.all([
    prisma.contractor.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, name: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.projectTender.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, title: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.equipment.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, title: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.material.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, name: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.businessOpportunity.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, title: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
  ]);
  const listings = [
    ...contractors.map((item) => ({ ...item, title: item.name, type: "Contractor", href: `/contractors/${item.slug}` })),
    ...projects.map((item) => ({ ...item, type: "Project / Tender", href: `/projects-tenders/${item.slug}` })),
    ...equipment.map((item) => ({ ...item, type: "Equipment", href: `/equipment-marketplace/${item.slug}` })),
    ...materials.map((item) => ({ ...item, title: item.name, type: "Material", href: `/construction-materials/${item.slug}` })),
    ...opportunities.map((item) => ({ ...item, type: "Business Opportunity", href: `/business-opportunities/${item.slug}` })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Account</p><h1 className="mt-2 text-4xl font-black text-[#0b1f3a]">My Listings</h1><p className="mt-2 text-slate-600">{user.email}</p></div>
        <Link href="/add-listing" className="w-fit rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950">＋ Add New Listing</Link>
      </div>
      <section className="mt-8 space-y-3">
        {listings.length ? listings.map((listing) => (
          <article key={`${listing.type}-${listing.id}`} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-wider text-amber-700">{listing.type}</p><h2 className="mt-1 text-xl font-black text-[#0b1f3a]">{listing.title}</h2><p className="mt-1 text-sm capitalize text-slate-500">{listing.listingStatus} · {listing.createdAt.toLocaleDateString("en-GB")}</p></div>
            {listing.listingStatus === "published" && <Link href={listing.href} className="font-black text-blue-700">View listing →</Link>}
          </article>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h2 className="text-2xl font-black text-[#0b1f3a]">No listings yet</h2><p className="mt-2 text-slate-600">Your verified listings will appear here.</p></div>
        )}
      </section>
    </main>
  );
}
