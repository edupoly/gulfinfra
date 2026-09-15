"use client";

import { useRef, useState } from "react";
import { createCity } from "@/app/admin/locations/actions";

export function AddCityButton({ countryCode, countryName }: { countryCode: string; countryName: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [fields, setFields] = useState([0]);
  const nextId = useRef(1);

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
        Add city
      </button>
      <dialog ref={dialogRef} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} className="m-auto w-[min(92vw,460px)] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/55">
        <form action={createCity} className="p-6 sm:p-7">
          <input type="hidden" name="countryCode" value={countryCode} />
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-wider text-amber-600">{countryName}</p><h2 className="mt-1 text-2xl font-black text-[#0b1f3a]">Add city or state</h2></div>
            <button type="button" aria-label="Close dialog" onClick={() => dialogRef.current?.close()} className="grid size-9 place-items-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200">×</button>
          </div>
          <div className="mt-6 space-y-3">
            {fields.map((fieldId, index) => (
              <div key={fieldId} className="flex items-end gap-2">
                <label className="min-w-0 flex-1 text-sm font-bold text-slate-700">
                  {index === 0 ? "City or state name" : `Additional city or state ${index + 1}`}
                  <input name="names" required autoFocus={index === 0} maxLength={80} placeholder={index === 0 ? "e.g. Abu Dhabi" : "Enter another city"} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
                </label>
                {index === 0 ? (
                  <button type="button" onClick={() => setFields((current) => current.length >= 20 ? current : [...current, nextId.current++])} className="shrink-0 rounded-xl border border-emerald-200 px-3 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50">＋ Add another</button>
                ) : (
                  <button type="button" aria-label={`Remove city field ${index + 1}`} onClick={() => setFields((current) => current.filter((id) => id !== fieldId))} className="shrink-0 rounded-xl border border-red-200 px-3 py-3 text-sm font-bold text-red-700 hover:bg-red-50">Remove</button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">The URL slug will be generated automatically.</p>
          <div className="mt-7 flex justify-end gap-3">
            <button type="button" onClick={() => dialogRef.current?.close()} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-xl bg-[#0b1f3a] px-5 py-2.5 text-sm font-black text-white hover:bg-[#15375f]">Add {fields.length === 1 ? "city" : `${fields.length} cities`}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
