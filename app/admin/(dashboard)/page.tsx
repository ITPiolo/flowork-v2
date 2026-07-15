import { createClient } from "@/lib/supabase/server";
import type { Enquiry } from "@/lib/supabase/types";

export default async function AdminOverview() {
  const supabase = await createClient();

  const [
    { count: totalLeads },
    { count: newLeads },
    { count: locations },
    { count: services },
    { data: allEnquiries },
  ] = await Promise.all([
    supabase.from("enquiries").select("*", { count: "exact", head: true }),
    supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("locations").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("enquiries").select("status, service, source"),
  ]);

  const enquiries = (allEnquiries ?? []) as Pick<Enquiry, "status" | "service" | "source">[];

  const stageCounts = {
    new: enquiries.filter((e) => e.status === "new").length,
    contacted: enquiries.filter((e) => e.status === "contacted").length,
    proposal_sent: enquiries.filter((e) => e.status === "proposal_sent").length,
    won: enquiries.filter((e) => e.status === "won").length,
    lost: enquiries.filter((e) => e.status === "lost").length,
  };

  const closedCount = stageCounts.won + stageCounts.lost;
  const winRate = closedCount > 0 ? Math.round((stageCounts.won / closedCount) * 100) : 0;

  const serviceCounts: Record<string, number> = {};
  enquiries.forEach((e) => {
    serviceCounts[e.service] = (serviceCounts[e.service] || 0) + 1;
  });
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stats = [
    { label: "Total leads", value: totalLeads ?? 0 },
    { label: "New (unactioned)", value: newLeads ?? 0 },
    { label: "Locations", value: locations ?? 0 },
    { label: "Services", value: services ?? 0 },
  ];

  const stageBar = [
    { label: "New", value: stageCounts.new, color: "bg-charcoal/20" },
    { label: "Contacted", value: stageCounts.contacted, color: "bg-blue-400" },
    { label: "Proposal Sent", value: stageCounts.proposal_sent, color: "bg-amber-400" },
    { label: "Won", value: stageCounts.won, color: "bg-sage-500" },
    { label: "Lost", value: stageCounts.lost, color: "bg-red-400" },
  ];
  const maxStage = Math.max(...stageBar.map((s) => s.value), 1);

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white border border-charcoal/10 p-5">
            <p className="text-3xl font-display">{s.value}</p>
            <p className="text-xs text-charcoal/50 mt-1">{s.label}</p>
          </div>
        ))}
        <div className="rounded-xl bg-sage-500 text-cream p-5">
          <p className="text-3xl font-display">{winRate}%</p>
          <p className="text-xs opacity-80 mt-1">Win rate ({closedCount} closed)</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-charcoal/10 p-6">
          <h2 className="font-display text-lg mb-4">Pipeline breakdown</h2>
          <div className="space-y-3">
            {stageBar.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs text-charcoal/60 mb-1">
                  <span>{s.label}</span>
                  <span>{s.value}</span>
                </div>
                <div className="h-2 rounded-full bg-charcoal/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${(s.value / maxStage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-charcoal/10 p-6">
          <h2 className="font-display text-lg mb-4">Top requested services</h2>
          <div className="space-y-3">
            {topServices.length === 0 && (
              <p className="text-sm text-charcoal/40">No data yet.</p>
            )}
            {topServices.map(([name, count]) => (
              <div key={name} className="flex justify-between text-sm">
                <span className="text-charcoal/70">{name}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-charcoal/50">
        Manage locations, services, Ejari pricing, blog posts, and custom
        pages from the sidebar — changes go live on the site immediately.
      </p>
    </div>
  );
}