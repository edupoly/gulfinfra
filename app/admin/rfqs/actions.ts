"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { sendRfqModerationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

export async function moderateRfq(data: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");

  const id = text(data, "id");
  const decision = text(data, "decision") as "approve" | "changes" | "reject";
  const note = text(data, "note").slice(0, 1000);
  if (!id || !["approve", "changes", "reject"].includes(decision)) throw new Error("INVALID_DECISION");
  if (decision !== "approve" && note.length < 5) {
    redirect(`/admin/rfqs?error=${encodeURIComponent("Explain the required changes or rejection reason.")}`);
  }

  const rfq = await prisma.rfq.findUnique({
    where: { id },
    select: { reference: true, title: true, status: true, email: true },
  });
  if (!rfq || !["pending", "on_hold", "rejected"].includes(rfq.status)) throw new Error("RFQ_NOT_REVIEWABLE");

  const status = decision === "approve" ? "published" : decision === "changes" ? "on_hold" : "rejected";
  await prisma.rfq.update({
    where: { id },
    data: { status, moderationNote: note || null, moderatedAt: new Date(), moderatedByEmail: admin.email },
  });

  try {
    await sendRfqModerationEmail({
      email: rfq.email,
      reference: rfq.reference,
      title: rfq.title,
      decision: decision === "approve" ? "approved" : decision === "changes" ? "changes_requested" : "rejected",
      note: note || undefined,
    });
  } catch (error) {
    console.error("RFQ moderation email could not be sent", error);
  }

  ["/admin/rfqs", "/admin/listings", "/admin/overview", "/admin/categories", "/rfqs", "/my-rfqs"].forEach((path) => revalidatePath(path));
  const message = decision === "approve" ? "RFQ approved and opened to suppliers." : decision === "changes" ? "RFQ returned to the buyer for changes." : "RFQ rejected.";
  redirect(`/admin/rfqs?message=${encodeURIComponent(message)}`);
}
