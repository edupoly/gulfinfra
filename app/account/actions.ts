"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  BLOCKED_ACTIVITY_MESSAGE,
  getCurrentUser,
  hashPassword,
  hashValue,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export type AccountActionState = {
  success: boolean;
  message: string;
};

const optionalText = (data: FormData, name: string, maxLength: number) => {
  const value = String(data.get(name) ?? "").trim();
  return value ? value.slice(0, maxLength) : null;
};

export async function updateProfile(
  _state: AccountActionState,
  data: FormData,
): Promise<AccountActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Your session expired. Sign in again." };
  if (user.blockedAt) return { success: false, message: BLOCKED_ACTIVITY_MESSAGE };

  const profileImageUrl = optionalText(data, "profileImageUrl", 500);
  if (profileImageUrl) {
    try {
      const parsed = new URL(profileImageUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch {
      return { success: false, message: "Enter a valid HTTPS profile photo URL." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: optionalText(data, "fullName", 100),
      phone: optionalText(data, "phone", 30),
      company: optionalText(data, "company", 120),
      jobTitle: optionalText(data, "jobTitle", 100),
      country: optionalText(data, "country", 80),
      profileImageUrl,
    },
  });
  revalidatePath("/my-listings");
  revalidatePath("/", "layout");
  return { success: true, message: "Profile updated successfully." };
}

const validPassword = (value: string) =>
  value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

function passwordValidation(password: string, confirmation: string) {
  if (!validPassword(password)) {
    return "Use at least 8 characters with a letter and number.";
  }
  if (password !== confirmation) return "Passwords do not match.";
  return null;
}

export async function changePassword(
  _state: AccountActionState,
  data: FormData,
): Promise<AccountActionState> {
  const user = await getCurrentUser();
  if (!user?.passwordHash) {
    return { success: false, message: "Your session expired. Sign in again." };
  }
  if (user.blockedAt) return { success: false, message: BLOCKED_ACTIVITY_MESSAGE };

  const currentPassword = String(data.get("currentPassword") ?? "");
  const password = String(data.get("password") ?? "");
  const confirmation = String(data.get("confirmation") ?? "");

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return { success: false, message: "Your current password is incorrect." };
  }
  const validationError = passwordValidation(password, confirmation);
  if (validationError) return { success: false, message: validationError };
  if (await verifyPassword(password, user.passwordHash)) {
    return { success: false, message: "Choose a password you have not just used." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.authSession.deleteMany({ where: { userId: user.id } }),
  ]);
  await createSession(user.id);

  return { success: true, message: "Password changed successfully." };
}

export async function createInitialPassword(
  _state: AccountActionState,
  data: FormData,
): Promise<AccountActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Your session expired. Sign in again." };
  if (user.blockedAt) return { success: false, message: BLOCKED_ACTIVITY_MESSAGE };
  if (user.passwordHash) {
    return { success: false, message: "A password already exists. Use Change password instead." };
  }

  const password = String(data.get("password") ?? "");
  const confirmation = String(data.get("confirmation") ?? "");
  const validationError = passwordValidation(password, confirmation);
  if (validationError) return { success: false, message: validationError };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id, passwordHash: null },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.authSession.deleteMany({ where: { userId: user.id } }),
  ]);
  await createSession(user.id);

  return { success: true, message: "Password created successfully." };
}

export async function requestPasswordReset(
  _state: AccountActionState,
  data: FormData,
): Promise<AccountActionState> {
  const email = normalizeEmail(String(data.get("email") ?? ""));
  const genericResponse = {
    success: true,
    message: "If an account exists for that email, we sent a password reset link.",
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return genericResponse;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.emailVerifiedAt) return genericResponse;

  const recent = await prisma.emailOtp.findFirst({
    where: {
      userId: user.id,
      purpose: "password_reset",
      createdAt: { gt: new Date(Date.now() - 60_000) },
    },
  });
  if (recent) return genericResponse;

  const token = randomBytes(32).toString("hex");
  const resetRecord = await prisma.emailOtp.create({
    data: {
      userId: user.id,
      purpose: "password_reset",
      codeHash: hashValue(token),
      expiresAt: new Date(Date.now() + 30 * 60_000),
    },
  });

  try {
    const requestHeaders = await headers();
    const baseUrl =
      process.env.APP_URL ||
      requestHeaders.get("origin") ||
      `http://${requestHeaders.get("host") || "localhost:3000"}`;
    const resetUrl = new URL("/reset-password", baseUrl);
    resetUrl.searchParams.set("token", token);
    await sendPasswordResetEmail(email, resetUrl.toString());
  } catch (error) {
    await prisma.emailOtp.delete({ where: { id: resetRecord.id } }).catch(() => undefined);
    console.error("Unable to send password reset email", error);
  }

  return genericResponse;
}

export async function resetPassword(
  _state: AccountActionState,
  data: FormData,
): Promise<AccountActionState> {
  const token = String(data.get("token") ?? "");
  const password = String(data.get("password") ?? "");
  const confirmation = String(data.get("confirmation") ?? "");
  const validationError = passwordValidation(password, confirmation);
  if (validationError) return { success: false, message: validationError };
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return { success: false, message: "This reset link is invalid or expired." };
  }

  const resetRecord = await prisma.emailOtp.findFirst({
    where: {
      purpose: "password_reset",
      codeHash: hashValue(token),
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
  if (!resetRecord) {
    return { success: false, message: "This reset link is invalid or expired." };
  }

  const passwordHash = await hashPassword(password);
  const consumed = await prisma.$transaction(async (tx) => {
    const claimed = await tx.emailOtp.updateMany({
      where: { id: resetRecord.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (claimed.count !== 1) return false;
    await tx.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });
    await tx.authSession.deleteMany({ where: { userId: resetRecord.userId } });
    return true;
  });

  if (!consumed) {
    return { success: false, message: "This reset link has already been used." };
  }
  return { success: true, message: "Password reset successfully. You can now sign in." };
}
