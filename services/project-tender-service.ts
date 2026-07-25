import { projectTenders } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { ProjectTenderProfile } from "@/lib/types";
import { unstable_cache } from "next/cache";

const usePrisma = Boolean(process.env.DATABASE_URL);

type FilterOption = {
  slug: string;
  name: string;
};

type ProjectTenderRecord = {
  slug: string;
  categorySlug: string;
  title: string;
  projectType?: string | null;
  status: string;
  summary?: string | null;
  description?: string | null;
  budget?: string | null;
  deadline?: string | null;
  client?: string | null;
  value?: string | null;
  tenderType?: string | null;
  location?: string | null;
  posted?: string | null;
  featured: boolean;
  projectTenderTypes: Array<{
    projectTenderType: { slug: string; name: string };
  }>;
  countries: Array<{ country: { code: string; name: string } }>;
  cities: Array<{ city: { slug: string; name: string; countryCode: string } }>;
  sectors: Array<{ sectorName: string }>;
  createdAt: Date;
};

const mapProjectTenderRecord = (
  projectTender: ProjectTenderRecord,
): ProjectTenderProfile => ({
  slug: projectTender.slug,
  title: projectTender.title,
  category: projectTender.categorySlug,
  projectType: projectTender.projectType ?? "",
  projectTypes: projectTender.projectTenderTypes.map(
    (link: { projectTenderType: { slug: string } }) =>
      link.projectTenderType.slug,
  ),
  country: projectTender.countries[0]?.country.name ?? "",
  countries: projectTender.countries.map(
    (link: { country: { code: string } }) => link.country.code,
  ),
  city: projectTender.cities[0]?.city.name ?? "",
  cities: projectTender.cities.map(
    (link: { city: { slug: string } }) => link.city.slug,
  ),
  status: projectTender.status,
  summary: projectTender.summary ?? "",
  description: projectTender.description ?? "",
  budget: projectTender.budget ?? "",
  deadline: projectTender.deadline ?? "",
  client: projectTender.client ?? "",
  sectors: projectTender.sectors.map(
    (sector: { sectorName: string }) => sector.sectorName,
  ),
  value: projectTender.value ?? "",
  tenderType: projectTender.tenderType ?? "",
  location: projectTender.location ?? "",
  posted: projectTender.posted ?? "",
  featured: projectTender.featured,
});

const getCachedProjectTenderFilters = unstable_cache(
  async () => {
    const [projectTenderTypes, countriesList, citiesList] = await Promise.all([
      prisma.projectTenderType.findMany({
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
      projectTenderTypes,
      countries: countriesList,
      cities: citiesList,
    };
  },
  ["project-tender-filter-options"],
  { revalidate: 3600, tags: ["project-tender-filter-options"] },
);

const projectTenderSelect = {
  slug: true,
  categorySlug: true,
  title: true,
  projectType: true,
  status: true,
  summary: true,
  description: true,
  budget: true,
  deadline: true,
  client: true,
  value: true,
  tenderType: true,
  location: true,
  posted: true,
  featured: true,
  createdAt: true,
  projectTenderTypes: {
    select: {
      projectTenderType: { select: { slug: true, name: true } },
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
  sectors: true,
} as const;

export async function getProjectTenderFilters(): Promise<{
  projectTenderTypes: FilterOption[];
  countries: Array<{ code: string; name: string }>;
  cities: Array<{ slug: string; name: string; countryCode: string }>;
}> {
  if (!usePrisma) {
    return {
      projectTenderTypes: [
        { slug: "building-projects", name: "Building Projects" },
        { slug: "infrastructure-projects", name: "Infrastructure Projects" },
        { slug: "government-tenders", name: "Government Tenders" },
        { slug: "industrial-projects", name: "Industrial Projects" },
        { slug: "oil-gas-projects", name: "Oil & Gas Projects" },
        { slug: "mep-projects", name: "MEP Projects" },
        { slug: "interior-fit-out", name: "Interior Fit-Out" },
        { slug: "roads-bridges", name: "Roads & Bridges" },
        { slug: "factory-projects", name: "Factory Projects" },
        { slug: "warehouse-construction", name: "Warehouse Construction" },
        { slug: "maintenance-contracts", name: "Maintenance Contracts" },
      ],
      countries: [
        { code: "AE", name: "UAE" },
        { code: "SA", name: "Saudi Arabia" },
        { code: "KW", name: "Kuwait" },
        { code: "QA", name: "Qatar" },
        { code: "OM", name: "Oman" },
        { code: "BH", name: "Bahrain" },
      ],
      cities: [
        { slug: "dubai", name: "Dubai", countryCode: "AE" },
        { slug: "abu-dhabi", name: "Abu Dhabi", countryCode: "AE" },
        { slug: "riyadh", name: "Riyadh", countryCode: "SA" },
        { slug: "jeddah", name: "Jeddah", countryCode: "SA" },
        { slug: "doha", name: "Doha", countryCode: "QA" },
        { slug: "muscat", name: "Muscat", countryCode: "OM" },
        { slug: "manama", name: "Manama", countryCode: "BH" },
        { slug: "kuwait-city", name: "Kuwait City", countryCode: "KW" },
      ],
    };
  }

  return getCachedProjectTenderFilters();
}

export async function getAllProjectTenders(): Promise<ProjectTenderProfile[]> {
  if (!usePrisma) {
    return projectTenders;
  }

  const rows = await prisma.projectTender.findMany({
    relationLoadStrategy: "join",
    where: { listingStatus: "published" },
    select: projectTenderSelect,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(mapProjectTenderRecord);
}

export async function getProjectTenderBySlug(
  slug: string,
): Promise<ProjectTenderProfile | null> {
  if (!usePrisma) {
    return projectTenders.find((project) => project.slug === slug) ?? null;
  }

  const row = await prisma.projectTender.findFirst({
    relationLoadStrategy: "join",
    where: { slug, listingStatus: "published" },
    select: projectTenderSelect,
  });

  return row ? mapProjectTenderRecord(row) : null;
}
