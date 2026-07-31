import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm, ProfileForm } from "@/components/account/AccountForms";
import { DashboardSidebar } from "@/components/account/DashboardSidebar";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import type { SavedListingType } from "@/lib/saved-listings";
import { DeleteListingButton } from "@/components/account/DeleteListingButton";

export const metadata: Metadata = { title: "My Listings | GulfInfraHub" };
export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  const [contractors, projects, equipment, materials, opportunities, savedListings] = await Promise.all([
    prisma.contractor.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, name: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.projectTender.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, title: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.equipment.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, title: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.material.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, name: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.businessOpportunity.findMany({ where: { ownerId: user.id }, select: { id: true, slug: true, title: true, listingStatus: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    prisma.savedListing.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);
  const listings = [
    ...contractors.map((item) => ({ ...item, title: item.name, type: "Contractor", listingType: "contractor" as const, href: `/contractors/${item.slug}` })),
    ...projects.map((item) => ({ ...item, type: "Project / Tender", listingType: "project" as const, href: `/projects-tenders/${item.slug}` })),
    ...equipment.map((item) => ({ ...item, type: "Equipment", listingType: "equipment" as const, href: `/equipment-marketplace/${item.slug}` })),
    ...materials.map((item) => ({ ...item, title: item.name, type: "Material", listingType: "material" as const, href: `/construction-materials/${item.slug}` })),
    ...opportunities.map((item) => ({ ...item, type: "Business Opportunity", listingType: "business" as const, href: `/business-opportunities/${item.slug}` })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const publishedCount = listings.filter((listing) => listing.listingStatus === "published").length;
  const draftCount = listings.length - publishedCount;
  const listingTypes = new Set(listings.map((listing) => listing.type)).size;

  return (
    <main className="w-full bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar email={user.email} fullName={user.fullName} profileImageUrl={user.profileImageUrl} />
        <div className="min-w-0">
          <header id="overview" className="scroll-mt-32 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Account dashboard</p><h1 className="mt-2 text-4xl font-black text-[#0b1f3a]">Welcome{user.fullName ? `, ${user.fullName.split(" ")[0]}` : " back"}</h1><p className="mt-2 text-slate-600">Manage your listings, saved items, profile, and account security.</p></div>
            {!user.blockedAt && <Link href="/add-listing" className="w-fit rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950">＋ Add New Listing</Link>}
          </header>

          {user.blockedAt && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
              <p className="font-black">Your account is blocked</p>
              <p className="mt-1 text-sm">
                You can view your account, but you cannot add, edit, delete, or save listings.
                {user.blockedReason ? ` Reason: ${user.blockedReason}` : ""}
              </p>
            </div>
          )}

          <section aria-label="Listing summary" className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Total listings", listings.length],
              ["Published", publishedCount],
              ["Drafts / pending", draftCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-[#0b1f3a]">{value}</p>
              </div>
            ))}
          </section>

          <section id="listings" className="scroll-mt-32 mt-8">
            <div className="mb-4"><h2 className="text-2xl font-black text-[#0b1f3a]">My listings</h2><p className="mt-1 text-sm text-slate-500">{listingTypes} active listing {listingTypes === 1 ? "category" : "categories"}</p></div>
            <div className="space-y-3">
              {listings.length ? listings.map((listing) => (
                <article key={`${listing.type}-${listing.id}`} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-xs font-black uppercase tracking-wider text-amber-700">{listing.type}</p><h3 className="mt-1 text-xl font-black text-[#0b1f3a]">{listing.title}</h3><p className="mt-1 text-sm capitalize text-slate-500">{listing.listingStatus === "on_hold" ? "On hold" : listing.listingStatus} · {listing.createdAt.toLocaleDateString("en-GB")}</p></div>
                  <div className="flex flex-wrap items-center gap-2">
                    {listing.listingStatus === "published" && <Link href={listing.href} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-blue-700">View</Link>}
                    {!user.blockedAt && <Link href={`/my-listings/${listing.listingType}/${listing.id}/edit`} className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-black text-amber-800 hover:bg-amber-50">Edit</Link>}
                    {!user.blockedAt && <DeleteListingButton type={listing.listingType} id={listing.id} />}
                  </div>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><h3 className="text-2xl font-black text-[#0b1f3a]">No listings yet</h3><p className="mt-2 text-slate-600">Your verified listings will appear here.</p><Link href="/add-listing" className="mt-5 inline-block font-black text-blue-700">Create your first listing →</Link></div>
              )}
            </div>
          </section>

          <section id="saved-listings" className="scroll-mt-32 mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#0b1f3a]">Saved listings</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Listings you bookmarked for later.
                </p>
              </div>
              <span className="rounded-full bg-[#0b1f3a] px-3 py-1 text-xs font-black text-white">
                {savedListings.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {savedListings.length ? savedListings.map((listing) => (
                <article key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                    {listing.listingType}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-[#0b1f3a]">{listing.title}</h3>
                  <p className="mt-2 text-xs text-slate-500">
                    Saved {listing.createdAt.toLocaleDateString("en-GB")}
                  </p>
                  <Link href={listing.href} className="mt-4 inline-block font-black text-blue-700">
                    View listing →
                  </Link>
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <SaveListingButton
                      listingType={listing.listingType as SavedListingType}
                      listingSlug={listing.listingSlug}
                      initialSaved
                    />
                  </div>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center sm:col-span-2">
                  <h3 className="text-xl font-black text-[#0b1f3a]">No saved listings yet</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Use the Save listing button on any listing detail page.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section id="profile" className="scroll-mt-32 mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Personal information</p>
            <h2 className="mt-2 text-2xl font-black text-[#0b1f3a]">Profile details</h2>
            <p className="mb-6 mt-2 text-sm text-slate-600">Keep your contact and professional information up to date.</p>
            <ProfileForm profile={user} />
          </section>

          <section id="security" className="scroll-mt-32 mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="max-w-xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Account security</p>
              <h2 className="mt-2 text-2xl font-black text-[#0b1f3a]">Change password</h2>
              <p className="mb-5 mt-2 text-sm text-slate-600">Updating your password signs out other active sessions.</p>
              <ChangePasswordForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
