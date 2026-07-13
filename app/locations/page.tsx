import Image from "next/image";
import Link from "next/link";
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
            </Link>
          </Reveal>
        ))}
        {locations.length === 0 && (
          <p className="text-charcoal/40">No locations published yet.</p>
        )}
      </div>
    </section>
  );
}
