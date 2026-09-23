"use client";

import { forwardRef, useId, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";
import { upload as uploadBlob, uploadPresigned as uploadPresignedBlob } from "@vercel/blob/client";

type UploadedFile = { name: string; url: string };

export type FileDropzoneHandle = {
  hasPendingFiles: () => boolean;
  uploadPendingFiles: () => Promise<boolean>;
};

export const FileDropzone = forwardRef<FileDropzoneHandle, {
  kind: "image" | "document";
  name: string;
  label: string;
  initialUrls?: string[];
  maxFiles?: number;
  required?: boolean;
  deferUpload?: boolean;
}>(function FileDropzone({
  kind,
  name,
  label,
  initialUrls = [],
  maxFiles = 1,
  required = false,
  deferUpload = false,
}, ref) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>(
    initialUrls.filter(Boolean).slice(0, maxFiles).map((url) => ({ name: url.split("/").pop() || label, url })),
  );
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const isImage = kind === "image";

  async function uploadFiles(selected: File[]) {
    if (!selected.length) return true;
    setUploading(true);
    setError("");
    try {
      let uploaded: UploadedFile[];
      if (process.env.NEXT_PUBLIC_STORAGE_DRIVER === "local") {
        const body = new FormData();
        selected.forEach((file) => body.append("files", file));
        const response = await fetch(isImage ? "/api/listing-images" : "/api/listing-documents", { method: "POST", body });
        const result = (await response.json()) as { files?: UploadedFile[]; error?: string };
        if (!response.ok || !result.files) throw new Error(result.error || "Upload failed.");
        uploaded = result.files;
      } else {
        uploaded = await Promise.all(selected.map(async (file) => {
          const pathname = `${isImage ? "images" : "documents"}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
          const blob = isImage
            ? await uploadBlob(pathname, file, { access: "public", handleUploadUrl: "/api/blob-upload" })
            : await uploadPresignedBlob(pathname, file, { access: "private", handleUploadUrl: "/api/blob-upload" });
          return {
            name: file.name,
            url: isImage ? blob.url : `/api/private-files?url=${encodeURIComponent(blob.url)}&name=${encodeURIComponent(file.name)}`,
          };
        }));
      }
      setFiles((current) => [...current, ...uploaded].slice(0, maxFiles));
      setPendingFiles((current) => current.filter((file) => !selected.includes(file)));
      return true;
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
      return false;
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function selectFiles(selectedFiles: FileList | File[]) {
    const selected = Array.from(selectedFiles).slice(0, maxFiles - files.length - pendingFiles.length);
    if (!selected.length) return setError(`You can add up to ${maxFiles} ${maxFiles === 1 ? "file" : "files"}.`);
    setError("");
    if (deferUpload) {
      setPendingFiles((current) => [...current, ...selected]);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    await uploadFiles(selected);
  }

  useImperativeHandle(ref, () => ({
    hasPendingFiles: () => pendingFiles.length > 0,
    uploadPendingFiles: () => uploadFiles(pendingFiles),
  }));

  const fileCount = files.length + pendingFiles.length;

  return (
    <div className="space-y-4 sm:col-span-2">
      <input type="hidden" name="listingUploadPending" value={uploading || pendingFiles.length ? "1" : ""} />
      {required && !fileCount && <input className="sr-only" tabIndex={-1} required aria-label={`${label} required`} value="" onChange={() => undefined} />}
      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void selectFiles(event.dataTransfer.files); }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-amber-500 bg-amber-50" : "border-slate-300 bg-slate-50"}`}
      >
        <input ref={inputRef} id={inputId} type="file" multiple={maxFiles > 1} accept={isImage ? "image/jpeg,image/png,image/webp,image/gif" : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.dwg"} className="sr-only" onChange={(event) => event.target.files && void selectFiles(event.target.files)} />
        <p className="font-black text-[#0b1f3a]">Drag and drop {label.toLowerCase()} here</p>
        <p className="mt-1 text-sm text-slate-500">{isImage ? "JPG, PNG, WebP or GIF · 8 MB maximum" : "PDF, Office, text, CSV or DWG · 10 MB maximum"}</p>
        <button
          type="button"
          disabled={uploading || fileCount >= maxFiles}
          aria-label={fileCount >= maxFiles ? "File selected" : undefined}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 rounded-full px-5 py-2.5 font-bold text-white disabled:cursor-not-allowed ${fileCount >= maxFiles ? "bg-emerald-600" : "bg-[#0b1f3a] disabled:opacity-50"}`}
        >
          {uploading ? "Uploading…" : fileCount >= maxFiles ? "✓" : `Choose ${maxFiles === 1 ? "file" : "files"}`}
        </button>
      </div>
      {pendingFiles.map((file, index) => (
        <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{file.name}</span>
          <button type="button" onClick={() => setPendingFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="font-bold text-red-700">Remove</button>
        </div>
      ))}
      {files.map((file, index) => (
        <div key={file.url} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          {isImage && <Image src={file.url} alt="" width={64} height={64} unoptimized className="size-16 rounded-lg object-cover" />}
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{file.name}</span>
          <input type="hidden" name={name} value={file.url} />
          <button type="button" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="font-bold text-red-700">Remove</button>
        </div>
      ))}
      {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}
    </div>
  );
});
