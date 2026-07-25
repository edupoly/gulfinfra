"use client";

import { saveMaterialDraft, type MaterialDraftState } from "@/app/add-listing/material-actions";
import { MaterialMediaForm } from "@/components/listings/MaterialMediaForm";
import { Progress } from "@/components/listings/ProjectListingForm";
import { useActionState, useState } from "react";

export function MaterialListingForm({ constructionMaterialTypes, industrialMaterialTypes, countries, cities, onBack }: {
  constructionMaterialTypes: Array<{ slug: string; name: string }>;
  industrialMaterialTypes: Array<{ slug: string; name: string }>;
  countries: Array<{ code: string; name: string }>;
  cities: Array<{ slug: string; name: string; countryCode: string }>;
  onBack: () => void;
}) {
  const [group, setGroup] = useState("Construction Materials");
  const [country, setCountry] = useState("SA");
  const [state, action, pending] = useActionState(saveMaterialDraft, { success: false, message: "" } satisfies MaterialDraftState);
  const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
  const types = group === "Construction Materials" ? constructionMaterialTypes : industrialMaterialTypes;
  if (state.success && state.materialId && state.editToken) return <MaterialMediaForm materialId={state.materialId} editToken={state.editToken} />;

  return <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20"><Progress activeStep={2} />
    <div className="mx-auto mt-12 max-w-4xl text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step 2 of 4 · Materials</p><h1 className="mt-3 text-3xl font-black text-[#0b1f3a] sm:text-5xl">Material Listing Details</h1><p className="mt-4 text-lg text-slate-500">Create a construction or industrial material sale, supplier, or buyer listing.</p><p className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Temporary sample data is included for testing and can be edited.</p></div>
    <form action={action} className="mx-auto mt-10 max-w-5xl space-y-8">
      <Section title="Material classification" description="Choose the material group, type, and marketplace role.">
        <label className="sm:col-span-2"><b>Listing name *</b><input name="name" required defaultValue="CEM I Portland Cement — Bulk & Bagged" className={field} /></label>
        <label><b>Material group *</b><select name="materialGroup" value={group} onChange={(event) => setGroup(event.target.value)} className={field}><option>Construction Materials</option><option>Industrial Materials</option></select></label>
        <label><b>Material type *</b><select key={group} name="materialType" defaultValue={group === "Construction Materials" ? "cement-concrete" : "pipes-valves"} className={field}>{types.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label><b>Listing role *</b><select name="listingType" defaultValue="Supplier" className={field}><option>For Sale</option><option>Supplier</option><option>Buyer</option></select></label>
        <label><b>Supplier / buyer company *</b><input name="supplier" required defaultValue="Arabian Building Materials Company" className={field} /></label>
      </Section>
      <Section title="Commercial information" description="Pricing, quantity, availability, and delivery expectations.">
        <label><b>Price range / buying budget *</b><input name="priceRange" required defaultValue="SAR 180–220 / Ton" className={field} /></label>
        <label><b>Minimum order / required quantity *</b><input name="minimumOrder" required defaultValue="25 metric tons" className={field} /></label>
        <label><b>Availability *</b><input name="availability" required defaultValue="In stock" className={field} /></label>
        <label><b>Lead time *</b><input name="leadTime" required defaultValue="2–4 business days" className={field} /></label>
        <label className="sm:col-span-2"><b>Compliance and certifications *</b><input name="compliance" required defaultValue="SASO, ASTM C150, ISO 9001" className={field} /><span className="mt-1 block text-xs text-slate-500">Separate multiple standards with commas.</span></label>
      </Section>
      <Section title="Technical details" description="Describe the material and list its important properties.">
        <label className="sm:col-span-2"><b>Specifications *</b><textarea name="specifications" rows={5} required defaultValue={"Grade: CEM I 42.5 R\nPackaging: 50 kg bags or bulk tanker\nOrigin: Saudi Arabia\nCompressive Strength: ≥ 42.5 MPa"} className={field} /><span className="mt-1 block text-xs text-slate-500">Enter one specification per line as Label: Value.</span></label>
        <label className="sm:col-span-2"><b>Description *</b><textarea name="description" minLength={80} maxLength={2000} rows={6} required defaultValue="High-performance CEM I Portland cement supplied in bulk or 50 kg bags for structural concrete, precast production, infrastructure, and general construction. Consistent quality, batch certification, flexible delivery schedules, and volume pricing are available for GCC contractors." className={field} /></label>
      </Section>
      <Section title="Location & contact" description="Where the material is supplied or required and who clients should contact.">
        <label><b>Country *</b><select name="country" value={country} onChange={(event) => setCountry(event.target.value)} className={field}>{countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
        <label><b>City *</b><select key={country} name="city" defaultValue={country === "SA" ? "riyadh" : ""} className={field}><option value="">Select city</option>{cities.filter((city) => city.countryCode === country).map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}</select></label>
        <label><b>Phone *</b><input name="phone" required defaultValue="+966 11 555 0310" className={field} /></label>
        <label><b>WhatsApp</b><input name="whatsapp" defaultValue="+966 55 555 0310" className={field} /></label>
        <label className="sm:col-span-2"><b>Email</b><input name="email" type="email" defaultValue="sales@arabianmaterials.example" className={field} /></label>
      </Section>
      {state.message && !state.success && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{state.message}</p>}
      <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row"><button type="button" onClick={onBack} className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700">← Back to listing types</button><button disabled={pending} className="rounded-full bg-amber-400 px-7 py-3 font-black text-slate-950 disabled:opacity-60">{pending ? "Saving draft…" : "Save & Continue →"}</button></div>
    </form>
  </section>;
}
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <fieldset className="rounded-3xl border border-slate-200 p-5 sm:p-7"><legend className="px-2 text-xl font-black text-[#0b1f3a]">{title}</legend><p className="mb-5 text-sm text-slate-500">{description}</p><div className="grid gap-5 sm:grid-cols-2">{children}</div></fieldset>;
}
