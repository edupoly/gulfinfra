"use client";

import {
  saveContractorMedia,
  type ContractorMediaState,
} from "@/app/add-listing/actions";
import { ContractorReview } from "@/components/listings/ContractorReview";
import { DocumentDropzone } from "@/components/listings/DocumentDropzone";
import { ImageDropzone } from "@/components/listings/ImageDropzone";
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
        <p className="mx-auto mt-5 max-w-2xl rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">Upload images and supporting documents by dragging them into an upload area or choosing them from your device.</p>
      </div>

      <form action={formAction} className="mx-auto mt-10 max-w-5xl space-y-8">
        <input type="hidden" name="contractorId" value={contractorId} />
        <input type="hidden" name="editToken" value={editToken} />

        <MediaSection title="Company logo" description="Use a square, high-resolution logo on a white or transparent background.">
          <ImageDropzone draftKind="contractor" draftId={contractorId} editToken={editToken} name="logoUrl" label="Company logo" />
          {state.errors?.logoUrl && <span className="mt-1 block text-sm font-bold text-red-600">{state.errors.logoUrl}</span>}
        </MediaSection>

        <MediaSection title="Project gallery" description="Add up to six images showing completed projects, teams, or equipment.">
          <ImageDropzone draftKind="contractor" draftId={contractorId} editToken={editToken} name="galleryUrls" label="Project gallery images" maxFiles={6} />
          {state.errors?.galleryUrls && <p className="text-sm font-bold text-red-600">{state.errors.galleryUrls}</p>}
        </MediaSection>

        <MediaSection title="Supporting documents" description="Upload up to five trade licences, certifications, company profiles, or safety documents.">
          <DocumentDropzone draftKind="contractor" draftId={contractorId} editToken={editToken} defaultType="Company Profile" documentTypes={["Company Profile", "Trade Licence", "Certificate", "Insurance", "Other"]} />
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
