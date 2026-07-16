import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Location } from "@/lib/supabase/types";

// Public, safe-to-scan page for a single unit's QR code. Reads from the
// `public_unit_info` database view (not the real occupancy_units table),
// which deliberately excludes company name, actual rent, contract dates,
// and comments — those columns don't even exist in this view, so there's
// no way for this page (or anyone querying the API directly) to expose them.

type PublicUnitInfo = {
  id: string;
  location_id: string;
  unit_code: string;
  category: string;
  workstations_total: number | null;
  size_sqm: number | null;
  size_sqft: number | null;
  view_description: string | null;
  listed_price: number | null;
  status: "occupied" | "expiring" | "vacant";
};

export default async function PublicUnitPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  const supabase = await createClient();

  const { data: unitData } = await supabase
    .from("public_unit_info")
    .select("*")
    .eq("id", unitId)
    .single();

  if (!unitData) notFound();
  const unit = unitData as PublicUnitInfo;

  const { data: locationData } = await supabase
    .from("locations")
    .select("*")
    .eq("id", unit.location_id)
    .single();
  const location = locationData as Location | null;

  const isAvailable = unit.status === "vacant";

  return (
    <section className="max-w-md mx-auto px-6 py-16 text-center">
      <span className="eyebrow">{location?.name}</span>
      <h1 className="font-display text-4xl mt-2">Unit {unit.unit_code}</h1>

      <div
        className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium ${
          isAvailable ? "bg-sage-100 text-sage-700" : "bg-charcoal/10 text-charcoal/60"
        }`}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: isAvailable ? "#5ab88a" : "#e05c6e" }}
        />
        {isAvailable ? "Available now" : "Currently occupied"}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 text-left">
        <Fact label="Type" value={unit.category} />
        <Fact label="Workstations" value={unit.workstations_total ? String(unit.workstations_total) : "—"} />
        <Fact label="Size" value={unit.size_sqm ? `${unit.size_sqm} sqm` : "—"} />
        <Fact label="View" value={unit.view_description || "—"} />
      </div>

      <a
        href="/#enquire"
        className="mt-8 inline-flex items-center rounded-full bg-sage-500 text-cream px-7 py-3.5 text-sm font-medium hover:bg-sage-600 transition-colors"
      >
        Enquire about this space
      </a>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-charcoal/40 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-charcoal/80 mt-0.5">{value}</p>
    </div>
  );
}