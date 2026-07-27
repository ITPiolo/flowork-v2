"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";
import { Upload, Copy, Trash2, Check } from "lucide-react";

type MediaFile = {
  name: string;
  url: string;
  size: number;
  createdAt: string;
};

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadFiles() {
    setLoading(true);
    setListError(null);
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("media")
      .list("pages", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      setListError(error.message);
    } else if (data) {
      const mapped = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => {
          const { data: urlData } = supabase.storage.from("media").getPublicUrl(`pages/${f.name}`);
          return {
            name: f.name,
            url: urlData.publicUrl,
            size: f.metadata?.size ?? 0,
            createdAt: f.created_at ?? "",
          };
        });
      setFiles(mapped);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function handleUpload(fileList: FileList) {
    setUploading(true);
    const supabase = createClient();
    const errors: string[] = [];

    for (const rawFile of Array.from(fileList)) {
      if (rawFile.size > 40 * 1024 * 1024) {
        errors.push(`${rawFile.name}: file is over 40MB, too large even to compress`);
        continue;
      }

      let file = rawFile;
      try {
        file = await compressImage(rawFile);
      } catch (err) {
        // If compression fails for any reason, fall back to uploading
        // the original rather than blocking the upload entirely.
        console.error(`Compression failed for ${rawFile.name}:`, err);
      }

      const ext = file.name.split(".").pop();
      const path = `pages/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) errors.push(`${rawFile.name}: ${error.message}`);
    }

    await loadFiles();
    setUploading(false);

    if (errors.length > 0) {
      window.alert(`Some files failed to upload:\n\n${errors.join("\n")}`);
    }
  }

  async function handleDelete(name: string) {
    const confirmed = window.confirm(`Delete "${name}"? This can't be undone, and any page using it will show a broken image.`);
    if (!confirmed) return;
    const supabase = createClient();
    await supabase.storage.from("media").remove([`pages/${name}`]);
    setFiles(files.filter((f) => f.name !== name));
  }

  function copyUrl(file: MediaFile) {
    navigator.clipboard.writeText(file.url);
    setCopiedName(file.name);
    setTimeout(() => setCopiedName(null), 1500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Media Library</h1>
          <p className="text-sm text-charcoal/50 mt-1">
            Every image uploaded through the page builder. Copy a URL to
            reuse it anywhere on the site.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-full bg-sage-500 text-cream px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      {listError && (
        <p className="text-sm text-red-600 mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Couldn&rsquo;t load the media list: {listError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-charcoal/40">Loading...</p>
      ) : files.length === 0 && !listError ? (
        <p className="text-sm text-charcoal/40">
          No images uploaded yet. Upload one above, or images uploaded via
          the page builder will show up here automatically.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.name} className="group relative rounded-xl overflow-hidden border border-charcoal/10 bg-white">
              <div className="relative aspect-square bg-charcoal/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs text-charcoal/50 truncate">{file.name}</p>
              </div>
              <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(file)}
                  className="h-9 w-9 rounded-full bg-white flex items-center justify-center hover:bg-sage-50"
                  title="Copy URL"
                >
                  {copiedName === file.name ? <Check size={16} className="text-sage-600" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  className="h-9 w-9 rounded-full bg-white flex items-center justify-center hover:bg-red-50"
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