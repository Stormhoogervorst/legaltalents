import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import VacatureCard from "@/components/VacatureCard";
import RadiusSelect from "@/components/RadiusSelect";
import { Job, JobFirmPreview, JOB_TYPE_OPTIONS } from "@/types";
import { geocodeCity } from "@/lib/geocode";

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

interface SearchParams {
  q?: string;
  locatie?: string;
  straal?: string;
  type?: string;
  rechtsgebied?: string;
}

export const revalidate = 0;

export const metadata = {
  title: "Vacatures | Legal Talents",
  description:
    "Bekijk alle juridische vacatures, stages en studentbanen bij juridische werkgevers in Nederland.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const fuzzy = (term: string) => term.trim().replace(/[\s\-]+/g, "%");

  const TYPE_ALIASES: Record<string, string[]> = {
    fulltime: ["fulltime", "full-time", "Voltijd"],
    parttime: ["parttime", "part-time", "Deeltijd"],
    "business-course": ["business-course", "lawcourse", "summer-course"],
    stage: ["stage", "internship", "student", "Studentbaan"],
  };

  const radiusKm = parseInt(params.straal ?? "0", 10) || 0;
  const useGeo = !!(params.locatie && radiusKm > 0);
  const geo = useGeo ? await geocodeCity(params.locatie!) : null;

  let jobs: Job[] | null = null;

  if (geo && useGeo) {
    const { data: geoJobs } = await supabase.rpc("get_jobs_in_radius", {
      lat: geo.lat,
      lng: geo.lng,
      radius_km: radiusKm,
      job_status: "active",
    });

    const nearbyIds = ((geoJobs ?? []) as { id: string }[]).map((j) => j.id);

    if (nearbyIds.length > 0) {
      let geoQuery = supabase
        .from("jobs")
        .select("*, firms ( name, logo_url, slug )")
        .in("id", nearbyIds);

      if (params.q) {
        const q = fuzzy(params.q);
        geoQuery = geoQuery.or(
          `title.ilike.%${q}%,practice_area.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
        );
      }
      if (params.type) {
        const aliases = TYPE_ALIASES[params.type] ?? [params.type];
        geoQuery = geoQuery.in("type", aliases);
      }
      if (params.rechtsgebied) {
        geoQuery = geoQuery.ilike("practice_area", `%${params.rechtsgebied}%`);
      }

      const { data } = await geoQuery;
      const orderedIds = nearbyIds;
      const dataMap = new Map((data ?? []).map((j) => [j.id, j]));
      jobs = orderedIds
        .map((id) => dataMap.get(id))
        .filter(Boolean) as typeof data;
    } else {
      jobs = [];
    }
  } else {
    let query = supabase
      .from("jobs")
      .select("*, firms ( name, logo_url, slug )")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (params.q) {
      const q = fuzzy(params.q);
      query = query.or(
        `title.ilike.%${q}%,practice_area.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
      );
    }
    if (params.locatie) {
      const loc = fuzzy(params.locatie);
      query = query.ilike("location", `%${loc}%`);
    }
    if (params.type) {
      const aliases = TYPE_ALIASES[params.type] ?? [params.type];
      query = query.in("type", aliases);
    }
    if (params.rechtsgebied) {
      query = query.ilike("practice_area", `%${params.rechtsgebied}%`);
    }

    const { data } = await query;
    jobs = data;
  }

  type JobWithFirm = Omit<Job, "firms"> & { firms: JobFirmPreview | null };
  const jobList = (jobs ?? []).map((j) => ({
    ...j,
    firms: Array.isArray(j.firms) ? (j.firms[0] ?? null) : (j.firms ?? null),
  })) as JobWithFirm[];

  const hasFilters = !!(
    params.q ||
    params.locatie ||
    params.type ||
    params.rechtsgebied ||
    (params.straal && params.straal !== "0")
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
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
            Alle vacatures
          </h1>
          <p
            className="mt-6 leading-relaxed max-w-[640px]"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              lineHeight: 1.65,
              color: "#6B6B6B",
            }}
          >
            Stages, studentbanen en startersfuncties bij de beste juridische
            werkgevers in Nederland.
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
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-[280px]">
              <label
                htmlFor="filter-q"
                className="sr-only"
              >
                Zoeken
              </label>
              <input
                id="filter-q"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Zoek op titel, trefwoord of locatie"
                className="w-full bg-transparent border-0 border-b border-[#CCCCCC] py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200"
              />
            </div>

            {/* Location */}
            <div className="min-w-[160px] max-w-[200px]">
              <label
                htmlFor="filter-locatie"
                className="sr-only"
              >
                Locatie
              </label>
              <input
                id="filter-locatie"
                name="locatie"
                defaultValue={params.locatie ?? ""}
                placeholder="Locatie"
                className="w-full bg-transparent border-0 border-b border-[#CCCCCC] py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200"
              />
            </div>

            {/* Radius */}
            <div className="min-w-[100px] max-w-[120px]">
              <label htmlFor="filter-straal" className="sr-only">
                Straal
              </label>
              <RadiusSelect
                name="straal"
                defaultValue={params.straal ?? "0"}
                locationInputId="filter-locatie"
                className="w-full bg-transparent border-0 border-b border-[#CCCCCC] py-3 text-[15px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200 appearance-none cursor-pointer"
              />
            </div>

            {/* Type */}
            <div className="min-w-[140px]">
              <label
                htmlFor="filter-type"
                className="sr-only"
              >
                Type
              </label>
              <select
                id="filter-type"
                name="type"
                defaultValue={params.type ?? ""}
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
              <label
                htmlFor="filter-rechtsgebied"
                className="sr-only"
              >
                Rechtsgebied
              </label>
              <select
                id="filter-rechtsgebied"
                name="rechtsgebied"
                defaultValue={params.rechtsgebied ?? ""}
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
                  href="/jobs"
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
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999]">
              {jobList.length === 0
                ? "Geen resultaten"
                : `${jobList.length} vacature${jobList.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {jobList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {jobList.map((job) => (
                <VacatureCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div
              className="pt-16 pb-8"
              style={{ maxWidth: "640px" }}
            >
              <h2
                className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A]"
                style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
              >
                {hasFilters
                  ? "Geen vacatures gevonden"
                  : "Binnenkort beschikbaar"}
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
                  : "Er zijn momenteel geen actieve vacatures. Kom binnenkort terug voor nieuwe mogelijkheden."}
              </p>
              {hasFilters && (
                <a href="/jobs" className="btn-primary mt-8">
                  Bekijk alle vacatures
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
