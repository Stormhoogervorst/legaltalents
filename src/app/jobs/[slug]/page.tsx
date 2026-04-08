import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import ApplicationForm from "@/components/ApplicationForm";
import LinkedInQuickApply from "@/components/LinkedInQuickApply";
import { Job, Firm, jobTypeLabels } from "@/types";
import { Metadata } from "next";
import { JobType } from "@/types";

export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://legaltalents.nl";

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  fulltime: "FULL_TIME",
  "full-time": "FULL_TIME",
  parttime: "PART_TIME",
  "part-time": "PART_TIME",
  stage: "INTERN",
  internship: "INTERN",
  student: "INTERN",
  "business-course": "OTHER",
  lawcourse: "OTHER",
  "summer-course": "OTHER",
};

function buildJobPostingJsonLd(
  job: { title: string; slug: string; description: string; location: string; type: JobType; created_at: string; salary_indication: string | null; hours_per_week: number | null },
  firm: { name: string; logo_url: string | null; website_url: string | null } | null,
) {
  const plainDescription = job.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: plainDescription,
    datePosted: job.created_at.split("T")[0],
    employmentType: EMPLOYMENT_TYPE_MAP[job.type] ?? "OTHER",
    url: `${BASE_URL}/jobs/${job.slug}`,
  };

  if (firm) {
    const org: Record<string, unknown> = {
      "@type": "Organization",
      name: firm.name,
    };
    if (firm.logo_url) org.logo = firm.logo_url;
    if (firm.website_url) org.sameAs = firm.website_url;
    jsonLd.hiringOrganization = org;
  }

  if (job.location) {
    jsonLd.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "NL",
      },
    };
  }

  if (job.salary_indication) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        value: job.salary_indication,
        unitText: job.hours_per_week ? "HOUR" : "MONTH",
      },
    };
  }

  return jsonLd;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("jobs")
    .select("title, description, firms(name)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return { title: "Vacature niet gevonden | Legal Talents" };

  const firmName = Array.isArray(data.firms)
    ? data.firms[0]?.name
    : (data.firms as { name: string } | null)?.name;

  const plainDescription = data.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);

  return {
    title: `${data.title}${firmName ? ` bij ${firmName}` : ""} | Legal Talents`,
    description: plainDescription,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(`
      id, title, slug, location, type, practice_area, description,
      salary_indication, start_date, required_education, hours_per_week,
      status, created_at, firm_id,
      firms (
        id, name, slug, logo_url, location, practice_areas,
        description, why_work_with_us, team_size, website_url,
        notification_email, cc_email
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!job) notFound();

  const firm = (
    Array.isArray(job.firms) ? job.firms[0] : job.firms
  ) as Firm & { notification_email: string; cc_email: string | null };

  const typedJob = job as unknown as Job;

  const postedDate = new Date(typedJob.created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const jobPostingJsonLd = buildJobPostingJsonLd(typedJob, firm);

  const metaItems: { label: string; value: string }[] = [];
  if (typedJob.location) metaItems.push({ label: "Locatie", value: typedJob.location });
  metaItems.push({ label: "Type", value: jobTypeLabels[typedJob.type] ?? typedJob.type });
  if (typedJob.practice_area) metaItems.push({ label: "Rechtsgebied", value: typedJob.practice_area });
  if (typedJob.start_date) {
    metaItems.push({
      label: "Startdatum",
      value: new Date(typedJob.start_date).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });
  }
  if (typedJob.required_education) metaItems.push({ label: "Opleiding", value: typedJob.required_education });
  if (typedJob.salary_indication) metaItems.push({ label: "Salaris", value: typedJob.salary_indication });
  if (typedJob.hours_per_week) metaItems.push({ label: "Uren per week", value: `${typedJob.hours_per_week}` });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <NavbarPublic />

      {/* Back link */}
      <div
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "32px",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-[14px] text-[#999999] hover:text-[#0A0A0A] transition-colors duration-200"
          >
            ← Alle vacatures
          </Link>
        </div>
      </div>

      {/* Hero header */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(40px, 5vh, 64px)",
          paddingBottom: "clamp(40px, 5vh, 64px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
            {/* Firm logo */}
            {firm && (
              <Link
                href={firm.slug ? `/firms/${firm.slug}` : "#"}
                className="w-16 h-16 md:w-20 md:h-20 rounded-[4px] bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden transition-opacity duration-200 hover:opacity-80"
              >
                {firm.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={firm.logo_url}
                    alt={firm.name}
                    className="w-12 h-12 md:w-14 md:h-14 object-contain"
                  />
                ) : (
                  <span className="text-[15px] font-semibold text-[#999999]">
                    {firm.name?.slice(0, 2).toUpperCase() ?? "??"}
                  </span>
                )}
              </Link>
            )}

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h1
                className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A]"
                style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
              >
                {typedJob.title}
              </h1>

              {/* Firm name + date */}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                {firm?.name && (
                  <Link
                    href={firm.slug ? `/firms/${firm.slug}` : "#"}
                    className="text-[15px] font-medium text-[#0A0A0A] border-b border-[#E5E5E5] hover:border-[#587DFE] transition-colors duration-200 pb-0.5"
                  >
                    {firm.name}
                  </Link>
                )}
                <span className="text-[14px] text-[#999999]">
                  Geplaatst {postedDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content: asymmetric split */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingBottom: "clamp(80px, 10vh, 160px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="border-t border-[#E5E5E5]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-16 pt-16">
            {/* Left column: details (8/12 ~ 65%) */}
            <div className="lg:col-span-8">
              {/* Meta information */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6 mb-16">
                {metaItems.map((item) => (
                  <div key={item.label}>
                    <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-1.5">
                      {item.label}
                    </p>
                    <p className="text-[15px] font-medium text-[#0A0A0A]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {typedJob.description && (
                <div className="mb-16">
                  <h2
                    className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A] mb-8"
                    style={{ fontSize: "clamp(24px, 2.5vw, 36px)" }}
                  >
                    Over de functie
                  </h2>
                  <div
                    className="max-w-[640px] text-[#6B6B6B] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-[#0A0A0A] [&_h3]:font-bold [&_h3]:text-[#0A0A0A] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg [&_h2]:font-bold [&_h2]:text-[#0A0A0A] [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_a]:text-[#587DFE] [&_a]:border-b [&_a]:border-[#587DFE] [&_a]:hover:opacity-80"
                    style={{
                      fontSize: "clamp(15px, 1.1vw, 17px)",
                      lineHeight: 1.65,
                    }}
                    dangerouslySetInnerHTML={{ __html: typedJob.description }}
                  />
                </div>
              )}

              {/* LinkedIn quick apply */}
              <div className="mb-16">
                <div className="border-t border-[#E5E5E5] pt-12">
                  <p
                    className="max-w-[640px] mb-6"
                    style={{
                      fontSize: "clamp(15px, 1.1vw, 17px)",
                      lineHeight: 1.65,
                      color: "#6B6B6B",
                    }}
                  >
                    Solliciteer in één klik via LinkedIn, of vul het volledige formulier hieronder in.
                  </p>
                  <LinkedInQuickApply
                    jobId={typedJob.id}
                    jobSlug={typedJob.slug}
                  />
                </div>
              </div>

              {/* Application form */}
              <section id="solliciteren">
                <div className="border-t border-[#E5E5E5] pt-12">
                  <h2
                    className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A] mb-8"
                    style={{ fontSize: "clamp(24px, 2.5vw, 36px)" }}
                  >
                    Solliciteer direct
                  </h2>
                  <ApplicationForm
                    jobId={typedJob.id}
                    jobTitle={typedJob.title}
                    firmName={firm?.name ?? ""}
                  />
                </div>
              </section>
            </div>

            {/* Right column: firm sidebar (4/12 ~ 35%) */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                {firm && (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-[4px] bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden">
                        {firm.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firm.logo_url}
                            alt={firm.name}
                            className="w-9 h-9 object-contain"
                          />
                        ) : (
                          <span className="text-[12px] font-semibold text-[#999999]">
                            {firm.name?.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[#0A0A0A]">
                          {firm.name}
                        </p>
                        {firm.location && (
                          <p className="text-[13px] text-[#999999] mt-0.5">
                            {firm.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {firm.description && (
                      <p
                        className="text-[#6B6B6B] mb-6"
                        style={{
                          fontSize: "clamp(14px, 1vw, 15px)",
                          lineHeight: 1.65,
                        }}
                      >
                        {firm.description.length > 200
                          ? `${firm.description.substring(0, 200)}…`
                          : firm.description}
                      </p>
                    )}

                    {firm.practice_areas && firm.practice_areas.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-2">
                          Rechtsgebieden
                        </p>
                        <p className="text-[14px] text-[#6B6B6B] leading-relaxed">
                          {firm.practice_areas.join(" · ")}
                        </p>
                      </div>
                    )}

                    {firm.team_size && (
                      <div className="mb-6">
                        <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-2">
                          Teamgrootte
                        </p>
                        <p className="text-[14px] text-[#6B6B6B]">{firm.team_size}</p>
                      </div>
                    )}

                    <div className="border-t border-[#E5E5E5] pt-5 mt-2 flex flex-col gap-3">
                      {firm.slug && (
                        <Link
                          href={`/firms/${firm.slug}`}
                          className="btn-primary w-full"
                        >
                          Bekijk werkgeversprofiel
                        </Link>
                      )}
                      {firm.website_url && (
                        <a
                          href={firm.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full"
                        >
                          Website
                          <ExternalLink className="ml-2 w-4 h-4 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
