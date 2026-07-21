"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FloorplanViewer from "@/components/admin/FloorplanViewer";
import UnitDetailPanel from "@/components/admin/UnitDetailPanel";
import OccupancyImport from "@/components/admin/OccupancyImport";
import ShareLinkManager from "@/components/admin/ShareLinkManager";
import { computeStatus } from "@/lib/occupancyStatus";
import type { Location, OccupancyUnit } from "@/lib/supabase/types";

export default function OccupancyDashboard({ locations }: { locations: Location[] }) {
  const [activeLocationId, setActiveLocationId] = useState(locations[0]?.id ?? "");
  const [units, setUnits] = useState<OccupancyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<OccupancyUnit | null>(null);

  const activeLocation = locations.find((l) => l.id === activeLocationId);

  async function loadUnits() {
    if (!activeLocationId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("occupancy_units")
      .select("*")
      .eq("location_id", activeLocationId)
      .order("unit_code");
    const freshUnits = (data ?? []) as OccupancyUnit[];
    setUnits(freshUnits);
    setLoading(false);

    // Keep the open detail panel in sync with what was just saved —
    // otherwise it keeps showing stale data even though the save
    // succeeded, making edits look like they silently failed.
    setSelectedUnit((prev) => {
      if (!prev) return prev;
      return freshUnits.find((u) => u.id === prev.id) ?? prev;
    });
  }

  useEffect(() => {
    loadUnits();
    setSelectedUnit(null);
  }, [activeLocationId]);

  const counts = {
    occupied: units.filter((u) => computeStatus(u) === "occupied").length,
    expiring: units.filter((u) => computeStatus(u) === "expiring").length,
    month_to_month: units.filter((u) => computeStatus(u) === "month_to_month").length,
  };
  const occRate = units.length > 0 ? Math.round(((counts.occupied + counts.month_to_month) / units.length) * 100) : 0;

  // Units expiring soon that are still actually occupied (not vacant) —
  // these are the ones worth a proactive call, unlike vacant units which
  // are just available.
  const expiringSoon = units
    .filter((u) => computeStatus(u) === "expiring" && u.manual_status === "occupied" && u.end_date)
    .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex gap-2">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setActiveLocationId(loc.id)}
              className={`text-sm px-4 py-2 rounded-full font-medium ${
                activeLocationId === loc.id ? "bg-charcoal text-cream" : "bg-white border border-charcoal/10 text-charcoal/60"
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>

        {activeLocationId && (
          <div className="flex items-center gap-2">
            <ShareLinkManager locationId={activeLocationId} />
            <OccupancyImport
              locationId={activeLocationId}
              units={units}
              onImported={loadUnits}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total units" value={units.length} />
        <StatCard label="Occupied" value={counts.occupied} color="#3B82F6" />
        <StatCard label="Expiring" value={counts.expiring} color="#5ab88a" />
        <StatCard label="Month-to-Month" value={counts.month_to_month} color="#e8943a" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 rounded-xl bg-sage-500 text-cream p-4 flex items-center">
          <div>
            <p className="text-2xl font-display">{occRate}%</p>
            <p className="text-xs opacity-80 mt-1">Occupancy rate</p>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-charcoal/10 p-4">
          <p className="text-xs font-medium text-charcoal/70 mb-2">Expiring soon</p>
          {expiringSoon.length === 0 ? (
            <p className="text-xs text-charcoal/40">Nothing expiring in the next 2 months.</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {expiringSoon.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-xs">
                  <span className="text-charcoal/80 truncate pr-2">
                    Unit {u.unit_code} — {u.company_name || "—"}
                  </span>
                  <span className="text-charcoal/50 shrink-0">
                    {new Date(u.end_date!).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal/40">Loading floor plan...</p>
      ) : activeLocation ? (
        <FloorplanViewer
          location={activeLocation}
          units={units}
          onUnitClick={setSelectedUnit}
        />
      ) : (
        <p className="text-sm text-charcoal/40">No location selected.</p>
      )}

      {selectedUnit && (
        <UnitDetailPanel
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
          onUpdated={loadUnits}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: string | number;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? "bg-sage-500 text-cream" : "bg-white border border-charcoal/10"}`}>
      <div className="flex items-center gap-2">
        {color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
        <p className="text-2xl font-display">{value}</p>
      </div>
      <p className={`text-xs mt-1 ${highlight ? "opacity-80" : "text-charcoal/50"}`}>{label}</p>
    </div>
  );
}