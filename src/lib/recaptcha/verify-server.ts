import "server-only";

/** Response shape from https://www.google.com/recaptcha/api/siteverify */
type GoogleSiteverifyJson = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  /** Present for reCAPTCHA v3 only — v2 uses `success` only. */
  score?: number;
  action?: string;
};

export type RecaptchaVerifyResult =
  | { ok: true; hostname?: string }
  | { ok: false; error: string; codes?: string[] };

/**
 * Verifies a reCAPTCHA v2 (checkbox or invisible) user response token with Google.
 * v2 does not return a trust score; only `success` is authoritative.
 */
export async function verifyRecaptchaToken(
  token: string,
  remoteip?: string
): Promise<RecaptchaVerifyResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return {
      ok: false,
      error: "reCAPTCHA secret key is not configured on the server.",
    };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteip) body.set("remoteip", remoteip);

  let json: GoogleSiteverifyJson;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        ok: false,
        error: `reCAPTCHA verification request failed (${res.status}).`,
      };
    }

    json = (await res.json()) as GoogleSiteverifyJson;
  } catch {
    return { ok: false, error: "Could not reach reCAPTCHA verification service." };
  }

  if (!json.success) {
    return {
      ok: false,
      error: "reCAPTCHA verification failed.",
      codes: json["error-codes"],
    };
  }

  return { ok: true, hostname: json.hostname };
}
