import {
  cities,
  contractorTypes,
  countries,
  contractors,
} from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { ContractorProfile } from "@/lib/types";
import { unstable_cache } from "next/cache";

export type ContractorSearchFilters = {
  search?: string;
  contractorTypes?: string[];
  countries?: string[];
  cities?: string[];
  minYearEstablished?: number;
};

const usePrisma = Boolean(process.env.DATABASE_URL);

type FilterOption = {
  slug: string;
  name: string;
};

type CountryFilterOption = {
  code: string;
  name: string;
};

type CityFilterOption = {
  slug: string;
  name: string;
  countryCode: string;
};

type ContractorRecord = {
  slug: string;
  categorySlug: string;
  name: string;
  companyType: string;
  countryCode?: string | null;
  citySlug?: string | null;
  yearEstablished?: number | null;
  employees?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  description?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  verified: boolean;
  premium: boolean;
  featured: boolean;
  memberSince?: string | null;
  responseTime?: string | null;
  projectsCompleted?: number | null;
  contractorTypes: Array<{
    contractorType: { slug: string; name: string };
  }>;
  countries: Array<{ country: { code: string; name: string } }>;
  cities: Array<{ city: { slug: string; name: string; countryCode: string } }>;
  services?: Array<{ serviceName: string }>;
  areasServed?: Array<{ areaName: string }>;
  licenses?: Array<{ licenseName: string }>;
  galleryItems?: Array<{ imageUrl: string }>;
  featuredProjects?: Array<{
    title: string;
    location: string;
    status: string;
  }>;
  createdAt: Date;
};

const mapContractorRecord = (
  contractor: ContractorRecord,
): ContractorProfile => ({
  slug: contractor.slug,
  name: contractor.name,
  category: contractor.categorySlug,
  companyType: contractor.companyType,
  primaryType:
    contractor.contractorTypes[0]?.contractorType.name ?? "General Contractor",
  contractorTypes: contractor.contractorTypes.map(
    (link: { contractorType: { slug: string } }) => link.contractorType.slug,
  ),
  country: contractor.countryCode ?? "",
  countries: contractor.countries.map(
    (link: { country: { code: string } }) => link.country.code,
  ),
  city: contractor.citySlug ?? "",
  cities: contractor.cities.map(
    (link: { city: { slug: string } }) => link.city.slug,
  ),
  yearEstablished: contractor.yearEstablished ?? 0,
  employees: contractor.employees ?? "",
  website: contractor.website ?? "",
  email: contractor.email ?? "",
  phone: contractor.phone ?? "",
  whatsapp: contractor.whatsapp ?? "",
  address: contractor.address ?? "",
  description: contractor.description ?? "",
  services: (contractor.services ?? []).map(
    (service: { serviceName: string }) => service.serviceName,
  ),
  areasServed: (contractor.areasServed ?? []).map(
    (area: { areaName: string }) => area.areaName,
  ),
  rating: contractor.rating ?? 0,
  reviewCount: contractor.reviewCount ?? 0,
  verified: contractor.verified,
  premium: contractor.premium,
  featured: contractor.featured,
  memberSince: contractor.memberSince ?? "",
  responseTime: contractor.responseTime ?? "",
  projectsCompleted: contractor.projectsCompleted ?? 0,
  licenses: (contractor.licenses ?? []).map(
    (item: { licenseName: string }) => item.licenseName,
  ),
  gallery: (contractor.galleryItems ?? []).map(
    (item: { imageUrl: string }) => item.imageUrl,
  ),
  featuredProjects: (contractor.featuredProjects ?? []).map(
    (item: { title: string; location: string; status: string }) => ({
      title: item.title,
      location: item.location,
      status: item.status,
    }),
  ),
});

const getCachedContractorFilters = unstable_cache(
  async () => {
    const [types, countriesList, citiesList] = await Promise.all([
      prisma.contractorType.findMany({
        select: { slug: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.country.findMany({
        select: { code: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.city.findMany({
        select: { slug: true, name: true, countryCode: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      contractorTypes: types,
      countries: countriesList,
      cities: citiesList,
    };
  },
  ["contractor-filter-options"],
  { revalidate: 3600, tags: ["contractor-filter-options"] },
);

export async function getContractorFilters(): Promise<{
  contractorTypes: FilterOption[];
  countries: CountryFilterOption[];
  cities: CityFilterOption[];
}> {
  if (!usePrisma) {
    return {
      contractorTypes,
      countries,
      cities,
    };
  }

  return getCachedContractorFilters();
}

export async function getAllContractors(): Promise<ContractorProfile[]> {
  if (!usePrisma) {
    return contractors;
  }

  const rows = await prisma.contractor.findMany({
    relationLoadStrategy: "join",
    where: { listingStatus: "published" },
    select: {
      slug: true,
      categorySlug: true,
      name: true,
      companyType: true,
      countryCode: true,
      citySlug: true,
      yearEstablished: true,
      address: true,
      description: true,
      rating: true,
      reviewCount: true,
      verified: true,
      premium: true,
      featured: true,
      responseTime: true,
      projectsCompleted: true,
      createdAt: true,
      services: true,
      contractorTypes: {
        select: {
          contractorType: { select: { slug: true, name: true } },
        },
      },
      countries: {
        select: { country: { select: { code: true, name: true } } },
      },
      cities: {
        select: {
          city: { select: { slug: true, name: true, countryCode: true } },
        },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return rows.map(mapContractorRecord);
}

export async function getContractorBySlug(
  slug: string,
): Promise<ContractorProfile | null> {
  if (!usePrisma) {
    return contractors.find((contractor) => contractor.slug === slug) ?? null;
  }

  const contractor = await prisma.contractor.findFirst({
    relationLoadStrategy: "join",
    where: { slug, listingStatus: "published" },
    include: {
      services: true,
      areasServed: true,
      contractorTypes: { include: { contractorType: true } },
      countries: { include: { country: true } },
      cities: { include: { city: true } },
      licenses: true,
      galleryItems: true,
      featuredProjects: true,
    },
  });

  if (!contractor) {
    return null;
  }

  return mapContractorRecord(contractor);
}

export function filterContractors(
  filters: ContractorSearchFilters,
): ContractorProfile[] {
  const normalizedSearch = filters.search?.trim().toLowerCase() ?? "";
  const selectedTypes = filters.contractorTypes ?? [];
  const selectedCountries = filters.countries ?? [];
  const selectedCities = filters.cities ?? [];
  const minYearEstablished = filters.minYearEstablished ?? 0;

  return contractors.filter((contractor) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
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
        .includes(normalizedSearch);

    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.some((type) => contractor.contractorTypes.includes(type));

    const matchesCountry =
      selectedCountries.length === 0 ||
      selectedCountries.some((country) =>
        contractor.countries.includes(country),
      );

    const matchesCity =
      selectedCities.length === 0 ||
      selectedCities.some((city) => contractor.cities.includes(city));

    const matchesYear = contractor.yearEstablished >= minYearEstablished;

    return (
      matchesSearch &&
      matchesType &&
      matchesCountry &&
      matchesCity &&
      matchesYear
    );
  });
}
