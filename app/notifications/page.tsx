import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const events = await prisma.quotationEvent.findMany({
    where: { quotation: { OR: [{ supplierId: user.id }, { rfq: { buyerId: user.id } }] } },
    include: { quotation: { select: { id: true, companyName: true, vendorName: true, rfq: { select: { reference: true, title: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6"><div className="mx-auto max-w-4xl">
      <p className="text-sm font-black uppercase tracking-wider text-amber-700">Account dashboard</p>
      <h1 className="mt-2 text-4xl font-black text-[#0b1f3a]">Notifications</h1>
      <p className="mt-2 text-slate-600">Recent quotation activity across your buyer and supplier workflows.</p>
      <div className="mt-8 space-y-3">{events.map((event) => <Link key={event.id} href={`/my-quotations/${event.quotation.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-400"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase text-amber-700">{event.quotation.rfq.reference} · {event.status.replace("_", " ")}</p><h2 className="mt-1 font-black text-[#0b1f3a]">{event.quotation.rfq.title}</h2><p className="mt-1 text-sm text-slate-600">{event.note ?? `${event.quotation.companyName ?? event.quotation.vendorName} quotation updated.`}</p></div><time className="shrink-0 text-xs text-slate-400">{event.createdAt.toLocaleDateString("en-GB")}</time></div></Link>)}{!events.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No RFQ notifications yet.</div>}</div>
    </div></main>
  );
}
