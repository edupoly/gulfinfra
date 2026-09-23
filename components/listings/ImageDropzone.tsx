"use client";

import { useId, useRef, useState } from "react";
import { upload as uploadBlob } from "@vercel/blob/client";

type UploadedImage = { name: string; url: string };

export function ImageDropzone({
  draftKind,
  draftId,
  editToken,
  name,
  label,
  maxFiles = 1,
  required = false,
}: {
  draftKind: "contractor" | "project" | "equipment" | "material" | "business";
  draftId: string;
  editToken: string;
  name: string;
  label: string;
  maxFiles?: number;
  required?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: FileList | File[]) {
    const available = maxFiles - images.length;
    const selected = Array.from(files).slice(0, available);
    if (!selected.length) return setError(`You can add up to ${maxFiles} ${maxFiles === 1 ? "image" : "images"}.`);
    setUploading(true);
    setError("");
    try {
      if (process.env.NEXT_PUBLIC_STORAGE_DRIVER === "local") {
        const body = new FormData();
        body.set("draftKind", draftKind);
        body.set("draftId", draftId);
        body.set("editToken", editToken);
        selected.forEach((file) => body.append("files", file));
        const response = await fetch("/api/listing-images", { method: "POST", body });
        const result = (await response.json()) as { files?: UploadedImage[]; error?: string };
        if (!response.ok || !result.files) throw new Error(result.error || "Upload failed.");
        setImages((current) => [...current, ...result.files!].slice(0, maxFiles));
        return;
      }
      const uploaded = await Promise.all(selected.map(async (file) => {
        const blob = await uploadBlob(`images/${draftKind}/${draftId}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob-upload",
          clientPayload: JSON.stringify({ draftKind, draftId, editToken }),
        });
        return { name: file.name, url: blob.url };
      }));
      setImages((current) => [...current, ...uploaded].slice(0, maxFiles));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="listingUploadPending" value={uploading ? "1" : ""} />
      {required && !images.length && <input className="sr-only" tabIndex={-1} required aria-label={`${label} upload required`} value="" onChange={() => undefined} />}
      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files); }}
        className={`rounded-2xl border-2 border-dashed p-7 text-center transition ${dragging ? "border-amber-500 bg-amber-50" : "border-slate-300 bg-slate-50"}`}
      >
        <input ref={inputRef} id={inputId} type="file" multiple={maxFiles > 1} accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => event.target.files && void upload(event.target.files)} />
        <p className="font-black text-[#0b1f3a]">Drag and drop {label.toLowerCase()} here</p>
        <p className="mt-1 text-sm text-slate-500">JPG, PNG, WebP, or GIF · up to 8 MB each</p>
        <button type="button" disabled={uploading || images.length >= maxFiles} onClick={() => inputRef.current?.click()} className="mt-4 rounded-full bg-[#0b1f3a] px-5 py-2.5 font-bold text-white transition hover:bg-[#16375f] disabled:cursor-not-allowed disabled:opacity-50">
          {uploading ? "Uploading…" : images.length >= maxFiles ? "Image limit reached" : `Choose ${maxFiles === 1 ? "image" : "images"}`}
        </button>
      </div>

      {images.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((item, index) => <div key={item.url} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt={item.name} className="h-36 w-full object-cover" />
          <div className="flex items-center justify-between gap-3 p-3"><span className="min-w-0 truncate text-sm font-bold text-slate-700">{item.name}</span><button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-sm font-bold text-red-700">Remove</button></div>
          <input type="hidden" name={name} value={item.url} />
        </div>)}
      </div>}
      {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}
    </div>
  );
}
