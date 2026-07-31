import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/account/AccountForms";

export const metadata: Metadata = { title: "Reset Password | GulfInfraHub" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <main className="grid min-h-[calc(100vh-100px)] place-items-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Secure reset</p>
        <h1 className="mt-3 text-4xl font-black text-[#0b1f3a]">Choose a new password</h1>
        <p className="mt-3 text-slate-600">Use at least eight characters including a letter and a number.</p>
        {!token && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">This reset link is invalid.</p>}
        <ResetPasswordForm token={token} />
      </section>
    </main>
  );
}
