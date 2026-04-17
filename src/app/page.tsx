import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import HeroSection from "@/components/HeroSection";
import VacatureCarousel from "@/components/VacatureCarousel";
import VacatureListMobile from "@/components/VacatureListMobile";
import { createClient } from "@/lib/supabase/server";
import { Firm, Job } from "@/types";

interface BlogPreview {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  image_url: string | null;
  created_at: string;
  firms: { name: string; logo_url: string | null } | null;
}

const blogCategoryLabels: Record<string, string> = {
  carriere: "Carrière",
  juridisch: "Juridisch",
  kantoorleven: "Kantoorleven",
};


export default async function HomePage() {
  const supabase = await createClient();

  const { data: allFirms } = await supabase
    .from("firms")
    .select("id, name, slug, location, practice_areas, logo_url, team_size, is_published")
    .eq("is_published", true);

  const firms = (allFirms ?? []) as Firm[];
  const featuredFirms = firms
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  const { data: topJobs } = await supabase
    .from("jobs")
    .select("*, firms ( name, logo_url, slug )")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  const allJobs = (topJobs ?? []).map((j) => ({
    ...j,
    firms: Array.isArray(j.firms) ? (j.firms[0] ?? null) : (j.firms ?? null),
  })) as Job[];

  const { data: blogData } = await supabase
    .from("blogs")
    .select(`
      id, title, slug, category, content, image_url, created_at,
      firms ( name, logo_url )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  const latestBlogs = ((blogData ?? []) as unknown as BlogPreview[]).map((b) => ({
    ...b,
    firms: Array.isArray(b.firms) ? b.firms[0] ?? null : b.firms,
  }));

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <NavbarPublic variant="hero" />

      {/* ── Hero ──────────────────────────────────────────────── */}
      {/* Negative margin pulls the hero gradient up behind the liquid-glass navbar */}
      <div className="-mt-[4.25rem]">
        <HeroSection />
      </div>

      {/* ── Top vacatures carrousel ───────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Mobiel: titel + punt over volledige breedte, punt rechts = rechterrand kaarten */}
          <div className="md:hidden flex items-baseline justify-between mb-8">
            <h2
              className="whitespace-nowrap"
              style={{
                fontSize: "clamp(30px, 9.5vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              Nieuwste vacatures
            </h2>
            <span
              aria-hidden="true"
              style={{
                fontSize: "clamp(30px, 9.5vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.05,
                color: "#587DFE",
              }}
            >
              .
            </span>
          </div>

          {/* Desktop: titel + knop naast elkaar */}
          <div className="hidden md:flex items-end justify-between gap-6 mb-16">
            <h2
              style={{
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              De nieuwste juridische vacatures
              <span style={{ color: "#587DFE" }}>.</span>
            </h2>
            <Link href="/jobs" className="btn-primary shrink-0 mb-1">
              Alle vacatures
            </Link>
          </div>

          {allJobs.length > 0 ? (
            <>
              {/* Mobile: compact vertical list (max 5) */}
              <div className="md:hidden">
                <VacatureListMobile jobs={allJobs} limit={5} />
                <Link
                  href="/jobs"
                  className="btn-primary mt-6 w-full justify-center inline-flex"
                >
                  Alle vacatures
                </Link>
              </div>

              {/* Desktop / tablet: existing carousel */}
              <div className="hidden md:block">
                <VacatureCarousel jobs={allJobs} />
              </div>
            </>
          ) : (
            <p style={{ fontSize: "15px", color: "#8B91B8" }}>
              Er zijn momenteel geen vacatures beschikbaar.
            </p>
          )}
        </div>
      </section>

      {/* ── Werkgevers grid ───────────────────────────────────── */}
      <section
        className="bg-white"
        style={{
          paddingTop: "clamp(40px, 5vh, 80px)",
          paddingBottom: "clamp(80px, 10vh, 160px)",
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">

          {/* ── Mobile header (left-aligned, natural wrap) ── */}
          <div className="md:hidden mb-8">
            <h2
              className="text-left"
              style={{
                fontSize: "clamp(30px, 9.5vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              Uitgelichte werkgevers
              <span style={{ color: "#587DFE" }}>.</span>
            </h2>
          </div>

          {/* ── Desktop header (title + button side by side) ── */}
          <div className="hidden md:flex items-end justify-between gap-6 mb-16">
            <h2
              style={{
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              Uitgelichte werkgevers
              <span style={{ color: "#587DFE" }}>.</span>
            </h2>
            <Link href="/firms" className="btn-primary shrink-0 mb-1">
              Alle werkgevers
            </Link>
          </div>

          {/* ── Mobile: vertical list with roomier cards ── */}
          <div className="md:hidden">
            <ul className="flex flex-col gap-3">
              {featuredFirms.map((firm) => (
                <li key={firm.id}>
                  <Link
                    href={`/firms/${firm.slug}`}
                    className="flex items-center gap-4 rounded-[16px] px-4 py-5 transition-all duration-200 active:scale-[0.99]"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
                      backgroundColor: "#F5F7FF",
                    }}
                  >
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-[12px] bg-white border border-[#E2E5F0] flex items-center justify-center overflow-hidden p-2 shrink-0">
                      {firm.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firm.logo_url}
                          alt={firm.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#2C337A" }}>
                          {firm.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold leading-snug line-clamp-1"
                        style={{
                          fontSize: "16px",
                          letterSpacing: "-0.01em",
                          color: "#2C337A",
                        }}
                      >
                        {firm.name}
                      </h3>

                      {firm.location && (
                        <div
                          className="flex items-center gap-1 mt-1.5"
                          style={{ fontSize: "13px", color: "#8B91B8" }}
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {firm.location}
                            {firm.team_size && (
                              <><span className="mx-1">·</span>{firm.team_size} mw.</>
                            )}
                          </span>
                        </div>
                      )}

                      {firm.practice_areas && firm.practice_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {firm.practice_areas.slice(0, 2).map((area) => (
                            <span
                              key={area}
                              className="bg-[#2C337A] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full leading-none"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/firms"
              className="btn-primary mt-6 w-full justify-center inline-flex"
            >
              Alle werkgevers
            </Link>
          </div>

          {/* ── Desktop: existing grid ── */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredFirms.map((firm) => (
              <Link
                key={firm.id}
                href={`/firms/${firm.slug}`}
                className="group rounded-[16px] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(88,125,254,0.12)]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
                  backgroundColor: "#F5F7FF",
                }}
              >
                <div className="w-14 h-14 rounded-[10px] bg-white border border-[#E2E5F0] flex items-center justify-center mb-5 overflow-hidden p-2">
                  {firm.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firm.logo_url} alt={firm.name} className="w-full h-full object-contain" />
                  ) : (
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#2C337A" }}>
                      {firm.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <h3
                  className="group-hover:text-[#587DFE] transition-colors duration-200"
                  style={{
                    fontSize: "clamp(17px, 1.4vw, 20px)",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                    color: "#2C337A",
                  }}
                >
                  {firm.name}
                </h3>
                {firm.location && (
                  <p
                    className="flex items-center gap-1 mt-2 w-full overflow-hidden"
                    style={{ fontSize: "12px", color: "#8B91B8", letterSpacing: "-0.01em", lineHeight: 1.3 }}
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="min-w-0 truncate">
                      {firm.location}
                      {firm.team_size && (
                        <><span className="mx-1">·</span>{firm.team_size} medewerkers</>
                      )}
                    </span>
                  </p>
                )}
                {firm.practice_areas && firm.practice_areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {firm.practice_areas.slice(0, 2).map((area) => (
                      <span
                        key={area}
                        className="bg-[#2C337A] text-white text-[12px] font-semibold px-3 py-1 rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── Voor werkgevers ───────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        {/* Pure CSS mesh gradient — overlapping radial layers in soft blue/purple tones */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            backgroundColor: "#EEF1FF",
            backgroundImage: `
              radial-gradient(55% 60% at 8% 18%,
                rgba(88, 125, 254, 0.85) 0%,
                rgba(88, 125, 254, 0.35) 35%,
                rgba(88, 125, 254, 0) 70%),
              radial-gradient(50% 55% at 92% 28%,
                rgba(178, 140, 255, 0.90) 0%,
                rgba(178, 140, 255, 0.35) 40%,
                rgba(178, 140, 255, 0) 72%),
              radial-gradient(65% 60% at 50% 55%,
                rgba(120, 150, 255, 0.75) 0%,
                rgba(120, 150, 255, 0.25) 45%,
                rgba(120, 150, 255, 0) 72%),
              radial-gradient(45% 55% at 14% 88%,
                rgba(215, 168, 255, 0.85) 0%,
                rgba(215, 168, 255, 0.30) 40%,
                rgba(215, 168, 255, 0) 70%),
              radial-gradient(55% 55% at 90% 92%,
                rgba(75, 59, 214, 0.70) 0%,
                rgba(75, 59, 214, 0.25) 40%,
                rgba(75, 59, 214, 0) 72%)
            `,
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="max-w-[1400px] mx-auto relative">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-20"
          >
            {/* Left column */}
            <div className="flex flex-col">
              <h2
                style={{
                  fontSize: "clamp(36px, 4vw, 52px)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                  color: "#0A0A0A",
                }}
              >
                Bereik juridisch talent gemakkelijk online
                <span style={{ color: "#587DFE" }}>.</span>
              </h2>


              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  maxWidth: "480px",
                  marginTop: "24px",
                }}
              >
                Plaats uw werkgeversprofiel en vacatures op Legal Talents en
                ontvang sollicitaties van studenten en young professionals
                die doelgericht zoeken binnen de juridische markt.
              </p>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "#5A6094",
                  maxWidth: "480px",
                  marginTop: "12px",
                  fontWeight: 500,
                }}
              >
                Vind de beste juridische stages bij topkantoren — of bied ze aan.
              </p>

              <div className="flex flex-col gap-5 mt-8">
                {[
                  { label: "Gratis profiel", desc: "Maak direct een werkgeversprofiel aan." },
                  { label: "Onbeperkt plaatsen", desc: "Publiceer zoveel vacatures als u wilt." },
                  { label: "Direct ontvangen", desc: "Sollicitaties recht in uw inbox." },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-[#587DFE] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p style={{ fontSize: "15px", lineHeight: 1.5, color: "#5A6094" }}>
                      <span style={{ fontWeight: 600, color: "#2C337A" }}>{item.label}</span>
                      {" – "}
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/voor-werkgevers" className="btn-secondary sm:w-auto w-full">
                  Meer info
                </Link>
                <Link href="/aanmelden" className="btn-primary sm:w-auto w-full">
                  Upload vacature
                </Link>
              </div>
            </div>

            {/* Right column — image with floating pills (hidden on mobile) */}
            <div className="hidden md:block relative lg:overflow-visible overflow-hidden h-full">
              <div className="relative rounded-[16px] overflow-hidden h-full min-h-[400px]">
                <Image
                  src="/foto 4.jpg"
                  alt="Juridisch team in vergadering"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Floating pills */}
              <div
                className="absolute hidden sm:block rounded-full"
                style={{
                  top: "20%",
                  right: "-20px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: "#FFFFFF",
                  background: "#587DFE",
                  transform: "rotate(3deg)",
                  whiteSpace: "nowrap",
                }}
              >
                JURIDISCH TALENT
              </div>
              <div
                className="absolute hidden sm:block rounded-full"
                style={{
                  top: "38%",
                  right: "-30px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: "#FFFFFF",
                  background: "#3B4CA7",
                  transform: "rotate(-2deg)",
                  whiteSpace: "nowrap",
                }}
              >
                YOUNG PROFESSIONALS
              </div>
              <div
                className="absolute hidden sm:block rounded-full"
                style={{
                  top: "56%",
                  right: "-15px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: "#FFFFFF",
                  background: "#8CA6FE",
                  transform: "rotate(4deg)",
                  whiteSpace: "nowrap",
                }}
              >
                RECHTENSTUDENTEN
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kennisbank ────────────────────────────────────────── */}
      {latestBlogs.length > 0 && (
        <section
          style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-row items-end justify-between gap-6 mb-12 sm:mb-16">
              <h2
                className="leading-none m-0 p-0"
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.025em",
                  color: "#0A0A0A",
                  margin: 0,
                  padding: 0,
                }}
              >
                Artikelen<br className="md:hidden" />&amp; inzichten
                <span style={{ color: "#587DFE" }}>.</span>
              </h2>
              <Link
                href="/kennisbank"
                className="btn-primary shrink-0 -translate-y-[8px]"
              >
                Alle artikelen
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestBlogs.slice(0, 3).map((blog) => (
                <Link
                  key={blog.id}
                  href={`/kennisbank/${blog.slug}`}
                  className="group block"
                >
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    {blog.image_url ? (
                      <Image
                        src={blog.image_url}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#EEF1FF]" />
                    )}
                  </div>
                  <div className="mt-5">
                    <span
                      className="inline-block rounded-full bg-[#E9EEFF]"
                      style={{
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                        color: "#587DFE",
                      }}
                    >
                      {blogCategoryLabels[blog.category] ?? blog.category}
                    </span>
                    <h3
                      className="mt-3 line-clamp-2 group-hover:text-[#587DFE] transition-colors duration-200"
                      style={{
                        fontSize: "clamp(16px, 1.4vw, 20px)",
                        fontWeight: 600,
                        lineHeight: 1.25,
                        letterSpacing: "-0.015em",
                        color: "#2C337A",
                      }}
                    >
                      {blog.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />

      <Footer />
    </div>
  );
}
