"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavbarPublicVariant = "default" | "overlay" | "hero";

type NavbarPublicProps = {
  variant?: NavbarPublicVariant;
};

function useNavActive(pathname: string | null) {
  const p = pathname ?? "";
  return {
    vacatures: p === "/jobs" || p.startsWith("/jobs/"),
    stages: p === "/stages" || p.startsWith("/stages/"),
    werkgevers:
      p === "/firms" ||
      p.startsWith("/firms/") ||
      p === "/voor-werkgevers",
    kennisbank: p === "/kennisbank" || p.startsWith("/kennisbank/"),
    recruitment: p === "/recruitment" || p.startsWith("/recruitment/"),
  };
}

export default function NavbarPublic({
  variant = "default",
}: NavbarPublicProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const active = useNavActive(pathname);

  const linkClass = (key: keyof ReturnType<typeof useNavActive>) =>
    cn(
      "inline-flex items-center text-[14px] font-medium transition-colors duration-200",
      variant === "hero"
        ? active[key]
          ? "text-white"
          : "text-white/70 hover:text-white"
        : active[key]
          ? "text-[#2C337A]"
          : "text-[#5A6094] hover:text-[#2C337A]",
    );

  const menuIconClass =
    variant === "hero"
      ? "text-white/80 hover:text-white"
      : "text-[#5A6094] hover:text-[#2C337A]";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50",
        variant === "hero"
          ? "bg-transparent"
          : variant === "overlay"
            ? "bg-white/90 backdrop-blur-sm border-b border-[#E2E5F0]"
            : "bg-white border-b border-[#E2E5F0]",
      )}
    >
      <div
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex h-[4.25rem] items-center justify-between gap-6">
            <div className="flex items-center min-w-0 gap-8 lg:gap-10">
              <Link href="/" className="flex items-center shrink-0">
                <Image
                  src="/legal-talents-logo.png"
                  alt="Legal Talents Logo"
                  width={150}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </Link>

              <div className="hidden md:flex items-center gap-6 lg:gap-8">
                <Link href="/jobs" className={linkClass("vacatures")} title="Juridische Vacatures">
                  Vacatures
                </Link>
                <Link href="/stages" className={linkClass("stages")} title="Juridische Stages">
                  Stages
                </Link>
                <Link href="/firms" className={linkClass("werkgevers")}>
                  Werkgevers
                </Link>
                <Link href="/kennisbank" className={linkClass("kennisbank")}>
                  Kennisbank
                </Link>
                <Link href="/recruitment" className={linkClass("recruitment")}>
                  Recruitment
                </Link>
              </div>
            </div>

            <div className="flex items-center shrink-0 gap-4">
              <Link
                href="/register"
                className={cn(
                  "hidden md:inline-flex items-center rounded-full px-5 py-2 text-[14px] font-medium transition-all duration-200 hover:scale-[1.03]",
                  variant === "hero"
                    ? "bg-white text-[#2C337A]"
                    : "bg-[#587DFE] text-white",
                )}
              >
                Werkgever aanmelden
              </Link>

              <button
                type="button"
                className={cn("md:hidden p-2 -mr-2 transition-colors", menuIconClass)}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className={cn(
            "md:hidden border-t py-5",
            variant === "hero"
              ? "border-white/15 bg-[#2C337A]/95 backdrop-blur-sm"
              : "border-[#E2E5F0] bg-white",
          )}
          style={{
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
          }}
        >
          <div className="max-w-[1400px] mx-auto flex flex-col gap-5 items-start">
            <Link
              href="/jobs"
              className={cn(linkClass("vacatures"), "block w-fit py-1 text-base")}
              onClick={() => setMenuOpen(false)}
              title="Juridische Vacatures"
            >
              Vacatures
            </Link>
            <Link
              href="/stages"
              className={cn(linkClass("stages"), "block w-fit py-1 text-base")}
              onClick={() => setMenuOpen(false)}
              title="Juridische Stages"
            >
              Stages
            </Link>
            <Link
              href="/firms"
              className={cn(linkClass("werkgevers"), "block w-fit py-1 text-base")}
              onClick={() => setMenuOpen(false)}
            >
              Werkgevers
            </Link>
            <Link
              href="/kennisbank"
              className={cn(linkClass("kennisbank"), "block w-fit py-1 text-base")}
              onClick={() => setMenuOpen(false)}
            >
              Kennisbank
            </Link>
            <Link
              href="/recruitment"
              className={cn(linkClass("recruitment"), "block w-fit py-1 text-base")}
              onClick={() => setMenuOpen(false)}
            >
              Recruitment
            </Link>
            <div className={cn("pt-3 mt-1 border-t", variant === "hero" ? "border-white/15" : "border-[#E2E5F0]")}>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-[#587DFE] px-5 py-2.5 text-[15px] font-medium text-white"
                onClick={() => setMenuOpen(false)}
              >
                Werkgever aanmelden
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
