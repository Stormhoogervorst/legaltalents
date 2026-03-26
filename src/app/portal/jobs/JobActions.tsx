"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  XCircle,
  Loader2,
} from "lucide-react";
import { nanoid } from "nanoid";

type Job = {
  id: string;
  title: string;
  slug: string;
  location: string;
  type: string;
  practice_area: string;
  description: string;
  salary_indication: string | null;
  start_date: string | null;
  required_education: string | null;
  hours_per_week: number | null;
  status: string;
  firm_id: string;
  firm_slug: string;
};

type Props = {
  job: Job;
};

export default function JobActions({ job }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const changeStatus = (status: "draft" | "active" | "closed") =>
    run(async () => {
      const { error } = await supabase
        .from("jobs")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", job.id);
      if (error) throw error;
    });

  const duplicate = () =>
    run(async () => {
      const slug = `${job.firm_slug}-${job.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${nanoid(6)}`;

      const { error } = await supabase.from("jobs").insert({
        firm_id: job.firm_id,
        title: `${job.title} (kopie)`,
        slug,
        location: job.location,
        type: job.type,
        practice_area: job.practice_area,
        description: job.description,
        salary_indication: job.salary_indication,
        start_date: job.start_date,
        required_education: job.required_education,
        hours_per_week: job.hours_per_week,
        status: "draft",
      });
      if (error) throw error;
    });

  const deleteJob = () => {
    if (!window.confirm(`Vacature "${job.title}" permanent verwijderen?`)) return;
    run(async () => {
      const { error } = await supabase.from("jobs").delete().eq("id", job.id);
      if (error) throw error;
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      {error && (
        <p className="text-xs text-red-500 mb-1">{error}</p>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
        aria-label="Acties"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm">
          {/* Bewerken */}
          <a
            href={`/portal/jobs/${job.id}/edit`}
            className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Bewerken
          </a>

          {/* Dupliceren */}
          <button
            onClick={duplicate}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
          >
            <Copy className="h-4 w-4" />
            Dupliceren
          </button>

          <div className="my-1 border-t border-gray-100" />

          {/* Status wijzigen */}
          {job.status !== "active" && (
            <button
              onClick={() => changeStatus("active")}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-green-600 hover:bg-green-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              Publiceren
            </button>
          )}
          {job.status !== "draft" && (
            <button
              onClick={() => changeStatus("draft")}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-yellow-600 hover:bg-yellow-50 transition-colors"
            >
              <EyeOff className="h-4 w-4" />
              Naar concept
            </button>
          )}
          {job.status !== "closed" && (
            <button
              onClick={() => changeStatus("closed")}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Sluiten
            </button>
          )}

          <div className="my-1 border-t border-gray-100" />

          {/* Verwijderen */}
          <button
            onClick={deleteJob}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Verwijderen
          </button>
        </div>
      )}
    </div>
  );
}
