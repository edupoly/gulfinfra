"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/auth/actions";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Contractors", href: "/contractors" },
  { name: "Projects & Tenders", href: "/projects-tenders" },
  { name: "RFQs", href: "/rfqs" },
  { name: "Equipment Marketplace", href: "/equipment-marketplace" },
  { name: "Construction & Industrial Materials", href: "/construction-materials" },
  { name: "Business Opportunities", href: "/business-opportunities" },
];

export function SiteNavbar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1f3a]/[0.98] text-white shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex min-h-[100px] w-full max-w-[1440px] items-center justify-between gap-5 px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="GulfInfraHub home" onClick={() => setOpen(false)}>
          <SkylineLogo />
          <span className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-headings)] text-[1.18rem] font-black tracking-[-0.03em] sm:text-[1.45rem]">
              GULF<span className="text-amber-400">INFRAHUB</span>
            </span>
            <span className="mt-1 text-[0.52rem] font-medium tracking-wide text-white/70 sm:text-[0.58rem]">
              Gulf Construction & Business Marketplace
            </span>
          </span>
        </Link>

        <button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)} className="grid size-11 place-items-center rounded-lg border border-white/20 xl:hidden">
          <span className="text-2xl">{open ? "×" : "☰"}</span>
        </button>

        <div className={`${open ? "flex" : "hidden"} absolute left-0 right-0 top-full max-h-[calc(100vh-100px)] flex-col overflow-y-auto border-t border-white/10 bg-[#0b1f3a] px-6 py-6 shadow-xl xl:static xl:flex xl:max-h-none xl:flex-row xl:items-center xl:gap-5 xl:overflow-visible xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none`}>
          <nav aria-label="Primary navigation">
            <ul className="flex flex-col gap-1 xl:flex-row xl:items-center xl:gap-4">
              {navigation.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={`relative block py-2 text-sm font-bold transition hover:text-amber-300 xl:max-w-32 xl:py-1 xl:text-center xl:text-[0.78rem] ${active ? "text-white after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:bg-amber-400" : "text-white/90"}`}>{item.name}</Link></li>;
              })}
            </ul>
          </nav>
          <div className="mt-5 flex flex-col items-start gap-2 border-t border-white/10 pt-5 xl:mt-0 xl:items-end xl:border-0 xl:pt-0">
            {userEmail ? (
              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <Link href="/my-listings" onClick={() => setOpen(false)}>My Listings</Link>
                <span className="text-white/25">|</span>
                <form action={logout}><button type="submit">Logout</button></form>
              </div>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="text-xs font-bold text-white/90">♙ Login / Register</Link>
            )}
            <Link href="/add-listing" onClick={() => setOpen(false)} className={`rounded-md px-4 py-2 text-xs font-black shadow-sm transition ${pathname === "/add-listing" ? "bg-white text-[#0b1f3a]" : "bg-amber-400 text-[#0b1f3a] hover:bg-amber-300"}`}>＋ Add Listing</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function SkylineLogo() {
  return <svg aria-hidden="true" width="48" height="40" viewBox="0 0 78 80" fill="none" className="shrink-0">
    <path d="M10 70V35L22 24V70M17 37v2m0 7v2m0 7v2M31 70V20c0-7 13-7 13 0v50M31 22c2-9 11-9 13 0M37.5 14V6M37.5 29v33M53 70V29l12 10v31M59 47v2m0 8v2M4 70h68" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
