import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBell,
  faBolt,
  faFileContract,
  faRocket,
  faShieldHalved,
  faStore,
} from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faBolt,
    title: "Direct GCC Connections",
    description:
      "Instantly reach active developers and sub-contractors in Saudi, UAE, Qatar & rest of GCC.",
  },
  {
    icon: faShieldHalved,
    title: "Verified Sourcing",
    description:
      "Engage in transparent, direct negotiations with zero platform commission or middleman fees.",
  },
  {
    icon: faBell,
    title: "Instant Smart Alerts",
    description:
      "Receive real-time lead and RFQ notifications direct to your inbox or business dashboard.",
  },
] as const;

export function GccMarketplaceOpportunities() {
  return (
    <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_10%_20%,#162f52_0%,#0b1f3a_45%,#061224_100%)] p-6 text-white shadow-2xl sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-28 size-[350px] rounded-full bg-[radial-gradient(circle,rgba(244,180,0,.12),transparent_70%)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-44 -left-24 size-[450px] rounded-full bg-[radial-gradient(circle,rgba(22,47,82,.55),transparent_75%)] blur-3xl" />

          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-14">
            <div className="flex flex-col">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-amber-400 shadow-[0_4px_16px_rgba(244,180,0,.1)]">
                <FontAwesomeIcon icon={faRocket} className="w-3.5" />
                GCC Marketplace Opportunities
              </div>

              <h2 className="text-3xl font-black leading-tight !text-white sm:text-4xl lg:text-[2.5rem]">
                Ready to Expand Your Construction Business?
              </h2>
              <p className="mt-4 text-lg leading-7 text-white/85">
                List your contracting services, showcase materials inventory, bid on government tenders, or submit equipment rental deals to thousands of prospective builders daily.
              </p>

              <ul className="mt-8 space-y-5">
                {features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex size-[26px] shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs text-amber-400 shadow-[0_0_8px_rgba(244,180,0,.2)]">
                      <FontAwesomeIcon icon={feature.icon} className="w-3" />
                    </span>
                    <span>
                      <strong className="block text-base text-white">{feature.title}</strong>
                      <span className="mt-1 block text-sm leading-5 text-white/65">
                        {feature.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <OpportunityCard
                icon={faStore}
                title="For Suppliers & Contractors"
                description="Register your listing, present credentials, list equipment or materials, and bid on public tenders."
                href="/add-listing"
                action="Register Business Listing"
                primary
              />
              <OpportunityCard
                icon={faFileContract}
                title="For Buyers & Developers"
                description="Publish project requirements and RFQs to obtain quick, competitive bids from verified GCC companies."
                href="/projects-tenders"
                action="Request Quotations"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OpportunityCard({
  icon,
  title,
  description,
  href,
  action,
  primary = false,
}: {
  icon: typeof faStore;
  title: string;
  description: string;
  href: string;
  action: string;
  primary?: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-7 shadow-[0_8px_32px_rgba(11,31,58,.3)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-amber-400/25 hover:bg-white/[0.06]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.05),transparent)]" />
      <div className="relative z-10">
        <h3 className="flex items-center gap-2.5 text-xl font-black !text-white">
          <FontAwesomeIcon icon={icon} className="w-5 text-amber-400" />
          {title}
        </h3>
        <p className="mb-5 mt-2 text-sm leading-6 text-white/70">{description}</p>
        <Link
          href={href}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold transition ${
            primary
              ? "bg-amber-400 text-[#0b1f3a] hover:bg-amber-300"
              : "border border-white/40 text-white hover:border-amber-400 hover:text-amber-400"
          }`}
        >
          {action}
          <FontAwesomeIcon icon={faArrowRight} className="w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
