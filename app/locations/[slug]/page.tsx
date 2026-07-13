import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";
import EnquiryForm from "@/components/EnquiryForm";
import type { Location } from "@/lib/supabase/types";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return {};
  const location = data as Location;
  return {
    title: location.name,
    description: location.tagline,
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) notFound();
  const location = data as Location;

  const stats = [
    { value: location.offices_count, label: "Offices available" },
    { value: location.coworking_count, label: "Coworking Spaces" },
    { value: location.meeting_rooms_count, label: "Meeting Rooms" },
    { value: location.phone_booths_count, label: "Phone Booths" },
    { value: location.podcast_rooms_count, label: "Podcast Room" },
  ];

  return (
    <>
      <section className="max-w-content mx-auto px-6 lg:px-8 pt-16 pb-8 text-center">
        <Reveal>
          <h1 className="font-display text-5xl md:text-6xl">
            {location.name.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-sage-500 italic">
              {location.name.split(" ").slice(-1)}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-charcoal/70">
            {location.description}
          </p>
        </Reveal>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8">
        <Reveal>
          <div className="rounded-2xl bg-sage-500 grid grid-cols-2 md:grid-cols-5 divide-x divide-cream/20">
            {stats.map((s) => (
              <div key={s.label} className="py-8">
                <AnimatedStat value={s.value} label={s.label} />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8 py-20">
        <Reveal>
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
            <Image
              src={location.hero_image_url}
              alt={location.name}
              fill
              quality={95}
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8 pb-20">
        <Reveal>
          <div className="rounded-2xl bg-sage-50 p-8 md:p-12 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl mb-6 text-center">
              Let us find your ideal workspace
            </h2>
            <EnquiryForm defaultLocation={location.name} ctaLabel="Enquire Now" />
          </div>
        </Reveal>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8 pb-20">
        <Reveal>
          <div className="rounded-2xl overflow-hidden aspect-[21/9] bg-charcoal/5">
            <iframe
              title={`Map of ${location.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                location.address
              )}&t=m&z=14&output=embed`}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}