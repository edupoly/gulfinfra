import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import { createTaxonomyItem, deleteTaxonomyItem, updateTaxonomyItem } from "./actions";

export const metadata: Metadata = { title: "Marketplace Taxonomy" };
const input = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const primary = "rounded-xl bg-[#0b1f3a] px-4 py-2.5 text-sm font-black text-white hover:bg-[#15375f]";
const danger = "rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50";
type Item = { slug: string; name: string; usage: number; groupName?: string };

export default async function AdminTaxonomyPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const notice = await searchParams;
  const [contractors, projects, equipment, materials, businesses, rfqCategories, materialUsage, businessUsage, rfqUsage] = await Promise.all([
    prisma.contractorType.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, _count: { select: { contractorLinks: true } } } }),
    prisma.projectTenderType.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, _count: { select: { projectTenderLinks: true } } } }),
    prisma.equipmentType.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, _count: { select: { equipment: true } } } }),
    prisma.materialTypeOption.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true, groupName: true } }),
    prisma.businessCategoryOption.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
    prisma.rfqCategoryOption.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
    prisma.material.groupBy({ by: ["materialTypeSlug"], _count: true }),
    prisma.businessOpportunity.groupBy({ by: ["businessCategory"], _count: true }),
    prisma.rfq.groupBy({ by: ["category"], _count: true }),
  ]);
  const materialCounts = new Map(materialUsage.map((row) => [row.materialTypeSlug, row._count]));
  const businessCounts = new Map(businessUsage.map((row) => [row.businessCategory, row._count]));
  const rfqCounts = new Map(rfqUsage.map((row) => [row.category, row._count]));
  const sections: Array<{ group: "contractor" | "project" | "equipment" | "material" | "business" | "rfq"; title: string; items: Item[] }> = [
    { group: "contractor", title: "Contractor categories", items: contractors.map((x) => ({ slug: x.slug, name: x.name, usage: x._count.contractorLinks })) },
    { group: "project", title: "Project categories", items: projects.map((x) => ({ slug: x.slug, name: x.name, usage: x._count.projectTenderLinks })) },
    { group: "equipment", title: "Equipment categories", items: equipment.map((x) => ({ slug: x.slug, name: x.name, usage: x._count.equipment })) },
    { group: "material", title: "Material categories", items: materials.map((x) => ({ ...x, usage: materialCounts.get(x.slug) ?? 0 })) },
    { group: "business", title: "Business categories", items: businesses.map((x) => ({ ...x, usage: businessCounts.get(x.name) ?? 0 })) },
    { group: "rfq", title: "RFQ categories", items: rfqCategories.map((x) => ({ ...x, usage: rfqCounts.get(x.name) ?? 0 })) },
  ];

  return <>
    <AdminPageHeader title="Marketplace Taxonomy" description="Manage the categories used by frontend filters and listing forms." />
    {(notice.message || notice.error) && <p className={`mt-6 rounded-xl border px-4 py-3 text-sm font-bold ${notice.error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice.error || notice.message}</p>}
    <div className="mt-8 space-y-8">
      {sections.map((section) => <section key={section.group} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-black">{section.title}</h2><p className="mt-1 text-sm text-slate-500">{section.items.length} options</p></div></div>
        <form action={createTaxonomyItem} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <input type="hidden" name="group" value={section.group} />
          <input name="name" required maxLength={120} placeholder="Category name" className={input} />
          <input name="slug" maxLength={120} placeholder="url-slug (generated if blank)" className={input} />
          {section.group === "material" && <select name="groupName" className={input}><option>Construction Materials</option><option>Industrial Materials</option></select>}
          <button className={primary}>Add category</button>
        </form>
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {section.items.map((item) => <article key={item.slug} className="rounded-xl border border-slate-200 p-3">
            <form action={updateTaxonomyItem} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input type="hidden" name="group" value={section.group} /><input type="hidden" name="slug" value={item.slug} />
              <input name="name" required defaultValue={item.name} maxLength={120} className={input} />
              {section.group === "material" && <select name="groupName" defaultValue={item.groupName} className={input}><option>Construction Materials</option><option>Industrial Materials</option></select>}
              <button className={primary}>Update</button>
            </form>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs font-semibold text-slate-500">/{item.slug} · {item.usage} listings</span><form action={deleteTaxonomyItem}><input type="hidden" name="group" value={section.group} /><input type="hidden" name="slug" value={item.slug} /><button className={danger}>Delete</button></form></div>
          </article>)}
        </div>
      </section>)}
    </div>
  </>;
}
