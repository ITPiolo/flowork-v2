import { createClient } from "@/lib/supabase/server";
import EnquiryRow from "@/components/admin/EnquiryRow";
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
      <div className="bg-white rounded-xl border border-charcoal/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sage-50 text-left text-xs uppercase text-charcoal/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <EnquiryRow key={e.id} enquiry={e} />
            ))}
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-charcoal/40">
                  No enquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
