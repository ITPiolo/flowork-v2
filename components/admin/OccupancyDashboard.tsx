"use client";

import OccupancyImport from "@/components/admin/OccupancyImport";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FloorplanViewer from "@/components/admin/FloorplanViewer";
import UnitDetailPanel from "@/components/admin/UnitDetailPanel";
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
    setUnits((data ?? []) as OccupancyUnit[]);
    setLoading(false);
  }

  useEffect(() => {
    loadUnits();
    setSelectedUnit(null);
  }, [activeLocationId]);

  const counts = {
    occupied: units.filter((u) => computeStatus(u) === "occupied").length,
    expiring: units.filter((u) => computeStatus(u) === "expiring").length,
    vacant: units.filter((u) => computeStatus(u) === "vacant").length,
  };
  const occRate = units.length > 0 ? Math.round(((counts.occupied + counts.expiring) / units.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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
        {activeLocationId && <OccupancyImport locationId={activeLocationId} onImported={loadUnits} />}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total units" value={units.length} />
        <StatCard label="Occupied" value={counts.occupied} color="#e05c6e" />
        <StatCard label="Expiring soon" value={counts.expiring} color="#e8943a" />
        <StatCard label="Vacant" value={counts.vacant} color="#5ab88a" />
        <StatCard label="Occupancy rate" value={`${occRate}%`} highlight />
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