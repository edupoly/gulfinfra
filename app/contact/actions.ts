"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ContactState = {
  success: boolean;
  message: string;
};

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPhone = (value: string) => /^[+()\d\s-]{7,25}$/.test(value);

export async function submitContact(
  _state: ContactState,
  data: FormData,
): Promise<ContactState> {
  const fullName = String(data.get("fullName") ?? "").trim();
  const phoneOrWhatsapp = String(data.get("phoneOrWhatsapp") ?? "").trim();
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  const message = String(data.get("message") ?? "").trim();

  if (fullName.length < 2 || fullName.length > 100) {
    return { success: false, message: "Enter your full name." };
  }
  if (!validPhone(phoneOrWhatsapp)) {
    return { success: false, message: "Enter a valid phone or WhatsApp number." };
  }
  if (!validEmail(email) || email.length > 160) {
    return { success: false, message: "Enter a valid email address." };
  }
  if (message.length < 10 || message.length > 3000) {
    return { success: false, message: "Message must contain between 10 and 3,000 characters." };
  }

  await prisma.contactSubmission.create({
    data: { fullName, phoneOrWhatsapp, email, message },
  });
  revalidatePath("/admin/contact-submissions");
  return { success: true, message: "Thank you. Your message has been submitted." };
}
