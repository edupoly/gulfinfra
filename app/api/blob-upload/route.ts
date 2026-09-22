import { NextResponse } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import {
  handleUpload,
  handleUploadPresigned,
  type HandleUploadBody,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const documentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/acad",
  "application/x-acad",
  "application/autocad_dwg",
  "image/vnd.dwg",
];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.blockedAt) {
    return NextResponse.json({ error: "Sign in before uploading files." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody | HandleUploadPresignedBody;
  const isPrivate = body.type === "blob.generate-presigned-url";

  try {
    if (isPrivate) {
      const json = await handleUploadPresigned({
        request,
        body: body as HandleUploadPresignedBody,
        getSignedToken: async (pathname) => ({
          token: await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes: documentTypes,
            maximumSizeInBytes: 10 * 1024 * 1024,
          }),
          urlOptions: {
            allowedContentTypes: documentTypes,
            maximumSizeInBytes: 10 * 1024 * 1024,
            addRandomSuffix: true,
          },
        }),
      });
      return NextResponse.json(json);
    }

    const json = await handleUpload({
      request,
      body: body as HandleUploadBody,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: imageTypes,
        maximumSizeInBytes: 8 * 1024 * 1024,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(json);
  } catch (error) {
    console.error("Blob upload authorization failed", error);
    return NextResponse.json({ error: "The upload could not be authorized." }, { status: 500 });
  }
}
