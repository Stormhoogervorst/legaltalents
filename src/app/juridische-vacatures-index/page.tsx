import { Metadata } from "next";
import Link from "next/link";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import { CITIES, cityDisplayName } from "@/lib/cities";
import { PRACTICE_AREAS } from "@/lib/practiceAreas";
import { JOB_FUNCTIONS } from "@/lib/jobFunctions";

export const metadata: Metadata = {
  title: "Index van Juridische Vacatures & Stages | Legal Talents",
  description:
    "Compleet overzicht van alle juridische vacatures en stages per functie, rechtsgebied en stad in Nederland. Vind snel de juiste positie bij topwerkgevers in de juridische sector.",
  keywords: [
    "juridische vacatures",
    "juridische stages",
    "advocaat vacatures",
    "jurist vacatures",
    "kandidaat-notaris vacatures",
    "vacatures per stad",
    "rechtsgebied vacatures",
    "Legal Talents",
  ],
};

const sectionPadding = {
  paddingLeft: "clamp(24px, 5vw, 80px)",
  paddingRight: "clamp(24px, 5vw, 80px)",
  paddingTop: "clamp(40px, 5vh, 56px)",
  paddingBottom: "clamp(40px, 5vh, 56px)",
} as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-bold tracking-[-0.02em] text-[#0A0A0A] mb-2"
      style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
    >
      {children}
    </h2>
  );
}

function SectionSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-10 max-w-[640px]"
      style={{ fontSize: "clamp(14px, 1vw, 16px)", lineHeight: 1.6, color: "#6B6B6B" }}
    >
      {children}
    </p>
  );
}

export default function JuridischeVacaturesIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      {/* Hero / Intro */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(60px, 8vh, 120px)",
          paddingBottom: "clamp(40px, 5vh, 64px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#587DFE] mb-6" />
          <h1
            className="font-bold tracking-[-0.03em] leading-[1.05] text-[#0A0A0A]"
            style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
          >
            Vacature Index
          </h1>
          <p
            className="mt-6 leading-relaxed max-w-[720px]"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              lineHeight: 1.65,
              color: "#6B6B6B",
            }}
          >
            Legal Talents biedt het meest complete overzicht van juridische
            vacatures in Nederland. Zoek op functie, rechtsgebied of locatie en
            vind direct de vacatures die bij jou passen. Van advocaat in
            Amsterdam tot kandidaat-notaris in Utrecht — alle combinaties staan
            hieronder. Elke link brengt je naar een gefilterd overzicht met
            actuele vacatures bij topkantoren en juridische organisaties.
          </p>
        </div>
      </section>

      {/* ── 1. Per Functie ──────────────────────────────────────── */}
      <section className="border-t border-[#E5E5E5]" style={sectionPadding}>
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading>Vacatures per Functie</SectionHeading>
          <SectionSubtext>
            Bekijk alle juridische vacatures per functietitel. Klik op een
            functie om direct het actuele aanbod te bekijken.
          </SectionSubtext>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3">
            {JOB_FUNCTIONS.map((fn) => (
              <Link
                key={fn}
                href={`/jobs?functie=${encodeURIComponent(fn)}`}
                title={`Bekijk alle ${fn} vacatures`}
                className="text-[15px] font-medium text-[#0A0A0A] hover:text-[#587DFE] transition-colors duration-200 py-1"
              >
                {fn} vacatures
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Per Rechtsgebied ─────────────────────────────────── */}
      <section className="border-t border-[#E5E5E5] bg-[#FAFAFA]" style={sectionPadding}>
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading>Vacatures per Rechtsgebied</SectionHeading>
          <SectionSubtext>
            Zoek vacatures binnen een specifiek rechtsgebied, ongeacht de
            locatie.
          </SectionSubtext>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3">
            {PRACTICE_AREAS.filter((a) => a !== "Overig").map((area) => (
              <Link
                key={area}
                href={`/jobs?rechtsgebied=${encodeURIComponent(area)}`}
                title={`Bekijk alle ${area} vacatures`}
                className="text-[15px] font-medium text-[#0A0A0A] hover:text-[#587DFE] transition-colors duration-200 py-1"
              >
                {area} vacatures
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Functie + Locatie ────────────────────────────────── */}
      <section className="border-t border-[#E5E5E5]" style={sectionPadding}>
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading>Vacatures per Functie &amp; Stad</SectionHeading>
          <SectionSubtext>
            Combineer een functietitel met een stad om gericht te zoeken. Elke
            link toont het actuele aanbod voor die combinatie.
          </SectionSubtext>

          <div className="space-y-10">
            {JOB_FUNCTIONS.map((fn) => (
              <div key={fn}>
                <h3 className="text-[15px] font-semibold tracking-wide uppercase text-[#587DFE] mb-3">
                  {fn}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-2">
                  {CITIES.map((slug) => {
                    const city = cityDisplayName(slug);
                    return (
                      <Link
                        key={slug}
                        href={`/vacatures/${slug}?functie=${encodeURIComponent(fn)}`}
                        title={`Bekijk alle ${fn} vacatures in ${city}`}
                        className="text-[14px] text-[#444] hover:text-[#587DFE] transition-colors duration-200 py-0.5"
                      >
                        {fn} vacatures in {city}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Rechtsgebied + Locatie ───────────────────────────── */}
      <section
        className="border-t border-[#E5E5E5] bg-[#FAFAFA]"
        style={{
          ...sectionPadding,
          paddingBottom: "clamp(60px, 8vh, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading>Vacatures per Rechtsgebied &amp; Stad</SectionHeading>
          <SectionSubtext>
            Zoek vacatures binnen een rechtsgebied in een specifieke stad.
          </SectionSubtext>

          <div className="space-y-10">
            {PRACTICE_AREAS.filter((a) => a !== "Overig").map((area) => (
              <div key={area}>
                <h3 className="text-[15px] font-semibold tracking-wide uppercase text-[#587DFE] mb-3">
                  {area}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-2">
                  {CITIES.map((slug) => {
                    const city = cityDisplayName(slug);
                    return (
                      <Link
                        key={slug}
                        href={`/vacatures/${slug}?rechtsgebied=${encodeURIComponent(area)}`}
                        title={`Bekijk alle ${area} vacatures in ${city}`}
                        className="text-[14px] text-[#444] hover:text-[#587DFE] transition-colors duration-200 py-0.5"
                      >
                        {area} vacatures in {city}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
