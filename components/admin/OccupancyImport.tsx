"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/client";
import { Download, Upload, X } from "lucide-react";
import type { OccupancyUnit } from "@/lib/supabase/types";

const TEMPLATE_HEADERS = [
  "unit_code", "category", "status", "company_name", "activity",
  "view_description", "workstations_total", "workstations_occupied",
  "size_sqm", "size_sqft", "listed_price", "listed_ws_price",
  "actual_rent", "monthly_ws_rate", "security_deposit", "one_time_fee",
  "start_date", "end_date", "renewal_date", "comments",
];

// Maps our internal field names to every real-world column header we've
// seen — both our own template AND the flowork team's natural
// spreadsheet format (Office No., Rental Company Name, etc). Add more
// aliases here any time a new spreadsheet format shows up.
const FIELD_ALIASES: Record<string, string[]> = {
  unit_code: ["unit_code", "Office No.", "Office No"],
  category: ["category", "Office Type"],
  view_description: ["view_description", "View"],
  workstations_total: ["workstations_total", "No. of WS"],
  workstations_occupied: ["workstations_occupied", "No. of WS Occupied"],
  size_sqm: ["size_sqm", "Size in Sq.mtr."],
  size_sqft: ["size_sqft", "Size in Sq.ft."],
  company_name: ["company_name", "Rental Company Name"],
  listed_price: ["listed_price", "List Price", "Budgeted Price"],
  listed_ws_price: ["listed_ws_price", "List WS Rate", "Budgeted WS Rate"],
  actual_rent: ["actual_rent", "Actual Monthly Rent (AED)"],
  monthly_ws_rate: ["monthly_ws_rate", "Monthly WS Rate"],
  security_deposit: ["security_deposit", "Security Deposit"],
  one_time_fee: ["one_time_fee"],
  start_date: ["start_date", "Start Date"],
  end_date: ["end_date", "End Date"],
  renewal_date: ["renewal_date", "Renewal Date"],
  comments: ["comments", "Comments"],
  activity: ["activity", "Activity"],
  status: ["status"], // only used if explicitly present
};

function getField(row: Record<string, string>, field: string): string {
  for (const alias of FIELD_ALIASES[field] || []) {
    if (row[alias] !== undefined && row[alias] !== "") return row[alias];
  }
  return "";
}

// Handles common date formats from Excel-exported CSVs (DD/MM/YYYY,
// MM/DD/YYYY, or already-ISO YYYY-MM-DD) and converts to the YYYY-MM-DD
// format Postgres expects.
function normalizeDate(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, a, b, year] = slashMatch;
    // Assume DD/MM/YYYY (UAE convention) unless the first number can't
    // possibly be a day (>12), in which case treat it as MM/DD/YYYY.
    const first = parseInt(a, 10);
    const second = parseInt(b, 10);
    const day = first > 12 ? first : second;
    const month = first > 12 ? second : first;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

