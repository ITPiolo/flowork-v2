import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

// Checks every occupied unit for renewals due within 14 days and sends
// one digest email listing them. Intended to be called daily by Vercel
// Cron (see vercel.json) — safely no-ops if SMTP isn't configured yet,
// or if nothing is due for renewal.

const NOTIFY_EMAIL = "connect@flowork.ae";
const DAYS_AHEAD = 14;

export async function GET(req: Request) {
  // Protect against random public calls to this endpoint
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: units } = await supabase
    .from("occupancy_units")
    .select("*, locations(name)")
    .eq("manual_status", "occupied")
    .not("renewal_date", "is", null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + DAYS_AHEAD);

  const dueSoon = (units ?? []).filter((u: any) => {
    if (!u.renewal_date) return false;
    const renewal = new Date(u.renewal_date);
    renewal.setHours(0, 0, 0, 0);
    return renewal >= today && renewal <= cutoff;
  });

  if (dueSoon.length === 0) {
    return NextResponse.json({ ok: true, message: "No renewals due — nothing sent." });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({
      ok: false,
      message: `${dueSoon.length} renewal(s) due, but SMTP isn't configured yet — no email sent.`,
      dueSoon: dueSoon.map((u: any) => u.unit_code),
    });
  }

  const rows = dueSoon
    .map(
      (u: any) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${u.locations?.name ?? "—"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${u.unit_code}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${u.company_name ?? "—"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${u.renewal_date}</td>
        </tr>`
    )
    .join("");

  const html = `
    <h2>Upcoming lease renewals — next ${DAYS_AHEAD} days</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <thead>
        <tr style="background:#F1F3ED;text-align:left;">
          <th style="padding:8px;">Location</th>
          <th style="padding:8px;">Unit</th>
          <th style="padding:8px;">Company</th>
          <th style="padding:8px;">Renewal date</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px;"><a href="https://flowork.ae/admin/occupancy">View in admin</a></p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: NOTIFY_EMAIL,
      subject: `${dueSoon.length} lease renewal(s) due in the next ${DAYS_AHEAD} days`,
      html,
    });

    return NextResponse.json({ ok: true, sent: dueSoon.length });
  } catch (err) {
    console.error("Renewal notification email failed:", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}