import { prisma } from "@/lib/prisma";

export type CountryOption = { code: string; name: string };
export type CityOption = { slug: string; name: string; countryCode: string };

export async function getLocations(): Promise<{
  countries: CountryOption[];
  cities: CityOption[];
}> {
  const [countries, cities] = await Promise.all([
    prisma.country.findMany({
      select: { code: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.city.findMany({
      select: { slug: true, name: true, countryCode: true },
      orderBy: [{ countryCode: "asc" }, { name: "asc" }],
    }),
  ]);

  return { countries, cities };
}
