"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Group = "contractor" | "project" | "equipment" | "material" | "business";
const groups = new Set<Group>(["contractor", "project", "equipment", "material", "business"]);
const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const slugify = (name: string) => name.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function authorize() {
  if (!(await requireAdmin())) throw new Error("UNAUTHORIZED");
}

function groupFrom(data: FormData): Group {
  const group = text(data, "group") as Group;
  if (!groups.has(group)) throw new Error("INVALID_GROUP");
  return group;
}

function finish(message: string, error = false): never {
  updateTag("contractor-filter-options");
  updateTag("project-tender-filter-options");
  updateTag("equipment-filter-options");
  updateTag("material-locations");
  ["/", "/add-listing", "/contractors", "/projects-tenders", "/equipment-marketplace", "/construction-materials", "/business-opportunities", "/search", "/admin/taxonomy"].forEach((path) => revalidatePath(path));
  redirect(`/admin/taxonomy?${error ? "error" : "message"}=${encodeURIComponent(message)}`);
}

export async function createTaxonomyItem(data: FormData) {
  await authorize();
  const group = groupFrom(data);
  const name = text(data, "name");
  const slug = text(data, "slug").toLowerCase() || slugify(name);
  const groupName = text(data, "groupName");
  if (name.length < 2 || name.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) finish("Enter a valid name and lowercase URL slug.", true);
  try {
    if (group === "contractor") await prisma.contractorType.create({ data: { slug, name } });
    else if (group === "project") await prisma.projectTenderType.create({ data: { slug, name } });
    else if (group === "equipment") await prisma.equipmentType.create({ data: { slug, name } });
    else if (group === "business") await prisma.businessCategoryOption.create({ data: { slug, name } });
    else {
      if (!["Construction Materials", "Industrial Materials"].includes(groupName)) finish("Select a valid material group.", true);
      await prisma.materialTypeOption.create({ data: { slug, name, groupName } });
    }
  } catch {
    finish("That name or slug already exists.", true);
  }
  finish(`${name} was added.`);
}

export async function updateTaxonomyItem(data: FormData) {
  await authorize();
  const group = groupFrom(data);
  const slug = text(data, "slug");
  const name = text(data, "name");
  const groupName = text(data, "groupName");
  if (!slug || name.length < 2 || name.length > 120) finish("Enter a valid name.", true);
  try {
    if (group === "contractor") await prisma.contractorType.update({ where: { slug }, data: { name } });
    else if (group === "project") await prisma.projectTenderType.update({ where: { slug }, data: { name } });
    else if (group === "equipment") await prisma.equipmentType.update({ where: { slug }, data: { name } });
    else if (group === "material") {
      if (!["Construction Materials", "Industrial Materials"].includes(groupName)) finish("Select a valid material group.", true);
      await prisma.$transaction([
        prisma.materialTypeOption.update({ where: { slug }, data: { name, groupName } }),
        prisma.material.updateMany({ where: { materialTypeSlug: slug }, data: { materialType: name, materialGroup: groupName } }),
      ]);
    } else {
      const current = await prisma.businessCategoryOption.findUnique({ where: { slug }, select: { name: true } });
      if (!current) finish("Category not found.", true);
      await prisma.$transaction([
        prisma.businessCategoryOption.update({ where: { slug }, data: { name } }),
        prisma.businessOpportunity.updateMany({ where: { businessCategory: current.name }, data: { businessCategory: name } }),
      ]);
    }
  } catch {
    finish("The category could not be updated.", true);
  }
  finish(`${name} was updated.`);
}

export async function deleteTaxonomyItem(data: FormData) {
  await authorize();
  const group = groupFrom(data);
  const slug = text(data, "slug");
  let name = slug;
  let usage = 0;
  if (group === "contractor") {
    const row = await prisma.contractorType.findUnique({ where: { slug }, select: { name: true, _count: { select: { contractorLinks: true } } } });
    if (!row) finish("Category not found.", true); name = row.name; usage = row._count.contractorLinks;
  } else if (group === "project") {
    const row = await prisma.projectTenderType.findUnique({ where: { slug }, select: { name: true, _count: { select: { projectTenderLinks: true } } } });
    if (!row) finish("Category not found.", true); name = row.name; usage = row._count.projectTenderLinks;
  } else if (group === "equipment") {
    const row = await prisma.equipmentType.findUnique({ where: { slug }, select: { name: true, _count: { select: { equipment: true } } } });
    if (!row) finish("Category not found.", true); name = row.name; usage = row._count.equipment;
  } else if (group === "material") {
    const row = await prisma.materialTypeOption.findUnique({ where: { slug }, select: { name: true } });
    if (!row) finish("Category not found.", true); name = row.name; usage = await prisma.material.count({ where: { materialTypeSlug: slug } });
  } else {
    const row = await prisma.businessCategoryOption.findUnique({ where: { slug }, select: { name: true } });
    if (!row) finish("Category not found.", true); name = row.name; usage = await prisma.businessOpportunity.count({ where: { businessCategory: row.name } });
  }
  if (usage) finish("This category is used by listings and cannot be deleted.", true);
  if (group === "contractor") await prisma.contractorType.delete({ where: { slug } });
  else if (group === "project") await prisma.projectTenderType.delete({ where: { slug } });
  else if (group === "equipment") await prisma.equipmentType.delete({ where: { slug } });
  else if (group === "material") await prisma.materialTypeOption.delete({ where: { slug } });
  else await prisma.businessCategoryOption.delete({ where: { slug } });
  finish(`${name} was deleted.`);
}
