"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/contact/actions";

const initialState: ContactState = { success: false, message: "" };
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-600 text-2xl font-black text-white">
          ✓
        </div>
        <h2 className="mt-5 text-2xl font-black text-emerald-900">Message received</h2>
        <p className="mt-2 text-emerald-700">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <label className="block text-sm font-bold text-slate-700">
        Full name
        <input name="fullName" required minLength={2} maxLength={100} autoComplete="name" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Phone or WhatsApp number
        <input name="phoneOrWhatsapp" type="tel" required minLength={7} maxLength={25} autoComplete="tel" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Email address
        <input name="email" type="email" required maxLength={160} autoComplete="email" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Message
        <textarea name="message" required minLength={10} maxLength={3000} rows={6} className={`${field} resize-y`} />
      </label>
      {state.message && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
          {state.message}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-amber-400 px-6 py-3.5 font-black text-[#0b1f3a] transition hover:bg-amber-300 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit message"}
      </button>
    </form>
  );
}
