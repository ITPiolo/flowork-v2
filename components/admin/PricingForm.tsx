"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PricingPackage } from "@/lib/supabase/types";

export default function PricingForm({ pkg }: { pkg?: PricingPackage }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [featuresText, setFeaturesText] = useState(
    pkg?.features?.join("\n") ?? ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const payload = {
      name: form.get("name") as string,
      price_aed: Number(form.get("price_aed")),
      billing_period: form.get("billing_period") as string,
      features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
      featured: form.get("featured") === "on",
      display_order: Number(form.get("display_order")) || 0,
    };

    if (pkg) {
      await supabase.from("pricing_packages").update(payload).eq("id", pkg.id);
    } else {
      await supabase.from("pricing_packages").insert(payload);
    }

    setSaving(false);
    router.push("/admin/pricing");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 bg-white rounded-xl border border-charcoal/10 p-6">
      <Row label="Package name"><input name="name" defaultValue={pkg?.name} required className="input" /></Row>
      <div className="grid grid-cols-2 gap-4">
        <Row label="Price (AED)"><input name="price_aed" type="number" defaultValue={pkg?.price_aed} required className="input" /></Row>
        <Row label="Billing period"><input name="billing_period" defaultValue={pkg?.billing_period ?? "Per Year"} className="input" /></Row>
      </div>
      <Row label="Features (one per line)">
        <textarea
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          rows={8}
          className="input"
        />
      </Row>
      <Row label="Display order"><input name="display_order" type="number" defaultValue={pkg?.display_order ?? 0} className="input" /></Row>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={pkg?.featured ?? false} />
        Featured (highlighted card)
      </label>
      <button disabled={saving} className="rounded-full bg-sage-500 text-cream px-5 py-2.5 text-sm font-medium disabled:opacity-60">
        {saving ? "Saving..." : "Save package"}
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
