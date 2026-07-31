import Image from "next/image";
import Link from "next/link";
import type { EquipmentProfile } from "@/lib/types";

const equipmentImages: Record<string, string> = {
  excavators:
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=85",
  cranes:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=85",
  forklifts:
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85",
  loaders:
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=85",
};

export function EquipmentDetail({ equipment, saveControl }: { equipment: EquipmentProfile; saveControl?: React.ReactNode }) {
  const heroImage =
    equipment.images[0] ??
    equipmentImages[equipment.equipmentTypeSlug] ??
    equipmentImages.excavators;
  const referenceId = `EQ-${equipment.slug
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0)
    .toString()
    .padStart(4, "0")}`;

  return (
    <div className="space-y-7 pb-8">
      <section className="relative left-1/2 w-dvw -translate-x-1/2 overflow-hidden bg-slate-950 text-white shadow-xl">
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28 lg:px-8">
          <Link
            href="/equipment-marketplace"
            className="mb-6 inline-flex text-sm font-semibold text-slate-300 transition hover:text-amber-300"
          >
            ← Back to Equipment Marketplace
          </Link>
          {saveControl && <div className="mb-6">{saveControl}</div>}
          <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-80 overflow-hidden bg-slate-800">
            <Image
              src={heroImage}
              alt={equipment.title}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
            <div className="absolute left-5 top-5 flex gap-2">
              <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                {equipment.listingType}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                {equipment.condition}
              </span>
            </div>
          </div>

          <div className="p-7 sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              {equipment.equipmentType}
            </p>
            <h1 className="mt-2 text-3xl font-black !text-white sm:text-4xl">{equipment.title}</h1>
            <p className="mt-3 text-slate-300">{equipment.location}</p>
            <div className="mt-7 border-t border-white/10 pt-6">
              <p className="text-3xl font-black text-amber-300">{equipment.price}</p>
              <p className="mt-1 text-sm text-slate-400">{equipment.priceNote}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{equipment.year}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{equipment.brand}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">{equipment.model}</span>
              {equipment.operatingHours !== null && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
                  {equipment.operatingHours.toLocaleString()} hours
                </span>
              )}
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-20 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Asking price / budget", equipment.price],
          ["Listing purpose", equipment.listingType],
          ["Authority status", equipment.verified ? "Verified listing" : "Standard listing"],
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
        <div className="space-y-7">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Equipment overview</h2>
            <p className="mt-4 leading-7 text-slate-600">{equipment.description}</p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Listing information</h2>
            <dl className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
              {[
                ["Equipment type", equipment.equipmentType],
                ["Location", `${equipment.city}, ${equipment.country}`],
                ["Brand", equipment.brand],
                ["Model", equipment.model],
                ["Year", String(equipment.year)],
                [
                  "Operating hours",
                  equipment.operatingHours === null
                    ? "Not specified"
                    : `${equipment.operatingHours.toLocaleString()} hours`,
                ],
                ["Transaction", equipment.listingType],
                ["Condition", equipment.condition],
                ["Availability", equipment.availability],
                ["Seller type", equipment.sellerType],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 bg-white p-4">
                  <dt className="text-sm font-semibold text-slate-500">{label}</dt>
                  <dd className="text-right text-sm font-bold text-slate-950">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Specifications</h2>
            <dl className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
              {equipment.specifications.map((specification) => (
                <div key={specification.label} className="bg-white p-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {specification.label}
                  </dt>
                  <dd className="mt-1 font-bold text-slate-950">{specification.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Key highlights</h2>
            <ul className="mt-5 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
              {[
                `${equipment.condition} condition`,
                equipment.verified ? "Verified marketplace listing" : "Marketplace listing",
                equipment.operatingHours === null
                  ? "Operating hours available on request"
                  : "Operating hours recorded",
                equipment.availability,
                "Direct seller or buyer contact",
                "Inspection can be arranged",
              ].map((highlight) => (
                <li key={highlight} className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-600" aria-hidden="true">✓</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-950">{equipment.sellerName}</h2>
              {equipment.verified && (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">{equipment.sellerType}</p>
          </div>

          <dl className="space-y-3 border-y border-slate-100 py-5 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Availability</dt>
              <dd className="font-bold text-slate-950">{equipment.availability}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Listing purpose</dt>
              <dd className="font-bold text-slate-950">{equipment.listingType}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Condition</dt>
              <dd className="font-bold text-slate-950">{equipment.condition}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Posted</dt>
              <dd className="font-bold text-slate-950">{equipment.posted}</dd>
            </div>
          </dl>

          <Link
            href="/contact"
            className="block rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white"
          >
            Call {equipment.phone}
          </Link>
          {equipment.whatsapp && (
            <a
              href={`https://wa.me/${equipment.whatsapp.replace(/\D/g, "")}`}
              className="block rounded-full bg-emerald-600 px-5 py-3 text-center text-sm font-bold text-white"
            >
              Contact on WhatsApp
            </a>
          )}
          {equipment.email && (
            <Link
              href="/contact"
              className="block rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-bold text-slate-800"
            >
              Send enquiry
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
