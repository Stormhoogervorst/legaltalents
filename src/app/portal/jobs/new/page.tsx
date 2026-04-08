import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";
import JobForm from "@/components/JobForm";

export default async function NewJobPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: firm } = await supabase
    .from("firms")
    .select("id, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!firm) redirect("/portal/profile");

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <Link
        href="/portal/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Terug naar vacatures
      </Link>

      <h1 className="text-2xl font-bold text-black mb-8">Nieuwe vacature</h1>

      <JobForm firmId={firm.id} firmSlug={firm.slug} />
    </div>
  );
}
