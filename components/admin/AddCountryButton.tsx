"use client";

import { useRef } from "react";
import { createCountry } from "@/app/admin/locations/actions";

export function AddCountryButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return <>
    <button type="button" onClick={() => dialogRef.current?.showModal()} className="rounded-xl bg-[#0b1f3a] px-4 py-2.5 text-sm font-black text-white hover:bg-[#15375f]">＋ Add country</button>
    <dialog ref={dialogRef} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }} className="m-auto w-[min(92vw,440px)] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/55">
      <form action={createCountry} className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-amber-600">New location</p><h2 className="mt-1 text-2xl font-black text-[#0b1f3a]">Add country</h2></div><button type="button" aria-label="Close dialog" onClick={() => dialogRef.current?.close()} className="grid size-9 place-items-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200">×</button></div>
        <div className="mt-6 grid gap-4">
          <label className="text-sm font-bold text-slate-700">Country name<input name="name" required autoFocus maxLength={80} placeholder="e.g. United Arab Emirates" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" /></label>
          <label className="text-sm font-bold text-slate-700">Country code<input name="code" required minLength={2} maxLength={3} placeholder="e.g. AE" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 uppercase outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" /></label>
        </div>
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => dialogRef.current?.close()} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold">Cancel</button><button className="rounded-xl bg-[#0b1f3a] px-5 py-2.5 text-sm font-black text-white">Add country</button></div>
      </form>
    </dialog>
  </>;
}
