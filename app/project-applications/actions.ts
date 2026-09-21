"use server";

import { revalidatePath } from "next/cache";
import { BLOCKED_ACTIVITY_MESSAGE, getCurrentUser, normalizeEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ProjectApplicationState = {
  success: boolean;
  message: string;
  applicationId?: string;
  errors?: Record<string, string>;
};

const text = (data: FormData, name: string) => String(data.get(name) ?? "").trim();

function refresh(applicationId: string, slug: string) {
  revalidatePath("/my-applications");
  revalidatePath(`/my-applications/${applicationId}`);
  revalidatePath("/my-project-applications");
  revalidatePath(`/projects-tenders/${slug}`);
  revalidatePath(`/projects-tenders/${slug}/apply`);
  revalidatePath("/admin/project-applications");
}

export async function submitProjectApplication(
  _state: ProjectApplicationState,
  data: FormData,
): Promise<ProjectApplicationState> {
  const user = await getCurrentUser();
  if (!user?.emailVerifiedAt) return { success: false, message: "Sign in with a verified account to apply." };
  if (user.blockedAt) return { success: false, message: BLOCKED_ACTIVITY_MESSAGE };

  const slug = text(data, "projectSlug");
  const values = {
    companyName: text(data, "companyName"),
    contactPerson: text(data, "contactPerson"),
    contactEmail: normalizeEmail(text(data, "contactEmail")),
    contactPhone: text(data, "contactPhone"),
    proposedRole: text(data, "proposedRole"),
    coverMessage: text(data, "coverMessage"),
    supportingDocumentUrl: text(data, "supportingDocumentUrl"),
  };
  const errors: Record<string, string> = {};
  if (!values.companyName) errors.companyName = "Enter your company name.";
  if (!values.contactPerson) errors.contactPerson = "Enter the contact person.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) errors.contactEmail = "Enter a valid email.";
  if (!values.contactPhone) errors.contactPhone = "Enter a contact phone.";
  if (!values.proposedRole) errors.proposedRole = "Describe your proposed role or service.";
  if (values.coverMessage.length < 30 || values.coverMessage.length > 3000) errors.coverMessage = "Use between 30 and 3,000 characters.";
  if (values.supportingDocumentUrl && !values.supportingDocumentUrl.startsWith("/api/listing-documents/")) {
    try {
      const url = new URL(values.supportingDocumentUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      errors.supportingDocumentUrl = "Enter a valid HTTPS document URL.";
    }
  }
  if (Object.keys(errors).length) return { success: false, message: "Correct the highlighted fields.", errors };

  const project = await prisma.projectTender.findFirst({
    where: { slug, listingStatus: "published" },
    select: { id: true, slug: true, ownerId: true },
  });
  if (!project) return { success: false, message: "This project is no longer accepting applications." };
  if (project.ownerId === user.id) return { success: false, message: "You cannot apply to your own project." };

  const existing = await prisma.projectApplication.findUnique({
    where: { projectTenderId_applicantId: { projectTenderId: project.id, applicantId: user.id } },
    select: { id: true, status: true },
  });
  if (existing && !["submitted"].includes(existing.status)) {
    return { success: false, message: "This application can no longer be edited." };
  }

  const payload = {
    ...values,
    supportingDocumentUrl: values.supportingDocumentUrl || null,
    status: "submitted",
    withdrawnAt: null,
  };
  const application = existing
    ? await prisma.projectApplication.update({ where: { id: existing.id }, data: payload })
    : await prisma.projectApplication.create({
        data: { ...payload, projectTenderId: project.id, applicantId: user.id },
      });
  await prisma.projectApplicationEvent.create({
    data: {
      applicationId: application.id,
      actorId: user.id,
      status: "submitted",
      note: existing ? "Application updated and resubmitted." : "Application submitted to the project owner.",
    },
  });
  refresh(application.id, project.slug);
  return { success: true, message: "Application submitted successfully.", applicationId: application.id };
}

export async function withdrawProjectApplication(id: string) {
  const user = await getCurrentUser();
  if (!user || user.blockedAt) return;
  const application = await prisma.projectApplication.findFirst({
    where: { id, applicantId: user.id, status: { in: ["submitted", "under_review", "shortlisted"] } },
    select: { id: true, projectTender: { select: { slug: true } } },
  });
  if (!application) return;
  await prisma.$transaction([
    prisma.projectApplication.update({ where: { id }, data: { status: "withdrawn", withdrawnAt: new Date() } }),
    prisma.projectApplicationEvent.create({ data: { applicationId: id, actorId: user.id, status: "withdrawn", note: "Application withdrawn by applicant." } }),
  ]);
  refresh(id, application.projectTender.slug);
}

export async function reviewProjectApplication(
  id: string,
  status: "under_review" | "shortlisted" | "accepted" | "rejected",
) {
  const user = await getCurrentUser();
  if (!user || user.blockedAt) return;
  const allowedCurrent =
    status === "under_review" ? ["submitted"] :
    status === "shortlisted" ? ["submitted", "under_review"] :
    ["submitted", "under_review", "shortlisted"];
  const application = await prisma.projectApplication.findFirst({
    where: { id, status: { in: allowedCurrent }, projectTender: { ownerId: user.id } },
    select: { id: true, projectTender: { select: { slug: true } } },
  });
  if (!application) return;
  await prisma.$transaction([
    prisma.projectApplication.update({ where: { id }, data: { status } }),
    prisma.projectApplicationEvent.create({
      data: { applicationId: id, actorId: user.id, status, note: `Project owner marked the application as ${status.replace("_", " ")}.` },
    }),
  ]);
  refresh(id, application.projectTender.slug);
}
