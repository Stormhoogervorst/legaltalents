import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";
import JobForm from "@/components/JobForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditJobPage({ params }: Props) {
  const { id } = await params;
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

  const { data: job } = await supabase
    .from("jobs")
    .select(
      "id, title, slug, location, type, practice_area, description, salary_indication, start_date, required_education, hours_per_week, status"
    )
    .eq("id", id)
    .eq("firm_id", firm.id)
    .maybeSingle();

  if (!job) notFound();

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

      <h1 className="text-2xl font-bold text-black mb-2">Vacature bewerken</h1>
      <p className="text-sm text-gray-500 mb-8">{job.title}</p>

      <JobForm
        firmId={firm.id}
        firmSlug={firm.slug}
        job={{
          id: job.id,
          title: job.title,
          location: job.location,
          type: job.type,
          practice_area: job.practice_area,
          description: job.description,
          salary_indication: job.salary_indication,
          start_date: job.start_date,
          required_education: job.required_education,
          hours_per_week: job.hours_per_week,
          status: job.status,
        }}
      />
    </div>
  );
}
