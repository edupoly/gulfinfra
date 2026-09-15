"use server";

import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { BLOCKED_ACTIVITY_MESSAGE, getActivityRestriction, getCurrentUser } from "@/lib/auth";

export type ContractorDraftState = {
  success: boolean;
  message: string;
  contractorId?: string;
  editToken?: string;
  errors?: Record<string, string>;
};

export type ContractorMediaState = {
  success: boolean;
  message: string;
  review?: ContractorReviewData;
  errors?: Record<string, string>;
};

export type ContractorReviewData = {
  slug: string;
  name: string;
  companyType: string;
  yearEstablished: number | null;
  employees: string | null;
  contractorTypes: string[];
  services: string[];
  country: string;
  city: string;
  address: string | null;
  areasServed: string[];
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  description: string | null;
  projectsCompleted: number | null;
  responseTime: string | null;
  logoUrl: string | null;
  galleryUrls: string[];
  documents: Array<{ name: string; documentType: string; documentUrl: string }>;
};

export type ContractorPublishState = {
  success: boolean;
  message: string;
  slug?: string;
};

const initialFailure: ContractorDraftState = {
  success: false,
  message: "Please correct the highlighted details and try again.",
};

const text = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

const splitList = (value: string) =>
  [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];

const optionalText = (value: string) => value || null;
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

