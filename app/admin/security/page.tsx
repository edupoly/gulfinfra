import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/account/AccountForms";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata: Metadata = { title: "Security" };

export default function AdminSecurityPage() {
  return (
    <>
      <AdminPageHeader title="Account security" description="Manage the administrator account password and active sessions." />
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Admin security</p>
          <h2 className="mt-2 text-2xl font-black text-[#0b1f3a]">Change password</h2>
          <p className="mb-5 mt-2 text-sm text-slate-600">
            Enter the current password before choosing a new one. Other active sessions will be signed out.
          </p>
          <ChangePasswordForm />
        </div>
      </section>
    </>
  );
}
