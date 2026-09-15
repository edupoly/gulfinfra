import { prisma } from "@/lib/prisma";

export async function getMarketplaceTaxonomy() {
  const [contractorTypes, projectTenderTypes, equipmentTypes, materialTypes, businessCategories] = await Promise.all([
    prisma.contractorType.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.projectTenderType.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.equipmentType.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.materialTypeOption.findMany({ select: { slug: true, name: true, groupName: true }, orderBy: { name: "asc" } }),
    prisma.businessCategoryOption.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return {
    contractorTypes,
    projectTenderTypes,
    equipmentTypes,
    constructionMaterialTypes: materialTypes.filter((item) => item.groupName === "Construction Materials").map(({ slug, name }) => ({ slug, name })),
    industrialMaterialTypes: materialTypes.filter((item) => item.groupName === "Industrial Materials").map(({ slug, name }) => ({ slug, name })),
    businessCategories,
  };
}
