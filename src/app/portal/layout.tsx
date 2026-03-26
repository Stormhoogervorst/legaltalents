import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import PortalNav from "@/components/PortalNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isProfilePage = pathname.startsWith("/portal/profile");

  if (!isProfilePage) {
    const { data: firm } = await supabase
      .from("firms")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!firm) {
      redirect("/portal/profile");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNav />
      {/* md:pl-60 offsets content for the fixed desktop sidebar */}
      <div className="md:pl-60">
        <main className="pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
