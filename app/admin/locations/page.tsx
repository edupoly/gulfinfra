import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import { deleteCity, deleteCountry, updateCity, updateCountry } from "./actions";
import { AddCityButton } from "@/components/admin/AddCityButton";
import { AddCountryButton } from "@/components/admin/AddCountryButton";

export const metadata: Metadata = { title: "Countries & Cities" };

const input = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const primary = "rounded-xl bg-[#0b1f3a] px-4 py-2.5 text-sm font-black text-white hover:bg-[#15375f]";
const danger = "rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50";

export default async function AdminLocationsPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string; country?: string }> }) {
  const notice = await searchParams;
  const [countries, cities] = await Promise.all([
    prisma.country.findMany({
      orderBy: { name: "asc" },
      select: { code: true, name: true, _count: { select: { cities: true, contractorLinks: true, projectTenderCountryLinks: true, equipment: true, materials: true, businessOpportunities: true } } },
    }),
    prisma.city.findMany({
      orderBy: [{ countryCode: "asc" }, { name: "asc" }],
      select: { slug: true, name: true, countryCode: true, country: { select: { name: true } }, _count: { select: { contractorLinks: true, projectTenderCityLinks: true, equipment: true, materials: true, businessOpportunities: true } } },
    }),
  ]);
  const selectedCountry = countries.find((country) => country.code === notice.country) ?? countries[0];
  const selectedCities = selectedCountry ? cities.filter((city) => city.countryCode === selectedCountry.code) : [];

  return <>
    <div className="flex flex-wrap items-start justify-between gap-4"><AdminPageHeader title="Countries & Cities" description="Choose a country, then manage only the cities that belong to it." /><AddCountryButton /></div>
    {(notice.message || notice.error) && <p className={`mt-6 rounded-xl border px-4 py-3 text-sm font-bold ${notice.error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice.error || notice.message}</p>}
    <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="px-3 pb-3 pt-2"><h2 className="font-black text-[#0b1f3a]">Countries</h2><p className="mt-1 text-xs text-slate-500">{countries.length} configured</p></div><nav aria-label="Country selection"><ul className="space-y-1">{countries.map((country) => <li key={country.code}><Link href={`/admin/locations?country=${country.code}`} className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm transition ${selectedCountry?.code === country.code ? "bg-amber-100 font-black text-[#0b1f3a]" : "font-bold text-slate-700 hover:bg-slate-50"}`}><span className="truncate">{country.name}</span><span className="ml-3 rounded-full bg-white/80 px-2 py-0.5 text-xs">{country._count.cities}</span></Link></li>)}</ul></nav></aside>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {selectedCountry ? <>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5"><div><div className="flex items-center gap-3"><span className="rounded-lg bg-amber-100 px-3 py-2 font-black text-[#0b1f3a]">{selectedCountry.code}</span><div><h2 className="text-2xl font-black text-[#0b1f3a]">{selectedCountry.name}</h2><p className="text-sm text-slate-500">{selectedCities.length} cities or states</p></div></div></div><AddCityButton countryCode={selectedCountry.code} countryName={selectedCountry.name} /></div>

          <details className="mt-5 rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-black text-slate-700">Country settings</summary><div className="mt-4 flex flex-col gap-3 sm:flex-row"><form action={updateCountry} className="flex min-w-0 flex-1 gap-2"><input type="hidden" name="code" value={selectedCountry.code} /><input name="name" required defaultValue={selectedCountry.name} maxLength={80} className={input} /><button className={primary}>Rename</button></form><form action={deleteCountry}><input type="hidden" name="code" value={selectedCountry.code} /><button className={danger}>Delete country</button></form></div></details>

          <div className="mt-6"><h3 className="font-black text-[#0b1f3a]">Cities and states</h3>{selectedCities.length === 0 && <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-10 text-center"><p className="font-bold text-slate-700">No cities added yet</p><p className="mt-1 text-sm text-slate-500">Use “Add city” above to add the first one.</p></div>}<div className="mt-4 grid gap-3 xl:grid-cols-2">{selectedCities.map((city) => {
          const usage = Object.values(city._count).reduce((sum, count) => sum + count, 0);
          return <article key={city.slug} className="rounded-xl border border-slate-200 p-4">
            <form action={updateCity} className="flex gap-2">
              <input type="hidden" name="slug" value={city.slug} />
              <input type="hidden" name="countryCode" value={selectedCountry.code} />
              <input name="name" required defaultValue={city.name} maxLength={80} className={input} />
              <button className={primary}>Rename</button>
            </form>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><p className="text-xs font-semibold text-slate-500">{usage} listing links</p><form action={deleteCity}>
              <input type="hidden" name="slug" value={city.slug} />
              <input type="hidden" name="countryCode" value={selectedCountry.code} />
              <button className={danger}>Delete</button>
            </form></div>
          </article>;
        })}</div></div>
        </> : <p className="py-16 text-center text-slate-500">Add a country to begin.</p>}
      </section>
    </div>
  </>;
}
