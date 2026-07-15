import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Generic intake for external lead sources (Meta Lead Ads, Property Finder,
// Bayut, referral partners, etc). Each source gets its own URL:
//   https://flowork.ae/api/leads/meta
//   https://flowork.ae/api/leads/property-finder
// Protected by a shared secret — set LEADS_WEBHOOK_SECRET in your env vars,
// then require it as ?token=... on the URL you give each platform.
//
// Not connected to anything yet. Safe to leave as-is until you're ready
// to plug in a real source — it does nothing until called.

function pick(body: any, keys: string[], fallback: string | null = "") {
  for (const key of keys) {
    if (body[key]) return String(body[key]);
  }
  return fallback;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ source: string }> }
) {
  const { source } = await params;

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!process.env.LEADS_WEBHOOK_SECRET || token !== process.env.LEADS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  // Flexible field mapping — different platforms name fields differently
  // (Meta uses "full_name"/"email", Property Finder-style forms often use
  // "name"/"phone_number", etc). Add more aliases here as needed per source.
  const payload = {
    service: pick(body, ["service", "interest", "product"], "General enquiry"),
    full_name: pick(body, ["full_name", "name", "first_name"], "Unknown"),
    email: pick(body, ["email", "email_address"], ""),
    phone: pick(body, ["phone", "phone_number", "mobile"], ""),
    company_name: pick(body, ["company_name", "company"], null) || null,
    people_count: pick(body, ["people_count", "team_size"], "1-4"),
    location: pick(body, ["location", "city"], "Not specified"),
    status: "new" as const,
    source,
  };

  if (!payload.email && !payload.phone) {
    return NextResponse.json(
      { error: "Lead must include at least an email or phone number" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert(payload as never);

  if (error) {
    console.error(`Lead intake error [${source}]:`, error);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, source });
}