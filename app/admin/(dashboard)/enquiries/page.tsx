import { createClient } from "@/lib/supabase/server";
import EnquiriesTable from "@/components/admin/EnquiriesTable";
import type { Enquiry } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminEnquiries() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const enquiries = (data ?? []) as Enquiry[];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Enquiries</h1>
      <EnquiriesTable enquiries={enquiries} />
    </div>
  );
}