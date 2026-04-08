"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  jobId: string;
  jobSlug: string;
}

export default function LinkedInQuickApply({ jobId, jobSlug }: Props) {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (errorCode === "already_applied")
      return "Je hebt al gesolliciteerd op deze vacature.";
    if (errorCode === "auth_failed")
      return "LinkedIn-verificatie mislukt. Probeer het opnieuw.";
    return null;
  });

  async function handleQuickApply() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const callbackUrl = `${window.location.origin}/api/auth/linkedin-apply?job_id=${encodeURIComponent(jobId)}&slug=${encodeURIComponent(jobSlug)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: { redirectTo: callbackUrl },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[640px]">
      <button
        onClick={handleQuickApply}
        disabled={loading}
        className="inline-flex items-center gap-3 rounded-full bg-[#0077b5] px-5 py-2.5 text-[14px] font-medium text-white transition-all duration-200 hover:scale-[1.03] hover:bg-[#006097] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )}
        {loading ? "Verbinden met LinkedIn…" : "Direct solliciteren met LinkedIn"}
      </button>

      {error && (
        <p className="mt-3 text-[13px] text-red-500">{error}</p>
      )}

      <p className="mt-3 text-[13px] text-[#999999]">
        Je naam en e-mail worden automatisch uit je LinkedIn-profiel gehaald.
      </p>
    </div>
  );
}
