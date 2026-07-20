"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { computeStatus, STATUS_COLORS, STATUS_LABELS } from "@/lib/occupancyStatus";
import type { Location, OccupancyUnit } from "@/lib/supabase/types";

export default function FloorplanViewer({
  location,
  units,
  onUnitClick,
}: {
  location: Location;
  units: OccupancyUnit[];
  onUnitClick: (unit: OccupancyUnit) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "occupied" | "expiring" | "month_to_month">("all");

  if (!location.floorplan_image_url || !location.floorplan_width || !location.floorplan_height) {
    return (
      <div className="rounded-xl border border-dashed border-charcoal/20 p-12 text-center">
        <p className="text-sm text-charcoal/50">
          No floor plan image set for {location.name} yet. Add one in the
          location&rsquo;s admin page.
        </p>
      </div>
    );
  }

  const aspectRatio = location.floorplan_width / location.floorplan_height;

  const counts = {
    occupied: units.filter((u) => computeStatus(u) === "occupied").length,
    expiring: units.filter((u) => computeStatus(u) === "expiring").length,
    month_to_month: units.filter((u) => computeStatus(u) === "month_to_month").length,
  };

  const visibleUnits = filter === "all" ? units : units.filter((u) => computeStatus(u) === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {(["all", "occupied", "expiring", "month_to_month"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
              filter === f ? "border-charcoal bg-charcoal text-cream" : "border-charcoal/15 text-charcoal/60 hover:bg-charcoal/5"
            }`}
          >
            {f !== "all" && (
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: STATUS_COLORS[f] }}
              />
            )}
            {f === "all" ? `All (${units.length})` : `${STATUS_LABELS[f]} (${counts[f as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border border-charcoal/10 bg-charcoal/5"
        style={{ aspectRatio }}
      >
        <Image
          src={location.floorplan_image_url}
          alt={`${location.name} floor plan`}
          fill
          className="object-contain"
          priority
        />

        {visibleUnits.map((unit) => {
          const status = computeStatus(unit);
          const isHovered = hoveredId === unit.id;
          return (
            <button
              key={unit.id}
              onClick={() => onUnitClick(unit)}
              onMouseEnter={() => setHoveredId(unit.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="absolute transition-opacity"
              style={{
                left: `${unit.hotspot_x}%`,
                top: `${unit.hotspot_y}%`,
                width: `${unit.hotspot_w}%`,
                height: `${unit.hotspot_h}%`,
                background: STATUS_COLORS[status],
                opacity: isHovered ? 0.85 : 0.55,
                borderRadius: 3,
                cursor: "pointer",
              }}
              title={`Unit ${unit.unit_code}${unit.company_name ? " — " + unit.company_name : ""}`}
            />
          );
        })}
      </div>

      <p className="text-xs text-charcoal/40 mt-3">
        {units.length} units total &middot; Click any unit to view or edit details.
      </p>
    </div>
  );
}