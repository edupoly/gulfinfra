"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const locations: Record<string, Array<{ value: string; label: string }>> = {
  SA: [{ value: "riyadh", label: "Riyadh" }, { value: "jeddah", label: "Jeddah" }],
  AE: [{ value: "dubai", label: "Dubai" }, { value: "abu-dhabi", label: "Abu Dhabi" }],
  QA: [{ value: "doha", label: "Doha" }], KW: [{ value: "kuwait-city", label: "Kuwait City" }],
  OM: [{ value: "muscat", label: "Muscat" }], BH: [{ value: "manama", label: "Manama" }],
};
const routes: Record<string, string> = {
  contractors: "/contractors", projects: "/projects-tenders",
  equipment: "/equipment-marketplace", materials: "/construction-materials",
  business: "/business-opportunities",
};

export function HomeHero() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  return <section className="relative isolate overflow-hidden bg-[#07172c] bg-[linear-gradient(135deg,rgba(6,18,36,.94),rgba(11,31,58,.86)),url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto max-w-[1180px] text-center">
      <h1 className="mx-auto max-w-5xl text-3xl font-black leading-[1.18] tracking-[-0.025em] !text-white sm:text-5xl lg:text-[3.3rem]">
        Find Contractors, Businesses, Equipment,<br className="hidden sm:block" /> Warehouses, Labour Camps &<br className="hidden sm:block" /> Construction & Industrial Materials<br className="hidden sm:block" /> Across the Gulf
      </h1>
      <p className="mx-auto mt-5 max-w-4xl text-base font-medium leading-7 text-white sm:text-lg">Connecting Contractors, Project Owners, Investors, Equipment Owners, Suppliers and Businesses Across GCC Countries.</p>

      <form onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const category = String(data.get("category") || "contractors");
        const query = new URLSearchParams();
        const keyword = String(data.get("keyword") || "").trim();
        const city = String(data.get("city") || "");
        if (keyword) query.set("search", keyword);
        if (country) query.set("countries", country);
        if (city) query.set("cities", city);
        router.push(`${routes[category] ?? "/contractors"}${query.size ? `?${query}` : ""}`);
      }} className="mx-auto mt-10 grid max-w-[1120px] overflow-hidden rounded-2xl bg-white p-2 text-left shadow-2xl lg:grid-cols-[1.45fr_1fr_1fr_1fr_auto] lg:items-stretch">
        <Field icon="⌕" label="What are you looking for?"><input name="keyword" placeholder="e.g. Contractors, Equipment" className="w-full bg-transparent text-sm font-medium text-slate-600 outline-none" /></Field>
        <Field icon="▦" label="Category"><select name="category" className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="contractors">Contractors</option><option value="projects">Projects & Tenders</option><option value="equipment">Equipment Marketplace</option><option value="materials">Construction Materials</option><option value="business">Business Opportunities</option></select></Field>
        <Field icon="⌖" label="Country"><select name="country" value={country} onChange={(event) => setCountry(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="">All Countries</option><option value="SA">Saudi Arabia</option><option value="AE">United Arab Emirates</option><option value="QA">Qatar</option><option value="KW">Kuwait</option><option value="OM">Oman</option><option value="BH">Bahrain</option></select></Field>
        <Field icon="⌖" label="City"><select key={country} name="city" className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="">All Cities</option>{(locations[country] ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
        <button className="m-1 rounded-xl bg-amber-400 px-7 py-3 font-black text-[#0b1f3a] transition hover:bg-amber-300">⌕ Search</button>
      </form>

      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link href="/add-listing" className="rounded-lg bg-amber-400 px-8 py-3.5 font-black text-[#0b1f3a] hover:bg-amber-300">▣ Add Listing</Link>
        <Link href="/projects-tenders" className="rounded-lg border-2 border-white px-8 py-3 font-black text-white hover:bg-white/10">▤ Post Requirement</Link>
      </div>
    </div>
  </section>;
}

function Field({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return <label className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 lg:border-b-0 lg:border-r"><span className="text-xl font-black text-[#0b1f3a]">{icon}</span><span className="min-w-0 flex-1"><span className="mb-1 block text-xs font-black text-[#0b1f3a]">{label}</span>{children}</span></label>;
}
