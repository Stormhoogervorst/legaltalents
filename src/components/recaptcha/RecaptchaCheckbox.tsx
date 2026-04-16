"use client";

import dynamic from "next/dynamic";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });

type Props = {
  /** Changing this remounts the widget (clears stale tokens). */
  widgetKey: number;
  onChange: (token: string | null) => void;
  className?: string;
};

/**
 * Checkbox reCAPTCHA v2. Load only on the client (Google script + DOM).
 */
export function RecaptchaCheckbox({ widgetKey, onChange, className }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    return (
      <p
        className={`text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 ${className ?? ""}`}
      >
        reCAPTCHA is not configured: set{" "}
        <code className="text-xs">NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code> in{" "}
        <code className="text-xs">.env.local</code>.
      </p>
    );
  }

  return (
    <div className={className}>
      <ReCAPTCHA
        key={widgetKey}
        sitekey={siteKey}
        size="compact"
        onChange={onChange}
        onExpired={() => onChange(null)}
        onErrored={() => onChange(null)}
      />
    </div>
  );
}
