import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import ImpersonationBar from "@/components/ImpersonationBar";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Legal Talents | Hét platform voor Juridische Vacatures en Stages",
    template: "%s | Legal Talents",
  },
  description:
    "Vind juridische stages en vacatures bij topkantoren in Nederland. Hét carrièreplatform voor rechtenstudenten en young professionals.",
  keywords: [
    "juridische vacatures",
    "juridische stages",
    "advocatuur",
    "Legal Talents",
    "vacatures advocatuur",
    "stages advocatuur",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Legal Talents",
    url: "/",
    title: "Legal Talents | Hét platform voor Juridische Vacatures en Stages",
    description:
      "Vind juridische stages en vacatures bij topkantoren in Nederland. Hét carrièreplatform voor rechtenstudenten en young professionals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Talents | Hét platform voor Juridische Vacatures en Stages",
    description:
      "Vind juridische stages en vacatures bij topkantoren in Nederland. Hét carrièreplatform voor rechtenstudenten en young professionals.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <ImpersonationBar />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
