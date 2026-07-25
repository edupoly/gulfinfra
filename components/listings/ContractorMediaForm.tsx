"use client";

import {
  saveContractorMedia,
  type ContractorMediaState,
} from "@/app/add-listing/actions";
import { ContractorReview } from "@/components/listings/ContractorReview";
import { useActionState } from "react";

export function ContractorMediaForm({
  contractorId,
  editToken,
}: {
  contractorId: string;
  editToken: string;
}) {
  const initialState: ContractorMediaState = { success: false, message: "" };
  const [state, formAction, pending] = useActionState(
    saveContractorMedia,
    initialState,
  );
  const field =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

  if (state.success && state.review) {
    return (
      <ContractorReview
        contractorId={contractorId}
        editToken={editToken}
        review={state.review}
      />
    );
  }

  return (
    <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20">
      <Progress activeStep={3} />
      <div className="mx-auto mt-12 max-w-4xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step 3 of 4 · Contractors & Services</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0b1f3a] sm:text-5xl">Media & Documents</h1>
        <p className="mt-4 text-lg text-slate-500">Add visuals and supporting credentials to strengthen your contractor profile.</p>
        <p className="mx-auto mt-5 max-w-2xl rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          For now, enter hosted file links. Direct file uploads will be connected when cloud storage is configured.
        </p>
      </div>

      <form action={formAction} className="mx-auto mt-10 max-w-5xl space-y-8">
        <input type="hidden" name="contractorId" value={contractorId} />
        <input type="hidden" name="editToken" value={editToken} />

        <MediaSection title="Company logo" description="Use a square, high-resolution logo on a white or transparent background.">
          <label>
            <span className="font-bold text-slate-800">Logo URL</span>
            <input name="logoUrl" type="url" defaultValue="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" placeholder="https://..." className={field} />
            {state.errors?.logoUrl && <span className="mt-1 block text-sm font-bold text-red-600">{state.errors.logoUrl}</span>}
          </label>
        </MediaSection>

        <MediaSection title="Project gallery" description="Add up to six links showing completed projects, teams, or equipment.">
          {[1, 2, 3].map((item) => (
            <label key={item}>
              <span className="font-bold text-slate-800">Gallery image {item}</span>
              <input
                name="galleryUrls"
                type="url"
                defaultValue={item === 1 ? "https://images.unsplash.com/photo-1503387762-592deb58ef4e" : ""}
                placeholder="https://..."
                className={field}
              />
            </label>
          ))}
          {state.errors?.galleryUrls && <p className="text-sm font-bold text-red-600">{state.errors.galleryUrls}</p>}
        </MediaSection>

        <MediaSection title="Supporting documents" description="Link trade licences, certifications, company profiles, or safety documents.">
          {[1, 2].map((item) => (
            <div key={item} className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1fr_180px]">
              <label>
                <span className="font-bold text-slate-800">Document name</span>
                <input name="documentNames" defaultValue={item === 1 ? "Company Profile 2026" : ""} placeholder="e.g. ISO 9001 Certificate" className={field} />
              </label>
              <label>
                <span className="font-bold text-slate-800">Type</span>
                <select name="documentTypes" defaultValue={item === 1 ? "Company Profile" : "Certificate"} className={field}>
                  <option>Company Profile</option>
                  <option>Trade Licence</option>
                  <option>Certificate</option>
                  <option>Insurance</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="font-bold text-slate-800">Document URL</span>
                <input name="documentUrls" type="url" defaultValue={item === 1 ? "https://example.com/gulf-horizon-company-profile.pdf" : ""} placeholder="https://.../document.pdf" className={field} />
              </label>
            </div>
          ))}
          {state.errors?.documents && <p className="text-sm font-bold text-red-600">{state.errors.documents}</p>}
        </MediaSection>

        {state.message && (
          <p className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700" role="alert" aria-live="polite">{state.message}</p>
        )}

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <button type="submit" disabled={pending} className="rounded-full bg-amber-400 px-7 py-3 font-black text-slate-950 hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60">
            {pending ? "Saving Step 3…" : "Save & Continue to Review →"}
          </button>
        </div>
      </form>
    </section>
  );
}

function MediaSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <fieldset className="rounded-3xl border border-slate-200 p-5 sm:p-7"><legend className="px-2 text-xl font-black text-[#0b1f3a]">{title}</legend><p className="mb-5 text-sm text-slate-500">{description}</p><div className="grid gap-5">{children}</div></fieldset>;
}

function Progress({ activeStep }: { activeStep: number }) {
  return <ol aria-label="Add listing progress" className="relative mx-auto flex w-full max-w-6xl items-center justify-between">
    <div aria-hidden="true" className="absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 bg-slate-200" />
    {[1, 2, 3, 4].map((step) => <li key={step} aria-current={step === activeStep ? "step" : undefined} className={`relative z-10 grid size-11 place-items-center rounded-full border-4 text-lg font-black sm:size-14 ${step <= activeStep ? "border-amber-400 bg-amber-400 text-slate-950" : "border-slate-200 bg-white text-slate-500"}`}>{step < activeStep ? "✓" : step}</li>)}
  </ol>;
}
