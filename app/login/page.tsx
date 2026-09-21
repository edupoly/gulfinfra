import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmailAuthFlow } from "@/components/auth/EmailAuthFlow";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Login | GulfInfraHub" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const requestedReturn = (await searchParams).returnTo;
  const returnTo = requestedReturn?.startsWith("/") && !requestedReturn.startsWith("//")
    ? requestedReturn
    : null;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : returnTo || "/my-listings");
  return (
    <main className="grid min-h-[calc(100vh-100px)] place-items-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">GulfInfraHub account</p>
        <h1 className="mt-3 text-4xl font-black text-[#0b1f3a]">Login</h1>
        <p className="mt-3 text-slate-600">Access your listings with email verification or your password.</p>
        <div className="mt-7"><EmailAuthFlow redirectTo={returnTo} /></div>
      </section>
    </main>
  );
}
