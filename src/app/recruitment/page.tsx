import Link from "next/link";
import Image from "next/image";
import { Linkedin } from "lucide-react";
import type { Metadata } from "next";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import FadeIn from "./FadeIn";
import RecruitmentContactForm from "./RecruitmentContactForm";

// ────────────────────────────────────────────────────────────────────────────
// Kleurenpalet — strikt deze 4 kleuren op de hele pagina.
// Pas hier aan om beide blauwtinten in één keer door te trekken.
// ────────────────────────────────────────────────────────────────────────────
const PRIMARY_BLUE = "#0A2540"; // {{primair-blauw-hex}}  — diep, professioneel blauw (CTA's, primaire links, focus)
const SECONDARY_BLUE = "#3B82F6"; // {{secundair-blauw-hex}} — helderder accent (iconen, stapnummers, hover, bullets)

export const metadata: Metadata = {
  title: "Juridische Recruitment | No Cure No Pay | Legal Talents",
  description:
    "Persoonlijke juridische recruitment, duurzame matches en no-cure-no-pay. Plan een kennismaking met Legal Talents.",
  alternates: {
    canonical: "/recruitment",
  },
  openGraph: {
    title: "Juridische Recruitment | No Cure No Pay | Legal Talents",
    description:
      "Recruitment voor de juridische sector, zoals het hoort. Persoonlijk, kwalitatief en op no-cure-no-pay basis.",
    url: "/recruitment",
    type: "website",
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Content
// ────────────────────────────────────────────────────────────────────────────

const DIFFERENTIATORS: Array<{ title: string; body: string }> = [
  {
    title: "Eén aanspreekpunt",
    body: "Je wordt nooit doorgeschoven — de persoon die je spreekt, voert zelf de search uit.",
  },
  {
    title: "Juridische én recruitment-ervaring",
    body: "Wij begrijpen rechtsgebieden, kantoorculturen en wat een kandidaat over drie jaar nog tevreden houdt.",
  },
  {
    title: "Pas voorstellen als wij overtuigd zijn",
    body: "Geen CV-bombardement, alleen kandidaten die wij zelf hebben gesproken en waar wij achter staan.",
  },
];

const TARGET_CLIENTS: string[] = [
  "Advocatenkantoren — van boutique tot top",
  "Juridische afdelingen (in-house legal)",
  "Notariskantoren",
  "Compliance & legal operations",
];

const PROCESS_STEPS: Array<{ title: string; body: string }> = [
  {
    title: "Intake",
    body: "Bij voorkeur op locatie, om jullie cultuur te leren kennen.",
  },
  {
    title: "Search",
    body: "Gericht via ons netwerk en actieve, persoonlijke search.",
  },
  {
    title: "Voorstellen",
    body: "Alleen kandidaten die wij zelf hebben gesproken.",
  },
  {
    title: "Begeleiding",
    body: "Tot en met de eerste werkdag — en daarna.",
  },
];

const TEAM_MEMBERS: Array<{
  name: string;
  role: string;
  credentials: string;
  bio: string;
  photo: string;
  linkedin: string;
}> = [
  {
    name: "Max Endrizzi",
    role: "Oprichter & Eigenaar",
    credentials: "LLM International and European Business Law",
    bio: "Max richtte Legal Talents op met één overtuiging: recruitment in de juridische sector kan scherper. Minder schuiven met CV's, meer focus op matches die ook over drie jaar nog kloppen. Die overtuiging is nog steeds de basis van hoe wij werken.",
    photo: "/max-v2.png",
    linkedin: "https://www.linkedin.com/in/max-endrizzi-135610305/",
  },
  {
    name: "Storm Hoogervorst",
    role: "Eigenaar",
    credentials: "LLB European Law School, BBA Business Economics",
    bio: "Storm bouwde eerst ervaring op in recruitment en richtte daarna samen met Max Legal Talents op. Hij is constant bezig met nieuwe ontwikkeling binnen AI en recruitment, waardoor wij met slim ingerichte processen nog meer tijd hebben voor wat belangrijk is: in gesprek gaan met mensen.",
    photo: "/storm-v2.jpg",
    linkedin: "https://www.linkedin.com/in/storm-hoogervorst-a35066290/",
  },
  {
    name: "Justin Bigler",
    role: "Strategic Business Partner",
    credentials: "LLM Ondernemingsrecht",
    bio: "Justin koos na zijn master Ondernemingsrecht bewust niet voor de advocatuur maar voor het bedrijfsleven. Eerst als Head of Sales and Strategy, nu bij Legal Talents waar hij de sales- en recruitmentstrategie verder uitbouwt.",
    photo: "/justin-v2.jpg",
    linkedin: "https://www.linkedin.com/in/justin-bigler-0322071b4/",
  },
  {
    name: "Frits Haringa",
    role: "Senior Legal Recruiter",
    credentials:
      "25+ jaar ervaring als Senior Recruiter, HR Manager en Recruitment Director",
    bio: "Frits weet als geen ander hoe je iemand écht aan de juiste baan helpt. Met 25 jaar ervaring als HR-manager en senior recruiter is hij de persoon die je wilt spreken als je een volgende stap zoekt in de juridische sector.",
    photo: "/frits-v2.jpg",
    linkedin: "https://www.linkedin.com/in/fritsharinga/",
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Wat kost het om met Legal Talents te werken?",
    a: "We werken op no-cure-no-pay basis. Je betaalt een vooraf afgesproken percentage van het bruto jaarsalaris, pas op de dag dat de kandidaat bij je start.",
  },
  {
    q: "Werken jullie exclusief of mag ik ook andere bureaus inschakelen?",
    a: "Exclusiviteit is geen voorwaarde — we draaien regelmatig parallel met andere bureaus. Een exclusieve opdracht levert in de praktijk wel een diepere search en kortere doorlooptijd op.",
  },
  {
    q: "Wat is de gemiddelde doorlooptijd van een zoektocht?",
    a: "Voor courante posities: vier tot zes weken tot een eerste serieuze shortlist. Senior-, partner- en niche-profielen: doorgaans acht tot twaalf weken.",
  },
  {
    q: "Voor welke functies en rechtsgebieden werken jullie?",
    a: "Over de volle breedte van de juridische sector: van advocaat-stagiair tot partner, van legal counsel tot general counsel, en kandidaat-notaris tot notaris. Alle gangbare rechtsgebieden, plus compliance en legal operations.",
  },
  {
    q: "Is er een garantieperiode na plaatsing?",
    a: "Ja. Vertrekt de kandidaat binnen drie maanden om een reden buiten het kantoor om, dan zoeken wij kosteloos een vervanger.",
  },
  {
    q: "Hoe verschilt jullie aanpak van andere bureaus?",
    a: "Eén aanspreekpunt van intake tot start, en alleen voorstellen waar wij zelf in geloven. Onze juridische achtergrond betekent dat we vacatures op inhoud beoordelen, niet op trefwoorden.",
  },
];

// ────────────────────────────────────────────────────────────────────────────
// JSON-LD: FAQ + ProfessionalService + Person nodes (E-E-A-T signaal)
// ────────────────────────────────────────────────────────────────────────────

const ORG_URL = "https://www.legal-talents.nl";

const organizationNode = {
  "@type": "ProfessionalService",
  "@id": `${ORG_URL}/#organization`,
  name: "Legal Talents",
  alternateName: "Legal Talents — Juridische Recruitment",
  description:
    "Recruitmentbureau voor de juridische sector: advocatuur, in-house legal, notariaat en compliance. Persoonlijke aanpak, duurzame matches, no cure no pay.",
  url: `${ORG_URL}/recruitment`,
  telephone: "+31685680998",
  email: "storm@legal-talents.nl",
  areaServed: "NL",
  priceRange: "No cure, no pay",
  serviceType: "Juridische recruitment",
};

const faqJsonLd = {
  "@context": "https://schema.org/",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const peopleJsonLd = {
  "@context": "https://schema.org/",
  "@graph": [
    organizationNode,
    ...TEAM_MEMBERS.map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
      description: m.credentials,
      image: `${ORG_URL}${m.photo}`,
      worksFor: { "@id": `${ORG_URL}/#organization` },
    })),
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Pagina
// ────────────────────────────────────────────────────────────────────────────

export default function RecruitmentPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(peopleJsonLd) }}
      />

      <NavbarPublic variant="default" />

      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div
          className="max-w-[1400px] mx-auto"
          style={{
            padding:
              "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 80px) clamp(80px, 12vh, 160px)",
          }}
        >
          <FadeIn delay={0.1}>
            <h1
              className="font-bold text-black"
              style={{
                fontSize: "clamp(44px, 5.5vw, 76px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                maxWidth: "960px",
              }}
            >
              Legal recruitment,
              <br />
              zoals het hoort
              <span style={{ color: SECONDARY_BLUE }}>.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p
              className="text-black"
              style={{
                fontSize: "clamp(16px, 1.15vw, 18px)",
                lineHeight: 1.65,
                maxWidth: "640px",
                marginTop: "28px",
              }}
            >
              Wij gaan voor duurzame matches in de juridische sector —
              persoonlijk en op{" "}
              <span className="font-semibold">no-cure-no-pay basis</span>.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href="#contact"
                className="hero-cta-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-[14px] font-medium text-white transition-colors duration-200"
                style={{ backgroundColor: PRIMARY_BLUE }}
              >
                Plan een kennismaking
              </a>
              <a
                href="tel:+31685680998"
                className="hero-cta-secondary inline-flex items-center text-[14px] font-medium text-black"
              >
                <span className="border-b border-transparent pb-0.5 transition-colors duration-200">
                  Bel direct: +31 6 85 68 09 98
                </span>
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Scoped hover-kleuren voor hero-CTA's — geen extra Tailwind config nodig. */}
        <style>{`
          .hero-cta-primary:hover { background-color: ${SECONDARY_BLUE}; }
          .hero-cta-secondary:hover { color: ${SECONDARY_BLUE}; }
          .hero-cta-secondary:hover span { border-color: ${SECONDARY_BLUE}; }
        `}</style>
      </section>

      {/* ── 2. Waarom Legal Talents anders is ───────────────────── */}
      <section
        className="bg-white"
        style={{ padding: "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-4">
              <FadeIn delay={0.1}>
                <h2
                  className="font-bold text-black"
                  style={{
                    fontSize: "clamp(32px, 4vw, 56px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                  }}
                >
                  Onze kernpunten
                  <span style={{ color: SECONDARY_BLUE }}>.</span>
                </h2>
              </FadeIn>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-5">
              {DIFFERENTIATORS.map((item, idx) => (
                <FadeIn key={item.title} delay={0.1 + idx * 0.08}>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 flex gap-5 items-start">
                    <span
                      aria-hidden="true"
                      className="shrink-0 inline-flex items-center justify-center rounded-full text-[13px] font-semibold"
                      style={{
                        width: "40px",
                        height: "40px",
                        color: SECONDARY_BLUE,
                        border: `1px solid ${SECONDARY_BLUE}`,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3
                        className="text-black font-semibold"
                        style={{ fontSize: "18px" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-black"
                        style={{
                          fontSize: "15px",
                          lineHeight: 1.6,
                          marginTop: "8px",
                        }}
                      >
                        {item.body}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Voor wie wij werken ──────────────────────────────── */}
      <section
        className="bg-white"
        style={{ padding: "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start">
            <div className="lg:col-span-5">
              <FadeIn delay={0.1}>
                <h2
                  className="font-bold text-black"
                  style={{
                    fontSize: "clamp(32px, 4vw, 56px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                  }}
                >
                  Voor wie wij werken
                  <span style={{ color: SECONDARY_BLUE }}>.</span>
                </h2>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p
                  className="text-black"
                  style={{
                    fontSize: "clamp(15px, 1.1vw, 17px)",
                    lineHeight: 1.65,
                    marginTop: "16px",
                  }}
                >
                  Wij richten ons uitsluitend op de juridische sector.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-7">
              <ul className="flex flex-col divide-y divide-neutral-200 rounded-2xl bg-white border border-neutral-200 overflow-hidden">
                {TARGET_CLIENTS.map((client, idx) => (
                  <FadeIn key={client} delay={0.1 + idx * 0.05}>
                    <li
                      className="flex items-center gap-4 px-6 py-5 text-black font-medium"
                      style={{
                        fontSize: "clamp(15px, 1.1vw, 17px)",
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        aria-hidden
                        className="shrink-0 inline-block rounded-full"
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: SECONDARY_BLUE,
                        }}
                      />
                      {client}
                    </li>
                  </FadeIn>
                ))}
              </ul>

              <FadeIn delay={0.4}>
                <p
                  className="mt-6 text-black"
                  style={{ fontSize: "14px", lineHeight: 1.65 }}
                >
                  Zie ook ons{" "}
                  <Link
                    href="/werkgevers"
                    className="font-semibold border-b border-neutral-300 transition-colors duration-200 hover:border-current"
                    style={{ color: PRIMARY_BLUE }}
                  >
                    werkgeversnetwerk
                  </Link>{" "}
                  en de actuele{" "}
                  <Link
                    href="/vacatures"
                    className="font-semibold border-b border-neutral-300 transition-colors duration-200 hover:border-current"
                    style={{ color: PRIMARY_BLUE }}
                  >
                    juridische vacatures
                  </Link>
                  .
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Hoe wij werken ───────────────────────────────────── */}
      <section
        id="proces"
        className="bg-white scroll-mt-20"
        style={{ padding: "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl">
            <FadeIn delay={0.1}>
              <h2
                className="font-bold text-black"
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                }}
              >
                Van intake tot eerste werkdag
                <span style={{ color: SECONDARY_BLUE }}>.</span>
              </h2>
            </FadeIn>
          </div>

          <div className="mt-12 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROCESS_STEPS.map((step, idx) => (
              <FadeIn key={step.title} delay={0.1 + idx * 0.08}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7">
                  <span
                    aria-hidden="true"
                    className="block font-semibold"
                    style={{
                      fontSize: "32px",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                      color: SECONDARY_BLUE,
                      marginBottom: "16px",
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="text-black font-semibold"
                    style={{
                      fontSize: "clamp(18px, 1.5vw, 22px)",
                      lineHeight: 1.3,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="mt-2 text-black"
                    style={{
                      fontSize: "clamp(14px, 1vw, 15px)",
                      lineHeight: 1.6,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Over ons / team ──────────────────────────────────── */}
      <section
        className="bg-white"
        style={{ padding: "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl">
            <FadeIn delay={0.1}>
              <h2
                className="font-bold text-black"
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                }}
              >
                Het team achter Legal Talents
                <span style={{ color: SECONDARY_BLUE }}>.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p
                className="text-black"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  marginTop: "20px",
                }}
              >
                Wij zijn een team van bevlogen juristen, recruiters en
                ondernemers met één doel: legal recruitment persoonlijker en
                kwalitatiever maken. Niet schuiven met CV&apos;s, maar gaan
                voor duurzame matches. Ons team is bewust compact — geen
                accountmanagers, geen tussenlagen. De persoon die je spreekt,
                werkt ook daadwerkelijk aan jouw opdracht.
              </p>
            </FadeIn>
          </div>

          <div className="mt-12 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {TEAM_MEMBERS.map((member, idx) => (
              <FadeIn key={member.name} delay={0.1 + idx * 0.08}>
                <div className="h-full flex flex-col rounded-2xl bg-white border border-neutral-200 overflow-hidden">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                    <Image
                      src={member.photo}
                      alt={`${member.name} — ${member.role} bij Legal Talents`}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className="text-black font-semibold"
                          style={{
                            fontSize: "18px",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {member.name}
                        </h3>
                        <p
                          className="mt-1 text-black font-medium"
                          style={{ fontSize: "14px" }}
                        >
                          {member.role}
                        </p>
                      </div>
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn van ${member.name}`}
                        className="shrink-0 inline-flex items-center justify-center rounded-full w-9 h-9 border border-neutral-200 transition-colors duration-200 hover:bg-neutral-50"
                        style={{ color: SECONDARY_BLUE }}
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                    <p
                      className="mt-2 text-neutral-600"
                      style={{ fontSize: "12px", lineHeight: 1.5 }}
                    >
                      {member.credentials}
                    </p>
                    <p
                      className="mt-4 text-black"
                      style={{ fontSize: "14px", lineHeight: 1.6 }}
                    >
                      {member.bio}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <p
              className="mt-10 text-black"
              style={{ fontSize: "14px", lineHeight: 1.65 }}
            >
              Meer lezen over onze visie op de juridische arbeidsmarkt? Bekijk
              de{" "}
              <Link
                href="/kennisbank"
                className="font-semibold border-b border-neutral-300 transition-colors duration-200 hover:border-current"
                style={{ color: PRIMARY_BLUE }}
              >
                kennisbank
              </Link>
              .
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 6. Veelgestelde vragen ─────────────────────────────── */}
      <section
        className="bg-white"
        style={{ padding: "clamp(60px, 8vh, 120px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[880px] mx-auto">
          <FadeIn delay={0.1}>
            <h2
              className="font-bold text-black"
              style={{
                fontSize: "clamp(30px, 4vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              Veelgestelde vragen
              <span style={{ color: SECONDARY_BLUE }}>.</span>
            </h2>
          </FadeIn>

          <div className="mt-10 md:mt-14 flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl bg-white border border-neutral-200"
              >
                <summary
                  className="flex items-start justify-between gap-4 cursor-pointer list-none px-5 md:px-6 py-5 text-black font-semibold"
                  style={{
                    fontSize: "clamp(16px, 1.25vw, 18px)",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.4,
                  }}
                >
                  <span>{q}</span>
                  <span
                    aria-hidden
                    className="shrink-0 mt-0.5 text-[20px] font-normal leading-none transition-transform duration-200 group-open:rotate-45 select-none"
                    style={{ color: SECONDARY_BLUE }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-5 md:px-6 pb-5 text-black"
                  style={{ fontSize: "15px", lineHeight: 1.65 }}
                >
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Contact / CTA ───────────────────────────────────── */}
      <section
        id="contact"
        className="bg-white scroll-mt-20"
        style={{ padding: "clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4">
            <FadeIn delay={0.1}>
              <h2
                className="font-bold text-black"
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                }}
              >
                Plan een kennismaking
                <span style={{ color: SECONDARY_BLUE }}>.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p
                className="text-black"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  maxWidth: "440px",
                  marginTop: "20px",
                }}
              >
                Direct contact met een recruiter, geen tussenpersonen. Reactie
                binnen 24 uur.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-12 space-y-6">
                <div>
                  <p
                    className="text-neutral-600"
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    E-mail
                  </p>
                  <a
                    href="mailto:storm@legal-talents.nl"
                    className="contact-link text-[15px] font-medium text-black border-b border-neutral-300 pb-0.5 transition-colors duration-200"
                  >
                    storm@legal-talents.nl
                  </a>
                </div>
                <div>
                  <p
                    className="text-neutral-600"
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Telefoon
                  </p>
                  <a
                    href="tel:+31685680998"
                    className="contact-link text-[15px] font-medium text-black border-b border-neutral-300 pb-0.5 transition-colors duration-200"
                  >
                    +31 6 85 68 09 98
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <RecruitmentContactForm
              primaryBlue={PRIMARY_BLUE}
              secondaryBlue={SECONDARY_BLUE}
            />
          </div>
        </div>

        {/* Eén kleine, scoped style om de hover-kleur op contact-links te zetten
            zonder een Tailwind config-mutatie nodig te hebben. */}
        <style>{`
          #contact .contact-link:hover { color: ${SECONDARY_BLUE}; border-color: ${SECONDARY_BLUE}; }
        `}</style>
      </section>

      <Footer />
    </div>
  );
}
