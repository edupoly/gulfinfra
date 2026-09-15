import type { Metadata } from "next";
import Link from "next/link";
import { getGlobalSearchResults } from "@/lib/global-search";

export const metadata: Metadata = {
  title: "Global Search | GulfInfraHub",
  description: "Search contractors, projects, RFQs, equipment, materials, and business opportunities across GCC markets.",
};
export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  category?: string;
  country?: string;
  city?: string;
  subcategory?: string;
  listingType?: string;
  featured?: string;
};

const uniqueOptions = (values: Array<{ value: string; label: string }>) =>
  [...new Map(values.filter((item) => item.value).map((item) => [item.value, item])).values()]
    .sort((a, b) => a.label.localeCompare(b.label));

export default async function GlobalSearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = await searchParams;
  const allResults = await getGlobalSearchResults();
  const query = (filters.q || "").trim().toLowerCase();
  const results = allResults.filter((item) => {
    const keywordMatch =
      !query ||
      [
        item.title,
        item.description,
        item.categoryLabel,
        item.country,
        item.city,
        item.subcategoryLabel,
        item.listingType,
        item.meta,
      ].some((value) => value.toLowerCase().includes(query));
    return (
      keywordMatch &&
      (!filters.category || item.category === filters.category) &&
      (!filters.country || item.countryCode === filters.country) &&
      (!filters.city || item.citySlug === filters.city) &&
      (!filters.subcategory || item.subcategory === filters.subcategory) &&
      (!filters.listingType || item.listingType === filters.listingType) &&
      (filters.featured !== "1" || item.featured)
    );
  });

  const categories = uniqueOptions(allResults.map((item) => ({ value: item.category, label: item.categoryLabel })));
  const countries = uniqueOptions(allResults.map((item) => ({ value: item.countryCode, label: item.country })));
  const cities = uniqueOptions(
    allResults
      .filter((item) => !filters.country || item.countryCode === filters.country)
      .map((item) => ({ value: item.citySlug, label: item.city })),
  );
  const subcategories = uniqueOptions(
    allResults
      .filter((item) => !filters.category || item.category === filters.category)
      .map((item) => ({ value: item.subcategory, label: item.subcategoryLabel })),
  );
  const listingTypes = uniqueOptions(
    allResults
      .filter((item) => !filters.category || item.category === filters.category)
      .map((item) => ({ value: item.listingType, label: item.listingType })),
  );

  return (
    <main className="min-h-screen w-full bg-slate-50">
      <section className="bg-[#0b1f3a] px-4 py-12 text-white sm:px-6">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-400">GCC marketplace</p>
          <h1 className="mt-2 text-4xl font-black !text-white">Unified Global Search</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Search every GulfInfraHub marketplace category from one place.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] items-start gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <form action="/search" method="get" className="space-y-4">
            <SearchField label="Keyword">
              <input name="q" defaultValue={filters.q || ""} placeholder="Search all listings" className="search-field" />
            </SearchField>
            <SearchField label="Category">
              <Select name="category" value={filters.category} options={categories} allLabel="All categories" />
            </SearchField>
            <SearchField label="Country">
              <Select name="country" value={filters.country} options={countries} allLabel="All countries" />
            </SearchField>
            <SearchField label="City">
              <Select name="city" value={filters.city} options={cities} allLabel="All cities" />
            </SearchField>
            <SearchField label="Subcategory">
              <Select name="subcategory" value={filters.subcategory} options={subcategories} allLabel="All subcategories" />
            </SearchField>
            <SearchField label="Listing type">
              <Select name="listingType" value={filters.listingType} options={listingTypes} allLabel="All listing types" />
            </SearchField>
            <label className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-[#0b1f3a]">
              <input type="checkbox" name="featured" value="1" defaultChecked={filters.featured === "1"} className="size-4 accent-[#0b1f3a]" />
              Featured listings only
            </label>
            <button className="w-full rounded-xl bg-amber-400 px-5 py-3 font-black text-[#0b1f3a] hover:bg-amber-300">
              Search marketplace
            </button>
            <Link href="/search" className="block text-center text-sm font-bold text-blue-700 underline">
              Clear all filters
            </Link>
          </form>
        </aside>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#0b1f3a]">Search results</h2>
              <p className="mt-1 text-sm text-slate-600">
                {results.length} of {allResults.length} marketplace listings
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {results.length ? results.map((item) => (
              <article key={item.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#0b1f3a] px-3 py-1 text-xs font-black text-white">{item.categoryLabel}</span>
                      {item.featured && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">Featured</span>}
                    </div>
                    <h3 className="mt-3 text-xl font-black text-[#0b1f3a]">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-500">
                      <span>⌖ {item.city}, {item.country}</span>
                      <span>{item.subcategoryLabel}</span>
                      <span>{item.listingType}</span>
                      <span>{item.meta}</span>
                    </div>
                  </div>
                  <Link href={item.href} className="shrink-0 rounded-xl bg-amber-400 px-5 py-2.5 text-center text-sm font-black text-[#0b1f3a]">
                    View details →
                  </Link>
                </div>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <h3 className="text-2xl font-black text-[#0b1f3a]">No matching listings</h3>
                <p className="mt-2 text-slate-600">Try removing one or more filters.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SearchField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-slate-700">{label}{children}</label>;
}

function Select({ name, value, options, allLabel }: { name: string; value?: string; options: Array<{ value: string; label: string }>; allLabel: string }) {
  return (
    <select name={name} defaultValue={value || ""} className="search-field marketplace-select">
      <option value="">{allLabel}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}
