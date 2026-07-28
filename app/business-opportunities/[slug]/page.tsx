import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessOpportunityBySlug } from "@/services/business-opportunity-service";

export default async function BusinessOpportunityDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getBusinessOpportunityBySlug(slug);

  if (!item) {
    notFound();
  }

  const referenceId = `BUS-${item.slug
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0)}`;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-7 pb-8">
        <section className="relative left-1/2 w-dvw -translate-x-1/2 overflow-hidden bg-slate-950 text-white shadow-xl">
          <Image
            src={item.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/60" />
          <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8">
            <Link
              href="/business-opportunities"
              className="mb-8 inline-flex text-sm font-semibold text-slate-300 transition hover:text-amber-300"
            >
              ← Back to Business Opportunities
            </Link>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-300">
              {item.section} · {item.category}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="max-w-4xl text-3xl font-black !text-white sm:text-4xl">
                {item.title}
              </h1>
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase text-white">
                {item.featured ? "Featured" : "Active"}
              </span>
            </div>
            <p className="mt-3 text-slate-300">
              {item.city}, {item.country}
            </p>
          </div>
        </section>

        <section className="relative z-10 -mt-20 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Investment / budget", item.investment],
            ["Opportunity type", item.section],
            ["Posted", item.postedDate],
            ["Reference ID", referenceId],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-b border-slate-200 p-5 last:border-b-0 sm:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-80">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover"
              />
            </div>
            <div className="p-7 sm:p-9">
              <h2 className="text-2xl font-black text-slate-950">About this opportunity</h2>
              <p className="mt-4 leading-7 text-slate-600">{item.description}</p>
            </div>
          </article>

          <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-black">Contact the listing owner</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Request further information and arrange a confidential discussion.
            </p>
            <a
              href={`mailto:${item.contact}`}
              className="mt-5 block rounded-full bg-amber-400 px-5 py-3 text-center font-bold text-slate-950"
            >
              Email contact
            </a>
            <a
              href={`tel:${item.phone.replace(/\s/g, "")}`}
              className="mt-3 block rounded-full border border-white/20 px-5 py-3 text-center font-bold text-white"
            >
              Call {item.phone}
            </a>
            <a
              href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`}
              className="mt-3 block rounded-full bg-emerald-600 px-5 py-3 text-center font-bold text-white"
            >
              WhatsApp
            </a>
          </aside>
        </div>
      </div>
    </main>
  );
}
