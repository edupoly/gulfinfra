"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPassword,
  loginWithPassword,
  requestOtp,
  verifyOtp,
  type AuthState,
} from "@/app/auth/actions";

const initial: AuthState = { success: false, message: "", step: "email" };

export function EmailAuthFlow({
  defaultEmail = "",
  onAuthenticated,
  requireOtp = false,
}: {
  defaultEmail?: string;
  onAuthenticated?: () => void;
  requireOtp?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [usePassword, setUsePassword] = useState(false);
  const completed = useRef(false);
  const [requestState, requestAction, requesting] = useActionState(requestOtp, initial);
  const [verifyState, verifyAction, verifying] = useActionState(verifyOtp, initial);
  const [passwordState, passwordAction, savingPassword] = useActionState(createPassword, initial);
  const [loginState, loginAction, loggingIn] = useActionState(loginWithPassword, initial);

  const stage: "email" | "otp" | "password" | "complete" =
    passwordState.success || loginState.success || verifyState.step === "complete"
      ? "complete"
      : verifyState.success && verifyState.step === "password"
        ? "password"
        : verifyState.message && verifyState.step === "email"
          ? "email"
          : requestState.step === "otp"
            ? "otp"
            : "email";

  useEffect(() => {
    if (stage !== "complete" || completed.current) return;
    completed.current = true;
    if (onAuthenticated) onAuthenticated();
    else router.push("/my-listings");
  }, [onAuthenticated, router, stage]);

  const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
  const button = "w-full rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950 disabled:opacity-60";

  if (stage === "complete") {
    return <p className="rounded-xl bg-emerald-50 p-4 font-bold text-emerald-700">✓ Email verified and signed in.</p>;
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
      <h3 className="text-xl font-black text-[#0b1f3a]">
        {requireOtp ? "Verify your email to publish" : "Sign in securely"}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        {requireOtp ? "We require a one-time code before every new listing is published." : "New accounts start with email verification, then create a password."}
      </p>

      {stage === "email" && !usePassword && (
        <form action={requestAction} className="mt-5">
          <label className="block text-sm font-bold text-slate-700">
            Email address
            <input name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={field} />
          </label>
          {requestState.message && <p role="status" className={`mt-3 text-sm font-bold ${requestState.success ? "text-emerald-700" : "text-red-700"}`}>{requestState.message}</p>}
          <button disabled={requesting} className={`${button} mt-4`}>{requesting ? "Sending code…" : "Email me a code →"}</button>
          {!requireOtp && <button type="button" onClick={() => setUsePassword(true)} className="mt-3 w-full text-sm font-bold text-blue-700 underline">Already have a password?</button>}
        </form>
      )}

      {stage === "email" && usePassword && (
        <form action={loginAction} className="mt-5 space-y-4">
          <label className="block text-sm font-bold text-slate-700">Email address<input name="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={field} /></label>
          <label className="block text-sm font-bold text-slate-700">Password<input name="password" type="password" required className={field} /></label>
          {loginState.message && <p role="alert" className={`text-sm font-bold ${loginState.success ? "text-emerald-700" : "text-red-700"}`}>{loginState.message}</p>}
          <button disabled={loggingIn} className={button}>{loggingIn ? "Signing in…" : "Sign in →"}</button>
          <button type="button" onClick={() => setUsePassword(false)} className="w-full text-sm font-bold text-blue-700 underline">Use an email code instead</button>
        </form>
      )}

      {stage === "otp" && (
        <form action={verifyAction} className="mt-5">
          <input type="hidden" name="email" value={email} />
          <label className="block text-sm font-bold text-slate-700">
            6-digit verification code
            <input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoFocus className={`${field} text-center text-2xl font-black tracking-[0.35em]`} />
          </label>
          {requestState.developmentOtp && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm font-bold text-blue-800">Development OTP: {requestState.developmentOtp}</p>}
          {verifyState.message && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{verifyState.message}</p>}
          <button disabled={verifying} className={`${button} mt-4`}>{verifying ? "Verifying…" : "Verify code →"}</button>
          <button type="button" onClick={() => window.location.reload()} className="mt-3 w-full text-sm font-bold text-blue-700 underline">Use another email</button>
        </form>
      )}

      {stage === "password" && (
        <form action={passwordAction} className="mt-5 space-y-4">
          <input type="hidden" name="email" value={email} />
          <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">✓ Email verified. Create your password to finish registration.</p>
          <label className="block text-sm font-bold text-slate-700">Create password<input name="password" type="password" minLength={8} required className={field} /></label>
          <label className="block text-sm font-bold text-slate-700">Confirm password<input name="confirmation" type="password" minLength={8} required className={field} /></label>
          {passwordState.message && <p role="alert" className="text-sm font-bold text-red-700">{passwordState.message}</p>}
          <button disabled={savingPassword} className={button}>{savingPassword ? "Creating password…" : "Create password →"}</button>
        </form>
      )}
    </div>
  );
}
