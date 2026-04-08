import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import ApplicationForm from "@/components/ApplicationForm";
import type { Firm, Job } from "@/types";
import type { Metadata } from "next";

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("title, firms(name)")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return { title: "Solliciteren | Legal Talents" };

  const firmName = Array.isArray(data.firms)
    ? data.firms[0]?.name
    : (data.firms as { name: string } | null)?.name;

  return {
    title: `Solliciteren: ${data.title}${firmName ? ` bij ${firmName}` : ""} | Legal Talents`,
  };
}

export default async function SolliciterenPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(`
      id, title, slug, status,
      firms ( id, name, slug )
    `)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (!job) notFound();

  const firm = (
    Array.isArray(job.firms) ? job.firms[0] : job.firms
  ) as Firm | null;

  const typedJob = job as unknown as Job;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      {/* Back link */}
      <div
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "32px",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <Link
            href={`/jobs/${typedJob.slug}`}
            className="inline-flex items-center gap-2 text-[14px] text-[#999999] hover:text-[#0A0A0A] transition-colors duration-200"
          >
            ← Terug naar vacature
          </Link>
        </div>
      </div>

      {/* Header */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(40px, 5vh, 64px)",
          paddingBottom: "clamp(40px, 5vh, 64px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <h1
            className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A]"
            style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
          >
            {typedJob.title}
          </h1>
          {firm?.name && (
            <p
              className="mt-4"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#6B6B6B",
              }}
            >
              bij {firm.name}
            </p>
          )}
        </div>
      </section>

      {/* Form */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="border-t border-[#E5E5E5] pt-12">
            <ApplicationForm
              jobId={typedJob.id}
              jobTitle={typedJob.title}
              firmName={firm?.name ?? ""}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
