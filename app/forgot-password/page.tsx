import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/account/AccountForms";

export const metadata: Metadata = { title: "Forgot Password | GulfInfraHub" };

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-[calc(100vh-100px)] place-items-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Account recovery</p>
        <h1 className="mt-3 text-4xl font-black text-[#0b1f3a]">Forgot your password?</h1>
        <p className="mt-3 text-slate-600">Enter your account email and we’ll send a single-use reset link valid for 30 minutes.</p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
