"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { EquipmentProfile } from "@/lib/types";

type Props = {
  initialSearch: string;
  equipmentTypes: Array<{ slug: string; name: string }>;
  countries: Array<{ code: string; name: string }>;
  equipment: EquipmentProfile[];
};

const conditions = ["New", "Excellent", "Good", "Used"] as const;
const listingTypes = ["For Sale", "For Rent", "Wanted"] as const;

export function EquipmentBrowser({ initialSearch, equipmentTypes, countries, equipment }: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedListingTypes, setSelectedListingTypes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredEquipment = useMemo(() => {
    const term = search.trim().toLowerCase();

    return equipment.filter((item) => {
      const matchesSearch =
        !term ||
        [
          item.title,
          item.brand,
          item.model,
          item.equipmentType,
          item.description,
          item.location,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(item.equipmentTypeSlug);
      const matchesCountry =
        selectedCountries.length === 0 || selectedCountries.includes(item.countryCode);
      const matchesCondition =
        selectedConditions.length === 0 || selectedConditions.includes(item.condition);
      const matchesListingType =
        selectedListingTypes.length === 0 ||
        selectedListingTypes.includes(item.listingType);

      return (
        matchesSearch &&
        matchesType &&
        matchesCountry &&
        matchesCondition &&
        matchesListingType
      );
    });
  }, [
    equipment,
    search,
    selectedConditions,
    selectedCountries,
    selectedListingTypes,
    selectedTypes,
  ]);

  const toggle = (
    value: string,
    current: string[],
    setter: (items: string[]) => void,
  ) => {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTypes([]);
    setSelectedCountries([]);
    setSelectedConditions([]);
    setSelectedListingTypes([]);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Filter equipment</h2>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-amber-700 hover:text-amber-900"
          >
            Clear all
          </button>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Brand, model or equipment"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
        </label>

        <FilterGroup title="Listing purpose">
          {listingTypes.map((type) => (
            <FilterCheckbox
              key={type}
              label={type}
              checked={selectedListingTypes.includes(type)}
              onChange={() =>
                toggle(type, selectedListingTypes, setSelectedListingTypes)
              }
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Equipment type">
          {equipmentTypes.map((type) => (
            <FilterCheckbox
              key={type.slug}
              label={type.name}
              checked={selectedTypes.includes(type.slug)}
              onChange={() => toggle(type.slug, selectedTypes, setSelectedTypes)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Condition">
          {conditions.map((condition) => (
            <FilterCheckbox
              key={condition}
              label={condition}
              checked={selectedConditions.includes(condition)}
              onChange={() =>
                toggle(condition, selectedConditions, setSelectedConditions)
              }
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Country">
          {countries.map((country) => (
            <FilterCheckbox
              key={country.code}
              label={country.name}
              checked={selectedCountries.includes(country.code)}
              onChange={() =>
                toggle(country.code, selectedCountries, setSelectedCountries)
              }
            />
          ))}
        </FilterGroup>
      </aside>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Equipment listings
            </p>
            <h2 className="text-2xl font-black text-slate-950">
              {filteredEquipment.length} results
            </h2>
          </div>
          <div
            className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
            role="group"
            aria-label="Equipment display view"
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                viewMode === "grid"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span aria-hidden="true">▦</span> Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                viewMode === "list"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span aria-hidden="true">☷</span> List
            </button>
          </div>
        </div>

        {filteredEquipment.length ? (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-5 xl:grid-cols-2"
                : "flex flex-col gap-4"
            }
          >
            {filteredEquipment.map((item) => (
              <article
                key={item.slug}
                className={`group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  viewMode === "list"
                    ? "sm:grid sm:grid-cols-[190px_minmax(0,1fr)]"
                    : ""
                }`}
              >
                <div
                  className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white ${
                    viewMode === "list" ? "min-h-44 sm:min-h-full" : "min-h-44"
                  }`}
                >
                  <span
                    className={viewMode === "list" ? "text-5xl" : "text-6xl"}
                    aria-hidden="true"
                  >
                    🚜
                  </span>
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                      {item.listingType}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                      {item.condition}
                    </span>
                  </div>
                  {item.featured && (
                    <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-950">
                      Featured
                    </span>
                  )}
                </div>

                <div className={viewMode === "list" ? "p-5 sm:p-6" : "p-5"}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                        {item.equipmentType}
                      </p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        {item.title}
                      </h3>
                    </div>
                    {item.verified && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.year} · {item.brand} {item.model}
                    {item.operatingHours !== null
                      ? ` · ${item.operatingHours.toLocaleString()} h`
                      : ""}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <div
                    className={`mt-5 flex justify-between gap-4 border-t border-slate-100 pt-4 ${
                      viewMode === "list"
                        ? "flex-col sm:flex-row sm:items-center"
                        : "items-end"
                    }`}
                  >
                    <div>
                      <p className="text-xl font-black text-slate-950">{item.price}</p>
                      <p className="text-xs text-slate-500">{item.city}, {item.country}</p>
                    </div>
                    <Link
                      href={`/equipment-marketplace/${item.slug}`}
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-500 hover:text-slate-950"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-bold text-slate-950">No equipment found</h3>
            <p className="mt-2 text-sm text-slate-600">Try clearing one or more filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="mt-6 border-t border-slate-100 pt-5">
      <legend className="mb-3 text-sm font-bold text-slate-900">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 rounded border-slate-300 accent-amber-500"
      />
      <span>{label}</span>
    </label>
  );
}
