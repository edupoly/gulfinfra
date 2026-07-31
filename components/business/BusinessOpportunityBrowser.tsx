"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import type { BusinessOpportunity } from "@/lib/types";

const sections = ["Businesses for Sale", "Businesses Wanted", "Investment Opportunities"];
const categories = ["Restaurants", "Cafes", "Workshops", "Factories", "Trading Companies", "Car Washes", "Retail Shops", "Franchise Businesses"];

export function BusinessOpportunityBrowser({ opportunities, initialSearch, savedSlugs }: { opportunities: BusinessOpportunity[]; initialSearch: string; savedSlugs: string[] }) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const toggle = (value: string, values: string[], set: (x: string[]) => void) =>
    set(values.includes(value) ? values.filter((x) => x !== value) : [...values, value]);
  const countries = Array.from(new Map(opportunities.map((x) => [x.countryCode, x.country])).entries());
  const results = opportunities.filter((item) => {
    const q = search.trim().toLowerCase();
    return (!q || [item.title, item.description, item.category, item.city].join(" ").toLowerCase().includes(q))
      && (!selectedSections.length || selectedSections.includes(item.section))
      && (!selectedCategories.length || selectedCategories.includes(item.category))
      && (!selectedCountries.length || selectedCountries.includes(item.countryCode));
  });
  const clear = () => { setSearch(""); setSelectedSections([]); setSelectedCategories([]); setSelectedCountries([]); };

  return <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
    <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex justify-between"><h2 className="text-lg font-black">Filters</h2><button onClick={clear} className="text-sm font-bold text-amber-700">Reset</button></div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Restaurant, workshop, factory..."
        className="mt-5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500" />
      <Checks title="Sections" options={sections} values={selectedSections} toggle={(x) => toggle(x, selectedSections, setSelectedSections)} />
      <Checks title="Categories" options={categories} values={selectedCategories} toggle={(x) => toggle(x, selectedCategories, setSelectedCategories)} />
      <Checks title="Countries" options={countries.map(([, name]) => name)} values={selectedCountries.map((code) => countries.find(([c]) => c === code)?.[1] ?? "")}
        toggle={(name) => { const code = countries.find(([, n]) => n === name)?.[0]; if (code) toggle(code, selectedCountries, setSelectedCountries); }} />
    </aside>
    <section>
      <p className="mb-5 text-sm font-semibold text-slate-500">Showing {results.length} opportunities</p>
      <div className="space-y-4">
        {results.map((item) => <article key={item.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md md:grid md:grid-cols-[170px_minmax(0,1fr)_190px]">
          <div className="relative min-h-40"><Image src={item.image} alt="" fill sizes="170px" className="object-cover" /><span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-black text-white ${item.section === "Businesses for Sale" ? "bg-emerald-600" : item.section === "Businesses Wanted" ? "bg-blue-600" : "bg-orange-600"}`}>{item.section}</span></div>
          <div className="p-5"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{item.category}</span><h2 className="mt-3 text-xl font-black text-slate-950"><Link href={`/business-opportunities/${item.slug}`} className="hover:text-amber-700">{item.title}</Link></h2><p className="mt-1 text-sm font-semibold text-slate-500">{item.city}, {item.country}</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p><p className="mt-3 text-sm text-slate-500">Capital / Asking Price: <strong className="text-emerald-700">{item.investment}</strong></p></div>
          <div className="flex flex-col justify-between border-t border-slate-200 p-5 md:border-l md:border-t-0">
            <div className="flex items-start justify-between gap-2">
              <SaveListingButton listingType="business" listingSlug={item.slug} initialSaved={savedSlugs.includes(item.slug)} compact />
              <p className="text-right text-xs text-slate-500">Posted {item.postedDate}</p>
            </div>
            <div className="mt-5 space-y-2">
              <Link href={`/business-opportunities/${item.slug}`} className="block rounded-full bg-slate-950 px-4 py-2 text-center text-sm font-bold text-white">
                View Details
              </Link>
              <Link href="/contact" className="block rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-bold text-slate-800">
                Contact Seller
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/contact" className="rounded-full border px-3 py-2 text-center text-xs font-bold">Call</Link>
                <a href={`https://wa.me/${item.whatsapp.replace(/\\D/g, "")}`} className="rounded-full bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-700">WhatsApp</a>
              </div>
            </div>
          </div>
        </article>)}
        {!results.length && <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-600">No opportunities match your filters.</div>}
      </div>
    </section>
  </div>;
}

function Checks({ title, options, values, toggle }: { title: string; options: string[]; values: string[]; toggle: (x: string) => void }) {
  return <fieldset className="mt-6 border-t border-slate-100 pt-5"><legend className="mb-3 text-sm font-black uppercase tracking-wide text-slate-900">{title}</legend><div className="space-y-2.5">{options.map((option) => <label key={option} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={values.includes(option)} onChange={() => toggle(option)} className="size-4 accent-amber-500" />{option}</label>)}</div></fieldset>;
}
