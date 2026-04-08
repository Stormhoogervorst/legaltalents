import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import FirmCard from "@/components/FirmCard";
import Link from "next/link";
import { Firm } from "@/types";

export const revalidate = 0;

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
  locatie?: string;
  rechtsgebied?: string;
}

export const metadata = {
  title: "Werkgevers | Legal Talents",
  description:
    "Bekijk alle juridische werkgevers die actief vacatures plaatsen op Legal Talents.",
};

export default async function FirmsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: firms } = await supabase
    .from("firms")
    .select(
      "id, name, slug, location, practice_areas, logo_url, team_size, is_published"
    )
    .eq("is_published", true)
    .order("name", { ascending: true });

  let firmList = (firms ?? []) as Firm[];

  if (params.locatie) {
    const loc = params.locatie.toLowerCase();
    firmList = firmList.filter((f) =>
      f.location?.toLowerCase().includes(loc)
    );
  }
  if (params.rechtsgebied) {
    const area = params.rechtsgebied.toLowerCase();
    firmList = firmList.filter((f) =>
      f.practice_areas?.some((a) => a.toLowerCase().includes(area))
    );
  }

  const hasFilters = !!(params.locatie || params.rechtsgebied);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      {/* Hero */}
      <section
        style={{
          paddingTop: "clamp(80px, 10vh, 140px)",
          paddingBottom: "clamp(60px, 8vh, 100px)",
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#587DFE] mb-6" />
          <h1
            className="font-bold tracking-[-0.03em] leading-[1.05] text-[#0A0A0A]"
            style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
          >
            Juridische werkgevers
          </h1>
          <p
            className="mt-6 leading-relaxed"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              lineHeight: 1.65,
              color: "#6B6B6B",
              maxWidth: "640px",
            }}
          >
            Ontdek de kantoren en organisaties die actief zoeken naar juridisch
            talent. Vind een werkgever die bij je past.
          </p>
        </div>
      </section>

      {/* Filters + Results */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingBottom: "clamp(100px, 12vh, 180px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Filter bar */}
          <form method="GET" className="border-b border-[#E5E5E5] pb-8 mb-2">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-end">
              <div className="flex-1 max-w-[280px]">
                <label
                  htmlFor="locatie"
                  className="sr-only"
                >
                  Locatie
                </label>
                <input
                  id="locatie"
                  name="locatie"
                  defaultValue={params.locatie ?? ""}
                  placeholder="Locatie"
                  className="w-full bg-transparent border-0 border-b border-[#CCCCCC] px-0 py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-300"
                />
              </div>

              <div className="flex-1 max-w-[280px]">
                <label
                  htmlFor="rechtsgebied"
                  className="sr-only"
                >
                  Rechtsgebied
                </label>
                <select
                  id="rechtsgebied"
                  name="rechtsgebied"
                  defaultValue={params.rechtsgebied ?? ""}
                  className="w-full bg-transparent border-0 border-b border-[#CCCCCC] px-0 py-3 text-[15px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-300 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0 center",
                  }}
                >
                  <option value="">Alle rechtsgebieden</option>
                  {PRACTICE_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-6">
                <button type="submit" className="btn-primary">
                  Toepassen
                </button>
                {hasFilters && (
                  <Link
                    href="/firms"
                    className="text-[15px] font-medium border-b border-transparent hover:border-[#E5E5E5] pb-1 transition-colors duration-200"
                    style={{ color: "#999999" }}
                  >
                    Wissen
                  </Link>
                )}
              </div>
            </div>
          </form>

          {/* Result count */}
          <div className="pt-6 pb-2">
            <p
              className="text-[13px] font-medium tracking-wide"
              style={{ color: "#999999" }}
            >
              {firmList.length === 0
                ? "Geen werkgevers gevonden"
                : `${firmList.length} werkgever${firmList.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Firm list */}
          {firmList.length > 0 ? (
            <div>
              {firmList.map((firm) => (
                <FirmCard key={firm.id} firm={firm} />
              ))}
            </div>
          ) : (
            <div
              className="py-20 text-center"
              style={{ borderTop: "1px solid #E5E5E5" }}
            >
              <h3
                className="font-semibold mb-3"
                style={{
                  fontSize: "clamp(18px, 1.5vw, 22px)",
                  letterSpacing: "-0.01em",
                  color: "#0A0A0A",
                }}
              >
                Geen werkgevers gevonden
              </h3>
              <p
                className="leading-relaxed max-w-md mx-auto"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  color: "#6B6B6B",
                }}
              >
                {hasFilters
                  ? "Probeer andere filters of verwijder de huidige selectie."
                  : "Er zijn momenteel geen gepubliceerde werkgevers. Kom later terug."}
              </p>
              {hasFilters && (
                <Link href="/firms" className="btn-primary mt-8">
                  Alle werkgevers bekijken
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
