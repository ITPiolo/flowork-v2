import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeStatus } from "@/lib/occupancyStatus";
import type { OccupancyUnit } from "@/lib/supabase/types";

// Records one row per location per day with current occupied/expiring/
// month-to-month counts, so the admin analytics dashboard can chart
// occupancy trends over time — otherwise there's no history, only a
// live snapshot. Intended to run daily via Vercel Cron (see
// vercel.json), same CRON_SECRET pattern as /api/check-renewals.

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: locations } = await supabase.from("locations").select("id");
  const today = new Date().toISOString().slice(0, 10);

  let written = 0;
  for (const loc of locations ?? []) {
    const { data: units } = await supabase
      .from("occupancy_units")
      .select("*")
      .eq("location_id", (loc as any).id);

    const list = (units ?? []) as OccupancyUnit[];
    const counts = {
      occupied: list.filter((u) => computeStatus(u) === "occupied").length,
      expiring: list.filter((u) => computeStatus(u) === "expiring").length,
      month_to_month: list.filter((u) => computeStatus(u) === "month_to_month").length,
    };

    const { error } = await supabase
      .from("occupancy_snapshots")
      .upsert(
        {
          location_id: (loc as any).id,
          snapshot_date: today,
          total_units: list.length,
          occupied_count: counts.occupied,
          expiring_count: counts.expiring,
          month_to_month_count: counts.month_to_month,
        } as never,
        { onConflict: "location_id,snapshot_date" }
      );

    if (!error) written++;
  }

  return NextResponse.json({ ok: true, written });
}
