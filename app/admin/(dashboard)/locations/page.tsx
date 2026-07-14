import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Location } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminLocations() {
  const supabase = await createClient();
  const { data } = await supabase.from("locations").select("*").order("display_order");
  const locations = (data ?? []) as Location[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Locations</h1>
        <Link
          href="/admin/locations/new"
          className="rounded-full bg-sage-500 text-cream px-4 py-2 text-sm font-medium"
        >
          + Add location
        </Link>
      </div>
      <div className="grid gap-4">
        {locations.map((l) => (
          <Link
            key={l.id}
            href={`/admin/locations/${l.id}`}
            className="flex items-center justify-between bg-white rounded-xl border border-charcoal/10 p-4 hover:border-sage-300"
          >
            <div>
              <p className="font-medium">{l.name}</p>
              <p className="text-xs text-charcoal/50">/{l.slug}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                l.published ? "bg-sage-100 text-sage-700" : "bg-charcoal/10 text-charcoal/50"
              }`}
            >
              {l.published ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
