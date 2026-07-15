import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Enquiry } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STAGE_STYLES: Record<string, string> = {
  new: "bg-charcoal/10 text-charcoal/70",
  contacted: "bg-blue-100 text-blue-700",
  proposal_sent: "bg-amber-100 text-amber-700",
  won: "bg-sage-100 text-sage-700",
  lost: "bg-red-100 text-red-700",
};

const STAGE_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

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
              <th className="px-4 py-3">Stage</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <tr
                key={e.id}
                className="border-t border-charcoal/5 hover:bg-sage-50/50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link href={`/admin/enquiries/${e.id}`} className="block">
                    {e.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{e.service}</td>
                <td className="px-4 py-3">{e.location}</td>
                <td className="px-4 py-3">
                  <div>{e.email}</div>
                  <div className="text-charcoal/50">{e.phone}</div>
                </td>
                <td className="px-4 py-3 text-charcoal/50">
                  {new Date(e.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STAGE_STYLES[e.status] || STAGE_STYLES.new}`}>
                    {STAGE_LABELS[e.status] || e.status}
                  </span>
                </td>
              </tr>
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