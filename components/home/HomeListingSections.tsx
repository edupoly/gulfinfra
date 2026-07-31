import Link from "next/link";
import type { ReactNode } from "react";
import type {
  BusinessOpportunity,
  ContractorProfile,
  EquipmentProfile,
  MaterialProfile,
  ProjectTenderProfile,
} from "@/lib/types";

type HomeRfq = {
  id: string;
  reference: string;
  title: string;
  projectName: string;
  category: string;
  status: string;
  country: string;
  city: string;
  quantity: string;
  budget: string | null;
  urgency: string;
  expirationDate: Date;
  description: string;
  quotations: Array<{ id: string }>;
};

const flags: Record<string, string> = {
  AE: "🇦🇪", UAE: "🇦🇪", "United Arab Emirates": "🇦🇪", SA: "🇸🇦", "Saudi Arabia": "🇸🇦",
  QA: "🇶🇦", Qatar: "🇶🇦", KW: "🇰🇼", Kuwait: "🇰🇼",
  OM: "🇴🇲", Oman: "🇴🇲", BH: "🇧🇭", Bahrain: "🇧🇭",
};

const badge = "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.05em]";
const secondaryButton = "rounded-md border border-[#0b1f3a] px-3 py-2 text-xs font-bold text-[#0b1f3a] transition hover:bg-[#0b1f3a] hover:text-white";
const primaryButton = "rounded-md bg-[#0b1f3a] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#16345b]";

function ListingSection({
  title,
  description,
  href,
  buttonLabel,
  children,
  alternate = false,
}: {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  children: ReactNode;
  alternate?: boolean;
}) {
  return (
    <section className={`border-t border-slate-200 ${alternate ? "bg-slate-50" : "bg-white"}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 max-w-[700px] text-center">
          <h2 className="relative inline-block pb-3 text-3xl font-black tracking-tight text-[#0b1f3a] after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-[60px] after:-translate-x-1/2 after:rounded-full after:bg-amber-400">
            {title}
          </h2>
          <p className="mt-4 text-base text-slate-600">{description}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">{children}</div>

        <div className="mt-8 text-center">
          <Link href={href} className="inline-flex rounded-md bg-[#0b1f3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#16345b]">
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

function CardShell({ children }: { children: ReactNode }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#0b1f3a]/15 hover:shadow-lg">
      {children}
    </article>
  );
}

function CardHeader({ icon, title, country, category }: { icon: string; title: string; country: string; category: string }) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-100 p-4">
      <div className="flex size-[54px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[28px]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 min-h-[2.7rem] text-[1.1rem] font-bold leading-[1.35] text-[#0b1f3a]">{title}</h3>
        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
          <span className="min-w-0 flex-1 truncate">{flags[country] ?? "🌐"} {country}</span>
          <span>•</span>
          <span className="min-w-0 flex-1 truncate">{category}</span>
        </div>
      </div>
    </div>
  );
}

function CardFooter({ href, first, second, firstHref = href }: { href: string; first: string; second: string; firstHref?: string }) {
  return (
    <div className="mt-auto flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4">
      <Link href={firstHref} className={secondaryButton}>{first}</Link>
      <Link href={href} className={primaryButton}>{second}</Link>
    </div>
  );
}

export function FeaturedContractors({ listings }: { listings: ContractorProfile[] }) {
  const featured = listings.filter((item) => item.featured).slice(0, 3);
  if (!featured.length) return null;

  return (
    <ListingSection title="Featured Verified Contractors" description="Connect with leading pre-qualified contracting enterprises. Hand-verified by our vetting officers for reliability and performance." href="/contractors" buttonLabel="Browse All Contractors" alternate>
      {featured.map((item) => {
        const href = `/contractors/${item.slug}`;
        return (
          <CardShell key={item.slug}>
            <CardHeader icon="🏗️" title={item.name} country={item.country} category={item.primaryType} />
            <div className="flex-1 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-amber-700">★ {item.rating.toFixed(1)} <span className="font-normal text-slate-500">({item.reviewCount} reviews)</span></div>
                <span className={`${badge} bg-emerald-100 text-emerald-700`}>✓ Verified Supplier</span>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.services.slice(0, 3).map((service) => <span key={service} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">{service}</span>)}
              </div>
            </div>
            <CardFooter href={href} firstHref="/contact" first="Enquire Now" second="View Profile" />
          </CardShell>
        );
      })}
    </ListingSection>
  );
}

export function LatestProjects({ listings }: { listings: ProjectTenderProfile[] }) {
  const latest = listings.slice(0, 3);
  if (!latest.length) return null;

  return (
    <ListingSection title="Latest Projects & Tenders" description="Access high-value infrastructure projects, government announcements, and commercial civil contracting tenders." href="/projects-tenders" buttonLabel="Browse All Tenders">
      {latest.map((item) => {
        const href = `/projects-tenders/${item.slug}`;
        return (
          <CardShell key={item.slug}>
            <CardHeader icon="📋" title={item.title} country={item.country} category={item.sectors[0] ?? item.projectType} />
            <div className="flex-1 p-4">
              <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                <span>Value: <strong className="text-base text-[#0b1f3a]">{item.value || item.budget}</strong></span>
                <span className={`${badge} ${item.status.toLowerCase() === "open" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{item.status}</span>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.summary || item.description}</p>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <div><strong className="text-slate-800">Authority:</strong> {item.client}</div>
                <div><strong className="text-slate-800">Bid Deadline:</strong> {item.deadline}</div>
              </div>
            </div>
            <CardFooter href={href} first="Download Specs" second="Details" />
          </CardShell>
        );
      })}
    </ListingSection>
  );
}

