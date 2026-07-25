"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const routes: Record<string, string> = {
  contractors: "/contractors", projects: "/projects-tenders",
  equipment: "/equipment-marketplace", materials: "/construction-materials",
  business: "/business-opportunities",
};

export function DirectoryHero({ category, title, description, searchPlaceholder, countries, cities, ctaLabel }: {
  category: keyof typeof routes; title: string; description: string; searchPlaceholder: string;
  countries: Array<{ code: string; name: string }>;
  cities: Array<{ slug: string; name: string; countryCode: string }>;
  ctaLabel?: string;
}) {
  const router = useRouter();
  const [country, setCountry] = useState("");
  return <div className="mb-10">
    <section className="bg-[#07172c] bg-[linear-gradient(135deg,rgba(6,18,36,.95),rgba(11,31,58,.88)),url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=82')] bg-cover bg-center text-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-start justify-between gap-6 px-6 pb-14 pt-12">
        <div>
          <h1 className="text-3xl font-black tracking-tight !text-white sm:text-4xl">{title}</h1>
          <nav aria-label="Breadcrumb" className="mt-2 text-sm text-white"><Link href="/" className="text-white/70 hover:text-white">Home</Link><span className="mx-2 text-white/50">›</span><span className="font-bold text-white">{title}</span></nav>
          <p className="mt-3 max-w-3xl text-base font-medium leading-6 text-white">{description}</p>
        </div>
        {ctaLabel && <Link href="/add-listing" className="rounded-md border-2 border-amber-400 px-5 py-3 text-sm font-black text-amber-400 transition hover:bg-amber-400 hover:text-[#0b1f3a]">{ctaLabel}</Link>}
      </div>
    </section>
    <form onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const destination = String(data.get("category") || category);
      const query = new URLSearchParams();
      const search = String(data.get("search") || "").trim(), city = String(data.get("city") || "");
      if (search) query.set("search", search);
      if (country) query.set("country", country);
      if (city) query.set("city", city);
      router.push(`${routes[destination] ?? routes[category]}${query.size ? `?${query}` : ""}`);
    }} className="relative z-10 mx-auto -mt-10 grid w-[calc(100%-3rem)] max-w-[1392px] overflow-hidden rounded-2xl bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,.18)] lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
      <Field icon="⌕" label="What are you looking for?"><input name="search" placeholder={searchPlaceholder} className="w-full bg-transparent text-sm text-slate-600 outline-none" /></Field>
      <Field icon="▦" label="Category"><select name="category" defaultValue={category} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="contractors">Contractors</option><option value="projects">Projects & Tenders</option><option value="equipment">Equipment Marketplace</option><option value="materials">Construction Materials</option><option value="business">Business Opportunities</option></select></Field>
      <Field icon="⌖" label="Country"><select name="country" value={country} onChange={(event) => setCountry(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="">All Countries</option>{countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
      <Field icon="⌖" label="City"><select key={country} name="city" className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="">All Cities</option>{cities.filter((item) => !country || item.countryCode === country).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></Field>
      <button className="m-1 rounded-lg bg-amber-400 px-7 py-3 font-bold text-[#0b1f3a] hover:bg-amber-300">⌕ Search</button>
    </form>
  </div>;
}

function Field({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return <label className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 lg:border-b-0 lg:border-r"><span className="text-xl font-black text-[#0b1f3a]">{icon}</span><span className="min-w-0 flex-1"><span className="mb-1 block text-xs font-black text-[#0b1f3a]">{label}</span>{children}</span></label>;
}
