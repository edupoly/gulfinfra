"use client";

import Link from "next/link";
import { logout } from "@/app/auth/actions";

const items = [
  { label: "Overview", href: "#overview", icon: "⌂" },
  { label: "My listings", href: "#listings", icon: "▤" },
  { label: "My RFQs", href: "/my-rfqs", icon: "⌕" },
  { label: "My quotations", href: "/my-quotations", icon: "▧" },
  { label: "My applications", href: "/my-applications", icon: "✓" },
  { label: "Received applications", href: "/my-project-applications", icon: "◎" },
  { label: "Saved listings", href: "#saved-listings", icon: "★" },
  { label: "Messages", href: "/messages", icon: "✉" },
  { label: "Notifications", href: "/notifications", icon: "●" },
  { label: "Profile details", href: "#profile", icon: "♙" },
  { label: "Change password", href: "#security", icon: "◆" },
  { label: "Add a listing", href: "/add-listing", icon: "＋" },
  { label: "Password recovery", href: "/forgot-password", icon: "↻" },
];

export function DashboardSidebar({
  email,
  fullName,
  profileImageUrl,
}: {
  email: string;
  fullName: string | null;
  profileImageUrl: string | null;
}) {
  const initials = (fullName || email).slice(0, 2).toUpperCase();

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
      <div className="border-b border-slate-200 bg-[#0b1f3a] p-5 text-white">
        {profileImageUrl ? (
          <div role="img" aria-label={`${fullName || email} profile photo`} className="size-16 rounded-full border-2 border-amber-400 bg-cover bg-center" style={{ backgroundImage: `url("${profileImageUrl.replaceAll('"', "%22")}")` }} />
        ) : (
          <div className="grid size-16 place-items-center rounded-full bg-amber-400 text-xl font-black text-[#0b1f3a]">{initials}</div>
        )}
        <p className="mt-3 font-black">{fullName || "Your account"}</p>
        <p className="mt-1 truncate text-xs text-white/70">{email}</p>
      </div>
      <nav aria-label="Account dashboard" className="p-3">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-amber-50 hover:text-[#0b1f3a]">
                <span aria-hidden="true" className="grid size-7 place-items-center rounded-lg bg-slate-100 text-[#0b1f3a]">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <form action={logout} className="border-t border-slate-200 p-3">
        <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-700 hover:bg-red-50">Sign out</button>
      </form>
    </aside>
  );
}
