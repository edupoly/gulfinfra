"use server";

import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export type ProjectDraftState = {
  success: boolean;
  message: string;
  projectId?: string;
  editToken?: string;
  errors?: Record<string, string>;
};

export type ProjectReviewData = {
  slug: string;
  title: string;
  projectType: string | null;
  status: string;
  summary: string | null;
  description: string | null;
  budget: string | null;
  deadline: string | null;
  client: string | null;
  value: string | null;
  tenderType: string | null;
  location: string | null;
  projectTypes: string[];
  sectors: string[];
  country: string;
  city: string;
  imageUrls: string[];
  documents: Array<{ name: string; documentType: string; documentUrl: string }>;
};

export type ProjectMediaState = {
  success: boolean;
  message: string;
  review?: ProjectReviewData;
  errors?: Record<string, string>;
};

export type ProjectPublishState = {
  success: boolean;
  message: string;
  slug?: string;
};

const text = (data: FormData, name: string) =>
  String(data.get(name) ?? "").trim();
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const split = (value: string) =>
  [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];

function slugify(value: string) {
  const base =
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) || "project";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function isUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export async function saveProjectDraft(
  _state: ProjectDraftState,
  data: FormData,
): Promise<ProjectDraftState> {
  const values = {
    title: text(data, "title"),
    projectTypes: [...new Set(data.getAll("projectTypes").map(String))],
    status: text(data, "status"),
    tenderType: text(data, "tenderType"),
    client: text(data, "client"),
    budget: text(data, "budget"),
    value: text(data, "value"),
    deadline: text(data, "deadline"),
    country: text(data, "country"),
    city: text(data, "city"),
    location: text(data, "location"),
    sectors: split(text(data, "sectors")),
    summary: text(data, "summary"),
    description: text(data, "description"),
  };
  const errors: Record<string, string> = {};
  if (values.title.length < 5 || values.title.length > 160)
    errors.title = "Enter a title between 5 and 160 characters.";
  if (!values.projectTypes.length)
    errors.projectTypes = "Select at least one project type.";
  if (!values.status) errors.status = "Select a project status.";
  if (!values.client) errors.client = "Enter the client or issuing authority.";
  if (!values.deadline) errors.deadline = "Select a deadline.";
  if (!values.country) errors.country = "Select a country.";
  if (!values.city) errors.city = "Select a city.";
  if (!values.location) errors.location = "Enter the project location.";
  if (!values.sectors.length) errors.sectors = "Enter at least one sector.";
  if (values.summary.length < 30 || values.summary.length > 300)
    errors.summary = "Use between 30 and 300 characters.";
  if (values.description.length < 100 || values.description.length > 3000)
    errors.description = "Use between 100 and 3,000 characters.";
  if (Object.keys(errors).length)
    return { success: false, message: "Please correct the project details.", errors };

  const [category, country, city, types] = await Promise.all([
    prisma.category.findUnique({ where: { slug: "projects-tenders" }, select: { slug: true } }),
    prisma.country.findUnique({ where: { code: values.country }, select: { code: true } }),
    prisma.city.findFirst({ where: { slug: values.city, countryCode: values.country }, select: { slug: true } }),
    prisma.projectTenderType.findMany({ where: { slug: { in: values.projectTypes } }, select: { slug: true, name: true } }),
  ]);
  if (!category)
    return { success: false, message: "Project listings are temporarily unavailable." };
  if (!country) errors.country = "Select a valid country.";
  if (!city) errors.city = "Select a city in the chosen country.";
  if (types.length !== values.projectTypes.length)
    errors.projectTypes = "One or more project types are invalid.";
  if (Object.keys(errors).length)
    return { success: false, message: "Please correct the project details.", errors };

  try {
    const editToken = randomBytes(32).toString("hex");
    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.projectTender.create({
        data: {
          slug: slugify(values.title),
          categorySlug: category.slug,
          listingStatus: "draft",
          draftTokenHash: hash(editToken),
          title: values.title,
          projectType: types[0]?.name ?? null,
          status: values.status,
          tenderType: values.tenderType || null,
          client: values.client,
          budget: values.budget || null,
          value: values.value || null,
          deadline: values.deadline,
          location: values.location,
          summary: values.summary,
          description: values.description,
          posted: "Draft",
        },
        select: { id: true },
      });
      await Promise.all([
        tx.projectTenderTypeLink.createMany({
          data: types.map(({ slug }) => ({
            projectTenderId: created.id,
            projectTenderTypeSlug: slug,
          })),
        }),
        tx.projectTenderCountryLink.create({
          data: { projectTenderId: created.id, countryCode: country!.code },
        }),
        tx.projectTenderCityLink.create({
          data: { projectTenderId: created.id, citySlug: city!.slug },
        }),
        tx.projectTenderSector.createMany({
          data: values.sectors.map((sectorName) => ({
            projectTenderId: created.id,
            sectorName,
          })),
        }),
      ]);
      return created;
    }, { maxWait: 15_000, timeout: 30_000 });

    return {
      success: true,
      message: "Your project has been saved as a private draft.",
      projectId: project.id,
      editToken,
    };
  } catch (error) {
    console.error("Unable to save project draft", error);
    return { success: false, message: "We could not save the project draft. Please try again." };
  }
}

