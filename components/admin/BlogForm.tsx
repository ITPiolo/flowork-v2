"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BlogPost } from "@/lib/supabase/types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BlogForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const payload = {
      slug: slug || slugify(title),
      title,
      excerpt: form.get("excerpt") as string,
      body: form.get("body") as string,
      cover_image_url: form.get("cover_image_url") as string,
      category: form.get("category") as string,
      published: form.get("published") === "on",
    };

    if (post) {
      await supabase.from("blog_posts").update(payload).eq("id", post.id);
    } else {
      await supabase.from("blog_posts").insert(payload);
    }

    setSaving(false);
    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 bg-white rounded-xl border border-charcoal/10 p-6">
      <Row label="Title">
        <input
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!post) setSlug(slugify(e.target.value));
          }}
          required
          className="input"
        />
      </Row>
      <Row label="Slug (URL)">
        <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required className="input" />
      </Row>
      <Row label="Category"><input name="category" defaultValue={post?.category ?? "Business Centres"} className="input" /></Row>
      <Row label="Excerpt"><textarea name="excerpt" defaultValue={post?.excerpt} required rows={2} className="input" /></Row>
      <Row label="Cover image URL"><input name="cover_image_url" defaultValue={post?.cover_image_url} required className="input" /></Row>
      <Row label="Body"><textarea name="body" defaultValue={post?.body} required rows={10} className="input" /></Row>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? true} />
        Published
      </label>
      <button disabled={saving} className="rounded-full bg-sage-500 text-cream px-5 py-2.5 text-sm font-medium disabled:opacity-60">
        {saving ? "Saving..." : "Save post"}
      </button>

      <style jsx global>{`
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
    </form>
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
