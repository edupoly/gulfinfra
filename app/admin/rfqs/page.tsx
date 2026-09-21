import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusUI";
import { prisma } from "@/lib/prisma";
import { moderateRfq } from "./actions";

export const metadata: Metadata = { title: "RFQ approvals" };
const statuses = ["pending", "on_hold", "rejected", "published", "closed", "awarded"];

export default async function AdminRfqsPage({ searchParams }: { searchParams: Promise<{ status?: string; message?: string; error?: string }> }) {
  const query = await searchParams;
  const status = statuses.includes(query.status || "") ? query.status! : "pending";
  const [rfqs, counts] = await Promise.all([
    prisma.rfq.findMany({
      where: { status },
      include: { buyer: { select: { fullName: true, company: true, email: true } }, _count: { select: { quotations: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.rfq.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = new Map(counts.map((item) => [item.status, item._count]));

  return <>
    <AdminPageHeader title="RFQ approvals" description="Review buyer RFQs before they become visible to suppliers." />
    {(query.message || query.error) && <p className={`mt-6 rounded-xl border px-4 py-3 text-sm font-bold ${query.error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{query.error || query.message}</p>}
    <nav className="mt-6 flex flex-wrap gap-2" aria-label="RFQ approval filters">
      {statuses.map((item) => <Link key={item} href={`/admin/rfqs?status=${item}`} className={`rounded-xl px-4 py-2 text-sm font-black capitalize ${status === item ? "bg-[#0b1f3a] text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{item === "published" ? "Open" : item.replace("_", " ")} ({count.get(item) ?? 0})</Link>)}
    </nav>
    <div className="mt-6 space-y-5">
      {rfqs.map((rfq) => <article key={rfq.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5">
          <div><p className="text-xs font-black uppercase tracking-wide text-amber-700">{rfq.reference} · {rfq.category}</p><h2 className="mt-1 text-xl font-black text-[#0b1f3a]">{rfq.title}</h2><p className="mt-1 text-sm text-slate-500">{rfq.projectName} · {rfq.city}, {rfq.country}</p></div><StatusBadge status={rfq.status} />
        </header>
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Buyer", rfq.buyer?.company || rfq.buyer?.fullName || rfq.buyer?.email || rfq.email], ["Quantity", `${rfq.quantity}${rfq.unit ? ` ${rfq.unit}` : ""}`], ["Required", rfq.deliveryDate?.toLocaleDateString("en-GB") || "Not specified"], ["Closes", rfq.expirationDate.toLocaleString("en-GB")]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><dt className="text-xs font-black uppercase text-slate-400">{label}</dt><dd className="mt-1 text-sm font-bold text-slate-800">{value}</dd></div>)}</dl>
            <div><h3 className="font-black text-[#0b1f3a]">Specifications</h3><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{rfq.specifications || rfq.description}</p></div>
            {rfq.notes && <div><h3 className="font-black text-[#0b1f3a]">Buyer notes</h3><p className="mt-2 text-sm text-slate-600">{rfq.notes}</p></div>}
            <DocumentLinks rfq={rfq} />
            {rfq.moderationNote && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black uppercase text-amber-800">Previous admin note</p><p className="mt-1 text-sm text-amber-900">{rfq.moderationNote}</p></div>}
          </div>
          {["pending", "on_hold", "rejected"].includes(rfq.status) ? <form action={moderateRfq} className="h-fit rounded-2xl border border-slate-200 p-4">
            <input type="hidden" name="id" value={rfq.id} />
            <label className="text-sm font-black text-[#0b1f3a]">Admin note<textarea name="note" rows={5} maxLength={1000} placeholder="Required for changes or rejection; optional for approval" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-amber-500" /></label>
            <p className="mt-2 text-xs text-slate-500">The buyer will see this note and receive an email update.</p>
            <div className="mt-4 grid gap-2"><button name="decision" value="approve" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white">Approve and open</button><button name="decision" value="changes" className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-black text-slate-950">Request changes</button><button name="decision" value="reject" className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white">Reject RFQ</button></div>
          </form> : <div className="h-fit rounded-xl bg-slate-50 p-4 text-sm text-slate-600">This RFQ is no longer awaiting moderation. It has {rfq._count.quotations} supplier quotation(s).</div>}
        </div>
      </article>)}
      {!rfqs.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><h2 className="text-xl font-black text-[#0b1f3a]">No {status.replace("_", " ")} RFQs</h2><p className="mt-2 text-sm text-slate-500">There is nothing in this queue right now.</p></div>}
    </div>
  </>;
}

function DocumentLinks({ rfq }: { rfq: { boqUrl: string | null; drawingsUrl: string | null; specificationDocumentUrl: string | null; otherDocumentUrls: string[] } }) {
  const links: Array<[string, string | null]> = [["BOQ", rfq.boqUrl], ["Drawings", rfq.drawingsUrl], ["Specification", rfq.specificationDocumentUrl], ...rfq.otherDocumentUrls.map((url, index) => [`Document ${index + 1}`, url] as [string, string])];
  return <div className="flex flex-wrap gap-2">{links.filter((item): item is [string, string] => Boolean(item[1])).map(([label, url]) => <a key={`${label}-${url}`} href={url} target="_blank" rel="noreferrer" className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">{label} ↗</a>)}</div>;
}
