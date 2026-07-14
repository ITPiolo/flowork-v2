import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminServices() {
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").order("display_order");
  const services = (data ?? []) as Service[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Services</h1>
        <Link
          href="/admin/services/new"
          className="rounded-full bg-sage-500 text-cream px-4 py-2 text-sm font-medium"
        >
          + Add service
        </Link>
      </div>
      <div className="grid gap-4">
        {services.map((s) => (
          <Link
            key={s.id}
            href={`/admin/services/${s.id}`}
            className="flex items-center justify-between bg-white rounded-xl border border-charcoal/10 p-4 hover:border-sage-300"
          >
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-charcoal/50">/{s.slug}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                s.published ? "bg-sage-100 text-sage-700" : "bg-charcoal/10 text-charcoal/50"
              }`}
            >
              {s.published ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
        {services.length === 0 && (
          <p className="text-sm text-charcoal/40">No services yet.</p>
        )}
      </div>
    </div>
  );
}
