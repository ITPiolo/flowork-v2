import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword, generateShareToken } from "@/lib/shareLinkAuth";

// Create and list occupancy floor plan share links. Requires a logged-in
// admin session — these links grant read-only access to the floor plan
// to whoever has the link + password, so creating/listing/revoking them
// must never be publicly callable. The actual public-facing password
// check lives in /api/occupancy-share/verify.

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const url = new URL(req.url);
  const locationId = url.searchParams.get("locationId");
  if (!locationId) return NextResponse.json({ error: "Missing locationId" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("occupancy_share_links")
    .select("id, location_id, token, label, expires_at, revoked_at, created_at")
    .eq("location_id", locationId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ links: data });
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { locationId, password, label, expiresAt } = body;

  if (!locationId || !password) {
    return NextResponse.json({ error: "Missing locationId or password" }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
  }

  const { hash, salt } = hashPassword(password);
  const token = generateShareToken();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("occupancy_share_links")
    .insert({
      location_id: locationId,
      token,
      label: label || null,
      password_hash: hash,
      password_salt: salt,
      expires_at: expiresAt || null,
    } as never)
    .select("id, token")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: (data as any).id, token: (data as any).token });
}