export function FeaturedEquipment({ listings }: { listings: EquipmentProfile[] }) {
  const featured = listings.filter((item) => item.featured).slice(0, 3);
  if (!featured.length) return null;

  return (
    <ListingSection title="Featured Equipment" description="Selected heavy equipment available for sale or rent." href="/equipment-marketplace" buttonLabel="Browse All Equipment" alternate>
      {featured.map((item) => {
        const href = `/equipment-marketplace/${item.slug}`;
        return (
          <CardShell key={item.slug}>
            <CardHeader icon="🚜" title={item.title} country={item.country} category={`${item.condition} Condition`} />
            <div className="flex-1 p-4">
              <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                <span>Price: <strong className="text-lg text-amber-700">{item.price}</strong></span>
                <span className={`${badge} ${item.listingType === "For Sale" ? "bg-emerald-100 text-emerald-700" : "bg-[#0b1f3a]/10 text-[#0b1f3a]"}`}>{item.listingType}</span>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className="mt-4 text-sm text-slate-600"><strong className="text-slate-800">Seller:</strong> {item.sellerName}</div>
            </div>
            <CardFooter href={href} firstHref="/contact" first="Contact Seller" second="Details" />
          </CardShell>
        );
      })}
    </ListingSection>
  );
}

export function FeaturedMaterials({ listings }: { listings: MaterialProfile[] }) {
  const featured = listings.filter((item) => item.featured).slice(0, 3);
  if (!featured.length) return null;

  return (
    <ListingSection title="Featured Materials" description="Priority construction and industrial material supplies." href="/construction-materials" buttonLabel="Browse All Materials">
      {featured.map((item) => {
        const href = `/construction-materials/${item.slug}`;
        return (
          <CardShell key={item.slug}>
            <CardHeader icon="🧱" title={item.name} country={item.country} category={item.materialType} />
            <div className="flex-1 p-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-500">
                <span>Price: <strong className="text-base text-[#0b1f3a]">{item.priceRange}</strong></span>
                {item.verified && <span className={`${badge} bg-emerald-100 text-emerald-700`}>Verified Manufacturer</span>}
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <div><strong className="text-slate-800">Supplier:</strong> {item.supplier}</div>
                <div><strong className="text-slate-800">Min Order Qty (MOQ):</strong> {item.minimumOrder}</div>
              </div>
            </div>
            <CardFooter href={href} firstHref="/contact" first="Request Price" second="View Details" />
          </CardShell>
        );
      })}
    </ListingSection>
  );
}

export function FeaturedBusinessOpportunities({ listings }: { listings: BusinessOpportunity[] }) {
  const featured = listings.filter((item) => item.featured).slice(0, 3);
  if (!featured.length) return null;

  return (
    <ListingSection title="Featured Business Opportunities" description="Selected businesses, partnerships, and investment opportunities." href="/business-opportunities" buttonLabel="Browse All Opportunities" alternate>
      {featured.map((item) => {
        const href = `/business-opportunities/${item.slug}`;
        return (
          <CardShell key={item.slug}>
            <CardHeader icon="💼" title={item.title} country={item.country} category="Business Opportunity" />
            <div className="flex-1 p-4">
              <div className="mb-4 text-sm text-slate-500">
                <div>Required Capital / Share:</div>
                <strong className="text-xl font-black text-[#0b1f3a]">{item.investment}</strong>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
            <div className="mt-auto border-t border-slate-200 bg-slate-50 p-4">
              <Link href={href} className="block rounded-md bg-amber-400 px-3 py-2 text-center text-xs font-bold text-[#0b1f3a] transition hover:bg-amber-300">Express Interest</Link>
            </div>
          </CardShell>
        );
      })}
    </ListingSection>
  );
}

export function FeaturedRfqs({ listings }: { listings: HomeRfq[] }) {
  const featured = listings.slice(0, 3);
  if (!featured.length) return null;

  return (
    <ListingSection
      title="Featured RFQs"
      description="Respond to active requests for materials, equipment, and construction services from buyers across the GCC."
      href="/rfqs"
      buttonLabel="Browse All RFQs"
    >
      {featured.map((item) => {
        const statusStyle =
          item.status === "published"
            ? "bg-emerald-100 text-emerald-700"
            : item.status === "closed"
              ? "bg-slate-200 text-slate-700"
              : "bg-amber-100 text-amber-700";

        return (
          <CardShell key={item.id}>
            <CardHeader
              icon={item.category === "Materials Sourcing" ? "📦" : "🏗️"}
              title={item.title}
              country={item.country}
              category={item.category}
            />
            <div className="flex-1 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-500">{item.reference}</span>
                <span className={`${badge} ${statusStyle}`}>{item.status}</span>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <div><strong className="text-slate-800">Project:</strong> {item.projectName}</div>
                <div><strong className="text-slate-800">Quantity:</strong> {item.quantity}</div>
                <div><strong className="text-slate-800">Budget:</strong> {item.budget || "On request"}</div>
                <div>
                  <strong className="text-slate-800">Closing:</strong>{" "}
                  {item.expirationDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-bold">
                <span className="rounded-md bg-red-50 px-2 py-1 text-red-700">{item.urgency}</span>
                <span className="text-blue-700">
                  {item.quotations.length} {item.quotations.length === 1 ? "bid" : "bids"}
                </span>
              </div>
            </div>
            <CardFooter href={`/rfqs?rfq=${encodeURIComponent(item.id)}`} first="Submit Quote" second="View RFQ" />
          </CardShell>
        );
      })}
    </ListingSection>
  );
}
