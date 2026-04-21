import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Extra beveiligingslaag bovenop middleware.ts. Elke /admin-subpagina wordt
 * hier opnieuw server-side geverifieerd:
 *   - geen sessie        → /login
 *   - wel sessie, niet admin → /?error=unauthorized
 * Deze layout faalt safe, ook als middleware per ongeluk wordt gewijzigd of
 * als een rewrite het matcher-patroon zou omzeilen.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/?error=unauthorized");

  return <>{children}</>;
}
