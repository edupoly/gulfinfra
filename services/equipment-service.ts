import { unstable_cache } from "next/cache";
import {
  cities,
  countries,
  equipmentListings,
  equipmentTypes,
} from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { EquipmentProfile } from "@/lib/types";

const usePrisma = Boolean(process.env.DATABASE_URL);

const getCachedEquipmentFilters = unstable_cache(
  async () => {
    const [countriesList, citiesList] = await Promise.all([
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
      equipmentTypes,
      countries: countriesList,
      cities: citiesList,
    };
  },
  ["equipment-filter-options"],
  { revalidate: 3600, tags: ["equipment-filter-options"] },
);

const listingTypes = ["For Sale", "For Rent", "Wanted"] as const;
const conditions = ["New", "Excellent", "Good", "Used"] as const;

type EquipmentRow = {
  slug: string;
  title: string;
  equipmentTypeSlug: string;
  equipmentType: { name: string };
  listingType: string;
  condition: string;
  countryCode: string;
  country: { name: string };
  citySlug: string;
  city: { name: string };
  brand: string;
  model: string;
  year: number;
  operatingHours: number | null;
  price: string;
  priceNote: string | null;
  availability: string;
  location: string;
  description: string;
  specifications: unknown;
  sellerName: string;
  sellerType: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  verified: boolean;
  featured: boolean;
  images: string[];
  posted: string | null;
};

function mapEquipment(row: EquipmentRow): EquipmentProfile {
  const listingType = listingTypes.find((item) => item === row.listingType) ?? "For Sale";
  const condition = conditions.find((item) => item === row.condition) ?? "Used";
  const specifications = Array.isArray(row.specifications)
    ? row.specifications.filter(
        (item): item is { label: string; value: string } =>
          typeof item === "object" &&
          item !== null &&
          "label" in item &&
          "value" in item &&
          typeof item.label === "string" &&
          typeof item.value === "string",
      )
    : [];

  return {
    ...row,
    equipmentType: row.equipmentType.name,
    country: row.country.name,
    city: row.city.name,
    listingType,
    condition,
    priceNote: row.priceNote ?? "",
    specifications,
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    posted: row.posted ?? "",
  };
}

const equipmentSelect = {
  slug: true,
  title: true,
  equipmentTypeSlug: true,
  equipmentType: { select: { name: true } },
  listingType: true,
  condition: true,
  countryCode: true,
  country: { select: { name: true } },
  citySlug: true,
  city: { select: { name: true } },
  brand: true,
  model: true,
  year: true,
  operatingHours: true,
  price: true,
  priceNote: true,
  availability: true,
  location: true,
  description: true,
  specifications: true,
  sellerName: true,
  sellerType: true,
  phone: true,
  whatsapp: true,
  email: true,
  verified: true,
  featured: true,
  images: true,
  posted: true,
} as const;

export async function getEquipmentFilters() {
  if (!usePrisma) {
    return { equipmentTypes, countries, cities };
  }

  return getCachedEquipmentFilters();
}

export async function getAllEquipment(): Promise<EquipmentProfile[]> {
  if (!usePrisma) {
    return equipmentListings;
  }

  const rows = await prisma.equipment.findMany({
    relationLoadStrategy: "join",
    where: { listingStatus: "published" },
    select: equipmentSelect,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return rows.map(mapEquipment);
}

export async function getEquipmentBySlug(
  slug: string,
): Promise<EquipmentProfile | null> {
  if (!usePrisma) {
    return equipmentListings.find((item) => item.slug === slug) ?? null;
  }

  const row = await prisma.equipment.findFirst({
    relationLoadStrategy: "join",
    where: { slug, listingStatus: "published" },
    select: equipmentSelect,
  });

  return row ? mapEquipment(row) : null;
}
