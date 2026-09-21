import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { OwnedListingType } from "@/app/my-listings/actions";
import { EditListingWizard } from "@/components/account/EditListingWizard";
import { FileDropzone } from "@/components/uploads/FileDropzone";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validTypes = new Set<OwnedListingType>(["contractor", "project", "equipment", "material", "business"]);
const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

type EditValues = Record<string, string>;

export default async function EditOwnedListingPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  const { type: rawType, id } = await params;
  const type = rawType as OwnedListingType;
  if (!validTypes.has(type)) notFound();

  let listing: EditValues | null = null;
  if (type === "contractor") {
    const item = await prisma.contractor.findFirst({
      where: { id, ownerId: user.id },
      include: { contractorTypes: true, countries: true, cities: true, services: true, areasServed: true, licenses: true, galleryItems: true, documents: true },
    });
    if (item) listing = {
      title: item.name, description: item.description || "", companyType: item.companyType,
      contractorTypes: item.contractorTypes.map((entry) => entry.contractorTypeSlug).join("\n"),
      countryCode: item.countries.map((entry) => entry.countryCode).join("\n") || item.countryCode || "",
      citySlug: item.cities.map((entry) => entry.citySlug).join("\n") || item.citySlug || "",
      yearEstablished: String(item.yearEstablished || ""), employees: item.employees || "",
      phone: item.phone || "", whatsapp: item.whatsapp || "", email: item.email || "",
      website: item.website || "", address: item.address || "", responseTime: item.responseTime || "",
      projectsCompleted: String(item.projectsCompleted || 0), logoUrl: item.logoUrl || "",
      services: item.services.map((entry) => entry.serviceName).join("\n"),
      areasServed: item.areasServed.map((entry) => entry.areaName).join("\n"),
      licenses: item.licenses.map((entry) => entry.licenseName).join("\n"),
      galleryUrls: item.galleryItems.map((entry) => entry.imageUrl).join("\n"),
      documentUrls: item.documents.map((entry) => entry.documentUrl).join("\n"),
    };
  } else if (type === "project") {
    const item = await prisma.projectTender.findFirst({
      where: { id, ownerId: user.id },
      include: { projectTenderTypes: true, countries: true, cities: true, sectors: true, documents: true },
    });
    if (item) listing = {
      title: item.title, description: item.description || "", summary: item.summary || "",
      projectType: item.projectType || "", projectStatus: item.status, price: item.budget || "",
      deadline: item.deadline || "", client: item.client || "", projectValue: item.value || "",
      tenderType: item.tenderType || "", location: item.location || "", posted: item.posted || "",
      imageUrls: item.imageUrls.join("\n"),
      projectTypes: item.projectTenderTypes.map((entry) => entry.projectTenderTypeSlug).join("\n"),
      countryCodes: item.countries.map((entry) => entry.countryCode).join("\n"),
      citySlugs: item.cities.map((entry) => entry.citySlug).join("\n"),
      sectors: item.sectors.map((entry) => entry.sectorName).join("\n"),
      documentUrls: item.documents.map((entry) => entry.documentUrl).join("\n"),
    };
  } else if (type === "equipment") {
    const item = await prisma.equipment.findFirst({ where: { id, ownerId: user.id }, include: { documents: true } });
    if (item) listing = {
      title: item.title, description: item.description, equipmentTypeSlug: item.equipmentTypeSlug,
      listingType: item.listingType, condition: item.condition, countryCode: item.countryCode,
      citySlug: item.citySlug, brand: item.brand, model: item.model, year: String(item.year),
      operatingHours: String(item.operatingHours ?? ""), price: item.price, priceNote: item.priceNote || "",
      availability: item.availability, location: item.location,
      specifications: JSON.stringify(item.specifications, null, 2), sellerName: item.sellerName,
      sellerType: item.sellerType, phone: item.phone, whatsapp: item.whatsapp || "",
      email: item.email || "", images: item.images.join("\n"), posted: item.posted || "",
      documentUrls: item.documents.map((entry) => entry.documentUrl).join("\n"),
    };
  } else if (type === "material") {
    const item = await prisma.material.findFirst({ where: { id, ownerId: user.id }, include: { documents: true } });
    if (item) listing = {
      title: item.name, description: item.description, materialGroup: item.materialGroup,
      materialType: item.materialType, materialTypeSlug: item.materialTypeSlug,
      listingType: item.listingType, countryCode: item.countryCode, citySlug: item.citySlug,
      supplier: item.supplier, price: item.priceRange, minimumOrder: item.minimumOrder,
      availability: item.availability, leadTime: item.leadTime, compliance: item.compliance.join("\n"),
      specifications: JSON.stringify(item.specifications, null, 2), phone: item.phone,
      whatsapp: item.whatsapp || "", email: item.email || "", image: item.image || "",
      galleryImages: item.galleryImages.join("\n"), posted: item.posted || "",
      documentUrls: item.documents.map((entry) => entry.documentUrl).join("\n"),
    };
  } else {
    const item = await prisma.businessOpportunity.findFirst({ where: { id, ownerId: user.id }, include: { documents: true } });
    if (item) listing = {
      title: item.title, description: item.description, section: item.section,
      businessCategory: item.businessCategory, price: item.investment,
      countryCode: item.countryCode, citySlug: item.citySlug, email: item.contact,
      phone: item.phone, whatsapp: item.whatsapp || "", image: item.image || "",
      galleryImages: item.galleryImages.join("\n"), posted: item.postedDate || "",
      documentUrls: item.documents.map((entry) => entry.documentUrl).join("\n"),
    };
  }
  if (!listing) notFound();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/my-listings#listings" className="text-sm font-black text-blue-700">← Back to My Listings</Link>
        <div className="mt-5">
          <EditListingWizard
            type={type}
            id={id}
            title={listing.title}
            details={<><Input name="title" label="Listing title / name" value={listing.title} required wide />{type === "contractor" && <ContractorFields listing={listing} />}{type === "project" && <ProjectFields listing={listing} />}{type === "equipment" && <EquipmentFields listing={listing} />}{type === "material" && <MaterialFields listing={listing} />}{type === "business" && <BusinessFields listing={listing} />}<Textarea name="description" label="Description" value={listing.description} rows={8} required wide /></>}
            media={<MediaFields type={type} listing={listing} />}
          />
        </div>
      </div>
    </main>
  );
}

