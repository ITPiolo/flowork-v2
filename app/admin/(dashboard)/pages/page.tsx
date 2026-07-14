import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { CustomPage } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminPages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("custom_pages")
    .select("*")
    .order("updated_at", { ascending: false });
  const pages = (data ?? []) as CustomPage[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Pages</h1>
          <p className="text-sm text-charcoal/50 mt-1">
            Build custom pages with drag-and-drop — no code needed.
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="rounded-full bg-sage-500 text-cream px-4 py-2 text-sm font-medium"
        >
          + New page
        </Link>
      </div>
      <div className="grid gap-4">
        {pages.map((p) => (
          <Link
            key={p.id}
            href={`/admin/pages/${p.id}`}
            className="flex items-center justify-between bg-white rounded-xl border border-charcoal/10 p-4 hover:border-sage-300"
          >
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-charcoal/50">/{p.slug}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                p.published ? "bg-sage-100 text-sage-700" : "bg-charcoal/10 text-charcoal/50"
              }`}
            >
              {p.published ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
        {pages.length === 0 && (
          <p className="text-sm text-charcoal/40">
            No custom pages yet. Click &ldquo;+ New page&rdquo; to build your first one.
          </p>
        )}
      </div>
    </div>
  );
}