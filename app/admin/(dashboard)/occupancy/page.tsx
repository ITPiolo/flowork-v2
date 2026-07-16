import OccupancyDashboard from "@/components/admin/OccupancyDashboard";
import { createClient } from "@/lib/supabase/server";
import type { Location } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function OccupancyPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("locations").select("*").order("display_order");
  const locations = (data ?? []) as Location[];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Occupancy</h1>
      <OccupancyDashboard locations={locations} />
    </div>
  );
}