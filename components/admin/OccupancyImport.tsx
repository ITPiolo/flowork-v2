"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/client";
import { Download, Upload, X } from "lucide-react";

const TEMPLATE_HEADERS = [
  "unit_code", "category", "status", "company_name", "activity",
  "view_description", "workstations_total", "workstations_occupied",
  "size_sqm", "size_sqft", "listed_price", "listed_ws_price",
  "actual_rent", "monthly_ws_rate", "security_deposit", "one_time_fee",
  "start_date", "end_date", "renewal_date", "comments",
];

const EXAMPLE_ROW = [
  "1", "", "occupied", "Example Trading LLC", "Consulting",
  "", "", "5", "", "", "", "",
  "13750", "2750", "27500", "0",
  "2026-01-15", "2026-12-31", "2026-11-01", "Renewed early",
];

export default function OccupancyImport({
  locationId,
  onImported,
}: {
  locationId: string;
  onImported: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ matched: number; notFound: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const csv = Papa.unparse({
      fields: TEMPLATE_HEADERS,
      data: [EXAMPLE_ROW],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flowork-occupancy-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(file: File) {
    setImporting(true);
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as Record<string, string>[];
        const supabase = createClient();
        let matched = 0;
        const notFound: string[] = [];

        for (const row of rows) {
          if (!row.unit_code) continue;

          const payload: Record<string, unknown> = {};
          if (row.category) payload.category = row.category;
          if (row.status) payload.manual_status = row.status.toLowerCase() === "occupied" ? "occupied" : "vacant";
          if (row.company_name) payload.company_name = row.company_name;
          if (row.activity) payload.activity = row.activity;
          if (row.view_description) payload.view_description = row.view_description;
          if (row.workstations_total) payload.workstations_total = Number(row.workstations_total);
          if (row.workstations_occupied) payload.workstations_occupied = Number(row.workstations_occupied);
          if (row.size_sqm) payload.size_sqm = Number(row.size_sqm);
          if (row.size_sqft) payload.size_sqft = Number(row.size_sqft);
          if (row.listed_price) payload.listed_price = Number(row.listed_price);
          if (row.listed_ws_price) payload.listed_ws_price = Number(row.listed_ws_price);
          if (row.actual_rent) payload.actual_rent = Number(row.actual_rent);
          if (row.monthly_ws_rate) payload.monthly_ws_rate = Number(row.monthly_ws_rate);
          if (row.security_deposit) payload.security_deposit = Number(row.security_deposit);
          if (row.one_time_fee) payload.one_time_fee = Number(row.one_time_fee);
          if (row.start_date) payload.start_date = row.start_date;
          if (row.end_date) payload.end_date = row.end_date;
          if (row.renewal_date) payload.renewal_date = row.renewal_date;
          if (row.comments) payload.comments = row.comments;

          const { data, error } = await supabase
            .from("occupancy_units")
            .update(payload as never)
            .eq("location_id", locationId)
            .eq("unit_code", row.unit_code)
            .select();

          if (error || !data || data.length === 0) {
            notFound.push(row.unit_code);
          } else {
            matched++;
          }
        }

        setResult({ matched, notFound });
        setImporting(false);
        onImported();
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      error: () => {
        setImporting(false);
      },
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm border border-charcoal/15 rounded-lg px-3 py-2 hover:bg-sage-50"
      >
        <Upload size={15} />
        Import
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] bg-charcoal/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">Import occupancy data</h2>
              <button onClick={() => setOpen(false)}><X size={20} /></button>
            </div>

            <p className="text-sm text-charcoal/60 mb-4">
              Updates existing units by matching <code className="bg-charcoal/5 px-1 rounded">unit_code</code> —
              it won&rsquo;t create new hotspot positions. Room specs
              (category, size, workstation count, standard price) are
              already filled in for every unit — you only need to fill in
              tenant-specific columns (company, dates, actual rent) when a
              unit becomes occupied. Leave other columns blank to keep the
              existing values unchanged.
            </p>

            <button
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-charcoal/15 py-2.5 text-sm font-medium mb-3 hover:bg-sage-50"
            >
              <Download size={16} />
              Download CSV template
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-sage-500 text-cream py-2.5 text-sm font-medium disabled:opacity-60"
            >
              <Upload size={16} />
              {importing ? "Importing..." : "Upload filled CSV"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {result && (
              <div className="mt-4 text-sm">
                <p className="text-sage-600">{result.matched} unit(s) updated successfully.</p>
                {result.notFound.length > 0 && (
                  <p className="text-red-600 mt-1">
                    Not found (check unit_code matches exactly): {result.notFound.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}