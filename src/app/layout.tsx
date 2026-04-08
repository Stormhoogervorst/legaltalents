import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Legal Talents | Hét platform voor Juridische Vacatures en Stages",
  description: "Legal Talents is hét platform voor juridische vacatures en stages. Ontdek actuele posities bij topkantoren in de advocatuur en vind jouw volgende stap.",
  keywords: ["juridische vacatures", "juridische stages", "advocatuur", "Legal Talents", "vacatures advocatuur", "stages advocatuur"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
