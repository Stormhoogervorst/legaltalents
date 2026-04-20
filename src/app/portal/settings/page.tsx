import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Instellingen | Legal Talents",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if user owns a firm (owners can edit e-mailinstellingen)
  const { data: ownedFirm } = await supabase
    .from("firms")
    .select("id, name, notification_email, cc_emails")
    .eq("user_id", user.id)
    .maybeSingle();

  let firmId: string | null = ownedFirm?.id ?? null;
  const isOwner = !!ownedFirm;

  if (!firmId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("firm_id")
      .eq("id", user.id)
      .maybeSingle();
    firmId = profile?.firm_id ?? null;
  }

  return (
    <SettingsClient
      hasFirm={!!firmId}
      isOwner={isOwner}
      initialNotificationEmail={ownedFirm?.notification_email ?? ""}
      initialCcEmails={
        Array.isArray(ownedFirm?.cc_emails) ? ownedFirm!.cc_emails : []
      }
    />
  );
}
