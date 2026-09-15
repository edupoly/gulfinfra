"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const locationPaths = [
  "/", "/add-listing", "/contractors", "/projects-tenders",
  "/equipment-marketplace", "/construction-materials",
  "/business-opportunities", "/search", "/admin/locations",
];

function value(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}

function refreshLocations(message: string, error = false, countryCode?: string): never {
  updateTag("contractor-filter-options");
  updateTag("project-tender-filter-options");
  updateTag("equipment-filter-options");
  updateTag("material-locations");
  locationPaths.forEach((path) => revalidatePath(path));
  const params = new URLSearchParams({ [error ? "error" : "message"]: message });
  if (countryCode) params.set("country", countryCode);
  redirect(`/admin/locations?${params.toString()}`);
}

async function authorize() {
  if (!(await requireAdmin())) throw new Error("UNAUTHORIZED");
}

export async function createCountry(data: FormData) {
  await authorize();
  const code = value(data, "code").toUpperCase();
  const name = value(data, "name");
  if (!/^[A-Z]{2,3}$/.test(code) || name.length < 2 || name.length > 80) {
    refreshLocations("Enter a 2–3 letter country code and a valid country name.", true);
  }
  try {
    await prisma.country.create({ data: { code, name } });
  } catch {
    refreshLocations("That country code or name already exists.", true);
  }
  refreshLocations(`${name} was added.`, false, code);
}

export async function updateCountry(data: FormData) {
  await authorize();
  const code = value(data, "code").toUpperCase();
  const name = value(data, "name");
  if (!/^[A-Z]{2,3}$/.test(code) || name.length < 2 || name.length > 80) {
    refreshLocations("Enter a valid country name.", true);
  }
  try {
    await prisma.country.update({ where: { code }, data: { name } });
  } catch {
    refreshLocations("The country could not be updated.", true);
  }
  refreshLocations(`${name} was updated.`, false, code);
}

export async function deleteCountry(data: FormData) {
  await authorize();
  const code = value(data, "code").toUpperCase();
  const country = await prisma.country.findUnique({
    where: { code },
    select: {
      name: true,
      _count: { select: { cities: true, contractorLinks: true, projectTenderCountryLinks: true, equipment: true, materials: true, businessOpportunities: true } },
    },
  });
  if (!country) refreshLocations("Country not found.", true);
  const usage = Object.values(country._count).reduce((total, count) => total + count, 0);
  if (usage > 0) refreshLocations("Delete or reassign this country’s cities and listings first.", true);
  await prisma.country.delete({ where: { code } });
  refreshLocations(`${country.name} was deleted.`);
}

export async function createCity(data: FormData) {
  await authorize();
  const names = [...new Set(data.getAll("names").map(String).map((name) => name.trim()).filter(Boolean))];
  const countryCode = value(data, "countryCode").toUpperCase();
  if (!names.length || names.length > 20 || names.some((name) => name.length < 2 || name.length > 80) || !/^[A-Z]{2,3}$/.test(countryCode)) {
    refreshLocations("Enter between 1 and 20 valid city/state names.", true, countryCode);
  }
  const reservedSlugs = new Set((await prisma.city.findMany({ select: { slug: true } })).map((city) => city.slug));
  const cities = names.map((name) => {
    const baseSlug = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65) || "city";
    let slug = baseSlug;
    let suffix = 2;
    while (reservedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
    reservedSlugs.add(slug);
    return { slug, name, countryCode };
  });
  try {
    await prisma.city.createMany({ data: cities });
  } catch {
    refreshLocations("The cities/states could not be added. Check that the country is valid and try again.", true, countryCode);
  }
  refreshLocations(names.length === 1 ? `${names[0]} was added.` : `${names.length} cities/states were added.`, false, countryCode);
}

export async function updateCity(data: FormData) {
  await authorize();
  const slug = value(data, "slug").toLowerCase();
  const name = value(data, "name");
  const countryCode = value(data, "countryCode").toUpperCase();
  if (!slug || name.length < 2 || name.length > 80) refreshLocations("Enter a valid city/state name.", true, countryCode);

  const city = await prisma.city.findUnique({
    where: { slug },
    select: {
      countryCode: true,
      _count: { select: { contractorLinks: true, projectTenderCityLinks: true, equipment: true, materials: true, businessOpportunities: true } },
    },
  });
  if (!city) refreshLocations("City/state not found.", true, countryCode);
  const usage = Object.values(city._count).reduce((total, count) => total + count, 0);
  if (city.countryCode !== countryCode && usage > 0) {
    refreshLocations("A city/state used by listings cannot be moved to another country.", true, countryCode);
  }
  try {
    await prisma.city.update({ where: { slug }, data: { name, countryCode } });
  } catch {
    refreshLocations("The city/state could not be updated.", true, countryCode);
  }
  refreshLocations(`${name} was updated.`, false, countryCode);
}

export async function deleteCity(data: FormData) {
  await authorize();
  const slug = value(data, "slug").toLowerCase();
  const countryCode = value(data, "countryCode").toUpperCase();
  const city = await prisma.city.findUnique({
    where: { slug },
    select: {
      name: true,
      _count: { select: { contractorLinks: true, projectTenderCityLinks: true, equipment: true, materials: true, businessOpportunities: true } },
    },
  });
  if (!city) refreshLocations("City/state not found.", true, countryCode);
  const usage = Object.values(city._count).reduce((total, count) => total + count, 0);
  if (usage > 0) refreshLocations("This city/state is used by listings and cannot be deleted.", true, countryCode);
  await prisma.city.delete({ where: { slug } });
  refreshLocations(`${city.name} was deleted.`, false, countryCode);
}
