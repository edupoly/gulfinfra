"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContractorListingForm } from "@/components/listings/ContractorListingForm";
import { ProjectListingForm } from "@/components/listings/ProjectListingForm";
import { EquipmentListingForm } from "@/components/listings/EquipmentListingForm";
import { MaterialListingForm } from "@/components/listings/MaterialListingForm";
import { BusinessListingForm } from "@/components/listings/BusinessListingForm";

const listingTypes = [
  {
    id: "contractors",
    icon: "🏗️",
    title: "Contractors & Services",
    description: "Register your engineering profile.",
  },
  {
    id: "projects",
    icon: "📋",
    title: "Projects & Tenders",
    description: "Advertise dynamic construction bidding.",
  },
  {
    id: "rfq",
    icon: "💬",
    title: "Request for Quotation",
    description: "Ask pricing deals from suppliers.",
  },
  {
    id: "equipment",
    icon: "🚜",
    title: "Equipment Marketplace",
    description: "Sell or rent cranes, dozers, and generators.",
  },
  {
    id: "materials",
    icon: "🧱",
    title: "Industrial Materials",
    description: "Distribute cement, steel, and cabling.",
  },
  {
    id: "business",
    icon: "💼",
    title: "Business Opportunities",
    description: "Capital investment partnerships.",
  },
];

export function ListingTypeSelector({
  contractorTypes,
  projectTenderTypes,
  equipmentTypes,
  constructionMaterialTypes,
  industrialMaterialTypes,
  businessCategories,
  countries,
  cities,
}: {
  contractorTypes: Array<{ slug: string; name: string }>;
  projectTenderTypes: Array<{ slug: string; name: string }>;
  equipmentTypes: Array<{ slug: string; name: string }>;
  constructionMaterialTypes: Array<{ slug: string; name: string }>;
  industrialMaterialTypes: Array<{ slug: string; name: string }>;
  businessCategories: Array<{ slug: string; name: string }>;
  countries: Array<{ code: string; name: string }>;
  cities: Array<{ slug: string; name: string; countryCode: string }>;
}) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<"contractors" | "projects" | "equipment" | "materials" | "business" | null>(null);

  if (activeForm === "contractors") {
    return (
      <ContractorListingForm
        contractorTypes={contractorTypes}
        countries={countries}
        cities={cities}
        onBack={() => {
          setActiveForm(null);
          setSelectedType("contractors");
        }}
      />
    );
  }

  if (activeForm === "projects") {
    return (
      <ProjectListingForm
        projectTypes={projectTenderTypes}
        countries={countries}
        cities={cities}
        onBack={() => {
          setActiveForm(null);
          setSelectedType("projects");
        }}
      />
    );
  }

  if (activeForm === "equipment") {
    return (
      <EquipmentListingForm
        equipmentTypes={equipmentTypes}
        countries={countries}
        cities={cities}
        onBack={() => {
          setActiveForm(null);
          setSelectedType("equipment");
        }}
      />
    );
  }

  if (activeForm === "materials") {
    return (
      <MaterialListingForm
        constructionMaterialTypes={constructionMaterialTypes}
        industrialMaterialTypes={industrialMaterialTypes}
        countries={countries}
        cities={cities}
        onBack={() => {
          setActiveForm(null);
          setSelectedType("materials");
        }}
      />
    );
  }

  if (activeForm === "business") {
    return (
      <BusinessListingForm
        businessCategories={businessCategories}
        countries={countries}
        cities={cities}
        onBack={() => {
          setActiveForm(null);
          setSelectedType("business");
        }}
      />
    );
  }

  return (
    <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20 lg:py-20">
      <ol
        aria-label="Add listing progress"
        className="relative mx-auto flex w-full max-w-6xl items-center justify-between"
      >
        <div
          aria-hidden="true"
          className="absolute left-5 right-5 top-1/2 h-1 -translate-y-1/2 bg-slate-200"
        />
        {[1, 2, 3, 4].map((step) => (
          <li
            key={step}
            aria-current={step === 1 ? "step" : undefined}
            className={`relative z-10 grid size-11 place-items-center rounded-full border-4 text-lg font-black sm:size-14 sm:text-xl ${
              step === 1
                ? "border-amber-400 bg-amber-400 text-slate-950 shadow-[0_10px_24px_rgba(245,180,0,0.22)]"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            {step}
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-14 max-w-5xl text-center sm:mt-16">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">
          Step 1 of 4
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0b1f3a] sm:text-5xl">
          Select Listing Type
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-500 sm:text-2xl">
          What classification of listings would you like to publish to GulfBuildHub?
        </p>
      </div>

      <div
        className="mx-auto mt-10 grid max-w-6xl gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-7"
        role="radiogroup"
        aria-label="Listing type"
      >
        {listingTypes.map((listingType) => {
          const selected = selectedType === listingType.id;

          return (
            <button
              key={listingType.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setSelectedType(listingType.id);
                if (listingType.id === "rfq") {
                  router.push("/rfqs?create=1");
                  return;
                }
                if (["contractors", "projects", "equipment", "materials", "business"].includes(listingType.id)) {
                  setActiveForm(listingType.id as "contractors" | "projects" | "equipment" | "materials" | "business");
                }
              }}
              className={`group flex min-h-36 items-center gap-5 rounded-3xl border-4 px-6 py-7 text-left transition sm:min-h-44 sm:gap-7 sm:px-10 ${
                selected
                  ? "border-amber-400 bg-amber-50 shadow-[0_12px_30px_rgba(245,180,0,0.12)]"
                  : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
              } focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-amber-500`}
            >
              <span
                aria-hidden="true"
                className="w-14 shrink-0 text-center text-4xl transition-transform group-hover:scale-110 sm:text-5xl"
              >
                {listingType.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-xl font-black tracking-tight text-[#0b1f3a] sm:text-2xl">
                  {listingType.title}
                </span>
                <span className="mt-2 block text-base leading-6 text-slate-500 sm:text-lg">
                  {listingType.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {selectedType
          ? `${listingTypes.find((item) => item.id === selectedType)?.title} selected`
          : "No listing type selected"}
      </p>
    </section>
  );
}
