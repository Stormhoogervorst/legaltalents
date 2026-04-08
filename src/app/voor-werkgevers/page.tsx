import Link from "next/link";
import Image from "next/image";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";

const STEPS = [
  {
    num: "1",
    title: "Account aanmaken",
    desc: "Binnen twee minuten gepiept. Geen creditcard of KvK-nummer vereist — maak direct een gratis account aan.",
  },
  {
    num: "2",
    title: "Vacature plaatsen",
    desc: "Vul het eenvoudige formulier in en uw vacature is direct zichtbaar voor duizenden juridische professionals.",
  },
  {
    num: "3",
    title: "Dashboard beheren",
    desc: "Beheer vacatures, sollicitaties en je werkgeversprofiel vanuit één dashboard.",
  },
];

const FEATURES = [
  {
    label: "Gratis profiel",
    desc: "Maak direct een werkgeversprofiel aan — zonder kosten, zonder verplichtingen.",
  },
  {
    label: "Onbeperkt plaatsen",
    desc: "Publiceer zoveel vacatures en stages als u wilt, altijd gratis.",
  },
  {
    label: "Direct ontvangen",
    desc: "Sollicitaties recht in uw inbox. Bekijk kandidaten overzichtelijk in uw dashboard.",
  },
  {
    label: "Juridische niche",
    desc: "Bereik 100% juridische professionals — studenten én young professionals.",
  },
];

export const metadata = {
  title: "Voor Werkgevers | Legal Talents",
  description:
    "Plaats gratis vacatures en bereik juridisch talent. Het nicheplatform voor advocatenkantoren en juridische werkgevers.",
};