function ContractorFields({ listing }: { listing: EditValues }) {
  return <>
    <Input name="companyType" label="Company type" value={listing.companyType} required />
    <Input name="yearEstablished" label="Year established" value={listing.yearEstablished} type="number" />
    <Textarea name="contractorTypes" label="Specialization slugs (one per line)" value={listing.contractorTypes} rows={4} />
    <Textarea name="services" label="Services (one per line)" value={listing.services} rows={4} />
    <Textarea name="countryCode" label="Country codes (one per line)" value={listing.countryCode} rows={3} />
    <Textarea name="citySlug" label="City slugs (one per line)" value={listing.citySlug} rows={3} />
    <Input name="employees" label="Employees" value={listing.employees} />
    <Input name="projectsCompleted" label="Projects completed" value={listing.projectsCompleted} type="number" />
    <Input name="phone" label="Phone" value={listing.phone} required />
    <Input name="whatsapp" label="WhatsApp" value={listing.whatsapp} />
    <Input name="email" label="Email" value={listing.email} type="email" required />
    <Input name="website" label="Website" value={listing.website} type="url" />
    <Input name="address" label="Office address" value={listing.address} wide />
    <Input name="responseTime" label="Response time" value={listing.responseTime} />
    <Textarea name="areasServed" label="Areas served (one per line)" value={listing.areasServed} rows={4} />
    <Textarea name="licenses" label="Licenses (one per line)" value={listing.licenses} rows={4} />
  </>;
}

function ProjectFields({ listing }: { listing: EditValues }) {
  return <>
    <Input name="projectType" label="Project type" value={listing.projectType} />
    <Textarea name="projectTypes" label="Project type slugs (one per line)" value={listing.projectTypes} rows={4} />
    <Textarea name="sectors" label="Sectors (one per line)" value={listing.sectors} rows={4} />
    <Textarea name="countryCodes" label="Country codes (one per line)" value={listing.countryCodes} rows={3} />
    <Textarea name="citySlugs" label="City slugs (one per line)" value={listing.citySlugs} rows={3} />
    <Input name="projectStatus" label="Project status" value={listing.projectStatus} required />
    <Textarea name="summary" label="Short summary" value={listing.summary} rows={3} wide />
    <Input name="price" label="Budget" value={listing.price} />
    <Input name="projectValue" label="Project value" value={listing.projectValue} />
    <Input name="deadline" label="Closing date" value={listing.deadline} />
    <Input name="client" label="Client / authority" value={listing.client} />
    <Input name="tenderType" label="Tender type" value={listing.tenderType} />
    <Input name="location" label="Location" value={listing.location} wide />
    <Input name="posted" label="Posted label/date" value={listing.posted} />
  </>;
}

function EquipmentFields({ listing }: { listing: EditValues }) {
  return <>
    <Input name="equipmentTypeSlug" label="Equipment type slug" value={listing.equipmentTypeSlug} required />
    <Input name="listingType" label="Listing type" value={listing.listingType} required />
    <Input name="condition" label="Condition" value={listing.condition} required />
    <Input name="countryCode" label="Country code" value={listing.countryCode} required />
    <Input name="citySlug" label="City slug" value={listing.citySlug} required />
    <Input name="brand" label="Brand" value={listing.brand} required />
    <Input name="model" label="Model" value={listing.model} required />
    <Input name="year" label="Year" value={listing.year} type="number" required />
    <Input name="operatingHours" label="Operating hours" value={listing.operatingHours} type="number" />
    <Input name="price" label="Price" value={listing.price} required />
    <Input name="priceNote" label="Price note" value={listing.priceNote} />
    <Input name="availability" label="Availability" value={listing.availability} required />
    <Input name="location" label="Location" value={listing.location} wide required />
    <Input name="sellerName" label="Seller name" value={listing.sellerName} required />
    <Input name="sellerType" label="Seller type" value={listing.sellerType} required />
    <Input name="phone" label="Phone" value={listing.phone} required />
    <Input name="whatsapp" label="WhatsApp" value={listing.whatsapp} />
    <Input name="email" label="Email" value={listing.email} type="email" />
    <Input name="posted" label="Posted label/date" value={listing.posted} />
  </>;
}

