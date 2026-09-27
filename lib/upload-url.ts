const INTERNAL_UPLOAD_PATHS = [
  "/api/listing-images/",
  "/api/listing-documents/",
  "/api/private-files?",
] as const;

export function isUploadedFileUrl(value: string) {
  return INTERNAL_UPLOAD_PATHS.some((path) => value.startsWith(path));
}

export function isHttpOrUploadedFileUrl(value: string) {
  if (isUploadedFileUrl(value)) return true;

  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
