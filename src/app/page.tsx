import Link from "next/link";
import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import VacatureCarousel from "@/components/VacatureCarousel";
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
    .select(`
      id, firm_id, title, slug, location, type, practice_area,
      salary_indication, hours_per_week, status, created_at,
      firms ( name, logo_url, slug )
    `)
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
      <NavbarPublic />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="bg-white relative overflow-visible pb-10 md:pb-20">
        <div
          className="max-w-[1400px] mx-auto"
          style={{ padding: "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 80px) 0" }}
        >
          {/* Badge */}
          <span
            className="inline-flex items-center gap-2 rounded-full bg-[#E9EEFF]"
            style={{
              padding: "7px 16px",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: "#587DFE",
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#587DFE] opacity-80" />
            #1 Juridisch Carrièreplatform
          </span>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(44px, 5.2vw, 72px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#0A0A0A",
              marginTop: "24px",
              maxWidth: "960px",
            }}
          >
            Vind jouw{" "}
            <span style={{ color: "#587DFE", whiteSpace: "nowrap" }}>stage of baan</span>
            <br />
            in de juridische wereld
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              lineHeight: 1.65,
              color: "#5A6094",
              maxWidth: "520px",
              marginTop: "24px",
            }}
          >
            Ontdek stages en vacatures bij de beste juridische werkgevers van
            Nederland. Het platform voor studenten en young professionals.
          </p>

          {/* Composite pill search bar */}
          <form
            action="/jobs"
            method="GET"
            className="mt-8"
            style={{ maxWidth: "580px" }}
          >
            <div
              className="flex items-center bg-[#EEF1FF] rounded-full"
              style={{
                padding: "6px 6px 6px 22px",
              }}
            >
              <Search
                className="h-[18px] w-[18px] shrink-0"
                style={{ color: "#8B91B8" }}
              />
              <input
                name="q"
                type="text"
                placeholder="Functie of rechtsgebied..."
                className="flex-1 min-w-0 bg-transparent border-none outline-none focus:outline-none"
                style={{
                  padding: "10px 14px",
                  fontSize: "15px",
                  color: "#2C337A",
                }}
              />
              <button
                type="submit"
                className="shrink-0 rounded-full inline-flex items-center justify-center font-semibold text-white transition-all duration-200 hover:bg-[#4A6CE6] hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#587DFE]/40 focus:ring-offset-2"
                style={{
                  padding: "12px 26px",
                  fontSize: "14px",
                  background: "#587DFE",
                  whiteSpace: "nowrap",
                }}
              >
                Zoeken
              </button>
            </div>
          </form>

        </div>

        {/* Image strip */}
        <div className="mt-12 sm:mt-16 w-full overflow-x-hidden relative z-10">
          <div className="flex items-end justify-center gap-3 md:gap-5 -mx-8">
            <div className="shrink-0 hidden lg:block w-[160px] h-[160px] rounded-full bg-[#BDD0FF]" />
            <div className="shrink-0 w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] rounded-full overflow-hidden relative">
              <Image src="/foto 1.jpg" alt="" fill className="object-cover" sizes="140px" />
            </div>
            <div className="shrink-0 w-[80px] h-[140px] sm:w-[100px] sm:h-[180px] rounded-full overflow-hidden relative">
              <Image src="/foto 4.jpg" alt="" fill className="object-cover" sizes="100px" />
            </div>
            <div className="shrink-0 hidden md:block w-[80px] h-[80px] rounded-full bg-[#587DFE]" />
            <div className="shrink-0 w-[130px] h-[130px] sm:w-[170px] sm:h-[170px] rounded-full overflow-hidden relative">
              <Image src="/foto 2.jpg" alt="" fill className="object-cover" sizes="170px" priority />
            </div>
            <div className="shrink-0 hidden md:flex w-[70px] h-[150px] sm:w-[90px] sm:h-[180px] rounded-full overflow-hidden bg-[#587DFE] items-end justify-center">
              <div className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-full bg-[#8CA6FE]" />
            </div>
            <div className="shrink-0 w-[80px] h-[140px] sm:w-[100px] sm:h-[180px] rounded-full overflow-hidden relative">
              <Image src="/foto 5.jpg" alt="" fill className="object-cover" sizes="100px" />
            </div>
            <div className="shrink-0 w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] rounded-full overflow-hidden relative">
              <Image src="/foto-3.jpg" alt="" fill className="object-cover" sizes="140px" />
            </div>
            <div className="shrink-0 hidden lg:block w-[160px] h-[160px] rounded-full bg-[#8CA6FE]" />
          </div>
        </div>
      </section>

      {/* ── Top vacatures carrousel ───────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-12 sm:mb-16">
            <h2
              style={{
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              De nieuwste juridische vacatures
              <span style={{ color: "#587DFE" }}>.</span>
            </h2>
            <Link href="/jobs" className="btn-primary shrink-0">
              Alle vacatures
            </Link>
          </div>

          {allJobs.length > 0 ? (
            <VacatureCarousel jobs={allJobs} />
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
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-12 sm:mb-16">
            <h2
              style={{
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              Uitgelichte werkgevers
              <span style={{ color: "#587DFE" }}>.</span>
            </h2>
            <Link href="/firms" className="btn-primary shrink-0">
              Alle werkgevers
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredFirms.map((firm) => (
              <Link
                key={firm.id}
                href={`/firms/${firm.slug}`}
                className="group bg-[#F5F7FF] rounded-[8px] p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-[8px] bg-white border border-[#E2E5F0] flex items-center justify-center mb-5 overflow-hidden p-2">
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
                        className="bg-[#668dff] text-white text-[12px] font-semibold px-3 py-1 rounded-full"
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
        className="bg-[#F5F7FF]"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
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

            {/* Right column — image with floating pills */}
            <div className="relative lg:overflow-visible overflow-hidden h-full">
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
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-12 sm:mb-16">
              <h2
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: "#0A0A0A",
                }}
              >
                Artikelen &amp; inzichten
                <span style={{ color: "#587DFE" }}>.</span>
              </h2>
              <Link href="/kennisbank" className="btn-primary shrink-0">
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
