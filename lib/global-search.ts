import "server-only";

import { getAllBusinessOpportunities } from "@/services/business-opportunity-service";
import { getAllContractors } from "@/services/contractor-service";
import { getAllEquipment } from "@/services/equipment-service";
import { getAllMaterials } from "@/services/material-service";
import { getAllProjectTenders } from "@/services/project-tender-service";
import { getRfqs } from "@/app/rfqs/data";

export type GlobalSearchResult = {
  key: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  country: string;
  countryCode: string;
  city: string;
  citySlug: string;
  subcategory: string;
  subcategoryLabel: string;
  listingType: string;
  featured: boolean;
  href: string;
  meta: string;
};

const countryNames: Record<string, string> = {
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  QA: "Qatar",
  KW: "Kuwait",
  OM: "Oman",
  BH: "Bahrain",
};
const countryCodes = Object.fromEntries(
  Object.entries(countryNames).map(([code, name]) => [name.toLowerCase(), code]),
);
const cityNames: Record<string, string> = {
  riyadh: "Riyadh",
  jeddah: "Jeddah",
  dubai: "Dubai",
  "abu-dhabi": "Abu Dhabi",
  doha: "Doha",
  "kuwait-city": "Kuwait City",
  muscat: "Muscat",
  manama: "Manama",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function getGlobalSearchResults(): Promise<GlobalSearchResult[]> {
  const [contractors, projects, equipment, materials, businesses, rfqs] =
    await Promise.all([
      getAllContractors(),
      getAllProjectTenders(),
      getAllEquipment(),
      getAllMaterials(),
      getAllBusinessOpportunities(),
      getRfqs(),
    ]);

  const results: GlobalSearchResult[] = [
    ...contractors.map((item) => {
      const countryCode = item.countries[0] || item.country;
      const citySlug = item.cities[0] || item.city;
      return {
        key: `contractor:${item.slug}`,
        title: item.name,
        description: item.description,
        category: "contractors",
        categoryLabel: "Contractors",
        country: countryNames[countryCode] || item.country,
        countryCode,
        city: cityNames[citySlug] || item.city,
        citySlug,
        subcategory: item.contractorTypes[0] || slugify(item.primaryType),
        subcategoryLabel: item.primaryType,
        listingType: item.companyType || "Service Provider",
        featured: item.featured || item.premium,
        href: `/contractors/${item.slug}`,
        meta: `${item.rating.toFixed(1)} rating · ${item.projectsCompleted} projects`,
      };
    }),
    ...projects.map((item) => ({
      key: `project:${item.slug}`,
      title: item.title,
      description: item.summary || item.description,
      category: "projects-tenders",
      categoryLabel: "Projects & Tenders",
      country: item.country,
      countryCode: item.countries[0] || countryCodes[item.country.toLowerCase()] || "",
      city: item.city,
      citySlug: item.cities[0] || slugify(item.city),
      subcategory: item.projectTypes[0] || slugify(item.projectType),
      subcategoryLabel: item.projectType,
      listingType: item.tenderType || "Project / Tender",
      featured: item.featured,
      href: `/projects-tenders/${item.slug}`,
      meta: `${item.status} · ${item.budget || item.value}`,
    })),
    ...equipment.map((item) => ({
      key: `equipment:${item.slug}`,
      title: item.title,
      description: item.description,
      category: "equipment-marketplace",
      categoryLabel: "Equipment Marketplace",
      country: item.country,
      countryCode: item.countryCode,
      city: item.city,
      citySlug: item.citySlug,
      subcategory: item.equipmentTypeSlug,
      subcategoryLabel: item.equipmentType,
      listingType: item.listingType,
      featured: item.featured,
      href: `/equipment-marketplace/${item.slug}`,
      meta: `${item.price} · ${item.condition}`,
    })),
    ...materials.map((item) => ({
      key: `material:${item.slug}`,
      title: item.name,
      description: item.description,
      category: "construction-materials",
      categoryLabel: "Construction & Industrial Materials",
      country: item.country,
      countryCode: item.countryCode,
      city: item.city,
      citySlug: item.citySlug,
      subcategory: item.materialTypeSlug,
      subcategoryLabel: item.materialType,
      listingType: item.listingType,
      featured: item.featured,
      href: `/construction-materials/${item.slug}`,
      meta: `${item.priceRange} · ${item.availability}`,
    })),
    ...businesses.map((item) => ({
      key: `business:${item.slug}`,
      title: item.title,
      description: item.description,
      category: "business-opportunities",
      categoryLabel: "Business Opportunities",
      country: item.country,
      countryCode: item.countryCode,
      city: item.city,
      citySlug: slugify(item.city),
      subcategory: slugify(item.category),
      subcategoryLabel: item.category,
      listingType: item.section,
      featured: item.featured,
      href: `/business-opportunities/${item.slug}`,
      meta: item.investment,
    })),
    ...rfqs
      .filter((item) => item.status === "published")
      .map((item) => ({
        key: `rfq:${item.id}`,
        title: item.title,
        description: item.description,
        category: "rfqs",
        categoryLabel: "RFQs",
        country: item.country,
        countryCode: countryCodes[item.country.toLowerCase()] || "",
        city: item.city,
        citySlug: slugify(item.city),
        subcategory: slugify(item.category),
        subcategoryLabel: item.category,
        listingType: "RFQ",
        featured: false,
        href: `/rfqs?rfq=${item.id}`,
        meta: `${item.reference} · Closes ${item.expirationDate.toLocaleDateString("en-GB")}`,
      })),
  ];

  return [...new Map(results.map((item) => [item.key, item])).values()];
}
