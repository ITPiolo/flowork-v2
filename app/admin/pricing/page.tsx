import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PricingPackage } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminPricing() {
  const supabase = await createClient();
  const { data } = await supabase.from("pricing_packages").select("*").order("display_order");
  const packages = (data ?? []) as PricingPackage[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Ejari Pricing</h1>
        <Link
          href="/admin/pricing/new"
          className="rounded-full bg-sage-500 text-cream px-4 py-2 text-sm font-medium"
        >
          + Add package
        </Link>
      </div>
      <div className="grid gap-4">
        {packages.map((p) => (
          <Link
            key={p.id}
            href={`/admin/pricing/${p.id}`}
            className="flex items-center justify-between bg-white rounded-xl border border-charcoal/10 p-4 hover:border-sage-300"
          >
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-charcoal/60">AED {p.price_aed.toLocaleString()} / yr</p>
          </Link>
        ))}
        {packages.length === 0 && (
          <p className="text-sm text-charcoal/40">No packages yet.</p>
        )}
      </div>
    </div>
  );
}
