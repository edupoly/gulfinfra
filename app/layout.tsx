import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

import "@fortawesome/fontawesome-svg-core/styles.css"; // Import the CSS manually
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; // Prevent Font Awesome from dynamically adding its own CSS

export const metadata: Metadata = {
  title: "GulfBuildHub Marketplace",
  description: "A GCC contractor discovery and category listing application modeled on the GulfBuildHub reference experience.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteNavbar userEmail={user?.email ?? null} userRole={user?.role ?? null} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
