"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { computeStatus, STATUS_COLORS, STATUS_LABELS } from "@/lib/occupancyStatus";
import type { OccupancyUnit, OccupancyNote } from "@/lib/supabase/types";

const CATEGORIES = ["Private Office", "Dedicated Desk", "Flexi Desk", "Meeting Room", "Phone Booth"];

export default function UnitDetailPanel({
  unit,
  onClose,
  onUpdated,
}: {
  unit: OccupancyUnit;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(unit);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<OccupancyNote[]>([]);
  const [newNote, setNewNote] = useState("");

  const status = computeStatus(unit);

  useEffect(() => {
    setForm(unit);
    loadNotes();
  }, [unit]);

  async function loadNotes() {
    const supabase = createClient();
    const { data } = await supabase
      .from("occupancy_notes")
      .select("*")
      .eq("unit_id", unit.id)
      .order("created_at", { ascending: false });
    setNotes((data ?? []) as OccupancyNote[]);
  }

  function update<K extends keyof OccupancyUnit>(key: K, value: OccupancyUnit[K]) {
    setForm({ ...form, [key]: value });
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { category, manual_status, company_name, activity, view_description, workstations_total, workstations_occupied, size_sqm, size_sqft, listed_price, listed_ws_price, actual_rent, monthly_ws_rate, security_deposit, one_time_fee, start_date, end_date, renewal_date, comments } = form;

    await supabase
      .from("occupancy_units")
      .update({
        category, manual_status, company_name, activity, view_description,
        workstations_total, workstations_occupied, size_sqm, size_sqft,
        listed_price, listed_ws_price, actual_rent, monthly_ws_rate,
        security_deposit, one_time_fee, start_date, end_date, renewal_date, comments,
      } as never)
      .eq("id", unit.id);

    setSaving(false);
    setEditing(false);
    onUpdated();
  }

  async function handleTerminate() {
    const confirmed = window.confirm(`Mark unit ${unit.unit_code} as vacant and clear occupant details?`);
    if (!confirmed) return;
    const supabase = createClient();
    await supabase
      .from("occupancy_units")
      .update({
        manual_status: "vacant",
        company_name: null,
        activity: null,
        start_date: null,
        end_date: null,
        renewal_date: null,
      } as never)
      .eq("id", unit.id);
    onUpdated();
    onClose();
  }

  async function addNote() {
    if (!newNote.trim()) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: inserted } = await supabase
      .from("occupancy_notes")
      .insert({ unit_id: unit.id, author_email: user?.email ?? null, note: newNote.trim() } as never)
      .select()
      .single();
    if (inserted) {
      setNotes([inserted as OccupancyNote, ...notes]);
      setNewNote("");
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-charcoal/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-charcoal/10 p-5 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-charcoal/40 uppercase tracking-wide">Unit {unit.unit_code}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[status] }} />
              <p className="font-display text-lg">{STATUS_LABELS[status]}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {editing ? (
            <>
              <Row label="Category">
                <select value={form.category} onChange={(e) => update("category", e.target.value as any)} className="input">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Row>
              <Row label="Status">
                <select value={form.manual_status} onChange={(e) => update("manual_status", e.target.value as any)} className="input">
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                </select>
              </Row>
              <Row label="Company / Occupant">
                <input value={form.company_name ?? ""} onChange={(e) => update("company_name", e.target.value)} className="input" />
              </Row>
              <Row label="Activity">
                <input value={form.activity ?? ""} onChange={(e) => update("activity", e.target.value)} className="input" />
              </Row>
              <Row label="View">
                <input value={form.view_description ?? ""} onChange={(e) => update("view_description", e.target.value)} className="input" />
              </Row>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Workstations total">
                  <input type="number" value={form.workstations_total ?? ""} onChange={(e) => update("workstations_total", Number(e.target.value))} className="input" />
                </Row>
                <Row label="Workstations occupied">
                  <input type="number" value={form.workstations_occupied ?? ""} onChange={(e) => update("workstations_occupied", Number(e.target.value))} className="input" />
                </Row>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Size (sqm)">
                  <input type="number" value={form.size_sqm ?? ""} onChange={(e) => update("size_sqm", Number(e.target.value))} className="input" />
                </Row>
                <Row label="Size (sqft)">
                  <input type="number" value={form.size_sqft ?? ""} onChange={(e) => update("size_sqft", Number(e.target.value))} className="input" />
                </Row>
              </div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wide pt-2">Financials</p>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Listed price (AED)">
                  <input type="number" value={form.listed_price ?? ""} onChange={(e) => update("listed_price", Number(e.target.value))} className="input" />
                </Row>
                <Row label="Actual rent (AED)">
                  <input type="number" value={form.actual_rent ?? ""} onChange={(e) => update("actual_rent", Number(e.target.value))} className="input" />
                </Row>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Monthly WS rate">
                  <input type="number" value={form.monthly_ws_rate ?? ""} onChange={(e) => update("monthly_ws_rate", Number(e.target.value))} className="input" />
                </Row>
                <Row label="Security deposit">
                  <input type="number" value={form.security_deposit ?? ""} onChange={(e) => update("security_deposit", Number(e.target.value))} className="input" />
                </Row>
              </div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wide pt-2">Contract</p>
              <div className="grid grid-cols-3 gap-3">
                <Row label="Start date">
                  <input type="date" value={form.start_date ?? ""} onChange={(e) => update("start_date", e.target.value)} className="input" />
                </Row>
                <Row label="End date">
                  <input type="date" value={form.end_date ?? ""} onChange={(e) => update("end_date", e.target.value)} className="input" />
                </Row>
                <Row label="Renewal date">
                  <input type="date" value={form.renewal_date ?? ""} onChange={(e) => update("renewal_date", e.target.value)} className="input" />
                </Row>
              </div>
              <Row label="Comments">
                <textarea value={form.comments ?? ""} onChange={(e) => update("comments", e.target.value)} rows={3} className="input" />
              </Row>

              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 rounded-full bg-sage-500 text-cream py-2.5 text-sm font-medium disabled:opacity-60">
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button onClick={() => { setEditing(false); setForm(unit); }} className="flex-1 rounded-full border border-charcoal/20 py-2.5 text-sm font-medium">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <DetailRow label="Company" value={unit.company_name} />
              <DetailRow label="Activity" value={unit.activity} />
              <DetailRow label="Category" value={unit.category} />
              <DetailRow label="View" value={unit.view_description} />
              <DetailRow label="Workstations" value={unit.workstations_total ? `${unit.workstations_occupied ?? 0} / ${unit.workstations_total}` : null} />
              <DetailRow label="Size" value={unit.size_sqm ? `${unit.size_sqm} sqm (${unit.size_sqft ?? "—"} sqft)` : null} />
              <p className="text-xs text-charcoal/40 uppercase tracking-wide pt-2">Financials</p>
              <DetailRow label="Listed price" value={unit.listed_price ? `AED ${unit.listed_price.toLocaleString()}` : null} />
              <DetailRow label="Actual rent" value={unit.actual_rent ? `AED ${unit.actual_rent.toLocaleString()}` : null} />
              <DetailRow label="Monthly WS rate" value={unit.monthly_ws_rate ? `AED ${unit.monthly_ws_rate.toLocaleString()}` : null} />
              <DetailRow label="Security deposit" value={unit.security_deposit ? `AED ${unit.security_deposit.toLocaleString()}` : null} />
              <p className="text-xs text-charcoal/40 uppercase tracking-wide pt-2">Contract</p>
              <DetailRow label="Start date" value={unit.start_date} />
              <DetailRow label="End date" value={unit.end_date} />
              <DetailRow label="Renewal date" value={unit.renewal_date} />
              <DetailRow label="Comments" value={unit.comments} />

              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(true)} className="flex-1 rounded-full bg-sage-500 text-cream py-2.5 text-sm font-medium">
                  Edit
                </button>
                <button onClick={handleTerminate} className="flex-1 rounded-full border border-red-300 text-red-600 py-2.5 text-sm font-medium hover:bg-red-50">
                  Terminate
                </button>
              </div>

              <div className="pt-4 border-t border-charcoal/10">
                <p className="text-xs text-charcoal/40 uppercase tracking-wide mb-3">Notes</p>
                <div className="flex gap-2 mb-4">
                  <input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="input flex-1"
                    onKeyDown={(e) => e.key === "Enter" && addNote()}
                  />
                  <button onClick={addNote} className="rounded-lg bg-sage-500 text-cream px-3 text-sm">Add</button>
                </div>
                <div className="space-y-3">
                  {notes.map((n) => (
                    <div key={n.id} className="border-l-2 border-sage-300 pl-3">
                      <p className="text-sm text-charcoal/80">{n.note}</p>
                      <p className="text-xs text-charcoal/40">{n.author_email || "Unknown"} &middot; {new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {notes.length === 0 && <p className="text-sm text-charcoal/40">No notes yet.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgba(26,29,24,0.12);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-color: #7C8A6D; }
      `}</style>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-charcoal/50 mb-1">{label}</span>
      {children}
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-charcoal/40">{label}</p>
      <p className="text-sm text-charcoal/80">{value || "—"}</p>
    </div>
  );
}