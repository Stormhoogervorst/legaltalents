"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  sanitizeLinkedInProfileUrl,
  isValidLinkedInInUrl,
} from "@/lib/linkedin-profile-url";
import { RecaptchaCheckbox } from "@/components/recaptcha/RecaptchaCheckbox";
import { useRecaptcha } from "@/hooks/useRecaptcha";

const PENDING_APPLY_KEY = "pending_linkedin_apply";

interface Props {
  jobId: string;
  jobSlug: string;
  alreadyApplied?: boolean;
}

export default function LinkedInQuickApply({
  jobId,
  jobSlug,
  alreadyApplied = false,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorCode = searchParams.get("error");
  const statusCode = searchParams.get("status");

  const [showForm, setShowForm] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(statusCode === "success");
  const [error, setError] = useState<string | null>(() => {
    if (errorCode === "auth_failed")
      return "LinkedIn-verificatie mislukt. Probeer het opnieuw.";
    return null;
  });

  const hasCheckedAuth = useRef(false);
  const {
    widgetKey: recaptchaWidgetKey,
    token: recaptchaToken,
    setToken: setRecaptchaToken,
    reset: resetRecaptcha,
    siteKeyConfigured,
  } = useRecaptcha();
  const recaptchaRequired = siteKeyConfigured;

  // After OAuth return: detect pending apply + logged-in user → show form
  useEffect(() => {
    if (alreadyApplied || success || hasCheckedAuth.current) return;

    const pending = localStorage.getItem(PENDING_APPLY_KEY);
    if (!pending) return;

    let parsed: { jobId: string; timestamp: number };
    try {
      parsed = JSON.parse(pending);
    } catch {
      localStorage.removeItem(PENDING_APPLY_KEY);
      return;
    }

    if (parsed.jobId !== jobId) {
      console.log("[LinkedInQuickApply] Pending jobId mismatch, skipping");
      return;
    }

    if (Date.now() - parsed.timestamp > 10 * 60 * 1000) {
      console.log("[LinkedInQuickApply] Pending apply expired, clearing");
      localStorage.removeItem(PENDING_APPLY_KEY);
      return;
    }

    hasCheckedAuth.current = true;

    async function checkAuth() {
      console.log("[LinkedInQuickApply] Found pending apply, checking auth…");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log(
        "[LinkedInQuickApply] Auth check — user:",
        user?.id ?? "null",
      );

      if (!user) {
        console.log("[LinkedInQuickApply] No session, keeping default state");
        hasCheckedAuth.current = false;
        return;
      }

      console.log("[LinkedInQuickApply] User authenticated, showing form");
      setShowForm(true);
    }

    checkAuth();
  }, [jobId, alreadyApplied, success]);

  // Step 1: Start LinkedIn OAuth
  async function handleStartOAuth() {
    setLoading(true);
    setError(null);

    localStorage.setItem(
      PENDING_APPLY_KEY,
      JSON.stringify({ jobId, timestamp: Date.now() }),
    );
    console.log("[LinkedInQuickApply] Stored pending apply, starting OAuth…");

    const supabase = createClient();
    const currentPath = window.location.pathname;
    const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(currentPath)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: { redirectTo: callbackUrl },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
      localStorage.removeItem(PENDING_APPLY_KEY);
    }
  }

  // Step 2: Submit application with LinkedIn URL + phone
  async function handleSubmitApplication() {
    setError(null);
    setUrlError(null);
    setPhoneError(null);

    let hasValidationError = false;

    const trimmedUrl = linkedinUrl.trim();
    if (!trimmedUrl) {
      setUrlError("Vul je LinkedIn profiel-URL in.");
      hasValidationError = true;
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setPhoneError("Vul je telefoonnummer in.");
      hasValidationError = true;
    }

    if (hasValidationError) return;

    const cleanUrl = sanitizeLinkedInProfileUrl(trimmedUrl);
    if (!isValidLinkedInInUrl(cleanUrl)) {
      setUrlError(
        "Voer een geldige LinkedIn-profiel-URL in (https://www.linkedin.com/in/…).",
      );
      return;
    }

    setLinkedinUrl(cleanUrl);
    if (recaptchaRequired && !recaptchaToken) {
      setError("Voltooi de reCAPTCHA-verificatie.");
      return;
    }
    setLoading(true);
    console.log("[LinkedInQuickApply] Submitting with cleanUrl:", cleanUrl, "phone:", trimmedPhone);

    try {
      const res = await fetch("/api/auth/linkedin-apply/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          linkedinUrl: cleanUrl,
          phone: trimmedPhone,
          recaptchaToken: recaptchaToken ?? undefined,
        }),
      });

      const data = await res.json();
      console.log("[LinkedInQuickApply] API response:", res.status, data);

      localStorage.removeItem(PENDING_APPLY_KEY);

      if (res.status === 409) {
        router.replace(`/jobs/${jobSlug}?error=already_applied`);
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error ?? "Er is iets misgegaan bij het opslaan.");
        resetRecaptcha();
        setLoading(false);
        return;
      }

      console.log("[LinkedInQuickApply] Application submitted successfully");
      setSuccess(true);
      setLoading(false);
      router.replace(`/jobs/${jobSlug}?status=success`);
    } catch (err) {
      console.error("[LinkedInQuickApply] Submit error:", err);
      setError("Geen verbinding. Probeer het opnieuw.");
      resetRecaptcha();
      setLoading(false);
    }
  }

  // ── Render states ───────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="flex items-center gap-3 rounded-full bg-emerald-50 border border-emerald-200 px-7 py-3.5">
        <svg
          className="h-5 w-5 shrink-0 text-emerald-600"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        <span className="text-[15px] font-semibold text-emerald-700 whitespace-nowrap">
          Sollicitatie verstuurd
        </span>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="shrink-0">
        <button
          disabled
          aria-disabled="true"
          className="inline-flex items-center gap-3 rounded-full bg-[#E5E5E5] px-7 py-3.5 text-[15px] font-semibold text-[#999999] cursor-not-allowed whitespace-nowrap"
        >
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          Al gesolliciteerd
        </button>
      </div>
    );
  }

  // Post-OAuth: show LinkedIn URL + phone form (inside the blue block)
  if (showForm) {
    return (
      <div className="w-full basis-full space-y-5 border-t border-blue-200 pt-6 mt-2">
        <div>
          <label htmlFor="linkedin-profile-url" className="sr-only">
            LinkedIn profiel-URL
          </label>
          <input
            id="linkedin-profile-url"
            type="url"
            inputMode="url"
            value={linkedinUrl}
            onChange={(e) => {
              setLinkedinUrl(e.target.value);
              if (urlError) setUrlError(null);
            }}
            placeholder="LinkedIn profiel-URL *"
            className={`w-full bg-white/70 rounded-lg border ${
              urlError ? "border-red-400" : "border-blue-200"
            } px-4 py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#587DFE]/30 focus:border-[#587DFE] transition-all duration-200`}
          />
          {urlError && (
            <p className="mt-1.5 text-[13px] text-red-500">{urlError}</p>
          )}
          <p className="mt-2 text-[13px] text-[#7B8AB8]">
            Ga naar{" "}
            <a
              href="https://www.linkedin.com/in/me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#587DFE] border-b border-[#587DFE]/40 hover:border-[#587DFE] transition-colors"
            >
              linkedin.com/in/me
            </a>{" "}
            en kopieer de URL uit je adresbalk.
          </p>
        </div>

        <div>
          <label htmlFor="linkedin-phone" className="sr-only">
            Telefoonnummer
          </label>
          <input
            id="linkedin-phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneError) setPhoneError(null);
            }}
            placeholder="Telefoonnummer *"
            className={`w-full bg-white/70 rounded-lg border ${
              phoneError ? "border-red-400" : "border-blue-200"
            } px-4 py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#587DFE]/30 focus:border-[#587DFE] transition-all duration-200`}
          />
          {phoneError && (
            <p className="mt-1.5 text-[13px] text-red-500">{phoneError}</p>
          )}
        </div>

        <RecaptchaCheckbox
          widgetKey={recaptchaWidgetKey}
          onChange={setRecaptchaToken}
          className="flex justify-center mb-4"
        />

        <div className="flex justify-center">
          <button
            onClick={handleSubmitApplication}
            disabled={loading}
            className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(10,15,61,0.55)] ring-1 ring-white/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-[0_18px_36px_-12px_rgba(10,15,61,0.65)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Versturen…" : "Sollicitatie afronden"}
          </button>
        </div>

        {error && <p className="text-center text-[13px] text-red-500">{error}</p>}
      </div>
    );
  }

  // Default: LinkedIn OAuth button
  return (
    <div className="shrink-0">
      <button
        onClick={handleStartOAuth}
        disabled={loading}
        className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(10,15,61,0.55)] ring-1 ring-white/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-[0_18px_36px_-12px_rgba(10,15,61,0.65)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )}
        {loading
          ? "Verbinden met LinkedIn…"
          : "Solliciteer direct met LinkedIn"}
      </button>

      {error && <p className="mt-2 text-[13px] text-red-500">{error}</p>}
    </div>
  );
}
