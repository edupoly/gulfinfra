import Link from "next/link";
import type { ContractorProfile } from "@/lib/types";

type Props = {
  contractor: ContractorProfile;
};

export function ContractorDetail({ contractor }: Props) {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              VERIFIED CONTRACTOR
            </span>
            <h1 className="text-3xl font-bold">{contractor.name}</h1>
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

          <div>
            <h3 className="text-lg font-semibold text-slate-900">Featured Projects</h3>
            <div className="mt-3 space-y-3">
              {contractor.featuredProjects.map((project) => (
                <div key={project.title} className="rounded-2xl bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">{project.title}</div>
                  <div className="text-sm text-slate-600">{project.location}</div>
                  <div className="text-xs font-semibold text-amber-800">{project.status}</div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/contractors" className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Back to Contractors
          </Link>
        </aside>
      </section>
    </div>
  );
}
