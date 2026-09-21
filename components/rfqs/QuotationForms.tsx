"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveQuotation,
  sendQuotationMessage,
  type QuotationActionState,
} from "@/app/rfqs/quotation-actions";
import { FileDropzone } from "@/components/uploads/FileDropzone";

const initial: QuotationActionState = { success: false, message: "" };
const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

type ExistingQuotation = {
  id: string;
  companyName: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  unitPrice: string | null;
  totalPrice: string | null;
  currency: string | null;
  deliveryLeadtime: string;
  warranty: string | null;
  paymentTerms: string | null;
  technicalSpecification: string;
  vendorNotes: string | null;
  pdfUrl: string | null;
  validUntil: string | null;
};

export function QuotationForm({
  rfqId,
  email,
  existing,
}: {
  rfqId: string;
  email: string;
  existing?: ExistingQuotation | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveQuotation, initial);
  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  const error = (name: string) => state.errors?.[name] ? <span className="mt-1 block text-xs font-bold text-red-600">{state.errors[name]}</span> : null;
  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="rfqId" value={rfqId} />
      {existing && <input type="hidden" name="id" value={existing.id} />}
      <label className="text-sm font-bold text-slate-700">Company name<input name="companyName" required defaultValue={existing?.companyName ?? ""} className={field} />{error("companyName")}</label>
      <label className="text-sm font-bold text-slate-700">Contact person<input name="contactPerson" required defaultValue={existing?.contactPerson ?? ""} className={field} />{error("contactPerson")}</label>
      <label className="text-sm font-bold text-slate-700">Email<input name="contactEmail" type="email" required defaultValue={existing?.contactEmail ?? email} className={field} />{error("contactEmail")}</label>
      <label className="text-sm font-bold text-slate-700">Phone<input name="contactPhone" type="tel" required defaultValue={existing?.contactPhone ?? ""} className={field} />{error("contactPhone")}</label>
      <label className="text-sm font-bold text-slate-700">Unit price<input name="unitPrice" required defaultValue={existing?.unitPrice ?? ""} placeholder="e.g. 125.00" className={field} />{error("unitPrice")}</label>
      <label className="text-sm font-bold text-slate-700">Total price<input name="totalPrice" required defaultValue={existing?.totalPrice ?? ""} placeholder="e.g. 625000.00" className={field} />{error("totalPrice")}</label>
      <label className="text-sm font-bold text-slate-700">Currency<select name="currency" required defaultValue={existing?.currency ?? "AED"} className={field}>{["AED", "SAR", "QAR", "KWD", "OMR", "BHD", "USD"].map((item) => <option key={item}>{item}</option>)}</select>{error("currency")}</label>
      <label className="text-sm font-bold text-slate-700">Delivery time<input name="deliveryLeadtime" required defaultValue={existing?.deliveryLeadtime ?? ""} placeholder="e.g. 14 days" className={field} />{error("deliveryLeadtime")}</label>
      <label className="text-sm font-bold text-slate-700">Warranty<input name="warranty" required defaultValue={existing?.warranty ?? ""} placeholder="e.g. 24 months" className={field} />{error("warranty")}</label>
      <label className="text-sm font-bold text-slate-700">Offer valid until<input name="validUntil" type="date" defaultValue={existing?.validUntil?.slice(0, 10) ?? ""} className={field} />{error("validUntil")}</label>
      <label className="text-sm font-bold text-slate-700 sm:col-span-2">Payment terms<input name="paymentTerms" required defaultValue={existing?.paymentTerms ?? ""} placeholder="e.g. 30% advance, balance on delivery" className={field} />{error("paymentTerms")}</label>
      <label className="text-sm font-bold text-slate-700 sm:col-span-2">Technical specification<textarea name="technicalSpecification" required minLength={20} rows={5} defaultValue={existing?.technicalSpecification ?? ""} className={field} />{error("technicalSpecification")}</label>
      <label className="text-sm font-bold text-slate-700 sm:col-span-2">Remarks<textarea name="vendorNotes" rows={3} defaultValue={existing?.vendorNotes ?? ""} className={field} /></label>
      <FileDropzone kind="document" name="pdfUrl" label="quotation PDF" initialUrls={existing?.pdfUrl ? [existing.pdfUrl] : []} />
      {state.message && <p role="status" className={`rounded-xl p-3 text-sm font-bold sm:col-span-2 ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button name="intent" value="draft" disabled={pending} className="rounded-xl border border-slate-300 px-5 py-3 font-black text-slate-700">Save draft</button>
        <button name="intent" value="submit" disabled={pending} className="rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950">{pending ? "Saving…" : existing ? "Update quotation" : "Submit quotation"}</button>
      </div>
    </form>
  );
}

export function QuotationMessageForm({ quotationId }: { quotationId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(sendQuotationMessage, initial);
  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);
  return (
    <form action={action} className="mt-5 space-y-3">
      <input type="hidden" name="quotationId" value={quotationId} />
      <textarea name="body" rows={3} maxLength={3000} placeholder="Write a message…" className={field} />
      <FileDropzone kind="document" name="attachmentUrl" label="message attachment" />
      {state.message && <p className={`text-sm font-bold ${state.success ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p>}
      <button disabled={pending} className="rounded-xl bg-[#0b1f3a] px-5 py-3 font-black text-white">{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
