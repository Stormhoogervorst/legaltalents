import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Job, JobFirmPreview, JOB_TYPE_OPTIONS } from "@/types";
import { CITIES, cityDisplayName, cityLocationFilter, isValidCity } from "@/lib/cities";

export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://legaltalents.nl";

const PRACTICE_AREAS = [
  "Arbeidsrecht",
  "Bestuursrecht",
  "Erfrecht",
  "Familierecht",
  "Intellectueel eigendom",
  "IT-recht",
  "Ondernemingsrecht",
  "Onroerend goed",
  "Personen- en familierecht",
  "Strafrecht",
  "Vastgoedrecht",
  "Verbintenissenrecht",
  "Overig",
];

const TYPE_ALIASES: Record<string, string[]> = {
  fulltime: ["fulltime", "full-time", "Voltijd"],
  parttime: ["parttime", "part-time", "Deeltijd"],
  "business-course": ["business-course", "lawcourse", "summer-course"],
  stage: ["stage", "internship", "student", "Studentbaan"],
};

export async function generateStaticParams() {
  return CITIES.map((city) => ({ id: city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: city } = await params;
  const name = cityDisplayName(city);
  return {
    title: `Juridische Vacatures ${name} | Legal Talents`,
    description: `Bekijk alle actuele juridische vacatures in ${name}. Vind je nieuwe uitdaging bij topwerkgevers in de juridische sector.`,
    keywords: ["juridische vacatures", "vacatures", name, `juridische vacatures ${name}`, `vacatures ${name}`, "advocatuur", `advocatuur ${name}`, "Legal Talents"],
  };
}

interface SearchParams {
  type?: string;
  rechtsgebied?: string;
}

export default async function CityJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id: city } = await params;
  if (!isValidCity(city)) notFound();

  const name = cityDisplayName(city);
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select(
      `
      id, firm_id, title, slug, location, type, practice_area,
      salary_indication, start_date, required_education,
      hours_per_week, status, created_at,
      firms ( name, logo_url, slug )
    `
    )
    .eq("status", "active")
    .ilike("location", cityLocationFilter(city))
    .order("created_at", { ascending: false });

  if (sp.type) {
    const aliases = TYPE_ALIASES[sp.type] ?? [sp.type];
    query = query.in("type", aliases);
  }
  if (sp.rechtsgebied) {
    query = query.ilike("practice_area", `%${sp.rechtsgebied}%`);
  }

  const { data: jobs } = await query;

  type JobWithFirm = Omit<Job, "firms"> & { firms: JobFirmPreview | null };
  const jobList = (jobs ?? []).map((j) => ({
    ...j,
    firms: Array.isArray(j.firms) ? (j.firms[0] ?? null) : (j.firms ?? null),
  })) as JobWithFirm[];

  const hasFilters = !!(sp.type || sp.rechtsgebied);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Juridische Vacatures ${name}`,
    numberOfItems: jobList.length,
    itemListElement: jobList.map((job, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: job.title,
      url: `${BASE_URL}/jobs/${job.slug}`,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavbarPublic />

      {/* Hero */}
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
            style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
          >
            Juridische Vacatures {name}
          </h1>
          <p
            className="mt-6 leading-relaxed max-w-[640px]"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              lineHeight: 1.65,
              color: "#6B6B6B",
            }}
          >
            Ontdek alle actuele juridische mogelijkheden bij juridische werkgevers
            in {name}.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section
        className="border-b border-[#E5E5E5]"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <form
            method="GET"
            className="flex flex-wrap items-end gap-x-8 gap-y-5 py-8"
          >
            {/* Type */}
            <div className="min-w-[140px]">
              <label htmlFor="filter-type" className="sr-only">
                Type
              </label>
              <select
                id="filter-type"
                name="type"
                defaultValue={sp.type ?? ""}
                className="w-full bg-transparent border-0 border-b border-[#CCCCCC] py-3 text-[15px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200 appearance-none cursor-pointer"
              >
                <option value="">Alle types</option>
                {JOB_TYPE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Practice area */}
            <div className="min-w-[180px]">
              <label htmlFor="filter-rechtsgebied" className="sr-only">
                Rechtsgebied
              </label>
              <select
                id="filter-rechtsgebied"
                name="rechtsgebied"
                defaultValue={sp.rechtsgebied ?? ""}
                className="w-full bg-transparent border-0 border-b border-[#CCCCCC] py-3 text-[15px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200 appearance-none cursor-pointer"
              >
                <option value="">Alle rechtsgebieden</option>
                {PRACTICE_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pb-1">
              <button type="submit" className="btn-primary">
                Toepassen
              </button>
              {hasFilters && (
                <a
                  href={`/vacatures/${city}`}
                  className="text-[14px] text-[#999999] hover:text-[#0A0A0A] transition-colors duration-200 border-b border-transparent hover:border-[#E5E5E5] pb-1"
                >
                  Wissen
                </a>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(40px, 5vh, 64px)",
          paddingBottom: "clamp(60px, 8vh, 100px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999]">
              {jobList.length === 0
                ? `Geen vacatures in ${name}`
                : `${jobList.length} vacature${jobList.length !== 1 ? "s" : ""} in ${name}`}
            </p>
          </div>

          {jobList.length > 0 ? (
            <div className="border-t border-[#E5E5E5]">
              {jobList.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div
              className="border-t border-[#E5E5E5] pt-16 pb-8"
              style={{ maxWidth: "640px" }}
            >
              <h2
                className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A]"
                style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
              >
                {hasFilters
                  ? "Geen vacatures gevonden"
                  : `Binnenkort in ${name}`}
              </h2>
              <p
                className="mt-6 leading-relaxed"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#6B6B6B",
                }}
              >
                {hasFilters
                  ? "Probeer andere filters of verwijder de huidige selectie om meer resultaten te zien."
                  : `Momenteel zijn er geen vacatures in ${name}. Bekijk alle landelijke vacatures of kom binnenkort terug.`}
              </p>
              <div className="flex flex-wrap items-center gap-6 mt-8">
                <Link href="/jobs" className="btn-primary">
                  Bekijk alle vacatures
                </Link>
                {hasFilters && (
                  <a
                    href={`/vacatures/${city}`}
                    className="text-[14px] text-[#999999] hover:text-[#0A0A0A] transition-colors duration-200"
                  >
                    Filters wissen
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
