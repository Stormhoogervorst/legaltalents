import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Briefcase, FileText, Shield, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Profile, Vacancy } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import AdminActions from "./AdminActions";

const roleColors: Record<string, string> = {
  job_seeker: "bg-gray-100 text-gray-700",
  employer: "bg-brand-50 text-brand-700",
  admin: "bg-red-50 text-red-700",
};

const vacancyStatusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
  draft: "bg-yellow-100 text-yellow-700",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const [{ data: profiles }, { data: vacancies }, { data: applications }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("vacancies").select("*").order("created_at", { ascending: false }),
    supabase.from("applications").select("id"),
  ]);

  const stats = [
    { label: "Total users", value: profiles?.length ?? 0, icon: Users, color: "text-brand-600 bg-brand-50" },
    { label: "Employers", value: profiles?.filter(p => p.role === "employer").length ?? 0, icon: Shield, color: "text-purple-600 bg-purple-50" },
    { label: "Vacancies", value: vacancies?.length ?? 0, icon: Briefcase, color: "text-green-600 bg-green-50" },
    { label: "Applications", value: applications?.length ?? 0, icon: FileText, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Users */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4" /> Users
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Name", "Email", "Role", "Company", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profiles?.map((p: Profile) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{p.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn("badge", roleColors[p.role])}>{p.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.company_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <AdminActions type="user" id={p.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vacancies */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Vacancies
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Title", "Company", "Location", "Status", "Posted", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vacancies?.map((v: Vacancy) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/vacancies/${v.id}`} className="hover:text-brand-600 transition">{v.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{v.company_name}</td>
                    <td className="px-4 py-3 text-gray-500">{v.location}</td>
                    <td className="px-4 py-3">
                      <span className={cn("badge", vacancyStatusColors[v.status])}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(v.created_at)}</td>
                    <td className="px-4 py-3">
                      <AdminActions type="vacancy" id={v.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
