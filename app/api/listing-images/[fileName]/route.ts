import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
const contentTypes: Record<string, string> = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };

export async function GET(_request: Request, { params }: { params: Promise<{ fileName: string }> }) {
  const { fileName } = await params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/i.test(fileName)) return new Response("Not found", { status: 404 });
  try {
    const file = await readFile(path.join(process.cwd(), ".data", "listing-images", fileName));
    return new Response(file, { headers: { "Content-Type": contentTypes[path.extname(fileName).toLowerCase()], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
