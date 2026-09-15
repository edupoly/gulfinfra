import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

const directoryLinks = [
  { label: "Contractors", href: "/contractors" },
  { label: "Projects & Tenders", href: "/projects-tenders" },
  { label: "RFQs", href: "/rfqs" },
  { label: "Equipment Marketplace", href: "/equipment-marketplace" },
  { label: "Construction & Industrial Materials", href: "/construction-materials" },
  { label: "Business Opportunities", href: "/business-opportunities" },
] as const;

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Industry Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
  { label: "Careers", href: "/careers" },
  { label: "Privacy Policy", href: "/privacy-policy" },
] as const;

const socials = [
  { label: "Facebook", href: "#", icon: faFacebookF },
  { label: "X", href: "#", icon: faXTwitter },
  { label: "LinkedIn", href: "#", icon: faLinkedinIn },
  { label: "Instagram", href: "#", icon: faInstagram },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#061224] text-sm text-slate-400">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-6 pb-12 pt-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-[2fr_1fr_1fr_1.5fr] lg:gap-12 lg:pt-20">
        <div>
          <Link href="/" className="mb-5 flex items-center gap-2.5">
            <FooterLogo />
            <span className="flex flex-col text-left leading-none">
              <span className="text-[1.45rem] font-black tracking-[-0.02em]">
                <span className="text-white">GULF</span>
                <span className="text-amber-400">BUILDHUB</span>
              </span>
              <span className="mt-1 text-[0.58rem] font-medium tracking-[0.02em] text-white/75">
                Gulf Construction &amp; Business Marketplace
              </span>
            </span>
          </Link>

          <p className="max-w-lg leading-6">
            GulfBuildHub is the leading premium business-to-business listing directory and industrial marketplace in the GCC. Connecting buyers, suppliers, contractors, and project developers across the Middle East.
          </p>

          <div className="mt-6 flex gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex size-9 items-center justify-center rounded-full bg-white/5 text-white transition hover:-translate-y-1 hover:bg-amber-400 hover:text-[#0b1f3a]"
              >
                <FontAwesomeIcon icon={social.icon} className="w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterLinks title="Directories" links={directoryLinks} />
        <FooterLinks title="Company" links={companyLinks} />

        <div>
          <FooterHeading>Newsletter</FooterHeading>
          <p className="leading-6">
            Subscribe to receive weekly tenders and high-priority RFQs directly in your inbox.
          </p>
          <form action="#" className="mt-4 flex overflow-hidden rounded-xl border border-white/10 shadow-sm">
            <label htmlFor="footer-newsletter-email" className="sr-only">Your corporate email</label>
            <input
              id="footer-newsletter-email"
              name="email"
              type="email"
              required
              placeholder="Your corporate email"
              className="min-w-0 flex-1 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:bg-white/10"
            />
            <button type="submit" className="bg-amber-400 px-5 font-bold text-[#0b1f3a] transition hover:bg-amber-300">
              Join
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      <div className="border-t border-white/5 px-6 py-8 text-center text-xs sm:px-8">
        <p>
          © {new Date().getFullYear()} GulfBuildHub. All Rights Reserved. Serving Saudi Arabia, UAE, Qatar, Kuwait, Oman &amp; Bahrain.
        </p>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="relative mb-6 pb-2 text-lg font-semibold !text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-[30px] after:bg-amber-400">
      {children}
    </h2>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <nav aria-label={`${title} footer navigation`}>
      <FooterHeading>{title}</FooterHeading>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="inline-block transition hover:translate-x-1 hover:text-amber-400">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterLogo() {
  return (
    <svg aria-hidden="true" width="48" height="38" viewBox="0 0 100 80" fill="none" className="shrink-0">
      <path d="M15 70V35l11-11v46M20 36v2m0 8v2m0 8v2M34 70V20c0-8 12-8 12 0v50M34 22c2-8 10-8 12 0M40 14V6M40 28v34M54 70V28l11 10v32M60 46v2m0 8v2M6 70h68" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
