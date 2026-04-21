import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Briefcase, FileText, Shield, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Super Admin | Legal Talents",
};

type FirmRow = {
  id: string;
  name: string;
  slug: string | null;
  is_published: boolean | null;
  created_at: string;
};

type JobRow = {
  id: string;
  firm_id: string;
  status: "draft" | "active" | "closed" | null;
};

type ApplicationRow = {
  id: string;
  firm_id: string | null;
  job_id: string | null;
};

export default async function AdminDashboardPage() {
  // ── 1. Auth + admin role check ────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/");

  // ── 2. Fetch data with service-role (bypasses RLS) ────────────────────────
  // Safe here because we've already verified the caller is an admin.
  const admin = createAdminClient();

  const [firmsRes, jobsRes, applicationsRes] = await Promise.all([
    admin
      .from("firms")
      .select("id, name, slug, is_published, created_at")
      .order("created_at", { ascending: false }),
    admin.from("jobs").select("id, firm_id, status"),
    admin.from("applications").select("id, firm_id, job_id"),
  ]);

  const firms = (firmsRes.data ?? []) as FirmRow[];
  const jobs = (jobsRes.data ?? []) as JobRow[];
  const applications = (applicationsRes.data ?? []) as ApplicationRow[];

  // ── 3. Aggregate per-firm metrics ─────────────────────────────────────────
  const liveJobsPerFirm = new Map<string, number>();
  for (const j of jobs) {
    if (j.status === "active") {
      liveJobsPerFirm.set(j.firm_id, (liveJobsPerFirm.get(j.firm_id) ?? 0) + 1);
    }
  }

  // Applications per firm: prefer firm_id (direct) and fall back to a
  // job_id → firm_id lookup for legacy rows where firm_id is null.
  const jobIdToFirm = new Map<string, string>();
  for (const j of jobs) jobIdToFirm.set(j.id, j.firm_id);

  const applicationsPerFirm = new Map<string, number>();
  for (const a of applications) {
    const firmId = a.firm_id ?? (a.job_id ? jobIdToFirm.get(a.job_id) : undefined);
    if (!firmId) continue;
    applicationsPerFirm.set(firmId, (applicationsPerFirm.get(firmId) ?? 0) + 1);
  }

  const totalActiveJobs = jobs.filter((j) => j.status === "active").length;

  const stats = [
    {
      label: "Werkgevers",
      value: firms.length,
      icon: Building2,
      accent: "bg-brand-50 text-brand-700",
    },
    {
      label: "Actieve vacatures",
      value: totalActiveJobs,
      icon: Briefcase,
      accent: "bg-green-50 text-green-700",
    },
    {
      label: "Sollicitaties (totaal)",
      value: applications.length,
      icon: FileText,
      accent: "bg-orange-50 text-orange-700",
    },
    {
      label: "Gepubliceerde profielen",
      value: firms.filter((f) => f.is_published).length,
      icon: Shield,
      accent: "bg-purple-50 text-purple-700",
    },
  ];

  // ── 4. Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
              <Shield className="h-3.5 w-3.5" />
              Super Admin
            </div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">
              Platformoverzicht
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Alle werkgevers, vacatures en sollicitaties in één oogopslag.
            </p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold leading-none text-gray-900">
                    {value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-gray-500">
                    {label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Firms table */}
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Werkgevers
              </h2>
              <p className="text-xs text-gray-500">
                {firms.length} bedrijven, nieuwste eerst
              </p>
            </div>
          </div>

          {firms.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              Nog geen werkgevers geregistreerd.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Bedrijfsnaam
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Live vacatures
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Sollicitaties
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Aangemaakt
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {firms.map((firm) => {
                    const liveCount = liveJobsPerFirm.get(firm.id) ?? 0;
                    const applicationCount =
                      applicationsPerFirm.get(firm.id) ?? 0;
                    return (
                      <tr key={firm.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/werkgever/${firm.id}`}
                            className="font-semibold text-gray-900 hover:text-brand-600"
                          >
                            {firm.name}
                          </Link>
                          {firm.slug && (
                            <div className="text-xs text-gray-400">
                              /{firm.slug}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            {liveCount}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-900">
                          {applicationCount}
                        </td>
                        <td className="px-4 py-4">
                          {firm.is_published ? (
                            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                              Gepubliceerd
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                              Concept
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-500">
                          {new Date(firm.created_at).toLocaleDateString(
                            "nl-NL",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/admin/werkgever/${firm.id}`}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition"
                          >
                            Beheer
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
