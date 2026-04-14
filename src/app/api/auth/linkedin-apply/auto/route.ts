import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResend } from "@/lib/resend";
import {
  sanitizeLinkedInProfileUrl,
  isValidLinkedInInUrl,
} from "@/lib/linkedin-profile-url";
import { verifyRecaptchaToken } from "@/lib/recaptcha/verify-server";
import { checkRateLimit, getRequestIp } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  console.log("[linkedin-apply/auto] POST received");
  const ip = getRequestIp(request.headers);
  const limit = await checkRateLimit(`linkedin-auto:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: { jobId?: string; linkedinUrl?: string; phone?: string; recaptchaToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige request." }, { status: 400 });
  }

  const jobId = body.jobId?.trim();
  const rawLinkedinUrl = body.linkedinUrl?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";

  if (process.env.RECAPTCHA_SECRET_KEY) {
    const captcha = await verifyRecaptchaToken(body.recaptchaToken?.trim() ?? "");
    if (!captcha.ok) {
      return NextResponse.json(
        { error: "reCAPTCHA-verificatie mislukt. Probeer opnieuw." },
        { status: 400 }
      );
    }
  }

  if (!jobId) {
    console.log("[linkedin-apply/auto] Missing jobId");
    return NextResponse.json(
      { error: "jobId is verplicht." },
      { status: 400 },
    );
  }

  // Clean the LinkedIn URL: strip query params, then sanitize to canonical form
  let cleanLinkedinUrl: string | null = null;
  if (rawLinkedinUrl) {
    const strippedParams = rawLinkedinUrl.split("?")[0];
    const sanitized = sanitizeLinkedInProfileUrl(strippedParams);
    if (!isValidLinkedInInUrl(sanitized)) {
      return NextResponse.json(
        {
          error:
            "Voer een geldige LinkedIn-profiel-URL in (https://www.linkedin.com/in/…).",
        },
        { status: 400 },
      );
    }
    cleanLinkedinUrl = sanitized;
    console.log(
      "[linkedin-apply/auto] LinkedIn URL cleaned:",
      rawLinkedinUrl,
      "→",
      cleanLinkedinUrl,
    );
  }

  // 1. Authenticated user from session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("[linkedin-apply/auto] No authenticated user");
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const meta = user.user_metadata ?? {};
  const fullName: string = meta.full_name ?? meta.name ?? "Onbekend";
  const email: string = meta.email ?? user.email ?? "";
  const linkedinId: string | null = meta.provider_id ?? meta.sub ?? null;

  console.log(
    "[linkedin-apply/auto] User:",
    user.id,
    "| name:",
    fullName,
    "| email:",
    email,
    "| linkedinId:",
    linkedinId,
  );
  console.log(
    "[linkedin-apply/auto] Full user_metadata:",
    JSON.stringify(meta),
  );

  if (!email) {
    return NextResponse.json(
      { error: "Geen e-mailadres gevonden in je LinkedIn-profiel." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // 2. Fetch job + firm
  const { data: job, error: jobError } = await admin
    .from("jobs")
    .select(`id, title, firm_id, firms ( name, notification_email, cc_email )`)
    .eq("id", jobId)
    .eq("status", "active")
    .maybeSingle();

  if (jobError || !job) {
    console.log("[linkedin-apply/auto] Job not found:", jobId, jobError);
    return NextResponse.json(
      { error: "Vacature niet gevonden of niet meer actief." },
      { status: 404 },
    );
  }
  console.log("[linkedin-apply/auto] Job found:", job.title);

  // 3. Duplicate check
  const { data: existing } = await admin
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("applicant_email", email)
    .maybeSingle();

  if (existing) {
    console.log("[linkedin-apply/auto] Duplicate — already applied");
    return NextResponse.json(
      { error: "Je hebt al gesolliciteerd op deze vacature." },
      { status: 409 },
    );
  }

  // 4. Insert application
  console.log("[linkedin-apply/auto] Inserting application…");
  console.log("[linkedin-apply/auto] Fields:", {
    job_id: jobId,
    firm_id: job.firm_id,
    applicant_name: fullName,
    applicant_email: email,
    applicant_phone: phone || null,
    linkedin_id: linkedinId,
    linkedin_url: cleanLinkedinUrl,
  });
  const { error: insertError } = await admin.from("applications").insert({
    job_id: jobId,
    firm_id: job.firm_id,
    applicant_name: fullName,
    applicant_email: email,
    applicant_phone: phone || null,
    linkedin_id: linkedinId,
    linkedin_url: cleanLinkedinUrl,
  });

  if (insertError) {
    console.error(
      "[linkedin-apply/auto] Insert error:",
      insertError.message,
      insertError.code,
    );
    return NextResponse.json(
      { error: "Opslaan mislukt. Probeer het opnieuw." },
      { status: 500 },
    );
  }
  console.log("[linkedin-apply/auto] Application saved to database");

  // 5. Send emails (best-effort, don't block on failure)
  const firm = Array.isArray(job.firms) ? job.firms[0] : job.firms;
  const firmName = (firm as { name: string } | null)?.name ?? "";
  const notificationEmail = (
    firm as { notification_email: string } | null
  )?.notification_email;
  const ccEmail = (firm as { cc_email: string | null } | null)?.cc_email;
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";

  try {
    const resend = createResend();
    const promises: Promise<unknown>[] = [];

    if (notificationEmail) {
      console.log(
        "[linkedin-apply/auto] Sending firm email to:",
        notificationEmail,
      );
      promises.push(
        resend.emails.send({
          from: "Legal Talents <noreply@legal-talents.nl>",
          to: notificationEmail,
          ...(ccEmail ? { cc: ccEmail } : {}),
          subject: `Nieuwe sollicitatie (LinkedIn): ${fullName} voor ${job.title}`,
          html: firmEmailHtml({
            fullName,
            email,
            phone,
            linkedinUrl: cleanLinkedinUrl,
            jobTitle: job.title,
          }),
        }),
      );
    }

    if (email) {
      console.log("[linkedin-apply/auto] Sending student email to:", email);
      promises.push(
        resend.emails.send({
          from: "Legal Talents <noreply@legal-talents.nl>",
          to: email,
          subject: `Je sollicitatie bij ${firmName} is ontvangen`,
          html: studentEmailHtml({
            firstName,
            jobTitle: job.title,
            firmName,
          }),
        }),
      );
    }

    await Promise.allSettled(promises);
    console.log("[linkedin-apply/auto] Emails sent");
  } catch (err) {
    console.error("[linkedin-apply/auto] Email error (non-fatal):", err);
  }

  console.log("[linkedin-apply/auto] Done — success");
  return NextResponse.json({ success: true });
}

// ── Email templates ──────────────────────────────────────────────────────────

function firmEmailHtml(data: {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string | null;
  jobTitle: string;
}) {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; color: #0F0F0F; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #587DFE; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="color: white; font-size: 20px; font-weight: 800; font-style: italic; margin: 0;">Legal Talents.</p>
  </div>
  <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Nieuwe sollicitatie via LinkedIn</h2>
  <p style="color: #4B5563; margin-bottom: 24px;">Voor de functie <strong>${data.jobTitle}</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px; width: 40%;">Naam</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px; font-weight: 600;">${data.fullName}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px;">E-mail</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px;"><a href="mailto:${data.email}" style="color: #587DFE;">${data.email}</a></td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px;">Telefoon</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px;">${data.phone || "—"}</td>
    </tr>${data.linkedinUrl ? `
    <tr>
      <td style="padding: 10px 0; color: #4B5563; font-size: 14px;">LinkedIn</td>
      <td style="padding: 10px 0; font-size: 14px;"><a href="${data.linkedinUrl}" style="color: #587DFE;">${data.linkedinUrl}</a></td>
    </tr>` : ""}
  </table>
  <p style="font-size: 13px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 16px;">
    Gesolliciteerd via LinkedIn · <a href="https://legal-talents.nl" style="color: #587DFE;">Legal Talents</a>
  </p>
</body>
</html>`;
}

function studentEmailHtml(data: {
  firstName: string;
  jobTitle: string;
  firmName: string;
}) {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; color: #0F0F0F; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #587DFE; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="color: white; font-size: 20px; font-weight: 800; font-style: italic; margin: 0;">Legal Talents.</p>
  </div>
  <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Je sollicitatie is ontvangen!</h2>
  <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
    Beste ${data.firstName},<br /><br />
    Je sollicitatie voor de functie <strong>${data.jobTitle}</strong> bij <strong>${data.firmName}</strong>
    is in goede orde ontvangen via LinkedIn.
  </p>
  <div style="background: #EEF1FF; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.6;">
      De werkgever neemt contact met je op als je profiel aansluit bij hun wensen.
      Houd je inbox (en spammap) in de gaten.
    </p>
  </div>
  <p style="font-size: 14px; color: #4B5563;">Succes!</p>
  <p style="font-size: 14px; font-weight: 700; color: #587DFE;">Het Legal Talents team</p>
  <p style="font-size: 13px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 16px; margin-top: 24px;">
    <a href="https://legal-talents.nl" style="color: #587DFE;">legal-talents.nl</a>
  </p>
</body>
</html>`;
}
