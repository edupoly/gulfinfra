import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuotationForm } from "@/components/rfqs/QuotationForms";

export const dynamic = "force-dynamic";

export default async function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [rfq, user] = await Promise.all([
    prisma.rfq.findUnique({ where: { id }, include: { _count: { select: { quotations: true } } } }),
    getCurrentUser(),
  ]);
  if (!rfq || (rfq.status !== "published" && rfq.buyerId !== user?.id)) notFound();
  const existing = user ? await prisma.vendorQuotation.findFirst({ where: { rfqId: id, supplierId: user.id } }) : null;
  const accepting = rfq.status === "published" && rfq.expirationDate > new Date();
  const documents = [["BOQ", rfq.boqUrl], ["Drawings", rfq.drawingsUrl], ["Specifications", rfq.specificationDocumentUrl]] as const;

  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/rfqs" className="font-bold text-blue-700">← RFQ marketplace</Link>
        <article className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm font-black uppercase tracking-wider text-amber-700">{rfq.reference} · {rfq.category}</p><h1 className="mt-2 text-3xl font-black text-[#0b1f3a]">{rfq.title}</h1><p className="mt-2 font-bold text-slate-500">{rfq.projectName} · {rfq.city}, {rfq.country}</p></div>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-black uppercase text-emerald-700">{rfq.status}</span>
          </div>
          <dl className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[["Quantity", `${rfq.quantity}${rfq.unit ? ` ${rfq.unit}` : ""}`], ["Budget", rfq.budget ?? "On request"], ["Delivery", rfq.deliveryDate?.toLocaleDateString("en-GB") ?? "Not specified"], ["Closing", rfq.expirationDate.toLocaleDateString("en-GB")]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-black uppercase text-slate-400">{label}</dt><dd className="mt-1 font-bold text-slate-800">{value}</dd></div>)}
          </dl>
          <section className="mt-7"><h2 className="text-xl font-black text-[#0b1f3a]">Specifications</h2><p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{rfq.specifications ?? rfq.description}</p></section>
          <section className="mt-7"><h2 className="text-xl font-black text-[#0b1f3a]">Documents</h2><div className="mt-3 flex flex-wrap gap-3">{documents.filter(([, url]) => url).map(([label, url]) => <a key={label} href={url!} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black text-blue-700">Download {label}</a>)}{rfq.otherDocumentUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black text-blue-700">Other document {index + 1}</a>)}</div></section>
        </article>

        <section id="submit-quotation" className="mt-8 scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <h2 className="text-2xl font-black text-[#0b1f3a]">{rfq.buyerId === user?.id ? "Your RFQ" : existing ? "Your quotation" : "Submit quotation"}</h2>
          {rfq.buyerId === user?.id ? <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="font-bold text-[#0b1f3a]">Buyers cannot submit quotations to their own requests.</p><p className="mt-1 text-sm text-slate-600">You can review and manage quotations received from suppliers in My RFQs.</p><Link href="/my-rfqs" className="mt-4 inline-block rounded-xl bg-[#0b1f3a] px-5 py-3 font-black text-white">View received quotations →</Link></div>
            : !user ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-bold text-[#0b1f3a]">Sign in to submit your quotation</p><p className="mt-1 text-sm text-slate-600">After signing in, you will return directly to this RFQ and the quotation form will be ready.</p><Link href={`/login?returnTo=${encodeURIComponent(`/rfqs/${rfq.id}#submit-quotation`)}`} className="mt-4 inline-block rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950">Sign in and continue →</Link></div>
              : existing && !["draft", "submitted"].includes(existing.status) ? <p className="mt-3 font-bold capitalize text-slate-600">Your quotation is {existing.status.replace("_", " ")}. View its timeline in <Link href={`/my-quotations/${existing.id}`} className="text-blue-700">My Quotations</Link>.</p>
                : accepting ? <div className="mt-6"><QuotationForm rfqId={rfq.id} email={user.email} existing={existing ? { ...existing, validUntil: existing.validUntil?.toISOString() ?? null } : null} /></div>
                  : <p className="mt-3 font-bold text-red-700">This RFQ is no longer accepting quotations.</p>}
        </section>
      </div>
    </main>
  );
}
