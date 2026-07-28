import "server-only";

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "gulf_auth_session";
const SESSION_DAYS = 30;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const hashValue = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, expectedHex] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.authSession.create({
    data: { userId, tokenHash: hashValue(token), expiresAt },
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashValue(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("AUTH_REQUIRED");
  return user;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.authSession.deleteMany({ where: { tokenHash: hashValue(token) } });
  }
  store.delete(SESSION_COOKIE);
}

