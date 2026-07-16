"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PuckImageField from "@/components/admin/PuckImageField";
import type { Service } from "@/lib/supabase/types";

export default function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [perksText, setPerksText] = useState(service?.perks?.join("\n") ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(service?.hero_image_url ?? "");
  const [featureImageUrl, setFeatureImageUrl] = useState(service?.feature_image_url ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const payload = {
      slug: form.get("slug") as string,
      name: form.get("name") as string,
      tagline: form.get("tagline") as string,
      hero_image_url: heroImageUrl,
      perks: perksText.split("\n").map((p) => p.trim()).filter(Boolean),
      feature_heading: form.get("feature_heading") as string,
      feature_body: form.get("feature_body") as string,
      feature_image_url: featureImageUrl,
      published: form.get("published") === "on",
    };

    if (service) {
      await supabase.from("services").update(payload as never).eq("id", service.id);
    } else {
      await supabase.from("services").insert(payload as never);
    }

    setSaving(false);
    router.push("/admin/services");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 bg-white rounded-xl border border-charcoal/10 p-6">
      <Row label="Slug (URL)"><input name="slug" defaultValue={service?.slug} required className="input" /></Row>
      <Row label="Name"><input name="name" defaultValue={service?.name} required className="input" /></Row>
      <Row label="Tagline"><input name="tagline" defaultValue={service?.tagline} required className="input" /></Row>
      <Row label="Hero image">
        <PuckImageField value={heroImageUrl} onChange={setHeroImageUrl} />
      </Row>
      <Row label="Perks (one per line)">
        <textarea
          value={perksText}
          onChange={(e) => setPerksText(e.target.value)}
          rows={6}
          className="input"
        />
      </Row>
      <Row label="Feature heading"><input name="feature_heading" defaultValue={service?.feature_heading} required className="input" /></Row>
      <Row label="Feature body"><textarea name="feature_body" defaultValue={service?.feature_body} required rows={3} className="input" /></Row>
      <Row label="Feature image">
        <PuckImageField value={featureImageUrl} onChange={setFeatureImageUrl} />
      </Row>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={service?.published ?? true} />
        Published
      </label>
      <button disabled={saving} className="rounded-full bg-sage-500 text-cream px-5 py-2.5 text-sm font-medium disabled:opacity-60">
        {saving ? "Saving..." : "Save service"}
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