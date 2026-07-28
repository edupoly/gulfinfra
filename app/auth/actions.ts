"use server";

import { randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  hashValue,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

export type AuthState = {
  success: boolean;
  message: string;
  step?: "email" | "otp" | "password" | "complete";
  email?: string;
  developmentOtp?: string;
};

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function requestOtp(_state: AuthState, data: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(data.get("email") ?? ""));
  if (!validEmail(email)) return { success: false, message: "Enter a valid email address.", step: "email" };

  const recent = await prisma.emailOtp.findFirst({
    where: { user: { email }, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recent) return { success: false, message: "Please wait one minute before requesting another code.", step: "otp", email };

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });
  const code = String(randomInt(100000, 1000000));
  await prisma.emailOtp.create({
    data: {
      userId: user.id,
      purpose: "login",
      codeHash: hashValue(`${user.id}:${code}`),
      expiresAt: new Date(Date.now() + 10 * 60_000),
    },
  });
  try {
    const result = await sendOtpEmail(email, code);
    return {
      success: true,
      message: result.delivered ? "We sent a 6-digit code to your email." : "Development code generated below.",
      step: "otp",
      email,
      developmentOtp: result.delivered ? undefined : code,
    };
  } catch (error) {
    console.error("Unable to send OTP", error);
    return { success: false, message: "We could not send the verification code. Please try again.", step: "email", email };
  }
}

export async function verifyOtp(_state: AuthState, data: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(data.get("email") ?? ""));
  const code = String(data.get("code") ?? "").trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !/^\d{6}$/.test(code)) return { success: false, message: "Enter the valid 6-digit code.", step: "otp", email };

  const otp = await prisma.emailOtp.findFirst({
    where: { userId: user.id, purpose: "login", consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.expiresAt <= new Date() || otp.attempts >= 5) {
    return { success: false, message: "This code expired. Request a new one.", step: "email", email };
  }
  if (otp.codeHash !== hashValue(`${user.id}:${code}`)) {
    await prisma.emailOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { success: false, message: "That code is incorrect.", step: "otp", email };
  }
  await prisma.$transaction([
    prisma.emailOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: user.emailVerifiedAt ?? new Date() } }),
  ]);
  await createSession(user.id);
  return {
    success: true,
    message: user.passwordHash ? "Email verified." : "Email verified. Create your password.",
    step: user.passwordHash ? "complete" : "password",
    email,
  };
}

export async function createPassword(_state: AuthState, data: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(data.get("email") ?? ""));
  const password = String(data.get("password") ?? "");
  const confirmation = String(data.get("confirmation") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  const sessionUser = await getCurrentUser();
  if (!user?.emailVerifiedAt || sessionUser?.id !== user.id) return { success: false, message: "Verify your email first.", step: "email" };
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { success: false, message: "Use at least 8 characters with a letter and number.", step: "password", email };
  }
  if (password !== confirmation) return { success: false, message: "Passwords do not match.", step: "password", email };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  return { success: true, message: "Your password has been created.", step: "complete", email };
}

export async function loginWithPassword(_state: AuthState, data: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(data.get("email") ?? ""));
  const password = String(data.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return { success: false, message: "Incorrect email or password.", step: "email", email };
  }
  await createSession(user.id);
  return { success: true, message: "Signed in successfully.", step: "complete", email };
}

export async function logout() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}
