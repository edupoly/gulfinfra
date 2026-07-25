"use client";

import { saveBusinessMedia, type BusinessMediaState } from "@/app/add-listing/business-actions";
import { BusinessReview } from "@/components/listings/BusinessReview";
import { Progress } from "@/components/listings/ProjectListingForm";
import { useActionState } from "react";

export function BusinessMediaForm({ opportunityId, editToken }: { opportunityId: string; editToken: string }) {
  const [state, action, pending] = useActionState(saveBusinessMedia, { success: false, message: "" } satisfies BusinessMediaState);
  const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
  if (state.success && state.review) return <BusinessReview opportunityId={opportunityId} editToken={editToken} review={state.review} />;
  return <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20"><Progress activeStep={3} /><div className="mx-auto mt-12 max-w-4xl text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step 3 of 4 · Business Opportunities</p><h1 className="mt-3 text-3xl font-black text-[#0b1f3a] sm:text-5xl">Images & Business Documents</h1><p className="mt-4 text-lg text-slate-500">Add business photos and non-confidential supporting documents.</p><p className="mx-auto mt-5 max-w-2xl rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">Hosted file links are used until cloud storage is configured. Do not add confidential records.</p></div>
    <form action={action} className="mx-auto mt-10 max-w-5xl space-y-8"><input type="hidden" name="opportunityId" value={opportunityId} /><input type="hidden" name="editToken" value={editToken} />
      <Box title="Opportunity images" description="Add a cover image and up to six additional business or facility images."><label><b>Cover image URL *</b><input name="image" type="url" defaultValue="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122" className={field} /></label>{[1,2,3].map((item) => <label key={item}><b>Gallery image {item}</b><input name="galleryImages" type="url" defaultValue={item === 1 ? "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" : ""} className={field} /></label>)}{state.errors?.image && <p className="font-bold text-red-600">{state.errors.image}</p>}{state.errors?.gallery && <p className="font-bold text-red-600">{state.errors.gallery}</p>}</Box>
      <Box title="Supporting documents" description="Add brochures, investment teasers, asset lists, or franchise profiles.">{[1,2].map((item) => <div key={item} className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1fr_190px]"><label><b>Document name</b><input name="documentNames" defaultValue={item === 1 ? "Business Investment Teaser" : ""} className={field} /></label><label><b>Type</b><select name="documentTypes" defaultValue="Investment Teaser" className={field}><option>Investment Teaser</option><option>Business Profile</option><option>Asset List</option><option>Franchise Profile</option><option>Other</option></select></label><label className="sm:col-span-2"><b>Document URL</b><input name="documentUrls" type="url" defaultValue={item === 1 ? "https://example.com/gulf-rental-investment-teaser.pdf" : ""} className={field} /></label></div>)}{state.errors?.documents && <p className="font-bold text-red-600">{state.errors.documents}</p>}</Box>
      {state.message && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{state.message}</p>}<div className="flex justify-end border-t border-slate-200 pt-6"><button disabled={pending} className="rounded-full bg-amber-400 px-7 py-3 font-black text-slate-950 disabled:opacity-60">{pending ? "Saving Step 3…" : "Save & Continue to Review →"}</button></div>
    </form>
  </section>;
}
function Box({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <fieldset className="rounded-3xl border border-slate-200 p-5 sm:p-7"><legend className="px-2 text-xl font-black text-[#0b1f3a]">{title}</legend><p className="mb-5 text-sm text-slate-500">{description}</p><div className="grid gap-5">{children}</div></fieldset>;
}
