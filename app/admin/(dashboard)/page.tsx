import { createClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = await createClient();
  const [{ count: enquiries }, { count: newEnquiries }, { count: locations }, { count: services }] =
    await Promise.all([
      supabase.from("enquiries").select("*", { count: "exact", head: true }),
      supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("locations").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Total enquiries", value: enquiries ?? 0 },
    { label: "New enquiries", value: newEnquiries ?? 0 },
    { label: "Locations", value: locations ?? 0 },
    { label: "Services", value: services ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white border border-charcoal/10 p-5">
            <p className="text-3xl font-display">{s.value}</p>
            <p className="text-xs text-charcoal/50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-charcoal/50">
        Manage locations, services, Ejari pricing, and blog posts from the
        sidebar — changes go live on the site immediately.
      </p>
    </div>
  );
}
