"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { upload as uploadBlob, uploadPresigned as uploadPresignedBlob } from "@vercel/blob/client";

type UploadedFile = { name: string; url: string };

export function FileDropzone({
  kind,
  name,
  label,
  initialUrls = [],
  maxFiles = 1,
  required = false,
}: {
  kind: "image" | "document";
  name: string;
  label: string;
  initialUrls?: string[];
  maxFiles?: number;
  required?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>(
    initialUrls.filter(Boolean).slice(0, maxFiles).map((url) => ({ name: url.split("/").pop() || label, url })),
  );
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const isImage = kind === "image";

  async function upload(selectedFiles: FileList | File[]) {
    const selected = Array.from(selectedFiles).slice(0, maxFiles - files.length);
    if (!selected.length) return setError(`You can add up to ${maxFiles} ${maxFiles === 1 ? "file" : "files"}.`);
    setUploading(true);
    setError("");
    try {
      if (process.env.NEXT_PUBLIC_STORAGE_DRIVER === "local") {
        const body = new FormData();
        selected.forEach((file) => body.append("files", file));
        const response = await fetch(isImage ? "/api/listing-images" : "/api/listing-documents", { method: "POST", body });
        const result = (await response.json()) as { files?: UploadedFile[]; error?: string };
        if (!response.ok || !result.files) throw new Error(result.error || "Upload failed.");
        setFiles((current) => [...current, ...result.files!].slice(0, maxFiles));
        return;
      }
      const uploaded = await Promise.all(selected.map(async (file) => {
        const pathname = `${isImage ? "images" : "documents"}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const blob = isImage
          ? await uploadBlob(pathname, file, { access: "public", handleUploadUrl: "/api/blob-upload" })
          : await uploadPresignedBlob(pathname, file, { access: "private", handleUploadUrl: "/api/blob-upload" });
        return {
          name: file.name,
          url: isImage ? blob.url : `/api/private-files?url=${encodeURIComponent(blob.url)}&name=${encodeURIComponent(file.name)}`,
        };
      }));
      setFiles((current) => [...current, ...uploaded].slice(0, maxFiles));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4 sm:col-span-2">
      <input type="hidden" name="listingUploadPending" value={uploading ? "1" : ""} />
      {required && !files.length && <input className="sr-only" tabIndex={-1} required aria-label={`${label} required`} value="" onChange={() => undefined} />}
      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files); }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-amber-500 bg-amber-50" : "border-slate-300 bg-slate-50"}`}
      >
        <input ref={inputRef} id={inputId} type="file" multiple={maxFiles > 1} accept={isImage ? "image/jpeg,image/png,image/webp,image/gif" : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.dwg"} className="sr-only" onChange={(event) => event.target.files && void upload(event.target.files)} />
        <p className="font-black text-[#0b1f3a]">Drag and drop {label.toLowerCase()} here</p>
        <p className="mt-1 text-sm text-slate-500">{isImage ? "JPG, PNG, WebP or GIF · 8 MB maximum" : "PDF, Office, text, CSV or DWG · 10 MB maximum"}</p>
        <button type="button" disabled={uploading || files.length >= maxFiles} onClick={() => inputRef.current?.click()} className="mt-4 rounded-full bg-[#0b1f3a] px-5 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {uploading ? "Uploading…" : files.length >= maxFiles ? "File limit reached" : `Choose ${maxFiles === 1 ? "file" : "files"}`}
        </button>
      </div>
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
}
