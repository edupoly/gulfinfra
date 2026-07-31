"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SaveListingButton } from "@/components/listings/SaveListingButton";
import type { EquipmentProfile } from "@/lib/types";

type Props = {
  initialSearch: string;
  equipmentTypes: Array<{ slug: string; name: string }>;
  countries: Array<{ code: string; name: string }>;
  equipment: EquipmentProfile[];
  savedSlugs: string[];
};

const conditions = ["New", "Excellent", "Good", "Used"] as const;
const listingTypes = ["For Sale", "For Rent", "Wanted"] as const;

export function EquipmentBrowser({ initialSearch, equipmentTypes, countries, equipment, savedSlugs }: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedListingTypes, setSelectedListingTypes] = useState<string[]>([]);

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
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700">
              Showing {filteredEquipment.length} equipment listings
            </p>
            <h2 className="text-3xl font-bold text-slate-900">Browse Equipment</h2>
          </div>
        </div>

        {filteredEquipment.length ? (
          <div className="grid gap-4">
            {filteredEquipment.map((item) => (
              <article
                key={item.slug}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                        {item.listingType}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {item.condition}
                      </span>
                      {item.verified && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Verified
                        </span>
                      )}
                      {item.featured && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.year} · {item.brand} {item.model}
                      {item.operatingHours !== null
                        ? ` · ${item.operatingHours.toLocaleString()} operating hours`
                        : ""}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {item.country} • {item.city} • {item.location}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700">
                        {item.equipmentType}
                      </span>
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700">
                        {item.condition} condition
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:w-44 md:shrink-0 md:items-end">
                    <SaveListingButton
                      listingType="equipment"
                      listingSlug={item.slug}
                      initialSaved={savedSlugs.includes(item.slug)}
                      compact
                    />
                    <div className="text-sm text-slate-700 md:w-full">
                      <div className="text-lg font-black text-slate-950">{item.price}</div>
                      <div>{item.equipmentType}</div>
                      <div>{item.listingType}</div>
                    </div>
                    <Link
                      href={`/equipment-marketplace/${item.slug}`}
                      className="inline-flex min-w-28 items-center justify-center whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      View Details
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
