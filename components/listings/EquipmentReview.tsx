"use client";

import { publishEquipment, type EquipmentPublishState, type EquipmentReviewData } from "@/app/add-listing/equipment-actions";
import { Progress } from "@/components/listings/ProjectListingForm";
import Link from "next/link";
import { useActionState } from "react";
import { ListingPublishGate } from "@/components/auth/ListingPublishGate";

export function EquipmentReview({ equipmentId, editToken, review }: { equipmentId: string; editToken: string; review: EquipmentReviewData }) {
  const [state, action, pending] = useActionState(publishEquipment, { success: false, message: "" } satisfies EquipmentPublishState);
  if (state.success && state.slug) return <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20"><Progress activeStep={4} complete /><div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-12 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-600 text-3xl font-black text-white">✓</div><p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-emerald-700">Equipment published</p><h1 className="mt-3 text-3xl font-black text-[#0b1f3a] sm:text-4xl">Your marketplace listing is live</h1><p className="mt-4 text-lg text-slate-600">{state.message}</p><Link href={`/equipment-marketplace/${state.slug}`} className="mt-7 inline-flex rounded-full bg-[#0b1f3a] px-7 py-3 font-black text-white">View equipment listing →</Link></div></section>;

  return <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20"><Progress activeStep={4} /><div className="mx-auto mt-12 max-w-4xl text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step 4 of 4 · Review</p><h1 className="mt-3 text-3xl font-black text-[#0b1f3a] sm:text-5xl">Review Equipment Listing</h1><p className="mt-4 text-lg text-slate-500">Confirm the machine and contact details before publishing.</p></div>
    <div className="mx-auto mt-10 max-w-5xl space-y-6">
      <Section title="Listing"><Item label="Title" value={review.title} wide /><Item label="Equipment type" value={review.equipmentType} /><Item label="Listing type" value={review.listingType} /><Item label="Condition" value={review.condition} /><Item label="Availability" value={review.availability} /></Section>
      <Section title="Machine details"><Item label="Brand / model" value={`${review.brand} ${review.model}`} /><Item label="Year" value={String(review.year)} /><Item label="Operating hours" value={review.operatingHours === null ? "—" : review.operatingHours.toLocaleString()} /><Item label="Price / rate" value={review.price} /><Item label="Price note" value={review.priceNote ?? "—"} /><Item label="Location" value={`${review.location}, ${review.city}, ${review.country}`} wide /><Item label="Specifications" value={review.specifications.map((item) => `${item.label}: ${item.value}`).join(", ")} wide /><Item label="Description" value={review.description} wide /></Section>
      <Section title="Seller / buyer"><Item label="Name" value={review.sellerName} /><Item label="Account type" value={review.sellerType} /><Item label="Phone" value={review.phone} /><Item label="WhatsApp" value={review.whatsapp ?? "—"} /><Item label="Email" value={review.email ?? "—"} /></Section>
      <Section title="Media & documents"><Item label="Photos" value={String(review.images.length)} /><Item label="Documents" value={review.documents.length ? review.documents.map((item) => `${item.name} (${item.documentType})`).join(", ") : "None added"} wide /></Section>
      {state.message && !state.success && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{state.message}</p>}
      <ListingPublishGate email={review.email}><form action={action} className="flex justify-end"><input type="hidden" name="equipmentId" value={equipmentId} /><input type="hidden" name="editToken" value={editToken} /><button disabled={pending} className="rounded-full bg-amber-400 px-8 py-3.5 font-black text-slate-950 disabled:opacity-60">{pending ? "Saving & Publishing…" : "Save & Publish Equipment →"}</button></form></ListingPublishGate>
    </div>
  </section>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 p-5 sm:p-7"><h2 className="text-xl font-black text-[#0b1f3a]">{title}</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">{children}</dl></section>;
}
function Item({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "sm:col-span-2" : ""}><dt className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-800">{value}</dd></div>;
}
