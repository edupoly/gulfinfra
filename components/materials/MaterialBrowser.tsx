"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import type { MaterialProfile } from "@/lib/types";

type Option = { slug: string; name: string };
type Props = {
  initialSearch: string;
  materials: MaterialProfile[];
  constructionTypes: Option[];
  industrialTypes: Option[];
  countries: Array<{ code: string; name: string }>;
  savedSlugs: string[];
};

export function MaterialBrowser({ initialSearch, materials, constructionTypes, industrialTypes, countries, savedSlugs }: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [construction, setConstruction] = useState<string[]>([]);
  const [industrial, setIndustrial] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const toggle = (value: string, values: string[], set: (x: string[]) => void) =>
    set(values.includes(value) ? values.filter((x) => x !== value) : [...values, value]);

  const results = useMemo(() => materials.filter((item) => {
    const term = search.trim().toLowerCase();
    const typeFilters = [...construction, ...industrial];
    return (!term || [item.name, item.supplier, item.materialType, item.description].join(" ").toLowerCase().includes(term))
      && (!typeFilters.length || typeFilters.includes(item.materialTypeSlug))
      && (!roles.length || roles.includes(item.listingType))
      && (!selectedCountries.length || selectedCountries.includes(item.countryCode));
  }), [construction, industrial, materials, roles, search, selectedCountries]);

  const checks = (options: Option[], values: string[], set: (x: string[]) => void) =>
    options.map((option) => (
      <label key={option.slug} className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={values.includes(option.slug)}
          onChange={() => toggle(option.slug, values, set)} className="size-4 accent-amber-500" />
        {option.name}
      </label>
    ));

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Filter materials</h2>
          <button onClick={() => { setSearch(""); setConstruction([]); setIndustrial([]); setRoles([]); setSelectedCountries([]); }}
            className="text-sm font-semibold text-amber-700">Clear all</button>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search material or supplier"
          className="mt-5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500" />
        <Group title="Listing type">
          {["For Sale", "Supplier", "Buyer"].map((role) => (
            <label key={role} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={roles.includes(role)} onChange={() => toggle(role, roles, setRoles)} className="size-4 accent-amber-500" />{role}
            </label>
          ))}
        </Group>
        <Group title="Construction materials">{checks(constructionTypes, construction, setConstruction)}</Group>
        <Group title="Industrial materials">{checks(industrialTypes, industrial, setIndustrial)}</Group>
        <Group title="Country">
          {countries.map((country) => (
            <label key={country.code} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={selectedCountries.includes(country.code)}
                onChange={() => toggle(country.code, selectedCountries, setSelectedCountries)} className="size-4 accent-amber-500" />{country.name}
            </label>
          ))}
        </Group>
      </aside>

      <section>
        <p className="text-sm font-semibold text-amber-700">Showing {results.length} material listings</p>
        <h2 className="mb-5 text-3xl font-black text-slate-950">Browse materials</h2>
        <div className="space-y-4">
          {results.map((item) => (
            <article key={item.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md sm:grid sm:grid-cols-[170px_minmax(0,1fr)]">
              <div className="relative min-h-40 bg-slate-800">
                {item.image ? <Image src={item.image} alt="" fill sizes="170px" className="object-cover" /> : <span className="grid h-full place-items-center text-5xl">🧱</span>}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">{item.listingType}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item.materialGroup}</span>
                  {item.verified && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Verified</span>}
                </div>
                <h3 className="mt-3 text-xl font-black text-slate-950">{item.name}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">{item.supplier}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.description}</p>
                <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
                  <div><p className="font-black text-slate-950">{item.priceRange}</p><p className="text-xs text-slate-500">MOQ: {item.minimumOrder} · {item.city}, {item.country}</p></div>
                  <div className="flex items-center gap-2">
                    <SaveListingButton listingType="material" listingSlug={item.slug} initialSaved={savedSlugs.includes(item.slug)} compact />
                    <Link href={`/construction-materials/${item.slug}`} className="rounded-full bg-slate-950 px-4 py-2 text-center text-sm font-bold text-white">View material</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {!results.length && <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-600">No materials match the selected filters.</div>}
        </div>
      </section>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <fieldset className="mt-6 border-t border-slate-100 pt-5"><legend className="mb-3 text-sm font-bold text-slate-900">{title}</legend><div className="space-y-2.5">{children}</div></fieldset>;
}
