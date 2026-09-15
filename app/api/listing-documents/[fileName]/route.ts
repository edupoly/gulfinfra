import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".pdf": "application/pdf", ".doc": "application/msword", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint", ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain", ".csv": "text/csv", ".dwg": "application/acad",
};

export async function GET(_request: Request, { params }: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await params;
  if (!/^[a-f0-9-]+\.[a-z0-9]+$/i.test(fileName)) return new Response("Not found", { status: 404 });
  try {
    const file = await readFile(path.join(process.cwd(), ".data", "listing-documents", fileName));
    return new Response(file, { headers: { "Content-Type": contentTypes[path.extname(fileName).toLowerCase()] || "application/octet-stream", "Content-Disposition": "inline", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
