import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LocationForm from "@/components/admin/LocationForm";
import type { Location } from "@/lib/supabase/types";

export default async function EditLocation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("locations").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Edit location</h1>
      <LocationForm location={data as Location} />
    </div>
  );
}
