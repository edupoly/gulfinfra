"use client";

import { saveProjectMedia, type ProjectMediaState } from "@/app/add-listing/project-actions";
import { ProjectReview } from "@/components/listings/ProjectReview";
import { DocumentDropzone } from "@/components/listings/DocumentDropzone";
import { ImageDropzone } from "@/components/listings/ImageDropzone";
import { Progress } from "@/components/listings/ProjectListingForm";
import { useActionState } from "react";

export function ProjectMediaForm({ projectId, editToken }: { projectId: string; editToken: string }) {
  const [state, action, pending] = useActionState(saveProjectMedia, { success: false, message: "" } satisfies ProjectMediaState);
  if (state.success && state.review) return <ProjectReview projectId={projectId} editToken={editToken} review={state.review} />;

  return <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20">
    <Progress activeStep={3} />
    <div className="mx-auto mt-12 max-w-4xl text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step 3 of 4 · Projects & Tenders</p><h1 className="mt-3 text-3xl font-black text-[#0b1f3a] sm:text-5xl">Media & Tender Documents</h1><p className="mt-4 text-lg text-slate-500">Add project visuals, tender documents, drawings, and scope files.</p><p className="mx-auto mt-5 max-w-2xl rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">Drag and drop images and tender documents, or choose files from your device.</p></div>
    <form action={action} className="mx-auto mt-10 max-w-5xl space-y-8">
      <input type="hidden" name="projectId" value={projectId} /><input type="hidden" name="editToken" value={editToken} />
      <Box title="Project images" description="Add up to six project renderings, site images, or plans.">
        <ImageDropzone draftKind="project" draftId={projectId} editToken={editToken} name="imageUrls" label="Project images" maxFiles={6} />
        {state.errors?.images && <p className="font-bold text-red-600">{state.errors.images}</p>}
      </Box>
      <Box title="Tender documents" description="Upload up to five documents.">
        <DocumentDropzone draftKind="project" draftId={projectId} editToken={editToken} defaultType="Tender Document" documentTypes={["Tender Document", "Drawing", "Bill of Quantities", "Specification", "Other"]} />
        {state.errors?.documents && <p className="font-bold text-red-600">{state.errors.documents}</p>}
      </Box>
      {state.message && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{state.message}</p>}
      <div className="flex justify-end border-t border-slate-200 pt-6"><button disabled={pending} className="rounded-full bg-amber-400 px-7 py-3 font-black text-slate-950 disabled:opacity-60">{pending ? "Saving Step 3…" : "Save & Continue to Review →"}</button></div>
    </form>
  </section>;
}

function Box({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <fieldset className="rounded-3xl border border-slate-200 p-5 sm:p-7"><legend className="px-2 text-xl font-black text-[#0b1f3a]">{title}</legend><p className="mb-5 text-sm text-slate-500">{description}</p><div className="grid gap-5">{children}</div></fieldset>;
}
