import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PricingForm from "@/components/admin/PricingForm";
import type { PricingPackage } from "@/lib/supabase/types";

export default async function EditPricing({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("pricing_packages").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Edit package</h1>
      <PricingForm pkg={data as PricingPackage} />
    </div>
  );
}
