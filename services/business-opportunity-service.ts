import { businessOpportunities } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { BusinessOpportunity } from "@/lib/types";

const usePrisma = Boolean(process.env.DATABASE_URL);

const select = {
  slug: true,
  title: true,
  section: true,
  businessCategory: true,
  investment: true,
  countryCode: true,
  country: { select: { name: true } },
  city: { select: { name: true } },
  postedDate: true,
  contact: true,
  phone: true,
  whatsapp: true,
  description: true,
  image: true,
} as const;

function map(row: {
  slug: string; title: string; section: string; businessCategory: string;
  investment: string; countryCode: string; country: { name: string };
  city: { name: string }; postedDate: string | null; contact: string;
  phone: string; whatsapp: string | null; description: string; image: string | null;
}): BusinessOpportunity {
  const section = ["Businesses for Sale", "Businesses Wanted", "Investment Opportunities"].includes(row.section)
    ? row.section as BusinessOpportunity["section"]
    : "Investment Opportunities";
  return {
    slug: row.slug, title: row.title, section, category: row.businessCategory,
    investment: row.investment, country: row.country.name, countryCode: row.countryCode,
    city: row.city.name, postedDate: row.postedDate ?? "", contact: row.contact,
    phone: row.phone, whatsapp: row.whatsapp ?? "", description: row.description,
    image: row.image ?? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
  };
}

export async function getAllBusinessOpportunities(): Promise<BusinessOpportunity[]> {
  if (!usePrisma) return businessOpportunities;
  const rows = await prisma.businessOpportunity.findMany({
    relationLoadStrategy: "join",
    where: { listingStatus: "published" },
    select,
    orderBy: { createdAt: "desc" },
  });
  return [...rows.map(map), ...businessOpportunities];
}

export async function getBusinessOpportunityBySlug(slug: string): Promise<BusinessOpportunity | null> {
  if (usePrisma) {
    const row = await prisma.businessOpportunity.findFirst({
      relationLoadStrategy: "join",
      where: { slug, listingStatus: "published" },
      select,
    });
    if (row) return map(row);
  }
  return businessOpportunities.find((item) => item.slug === slug) ?? null;
}
