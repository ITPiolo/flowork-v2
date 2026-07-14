import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ServiceForm from "@/components/admin/ServiceForm";
import type { Service } from "@/lib/supabase/types";

export default async function EditService({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Edit service</h1>
      <ServiceForm service={data as Service} />
    </div>
  );
}
