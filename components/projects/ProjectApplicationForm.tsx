"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitProjectApplication, type ProjectApplicationState } from "@/app/project-applications/actions";

const initial: ProjectApplicationState = { success: false, message: "" };
const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

type Existing = {
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  proposedRole: string;
  coverMessage: string;
  supportingDocumentUrl: string | null;
};

export function ProjectApplicationForm({
  projectSlug,
  email,
  defaults,
}: {
  projectSlug: string;
  email: string;
  defaults?: Existing | null;
}) {
  const [state, action, pending] = useActionState(submitProjectApplication, initial);
  const error = (name: string) => state.errors?.[name] ? <span className="mt-1 block text-xs font-bold text-red-600">{state.errors[name]}</span> : null;

  if (state.success && state.applicationId) {
    return <div className="rounded-2xl bg-emerald-50 p-6 text-center"><p className="font-black text-emerald-700">{state.message}</p><Link href={`/my-applications/${state.applicationId}`} className="mt-4 inline-block font-black text-blue-700 underline">View application</Link></div>;
  }
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="projectSlug" value={projectSlug} />
      <label className="text-sm font-bold text-slate-700">Company name<input name="companyName" required defaultValue={defaults?.companyName ?? ""} className={field} />{error("companyName")}</label>
      <label className="text-sm font-bold text-slate-700">Contact person<input name="contactPerson" required defaultValue={defaults?.contactPerson ?? ""} className={field} />{error("contactPerson")}</label>
      <label className="text-sm font-bold text-slate-700">Email<input name="contactEmail" type="email" required defaultValue={defaults?.contactEmail ?? email} className={field} />{error("contactEmail")}</label>
      <label className="text-sm font-bold text-slate-700">Phone<input name="contactPhone" type="tel" required defaultValue={defaults?.contactPhone ?? ""} className={field} />{error("contactPhone")}</label>
      <label className="text-sm font-bold text-slate-700 sm:col-span-2">Proposed role or service<input name="proposedRole" required defaultValue={defaults?.proposedRole ?? ""} placeholder="e.g. MEP subcontractor, steel supplier, project consultant" className={field} />{error("proposedRole")}</label>
      <label className="text-sm font-bold text-slate-700 sm:col-span-2">Cover message<textarea name="coverMessage" required minLength={30} maxLength={3000} rows={7} defaultValue={defaults?.coverMessage ?? ""} placeholder="Introduce your company, relevant experience, capacity, and interest in this opportunity." className={field} />{error("coverMessage")}</label>
      <label className="text-sm font-bold text-slate-700 sm:col-span-2">Supporting document URL <span className="font-normal text-slate-500">(optional)</span><input name="supportingDocumentUrl" type="url" defaultValue={defaults?.supportingDocumentUrl ?? ""} placeholder="https://…/company-profile.pdf" className={field} />{error("supportingDocumentUrl")}<span className="mt-1 block text-xs font-normal text-slate-500">Direct uploads will replace this field when storage credentials are available.</span></label>
      {state.message && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700 sm:col-span-2">{state.message}</p>}
      <button disabled={pending} className="rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950 disabled:opacity-60 sm:col-span-2 sm:w-fit">{pending ? "Submitting…" : defaults ? "Update application" : "Submit application"}</button>
    </form>
  );
}
