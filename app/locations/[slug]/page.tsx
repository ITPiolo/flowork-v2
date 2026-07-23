import { notFound } from "next/navigation";
import Image from "next/image";
import { Wifi, Printer, ShieldCheck, Coffee, Users, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";
import EnquiryForm from "@/components/EnquiryForm";
import Gallery from "@/components/Gallery";
import type { Location } from "@/lib/supabase/types";

export const revalidate = 60;

const AMENITIES = [
  { icon: Wifi, label: "High-speed Wi-Fi" },
  { icon: Printer, label: "Printing & IT support" },
  { icon: ShieldCheck, label: "Secure 24/7 access" },
  { icon: Coffee, label: "Refreshments & lounge" },
  { icon: Users, label: "Reception & concierge" },
  { icon: Building2, label: "Meeting & boardrooms" },
];

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
          <div className="rounded-2xl bg-sage-500 p-3 sm:p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {stats.map((s) => (
                <AnimatedStat key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="max-w-content mx-auto px-6 lg:px-8 pt-16">
        <Reveal>
          <span className="eyebrow">Amenities</span>
          <h2 className="font-display text-3xl mt-2 mb-8">Everything included at {location.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-charcoal/10 px-4 py-4">
                <span className="h-10 w-10 rounded-full bg-sage-50 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-sage-600" />
                </span>
                <span className="text-sm text-charcoal/75">{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {slug === "dubai-hills" && (
        <section className="max-w-content mx-auto px-6 lg:px-8 pt-16">
          <Reveal>
            <span className="eyebrow">Neighborhood</span>
            <h2 className="font-display text-3xl mt-2 mb-4">More than an office address</h2>
            <p className="text-charcoal/70 max-w-2xl leading-relaxed">
              Set within Dubai Hills Estate, flowork puts you in one of Dubai's
              most complete master communities — bicycle routes, a
              championship golf course, community pools, landscaped
              walkways, parks and open spaces, play areas, schools, and Dubai
              Hills Mall are all part of the neighborhood. After a meeting,
              you're steps from restaurants serving alcohol for a relaxed
              catch-up with clients or your team.
            </p>
          </Reveal>
        </section>
      )}

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

      {location.gallery_images && location.gallery_images.length > 0 && (
        <section className="max-w-content mx-auto px-6 lg:px-8 pb-20">
          <Reveal>
            <span className="eyebrow">Gallery</span>
            <h2 className="font-display text-3xl mt-2 mb-8">More of {location.name}</h2>
          </Reveal>
          <Gallery images={location.gallery_images} title={location.name} />
        </section>
      )}

      <section className="max-w-content mx-auto px-6 lg:px-8 pb-20 max-w-2xl">
        <Reveal>
          <EnquiryForm defaultLocation={location.name} ctaLabel="Enquire Now" />
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