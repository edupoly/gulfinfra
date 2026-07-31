"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCity,
  faLayerGroup,
  faLocationDot,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";

const locations: Record<string, Array<{ value: string; label: string }>> = {
  SA: [{ value: "riyadh", label: "Riyadh" }, { value: "jeddah", label: "Jeddah" }],
  AE: [{ value: "dubai", label: "Dubai" }, { value: "abu-dhabi", label: "Abu Dhabi" }],
  QA: [{ value: "doha", label: "Doha" }], KW: [{ value: "kuwait-city", label: "Kuwait City" }],
  OM: [{ value: "muscat", label: "Muscat" }], BH: [{ value: "manama", label: "Manama" }],
};

const subcategories: Record<string, Array<{ value: string; label: string }>> = {
  contractors: [
    { value: "civil-contractors", label: "Civil Contractors" },
    { value: "building-contractors", label: "Building Contractors" },
    { value: "infrastructure-contractors", label: "Infrastructure Contractors" },
    { value: "mep-contractors", label: "MEP Contractors" },
    { value: "electrical-contractors", label: "Electrical Contractors" },
    { value: "hvac-contractors", label: "HVAC Contractors" },
    { value: "epc-contractors", label: "EPC Contractors" },
  ],
  "projects-tenders": [
    { value: "building-projects", label: "Building Projects" },
    { value: "infrastructure-projects", label: "Infrastructure Projects" },
    { value: "government-tenders", label: "Government Tenders" },
    { value: "industrial-projects", label: "Industrial Projects" },
    { value: "roads-bridges", label: "Roads & Bridges" },
  ],
  rfqs: [
    { value: "materials-sourcing", label: "Materials Sourcing" },
    { value: "equipment-rentals", label: "Equipment Rentals" },
    { value: "equipment-purchases", label: "Equipment Purchases" },
  ],
  "equipment-marketplace": [
    { value: "excavators", label: "Excavators" },
    { value: "cranes", label: "Cranes" },
    { value: "forklifts", label: "Forklifts" },
    { value: "boom-lifts", label: "Boom Lifts" },
    { value: "loaders", label: "Loaders" },
    { value: "generators", label: "Generators" },
  ],
  "construction-materials": [
    { value: "cement-concrete", label: "Cement & Concrete" },
    { value: "structural-steel", label: "Structural Steel" },
    { value: "blocks-masonry", label: "Blocks & Masonry" },
    { value: "pipes-valves", label: "Pipes & Valves" },
    { value: "electrical-supplies", label: "Electrical Supplies" },
    { value: "hvac-components", label: "HVAC Components" },
  ],
  "business-opportunities": [
    { value: "restaurants", label: "Restaurants" },
    { value: "cafes", label: "Cafes" },
    { value: "workshops", label: "Workshops" },
    { value: "factories", label: "Factories" },
    { value: "trading-companies", label: "Trading Companies" },
    { value: "franchise-businesses", label: "Franchise Businesses" },
  ],
};

const listingTypes: Record<string, string[]> = {
  contractors: ["LLC", "Corporation", "Partnership", "Sole Proprietorship"],
  "projects-tenders": ["Open Tender", "Private Tender", "Public Project"],
  rfqs: ["RFQ"],
  "equipment-marketplace": ["For Sale", "For Rent", "Wanted"],
  "construction-materials": ["For Sale", "Supplier", "Buyer"],
  "business-opportunities": ["Businesses for Sale", "Businesses Wanted", "Investment Opportunities"],
};

export function HomeHero() {
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  return <section className="relative isolate overflow-hidden bg-[#07172c] bg-[linear-gradient(135deg,rgba(6,18,36,.94),rgba(11,31,58,.86)),url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center px-4 py-16 text-white sm:px-6 sm:py-10 lg:px-8">
    <div className="mx-auto max-w-[1180px] text-center">
      <h1 className="mx-auto max-w-5xl text-3xl font-black leading-[1.18] tracking-[-0.025em] !text-white sm:text-5xl lg:text-[3rem]">
        Find Contractors, Businesses, Equipment,<br className="hidden sm:block" /> Warehouses, Labour Camps &<br className="hidden sm:block" /> Construction & Industrial Materials<br className="hidden sm:block" /> Across the Gulf
      </h1>
      <p className="mx-auto mt-5 max-w-6xl text-base font-medium leading-7  text-slate-400 sm:text-lg">Connecting Contractors, Project Owners, Investors, Equipment Owners, Suppliers and Businesses Across GCC Countries.</p>

      <form action="/search" method="get" className="mx-auto mt-10 grid max-w-[1120px] overflow-hidden rounded-2xl bg-white p-2 text-left shadow-2xl sm:grid-cols-2 lg:grid-cols-4">
        <Field icon={faMagnifyingGlass} label="What are you looking for?"><input name="q" placeholder="e.g. Contractors, Equipment" className="w-full bg-transparent text-sm font-medium text-slate-600 outline-none" /></Field>
        <Field icon={faLayerGroup} label="Category"><select name="category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="">All Categories</option><option value="contractors">Contractors</option><option value="projects-tenders">Projects & Tenders</option><option value="rfqs">RFQs</option><option value="equipment-marketplace">Equipment Marketplace</option><option value="construction-materials">Construction Materials</option><option value="business-opportunities">Business Opportunities</option></select></Field>
        <Field icon={faLocationDot} label="Country"><select name="country" value={country} onChange={(event) => setCountry(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="">All Countries</option><option value="SA">Saudi Arabia</option><option value="AE">United Arab Emirates</option><option value="QA">Qatar</option><option value="KW">Kuwait</option><option value="OM">Oman</option><option value="BH">Bahrain</option></select></Field>
        <Field icon={faCity} label="City"><select key={country} name="city" className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="">All Cities</option>{(locations[country] ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
        <Field icon={faLayerGroup} label="Subcategory"><select key={category} name="subcategory" className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="">All Subcategories</option>{(subcategories[category] ?? []).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
        <Field icon={faLayerGroup} label="Listing Type"><select key={`type-${category}`} name="listingType" className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"><option value="">All Listing Types</option>{(listingTypes[category] ?? []).map((item) => <option key={item}>{item}</option>)}</select></Field>
        <label className="flex cursor-pointer items-center gap-3 border-b border-slate-200 px-4 py-3 text-[#0b1f3a] lg:border-b-0 lg:border-r"><input type="checkbox" name="featured" value="1" className="size-5 accent-[#0b1f3a]" /><span><span className="block text-xs font-black">Featured Only</span><span className="text-xs text-slate-500">Priority listings</span></span></label>
        <button className="m-1 rounded-xl bg-amber-400 px-7 py-3 font-black text-[#0b1f3a] transition hover:bg-amber-300">⌕ Search Marketplace</button>
      </form>

      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link href="/add-listing" className="rounded-lg bg-amber-400 px-8 py-3.5 font-black text-[#0b1f3a] hover:bg-amber-300">▣ Add Listing</Link>
        <Link href="/projects-tenders" className="rounded-lg border-2 border-white px-8 py-3 font-black text-white hover:bg-white/10">▤ Post Requirement</Link>
      </div>
    </div>
  </section>;
}

function Field({ icon, label, children }: { icon: IconDefinition; label: string; children: React.ReactNode }) {
  return <label className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 lg:border-b-0 lg:border-r"><FontAwesomeIcon icon={icon} className="w-5 shrink-0 text-xl text-[#0b1f3a]" /><span className="min-w-0 flex-1"><span className="mb-1 block text-xs font-black text-[#0b1f3a]">{label}</span>{children}</span></label>;
}