function isWebUrl(value: string) {
  if (value.startsWith("/api/listing-documents/") || value.startsWith("/api/listing-images/")) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function makeSlug(name: string) {
  const base =
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "contractor";

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function saveContractorDraft(
  _previousState: ContractorDraftState,
  formData: FormData,
): Promise<ContractorDraftState> {
  const restriction = await getActivityRestriction();
  if (restriction) return { success: false, message: restriction };
  const values = {
    name: text(formData, "name"),
    companyType: text(formData, "companyType"),
    yearEstablished: Number(text(formData, "yearEstablished")),
    employees: text(formData, "employees"),
    license: text(formData, "license"),
    services: splitList(text(formData, "services")),
    country: text(formData, "country"),
    city: text(formData, "city"),
    address: text(formData, "address"),
    areasServed: splitList(text(formData, "areasServed")),
    email: text(formData, "email").toLowerCase(),
    phone: text(formData, "phone"),
    whatsapp: text(formData, "whatsapp"),
    website: text(formData, "website"),
    description: text(formData, "description"),
    projectsCompleted: text(formData, "projectsCompleted"),
    responseTime: text(formData, "responseTime"),
    contractorTypes: [
      ...new Set(
        formData
          .getAll("contractorTypes")
          .map(String)
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ],
  };

  const errors: Record<string, string> = {};

  const currentYear = new Date().getFullYear();

  if (values.name.length < 2 || values.name.length > 120) {
    errors.name = "Enter a company name between 2 and 120 characters.";
  }
  if (!values.companyType) errors.companyType = "Select a company type.";
  if (
    !Number.isInteger(values.yearEstablished) ||
    values.yearEstablished < 1900 ||
    values.yearEstablished > currentYear
  ) {
    errors.yearEstablished = `Enter a year between 1900 and ${currentYear}.`;
  }
  if (!values.contractorTypes.length) {
    errors.contractorTypes = "Select at least one specialization.";
  }
  if (!values.services.length) errors.services = "Enter at least one service.";
  if (!values.country) errors.country = "Select a country.";
  if (!values.city) errors.city = "Select a city.";
  if (!values.address) errors.address = "Enter the office address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid business email.";
  }
  if (values.phone.length < 7) errors.phone = "Enter a valid phone number.";
  if (values.website) {
    try {
      const url = new URL(values.website);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      errors.website = "Enter a complete website URL beginning with http:// or https://.";
    }
  }
  if (values.description.length < 80 || values.description.length > 1500) {
    errors.description = "Use between 80 and 1,500 characters.";
  }

  const projectsCompleted = values.projectsCompleted
    ? Number(values.projectsCompleted)
    : 0;
  if (!Number.isInteger(projectsCompleted) || projectsCompleted < 0) {
    errors.projectsCompleted = "Enter zero or a positive whole number.";
  }

  if (Object.keys(errors).length) return { ...initialFailure, errors };

  const [category, country, city, validTypes] = await Promise.all([
    prisma.category.findUnique({
      where: { slug: "contractors" },
      select: { slug: true },
    }),
    prisma.country.findUnique({
      where: { code: values.country },
      select: { code: true },
    }),
    prisma.city.findFirst({
      where: { slug: values.city, countryCode: values.country },
      select: { slug: true },
    }),
    prisma.contractorType.findMany({
      where: { slug: { in: values.contractorTypes } },
      select: { slug: true },
    }),
  ]);

  if (!category) {
    return {
      success: false,
      message: "Contractor listings are temporarily unavailable. Please try again later.",
    };
  }
  if (!country) errors.country = "Select a valid country.";
  if (!city) errors.city = "Select a city in the chosen country.";
  if (validTypes.length !== values.contractorTypes.length) {
    errors.contractorTypes = "One or more specializations are invalid.";
  }
  if (Object.keys(errors).length) return { ...initialFailure, errors };

  try {
    const editToken = randomBytes(32).toString("hex");
    const contractor = await prisma.$transaction(
      async (transaction) => {
        const created = await transaction.contractor.create({
          data: {
            slug: makeSlug(values.name),
            categorySlug: category.slug,
            listingStatus: "draft",
            draftTokenHash: hashToken(editToken),
            name: values.name,
            companyType: values.companyType,
            primaryTypeSlug: values.contractorTypes[0],
            countryCode: country!.code,
            citySlug: city!.slug,
            yearEstablished: values.yearEstablished,
            employees: optionalText(values.employees),
            website: optionalText(values.website),
            email: values.email,
            phone: values.phone,
            whatsapp: optionalText(values.whatsapp),
            address: values.address,
            description: values.description,
            responseTime: optionalText(values.responseTime),
            projectsCompleted,
          },
          select: { id: true },
        });

        await Promise.all([
          transaction.contractorTypeLink.createMany({
            data: validTypes.map(({ slug }) => ({
              contractorId: created.id,
              contractorTypeSlug: slug,
            })),
          }),
          transaction.contractorCountryLink.create({
            data: { contractorId: created.id, countryCode: country!.code },
          }),
          transaction.contractorCityLink.create({
            data: { contractorId: created.id, citySlug: city!.slug },
          }),
          transaction.contractorService.createMany({
            data: values.services.map((serviceName) => ({
              contractorId: created.id,
              serviceName,
            })),
          }),
          ...(values.areasServed.length
            ? [
                transaction.contractorAreaServed.createMany({
                  data: values.areasServed.map((areaName) => ({
                    contractorId: created.id,
                    areaName,
                  })),
                }),
              ]
            : []),
          ...(values.license
            ? [
                transaction.contractorLicense.create({
                  data: {
                    contractorId: created.id,
                    licenseName: values.license,
                  },
                }),
              ]
            : []),
        ]);

        return created;
      },
      { maxWait: 15_000, timeout: 30_000 },
    );

    return {
      success: true,
      message: "Your contractor profile has been saved as a private draft.",
      contractorId: contractor.id,
      editToken,
    };
  } catch (error) {
    console.error("Unable to save contractor draft", error);
    return {
      success: false,
      message: "We could not save the draft. Please try again.",
    };
  }
}

export async function saveContractorMedia(
  _previousState: ContractorMediaState,
  formData: FormData,
): Promise<ContractorMediaState> {
  const restriction = await getActivityRestriction();
  if (restriction) return { success: false, message: restriction };
  if (formData.getAll("listingUploadPending").some(Boolean)) {
    return { success: false, message: "Wait for all uploads to finish before continuing." };
  }
  const contractorId = text(formData, "contractorId");
  const editToken = text(formData, "editToken");
  const logoUrl = text(formData, "logoUrl");
  const galleryUrls = formData
    .getAll("galleryUrls")
    .map(String)
    .map((item) => item.trim())
    .filter(Boolean);
  const documentNames = formData.getAll("documentNames").map(String);
  const documentTypes = formData.getAll("documentTypes").map(String);
  const documentUrls = formData.getAll("documentUrls").map(String);
  const errors: Record<string, string> = {};

  if (!contractorId || !editToken) {
    return { success: false, message: "This draft session has expired. Start a new listing." };
  }
  if (logoUrl && !isWebUrl(logoUrl)) {
    errors.logoUrl = "Enter a complete http:// or https:// logo URL.";
  }
  if (galleryUrls.length > 6 || galleryUrls.some((url) => !isWebUrl(url))) {
    errors.galleryUrls = "Add up to six valid image URLs.";
  }

  const documents = documentUrls
    .map((url, index) => ({
      documentUrl: url.trim(),
      name: documentNames[index]?.trim() ?? "",
      documentType: documentTypes[index]?.trim() || "Other",
    }))
    .filter((item) => item.documentUrl || item.name);

  if (
    documents.length > 5 ||
    documents.some(
      (document) =>
        !document.name ||
        !document.documentUrl ||
        !isWebUrl(document.documentUrl),
    )
  ) {
    errors.documents = "Each document needs a name and a valid URL. Add up to five documents.";
  }
  if (Object.keys(errors).length) {
    return {
      success: false,
      message: "Please correct the media and document details.",
      errors,
    };
  }

  const draft = await prisma.contractor.findFirst({
    where: {
      id: contractorId,
      listingStatus: "draft",
      draftTokenHash: hashToken(editToken),
    },
    select: { id: true },
  });
  if (!draft) {
    return { success: false, message: "This draft could not be verified. Start a new listing." };
  }

  try {
    await prisma.$transaction([
      prisma.contractor.update({
        where: { id: contractorId },
        data: { logoUrl: optionalText(logoUrl) },
      }),
      prisma.contractorGalleryItem.deleteMany({ where: { contractorId } }),
      prisma.contractorDocument.deleteMany({ where: { contractorId } }),
      ...(galleryUrls.length
        ? [
            prisma.contractorGalleryItem.createMany({
              data: galleryUrls.map((imageUrl) => ({ contractorId, imageUrl })),
            }),
          ]
        : []),
      ...(documents.length
        ? [
            prisma.contractorDocument.createMany({
              data: documents.map((document) => ({ contractorId, ...document })),
            }),
          ]
        : []),
    ]);

    const review = await prisma.contractor.findUnique({
      where: { id: contractorId },
      select: {
        slug: true,
        name: true,
        companyType: true,
        yearEstablished: true,
        employees: true,
        address: true,
        email: true,
        phone: true,
        whatsapp: true,
        website: true,
        description: true,
        projectsCompleted: true,
        responseTime: true,
        logoUrl: true,
        contractorTypes: {
          select: { contractorType: { select: { name: true } } },
        },
        services: { select: { serviceName: true } },
        countries: { select: { country: { select: { name: true } } } },
        cities: { select: { city: { select: { name: true } } } },
        areasServed: { select: { areaName: true } },
        galleryItems: { select: { imageUrl: true } },
        documents: {
          select: { name: true, documentType: true, documentUrl: true },
        },
      },
    });

    if (!review) {
      return { success: false, message: "The saved draft could not be loaded for review." };
    }

    return {
      success: true,
      message: "Media and documents have been saved. Your draft is ready for final review.",
      review: {
        slug: review.slug,
        name: review.name,
        companyType: review.companyType,
        yearEstablished: review.yearEstablished,
        employees: review.employees,
        address: review.address,
        email: review.email,
        phone: review.phone,
        whatsapp: review.whatsapp,
        website: review.website,
        description: review.description,
        projectsCompleted: review.projectsCompleted,
        responseTime: review.responseTime,
        logoUrl: review.logoUrl,
        documents: review.documents,
        contractorTypes: review.contractorTypes.map(
          (item) => item.contractorType.name,
        ),
        services: review.services.map((item) => item.serviceName),
        country: review.countries[0]?.country.name ?? "",
        city: review.cities[0]?.city.name ?? "",
        areasServed: review.areasServed.map((item) => item.areaName),
        galleryUrls: review.galleryItems.map((item) => item.imageUrl),
      },
    };
  } catch (error) {
    console.error("Unable to save contractor media", error);
    return { success: false, message: "We could not save Step 3. Please try again." };
  }
}

export async function publishContractor(
  _previousState: ContractorPublishState,
  formData: FormData,
): Promise<ContractorPublishState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Verify your email before publishing." };
  if (user.blockedAt) return { success: false, message: BLOCKED_ACTIVITY_MESSAGE };
  const contractorId = text(formData, "contractorId");
  const editToken = text(formData, "editToken");

  if (!contractorId || !editToken) {
    return { success: false, message: "This draft session has expired." };
  }

  const draft = await prisma.contractor.findFirst({
    where: {
      id: contractorId,
      listingStatus: "draft",
      draftTokenHash: hashToken(editToken),
    },
    select: { id: true, slug: true },
  });
  if (!draft) {
    return {
      success: false,
      message: "This draft could not be verified or has already been published.",
    };
  }

  try {
    await prisma.contractor.update({
      where: { id: draft.id },
      data: {
        listingStatus: "pending",
        draftTokenHash: null,
        ownerId: user.id,
        memberSince: String(new Date().getFullYear()),
      },
    });

    revalidatePath("/contractors");
    revalidatePath(`/contractors/${draft.slug}`);

    return {
      success: true,
      message: "Your contractor listing was submitted for admin approval.",
      slug: draft.slug,
    };
  } catch (error) {
    console.error("Unable to publish contractor", error);
    return {
      success: false,
      message: "We could not publish the listing. Your draft is still safely saved.",
    };
  }
}
