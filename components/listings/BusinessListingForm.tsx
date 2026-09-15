"use client";

import { saveBusinessDraft, type BusinessDraftState } from "@/app/add-listing/business-actions";
import { BusinessMediaForm } from "@/components/listings/BusinessMediaForm";
import { Progress } from "@/components/listings/ProjectListingForm";
import { useActionState, useState } from "react";

export function BusinessListingForm({ countries, cities, businessCategories, onBack }: {
  countries: Array<{ code: string; name: string }>;
  cities: Array<{ slug: string; name: string; countryCode: string }>;
  businessCategories: Array<{ slug: string; name: string }>;
  onBack: () => void;
}) {
  const [country, setCountry] = useState("AE");
  const [state, action, pending] = useActionState(saveBusinessDraft, { success: false, message: "" } satisfies BusinessDraftState);
  const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
  if (state.success && state.opportunityId && state.editToken) return <BusinessMediaForm opportunityId={state.opportunityId} editToken={state.editToken} />;
  return <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20"><Progress activeStep={2} />
    <div className="mx-auto mt-12 max-w-4xl text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step 2 of 4 · Business Opportunities</p><h1 className="mt-3 text-3xl font-black text-[#0b1f3a] sm:text-5xl">Opportunity Details</h1><p className="mt-4 text-lg text-slate-500">List a business for sale, an acquisition requirement, or an investment partnership.</p><p className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Temporary sample data is included for testing and can be edited.</p></div>
    <form action={action} className="mx-auto mt-10 max-w-5xl space-y-8">
      <Section title="Opportunity information" description="The main information investors and business owners will see.">
        <label className="sm:col-span-2"><b>Opportunity title *</b><input name="title" required defaultValue="Profitable Construction Equipment Rental Business for Sale" className={field} /></label>
        <label><b>Opportunity type *</b><select name="section" defaultValue="Businesses for Sale" className={field}><option>Businesses for Sale</option><option>Businesses Wanted</option><option>Investment Opportunities</option></select></label>
        <label><b>Business category *</b><select name="category" required defaultValue="Equipment Rental Businesses" className={field}>{businessCategories.map((item) => <option key={item.slug} value={item.name}>{item.name}</option>)}</select></label>
        <label className="sm:col-span-2"><b>Asking price / budget / investment *</b><input name="investment" required defaultValue="AED 3,500,000" className={field} /></label>
        <label className="sm:col-span-2"><b>Opportunity description *</b><textarea name="description" minLength={100} maxLength={2500} rows={8} required defaultValue="Established construction equipment rental company serving contractors across Dubai and the Northern Emirates. The sale includes a maintained fleet of excavators, loaders, generators, active rental contracts, trained operators, workshop tools, customer records, and an experienced operations team. Detailed financial information is available to qualified buyers after signing a confidentiality agreement." className={field} /></label>
      </Section>
      <Section title="Location & contact" description="Where the opportunity is based and how interested parties can respond.">
        <label><b>Country *</b><select name="country" value={country} onChange={(event) => setCountry(event.target.value)} className={field}>{countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
        <label><b>City *</b><select key={country} name="city" defaultValue={country === "AE" ? "dubai" : ""} className={field}><option value="">Select city</option>{cities.filter((city) => city.countryCode === country).map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}</select></label>
        <label><b>Contact email *</b><input name="contact" type="email" required defaultValue="investments@gulfrental.example" className={field} /></label>
        <label><b>Phone *</b><input name="phone" required defaultValue="+971 4 555 0480" className={field} /></label>
        <label className="sm:col-span-2"><b>WhatsApp</b><input name="whatsapp" defaultValue="+971 50 555 0480" className={field} /></label>
      </Section>
      {state.message && !state.success && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{state.message}</p>}
      <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row"><button type="button" onClick={onBack} className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700">← Back to listing types</button><button disabled={pending} className="rounded-full bg-amber-400 px-7 py-3 font-black text-slate-950 disabled:opacity-60">{pending ? "Saving draft…" : "Save & Continue →"}</button></div>
    </form>
  </section>;
}
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <fieldset className="rounded-3xl border border-slate-200 p-5 sm:p-7"><legend className="px-2 text-xl font-black text-[#0b1f3a]">{title}</legend><p className="mb-5 text-sm text-slate-500">{description}</p><div className="grid gap-5 sm:grid-cols-2">{children}</div></fieldset>;
}
