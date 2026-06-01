import { createHmac, timingSafeEqual } from "crypto";

const getSecret = () => {
  const secret =
    process.env.IMPERSONATION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Missing HMAC signing secret");
  return secret;
};

/**
 * Sign a value with HMAC-SHA256.
 * Returns `value.signature` so the original value is easily extractable.
 */
export function hmacSign(value: string): string {
  const sig = createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${sig}`;
}

/**
 * Verify and extract the original value from a signed string.
 * Returns `null` if the signature is invalid or the format is wrong.
 */
export function hmacVerify(signed: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;

  const value = signed.slice(0, lastDot);
  const providedSig = signed.slice(lastDot + 1);

  const expectedSig = createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");

  if (providedSig.length !== expectedSig.length) return null;

  const valid = timingSafeEqual(
    Buffer.from(providedSig),
    Buffer.from(expectedSig),
  );

  return valid ? value : null;
}
