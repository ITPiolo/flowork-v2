"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Enquiry } from "@/lib/supabase/types";

export default function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const [status, setStatus] = useState(enquiry.status);

  async function updateStatus(next: Enquiry["status"]) {
    setStatus(next);
    const supabase = createClient();
    await supabase.from("enquiries").update({ status: next }).eq("id", enquiry.id);
  }

  return (
    <tr className="border-t border-charcoal/5">
      <td className="px-4 py-3">{enquiry.full_name}</td>
      <td className="px-4 py-3">{enquiry.service}</td>
      <td className="px-4 py-3">{enquiry.location}</td>
      <td className="px-4 py-3">
        <div>{enquiry.email}</div>
        <div className="text-charcoal/50">{enquiry.phone}</div>
      </td>
      <td className="px-4 py-3 text-charcoal/50">
        {new Date(enquiry.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value as Enquiry["status"])}
          className="rounded-full border border-charcoal/15 text-xs px-2 py-1 bg-transparent"
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </td>
    </tr>
  );
}
