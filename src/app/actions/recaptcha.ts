"use server";

import { headers } from "next/headers";
import {
  verifyRecaptchaToken,
  type RecaptchaVerifyResult,
} from "@/lib/recaptcha/verify-server";

export type { RecaptchaVerifyResult };

/**
 * Server Action: verifies the client token before you run auth or other mutations.
 * Uses the caller IP when available (x-forwarded-for / x-real-ip) for Google's optional remoteip check.
 */
export async function verifyRecaptchaAction(
  token: string
): Promise<RecaptchaVerifyResult> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, error: "Complete the reCAPTCHA challenge before continuing." };
  }

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const remoteip =
    forwarded?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? undefined;

  return verifyRecaptchaToken(trimmed, remoteip);
}