export default function OccupancyImport({
  locationId,
  units,
  onImported,
}: {
  locationId: string;
  units: OccupancyUnit[];
  onImported: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ matched: number; notFound: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function downloadCurrentData() {
    const rows = units
      .slice()
      .sort((a, b) => Number(a.unit_code) - Number(b.unit_code))
      .map((u) => [
        u.unit_code, u.category ?? "", u.manual_status ?? "", u.company_name ?? "",
        u.activity ?? "", u.view_description ?? "", u.workstations_total ?? "",
        u.workstations_occupied ?? "", u.size_sqm ?? "", u.size_sqft ?? "",
        u.listed_price ?? "", u.listed_ws_price ?? "", u.actual_rent ?? "",
        u.monthly_ws_rate ?? "", u.security_deposit ?? "", u.one_time_fee ?? "",
        u.start_date ?? "", u.end_date ?? "", u.renewal_date ?? "", u.comments ?? "",
      ]);

    const csv = Papa.unparse({ fields: TEMPLATE_HEADERS, data: rows });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flowork-occupancy-current-data.csv`;
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
          const unitCode = getField(row, "unit_code");
          if (!unitCode) continue;

          const companyName = getField(row, "company_name");
          const explicitStatus = getField(row, "status");

          const payload: Record<string, unknown> = {};

          // Status: use an explicit "status" column if present, otherwise
          // infer it — a filled-in company name means occupied.
          if (explicitStatus) {
            payload.manual_status = explicitStatus.toLowerCase() === "occupied" ? "occupied" : "vacant";
          } else {
            payload.manual_status = companyName ? "occupied" : "vacant";
          }

          if (getField(row, "category")) payload.category = getField(row, "category");
          if (companyName) payload.company_name = companyName;
          if (getField(row, "activity")) payload.activity = getField(row, "activity");
          if (getField(row, "view_description")) payload.view_description = getField(row, "view_description");
          if (getField(row, "workstations_total")) payload.workstations_total = Number(getField(row, "workstations_total"));
          if (getField(row, "workstations_occupied")) payload.workstations_occupied = Number(getField(row, "workstations_occupied"));
          if (getField(row, "size_sqm")) payload.size_sqm = Number(getField(row, "size_sqm"));
          if (getField(row, "size_sqft")) payload.size_sqft = Number(getField(row, "size_sqft"));
          if (getField(row, "listed_price")) payload.listed_price = Number(getField(row, "listed_price"));
          if (getField(row, "listed_ws_price")) payload.listed_ws_price = Number(getField(row, "listed_ws_price"));
          if (getField(row, "actual_rent")) payload.actual_rent = Number(getField(row, "actual_rent"));
          if (getField(row, "monthly_ws_rate")) payload.monthly_ws_rate = Number(getField(row, "monthly_ws_rate"));
          if (getField(row, "security_deposit")) payload.security_deposit = Number(getField(row, "security_deposit"));
          if (getField(row, "one_time_fee")) payload.one_time_fee = Number(getField(row, "one_time_fee"));

          const startDate = normalizeDate(getField(row, "start_date"));
          const endDate = normalizeDate(getField(row, "end_date"));
          const renewalDate = normalizeDate(getField(row, "renewal_date"));
          if (startDate) payload.start_date = startDate;
          if (endDate) payload.end_date = endDate;
          if (renewalDate) payload.renewal_date = renewalDate;

          if (getField(row, "comments")) payload.comments = getField(row, "comments");

          const { data, error } = await supabase
            .from("occupancy_units")
            .update(payload as never)
            .eq("location_id", locationId)
            .eq("unit_code", unitCode)
            .select();

          if (error || !data || data.length === 0) {
            notFound.push(unitCode);
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
              Now accepts your real spreadsheet format directly — column
              names like &ldquo;Office No.&rdquo;, &ldquo;Rental Company
              Name&rdquo;, and &ldquo;Renewal Date&rdquo; are recognized
              automatically. If a row has no explicit status column, a
              filled-in company name means Occupied, blank means Vacant.
              Matched by unit code — updates existing hotspots, never
              creates new ones.
            </p>

            <button
              onClick={downloadCurrentData}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-charcoal/15 py-2.5 text-sm font-medium mb-3 hover:bg-sage-50"
            >
              <Download size={16} />
              Download all {units.length} units (current data)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-sage-500 text-cream py-2.5 text-sm font-medium disabled:opacity-60"
            >
              <Upload size={16} />
              {importing ? "Importing..." : "Upload spreadsheet (CSV)"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <p className="text-xs text-charcoal/40 mt-2">
              If your file is an .xlsx, open it in Excel and use
              &ldquo;Save As&rdquo; → CSV first.
            </p>

            {result && (
              <div className="mt-4 text-sm">
                <p className="text-sage-600">{result.matched} unit(s) updated successfully.</p>
                {result.notFound.length > 0 && (
                  <p className="text-red-600 mt-1">
                    Not found (unit code didn&rsquo;t match an existing hotspot): {result.notFound.join(", ")}
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