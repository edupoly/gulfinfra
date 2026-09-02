"use client";

import {
  publishProject,
  type ProjectPublishState,
  type ProjectReviewData,
} from "@/app/add-listing/project-actions";
import { Progress } from "@/components/listings/ProjectListingForm";
import { useActionState } from "react";
import { ListingPublishGate } from "@/components/auth/ListingPublishGate";
import { ListingSubmissionSuccess } from "@/components/listings/ListingSubmissionSuccess";

export function ProjectReview({
  projectId,
  editToken,
  review,
}: {
  projectId: string;
  editToken: string;
  review: ProjectReviewData;
}) {
  const [state, action, pending] = useActionState(publishProject, {
    success: false,
    message: "",
  } satisfies ProjectPublishState);

  if (state.success && state.slug) {
    return <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20"><Progress activeStep={4} complete /><ListingSubmissionSuccess message={state.message} /></section>;
  }

  return <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20">
    <Progress activeStep={4} />
    <div className="mx-auto mt-12 max-w-4xl text-center"><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step 4 of 4 · Review</p><h1 className="mt-3 text-3xl font-black text-[#0b1f3a] sm:text-5xl">Review Project Listing</h1><p className="mt-4 text-lg text-slate-500">Confirm the opportunity details before publishing.</p></div>
    <div className="mx-auto mt-10 max-w-5xl space-y-6">
      <Section title="Project information"><Item label="Title" value={review.title} wide /><Item label="Project types" value={review.projectTypes.join(", ")} /><Item label="Status" value={review.status} /><Item label="Tender type" value={review.tenderType ?? "—"} /><Item label="Client / authority" value={review.client ?? "—"} /><Item label="Budget" value={review.budget ?? "—"} /><Item label="Value" value={review.value ?? "—"} /><Item label="Deadline" value={review.deadline ?? "—"} /></Section>
      <Section title="Location & scope"><Item label="Location" value={[review.location, review.city, review.country].filter(Boolean).join(", ")} wide /><Item label="Sectors" value={review.sectors.join(", ")} wide /><Item label="Summary" value={review.summary ?? "—"} wide /><Item label="Description" value={review.description ?? "—"} wide /></Section>
      <Section title="Media & documents"><Item label="Project images" value={String(review.imageUrls.length)} /><Item label="Documents" value={review.documents.length ? review.documents.map((item) => `${item.name} (${item.documentType})`).join(", ") : "None added"} wide /></Section>
      {state.message && !state.success && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{state.message}</p>}
      <ListingPublishGate><form action={action} className="flex justify-end"><input type="hidden" name="projectId" value={projectId} /><input type="hidden" name="editToken" value={editToken} /><button disabled={pending} className="rounded-full bg-amber-400 px-8 py-3.5 font-black text-slate-950 disabled:opacity-60">{pending ? "Saving & Publishing…" : "Save & Publish Project →"}</button></form></ListingPublishGate>
    </div>
  </section>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 p-5 sm:p-7"><h2 className="text-xl font-black text-[#0b1f3a]">{title}</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">{children}</dl></section>;
}

function Item({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "sm:col-span-2" : ""}><dt className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-800">{value}</dd></div>;
}
