import type { Metadata } from "next";
import { SiteNavbar } from "@/components/SiteNavbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "GulfBuildHub Marketplace",
  description: "A GCC contractor discovery and category listing application modeled on the GulfBuildHub reference experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteNavbar />
        {children}
      </body>
    </html>
  );
}
