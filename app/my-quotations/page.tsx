import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withdrawQuotation } from "@/app/rfqs/quotation-actions";

export const dynamic = "force-dynamic";

export default async function MyQuotationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const quotations = await prisma.vendorQuotation.findMany({
    where: { supplierId: user.id },
    include: { rfq: { select: { id: true, reference: true, title: true, projectName: true, status: true, expirationDate: true, buyer: { select: { email: true, company: true, fullName: true } } } } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6"><div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wider text-amber-700">Supplier workspace</p><h1 className="mt-2 text-4xl font-black text-[#0b1f3a]">My Quotations</h1><p className="mt-2 text-slate-600">Track offers submitted to buyers and continue awarded conversations.</p></div><Link href="/rfqs" className="rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950">Browse RFQs</Link></div>
      <div className="mt-8 space-y-4">{quotations.map((quotation) => <article key={quotation.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase text-amber-700">{quotation.rfq.reference}</p><h2 className="mt-1 text-xl font-black text-[#0b1f3a]">{quotation.rfq.title}</h2><p className="mt-1 text-sm text-slate-500">Buyer: {quotation.rfq.buyer?.company ?? quotation.rfq.buyer?.fullName ?? quotation.rfq.buyer?.email ?? "Marketplace buyer"}</p><p className="mt-2 font-black text-emerald-700">{quotation.offerAmount}</p></div><div className="md:text-right"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{quotation.status.replace("_", " ")}</span><div className="mt-3 flex flex-wrap gap-2"><Link href={`/my-quotations/${quotation.id}`} className="rounded-lg bg-[#0b1f3a] px-4 py-2 text-sm font-black text-white">View</Link>{["draft", "submitted"].includes(quotation.status) && <Link href={`/rfqs/${quotation.rfq.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-blue-700">Edit</Link>}{["submitted", "under_review", "shortlisted"].includes(quotation.status) && <form action={withdrawQuotation.bind(null, quotation.id)}><button className="rounded-lg bg-red-50 px-4 py-2 text-sm font-black text-red-700">Withdraw</button></form>}</div></div></div></article>)}{!quotations.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><h2 className="text-xl font-black text-[#0b1f3a]">No quotations yet</h2><Link href="/rfqs" className="mt-3 inline-block font-black text-blue-700">Find an RFQ to quote →</Link></div>}</div>
    </div></main>
  );
}
