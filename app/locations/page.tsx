import Image from "next/image";
import Link from "next/link";
import { Briefcase, Users, DoorOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";
import type { Location } from "@/lib/supabase/types";

export const revalidate = 60;

export default async function LocationsIndex() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .order("display_order");
  const locations = (data ?? []) as Location[];

  return (
    <>
      <section className="max-w-content mx-auto px-6 lg:px-8 py-16">
        <Reveal>
          <span className="eyebrow">Where we are</span>
          <h1 className="font-display text-4xl md:text-5xl mt-2 max-w-xl">
            flowork locations in Dubai
          </h1>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {locations.map((loc, i) => (
            <Reveal key={loc.id} delay={i * 0.1}>
              <Link href={`/locations/${loc.slug}`} className="group block">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src={loc.hero_image_url}
                    alt={loc.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h2 className="mt-4 font-display text-2xl">{loc.name}</h2>
                <p className="mt-1 text-sm text-charcoal/60">{loc.tagline}</p>
                <p className="mt-1 text-xs text-charcoal/40">{loc.address}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {loc.offices_count && (
                    <span className="inline-flex items-center gap-1.5 text-xs rounded-full border border-charcoal/10 px-3 py-1.5 text-charcoal/70">
                      <Briefcase size={13} className="text-sage-500" />
                      {loc.offices_count} offices
                    </span>
                  )}
                  {loc.coworking_count && (
                    <span className="inline-flex items-center gap-1.5 text-xs rounded-full border border-charcoal/10 px-3 py-1.5 text-charcoal/70">
                      <Users size={13} className="text-sage-500" />
                      {loc.coworking_count} coworking
                    </span>
                  )}
                  {loc.meeting_rooms_count && (
                    <span className="inline-flex items-center gap-1.5 text-xs rounded-full border border-charcoal/10 px-3 py-1.5 text-charcoal/70">
                      <DoorOpen size={13} className="text-sage-500" />
                      {loc.meeting_rooms_count} meeting rooms
                    </span>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
          {locations.length === 0 && (
            <p className="text-charcoal/40">No locations published yet.</p>
          )}
        </div>
      </section>

      <section className="bg-charcoal text-cream">
        <div className="max-w-content mx-auto px-6 lg:px-8 py-16 text-center">
          <Reveal>
            <h2 className="font-display text-2xl md:text-3xl max-w-lg mx-auto">
              Not sure which location fits your team?
            </h2>
            <p className="mt-3 text-cream/60 max-w-md mx-auto">
              Book a tour and see both spaces in person before you decide.
            </p>
            <Link
              href="/contact"
              className="inline-block mt-6 rounded-full bg-sage-500 text-cream px-6 py-3 text-sm font-medium hover:bg-sage-600 transition-colors"
            >
              Book a tour
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
