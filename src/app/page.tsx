import Link from "next/link";
import { Search, MapPin, Building2, Briefcase, CheckCircle, ArrowRight, ChevronRight } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";

export default function HomePage() {
  const featuredFirms = [
    {
      name: "Van der Berg Advocaten",
      location: "Amsterdam",
      practiceAreas: ["Ondernemingsrecht", "Arbeidsrecht"],
      teamSize: "11–50",
      initials: "VB",
    },
    {
      name: "De Groot & Partners",
      location: "Rotterdam",
      practiceAreas: ["Vastgoedrecht", "Familierecht"],
      teamSize: "1–10",
      initials: "DG",
    },
    {
      name: "Notariskantoor Jansen",
      location: "Utrecht",
      practiceAreas: ["Erfrecht", "Personen- en familierecht"],
      teamSize: "1–10",
      initials: "NJ",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      {/* Hero */}
      <section className="bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold italic text-white leading-tight">
            Vind jouw stage of baan in de juridische wereld.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/80 max-w-xl mx-auto">
            Ontdek stages en vacatures bij advocaten- en notariskantoren door heel Nederland.
          </p>

          {/* Search bar */}
          <form
            action="/vacancies"
            method="GET"
            className="mt-8 bg-white rounded-xl shadow-lg p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 flex-1 px-3 py-1.5 border border-gray-200 rounded-lg">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                name="q"
                type="text"
                placeholder="Wat zoek je? (functie, rechtsgebied)"
                className="w-full text-sm text-black placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-3 py-1.5 border border-gray-200 rounded-lg">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                name="locatie"
                type="text"
                placeholder="Stad of regio"
                className="w-full text-sm text-black placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shrink-0"
            >
              Zoeken
            </button>
          </form>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="flex items-center justify-center gap-3 py-4 sm:py-2 sm:px-8">
              <Building2 className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="text-lg font-bold text-black">50+</span>
                <span className="text-sm text-gray-500 ml-1.5">kantoren</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 py-4 sm:py-2 sm:px-8">
              <Briefcase className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="text-lg font-bold text-black">200+</span>
                <span className="text-sm text-gray-500 ml-1.5">vacatures</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 py-4 sm:py-2 sm:px-8">
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="text-sm font-semibold text-black">Solliciteer zonder account</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured firms */}
      <section className="bg-gray-50 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-black">Uitgelichte kantoren</h2>
            <Link href="/firms" className="text-primary hover:underline text-sm font-semibold flex items-center gap-1">
              Bekijk alle kantoren <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredFirms.map((firm) => (
              <div
                key={firm.name}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary transition-all cursor-pointer"
              >
                {/* Firm logo placeholder */}
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                  <span className="text-primary font-bold text-sm">{firm.initials}</span>
                </div>

                <h3 className="text-lg font-semibold text-black mb-1">{firm.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {firm.location} · {firm.teamSize} medewerkers
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {firm.practiceAreas.map((area) => (
                    <span
                      key={area}
                      className="bg-primary-light text-primary text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for firms */}
      <section className="bg-white py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-primary-light rounded-2xl px-8 py-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-3">
              Plaats je kantoor op Legal Talents
            </h2>
            <p className="text-base text-gray-600 max-w-md mx-auto mb-7">
              Bereik honderden juridische studenten en young professionals. Gratis profiel, eenvoudig vacatures plaatsen.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Kantoor aanmelden
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-extrabold italic text-primary text-xl">Legal Talents.</span>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Legal Talents VOF. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  );
}
