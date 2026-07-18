import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";
import ServiceCard from "@/components/ServiceCard";
import EnquiryForm from "@/components/EnquiryForm";
import BlogPreview from "@/components/BlogPreview";
import PuckRenderer from "@/components/PuckRenderer";
import type { Service, BlogPost, CustomPage } from "@/lib/supabase/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: homePageData }, { data: services }, { data: posts }] = await Promise.all([
    supabase.from("custom_pages").select("*").eq("slug", "__home__").eq("published", true).single(),
    supabase.from("services").select("*").order("display_order").limit(4),
    supabase.from("blog_posts").select("*").order("published_at", { ascending: false }).limit(6),
  ]);

  const homePage = homePageData as CustomPage | null;
  const svcList = (services ?? []) as Service[];
  const postList = (posts ?? []) as BlogPost[];

  return (
    <>
      {/* Editable via /admin/pages → Homepage — drag, reorder, or edit
          the Hero, Trust Bar, Why Flowork, and Testimonials blocks here. */}
      {homePage ? (
        <PuckRenderer data={homePage.content} />
      ) : (
        <div className="max-w-content mx-auto px-6 py-24 text-center text-charcoal/40">
          Homepage content not found — run the homepage seed SQL, or edit
          this page in /admin/pages.
        </div>
      )}

      {/* Live data — always pulls current Services, not part of the
          editable canvas since it's already editable via /admin/services */}
      <section className="max-w-content mx-auto px-6 lg:px-8 py-20">
        <Reveal>
          <span className="eyebrow">What we offer</span>
          <h2 className="font-display text-3xl md:text-4xl mt-2 max-w-xl">
            Explore flowork office spaces in Dubai
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {svcList.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <ServiceCard
                href={`/services/${s.slug}`}
                image={s.hero_image_url}
                title={s.name}
                description={s.tagline}
                perks={s.perks}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative bg-charcoal text-cream py-24 overflow-hidden">
        <div className="max-w-content mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="eyebrow text-sage-300">Dubai Hills exclusive</span>
            <h2 className="font-display text-3xl md:text-4xl mt-2">Podcast Room</h2>
            <p className="mt-4 text-cream/70 max-w-md">
              Dubai&rsquo;s first podcast room in Dubai Hills offers unmatched
              service quality, empowering podcasters with top-tier facilities
              for recording and content creation.
            </p>
            <Link
              href="/services/podcast-room"
              className="mt-6 inline-flex items-center rounded-full bg-sage-500 text-cream px-6 py-3 text-sm font-medium hover:bg-sage-600 transition-colors"
            >
              Enquire Now
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/flowork-Podcast-Room-2.jpg"
                alt="flowork podcast room"
                fill
                quality={90}
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-stretch">
        <Reveal className="relative rounded-2xl overflow-hidden min-h-[400px]">
          <Image
            src="/images/Reception-01-rd-1536x1182.jpg"
            alt="flowork reception"
            fill
            quality={90}
            className="object-cover"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <EnquiryForm />
        </Reveal>
      </section>

      {postList.length > 0 && (
        <section className="bg-sage-50 py-20">
          <div className="max-w-content mx-auto px-6 lg:px-8">
            <Reveal>
              <span className="eyebrow">From the blog</span>
              <h2 className="font-display text-3xl md:text-4xl mt-2">
                Insights &amp; inspiration
              </h2>
            </Reveal>
            <div className="mt-12">
              <BlogPreview posts={postList} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}