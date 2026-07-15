"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Copy, Trash2, Check, FileText } from "lucide-react";
import type { ProposalLibraryItem } from "@/lib/supabase/types";

const CATEGORIES = ["General", "Private Office", "Coworking", "Meeting Room", "Virtual Office", "Podcast Room", "Ejari"];

export default function ProposalLibrary() {
  const [items, setItems] = useState<ProposalLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [pendingTitle, setPendingTitle] = useState("");
  const [pendingCategory, setPendingCategory] = useState("General");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFile = useRef<File | null>(null);

  async function loadItems() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("proposal_library")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as ProposalLibraryItem[]);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  function handlePickFile(file: File) {
    pendingFile.current = file;
    setPendingTitle(file.name.replace(/\.[^/.]+$/, ""));
  }

  async function handleUpload() {
    if (!pendingFile.current || !pendingTitle.trim()) return;
    setUploading(true);
    const supabase = createClient();
    const file = pendingFile.current;
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("proposal_library").insert({
      title: pendingTitle.trim(),
      category: pendingCategory,
      file_url: urlData.publicUrl,
      file_name: file.name,
      uploaded_by: user?.email ?? null,
    } as never);

    pendingFile.current = null;
    setPendingTitle("");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    loadItems();
  }

  async function handleDelete(item: ProposalLibraryItem) {
    const confirmed = window.confirm(`Delete "${item.title}"?`);
    if (!confirmed) return;
    const supabase = createClient();
    const path = item.file_url.split("/documents/")[1];
    if (path) await supabase.storage.from("documents").remove([path]);
    await supabase.from("proposal_library").delete().eq("id", item.id);
    setItems(items.filter((i) => i.id !== item.id));
  }

  function copyUrl(item: ProposalLibraryItem) {
    navigator.clipboard.writeText(item.file_url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const filteredItems = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">Proposal Library</h1>
      <p className="text-sm text-charcoal/50 mb-6">
        Upload your existing proposal documents here to keep them organized
        and ready to attach to any lead&rsquo;s email.
      </p>

      <div className="bg-white rounded-xl border border-charcoal/10 p-5 mb-6">
        <h2 className="font-display text-lg mb-4">Upload a proposal</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-charcoal/50 mb-1">File</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => e.target.files?.[0] && handlePickFile(e.target.files[0])}
              className="text-sm"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-charcoal/50 mb-1">Title</label>
            <input
              value={pendingTitle}
              onChange={(e) => setPendingTitle(e.target.value)}
              placeholder="e.g. Private Office — Standard Rate"
              className="w-full border border-charcoal/15 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-charcoal/50 mb-1">Category</label>
            <select
              value={pendingCategory}
              onChange={(e) => setPendingCategory(e.target.value)}
              className="border border-charcoal/15 rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading || !pendingTitle.trim()}
            className="flex items-center gap-2 rounded-lg bg-sage-500 text-cream px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            <Upload size={15} />
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              filter === c ? "bg-sage-500 text-cream" : "bg-charcoal/5 text-charcoal/50 hover:bg-charcoal/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-charcoal/40">Loading...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-sm text-charcoal/40">No proposals in this category yet.</p>
      ) : (
        <div className="grid gap-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white rounded-xl border border-charcoal/10 p-4">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-sage-500 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-charcoal/40">
                    {item.category} &middot; {item.file_name} &middot;{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyUrl(item)}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-sage-50"
                  title="Copy link"
                >
                  {copiedId === item.id ? <Check size={16} className="text-sage-600" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}