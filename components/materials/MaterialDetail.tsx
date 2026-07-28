import Image from "next/image";
import Link from "next/link";
import type { MaterialProfile } from "@/lib/types";

export function MaterialDetail({ material }: { material: MaterialProfile }) {
  const id = `MAT-${material.slug
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0)}`;

  return (
    <div className="space-y-7 pb-8">
      <section className="relative left-1/2 w-dvw -translate-x-1/2 bg-gradient-to-br from-slate-950 to-slate-800 text-white shadow-xl">
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8">
          <Link
            href="/construction-materials"
            className="mb-8 inline-flex text-sm font-semibold text-slate-300 transition hover:text-amber-300"
          >
            ← Back to Materials
          </Link>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
            {material.materialGroup} · {material.materialType}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black !text-white sm:text-4xl">{material.name}</h1>
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black uppercase">
              {material.listingType}
            </span>
          </div>
          <p className="mt-3 text-slate-300">
            {material.supplier} · {material.city}, {material.country}
          </p>
        </div>
      </section>

      <section className="relative z-10 -mt-20 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Estimated price / rate", material.priceRange],
          ["Minimum order", material.minimumOrder],
          ["Availability", material.availability],
          ["Catalog ID", id],
        ].map(([label, value]) => (
          <div
            key={label}
            className="border-b border-slate-200 p-5 last:border-b-0 sm:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"
          >
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-7">
          {material.image && (
            <div className="relative h-80 overflow-hidden rounded-3xl">
              <Image
                src={material.image}
                alt={material.name}
                fill
                sizes="(max-width:1024px) 100vw, 65vw"
                className="object-cover"
              />
            </div>
          )}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Technical specifications</h2>
            <dl className="mt-5 grid gap-px overflow-hidden rounded-2xl border bg-slate-200 sm:grid-cols-2">
              {[
                ["Material category", material.materialType],
                ["Location", `${material.city}, ${material.country}`],
                ["Compliance", material.compliance.join(", ")],
                ["Lead time", material.leadTime],
                ["Price range", material.priceRange],
                ["Minimum order", material.minimumOrder],
                ...material.specifications.map((item) => [item.label, item.value]),
              ].map(([label, value]) => (
                <div key={label} className="bg-white p-4">
                  <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
                  <dd className="mt-1 font-bold text-slate-950">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Description</h2>
            <p className="mt-4 leading-7 text-slate-600">{material.description}</p>
            <h3 className="mt-6 text-lg font-black">Key highlights</h3>
            <ul className="mt-3 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-2">
              {[
                "Direct GCC sourcing",
                "Test certificates available",
                "Custom specifications on request",
                "Bulk supply enquiries welcome",
                material.leadTime,
                material.availability,
              ].map((highlight) => (
                <li key={highlight}>✓ {highlight}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          <section className="rounded-3xl bg-slate-950 p-6 text-white">
            <h2 className="text-xl font-black">
              Contact {material.listingType === "Buyer" ? "buyer" : "supplier"}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{material.supplier}</p>
            <a
              href={`tel:${material.phone.replace(/\s/g, "")}`}
              className="mt-5 block rounded-full bg-white px-4 py-3 text-center text-sm font-bold text-slate-950"
            >
              {material.phone}
            </a>
            <a
              href={`https://wa.me/${material.whatsapp.replace(/\D/g, "")}`}
              className="mt-3 block rounded-full bg-emerald-600 px-4 py-3 text-center text-sm font-bold"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${material.email}`}
              className="mt-3 block rounded-full bg-amber-400 px-4 py-3 text-center text-sm font-bold text-slate-950"
            >
              Send enquiry
            </a>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black">Supplier details</h2>
            <p className="mt-3 font-bold">{material.supplier}</p>
            <p className="text-sm text-slate-500">
              {material.verified ? "Verified marketplace member" : "Marketplace member"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {material.compliance.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
