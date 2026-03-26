import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const metadata = {
  title: "Mijn profiel | Legal Talents",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: firm } = await supabase
    .from("firms")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Mijn profiel</h1>
        <p className="mt-1 text-sm text-gray-500">
          {firm
            ? "Beheer de informatie van je kantoor die zichtbaar is op Legal Talents."
            : "Stel je kantoorprofiel in om zichtbaar te worden op Legal Talents."}
        </p>
      </div>

      <ProfileForm
        firm={firm}
        userId={user!.id}
        userEmail={user!.email ?? ""}
      />
    </div>
  );
}
