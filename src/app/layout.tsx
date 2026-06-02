import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
    default: "Legal Vacatures Nederland",
    template: "%s | Legal Vacatures Nederland",
  },
  description:
    "Vind juridische stages en vacatures bij topkantoren in Nederland. Hét carrièreplatform voor rechtenstudenten en young professionals.",
  keywords: [
    "juridische vacatures",
    "juridische stages",
    "advocatuur",
    "Legal Vacatures",
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
  icons: {
    icon: [
      { url: "/logo.png", sizes: "48x48", type: "image/png" },
      { url: "/logo.png", sizes: "96x96", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Legal Vacatures",
    url: SITE_URL,
    title: "Legal Vacatures Nederland",
    description: "De vacaturesite voor de juridische sector",
    images: [
      {
        url: "/socialpreview.png",
        width: 1200,
        height: 630,
        alt: "Legal Vacatures Preview Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Vacatures Nederland",
    description: "De vacaturesite voor de juridische sector",
    images: ["/socialpreview.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NFNBYPXR5X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NFNBYPXR5X');
          `}
        </Script>
        <ImpersonationBar />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
