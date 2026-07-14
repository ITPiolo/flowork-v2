"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { createClient } from "@/lib/supabase/client";
import { puckConfig } from "@/lib/puckConfig";
import type { CustomPage } from "@/lib/supabase/types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PuckEditor({ page }: { page?: CustomPage }) {
  const router = useRouter();
  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.meta_description ?? "");
  const [published, setPublished] = useState(page?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initialData: Data = page?.content ?? { content: [], root: { props: {} } };

  async function handleSave(data: Data) {
    if (!title.trim()) {
      alert("Please give this page a title before saving.");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      slug: slug || slugify(title),
      title,
      meta_description: metaDescription || null,
      content: data,
      published,
    };

    if (page) {
      await supabase.from("custom_pages").update(payload as never).eq("id", page.id);
    } else {
      const { data: inserted } = await supabase
        .from("custom_pages")
        .insert(payload as never)
        .select()
        .single();
      setSaving(false);
      if (inserted) {
        router.push(`/admin/pages/${(inserted as any).id}`);
        router.refresh();
        return;
      }
    }

    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!page) return;
    const confirmed = window.confirm(`Delete "${page.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    const supabase = createClient();
    await supabase.from("custom_pages").delete().eq("id", page.id);
    setDeleting(false);
    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-charcoal/10 p-4 flex flex-wrap items-center gap-4">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!page) setSlug(slugify(e.target.value));
          }}
          placeholder="Page title"
          className="border border-charcoal/15 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px]"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          placeholder="page-url-slug"
          className="border border-charcoal/15 rounded-lg px-3 py-2 text-sm w-48"
        />
        <input
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Meta description (for SEO)"
          className="border border-charcoal/15 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
        {page && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 hover:underline whitespace-nowrap"
          >
            {deleting ? "Deleting..." : "Delete page"}
          </button>
        )}
        {saving && <span className="text-xs text-charcoal/40">Saving...</span>}
      </div>

      <div className="flex-1 overflow-hidden">
        <Puck config={puckConfig} data={initialData} onPublish={handleSave} />
      </div>
    </div>
  );
}