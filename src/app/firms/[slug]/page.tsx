import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import JobCard from "@/components/JobCard";
import { Firm, Job, JobFirmPreview } from "@/types";
import { Metadata } from "next";

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: firm } = await supabase
    .from("firms")
    .select("name, location, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!firm) return { title: "Werkgever niet gevonden | Legal Talents" };

  return {
    title: `${firm.name} | Legal Talents`,
    description:
      firm.description?.substring(0, 160) ??
      `Bekijk het profiel van ${firm.name} op Legal Talents.`,
  };
}

export default async function FirmPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: firm } = await supabase
    .from("firms")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!firm) notFound();

  const firmData = firm as Firm;

  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id, firm_id, title, slug, location, type, practice_area, hours_per_week, status, created_at"
    )
    .eq("firm_id", firmData.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const firmPreview: JobFirmPreview = {
    name: firmData.name,
    logo_url: firmData.logo_url,
    slug: firmData.slug,
  };

  const jobList = (jobs ?? []) as Job[];
  const initials = firmData.name.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      {/* Back link */}
      <div
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "40px",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <Link
            href="/firms"
            className="inline-flex items-center gap-1 text-[13px] font-medium tracking-wide transition-colors duration-200 hover:opacity-70"
            style={{ color: "#999999" }}
          >
            ← Alle werkgevers
          </Link>
        </div>
      </div>

      {/* Firm header — split layout */}
      <section
        style={{
          paddingTop: "clamp(40px, 5vh, 60px)",
          paddingBottom: "clamp(60px, 8vh, 100px)",
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left column — firm identity */}
            <div className="lg:col-span-5">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-[4px] bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden">
                  {firmData.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={firmData.logo_url}
                      alt={firmData.name}
                      className="w-full h-full object-contain p-2.5"
                    />
                  ) : (
                    <span
                      className="font-bold text-xl"
                      style={{ color: "#587DFE" }}
                    >
                      {initials}
                    </span>
                  )}
                </div>

                <div className="flex items-center h-16">
                  <h1
                    className="font-bold"
                    style={{
                      fontSize: "clamp(28px, 3vw, 40px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.025em",
                      color: "#0A0A0A",
                    }}
                  >
                    {firmData.name}
                  </h1>
                </div>
              </div>

              {/* Meta info */}
              <div className="space-y-4 mt-8">
                {firmData.location && (
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <p
                      className="text-[13px] font-medium uppercase tracking-[0.02em] mb-1"
                      style={{ color: "#999999" }}
                    >
                      Locatie
                    </p>
                    <p
                      className="text-[15px]"
                      style={{ color: "#0A0A0A" }}
                    >
                      {firmData.location}
                    </p>
                  </div>
                )}

                {firmData.team_size && (
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <p
                      className="text-[13px] font-medium uppercase tracking-[0.02em] mb-1"
                      style={{ color: "#999999" }}
                    >
                      Teamgrootte
                    </p>
                    <p
                      className="text-[15px]"
                      style={{ color: "#0A0A0A" }}
                    >
                      {firmData.team_size} medewerkers
                    </p>
                  </div>
                )}

                {firmData.salary_indication && (
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <p
                      className="text-[13px] font-medium uppercase tracking-[0.02em] mb-1"
                      style={{ color: "#999999" }}
                    >
                      Salarisindicatie
                    </p>
                    <p
                      className="text-[15px]"
                      style={{ color: "#0A0A0A" }}
                    >
                      {firmData.salary_indication}
                    </p>
                  </div>
                )}

                {firmData.practice_areas && firmData.practice_areas.length > 0 && (
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <p
                      className="text-[13px] font-medium uppercase tracking-[0.02em] mb-1"
                      style={{ color: "#999999" }}
                    >
                      Rechtsgebieden
                    </p>
                    <p
                      className="text-[15px] leading-relaxed"
                      style={{ color: "#0A0A0A" }}
                    >
                      {firmData.practice_areas.join(", ")}
                    </p>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-6 pt-2">
                  {firmData.website_url && (
                    <a
                      href={firmData.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      Website
                    </a>
                  )}
                  {firmData.linkedin_url && (
                    <a
                      href={firmData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right column — about / description */}
            <div className="lg:col-span-7">
              {firmData.description && (
                <div className="mb-16">
                  <h2
                    className="font-bold mb-6"
                    style={{
                      fontSize: "clamp(24px, 2.5vw, 36px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                      color: "#0A0A0A",
                    }}
                  >
                    Over {firmData.name}
                  </h2>
                  <p
                    className="leading-relaxed whitespace-pre-line"
                    style={{
                      fontSize: "clamp(15px, 1.1vw, 17px)",
                      lineHeight: 1.65,
                      color: "#6B6B6B",
                      maxWidth: "640px",
                    }}
                  >
                    {firmData.description}
                  </p>
                </div>
              )}

              {firmData.why_work_with_us && (
                <div>
                  <h2
                    className="font-bold mb-6"
                    style={{
                      fontSize: "clamp(24px, 2.5vw, 36px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                      color: "#0A0A0A",
                    }}
                  >
                    Waarom hier werken
                  </h2>
                  <p
                    className="leading-relaxed whitespace-pre-line"
                    style={{
                      fontSize: "clamp(15px, 1.1vw, 17px)",
                      lineHeight: 1.65,
                      color: "#6B6B6B",
                      maxWidth: "640px",
                    }}
                  >
                    {firmData.why_work_with_us}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Vacancies section */}
      <section
        style={{
          paddingTop: "clamp(60px, 8vh, 100px)",
          paddingBottom: "clamp(100px, 12vh, 180px)",
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          borderTop: "1px solid #E5E5E5",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <h2
            className="font-bold"
            style={{
              fontSize: "clamp(36px, 4.5vw, 64px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#0A0A0A",
            }}
          >
            Openstaande vacatures
            {jobList.length > 0 && (
              <span
                className="ml-3 font-normal"
                style={{
                  fontSize: "clamp(18px, 1.5vw, 22px)",
                  color: "#999999",
                }}
              >
                ({jobList.length})
              </span>
            )}
          </h2>

          {jobList.length > 0 ? (
            <div className="mt-10 space-y-4">
              {jobList.map((job) => (
                <JobCard
                  key={job.id}
                  job={{ ...job, firms: firmPreview }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 pt-10 border-t border-[#E5E5E5]">
              <p
                className="leading-relaxed"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#6B6B6B",
                  maxWidth: "640px",
                }}
              >
                Momenteel geen openstaande vacatures bij {firmData.name}.
                Bekijk onze andere werkgevers of kom later terug.
              </p>
              <Link href="/firms" className="btn-primary mt-8">
                Alle werkgevers bekijken
              </Link>
            </div>
          )}
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
