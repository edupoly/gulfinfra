import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.blockedAt) return new NextResponse("Unauthorized", { status: 401 });

  const url = request.nextUrl.searchParams.get("url");
  const requestedName = request.nextUrl.searchParams.get("name") || "document";
  if (!url) return new NextResponse("Missing file URL", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!parsed.hostname.endsWith(".private.blob.vercel-storage.com")) throw new Error();
  } catch {
    return new NextResponse("Invalid file URL", { status: 400 });
  }

  const result = await get(parsed.toString(), { access: "private" });
  if (!result || result.statusCode !== 200) return new NextResponse("File not found", { status: 404 });

  const safeName = requestedName.replace(/[\r\n"/\\]/g, "_");
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
