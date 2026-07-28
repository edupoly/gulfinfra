"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectTenderProfile } from "@/lib/types";

const normalize = (value: string) => value.trim().toLowerCase();

type Props = {
  initialSearch: string;
  projectTenderTypes: Array<{ slug: string; name: string }>;
  countries: Array<{ code: string; name: string }>;
  cities: Array<{ slug: string; name: string; countryCode: string }>;
  initialProjectTenders: ProjectTenderProfile[];
};

export function ProjectTenderBrowser({
  initialSearch,
  projectTenderTypes,
  countries,
  cities,
  initialProjectTenders,
}: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const filteredProjectTenders = useMemo(() => {
    const term = normalize(search);

    return initialProjectTenders.filter((project) => {
      const matchesSearch =
        term.length === 0 ||
        [
          project.title,
          project.summary,
          project.description,
          project.country,
          project.city,
          project.client,
          project.projectType,
          project.tenderType,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((type) => project.projectTypes.includes(type));

      const matchesCountry =
        selectedCountries.length === 0 ||
        selectedCountries.some((country) => project.countries.includes(country));

      const matchesCity =
        selectedCities.length === 0 ||
        selectedCities.some((city) => project.cities.includes(city));

      return matchesSearch && matchesType && matchesCountry && matchesCity;
    });
  }, [initialProjectTenders, search, selectedCities, selectedCountries, selectedTypes]);

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
              placeholder="Search projects or clients"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0"
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Project Type</legend>
            <div className="space-y-2">
              {projectTenderTypes.map((type) => (
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
        </div>
      </aside>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700">
              Showing {filteredProjectTenders.length} opportunities
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Browse Projects & Tenders</h1>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredProjectTenders.map((project) => (
            <article
              key={project.slug}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                      {project.status}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {project.tenderType}
                    </span>
                    {project.featured ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{project.client}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {project.country} • {project.city} • {project.location}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">{project.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.sectors.map((sector) => (
                      <span
                        key={sector}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <div className="text-sm text-slate-700">
                    <div>{project.budget}</div>
                    <div>Deadline: {project.deadline}</div>
                    <div>Posted: {project.posted}</div>
                  </div>
                  <Link
                    href={`/projects-tenders/${project.slug}`}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    View more
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {filteredProjectTenders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
              No projects or tenders match your selected filters. Try adjusting the search criteria.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
