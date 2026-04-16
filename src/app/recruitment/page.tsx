"use client";

import Image from "next/image";
import Link from "next/link";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import { useState, FormEvent, useRef, useEffect } from "react";
import { RecaptchaCheckbox } from "@/components/recaptcha/RecaptchaCheckbox";
import { useRecaptcha } from "@/hooks/useRecaptcha";

const benefits = [
  {
    title: "Geen opstartkosten",
    description:
      "Wij beginnen direct met de search zonder factuur vooraf. U betaalt pas bij een succesvolle plaatsing — nooit eerder.",
  },
  {
    title: "Actieve headhunting",
    description:
      "Wij benaderen talent in ons netwerk actief. We wachten niet op reacties, maar gaan proactief op zoek naar de juiste match.",
  },
  {
    title: "Resultaatgericht",
    description:
      "De fee is pas verschuldigd op de dag dat de kandidaat bij u start. Geen plaatsing, geen kosten — zo simpel is het.",
  },
];

const steps = [
  {
    number: "01",
    title: "Intake",
    description:
      "We bespreken het gewenste profiel, de werkgeverscultuur en uw specifieke wensen.",
  },
  {
    number: "02",
    title: "Search & select",
    description:
      "Actieve search in ons netwerk en op diverse platformen naar de juiste kandidaten.",
  },
  {
    number: "03",
    title: "Screening",
    description:
      "Uitgebreid interview en screening door onze gespecialiseerde recruiters.",
  },
  {
    number: "04",
    title: "Introductie",
    description:
      "U ontvangt de beste profielen inclusief uitgebreide motivatie en achtergrond.",
  },
  {
    number: "05",
    title: "Matching",
    description:
      "Begeleiding bij gesprekken, onderhandeling en arbeidsvoorwaarden tot de start.",
  },
];

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function RecruitmentPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    widgetKey: recaptchaWidgetKey,
    token: recaptchaToken,
    setToken: setRecaptchaToken,
    reset: resetRecaptcha,
    siteKeyConfigured,
  } = useRecaptcha();
  const recaptchaRequired = siteKeyConfigured;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    if (recaptchaRequired && !recaptchaToken) {
      setSubmitError("Voltooi de reCAPTCHA-verificatie.");
      setSubmitting(false);
      return;
    }

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement)
        .value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      firmName: (form.elements.namedItem("firmName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      recaptchaToken: recaptchaToken ?? undefined,
    };

    try {
      const res = await fetch("/api/recruitment-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => ({} as { success?: boolean; error?: string }));
      if (!res.ok || !json.success) {
        setSubmitError(json.error ?? "Versturen is mislukt. Probeer het opnieuw.");
        resetRecaptcha();
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Geen verbinding. Probeer het opnieuw.");
      resetRecaptcha();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="bg-white">
        <div
          className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
        >
          <div>
            <FadeIn>
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
                RECRUITMENT
              </span>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1
                style={{
                  fontSize: "clamp(44px, 5.5vw, 76px)",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  color: "#0A0A0A",
                  marginTop: "24px",
                  maxWidth: "600px",
                }}
              >
                Vind juridisch talent, zonder financieel risico
                <span style={{ color: "#587DFE" }}>.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  maxWidth: "540px",
                  marginTop: "24px",
                }}
              >
                Wij searchen actief naar de perfecte match voor uw organisatie.
                Geen opstartkosten, geen verborgen fees — u betaalt pas bij een
                succesvolle plaatsing.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <a href="#contact" className="btn-primary">
                  Vrijblijvend kennismaken
                </a>
                <a href="#proces" className="btn-secondary">
                  Bekijk ons proces
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Image collage */}
          <div className="relative hidden lg:block">
            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="relative w-full aspect-[4/3] rounded-[8px] overflow-hidden">
                  <Image
                    src="/foto 1.jpg"
                    alt="Juridische professionals in overleg"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-[180px] aspect-square rounded-[8px] overflow-hidden border-4 border-white">
                  <Image
                    src="/foto 4.jpg"
                    alt="Team Legal Talents"
                    fill
                    className="object-cover"
                    sizes="180px"
                  />
                </div>
                <div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-[#587DFE] flex items-center justify-center"
                  aria-hidden="true"
                >
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Mobile fallback */}
          <div className="lg:hidden">
            <FadeIn delay={0.2}>
              <div className="relative aspect-[4/3] w-full rounded-[8px] overflow-hidden">
                <Image
                  src="/foto 1.jpg"
                  alt="Juridische professionals in overleg"
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Voordelen ────────────────────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-4">
              <FadeIn>
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
              </FadeIn>

              <FadeIn delay={0.1}>
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
                  Waarom kiezen voor Legal Talents
                  <span style={{ color: "#587DFE" }}>.</span>
                </h2>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p
                  style={{
                    fontSize: "clamp(15px, 1.1vw, 17px)",
                    lineHeight: 1.65,
                    color: "#5A6094",
                    maxWidth: "640px",
                    marginTop: "20px",
                  }}
                >
                  Wij nemen het volledige wervingsproces uit handen — zonder
                  financieel risico voor u.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-5">
              {benefits.map((b, idx) => (
                <FadeIn key={b.title} delay={0.1 + idx * 0.08}>
                  <div className="bg-[#EEF1FF] rounded-[8px] p-6 sm:p-8 flex gap-5 items-start">
                    <div
                      className="shrink-0 w-10 h-10 rounded-full bg-[#587DFE] flex items-center justify-center"
                      style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.02em" }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#2C337A" }}>
                        {b.title}
                      </h3>
                      <p style={{ fontSize: "15px", lineHeight: 1.6, color: "#5A6094", marginTop: "6px" }}>
                        {b.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Proces ───────────────────────────────────────────── */}
      <section
        id="proces"
        className="scroll-mt-20 bg-[#F5F7FF]"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4">
            <FadeIn>
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
                ONS PROCES
              </span>
            </FadeIn>

            <FadeIn delay={0.1}>
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
                Van intake tot de eerste werkdag
                <span style={{ color: "#587DFE" }}>.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  maxWidth: "640px",
                  marginTop: "20px",
                }}
              >
                Wij begeleiden het volledige traject. Transparant, efficiënt en
                altijd met oog voor de juiste match.
              </p>
            </FadeIn>
          </div>

          <div className="lg:col-span-8">
            <div className="border-t border-[#E2E5F0]">
              {steps.map((step, idx) => (
                <FadeIn key={step.number} delay={0.1 + idx * 0.08}>
                  <div
                    className="flex gap-6 sm:gap-8 py-7 border-b border-[#E2E5F0]"
                  >
                    <span
                      className="shrink-0 font-bold text-[14px] pt-0.5"
                      style={{ color: "#587DFE", letterSpacing: "0.02em" }}
                    >
                      {step.number}
                    </span>
                    <div>
                      <h3
                        style={{
                          fontSize: "clamp(18px, 1.5vw, 22px)",
                          fontWeight: 600,
                          lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                          color: "#2C337A",
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "clamp(15px, 1.1vw, 17px)",
                          lineHeight: 1.65,
                          color: "#5A6094",
                          maxWidth: "480px",
                          marginTop: "6px",
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ────────────────────────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-1 flex items-start pt-2">
            <FadeIn>
              <div
                className="w-12 h-12 rounded-full bg-[#587DFE] flex items-center justify-center"
                aria-hidden="true"
              >
              </div>
            </FadeIn>
          </div>
          <div className="lg:col-span-10">
            <FadeIn delay={0.15}>
              <blockquote
                style={{
                  fontSize: "clamp(24px, 3vw, 40px)",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  color: "#0A0A0A",
                }}
              >
                Van collegezaal tot kantoor, ons netwerk in het studentenleven
                geeft ons toegang tot juridisch talent dat anderen nog niet
                kennen.
              </blockquote>
            </FadeIn>
            <FadeIn delay={0.25}>
              <p
                className="mt-8"
                style={{ fontSize: "15px", fontWeight: 600, color: "#2C337A" }}
              >
                Storm Hoogervorst
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "14px", color: "#8B91B8" }}
              >
                Mede-eigenaar Legal Talents
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Contact / Formulier ──────────────────────────────── */}
      <section
        id="contact"
        className="scroll-mt-20 bg-[#F5F7FF]"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4">
            <FadeIn>
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
                CONTACT
              </span>
            </FadeIn>

            <FadeIn delay={0.1}>
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
                Laten we kennismaken
                <span style={{ color: "#587DFE" }}>.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  maxWidth: "640px",
                  marginTop: "20px",
                }}
              >
                Heeft u een vacature of wilt u de mogelijkheden bespreken? Laat
                uw gegevens achter en wij nemen binnen 24 uur contact met u op.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-12 space-y-6">
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                      color: "#8B91B8",
                      marginBottom: "4px",
                    }}
                  >
                    E-mail
                  </p>
                  <a
                    href="mailto:info@legal-talents.nl"
                    className="text-[15px] font-medium border-b border-[#E2E5F0] pb-0.5 hover:border-[#2C337A] transition-colors duration-200"
                    style={{ color: "#2C337A" }}
                  >
                    info@legal-talents.nl
                  </a>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                      color: "#8B91B8",
                      marginBottom: "4px",
                    }}
                  >
                    Telefoon
                  </p>
                  <a
                    href="tel:+31685680998"
                    className="text-[15px] font-medium"
                    style={{ color: "#2C337A" }}
                  >
                    +31 6 85 68 09 98
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            {submitted ? (
              <FadeIn>
                <div className="py-16">
                  <h3
                    style={{
                      fontSize: "clamp(24px, 3vw, 36px)",
                      fontWeight: 700,
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: "#0A0A0A",
                      marginBottom: "16px",
                    }}
                  >
                    Bedankt voor uw aanvraag
                    <span style={{ color: "#587DFE" }}>.</span>
                  </h3>
                  <p
                    style={{
                      fontSize: "clamp(15px, 1.1vw, 17px)",
                      lineHeight: 1.65,
                      color: "#5A6094",
                      maxWidth: "480px",
                    }}
                  >
                    Wij nemen binnen 24 uur contact met u op om de mogelijkheden
                    te bespreken.
                  </p>
                </div>
              </FadeIn>
            ) : (
              <FadeIn delay={0.15}>
                <form onSubmit={handleSubmit} className="space-y-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <div className="py-4 border-b border-[#BDD0FF] focus-within:border-[#587DFE] transition-colors duration-300">
                      <label htmlFor="firstName" className="sr-only">
                        Voornaam
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        placeholder="Voornaam"
                        className="w-full bg-transparent text-[15px] text-[#2C337A] placeholder-[#8B91B8] focus:outline-none"
                        style={{ padding: "4px 0" }}
                      />
                    </div>
                    <div className="py-4 border-b border-[#BDD0FF] focus-within:border-[#587DFE] transition-colors duration-300">
                      <label htmlFor="lastName" className="sr-only">
                        Achternaam
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        placeholder="Achternaam"
                        className="w-full bg-transparent text-[15px] text-[#2C337A] placeholder-[#8B91B8] focus:outline-none"
                        style={{ padding: "4px 0" }}
                      />
                    </div>
                  </div>

                  <div className="py-4 border-b border-[#BDD0FF] focus-within:border-[#587DFE] transition-colors duration-300">
                    <label htmlFor="firmName" className="sr-only">
                      Werkgeversnaam
                    </label>
                    <input
                      id="firmName"
                      name="firmName"
                      type="text"
                      required
                      placeholder="Werkgeversnaam"
                      className="w-full bg-transparent text-[15px] text-[#2C337A] placeholder-[#8B91B8] focus:outline-none"
                      style={{ padding: "4px 0" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <div className="py-4 border-b border-[#BDD0FF] focus-within:border-[#587DFE] transition-colors duration-300">
                      <label htmlFor="email" className="sr-only">
                        E-mailadres
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="E-mailadres"
                        className="w-full bg-transparent text-[15px] text-[#2C337A] placeholder-[#8B91B8] focus:outline-none"
                        style={{ padding: "4px 0" }}
                      />
                    </div>
                    <div className="py-4 border-b border-[#BDD0FF] focus-within:border-[#587DFE] transition-colors duration-300">
                      <label htmlFor="phone" className="sr-only">
                        Telefoonnummer
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="Telefoonnummer"
                        className="w-full bg-transparent text-[15px] text-[#2C337A] placeholder-[#8B91B8] focus:outline-none"
                        style={{ padding: "4px 0" }}
                      />
                    </div>
                  </div>

                  <p style={{ fontSize: "13px", color: "#8B91B8", marginTop: "2.5rem" }}>
                    Door dit formulier in te dienen gaat u akkoord met ons{" "}
                    <Link
                      href="/privacy"
                      className="border-b border-[#E2E5F0] hover:border-[#2C337A] transition-colors duration-200"
                      style={{ color: "#8B91B8" }}
                    >
                      privacybeleid
                    </Link>
                    .
                  </p>

                  <RecaptchaCheckbox
                    widgetKey={recaptchaWidgetKey}
                    onChange={setRecaptchaToken}
                    className="flex justify-start mb-4"
                  />
                  {submitError && (
                    <p className="mt-3 text-[13px] text-red-500">{submitError}</p>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                    >
                      {submitting
                        ? "Verzenden…"
                        : "Terugbelverzoek indienen"}
                    </button>
                  </div>
                </form>
              </FadeIn>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
