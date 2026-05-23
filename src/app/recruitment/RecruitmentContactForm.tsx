"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import FadeIn from "./FadeIn";

type Props = {
  primaryBlue: string;
  secondaryBlue: string;
};

export default function RecruitmentContactForm({
  primaryBlue,
  secondaryBlue,
}: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement)
        .value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      firmName: (form.elements.namedItem("firmName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/recruitment-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res
        .json()
        .catch(() => ({} as { success?: boolean; error?: string }));
      if (!res.ok || !json.success) {
        setSubmitError(json.error ?? "Versturen is mislukt. Probeer het opnieuw.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Geen verbinding. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <FadeIn>
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 sm:p-12">
          <h3
            className="font-bold text-black"
            style={{
              fontSize: "clamp(24px, 3vw, 36px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            Bedankt — we bellen je terug
          </h3>
          <p
            className="text-black"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              lineHeight: 1.65,
              maxWidth: "480px",
            }}
          >
            Je krijgt op werkdagen binnen 24 uur reactie van één van onze
            recruiters — geen tussenpersonen, geen accountmanager-doorzet.
          </p>
        </div>
      </FadeIn>
    );
  }

  const fieldClass =
    "rcr-field w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-[15px] text-black placeholder:text-neutral-500 focus:outline-none focus:border-transparent focus:ring-2 transition-colors duration-200";

  return (
    <FadeIn delay={0.15}>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label htmlFor="firstName" className="sr-only">
              Voornaam
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              placeholder="Voornaam"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="sr-only">
              Achternaam
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder="Achternaam"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mt-4 sm:mt-5">
          <label htmlFor="firmName" className="sr-only">
            Kantoor of organisatie
          </label>
          <input
            id="firmName"
            name="firmName"
            type="text"
            required
            placeholder="Kantoor of organisatie"
            className={fieldClass}
          />
        </div>

        <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label htmlFor="email" className="sr-only">
              E-mailadres
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="E-mailadres"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className="sr-only">
              Telefoonnummer
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="Telefoonnummer"
              className={fieldClass}
            />
          </div>
        </div>

        <p
          className="text-neutral-600"
          style={{
            fontSize: "13px",
            lineHeight: 1.6,
            marginTop: "2rem",
          }}
        >
          Door dit formulier in te dienen ga je akkoord met ons{" "}
          <Link
            href="/privacy"
            className="rcr-link font-medium border-b border-neutral-300 pb-0.5 transition-colors duration-200"
            style={{ color: "#000000" }}
          >
            privacybeleid
          </Link>
          .
        </p>

        {submitError && (
          <p
            className="mt-3 rounded-lg px-3 py-2"
            style={{
              fontSize: "13px",
              color: "#7F1D1D",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
            }}
          >
            {submitError}
          </p>
        )}

        <div className="pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="rcr-submit inline-flex items-center justify-center rounded-full px-6 py-3 text-[14px] font-medium text-white transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryBlue }}
          >
            {submitting ? "Verzenden…" : "Plan een kennismaking"}
          </button>
        </div>

        {/* Scoped hover- en focus-kleuren — gebruikt de twee blauwen
            via props, zodat we geen Tailwind config-mutatie nodig hebben. */}
        <style>{`
          .rcr-field:focus { box-shadow: 0 0 0 2px ${secondaryBlue}; border-color: transparent; }
          .rcr-link:hover { color: ${secondaryBlue}; border-color: ${secondaryBlue}; }
          .rcr-submit:not(:disabled):hover { background-color: ${secondaryBlue}; }
        `}</style>
      </form>
    </FadeIn>
  );
}
