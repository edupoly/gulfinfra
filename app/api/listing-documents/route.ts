import { getActivityRestriction } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".dwg"]);

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

  if (!draftId || !editToken || !(await draftExists(draftKind, draftId, tokenHash))) {
    return Response.json({ error: "This draft could not be verified. Start a new listing." }, { status: 403 });
  }
  if (!files.length || files.length > MAX_FILES) return Response.json({ error: `Choose between 1 and ${MAX_FILES} documents.` }, { status: 400 });
  if (files.some((file) => file.size > MAX_FILE_SIZE)) return Response.json({ error: "Each document must be 10 MB or smaller." }, { status: 413 });
  if (files.some((file) => !allowedExtensions.has(path.extname(file.name).toLowerCase()))) {
    return Response.json({ error: "One or more document formats are not supported." }, { status: 415 });
  }

  const uploadDirectory = path.join(process.cwd(), ".data", "listing-documents");
  await mkdir(uploadDirectory, { recursive: true });
  const uploaded = [];
  for (const file of files) {
    const extension = path.extname(file.name).toLowerCase();
    const storedName = `${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDirectory, storedName), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    uploaded.push({ name: path.basename(file.name, extension), url: `/api/listing-documents/${storedName}` });
  }
  return Response.json({ files: uploaded }, { status: 201 });
}