export default function VoorWerkgeversPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="bg-white overflow-hidden">
        <div
          className="max-w-[1400px] mx-auto"
          style={{ padding: "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 80px) clamp(60px, 8vh, 120px)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <span
                className="inline-block rounded-full bg-[#E9EEFF]"
                style={{
                  padding: "6px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: "#587DFE",
                }}
              >
                VOOR WERKGEVERS
              </span>

              <h1
                style={{
                  fontSize: "clamp(44px, 5.5vw, 76px)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  color: "#0A0A0A",
                  marginTop: "24px",
                  maxWidth: "640px",
                }}
              >
                Vind juridisch talent, zonder opstartkosten
                <span style={{ color: "#587DFE" }}>.</span>
              </h1>

              <p
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  maxWidth: "520px",
                  marginTop: "24px",
                }}
              >
                Het nicheplatform voor advocatenkantoren. Plaats eenvoudig uw
                vacatures, beheer uw dashboard en bereik uitsluitend juridische
                professionals.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link href="/register" className="btn-primary">
                  Gratis account aanmaken
                </Link>
                <Link href="#hoe-het-werkt" className="btn-secondary">
                  Hoe het werkt
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[8px]">
                <Image
                  src="/foto 2.jpg"
                  alt="Juridische professionals"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── Voordelen ──────────────────────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
            <div>
              <span
                className="inline-block rounded-full bg-[#E9EEFF]"
                style={{
                  padding: "6px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: "#587DFE",
                }}
              >
                VOORDELEN
              </span>
              <h2
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: "#0A0A0A",
                  marginTop: "20px",
                }}
              >
                Bereik juridisch talent gemakkelijk online
                <span style={{ color: "#587DFE" }}>.</span>
              </h2>
              <p
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  maxWidth: "480px",
                  marginTop: "20px",
                }}
              >
                Plaats uw werkgeversprofiel en vacatures op Legal Talents en
                ontvang sollicitaties van studenten en young professionals die
                doelgericht zoeken binnen de juridische markt.
              </p>
              <div className="mt-8">
                <Link href="/register" className="btn-primary">
                  Gratis account aanmaken
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {FEATURES.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-start gap-4"
                >
                  <div className="w-7 h-7 rounded-full bg-[#587DFE] flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#2C337A" }}>
                      {feature.label}
                    </h3>
                    <p style={{ fontSize: "15px", lineHeight: 1.6, color: "#5A6094", marginTop: "4px" }}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ──────────────────────────────────────── */}
      <section
        id="hoe-het-werkt"
        className="bg-[#F5F7FF] scroll-mt-20"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="lg:col-span-5">
              <span
                className="inline-block rounded-full bg-[#E9EEFF]"
                style={{
                  padding: "6px 16px",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: "#587DFE",
                }}
              >
                HOE HET WERKT
              </span>
              <h2
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: "#0A0A0A",
                  marginTop: "20px",
                }}
              >
                In drie stappen live
                <span style={{ color: "#587DFE" }}>.</span>
              </h2>
              <p
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  maxWidth: "640px",
                  marginTop: "20px",
                }}
              >
                Geen ingewikkelde onboarding. Binnen een paar minuten plaatst u
                uw eerste vacature.
              </p>
              <div className="mt-8">
                <Link href="/register" className="btn-primary">
                  Gratis account aanmaken
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-5">
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className="bg-[#EEF1FF] rounded-[8px] p-6 sm:p-8 flex gap-5 items-start"
                >
                  <div
                    className="shrink-0 w-10 h-10 rounded-full bg-[#587DFE] flex items-center justify-center"
                    style={{ fontSize: "15px", fontWeight: 600, color: "#FFFFFF" }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#2C337A" }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: "15px", lineHeight: 1.6, color: "#5A6094", marginTop: "6px" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Voor werkgevers image + quote ──────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-20">
            {/* Image */}
            <div className="relative lg:overflow-visible overflow-hidden">
              <div className="relative rounded-[8px] overflow-hidden h-full min-h-[400px]">
                <Image
                  src="/foto 4.jpg"
                  alt="Juridisch team in vergadering"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Quote + text */}
            <div className="flex flex-col justify-center">
              <span
                style={{
                  fontSize: "clamp(72px, 8vw, 120px)",
                  fontWeight: 700,
                  lineHeight: 0.85,
                  color: "#587DFE",
                }}
              >
                &ldquo;
              </span>
              <blockquote
                className="mt-2"
                style={{
                  fontSize: "clamp(24px, 3vw, 40px)",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  color: "#2C337A",
                }}
              >
                Met Legal Talents bereiken wij precies de juridische
                professionals die we zoeken. Het platform is intuïtief,
                effectief en zonder drempels.
              </blockquote>
              <p
                className="mt-8"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  maxWidth: "500px",
                }}
              >
                Maak vandaag nog een gratis account aan en bereik duizenden
                juridische professionals. Geen creditcard vereist, direct actief.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link href="/register" className="btn-primary">
                  Gratis account aanmaken
                </Link>
                <Link href="/jobs" className="btn-secondary">
                  Bekijk vacatures
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Employer CTA */}
      <section
        className="bg-[#587DFE]"
        style={{ padding: "clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto text-center">
          <span
            className="inline-block rounded-full border border-white/30"
            style={{
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            KLAAR OM TE STARTEN?
          </span>
          <h2
            className="mx-auto"
            style={{
              fontSize: "clamp(32px, 4.5vw, 60px)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#FFFFFF",
              marginTop: "24px",
              maxWidth: "700px",
            }}
          >
            Bereik juridisch talent vandaag nog
          </h2>
          <p
            className="mx-auto"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.8)",
              maxWidth: "500px",
              marginTop: "20px",
            }}
          >
            Maak een gratis account aan, plaats uw eerste vacature en ontvang
            direct sollicitaties van juridische professionals.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium transition-transform duration-200 hover:scale-[1.03]"
              style={{ fontSize: "15px", color: "#2C337A" }}
            >
              Gratis account aanmaken
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-medium transition-all duration-200 hover:bg-white/10"
              style={{ fontSize: "15px", color: "#FFFFFF" }}
            >
              Inloggen
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
