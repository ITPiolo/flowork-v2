import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PuckEditor from "@/components/admin/PuckEditor";
import type { CustomPage } from "@/lib/supabase/types";

export default async function EditCustomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("custom_pages").select("*").eq("id", id).single();

  if (!data) notFound();

  return <PuckEditor page={data as CustomPage} />;
}