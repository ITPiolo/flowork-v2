import { createClient } from "@/lib/supabase/server";
import OccupancyTrendChart from "@/components/admin/OccupancyTrendChart";
import type { Location, OccupancySnapshot } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: locationsData } = await supabase.from("locations").select("*").order("display_order");
  const locations = (locationsData ?? []) as Location[];

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: snapshotsData } = await supabase
    .from("occupancy_snapshots")
    .select("*")
    .gte("snapshot_date", ninetyDaysAgo.toISOString().slice(0, 10))
    .order("snapshot_date");
  const snapshots = (snapshotsData ?? []) as OccupancySnapshot[];

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">Analytics</h1>
      <p className="text-sm text-charcoal/50 mb-6">
        Occupancy trend over the last 90 days, recorded automatically once a day.
      </p>

      {locations.map((loc) => {
        const locSnapshots = snapshots.filter((s) => s.location_id === loc.id);
        return (
          <div key={loc.id} className="mb-8 rounded-xl bg-white border border-charcoal/10 p-5">
            <h2 className="font-display text-lg mb-4">{loc.name}</h2>
            <OccupancyTrendChart snapshots={locSnapshots} />
          </div>
        );
      })}

      {locations.length === 0 && <p className="text-sm text-charcoal/40">No locations yet.</p>}
    </div>
  );
}
