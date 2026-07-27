"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";

export default function PuckImageField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(rawFile: File) {
    setError(null);
    if (rawFile.size > 40 * 1024 * 1024) {
      setError("File too large (max 40MB, even before compression).");
      return;
    }
    setUploading(true);

    let file = rawFile;
    try {
      file = await compressImage(rawFile);
    } catch (err) {
      console.error(`Compression failed for ${rawFile.name}:`, err);
    }

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `pages/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-charcoal/5 border border-charcoal/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs rounded-lg bg-sage-500 text-cream px-3 py-2 font-medium disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Upload image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="or paste an image URL"
        className="w-full text-xs border border-charcoal/15 rounded-lg px-2 py-1.5"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}