import { getBusinessOpportunityBySlug } from "@/services/business-opportunity-service";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function BusinessOpportunityDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getBusinessOpportunityBySlug(slug);
  if (!item) notFound();
  return <main className="min-h-screen bg-slate-50 px-4 py-10"><article className="mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-xl"><div className="grid gap-0 md:grid-cols-[42%_1fr]"><div className="relative min-h-80"><Image src={item.image} alt="" fill sizes="(min-width: 768px) 420px, 100vw" className="object-cover" /></div><div className="p-7 sm:p-10"><p className="text-sm font-black uppercase tracking-[.18em] text-amber-600">{item.section}</p><h1 className="mt-3 text-3xl font-black text-slate-950">{item.title}</h1><p className="mt-3 font-bold text-slate-500">{item.category} · {item.city}, {item.country}</p><p className="mt-6 text-2xl font-black text-emerald-700">{item.investment}</p><p className="mt-6 leading-7 text-slate-600">{item.description}</p><div className="mt-8 grid gap-3 sm:grid-cols-2"><a href={`mailto:${item.contact}`} className="rounded-full bg-slate-950 px-5 py-3 text-center font-bold text-white">Email contact</a><a href={`tel:${item.phone}`} className="rounded-full border border-slate-300 px-5 py-3 text-center font-bold">Call {item.phone}</a></div></div></div></article></main>;
}