function MaterialFields({ listing }: { listing: EditValues }) {
  return <>
    <Input name="materialGroup" label="Material group" value={listing.materialGroup} required />
    <Input name="materialType" label="Material type" value={listing.materialType} required />
    <Input name="materialTypeSlug" label="Material type slug" value={listing.materialTypeSlug} required />
    <Input name="listingType" label="Listing type" value={listing.listingType} required />
    <Input name="countryCode" label="Country code" value={listing.countryCode} required />
    <Input name="citySlug" label="City slug" value={listing.citySlug} required />
    <Input name="supplier" label="Supplier / buyer" value={listing.supplier} required />
    <Input name="price" label="Price range / budget" value={listing.price} required />
    <Input name="minimumOrder" label="Minimum order" value={listing.minimumOrder} required />
    <Input name="availability" label="Availability" value={listing.availability} required />
    <Input name="leadTime" label="Lead time" value={listing.leadTime} required />
    <Input name="phone" label="Phone" value={listing.phone} required />
    <Input name="whatsapp" label="WhatsApp" value={listing.whatsapp} />
    <Input name="email" label="Email" value={listing.email} type="email" />
    <Input name="posted" label="Posted label/date" value={listing.posted} />
  </>;
}

function BusinessFields({ listing }: { listing: EditValues }) {
  return <>
    <Input name="section" label="Opportunity section" value={listing.section} required />
    <Input name="businessCategory" label="Business category" value={listing.businessCategory} required />
    <Input name="price" label="Investment / budget" value={listing.price} required />
    <Input name="countryCode" label="Country code" value={listing.countryCode} required />
    <Input name="citySlug" label="City slug" value={listing.citySlug} required />
    <Input name="email" label="Contact email" value={listing.email} type="email" required />
    <Input name="phone" label="Phone" value={listing.phone} required />
    <Input name="whatsapp" label="WhatsApp" value={listing.whatsapp} />
    <Input name="posted" label="Posted date" value={listing.posted} />
  </>;
}

function MediaFields({ type, listing }: { type: OwnedListingType; listing: EditValues }) {
  const urls = (value: string) => value.split("\n").filter(Boolean);
  const documents = <FileDropzone kind="document" name="documentUrls" label="supporting documents" initialUrls={urls(listing.documentUrls)} maxFiles={5} />;
  if (type === "contractor") return <><FileDropzone kind="image" name="logoUrl" label="company logo" initialUrls={urls(listing.logoUrl)} /><FileDropzone kind="image" name="galleryUrls" label="gallery images" initialUrls={urls(listing.galleryUrls)} maxFiles={6} />{documents}</>;
  if (type === "project") return <><FileDropzone kind="image" name="imageUrls" label="project images" initialUrls={urls(listing.imageUrls)} maxFiles={6} />{documents}</>;
  if (type === "equipment") return <><FileDropzone kind="image" name="images" label="equipment images" initialUrls={urls(listing.images)} maxFiles={8} />{documents}<Textarea name="specifications" label="Specifications JSON" value={listing.specifications} rows={10} wide /></>;
  if (type === "material") return <><FileDropzone kind="image" name="image" label="primary material image" initialUrls={urls(listing.image)} /><FileDropzone kind="image" name="galleryImages" label="gallery images" initialUrls={urls(listing.galleryImages)} maxFiles={6} />{documents}<Textarea name="compliance" label="Compliance standards (one per line)" value={listing.compliance} rows={5} /><Textarea name="specifications" label="Specifications JSON" value={listing.specifications} rows={10} /></>;
  return <><FileDropzone kind="image" name="image" label="primary business image" initialUrls={urls(listing.image)} /><FileDropzone kind="image" name="galleryImages" label="gallery images" initialUrls={urls(listing.galleryImages)} maxFiles={6} />{documents}</>;
}

function Input({ name, label, value, type = "text", required = false, wide = false }: { name: string; label: string; value?: string; type?: string; required?: boolean; wide?: boolean }) {
  return <label className={`block text-sm font-bold text-slate-700 ${wide ? "sm:col-span-2" : ""}`}>{label}<input name={name} type={type} required={required} defaultValue={value || ""} className={field} /></label>;
}

function Textarea({ name, label, value, rows, required = false, wide = false }: { name: string; label: string; value?: string; rows: number; required?: boolean; wide?: boolean }) {
  return <label className={`block text-sm font-bold text-slate-700 ${wide ? "sm:col-span-2" : ""}`}>{label}<textarea name={name} rows={rows} required={required} defaultValue={value || ""} className={`${field} resize-y font-mono text-sm`} /></label>;
}
