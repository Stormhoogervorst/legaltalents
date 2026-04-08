import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Kennisbank voor Juridisch Talent | Legal Talents",
  description:
    "Lees blogs en artikelen over carrière in de advocatuur, juridische stages en het werkleven bij werkgevers. Geschreven door topwerkgevers in Nederland.",
};

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
  } | null;
}

const categoryLabels: Record<string, string> = {
  carriere: "Carrière",
  juridisch: "Juridisch",
  kantoorleven: "Werkgeversleven",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <article className="flex flex-col h-full">
      <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-[#F5F5F5]">
        {blog.image_url ? (
          <Image
            src={blog.image_url}
            alt={blog.title}
            fill
            className="absolute inset-0 w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[#F5F5F5]" />
        )}
      </div>

      <div className="flex flex-col h-[180px] justify-between pt-4">
        <div>
          <p className="text-[13px] font-medium tracking-[0.02em] text-[#999] mb-2">
            {categoryLabels[blog.category] ?? blog.category}
            <span className="mx-2 text-[#E5E5E5]">·</span>
            {formatDate(blog.created_at)}
          </p>

          <h2 className="text-[20px] font-semibold text-[#0A0A0A] leading-[1.3] tracking-[-0.01em] line-clamp-2 group-hover:text-[#587DFE] transition-colors duration-200">
            {blog.title}
          </h2>
        </div>

        {blog.firms && (
          <p className="text-[13px] font-medium text-[#999] tracking-[0.02em]">
            {blog.firms.name}
          </p>
        )}
      </div>
    </article>
  );
}

export default async function KennisbankPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select(
      `
      id, title, slug, category, content, image_url, created_at,
      firms ( name, slug, logo_url )
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const blogs = ((data ?? []) as unknown as Blog[]).map((b) => ({
    ...b,
    firms: Array.isArray(b.firms) ? b.firms[0] ?? null : b.firms,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      {/* Hero */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(60px, 8vh, 120px)",
          paddingBottom: "clamp(48px, 6vh, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div
            className="bg-[#587DFE] rounded-full mb-6"
            style={{ width: 48, height: 48 }}
            aria-hidden
          />

          <h1
            className="font-bold tracking-[-0.03em] leading-[1.05] text-[#0A0A0A]"
            style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
          >
            Kennisbank
          </h1>

          <p
            className="mt-6 text-[#6B6B6B] leading-[1.65] max-w-[640px]"
            style={{ fontSize: "clamp(15px, 1.1vw, 17px)" }}
          >
            Artikelen en inzichten over carrière in de advocatuur, juridische
            stages en het werkleven bij werkgevers — geschreven door
            topwerkgevers in Nederland.
          </p>
        </div>
      </section>

      {/* Blog grid */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="border-t border-[#E5E5E5] mb-10" />

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/kennisbank/${blog.slug}`}
                  className="group block h-full"
                >
                  <BlogCard blog={blog} />
                </Link>
              ))}
            </div>
          ) : (
            <p
              className="text-[#6B6B6B] leading-[1.65] max-w-[640px]"
              style={{ fontSize: "clamp(15px, 1.1vw, 17px)" }}
            >
              Binnenkort verschijnen hier blogs en artikelen van topwerkgevers
              in Nederland.
            </p>
          )}
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
