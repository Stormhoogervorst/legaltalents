import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { CITIES } from "@/lib/cities";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://legaltalents.nl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/firms`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  for (const city of CITIES) {
    entries.push(
      {
        url: `${BASE_URL}/vacatures/${city}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/stages/${city}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      }
    );
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("slug, updated_at")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  for (const job of jobs ?? []) {
    entries.push({
      url: `${BASE_URL}/jobs/${job.slug}`,
      lastModified: new Date(job.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  const { data: firms } = await supabase
    .from("firms")
    .select("slug, created_at")
    .eq("is_published", true);

  for (const firm of firms ?? []) {
    entries.push({
      url: `${BASE_URL}/firms/${firm.slug}`,
      lastModified: new Date(firm.created_at),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
