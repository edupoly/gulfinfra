"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  changePassword,
  createInitialPassword,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  type AccountActionState,
} from "@/app/account/actions";

const initialState: AccountActionState = { success: false, message: "" };
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const button =
  "w-full rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950 disabled:opacity-60";

type ProfileValues = {
  email: string;
  fullName: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  country: string | null;
  profileImageUrl: string | null;
};

export function ProfileForm({ profile }: { profile: ProfileValues }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-bold text-slate-700">
        Full name
        <input name="fullName" defaultValue={profile.fullName ?? ""} maxLength={100} autoComplete="name" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Email
        <input value={profile.email} disabled className={`${field} bg-slate-100 text-slate-500`} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Phone
        <input name="phone" type="tel" defaultValue={profile.phone ?? ""} maxLength={30} autoComplete="tel" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Country
        <input name="country" defaultValue={profile.country ?? ""} maxLength={80} autoComplete="country-name" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Company
        <input name="company" defaultValue={profile.company ?? ""} maxLength={120} autoComplete="organization" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Job title
        <input name="jobTitle" defaultValue={profile.jobTitle ?? ""} maxLength={100} autoComplete="organization-title" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
        Profile photo URL
        <input name="profileImageUrl" type="url" defaultValue={profile.profileImageUrl ?? ""} maxLength={500} placeholder="https://example.com/profile.jpg" className={field} />
        <span className="mt-1 block text-xs font-normal text-slate-500">Use a publicly accessible HTTPS image URL.</span>
      </label>
      {state.message && (
        <p role="status" className={`rounded-lg p-3 text-sm font-bold sm:col-span-2 ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </p>
      )}
      <button disabled={pending} className={`${button} sm:col-span-2 sm:w-fit sm:min-w-48`}>
        {pending ? "Saving profile…" : "Save profile"}
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initialState);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-bold text-slate-700">
        Current password
        <input name="currentPassword" type="password" required autoComplete="current-password" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        New password
        <input name="password" type="password" minLength={8} required autoComplete="new-password" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Confirm new password
        <input name="confirmation" type="password" minLength={8} required autoComplete="new-password" className={field} />
      </label>
      {state.message && (
        <p role="status" className={`rounded-lg p-3 text-sm font-bold ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </p>
      )}
      <button disabled={pending} className={button}>
        {pending ? "Updating password…" : "Change password"}
      </button>
    </form>
  );
}

export function CreatePasswordForm() {
  const [state, action, pending] = useActionState(createInitialPassword, initialState);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-bold text-slate-700">
        Create password
        <input name="password" type="password" minLength={8} required autoComplete="new-password" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Confirm password
        <input name="confirmation" type="password" minLength={8} required autoComplete="new-password" className={field} />
      </label>
      {state.message && (
        <p role="status" className={`rounded-lg p-3 text-sm font-bold ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </p>
      )}
      <button disabled={pending} className={button}>
        {pending ? "Creating password…" : "Create password"}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={action} className="mt-7 space-y-4">
      <label className="block text-sm font-bold text-slate-700">
        Account email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      {state.message && (
        <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm font-bold text-blue-800">
          {state.message}
        </p>
      )}
      <button disabled={pending} className={button}>
        {pending ? "Sending reset link…" : "Email reset link"}
      </button>
      <Link href="/login" className="block text-center text-sm font-bold text-blue-700 underline">
        Return to login
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initialState);

  if (state.success) {
    return (
      <div className="mt-7 rounded-xl bg-emerald-50 p-5 text-center">
        <p className="font-bold text-emerald-700">{state.message}</p>
        <Link href="/login" className="mt-4 inline-block font-black text-blue-700 underline">
          Continue to login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-7 space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-bold text-slate-700">
        New password
        <input name="password" type="password" minLength={8} required autoComplete="new-password" className={field} />
      </label>
      <label className="block text-sm font-bold text-slate-700">
        Confirm new password
        <input name="confirmation" type="password" minLength={8} required autoComplete="new-password" className={field} />
      </label>
      {state.message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{state.message}</p>}
      <button disabled={pending || !token} className={button}>
        {pending ? "Resetting password…" : "Reset password"}
      </button>
    </form>
  );
}
