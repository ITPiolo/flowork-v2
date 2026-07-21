import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/shareLinkAuth";

// Public endpoint — no admin session required. Checks a share link's
// token + password and, if valid, returns a read-only view of the floor
// plan, including company names and expiry dates — unlike the public
// /units/[unitId] QR pages, this is a deliberately invite-only link
// (password + revocable), so it's treated as an internal share rather
// than public information.

export async function POST(req: Request) {
  const body = await req.json();
  const { token, password } = body;

  if (!token || !password) {
    return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: link } = await admin
    .from("occupancy_share_links")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!link) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }
  if ((link as any).revoked_at) {
    return NextResponse.json({ error: "This link has been revoked" }, { status: 403 });
  }
  if ((link as any).expires_at && new Date((link as any).expires_at) < new Date()) {
    return NextResponse.json({ error: "This link has expired" }, { status: 403 });
  }
  if (!verifyPassword(password, (link as any).password_hash, (link as any).password_salt)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const { data: location } = await admin
    .from("locations")
    .select("id, name, floorplan_image_url, floorplan_width, floorplan_height")
    .eq("id", (link as any).location_id)
    .single();

  const { data: units } = await admin
    .from("occupancy_units")
    .select("id, unit_code, category, manual_status, lease_type, company_name, end_date, workstations_total, size_sqm, size_sqft, hotspot_x, hotspot_y, hotspot_w, hotspot_h")
    .eq("location_id", (link as any).location_id);

  return NextResponse.json({
    ok: true,
    location,
    units: (units ?? []).map((u: any) => ({
      id: u.id,
      unit_code: u.unit_code,
      category: u.category,
      manual_status: u.manual_status,
      lease_type: u.lease_type,
      company_name: u.company_name,
      end_date: u.end_date,
      workstations_total: u.workstations_total,
      size_sqm: u.size_sqm,
      size_sqft: u.size_sqft,
      hotspot_x: u.hotspot_x,
      hotspot_y: u.hotspot_y,
      hotspot_w: u.hotspot_w,
      hotspot_h: u.hotspot_h,
    })),
  });
}
