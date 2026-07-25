"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ContractorProfile } from "@/lib/types";

const normalize = (value: string) => value.trim().toLowerCase();

type Props = {
  initialSearch: string;
  contractorTypes: Array<{ slug: string; name: string }>;
  countries: Array<{ code: string; name: string }>;
  cities: Array<{ slug: string; name: string; countryCode: string }>;
  initialContractors: ContractorProfile[];
};

export function ContractorBrowser({
  initialSearch,
  contractorTypes,
  countries,
  cities,
  initialContractors,
}: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [minYearEstablished, setMinYearEstablished] = useState<number>(0);

  const filteredContractors = useMemo(() => {
    const term = normalize(search);

    return initialContractors.filter((contractor) => {
      const matchesSearch =
        term.length === 0 ||
        [
          contractor.name,
          contractor.description,
          contractor.city,
          contractor.country,
          contractor.services.join(" "),
          contractor.contractorTypes.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((type) => contractor.contractorTypes.includes(type));

      const matchesCountry =
        selectedCountries.length === 0 ||
        selectedCountries.some((country) => contractor.countries.includes(country));

      const matchesCity =
        selectedCities.length === 0 ||
        selectedCities.some((city) => contractor.cities.includes(city));

      const matchesYear = contractor.yearEstablished >= minYearEstablished;

      return matchesSearch && matchesType && matchesCountry && matchesCity && matchesYear;
    });
  }, [initialContractors, minYearEstablished, search, selectedCities, selectedCountries, selectedTypes]);

  const toggleValue = (
    value: string,
    current: string[],
    setter: (next: string[]) => void,
  ) => {
    const exists = current.includes(value);
    setter(exists ? current.filter((item) => item !== value) : [...current, value]);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTypes([]);
    setSelectedCountries([]);
    setSelectedCities([]);
    setMinYearEstablished(0);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-amber-700"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search contractors or services"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0"
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Contractor Type</legend>
            <div className="space-y-2">
              {contractorTypes.map((type) => (
                <label key={type.slug} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.slug)}
                    onChange={() => toggleValue(type.slug, selectedTypes, setSelectedTypes)}
                  />
                  <span>{type.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Country</legend>
            <div className="space-y-2">
              {countries.map((country) => (
                <label key={country.code} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country.code)}
                    onChange={() => toggleValue(country.code, selectedCountries, setSelectedCountries)}
                  />
                  <span>{country.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">City</legend>
            <div className="space-y-2">
              {cities.map((city) => (
                <label key={city.slug} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city.slug)}
                    onChange={() => toggleValue(city.slug, selectedCities, setSelectedCities)}
                  />
                  <span>{city.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Year Established</span>
            <select
              value={minYearEstablished}
              onChange={(event) => setMinYearEstablished(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value={0}>Any year</option>
              <option value={2000}>2000+</option>
              <option value={2005}>2005+</option>
              <option value={2010}>2010+</option>
              <option value={2015}>2015+</option>
            </select>
          </label>
        </div>
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700">Showing {filteredContractors.length} contractors</p>
            <h1 className="text-3xl font-bold text-slate-900">Browse Contractors</h1>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredContractors.map((contractor) => (
            <article
              key={contractor.slug}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                      {contractor.verified ? "Verified" : "Unverified"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {contractor.rating.toFixed(1)} ★ ({contractor.reviewCount} reviews)
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{contractor.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{contractor.address}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {contractor.country} • {contractor.city} • Established in {contractor.yearEstablished}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">{contractor.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contractor.services.slice(0, 4).map((service) => (
                      <span key={service} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <div className="text-sm text-slate-700">
                    <div>{contractor.projectsCompleted} projects completed</div>
                    <div>Response time: {contractor.responseTime}</div>
                  </div>
                  <Link
                    href={`/contractors/${contractor.slug}`}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {filteredContractors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
              No contractors match your selected filters. Try adjusting the search criteria.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
