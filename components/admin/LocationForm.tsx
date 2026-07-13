"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Location } from "@/lib/supabase/types";

export default function LocationForm({ location }: { location?: Location }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const payload = {
      slug: form.get("slug") as string,
      name: form.get("name") as string,
      tagline: form.get("tagline") as string,
      description: form.get("description") as string,
      hero_image_url: form.get("hero_image_url") as string,
      offices_count: form.get("offices_count") as string,
      coworking_count: form.get("coworking_count") as string,
      meeting_rooms_count: form.get("meeting_rooms_count") as string,
      phone_booths_count: form.get("phone_booths_count") as string,
      podcast_rooms_count: form.get("podcast_rooms_count") as string,
      address: form.get("address") as string,
      published: form.get("published") === "on",
    };

    if (location) {
      await supabase.from("locations").update(payload).eq("id", location.id);
    } else {
      await supabase.from("locations").insert(payload);
    }

    setSaving(false);
    router.push("/admin/locations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 bg-white rounded-xl border border-charcoal/10 p-6">
      <Row label="Slug (URL)"><input name="slug" defaultValue={location?.slug} required className="input" /></Row>
      <Row label="Name"><input name="name" defaultValue={location?.name} required className="input" /></Row>
      <Row label="Tagline"><input name="tagline" defaultValue={location?.tagline} required className="input" /></Row>
      <Row label="Description"><textarea name="description" defaultValue={location?.description} required rows={3} className="input" /></Row>
      <Row label="Hero image URL"><input name="hero_image_url" defaultValue={location?.hero_image_url} required className="input" /></Row>
      <div className="grid grid-cols-3 gap-4">
        <Row label="Offices"><input name="offices_count" defaultValue={location?.offices_count ?? "65+"} className="input" /></Row>
        <Row label="Coworking"><input name="coworking_count" defaultValue={location?.coworking_count} className="input" /></Row>
        <Row label="Meeting rooms"><input name="meeting_rooms_count" defaultValue={location?.meeting_rooms_count} className="input" /></Row>
        <Row label="Phone booths"><input name="phone_booths_count" defaultValue={location?.phone_booths_count} className="input" /></Row>
        <Row label="Podcast rooms"><input name="podcast_rooms_count" defaultValue={location?.podcast_rooms_count ?? "1"} className="input" /></Row>
      </div>
      <Row label="Address"><input name="address" defaultValue={location?.address} required className="input" /></Row>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={location?.published ?? true} />
        Published
      </label>
      <button disabled={saving} className="rounded-full bg-sage-500 text-cream px-5 py-2.5 text-sm font-medium disabled:opacity-60">
        {saving ? "Saving..." : "Save location"}
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
