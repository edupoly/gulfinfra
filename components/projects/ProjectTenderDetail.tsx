import Link from "next/link";
import type { ProjectTenderProfile } from "@/lib/types";

export function ProjectTenderDetail({
  project,
}: {
  project: ProjectTenderProfile;
}) {
  const referenceId = `TND-${project.slug
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0)
    .toString()
    .padStart(5, "0")}`;
  const isOpen = project.status.toLowerCase().includes("open");

  return (
    <div className="space-y-7 pb-8">
      <section className="relative left-1/2 w-dvw -translate-x-1/2 bg-gradient-to-br from-slate-950 to-slate-800 text-white shadow-xl">
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 sm:pb-28 sm:pt-10 lg:px-8">
          <Link
            href="/projects-tenders"
            className="mb-8 inline-flex text-sm font-semibold text-slate-300 transition hover:text-amber-300"
          >
            ← Back to Projects & Tenders
          </Link>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">
              {project.projectType} · {referenceId}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="max-w-4xl text-3xl font-black !text-white sm:text-4xl">
                {project.title}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                  isOpen
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-400 text-slate-950"
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="mt-3 text-slate-300">{project.client}</p>
            <p className="mt-2 text-sm text-slate-400">
              {project.location || `${project.city}, ${project.country}`}
            </p>
          </div>
          <span className="w-fit rounded-full border border-white/20 px-4 py-2 text-sm font-bold">
            {project.tenderType}
          </span>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-20 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Capital value", project.value || project.budget],
          ["Bid deadline", project.deadline],
          ["Tender authority", project.client],
          ["Current status", project.status],
        ].map(([label, value]) => (
          <div
            key={label}
            className="border-b border-slate-200 p-5 last:border-b-0 sm:odd:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-7">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">About this opportunity</h2>
            <p className="mt-4 leading-7 text-slate-600">{project.description}</p>
            {project.summary && project.summary !== project.description && (
              <p className="mt-3 leading-7 text-slate-600">{project.summary}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {project.sectors.map((sector) => (
                <span
                  key={sector}
                  className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-900"
                >
                  {sector}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Tender specifications</h2>
            <dl className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
              {[
                ["Project category", project.projectType],
                ["Estimated capital value", project.value || project.budget],
                ["Bid submission deadline", project.deadline],
                ["Tender authority / client", project.client],
                ["Project location", project.location || `${project.city}, ${project.country}`],
                ["Tender type", project.tenderType],
                ["Verification status", project.featured ? "Featured and verified" : "Marketplace verified"],
                ["Posted", project.posted],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 p-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-5"
                >
                  <dt className="text-sm font-semibold text-slate-500">{label}</dt>
                  <dd className="text-sm font-bold text-slate-950">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Bidding requirements</h2>
            <ul className="mt-5 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
              {[
                "Valid GCC commercial registration",
                "Relevant contractor classification",
                "Documented similar-project experience",
                "Current safety and quality certifications",
                "Technical and commercial proposals",
                "Submission before the stated deadline",
              ].map((requirement) => (
                <li key={requirement} className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-600" aria-hidden="true">✓</span>
                  {requirement}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
            <h2 className="text-xl font-black">Bidding actions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Review the opportunity and contact the issuing authority for the
              official BOQ, drawings, qualification criteria, and submission process.
            </p>
            <a
              href={`mailto:?subject=${encodeURIComponent(`Tender enquiry: ${project.title}`)}`}
              className="mt-5 block rounded-full bg-amber-400 px-5 py-3 text-center text-sm font-black text-slate-950"
            >
              Request tender documents
            </a>
            <Link
              href="/contractors"
              className="mt-3 block rounded-full border border-white/20 px-5 py-3 text-center text-sm font-bold text-white"
            >
              Find qualified contractors
            </Link>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Vetted opportunity</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex gap-3">
                <span className="text-xl" aria-hidden="true">🛡️</span>
                <div>
                  <p className="font-bold text-slate-950">Verified issuer</p>
                  <p className="text-slate-500">Authority and listing details reviewed.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xl" aria-hidden="true">📄</span>
                <div>
                  <p className="font-bold text-slate-950">Official documents</p>
                  <p className="text-slate-500">Request BOQ and drawings from the issuer.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Issuer information</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Organization</dt>
                <dd className="font-bold text-slate-950">{project.client}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Submission location</dt>
                <dd className="font-bold text-slate-950">
                  {project.location || `${project.city}, ${project.country}`}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Reference</dt>
                <dd className="font-bold text-slate-950">{referenceId}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
