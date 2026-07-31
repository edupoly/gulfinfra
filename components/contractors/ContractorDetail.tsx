import Link from "next/link";
import type { ContractorProfile } from "@/lib/types";

type Props = {
  contractor: ContractorProfile;
  saveControl?: React.ReactNode;
};

export function ContractorDetail({ contractor, saveControl }: Props) {
  return (
    <div className="space-y-8 pb-8">
      <section className="relative left-1/2 w-dvw -translate-x-1/2 bg-gradient-to-br from-slate-950 to-slate-700 text-white shadow-xl">
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-10 sm:px-6 sm:pb-28 lg:px-8">
          <Link href="/contractors" className="mb-8 inline-flex text-sm font-semibold text-slate-300 transition hover:text-amber-300">
            ← Back to Contractors
          </Link>
          {saveControl && <div className="mb-6">{saveControl}</div>}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              VERIFIED CONTRACTOR
            </span>
            <h1 className="text-3xl font-bold !text-white">{contractor.name}</h1>
            <p className="mt-2 text-slate-200">
              {contractor.companyType} • Established {contractor.yearEstablished}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-100 sm:grid-cols-2">
            <div>Rating: {contractor.rating.toFixed(1)} ★</div>
            <div>Projects Completed: {contractor.projectsCompleted}</div>
            <div>Employees: {contractor.employees}</div>
            <div>Response Time: {contractor.responseTime}</div>
          </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-20 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Company type", contractor.companyType],
          ["Established", String(contractor.yearEstablished)],
          ["Projects completed", String(contractor.projectsCompleted)],
          ["Verification status", "Verified contractor"],
        ].map(([label, value]) => (
          <div key={label} className="border-b border-slate-200 p-5 last:border-b-0 sm:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">About</h2>
            <p className="mt-3 text-slate-700">{contractor.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Our Services</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {contractor.services.map((service) => (
                <span key={service} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Company Details</h3>
            <dl className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <div><dt className="font-semibold">Business Type</dt><dd>{contractor.companyType}</dd></div>
              <div><dt className="font-semibold">Est. Year</dt><dd>{contractor.yearEstablished}</dd></div>
              <div><dt className="font-semibold">Main Office</dt><dd>{contractor.address}</dd></div>
              <div><dt className="font-semibold">Phone</dt><dd>{contractor.phone}</dd></div>
              <div><dt className="font-semibold">Website</dt><dd>{contractor.website}</dd></div>
              <div><dt className="font-semibold">Email</dt><dd>{contractor.email}</dd></div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Areas We Serve</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {contractor.areasServed.map((area) => (
                <span key={area} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <section className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900">Featured Projects</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {contractor.featuredProjects.map((project) => (
                <article key={project.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="font-semibold text-slate-900">{project.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{project.location}</p>
                  <p className="mt-2 text-xs font-semibold text-amber-800">{project.status}</p>
                </article>
              ))}
              {!contractor.featuredProjects.length && (
                <p className="text-sm text-slate-500 sm:col-span-2">
                  Featured project information is available on request.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Contact Contractor</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Phone: {contractor.phone}</li>
              <li>WhatsApp: {contractor.whatsapp}</li>
              <li>Email: {contractor.email}</li>
              <li>Website: {contractor.website}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Verified & Trusted</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {contractor.licenses.map((license) => (
                <li key={license}>✓ {license}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900">Contact this contractor</h3>
            <div className="mt-4 space-y-3">
              <Link
                href="/contact"
                className="block rounded-full bg-slate-900 px-5 py-3 text-center text-sm font-bold text-white"
              >
                Call {contractor.phone}
              </Link>
              <a
                href={`https://wa.me/${contractor.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded-full bg-emerald-600 px-5 py-3 text-center text-sm font-bold text-white"
              >
                WhatsApp
              </a>
              <Link
                href="/contact"
                className="block rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-bold text-slate-800"
              >
                Send Enquiry
              </Link>
            </div>
          </div>

          {/* <Link href="/contractors" className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Back to Contractors
          </Link> */}
        </aside>
      </section>
    </div>
  );
}
