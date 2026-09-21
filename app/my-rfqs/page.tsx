import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setRfqStatus } from "@/app/rfqs/actions";
import { updateQuotationStatus } from "@/app/rfqs/quotation-actions";

export const dynamic = "force-dynamic";

export default async function MyRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { q = "", status = "" } = await searchParams;
  const term = q.trim().slice(0, 100);
  const allowedStatuses = ["draft", "pending", "published", "on_hold", "rejected", "closed", "awarded", "cancelled"];
  const rfqs = await prisma.rfq.findMany({
    where: {
      buyerId: user.id,
      ...(allowedStatuses.includes(status) ? { status } : {}),
      ...(term ? { OR: [{ title: { contains: term, mode: "insensitive" } }, { projectName: { contains: term, mode: "insensitive" } }, { reference: { contains: term, mode: "insensitive" } }] } : {}),
    },
    include: { quotations: { include: { supplier: { select: { email: true } } }, orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wider text-amber-700">Buyer workspace</p><h1 className="mt-2 text-4xl font-black text-[#0b1f3a]">My RFQs</h1><p className="mt-2 text-slate-600">Manage requests you created and review supplier quotations.</p></div><Link href="/rfqs?create=1" className="rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950">＋ Post new RFQ</Link></div>
        <form className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px_auto]">
          <input name="q" defaultValue={term} placeholder="Search title, project or reference" className="rounded-xl border border-slate-300 px-4 py-3" />
          <select name="status" defaultValue={allowedStatuses.includes(status) ? status : ""} className="rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="">All statuses</option>{allowedStatuses.map((item) => <option key={item} value={item} className="capitalize">{item}</option>)}</select>
          <button className="rounded-xl bg-[#0b1f3a] px-5 py-3 font-black text-white">Filter</button>
        </form>
        <div className="mt-5 space-y-5">
          {rfqs.map((rfq) => (
            <article key={rfq.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase text-amber-700">{rfq.reference} · {rfq.category}</p><h2 className="mt-1 text-xl font-black text-[#0b1f3a]">{rfq.title}</h2><p className="mt-1 text-sm text-slate-500">{rfq.city}, {rfq.country} · closes {rfq.expirationDate.toLocaleDateString("en-GB")}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{rfq.status}</span></div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/rfqs/${rfq.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-blue-700">View</Link>
                {!["awarded", "cancelled"].includes(rfq.status) && <Link href={`/rfqs?edit=${rfq.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-700">Edit</Link>}
                {rfq.status === "draft" && <form action={setRfqStatus.bind(null, rfq.id, "published")}><button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white">Submit for approval</button></form>}
                {rfq.status === "published" && <form action={setRfqStatus.bind(null, rfq.id, "closed")}><button className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-black text-white">Close RFQ</button></form>}
              </div>
              {rfq.moderationNote && ["on_hold", "rejected"].includes(rfq.status) && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-amber-800">Admin feedback</p><p className="mt-1 text-sm text-amber-900">{rfq.moderationNote}</p>{rfq.status === "on_hold" && <p className="mt-2 text-xs font-bold text-amber-800">Edit the RFQ, make the requested changes, then submit it for approval again.</p>}</div>}
              <section className="mt-5 border-t border-slate-200 pt-5">
                <h3 className="font-black text-[#0b1f3a]">Quotations received ({rfq.quotations.length})</h3>
                <div className="mt-3 space-y-3">
                  {rfq.quotations.map((quotation) => <div key={quotation.id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-black text-slate-900">{quotation.companyName ?? quotation.vendorName}</p><p className="text-sm text-slate-500">{quotation.offerAmount} · {quotation.deliveryLeadtime} · {quotation.warranty ?? "Warranty not specified"}</p><p className="mt-1 text-xs capitalize text-slate-500">{quotation.status.replace("_", " ")}</p></div><div className="flex flex-wrap gap-2"><Link href={`/my-quotations/${quotation.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-blue-700">Details & chat</Link>{["submitted", "under_review", "shortlisted"].includes(quotation.status) && <><form action={updateQuotationStatus.bind(null, quotation.id, "shortlisted")}><button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white">Shortlist</button></form><form action={updateQuotationStatus.bind(null, quotation.id, "awarded")}><button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white">Award</button></form><form action={updateQuotationStatus.bind(null, quotation.id, "rejected")}><button className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700">Reject</button></form></>}</div></div>)}
                  {!rfq.quotations.length && <p className="text-sm text-slate-500">No supplier quotations received yet.</p>}
                </div>
              </section>
            </article>
          ))}
          {!rfqs.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><h2 className="text-xl font-black text-[#0b1f3a]">No RFQs yet</h2><Link href="/rfqs?create=1" className="mt-3 inline-block font-black text-blue-700">Create your first RFQ →</Link></div>}
        </div>
      </div>
    </main>
  );
}
