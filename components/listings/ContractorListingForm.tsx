"use client";

import {
  saveContractorDraft,
  type ContractorDraftState,
} from "@/app/add-listing/actions";
import { ContractorMediaForm } from "@/components/listings/ContractorMediaForm";
import { useActionState, useState } from "react";

type Option = { slug: string; name: string };
type City = { slug: string; name: string; countryCode: string };

export function ContractorListingForm({
  contractorTypes,
  countries,
  cities,
  onBack,
}: {
  contractorTypes: Option[];
  countries: Array<{ code: string; name: string }>;
  cities: City[];
  onBack: () => void;
}) {
  const [country, setCountry] = useState("AE");
  const initialState: ContractorDraftState = { success: false, message: "" };
  const [state, formAction, pending] = useActionState(
    saveContractorDraft,
    initialState,
  );
  const matchingCities = cities.filter((city) => city.countryCode === country);
  const field =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

  if (state.success) {
    return state.contractorId && state.editToken ? (
      <ContractorMediaForm
        contractorId={state.contractorId}
        editToken={state.editToken}
      />
    ) : null;
  }

  return (
    <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20">
      <Progress activeStep={2} />

      <div className="mx-auto mt-12 max-w-4xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">
          Step 2 of 4 · Contractors & Services
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0b1f3a] sm:text-5xl">
          Contractor Profile Details
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          Tell project owners about your company, capabilities, and service coverage.
        </p>
        <p className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Temporary sample data has been added for testing. You can edit any value before saving.
        </p>
      </div>

      <form
        className="mx-auto mt-10 max-w-5xl space-y-8"
        action={formAction}
      >
        <FormSection title="Company information" description="Core details shown on your contractor profile.">
          <label className="sm:col-span-2">
            <span className="font-bold text-slate-800">Company name *</span>
            <input name="name" required maxLength={120} defaultValue="Gulf Horizon Contracting LLC" placeholder="e.g. Gulf Infrastructure Contracting LLC" className={field} />
          </label>
          <label>
            <span className="font-bold text-slate-800">Company type *</span>
            <select name="companyType" required defaultValue="Limited Liability Company (LLC)" className={field}>
              <option value="">Select company type</option>
              <option>Limited Liability Company (LLC)</option>
              <option>Sole Establishment</option>
              <option>Partnership</option>
              <option>Public Company</option>
              <option>Branch Office</option>
            </select>
          </label>
          <label>
            <span className="font-bold text-slate-800">Year established *</span>
            <input name="yearEstablished" type="number" required min="1900" max="2026" defaultValue="2012" placeholder="2012" className={field} />
          </label>
          <label>
            <span className="font-bold text-slate-800">Number of employees</span>
            <select name="employees" defaultValue="51 - 150" className={field}>
              <option value="">Select company size</option>
              <option>1 - 10</option><option>11 - 50</option><option>51 - 150</option>
              <option>151 - 300</option><option>301 - 500</option><option>500+</option>
            </select>
          </label>
          <label>
            <span className="font-bold text-slate-800">Trade licence number</span>
            <input name="license" defaultValue="CN-7845123" placeholder="e.g. CN-1234567" className={field} />
          </label>
        </FormSection>

        <FormSection title="Contractor specializations" description="Choose every category that accurately represents your work.">
          <fieldset className="sm:col-span-2">
            <legend className="font-bold text-slate-800">Contractor types *</legend>
            <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {contractorTypes.map((type) => (
                <label key={type.slug} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    name="contractorTypes"
                    value={type.slug}
                    defaultChecked={["civil-contractors", "infrastructure-contractors"].includes(type.slug)}
                    className="size-4 accent-amber-500"
                  />
                  {type.name}
                </label>
              ))}
            </div>
            <p className={`mt-2 text-xs ${state.errors?.contractorTypes ? "font-bold text-red-600" : "text-slate-500"}`}>
              {state.errors?.contractorTypes ?? "Select at least one specialization."}
            </p>
          </fieldset>
          <label className="sm:col-span-2">
            <span className="font-bold text-slate-800">Services offered *</span>
            <textarea name="services" required rows={3} defaultValue="Civil works, structural concrete, road construction, project management" placeholder="e.g. Civil works, structural concrete, road construction, project management" className={field} />
            <span className="mt-1 block text-xs text-slate-500">Separate multiple services with commas.</span>
          </label>
        </FormSection>

        <FormSection title="Location and coverage" description="Where your company is based and where you accept projects.">
          <label>
            <span className="font-bold text-slate-800">Head-office country *</span>
            <select name="country" required value={country} onChange={(event) => setCountry(event.target.value)} className={field}>
              <option value="">Select country</option>
              {countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span className="font-bold text-slate-800">City *</span>
            <select key={country} name="city" required disabled={!country} defaultValue={country === "AE" ? "dubai" : ""} className={field}>
              <option value="">Select city</option>
              {matchingCities.map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="font-bold text-slate-800">Office address *</span>
            <input name="address" required defaultValue="Office 407, Horizon Tower, Business Bay, Dubai" placeholder="Building, street, industrial area, city" className={field} />
          </label>
          <label className="sm:col-span-2">
            <span className="font-bold text-slate-800">Areas served</span>
            <input name="areasServed" defaultValue="Dubai, Abu Dhabi, Sharjah" placeholder="e.g. Dubai, Abu Dhabi, Riyadh, Doha" className={field} />
          </label>
        </FormSection>

        <FormSection title="Contact details" description="How clients can reach your business.">
          <label><span className="font-bold text-slate-800">Business email *</span><input name="email" type="email" required defaultValue="projects@gulfhorizon.example" className={field} /></label>
          <label><span className="font-bold text-slate-800">Phone *</span><input name="phone" type="tel" required defaultValue="+971 4 555 0182" placeholder="+971..." className={field} /></label>
          <label><span className="font-bold text-slate-800">WhatsApp</span><input name="whatsapp" type="tel" defaultValue="+971 50 555 0182" placeholder="+971..." className={field} /></label>
          <label><span className="font-bold text-slate-800">Website</span><input name="website" type="url" defaultValue="https://gulfhorizon.example" placeholder="https://..." className={field} /></label>
        </FormSection>

        <FormSection title="Company profile" description="Help clients understand your experience and strengths.">
          <label className="sm:col-span-2">
            <span className="font-bold text-slate-800">Company description *</span>
            <textarea name="description" required minLength={80} maxLength={1500} rows={6} defaultValue="Gulf Horizon Contracting LLC delivers civil and infrastructure projects across the UAE. Our experienced engineering teams specialize in structural concrete, roads, utilities, and complete project management for commercial and public-sector clients." placeholder="Describe your experience, key capabilities, typical project sizes, certifications, and competitive strengths." className={field} />
          </label>
          <label>
            <span className="font-bold text-slate-800">Projects completed</span>
            <input name="projectsCompleted" type="number" min="0" defaultValue="86" placeholder="125" className={field} />
          </label>
          <label>
            <span className="font-bold text-slate-800">Typical response time</span>
            <select name="responseTime" defaultValue="Within 8 hours" className={field}>
              <option>Within 2 hours</option><option>Within 8 hours</option>
              <option>Within 24 hours</option><option>Within 2 business days</option>
            </select>
          </label>
        </FormSection>

        {state.message && !state.success && (
          <p className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700" role="alert" aria-live="polite">
            {state.message}
          </p>
        )}

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <button type="button" onClick={onBack} className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700">
            ← Back to listing types
          </button>
          <button type="submit" disabled={pending} className="rounded-full bg-amber-400 px-7 py-3 font-black text-slate-950 hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60">
            {pending ? "Saving draft…" : "Save & Continue →"}
          </button>
        </div>
      </form>
    </section>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <fieldset className="rounded-3xl border border-slate-200 p-5 sm:p-7"><legend className="px-2 text-xl font-black text-[#0b1f3a]">{title}</legend><p className="mb-5 text-sm text-slate-500">{description}</p><div className="grid gap-5 sm:grid-cols-2">{children}</div></fieldset>;
}

function Progress({ activeStep }: { activeStep: number }) {
  return <ol aria-label="Add listing progress" className="relative mx-auto flex w-full max-w-6xl items-center justify-between">
    <div aria-hidden="true" className="absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 bg-slate-200" />
    {[1, 2, 3, 4].map((step) => <li key={step} aria-current={step === activeStep ? "step" : undefined}
      className={`relative z-10 grid size-11 place-items-center rounded-full border-4 text-lg font-black sm:size-14 ${step <= activeStep ? "border-amber-400 bg-amber-400 text-slate-950" : "border-slate-200 bg-white text-slate-500"}`}>{step < activeStep ? "✓" : step}</li>)}
  </ol>;
}
