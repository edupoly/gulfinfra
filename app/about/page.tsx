import type { Metadata } from "next";
import {
  faBolt,
  faClipboardCheck,
  faHandshake,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const metadata: Metadata = {
  title: "About Us | GulfInfraHub",
  description:
    "Learn how GulfInfraHub connects construction and industrial businesses across GCC markets.",
};

const pillars = [
  {
    title: "Compliance Verification",
    description:
      "We work to check that every vendor listed holds a matching, active Commercial Registration (CR) from relevant ministries.",
    icon: faClipboardCheck,
  },
  {
    title: "RFQ Sourcing Velocity",
    description:
      "Our goal is to reduce tender pricing collection pipelines from weeks to under 48 hours.",
    icon: faBolt,
  },
  {
    title: "Local GCC Expertise",
    description:
      "Understanding local bidding thresholds, regional customs rules, and country-specific construction specifications.",
    icon: faHandshake,
  },
  {
    title: "Secure Communication",
    description:
      "Providing secure matching interfaces for confidential commercial and engineering documents.",
    icon: faShieldHalved,
  },
] as const;

export default function AboutPage() {
  return (
    <main className="w-full bg-slate-50">
      <section
        className="relative isolate overflow-hidden border-b border-white/10 bg-cover bg-center px-6 py-12 text-center text-white sm:py-14"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(6, 18, 36, 0.94) 0%, rgba(11, 31, 58, 0.88) 100%), url('https://sjcw.in/gulfbuildhub/images/contractorbg.png')",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-amber-400">
            Built for the Gulf
          </p>
          <h1 className="font-[family-name:var(--font-headings)] text-4xl font-black tracking-tight !text-white sm:text-5xl">
            About GulfInfraHub
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Facilitating industrial connections and construction sourcing across
            GCC markets since 2026.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-700">
              Our purpose
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#0b1f3a] sm:text-4xl">
              Transforming how industrial engineering projects source supplies
              and subcontractors.
            </h2>
            <p className="mt-6 leading-7 text-slate-600">
              GulfInfraHub was conceived to solve the critical visibility
              problems in Gulf construction supply chains. While other search
              engines address global consumer indices, the heavy civil sector in
              Saudi Arabia, UAE, Qatar, Kuwait, Oman, and Bahrain requires
              detailed regulatory data, pre-qualifications, and dynamic
              quotation tools.
            </p>
            <p className="mt-5 leading-7 text-slate-600">
              We combine structured directory listings, tender publications,
              instant RFQ routing, and heavy machinery catalogues into one
              high-fidelity corporate platform—enabling engineering directors
              to audit credentials and discover partners faster.
            </p>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-[#15375f] shadow-2xl shadow-slate-900/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(251,191,36,0.25),transparent_30%),linear-gradient(145deg,transparent_35%,rgba(255,255,255,0.08)_35%,rgba(255,255,255,0.08)_37%,transparent_37%)]" />
            <div className="relative flex min-h-[320px] items-center justify-center" aria-hidden="true">
              <span className="text-[8rem] drop-shadow-2xl sm:text-[10rem]">🏗️</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-700">
              What guides us
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#0b1f3a] sm:text-4xl">
              Our Core Corporate Pillars
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              The values shaping our features and business operations throughout
              the Middle East.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-[#0b1f3a] text-xl text-amber-400 shadow-md">
                  <FontAwesomeIcon icon={pillar.icon} className="w-6" />
                </div>
                <h3 className="mt-6 text-xl font-black text-[#0b1f3a]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
