import type { OccupancyUnit } from "@/lib/supabase/types";

// Matches the exact business rule from the original signin.flowork.ae
// system: status is never manually set to "Expiring" — it's computed
// live whenever the renewal date falls within the next 60 days.
export function computeStatus(unit: OccupancyUnit): "occupied" | "expiring" | "vacant" {
  if (unit.manual_status === "vacant") return "vacant";

  if (unit.renewal_date) {
    const days = daysUntil(unit.renewal_date);
    if (days !== null && days >= 0 && days <= 60) return "expiring";
  }

  return unit.manual_status;
}

function daysUntil(dateStr: string): number | null {
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const STATUS_COLORS: Record<string, string> = {
  occupied: "#e05c6e",
  expiring: "#e8943a",
  vacant: "#5ab88a",
};

export const STATUS_LABELS: Record<string, string> = {
  occupied: "Occupied",
  expiring: "Expiring Soon",
  vacant: "Vacant",
};