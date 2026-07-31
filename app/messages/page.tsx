import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const conversations = await prisma.vendorQuotation.findMany({
    where: { OR: [{ supplierId: user.id }, { rfq: { buyerId: user.id } }], messages: { some: {} } },
    include: {
      rfq: { select: { reference: true, title: true, buyerId: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <main className="bg-slate-50 px-4 py-10 sm:px-6"><div className="mx-auto max-w-4xl">
      <p className="text-sm font-black uppercase tracking-wider text-amber-700">Account dashboard</p>
      <h1 className="mt-2 text-4xl font-black text-[#0b1f3a]">Messages</h1>
      <p className="mt-2 text-slate-600">Buyer–supplier conversations connected to RFQs and quotations.</p>
      <div className="mt-8 space-y-3">{conversations.map((conversation) => {
        const latest = conversation.messages[0];
        return <Link key={conversation.id} href={`/my-quotations/${conversation.id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-400"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase text-amber-700">{conversation.rfq.reference}</p><h2 className="mt-1 font-black text-[#0b1f3a]">{conversation.rfq.title}</h2><p className="mt-2 line-clamp-1 text-sm text-slate-600">{latest?.body}</p></div><time className="shrink-0 text-xs text-slate-400">{latest?.createdAt.toLocaleDateString("en-GB")}</time></div></Link>;
      })}{!conversations.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No RFQ conversations yet.</div>}</div>
    </div></main>
  );
}
