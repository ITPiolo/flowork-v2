"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Download } from "lucide-react";
import type { Enquiry } from "@/lib/supabase/types";

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

const STAGE_FILTERS = ["all", "new", "contacted", "proposal_sent", "won", "lost"];

export default function EnquiriesTable({ enquiries }: { enquiries: Enquiry[] }) {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      const matchesQuery =
        query.trim() === "" ||
        [e.full_name, e.email, e.phone, e.service, e.location, e.company_name]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(query.toLowerCase()));
      const matchesStage = stageFilter === "all" || e.status === stageFilter;
      const created = new Date(e.created_at);
      const matchesFrom = !dateFrom || created >= new Date(dateFrom);
      const matchesTo = !dateTo || created <= new Date(dateTo + "T23:59:59");
      return matchesQuery && matchesStage && matchesFrom && matchesTo;
    });
  }, [enquiries, query, stageFilter, dateFrom, dateTo]);

  function exportCsv() {
    const headers = ["Name", "Email", "Phone", "Company", "Service", "Location", "People", "Stage", "Source", "Received"];
    const rows = filtered.map((e) => [
      e.full_name,
      e.email,
      e.phone,
      e.company_name || "",
      e.service,
      e.location,
      e.people_count,
      STAGE_LABELS[e.status] || e.status,
      e.source || "website",
      new Date(e.created_at).toLocaleString(),
    ]);

    const escapeCell = (cell: string) => `"${String(cell).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flowork-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, phone, service..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-charcoal/15 rounded-lg"
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="text-sm border border-charcoal/15 rounded-lg px-3 py-2"
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="text-sm border border-charcoal/15 rounded-lg px-3 py-2"
          title="To date"
        />
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 text-sm border border-charcoal/15 rounded-lg px-3 py-2 hover:bg-sage-50"
        >
          <Download size={15} />
          Export CSV
        </button>
        <div className="flex gap-1 flex-wrap">
          {STAGE_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                stageFilter === s
                  ? "bg-sage-500 text-cream"
                  : "bg-charcoal/5 text-charcoal/50 hover:bg-charcoal/10"
              }`}
            >
              {s === "all" ? "All" : STAGE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-charcoal/40 mb-3">
        Showing {filtered.length} of {enquiries.length}
      </p>

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
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-charcoal/5 hover:bg-sage-50/50">
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-charcoal/40">
                  No enquiries match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}