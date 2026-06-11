import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl, sanitizeNextPath } from "@/lib/site";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` wordt tegen een safelist gevalideerd om open-redirect-misbruik te
  // voorkomen. We gebruiken een lege fallback zodat we kunnen onderscheiden
  // tussen "expliciet & geldig next" en "ontbrekend/ongeldig next" — in dat
  // laatste geval bepalen we de bestemming op basis van de rol.
  const validatedNext = sanitizeNextPath(searchParams.get("next"), "");
  const errorParam = searchParams.get("error");

  const base = getSiteUrl(origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.invitation_token) {
        const processed = await processInvitationToken(user);
        if (processed) {
          return NextResponse.redirect(`${base}/portal`);
        }
      }

      // Geldig `next` heeft voorrang; anders role-aware fallback zodat
      // werkgevers/admins op /dashboard landen en de rest op /portal — ook
      // wanneer Supabase de `next`-param liet vallen.
      const target = validatedNext || (await resolveRoleDestination(supabase, user));

      const destination = new URL(target, base);
      if (errorParam) destination.searchParams.set("error", errorParam);
      console.log("[auth/callback] Redirecting to:", target);
      return NextResponse.redirect(destination);
    }
  }

  // Code ontbreekt of inwisselen mislukte.
  if (validatedNext && validatedNext !== "/portal") {
    const failure = new URL(validatedNext, base);
    failure.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(failure);
  }

  return NextResponse.redirect(`${base}/login?error=auth_callback_failed`);
}

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Bepaalt de post-auth bestemming op basis van de rol in de `profiles`-tabel —
 * dezelfde bron die het dashboard zelf gebruikt. Werkgevers en admins gaan naar
 * /dashboard, alle andere (of onbekende) rollen naar /portal.
 */
async function resolveRoleDestination(
  supabase: ServerSupabaseClient,
  user: { id: string } | null
): Promise<string> {
  if (!user) return "/portal";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === "employer" || profile?.role === "admin"
    ? "/dashboard"
    : "/portal";
}

async function processInvitationToken(user: {
  id: string;
  email?: string;
  user_metadata: Record<string, unknown>;
}): Promise<boolean> {
  const token = user.user_metadata.invitation_token as string;
  const admin = createAdminClient();

  console.log("[auth/callback] Processing invitation token for user:", user.id);

  try {
    const { data: invitation, error: invErr } = await admin
      .from("invitations")
      .select("id, firm_id, status")
      .eq("token", token)
      .eq("status", "pending")
      .maybeSingle();

    if (invErr || !invitation) {
      console.warn("[auth/callback] Invitation not found or already used:", token);
      return false;
    }

    console.log("[auth/callback] Found invitation — firm_id:", invitation.firm_id);

    const profilePayload = {
      firm_id: invitation.firm_id,
      role: "employer" as const,
    };

    // Link user to the firm — try update first, fall back to insert
    const { data: updated, error: updateErr } = await admin
      .from("profiles")
      .update(profilePayload)
      .eq("id", user.id)
      .select("id");

    if (updateErr) {
      console.error("[auth/callback] Profile update failed:", updateErr.message);
    }

    if (!updated?.length) {
      console.log("[auth/callback] No existing profile found, inserting new profile");
      const { error: insertErr } = await admin.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: (user.user_metadata.contact_person as string) || null,
        role: "employer",
        firm_id: invitation.firm_id,
      });

      if (insertErr) {
        console.log("[auth/callback] Insert failed (trigger race), retrying update:", insertErr.message);
        const { error: retryErr } = await admin
          .from("profiles")
          .update(profilePayload)
          .eq("id", user.id);

        if (retryErr) {
          console.error("[auth/callback] Profile retry-update failed:", retryErr.message);
          return false;
        }
      }
    }

    console.log("[auth/callback] Profile linked to firm_id:", invitation.firm_id);

    // Mark invitation as accepted
    const { error: acceptErr } = await admin
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    if (acceptErr) {
      console.error("[auth/callback] Failed to mark invitation as accepted:", acceptErr.message);
    } else {
      console.log("[auth/callback] Invitation marked as accepted:", invitation.id);
    }

    // Remove the token from user metadata so it's not processed again
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        invitation_token: null,
      },
    });

    return true;
  } catch (err) {
    console.error("[auth/callback] Failed to process invitation:", err);
    return false;
  }
}