async function loadReview(projectId: string): Promise<ProjectReviewData | null> {
  const project = await prisma.projectTender.findUnique({
    where: { id: projectId },
    include: {
      projectTenderTypes: { include: { projectTenderType: true } },
      countries: { include: { country: true } },
      cities: { include: { city: true } },
      sectors: true,
      documents: true,
    },
  });
  if (!project) return null;
  return {
    slug: project.slug,
    title: project.title,
    projectType: project.projectType,
    status: project.status,
    summary: project.summary,
    description: project.description,
    budget: project.budget,
    deadline: project.deadline,
    client: project.client,
    value: project.value,
    tenderType: project.tenderType,
    location: project.location,
    projectTypes: project.projectTenderTypes.map((item) => item.projectTenderType.name),
    sectors: project.sectors.map((item) => item.sectorName),
    country: project.countries[0]?.country.name ?? "",
    city: project.cities[0]?.city.name ?? "",
    imageUrls: project.imageUrls,
    documents: project.documents.map(({ name, documentType, documentUrl }) => ({
      name,
      documentType,
      documentUrl,
    })),
  };
}

export async function saveProjectMedia(
  _state: ProjectMediaState,
  data: FormData,
): Promise<ProjectMediaState> {
  const projectId = text(data, "projectId");
  const editToken = text(data, "editToken");
  const imageUrls = data.getAll("imageUrls").map(String).map((item) => item.trim()).filter(Boolean);
  const names = data.getAll("documentNames").map(String);
  const types = data.getAll("documentTypes").map(String);
  const urls = data.getAll("documentUrls").map(String);
  const documents = urls.map((documentUrl, index) => ({
    name: names[index]?.trim() ?? "",
    documentType: types[index]?.trim() || "Other",
    documentUrl: documentUrl.trim(),
  })).filter((item) => item.name || item.documentUrl);
  const errors: Record<string, string> = {};
  if (imageUrls.length > 6 || imageUrls.some((url) => !isUrl(url)))
    errors.images = "Add up to six valid image URLs.";
  if (documents.length > 5 || documents.some((item) => !item.name || !isUrl(item.documentUrl)))
    errors.documents = "Each document needs a name and valid URL.";
  if (Object.keys(errors).length)
    return { success: false, message: "Please correct the media details.", errors };

  const draft = await prisma.projectTender.findFirst({
    where: { id: projectId, listingStatus: "draft", draftTokenHash: hash(editToken) },
    select: { id: true },
  });
  if (!draft)
    return { success: false, message: "This project draft could not be verified." };

  try {
    await prisma.$transaction([
      prisma.projectTender.update({ where: { id: projectId }, data: { imageUrls } }),
      prisma.projectTenderDocument.deleteMany({ where: { projectTenderId: projectId } }),
      ...(documents.length ? [prisma.projectTenderDocument.createMany({
        data: documents.map((item) => ({ projectTenderId: projectId, ...item })),
      })] : []),
    ]);
    const review = await loadReview(projectId);
    return review
      ? { success: true, message: "Project media saved.", review }
      : { success: false, message: "The project could not be loaded for review." };
  } catch (error) {
    console.error("Unable to save project media", error);
    return { success: false, message: "We could not save the project media." };
  }
}

export async function publishProject(
  _state: ProjectPublishState,
  data: FormData,
): Promise<ProjectPublishState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Verify your email before publishing." };
  const projectId = text(data, "projectId");
  const editToken = text(data, "editToken");
  const draft = await prisma.projectTender.findFirst({
    where: { id: projectId, listingStatus: "draft", draftTokenHash: hash(editToken) },
    select: { id: true, slug: true },
  });
  if (!draft)
    return { success: false, message: "This project draft could not be verified." };
  try {
    await prisma.projectTender.update({
      where: { id: draft.id },
      data: {
        listingStatus: "published",
        draftTokenHash: null,
        ownerId: user.id,
        posted: new Date().toLocaleDateString("en-GB"),
      },
    });
    revalidatePath("/projects-tenders");
    revalidatePath(`/projects-tenders/${draft.slug}`);
    return { success: true, message: "Your project listing has been published.", slug: draft.slug };
  } catch (error) {
    console.error("Unable to publish project", error);
    return { success: false, message: "We could not publish the project. Your draft is still saved." };
  }
}
