"use client";

import {
  saveProjectDraft,
  type ProjectDraftState,
} from "@/app/add-listing/project-actions";
import { ProjectMediaForm } from "@/components/listings/ProjectMediaForm";
import { useActionState, useState } from "react";

type Option = { slug: string; name: string };
type City = { slug: string; name: string; countryCode: string };

export function ProjectListingForm({
  projectTypes,
  countries,
  cities,
  onBack,
}: {
  projectTypes: Option[];
  countries: Array<{ code: string; name: string }>;
  cities: City[];
  onBack: () => void;
}) {
  const [country, setCountry] = useState("SA");
  const [state, action, pending] = useActionState(saveProjectDraft, {
    success: false,
    message: "",
  } satisfies ProjectDraftState);
  const matchingCities = cities.filter((city) => city.countryCode === country);
  const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

  if (state.success && state.projectId && state.editToken) {
    return <ProjectMediaForm projectId={state.projectId} editToken={state.editToken} />;
  }

  return (
    <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20">
      <Progress activeStep={2} />
      <div className="mx-auto mt-12 max-w-4xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step 2 of 4 · Projects & Tenders</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0b1f3a] sm:text-5xl">Project Details</h1>
        <p className="mt-4 text-lg text-slate-500">Describe the opportunity, requirements, location, value, and deadline.</p>
        <p className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Temporary sample data is included for testing and can be edited.</p>
      </div>

      <form action={action} className="mx-auto mt-10 max-w-5xl space-y-8">
        <Section title="Project information" description="The primary information displayed in project results.">
          <label className="sm:col-span-2"><b>Project or tender title *</b><input name="title" required maxLength={160} defaultValue="Riyadh Metro Extension Civil Works Package" className={field} /></label>
          <fieldset className="sm:col-span-2">
            <legend className="font-bold text-slate-800">Project types *</legend>
            <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {projectTypes.map((type) => <label key={type.slug} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="projectTypes" value={type.slug} defaultChecked={["infrastructure-projects", "government-tenders"].includes(type.slug)} className="size-4 accent-amber-500" />{type.name}</label>)}
            </div>
            {state.errors?.projectTypes && <p className="mt-2 text-sm font-bold text-red-600">{state.errors.projectTypes}</p>}
          </fieldset>
          <label><b>Status *</b><select name="status" defaultValue="Open Tender" required className={field}><option>Open Tender</option><option>Upcoming</option><option>Prequalification</option><option>Expression of Interest</option></select></label>
          <label><b>Tender type</b><select name="tenderType" defaultValue="Public Tender" className={field}><option>Public Tender</option><option>Private Tender</option><option>Invitation Only</option></select></label>
          <label><b>Client / authority *</b><input name="client" required defaultValue="Riyadh Infrastructure Development Authority" className={field} /></label>
          <label><b>Submission deadline *</b><input name="deadline" type="date" required defaultValue="2026-12-15" className={field} /></label>
          <label><b>Estimated budget</b><input name="budget" defaultValue="SAR 180–220 million" className={field} /></label>
          <label><b>Project value</b><input name="value" defaultValue="SAR 200 million" className={field} /></label>
        </Section>

        <Section title="Location & sector" description="Where the project will be delivered and the industries involved.">
          <label><b>Country *</b><select name="country" required value={country} onChange={(event) => setCountry(event.target.value)} className={field}>{countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
          <label><b>City *</b><select key={country} name="city" required defaultValue={country === "SA" ? "riyadh" : ""} className={field}><option value="">Select city</option>{matchingCities.map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}</select></label>
          <label className="sm:col-span-2"><b>Project location *</b><input name="location" required defaultValue="Northern Riyadh transport corridor, Riyadh" className={field} /></label>
          <label className="sm:col-span-2"><b>Sectors *</b><input name="sectors" required defaultValue="Transport, Infrastructure, Civil Engineering" className={field} /><span className="mt-1 block text-xs text-slate-500">Separate multiple sectors with commas.</span></label>
        </Section>

        <Section title="Scope & description" description="Give contractors enough information to assess the opportunity.">
          <label className="sm:col-span-2"><b>Short summary *</b><textarea name="summary" required minLength={30} maxLength={300} rows={3} defaultValue="Civil works package for a major metro extension including stations, utility diversions, roads, and associated public infrastructure." className={field} /></label>
          <label className="sm:col-span-2"><b>Detailed description *</b><textarea name="description" required minLength={100} maxLength={3000} rows={7} defaultValue="The authority invites qualified civil and infrastructure contractors to submit bids for the construction of the Riyadh Metro Extension Civil Works Package. The scope includes earthworks, reinforced concrete structures, station foundations, utility relocation, access roads, drainage, testing, commissioning support, and coordination with specialist rail-system contractors." className={field} /></label>
        </Section>

        {state.message && !state.success && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{state.message}</p>}
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <button type="button" onClick={onBack} className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700">← Back to listing types</button>
          <button disabled={pending} className="rounded-full bg-amber-400 px-7 py-3 font-black text-slate-950 disabled:opacity-60">{pending ? "Saving draft…" : "Save & Continue →"}</button>
        </div>
      </form>
    </section>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <fieldset className="rounded-3xl border border-slate-200 p-5 sm:p-7"><legend className="px-2 text-xl font-black text-[#0b1f3a]">{title}</legend><p className="mb-5 text-sm text-slate-500">{description}</p><div className="grid gap-5 sm:grid-cols-2">{children}</div></fieldset>;
}

export function Progress({ activeStep, complete = false }: { activeStep: number; complete?: boolean }) {
  return <ol aria-label="Add listing progress" className="relative mx-auto flex w-full max-w-6xl items-center justify-between"><div aria-hidden="true" className={`absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 ${complete ? "bg-amber-400" : "bg-slate-200"}`} />{[1, 2, 3, 4].map((step) => <li key={step} className={`relative z-10 grid size-11 place-items-center rounded-full border-4 text-lg font-black sm:size-14 ${step <= activeStep ? "border-amber-400 bg-amber-400 text-slate-950" : "border-slate-200 bg-white text-slate-500"}`}>{step < activeStep || complete ? "✓" : step}</li>)}</ol>;
}
