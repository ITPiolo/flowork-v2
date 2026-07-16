"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, AlertTriangle } from "lucide-react";

const CATEGORIES = ["General", "Private Office", "Coworking", "Meeting Room", "Virtual Office", "Podcast Room", "Ejari"];

export default function ProposalRedactor() {
  const [step, setStep] = useState<"upload" | "review" | "saved">("upload");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setProcessing(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/redact-proposal", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setProcessing(false);
        return;
      }
      setOriginalText(data.originalText);
      setEditedText(data.suggestedText);
      setTitle(file.name.replace(/\.[^/.]+$/, "") + " (Template)");
      setStep("review");
    } catch {
      setError("Could not process this file.");
    }
    setProcessing(false);
  }

  async function handleSave() {
    if (!title.trim() || !editedText.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("proposal_library").insert({
      title: title.trim(),
      category,
      body_text: editedText,
      uploaded_by: user?.email ?? null,
    } as never);

    setSaving(false);
    setStep("saved");
  }

  if (step === "saved") {
    return (
      <div className="bg-sage-50 border border-sage-300 rounded-xl p-8 text-center">
        <p className="font-display text-xl text-sage-700">Template saved</p>
        <p className="text-sm text-charcoal/60 mt-2">
          It's now in your Proposal Library, ready to reuse.
        </p>
        <a href="/admin/proposals" className="inline-block mt-4 text-sm text-sage-600 underline">
          Back to library
        </a>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            The AI has suggested redactions on the right, but it can miss things.
            <strong> Read the whole document carefully</strong> before saving —
            check every name, company, price, and date is actually replaced.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-charcoal/50 mb-2 uppercase tracking-wide">Original (reference only)</p>
            <div className="border border-charcoal/10 rounded-lg p-4 bg-charcoal/[0.02] h-96 overflow-y-auto text-sm whitespace-pre-wrap text-charcoal/60">
              {originalText}
            </div>
          </div>
          <div>
            <p className="text-xs text-charcoal/50 mb-2 uppercase tracking-wide">
              Suggested template — edit anything before saving
            </p>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full h-96 border border-sage-300 rounded-lg p-4 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 bg-white border border-charcoal/10 rounded-xl p-5">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-charcoal/50 mb-1">Template title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-charcoal/15 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-charcoal/50 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-charcoal/15 rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !editedText.trim()}
            className="rounded-lg bg-sage-500 text-cream px-5 py-2 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save as template"}
          </button>
          <button
            onClick={() => setStep("upload")}
            className="text-sm text-charcoal/50 hover:underline"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border border-charcoal/10 rounded-xl p-8 text-center">
        <Upload size={32} className="mx-auto text-sage-500 mb-3" />
        <p className="font-display text-lg mb-1">Upload a finished proposal</p>
        <p className="text-sm text-charcoal/50 mb-5 max-w-md mx-auto">
          Upload a .docx proposal you've already sent to a client. The AI
          will suggest turning client-specific details into placeholders —
          you review and approve everything before it's saved.
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="rounded-full bg-sage-500 text-cream px-6 py-3 text-sm font-medium disabled:opacity-60"
        >
          {processing ? "Processing..." : "Choose .docx file"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}