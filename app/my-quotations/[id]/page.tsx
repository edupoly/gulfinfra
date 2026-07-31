import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuotationMessageForm } from "@/components/rfqs/QuotationForms";
import { updateQuotationStatus } from "@/app/rfqs/quotation-actions";

export const dynamic = "force-dynamic";

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const quotation = await prisma.vendorQuotation.findFirst({
    where: { id, OR: [{ supplierId: user.id }, { rfq: { buyerId: user.id } }] },
    include: { rfq: true, supplier: { select: { id: true, email: true, fullName: true, company: true } }, events: { orderBy: { createdAt: "asc" } }, messages: { include: { sender: { select: { id: true, fullName: true, email: true } } }, orderBy: { createdAt: "asc" } } },
  });
  if (!quotation) notFound();
  const isBuyer = quotation.rfq.buyerId === user.id;
  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6"><div className="mx-auto max-w-5xl">
      <Link href={isBuyer ? "/my-rfqs" : "/my-quotations"} className="font-bold text-blue-700">← Back to {isBuyer ? "My RFQs" : "My Quotations"}</Link>
      <article className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-black uppercase text-amber-700">{quotation.rfq.reference}</p><h1 className="mt-2 text-3xl font-black text-[#0b1f3a]">{quotation.rfq.title}</h1><p className="mt-2 text-slate-500">{quotation.companyName ?? quotation.vendorName} · {quotation.contactPerson ?? quotation.supplier?.fullName ?? quotation.supplier?.email}</p></div><span className="h-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase text-slate-700">{quotation.status.replace("_", " ")}</span></div>
        <dl className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Unit price", `${quotation.currency ?? ""} ${quotation.unitPrice ?? "Not specified"}`], ["Total", quotation.offerAmount], ["Delivery", quotation.deliveryLeadtime], ["Warranty", quotation.warranty ?? "Not specified"], ["Payment terms", quotation.paymentTerms ?? "Not specified"], ["Valid until", quotation.validUntil?.toLocaleDateString("en-GB") ?? "Not specified"]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-black uppercase text-slate-400">{label}</dt><dd className="mt-1 font-bold text-slate-800">{value}</dd></div>)}</dl>
        <section className="mt-7"><h2 className="text-xl font-black text-[#0b1f3a]">Technical offer</h2><p className="mt-2 whitespace-pre-line leading-7 text-slate-600">{quotation.technicalSpecification}</p>{quotation.pdfUrl && <a href={quotation.pdfUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-lg border border-slate-300 px-4 py-2 font-black text-blue-700">Download quotation PDF</a>}</section>
        {isBuyer && ["submitted", "under_review", "shortlisted"].includes(quotation.status) && <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5"><form action={updateQuotationStatus.bind(null, id, "under_review")}><button className="rounded-lg bg-blue-50 px-4 py-2 font-black text-blue-700">Under review</button></form><form action={updateQuotationStatus.bind(null, id, "shortlisted")}><button className="rounded-lg bg-blue-600 px-4 py-2 font-black text-white">Shortlist</button></form><form action={updateQuotationStatus.bind(null, id, "awarded")}><button className="rounded-lg bg-emerald-600 px-4 py-2 font-black text-white">Award supplier</button></form><form action={updateQuotationStatus.bind(null, id, "rejected")}><button className="rounded-lg bg-red-50 px-4 py-2 font-black text-red-700">Reject</button></form></div>}
        {quotation.status === "awarded" && <div className="mt-6 rounded-xl bg-emerald-50 p-5"><p className="font-black text-emerald-800">Congratulations — this quotation was awarded.</p><div className="mt-3 flex flex-wrap gap-2"><a href={`/api/award-letters/${quotation.id}`} className="inline-block rounded-lg bg-emerald-700 px-4 py-2 font-black text-white">Download award letter</a><a href={`https://wa.me/${(isBuyer ? quotation.contactPhone ?? "" : quotation.rfq.phone).replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-lg bg-white px-4 py-2 font-black text-emerald-700">WhatsApp {isBuyer ? "supplier" : "buyer"}</a><Link href="/contact" className="rounded-lg bg-white px-4 py-2 font-black text-emerald-700">Contact {isBuyer ? "supplier" : "buyer"}</Link></div></div>}
      </article>
      <section className="mt-7 grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-[#0b1f3a]">Status timeline</h2><ol className="mt-5 space-y-4">{quotation.events.map((event) => <li key={event.id} className="border-l-2 border-amber-400 pl-4"><p className="font-black capitalize text-slate-800">{event.status.replace("_", " ")}</p><p className="text-sm text-slate-500">{event.note}</p><time className="text-xs text-slate-400">{event.createdAt.toLocaleString("en-GB")}</time></li>)}{!quotation.events.length && <li className="text-sm text-slate-500">No timeline events recorded for this legacy quotation.</li>}</ol></div><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-[#0b1f3a]">Buyer–supplier messages</h2><div className="mt-5 max-h-80 space-y-3 overflow-y-auto">{quotation.messages.map((message) => <div key={message.id} className={`rounded-xl p-3 ${message.senderId === user.id ? "ml-8 bg-blue-50" : "mr-8 bg-slate-100"}`}><p className="text-xs font-black text-slate-500">{message.sender.fullName ?? message.sender.email}</p><p className="mt-1 text-sm text-slate-700">{message.body}</p>{message.attachmentUrl && <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-bold text-blue-700">Open attachment ↗</a>}<time className="mt-1 block text-[11px] text-slate-400">{message.createdAt.toLocaleString("en-GB")}</time></div>)}{!quotation.messages.length && <p className="text-sm text-slate-500">No messages yet.</p>}</div><QuotationMessageForm quotationId={quotation.id} /></div></section>
    </div></main>
  );
}
