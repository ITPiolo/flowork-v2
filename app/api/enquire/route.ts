import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import type { Enquiry } from "@/lib/supabase/types";

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { allowed } = checkRateLimit(`enquire:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a few minutes, or WhatsApp us directly." },
      { status: 429 }
    );
  }

  const body = await req.json();

  const required = ["service", "full_name", "email", "phone", "people_count", "location"];
  for (const key of required) {
    if (!body[key]) {
      return NextResponse.json({ error: `Missing ${key}` }, { status: 400 });
    }
  }

  const payload: Partial<Enquiry> = {
    service: body.service,
    full_name: body.full_name,
    email: body.email,
    phone: body.phone,
    company_name: body.company_name || null,
    people_count: body.people_count,
    location: body.location,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert(payload as never);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save enquiry" }, { status: 500 });
  }

  // Optional: trigger a notification email via Resend here, e.g.
  // await fetch("https://api.resend.com/emails", { ... })

  return NextResponse.json({ ok: true });
}