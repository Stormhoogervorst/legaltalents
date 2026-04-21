"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { IMPERSONATION_COOKIE } from "@/lib/impersonation";

// ── deleteEmployerAction ─────────────────────────────────────────────────
//
// Verwijdert een werkgever volledig vanuit het admin-dashboard.
//
// Flow:
//  1. Verifieer dat de ingelogde gebruiker admin is (defense-in-depth;
//     middleware + (secure)/layout doen dit ook al).
//  2. Resolve firm + firm-owner user_id via service-role client.
//  3. Best-effort: verwijder logo-bestanden uit de `logos`-bucket onder
//     de firm-owner.
//  4. Verwijder de auth.users-rij van de firm-owner. De
//     ON DELETE CASCADE-keten (zie
//     supabase-migration-account-deletion-cascade.sql) ruimt
//     `profiles`, `firms`, `jobs`, `applications`, `blogs` en
//     `invitations` automatisch op.
//  5. Als er per ongeluk nog een actieve impersonatie-cookie op deze
//     firm stond, wissen we die zodat de admin niet op een dead link
//     blijft hangen.
//
// Veiligheid:
//  - De admin mag zichzelf niet verwijderen (zou zichzelf uitloggen en
//     het hele admin-portaal blokkeren).
//  - We weigeren expliciet het verwijderen van een andere admin-account.
//  - firm.id komt uit de form, maar wordt altijd server-side opnieuw
//     gevalideerd tegen de database — niets van de client wordt blind
//     vertrouwd.

export async function deleteEmployerAction(formData: FormData) {
  const employerId = String(formData.get("employerId") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (!employerId) {
    throw new Error("Geen werkgever-id opgegeven.");
  }
  if (confirm !== "VERWIJDER") {
    throw new Error(
      "Bevestiging onjuist — typ 'VERWIJDER' exact om te bevestigen."
    );
  }

  // Step 1: admin-rol herverificatie
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: selfProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (selfProfile?.role !== "admin") {
    redirect("/?error=unauthorized");
  }

  const admin = createAdminClient();

  // Step 2: resolve firm + owner
  const { data: firm, error: firmError } = await admin
    .from("firms")
    .select("id, name, user_id")
    .eq("id", employerId)
    .maybeSingle<{ id: string; name: string; user_id: string }>();

  if (firmError) {
    console.error(
      "[deleteEmployerAction] firm lookup error:",
      firmError.message
    );
    throw new Error("Werkgever ophalen mislukt.");
  }
  if (!firm) {
    throw new Error("Werkgever niet gevonden.");
  }

  // Guard: admin mag zichzelf niet wegpoetsen via deze route.
  if (firm.user_id === user.id) {
    throw new Error(
      "Je kunt je eigen account niet via deze route verwijderen."
    );
  }

  // Guard: weiger het verwijderen van andere admin-accounts. Werkgever-
  // delete is nadrukkelijk voor gewone werkgevers, niet voor collega-
  // admins — die verdienen een expliciete, apart gelogde flow.
  const { data: ownerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", firm.user_id)
    .maybeSingle<{ role: string | null }>();

  if (ownerProfile?.role === "admin") {
    throw new Error(
      "Deze werkgever is gekoppeld aan een admin-account en kan niet via dit scherm verwijderd worden."
    );
  }

  // Step 3: storage-cleanup (best-effort)
  try {
    const { data: files } = await admin.storage.from("logos").list(firm.user_id);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${firm.user_id}/${f.name}`);
      await admin.storage.from("logos").remove(paths);
    }
  } catch (err) {
    console.error("[deleteEmployerAction] storage cleanup failed:", err);
  }

  // Step 4: delete auth.users — cascade ruimt de rest op.
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(
    firm.user_id
  );

  if (deleteUserError) {
    console.error(
      "[deleteEmployerAction] auth.admin.deleteUser error:",
      deleteUserError.message
    );
    // Fallback: als de auth.users-rij om wat voor reden dan ook niet
    // bestaat (weesprofiel), verwijder dan de firm-rij direct. De
    // cascade binnen `public` ruimt dan alsnog jobs/applications/blogs
    // op. Dit voorkomt "zombie" werkgeversrijen die niet weg kunnen.
    const notFound = /user not found|not_found|no user/i.test(
      deleteUserError.message
    );
    if (notFound) {
      const { error: firmDeleteError } = await admin
        .from("firms")
        .delete()
        .eq("id", firm.id);
      if (firmDeleteError) {
        console.error(
          "[deleteEmployerAction] firm fallback delete error:",
          firmDeleteError.message
        );
        throw new Error("Werkgever verwijderen is mislukt.");
      }
    } else {
      throw new Error("Werkgever verwijderen is mislukt.");
    }
  }

  // Step 5: wis impersonatie-cookie als die toevallig op deze firm stond.
  const cookieStore = await cookies();
  const impersonating = cookieStore.get(IMPERSONATION_COOKIE)?.value;
  if (impersonating === firm.id) {
    cookieStore.delete(IMPERSONATION_COOKIE);
  }

  // Force een verse render van de werkgeverslijst + dashboard.
  revalidatePath("/admin/werkgevers");
  revalidatePath("/admin");

  redirect("/admin/werkgevers?deleted=" + encodeURIComponent(firm.name));
}
