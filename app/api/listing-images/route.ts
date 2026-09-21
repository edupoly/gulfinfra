import { getActivityRestriction, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_FILES = 8;
const allowedTypes = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/gif", ".gif"]]);

async function draftExists(kind: string, id: string, tokenHash: string) {
  const where = { id, listingStatus: "draft", draftTokenHash: tokenHash };
  if (kind === "contractor") return Boolean(await prisma.contractor.findFirst({ where, select: { id: true } }));
  if (kind === "project") return Boolean(await prisma.projectTender.findFirst({ where, select: { id: true } }));
  if (kind === "equipment") return Boolean(await prisma.equipment.findFirst({ where, select: { id: true } }));
  if (kind === "material") return Boolean(await prisma.material.findFirst({ where, select: { id: true } }));
  if (kind === "business") return Boolean(await prisma.businessOpportunity.findFirst({ where, select: { id: true } }));
  return false;
}

export async function POST(request: Request) {
  if (await getActivityRestriction()) return Response.json({ error: "Listing activity is unavailable." }, { status: 403 });
  const data = await request.formData();
  const draftKind = String(data.get("draftKind") ?? "");
  const draftId = String(data.get("draftId") ?? "");
  const editToken = String(data.get("editToken") ?? "");
  const files = data.getAll("files").filter((item): item is File => item instanceof File);
  const tokenHash = createHash("sha256").update(editToken).digest("hex");
  const draftIsValid = Boolean(draftId && editToken && await draftExists(draftKind, draftId, tokenHash));
  if (!draftIsValid && !(await getCurrentUser())) return Response.json({ error: "Sign in before uploading files." }, { status: 401 });
  if (!files.length || files.length > MAX_FILES) return Response.json({ error: `Choose between 1 and ${MAX_FILES} images.` }, { status: 400 });
  if (files.some((file) => file.size > MAX_FILE_SIZE)) return Response.json({ error: "Each image must be 8 MB or smaller." }, { status: 413 });
  if (files.some((file) => !allowedTypes.has(file.type))) return Response.json({ error: "Only JPG, PNG, WebP, and GIF images are supported." }, { status: 415 });

  const uploadDirectory = path.join(process.cwd(), ".data", "listing-images");
  await mkdir(uploadDirectory, { recursive: true });
  const uploaded = [];
  for (const file of files) {
    const storedName = `${randomUUID()}${allowedTypes.get(file.type)}`;
    await writeFile(path.join(uploadDirectory, storedName), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    uploaded.push({ name: path.basename(file.name, path.extname(file.name)), url: `/api/listing-images/${storedName}` });
  }
  return Response.json({ files: uploaded }, { status: 201 });
}
