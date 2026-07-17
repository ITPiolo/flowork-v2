"use client";

import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";

type Subscriber = { id: string; email: string; created_at: string };

export default function NewsletterTable({ subscribers }: { subscribers: Subscriber[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(query.toLowerCase()));
  }, [subscribers, query]);

  function exportCsv() {
    const rows = filtered.map((s) => [s.email, new Date(s.created_at).toLocaleDateString()]);
    const csv = [["Email", "Subscribed"], ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flowork-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
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
            placeholder="Search email..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-charcoal/15 rounded-lg"
          />
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 text-sm border border-charcoal/15 rounded-lg px-3 py-2 hover:bg-sage-50"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      <p className="text-xs text-charcoal/40 mb-3">
        {filtered.length} of {subscribers.length} subscribers
      </p>

      <div className="bg-white rounded-xl border border-charcoal/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sage-50 text-left text-xs uppercase text-charcoal/50">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-charcoal/5">
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 text-charcoal/50">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-charcoal/40">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}