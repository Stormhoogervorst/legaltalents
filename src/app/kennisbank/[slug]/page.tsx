import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://legaltalents.nl";

const categoryLabels: Record<string, string> = {
  carriere: "Carrière",
  juridisch: "Juridisch",
  kantoorleven: "Werkgeversleven",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select("title, content, image_url, firms(name)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return { title: "Artikel niet gevonden | Legal Talents" };

  const firmName = Array.isArray(data.firms)
    ? data.firms[0]?.name
    : (data.firms as { name: string } | null)?.name;

  const plainDescription = data.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);

  return {
    title: `${data.title}${firmName ? ` — ${firmName}` : ""} | Legal Talents`,
    description: plainDescription,
    openGraph: {
      title: data.title,
      description: plainDescription,
      ...(data.image_url ? { images: [{ url: data.image_url }] } : {}),
    },
  };
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  image_url: string | null;
  created_at: string;
  firms: {
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    location: string | null;
  } | null;
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select(
      `
      id, title, slug, category, content, image_url, created_at,
      firms ( name, slug, logo_url, description, location )
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) notFound();

  const blog = {
    ...data,
    firms: Array.isArray(data.firms) ? data.firms[0] ?? null : data.firms,
  } as Blog;

  const firm = blog.firms;

  const plainContent = blog.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: plainContent.substring(0, 160),
    datePublished: blog.created_at,
    url: `${BASE_URL}/kennisbank/${blog.slug}`,
    ...(blog.image_url ? { image: blog.image_url } : {}),
    ...(firm
      ? {
          author: {
            "@type": "Organization",
            name: firm.name,
            ...(firm.logo_url ? { logo: firm.logo_url } : {}),
          },
          publisher: {
            "@type": "Organization",
            name: "Legal Talents",
            url: BASE_URL,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <NavbarPublic />

      {/* Article header */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(40px, 5vh, 60px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Breadcrumb */}
          <Link
            href="/kennisbank"
            className="inline-flex items-center gap-1 text-[14px] font-medium text-[#999] hover:text-[#0A0A0A] transition-colors duration-200 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform duration-200">
              ←
            </span>
            Kennisbank
          </Link>

          <div className="mt-8 mb-6 flex items-center gap-3">
            <span className="text-[13px] font-medium tracking-[0.02em] text-[#999]">
              {categoryLabels[blog.category] ?? blog.category}
            </span>
            <span className="text-[#E5E5E5]">·</span>
            <time className="text-[13px] font-medium text-[#999]">
              {new Date(blog.created_at).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>

          <h1
            className="font-bold text-[#0A0A0A] leading-[1.1] max-w-[900px]"
            style={{
              fontSize: "clamp(32px, 4.5vw, 56px)",
              letterSpacing: "-0.025em",
            }}
          >
            {blog.title}
          </h1>

          {firm && (
            <div className="mt-6 flex items-center gap-3">
              {firm.logo_url && (
                <div className="w-8 h-8 rounded-[8px] bg-[#F5F5F5] flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={firm.logo_url}
                    alt={firm.name}
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
              )}
              <Link
                href={`/firms/${firm.slug}`}
                className="text-[14px] font-medium text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors duration-200"
              >
                {firm.name}
                {firm.location && (
                  <span className="text-[#999]"> · {firm.location}</span>
                )}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured image */}
      {blog.image_url && (
        <section
          style={{
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
            paddingTop: "clamp(32px, 4vh, 48px)",
          }}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="relative aspect-[21/9] w-full rounded-[4px] overflow-hidden bg-[#F5F5F5]">
              <Image
                src={blog.image_url}
                alt={blog.title}
                fill
                className="object-cover saturate-[0.85]"
                sizes="(max-width: 768px) 100vw, 1400px"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Article body + sidebar */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(40px, 6vh, 80px)",
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-20">
            {/* Main content */}
            <article>
              <div
                className="prose prose-lg max-w-[640px]
                  prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#0A0A0A]
                  prose-h2:text-[22px] prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-[1.2]
                  prose-h3:text-[18px] prose-h3:mt-10 prose-h3:mb-3 prose-h3:leading-[1.3]
                  prose-p:text-[#6B6B6B] prose-p:leading-[1.65] prose-p:text-[16px]
                  prose-a:text-[#587DFE] prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-li:text-[#6B6B6B] prose-li:text-[16px] prose-li:leading-[1.65]
                  prose-strong:text-[#0A0A0A] prose-strong:font-semibold
                  prose-blockquote:border-l-[#587DFE] prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:text-[#0A0A0A] prose-blockquote:font-semibold prose-blockquote:text-[20px] prose-blockquote:leading-[1.4] prose-blockquote:not-italic
                  prose-img:rounded-[4px]
                  prose-hr:border-[#E5E5E5]"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </article>

            {/* Sidebar */}
            {firm && (
              <aside className="lg:pt-2">
                <div className="lg:sticky lg:top-24">
                  <p className="text-[13px] font-medium tracking-[0.02em] uppercase text-[#999] mb-5">
                    Over de werkgever
                  </p>

                  <div className="border-t border-[#E5E5E5] pt-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-[8px] bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden">
                        {firm.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firm.logo_url}
                            alt={firm.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-[12px] font-bold text-[#587DFE]">
                            {firm.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-[#0A0A0A] truncate">
                          {firm.name}
                        </p>
                        {firm.location && (
                          <p className="text-[13px] text-[#999]">
                            {firm.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {firm.description && (
                      <p className="text-[14px] text-[#6B6B6B] leading-[1.65] mb-5 line-clamp-4">
                        {firm.description}
                      </p>
                    )}

                    <Link
                      href={`/firms/${firm.slug}`}
                      className="btn-primary"
                    >
                      Werkgeversprofiel bekijken
                    </Link>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
