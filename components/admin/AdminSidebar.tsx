"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";

const links = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/users", label: "User management" },
  { href: "/admin/listings", label: "All listings" },
  { href: "/admin/project-applications", label: "Project applications" },
  { href: "/admin/contact-submissions", label: "Contact submissions" },
  { href: "/admin/security", label: "Change password" },
];

export function AdminSidebar({ email, fullName }: { email: string; fullName: string }) {
  const pathname = usePathname();

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
      <div className="bg-[#0b1f3a] p-5 text-white">
        <div className="grid size-14 place-items-center rounded-2xl bg-amber-400 text-xl font-black text-[#0b1f3a]">
          AD
        </div>
        <p className="mt-3 font-black">{fullName}</p>
        <p className="mt-1 truncate text-xs text-white/70">{email}</p>
      </div>
      <nav aria-label="Admin dashboard" className="p-3">
        <ul className="space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-amber-100 text-[#0b1f3a]"
                      : "text-slate-700 hover:bg-amber-50 hover:text-[#0b1f3a]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li className="border-t border-slate-100 pt-2">
            <Link href="/add-listing" className="block rounded-xl px-3 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">
              Add listing ↗
            </Link>
          </li>
        </ul>
      </nav>
      <form action={logout} className="border-t border-slate-200 p-3">
        <button
          type="submit"
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
