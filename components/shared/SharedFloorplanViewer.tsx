"use client";

import { useState } from "react";
import Image from "next/image";
import { computeStatus, STATUS_COLORS, STATUS_LABELS } from "@/lib/occupancyStatus";

type SharedUnit = {
  id: string;
  unit_code: string;
  category: string;
  manual_status: "occupied" | "vacant";
  lease_type: "fixed" | "month_to_month";
  company_name: string | null;
  end_date: string | null;
  workstations_total: number | null;
  size_sqm: number | null;
  size_sqft: number | null;
  hotspot_x: number;
  hotspot_y: number;
  hotspot_w: number;
  hotspot_h: number;
};

type SharedLocation = {
  name: string;
  floorplan_image_url: string | null;
  floorplan_width: number | null;
  floorplan_height: number | null;
};

export default function SharedFloorplanViewer({
  location,
  units,
}: {
  location: SharedLocation;
  units: SharedUnit[];
}) {
  const [selected, setSelected] = useState<SharedUnit | null>(null);
  const [filter, setFilter] = useState<"all" | "occupied" | "expiring" | "month_to_month">("all");

  if (!location.floorplan_image_url || !location.floorplan_width || !location.floorplan_height) {
    return <p className="text-sm text-charcoal/50">No floor plan available for {location.name} yet.</p>;
  }

  const aspectRatio = location.floorplan_width / location.floorplan_height;
  const counts = {
    occupied: units.filter((u) => computeStatus(u as never) === "occupied").length,
    expiring: units.filter((u) => computeStatus(u as never) === "expiring").length,
    month_to_month: units.filter((u) => computeStatus(u as never) === "month_to_month").length,
  };
  const visibleUnits = filter === "all" ? units : units.filter((u) => computeStatus(u as never) === filter);

  const expiringSoon = units
    .filter((u) => computeStatus(u as never) === "expiring" && u.manual_status === "occupied" && u.end_date)
    .sort((a, b) => new Date(a.end_date!).getTime() - new Date(b.end_date!).getTime());

  return (
    <div>
      <h1 className="font-display text-2xl mb-4">{location.name} — Floor Plan</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        {(["all", "occupied", "expiring", "month_to_month"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
              filter === f ? "border-charcoal bg-charcoal text-cream" : "border-charcoal/15 text-charcoal/60 hover:bg-charcoal/5"
            }`}
          >
            {f !== "all" && <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[f] }} />}
            {f === "all" ? `All (${units.length})` : `${STATUS_LABELS[f]} (${counts[f as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      {expiringSoon.length > 0 && (
        <div className="rounded-xl bg-white border border-charcoal/10 p-4 mb-4">
          <p className="text-xs font-medium text-charcoal/70 mb-2">Expiring soon</p>
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
        </div>
      )}

      <div className="relative w-full rounded-xl overflow-hidden border border-charcoal/10 bg-charcoal/5" style={{ aspectRatio }}>
        <Image src={location.floorplan_image_url} alt={`${location.name} floor plan`} fill className="object-contain" priority />
        {visibleUnits.map((unit) => {
          const status = computeStatus(unit as never);
          return (
            <button
              key={unit.id}
              onClick={() => setSelected(unit)}
              className="absolute transition-opacity hover:opacity-90"
              style={{
                left: `${unit.hotspot_x}%`,
                top: `${unit.hotspot_y}%`,
                width: `${unit.hotspot_w}%`,
                height: `${unit.hotspot_h}%`,
                background: STATUS_COLORS[status],
                opacity: 0.6,
                borderRadius: 3,
                cursor: "pointer",
              }}
              title={`Unit ${unit.unit_code}${unit.company_name ? " — " + unit.company_name : ""}`}
            />
          );
        })}
      </div>

      <p className="text-xs text-charcoal/40 mt-3">{units.length} units total &middot; Click any unit for details.</p>

      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/40 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[computeStatus(selected as never)] }} />
              <p className="font-display text-lg">Unit {selected.unit_code}</p>
            </div>
            <p className="text-sm text-charcoal/70 mb-1">{STATUS_LABELS[computeStatus(selected as never)]}</p>
            {selected.company_name ? (
              <p className="text-sm text-charcoal/80 font-medium">{selected.company_name}</p>
            ) : null}
            <p className="text-sm text-charcoal/60">{selected.category}</p>
            {selected.workstations_total ? (
              <p className="text-sm text-charcoal/60">{selected.workstations_total} workstations</p>
            ) : null}
            {selected.size_sqm ? (
              <p className="text-sm text-charcoal/60">
                {selected.size_sqm} sqm ({selected.size_sqft ?? "—"} sqft)
              </p>
            ) : null}
            {selected.end_date ? (
              <p className="text-sm text-charcoal/60">Ends {new Date(selected.end_date).toLocaleDateString()}</p>
            ) : null}
            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full rounded-full border border-charcoal/20 py-2 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
