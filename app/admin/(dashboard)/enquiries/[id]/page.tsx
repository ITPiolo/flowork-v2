import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LeadDetail from "@/components/admin/LeadDetail";
import type { Enquiry, EnquiryNote } from "@/lib/supabase/types";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: enquiry }, { data: notes }] = await Promise.all([
    supabase.from("enquiries").select("*").eq("id", id).single(),
    supabase
      .from("enquiry_notes")
      .select("*")
      .eq("enquiry_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!enquiry) notFound();

  return (
    <div>
      <Link href="/admin/enquiries" className="text-sm text-sage-600 hover:underline">
        &larr; Back to enquiries
      </Link>
      <div className="mt-4">
        <LeadDetail enquiry={enquiry as Enquiry} initialNotes={(notes ?? []) as EnquiryNote[]} />
      </div>
    </div>
  );
}