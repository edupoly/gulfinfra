import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | GulfInfraHub",
  description: "Contact the GulfInfraHub team for marketplace and business enquiries.",
};

export default function ContactPage() {
  return (
    <main className="w-full bg-slate-50">
      <section className="bg-[#0b1f3a] px-6 py-12 text-center text-white sm:py-14">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-400">Get in touch</p>
        <h1 className="mt-3 text-4xl font-black !text-white sm:text-5xl">Contact Us</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
          Send your enquiry to the GulfInfraHub team and we will respond using the details provided.
        </p>
      </section>
      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-700">Corporate support</p>
            <h2 className="mt-3 text-3xl font-black text-[#0b1f3a]">How can we help?</h2>
            <p className="mt-5 leading-7 text-slate-600">
              Contact us about listings, RFQs, tenders, supplier registrations, account access, or partnership opportunities across GCC markets.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
