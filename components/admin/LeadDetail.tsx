"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Enquiry, EnquiryNote } from "@/lib/supabase/types";

const STAGES: { value: Enquiry["status"]; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-charcoal/10 text-charcoal/70" },
  { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-700" },
  { value: "proposal_sent", label: "Proposal Sent", color: "bg-amber-100 text-amber-700" },
  { value: "won", label: "Won", color: "bg-sage-100 text-sage-700" },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-700" },
];

export default function LeadDetail({
  enquiry,
  initialNotes,
}: {
  enquiry: Enquiry;
  initialNotes: EnquiryNote[];
}) {
  const [stage, setStage] = useState(enquiry.status);
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function updateStage(next: Enquiry["status"]) {
    setStage(next);
    const supabase = createClient();
    await supabase.from("enquiries").update({ status: next } as never).eq("id", enquiry.id);
  }

  async function addNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: inserted } = await supabase
      .from("enquiry_notes")
      .insert({
        enquiry_id: enquiry.id,
        author_email: user?.email ?? null,
        note: newNote.trim(),
      } as never)
      .select()
      .single();

    if (inserted) {
      setNotes([inserted as EnquiryNote, ...notes]);
      setNewNote("");
    }
    setSaving(false);
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-charcoal/10 p-6">
          <h1 className="font-display text-2xl">{enquiry.full_name}</h1>
          <p className="text-sm text-charcoal/50 mt-1">
            {enquiry.service} &middot; {enquiry.location}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wide">Email</p>
              <a href={`mailto:${enquiry.email}`} className="text-sage-600 hover:underline">{enquiry.email}</a>
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wide">Phone</p>
              <a href={`tel:${enquiry.phone}`} className="text-sage-600 hover:underline">{enquiry.phone}</a>
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wide">Company</p>
              <p>{enquiry.company_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wide">People</p>
              <p>{enquiry.people_count}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wide">Source</p>
              <p>{enquiry.source || "website"}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal/40 uppercase tracking-wide">Received</p>
              <p>{new Date(enquiry.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-charcoal/10 p-6">
          <h2 className="font-display text-lg mb-4">Activity &amp; notes</h2>
          <div className="flex gap-2 mb-6">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Log a call, note, or update..."
              className="flex-1 border border-charcoal/15 rounded-lg px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <button
              onClick={addNote}
              disabled={saving}
              className="rounded-lg bg-sage-500 text-cream px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "..." : "Add"}
            </button>
          </div>
          <div className="space-y-4">
            {notes.map((n) => (
              <div key={n.id} className="border-l-2 border-sage-300 pl-4">
                <p className="text-sm text-charcoal/80">{n.note}</p>
                <p className="text-xs text-charcoal/40 mt-1">
                  {n.author_email || "Unknown"} &middot; {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-sm text-charcoal/40">No activity logged yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-charcoal/10 p-6 h-fit">
        <h2 className="font-display text-lg mb-4">Pipeline stage</h2>
        <div className="space-y-2">
          {STAGES.map((s) => (
            <button
              key={s.value}
              onClick={() => updateStage(s.value)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                stage === s.value ? s.color + " ring-2 ring-offset-1 ring-sage-400" : "bg-charcoal/5 text-charcoal/50 hover:bg-charcoal/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}