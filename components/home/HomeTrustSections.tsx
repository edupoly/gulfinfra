import Link from "next/link";
import type { MaterialProfile } from "@/lib/types";

type SupplierSummary = {
  name: string;
  country: string;
  city: string;
  materialTypes: string[];
  listingCount: number;
  verified: boolean;
};

const fallbackSuppliers: SupplierSummary[] = [
  {
    name: "Gulf Structural Solutions",
    country: "United Arab Emirates",
    city: "Dubai",
    materialTypes: ["Structural Steel", "Fabrication"],
    listingCount: 1,
    verified: true,
  },
  {
    name: "Arabian Concrete Supply",
    country: "Saudi Arabia",
    city: "Riyadh",
    materialTypes: ["Ready-Mix Concrete", "Cement"],
    listingCount: 1,
    verified: true,
  },
  {
    name: "Doha Industrial Materials",
    country: "Qatar",
    city: "Doha",
    materialTypes: ["Pipes & Fittings", "Industrial Supplies"],
    listingCount: 1,
    verified: true,
  },
];

const successStories = [
  {
    number: "01",
    eyebrow: "Infrastructure sourcing",
    title: "A faster route to qualified regional suppliers",
    description:
      "A project procurement team used GulfInfraHub to compare specialist material suppliers across multiple GCC markets and build a focused shortlist.",
    outcome: "One marketplace for regional supplier discovery",
  },
  {
    number: "02",
    eyebrow: "Equipment mobilization",
    title: "The right equipment for a time-sensitive project",
    description:
      "A civil contractor identified available heavy equipment near its project location and moved from discovery to direct supplier contact without lengthy offline searches.",
    outcome: "Location-led equipment matching",
  },
  {
    number: "03",
    eyebrow: "Business growth",
    title: "New visibility beyond a supplier’s home market",
    description:
      "A specialist construction supplier showcased its capabilities to buyers across the Gulf and created new opportunities outside its established local network.",
    outcome: "Cross-border marketplace exposure",
  },
];

const testimonials = [
  {
    quote:
      "The platform brings contractors, projects, equipment, and suppliers into one clear workflow. It makes the first stage of procurement much easier to manage.",
    name: "A. Rahman",
    role: "Procurement Manager",
    company: "Regional Infrastructure Group",
  },
  {
    quote:
      "We can present our services to buyers across the GCC instead of relying only on existing contacts. The category and location filters are especially useful.",
    name: "M. Al-Harbi",
    role: "Business Development Director",
    company: "Industrial Supply Company",
  },
  {
    quote:
      "Finding relevant project opportunities and checking suitable suppliers in the same marketplace saves our team valuable research time.",
    name: "S. Nair",
    role: "Commercial Manager",
    company: "Civil Contracting Company",
  },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getFeaturedSuppliers(materials: MaterialProfile[]) {
  const rankedMaterials = [...materials].sort(
    (left, right) =>
      Number(right.featured) - Number(left.featured) ||
      Number(right.verified) - Number(left.verified),
  );
  const suppliers = new Map<string, SupplierSummary>();

  for (const material of rankedMaterials) {
    const key = material.supplier.trim().toLowerCase();
    const existing = suppliers.get(key);

    if (existing) {
      existing.listingCount += 1;
      if (!existing.materialTypes.includes(material.materialType)) {
        existing.materialTypes.push(material.materialType);
      }
      existing.verified = existing.verified || material.verified;
      continue;
    }

    suppliers.set(key, {
      name: material.supplier,
      country: material.country,
      city: material.city,
      materialTypes: [material.materialType],
      listingCount: 1,
      verified: material.verified,
    });
  }

  const selected = [...suppliers.values()]
    .filter((supplier) => supplier.verified)
    .slice(0, 3);

  for (const fallback of fallbackSuppliers) {
    if (selected.length >= 3) break;
    if (
      !selected.some(
        (supplier) =>
          supplier.name.toLowerCase() === fallback.name.toLowerCase(),
      )
    ) {
      selected.push(fallback);
    }
  }

  return selected;
}

export function FeaturedSuppliers({
  materials,
}: {
  materials: MaterialProfile[];
}) {
  const suppliers = getFeaturedSuppliers(materials);

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
              Trusted across the GCC
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Featured Suppliers
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Discover verified suppliers serving construction and
              infrastructure projects across the Gulf.
            </p>
          </div>
          <Link
            href="/construction-materials"
            className="text-sm font-bold text-[#0b1f3a] transition hover:text-amber-600"
          >
            View all suppliers <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-9 grid gap-6 md:grid-cols-3">
          {suppliers.map((supplier) => (
            <article
              key={supplier.name}
              className="group flex min-h-72 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1f3a] text-lg font-extrabold text-white shadow-sm">
                  {getInitials(supplier.name)}
                </div>
                {supplier.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <span aria-hidden="true">✓</span> Verified
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                {supplier.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {supplier.city}, {supplier.country}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {supplier.materialTypes.slice(0, 2).map((materialType) => (
                  <span
                    key={materialType}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {materialType}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
                <span className="text-sm text-slate-500">
                  {supplier.listingCount}{" "}
                  {supplier.listingCount === 1 ? "listing" : "listings"}
                </span>
                <Link
                  href={`/construction-materials?search=${encodeURIComponent(supplier.name)}`}
                  className="text-sm font-bold text-amber-600 transition group-hover:text-amber-700"
                >
                  View listings <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SuccessStories() {
  return (
    <section className="bg-[#0b1f3a] py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] !text-white">
            Marketplace impact
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight !text-white sm:text-4xl">
            Success Stories
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-200">
            See how GCC construction businesses can use one connected
            marketplace to discover, source, and grow.
          </p>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-3">
          {successStories.map((story) => (
            <article
              key={story.number}
              className="flex min-h-80 flex-col rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition hover:border-amber-400/60 hover:bg-white/[0.09]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] !text-white-400">
                  {story.eyebrow}
                </span>
                <span className="text-3xl font-black !text-white">
                  {story.number}
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-bold leading-tight !text-white">
                {story.title}
              </h3>
              <p className="mt-4 leading-7 text-slate-300">
                {story.description}
              </p>
              <p className="mt-auto border-t border-white/10 pt-5 text-sm font-semibold text-amber-300">
                {story.outcome}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
            Built for industry professionals
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            What Our Members Say
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            A marketplace designed around the day-to-day needs of buyers,
            contractors, and suppliers.
          </p>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex min-h-80 flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
            >
              <div
                className="text-sm tracking-[0.2em] text-amber-500"
                aria-label="5 out of 5 stars"
              >
                ★★★★★
              </div>
              <blockquote className="mt-6 text-lg leading-8 text-slate-700">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-4 border-t border-slate-200 pt-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b1f3a] text-sm font-bold text-white">
                  {getInitials(testimonial.name)}
                </div>
                <div>
                  <p className="font-bold text-slate-950">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
