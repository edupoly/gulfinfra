"use client";

import { useId, useRef, useState } from "react";

type UploadedDocument = { name: string; url: string };

export function DocumentDropzone({
  draftKind,
  draftId,
  editToken,
  documentTypes,
  defaultType,
  maxFiles = 5,
}: {
  draftKind: "contractor" | "project" | "equipment" | "material" | "business";
  draftId: string;
  editToken: string;
  documentTypes: readonly string[];
  defaultType: string;
  maxFiles?: number;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(files: FileList | File[]) {
    const selected = Array.from(files).slice(0, maxFiles - documents.length);
    if (!selected.length) {
      setError(`You can add up to ${maxFiles} documents.`);
      return;
    }

    setUploading(true);
    setError("");
    const body = new FormData();
    body.set("draftKind", draftKind);
    body.set("draftId", draftId);
    body.set("editToken", editToken);
    selected.forEach((file) => body.append("files", file));

    try {
      const response = await fetch("/api/listing-documents", { method: "POST", body });
      const result = (await response.json()) as { files?: UploadedDocument[]; error?: string };
      if (!response.ok || !result.files) throw new Error(result.error || "Upload failed.");
      setDocuments((current) => [...current, ...result.files!].slice(0, maxFiles));
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
      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files); }}
        className={`rounded-2xl border-2 border-dashed p-7 text-center transition ${dragging ? "border-amber-500 bg-amber-50" : "border-slate-300 bg-slate-50"}`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.dwg"
          className="sr-only"
          onChange={(event) => event.target.files && void upload(event.target.files)}
        />
        <p className="font-black text-[#0b1f3a]">Drag and drop documents here</p>
        <p className="mt-1 text-sm text-slate-500">PDF, Office, text, CSV, or DWG · up to 10 MB each</p>
        <button
          type="button"
          disabled={uploading || documents.length >= maxFiles}
          onClick={() => inputRef.current?.click()}
          className="mt-4 rounded-full bg-[#0b1f3a] px-5 py-2.5 font-bold text-white transition hover:bg-[#16375f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading…" : documents.length >= maxFiles ? "File limit reached" : "Choose documents"}
        </button>
      </div>

      {documents.map((document, index) => (
        <div key={document.url} className="grid items-end gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1fr_190px_auto]">
          <label className="min-w-0 font-bold text-slate-800">
            Document name
            <input name="documentNames" defaultValue={document.name} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal text-slate-950" />
          </label>
          <label className="font-bold text-slate-800">
            Type
            <select name="documentTypes" defaultValue={defaultType} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-950">
              {documentTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <input type="hidden" name="documentUrls" value={document.url} />
          <button type="button" onClick={() => setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl border border-red-200 px-4 py-2.5 font-bold text-red-700 hover:bg-red-50">Remove</button>
        </div>
      ))}

      {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}
    </div>
  );
}
