import { unstable_cache } from "next/cache";
import {
  materialListings,
} from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { MaterialProfile } from "@/lib/types";

const usePrisma = Boolean(process.env.DATABASE_URL);
const groups = ["Construction Materials", "Industrial Materials"] as const;
const roles = ["For Sale", "Supplier", "Buyer"] as const;

const select = {
  slug: true, name: true, materialGroup: true, materialType: true,
  materialTypeSlug: true, listingType: true, countryCode: true,
  country: { select: { name: true } }, citySlug: true,
  city: { select: { name: true } }, supplier: true, priceRange: true,
  minimumOrder: true, availability: true, leadTime: true, compliance: true,
  description: true, specifications: true, phone: true, whatsapp: true,
  email: true, verified: true, featured: true, image: true, posted: true,
} as const;

type Row = Awaited<ReturnType<typeof prisma.material.findFirst>>;

function map(row: NonNullable<Row> & { country: { name: string }; city: { name: string } }): MaterialProfile {
  const specs = Array.isArray(row.specifications)
    ? row.specifications.filter((x): x is { label: string; value: string } =>
        typeof x === "object" && x !== null && "label" in x && "value" in x)
    : [];
  return {
    ...row,
    materialGroup: groups.find((x) => x === row.materialGroup) ?? groups[0],
    listingType: roles.find((x) => x === row.listingType) ?? roles[0],
    country: row.country.name, city: row.city.name,
    specifications: specs, whatsapp: row.whatsapp ?? "", email: row.email ?? "",
    image: row.image ?? "", posted: row.posted ?? "",
  };
}

const cachedLocations = unstable_cache(async () => {
  const [countryList, cityList, materialTypes] = await Promise.all([
    prisma.country.findMany({ select: { code: true, name: true }, orderBy: { name: "asc" } }),
    prisma.city.findMany({ select: { slug: true, name: true, countryCode: true }, orderBy: { name: "asc" } }),
    prisma.materialTypeOption.findMany({ select: { slug: true, name: true, groupName: true }, orderBy: { name: "asc" } }),
  ]);
  return {
    countries: countryList,
    cities: cityList,
    constructionMaterialTypes: materialTypes.filter((item) => item.groupName === "Construction Materials").map(({ slug, name }) => ({ slug, name })),
    industrialMaterialTypes: materialTypes.filter((item) => item.groupName === "Industrial Materials").map(({ slug, name }) => ({ slug, name })),
  };
}, ["material-locations"], { revalidate: 3600, tags: ["material-locations"] });

export async function getMaterialFilters() {
  return cachedLocations();
}

export async function getAllMaterials(): Promise<MaterialProfile[]> {
  if (!usePrisma) return materialListings;
  const rows = await prisma.material.findMany({
    relationLoadStrategy: "join", where: { listingStatus: "published" }, select, orderBy: [{ featured: "desc" }, { verified: "desc" }, { createdAt: "desc" }],
  });
  if (rows.length === 0) return materialListings;
  return rows.map((row) => map(row as Parameters<typeof map>[0]));
}

export async function getMaterialBySlug(slug: string): Promise<MaterialProfile | null> {
  if (!usePrisma) return materialListings.find((x) => x.slug === slug) ?? null;
  const row = await prisma.material.findFirst({
    relationLoadStrategy: "join", where: { slug, listingStatus: "published" }, select,
  });
  return row
    ? map(row as Parameters<typeof map>[0])
    : materialListings.find((item) => item.slug === slug) ?? null;
}
