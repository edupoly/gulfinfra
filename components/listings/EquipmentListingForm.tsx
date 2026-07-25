"use client";

import { saveEquipmentDraft, type EquipmentDraftState } from "@/app/add-listing/equipment-actions";
import { EquipmentMediaForm } from "@/components/listings/EquipmentMediaForm";
import { Progress } from "@/components/listings/ProjectListingForm";
import { useActionState, useState } from "react";

export function EquipmentListingForm({ equipmentTypes, countries, cities, onBack }: {
  equipmentTypes: Array<{ slug: string; name: string }>;
  countries: Array<{ code: string; name: string }>;
  cities: Array<{ slug: string; name: string; countryCode: string }>;
  onBack: () => void;
}) {
  const [country, setCountry] = useState("AE");
  const [state, action, pending] = useActionState(saveEquipmentDraft, { success: false, message: "" } satisfies EquipmentDraftState);
  const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
  if (state.success && state.equipmentId && state.editToken) return <EquipmentMediaForm equipmentId={state.equipmentId} editToken={state.editToken} />;

  return <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20">
    <Progress activeStep={2} />
    <div className="mx-auto mt-12 max-w-4xl text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step 2 of 4 · Equipment Marketplace</p><h1 className="mt-3 text-3xl font-black text-[#0b1f3a] sm:text-5xl">Equipment Details</h1><p className="mt-4 text-lg text-slate-500">Create a sale, rental, or wanted equipment listing.</p><p className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Temporary sample data is included for testing and can be edited.</p></div>
    <form action={action} className="mx-auto mt-10 max-w-5xl space-y-8">
      <Section title="Listing information" description="Choose the marketplace intent, equipment type, and condition.">
        <label className="sm:col-span-2"><b>Listing title *</b><input name="title" required defaultValue="2021 Caterpillar 320 Excavator – Low Hours" className={field} /></label>
        <label><b>Listing type *</b><select name="listingType" defaultValue="For Sale" className={field}><option>For Sale</option><option>For Rent</option><option>Wanted</option></select></label>
        <label><b>Equipment type *</b><select name="equipmentType" defaultValue="excavators" className={field}>{equipmentTypes.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label><b>Condition *</b><select name="condition" defaultValue="Excellent" className={field}><option>New</option><option>Excellent</option><option>Good</option><option>Used</option></select></label>
        <label><b>Availability *</b><input name="availability" required defaultValue="Available immediately" className={field} /></label>
      </Section>
      <Section title="Machine details" description="Identification, age, use, pricing, and technical specifications.">
        <label><b>Brand *</b><input name="brand" required defaultValue="Caterpillar" className={field} /></label>
        <label><b>Model *</b><input name="model" required defaultValue="320 GC" className={field} /></label>
        <label><b>Year *</b><input name="year" type="number" min="1950" max="2027" required defaultValue="2021" className={field} /></label>
        <label><b>Operating hours</b><input name="operatingHours" type="number" min="0" defaultValue="2840" className={field} /></label>
        <label><b>Price / rental rate / wanted budget *</b><input name="price" required defaultValue="AED 385,000" className={field} /></label>
        <label><b>Price note</b><input name="priceNote" defaultValue="Negotiable; inspection available" className={field} /></label>
        <label className="sm:col-span-2"><b>Specifications *</b><textarea name="specifications" rows={5} required defaultValue={"Engine: Cat C4.4\nOperating Weight: 21,900 kg\nBucket Capacity: 1.0 m³\nMaximum Digging Depth: 6.7 m"} className={field} /><span className="mt-1 block text-xs text-slate-500">Enter one specification per line as Label: Value.</span></label>
        <label className="sm:col-span-2"><b>Description *</b><textarea name="description" minLength={80} maxLength={2000} rows={6} required defaultValue="Well-maintained Caterpillar 320 GC excavator with low operating hours and a complete dealer service history. The machine is work-ready, has no major leaks, and includes a general-purpose bucket. Inspection and operational testing can be arranged in Dubai." className={field} /></label>
      </Section>
      <Section title="Location" description="Where the equipment is available or required.">
        <label><b>Country *</b><select name="country" value={country} onChange={(event) => setCountry(event.target.value)} className={field}>{countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
        <label><b>City *</b><select key={country} name="city" defaultValue={country === "AE" ? "dubai" : ""} className={field}><option value="">Select city</option>{cities.filter((city) => city.countryCode === country).map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}</select></label>
        <label className="sm:col-span-2"><b>Equipment location *</b><input name="location" required defaultValue="Dubai Industrial City, Dubai" className={field} /></label>
      </Section>
      <Section title="Seller / buyer contact" description="Contact information displayed with the listing.">
        <label><b>Name *</b><input name="sellerName" required defaultValue="Gulf Heavy Equipment Trading LLC" className={field} /></label>
        <label><b>Account type *</b><select name="sellerType" defaultValue="Equipment Dealer" className={field}><option>Equipment Dealer</option><option>Rental Company</option><option>Contractor</option><option>Private Owner</option><option>Buyer</option></select></label>
        <label><b>Phone *</b><input name="phone" required defaultValue="+971 4 555 0240" className={field} /></label>
        <label><b>WhatsApp</b><input name="whatsapp" defaultValue="+971 50 555 0240" className={field} /></label>
        <label className="sm:col-span-2"><b>Email</b><input name="email" type="email" defaultValue="sales@gulfheavy.example" className={field} /></label>
      </Section>
      {state.message && !state.success && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{state.message}</p>}
      <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row"><button type="button" onClick={onBack} className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700">← Back to listing types</button><button disabled={pending} className="rounded-full bg-amber-400 px-7 py-3 font-black text-slate-950 disabled:opacity-60">{pending ? "Saving draft…" : "Save & Continue →"}</button></div>
    </form>
  </section>;
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <fieldset className="rounded-3xl border border-slate-200 p-5 sm:p-7"><legend className="px-2 text-xl font-black text-[#0b1f3a]">{title}</legend><p className="mb-5 text-sm text-slate-500">{description}</p><div className="grid gap-5 sm:grid-cols-2">{children}</div></fieldset>;
}
