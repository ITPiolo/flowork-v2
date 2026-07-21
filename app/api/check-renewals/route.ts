import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

// Checks every occupied unit for contracts ending within the next 3
// months and sends one digest email flagging them for the manager to
// call about renewal — company name + office number, since that's who
// they'll be talking to. Each unit is only ever flagged once
// (renewal_notified_at is stamped after sending) so this doesn't spam
// the same digest every day for 3 months straight. Intended to be
// called daily by Vercel Cron (see vercel.json) — safely no-ops if SMTP
// isn't configured yet, or if nothing new is due.

const NOTIFY_EMAILS = ["cielo@flowork.me", "connect@flowork.me"];
const MONTHS_AHEAD = 3;

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
    .not("end_date", "is", null)
    .is("renewal_notified_at", null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setMonth(cutoff.getMonth() + MONTHS_AHEAD);

  const dueSoon = (units ?? []).filter((u: any) => {
    if (!u.end_date) return false;
    const endDate = new Date(u.end_date);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today && endDate <= cutoff;
  });

  if (dueSoon.length === 0) {
    return NextResponse.json({ ok: true, message: "No new renewals due — nothing sent." });
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
          <td style="padding:8px;border-bottom:1px solid #eee;">${u.end_date}</td>
        </tr>`
    )
    .join("");

  const html = `
    <h2>Leases ending within the next ${MONTHS_AHEAD} months — renewal check-in needed</h2>
    <p style="font-family:sans-serif;font-size:14px;color:#555;">
      Reach out to these companies to confirm whether they're renewing.
    </p>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <thead>
        <tr style="background:#F1F3ED;text-align:left;">
          <th style="padding:8px;">Location</th>
          <th style="padding:8px;">Office</th>
          <th style="padding:8px;">Company</th>
          <th style="padding:8px;">End date</th>
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
      to: NOTIFY_EMAILS,
      subject: `${dueSoon.length} lease(s) ending within ${MONTHS_AHEAD} months — renewal check-in needed`,
      html,
    });

    await supabase
      .from("occupancy_units")
      .update({ renewal_notified_at: new Date().toISOString() } as never)
      .in(
        "id",
        dueSoon.map((u: any) => u.id)
      );

    return NextResponse.json({ ok: true, sent: dueSoon.length });
  } catch (err) {
    console.error("Renewal notification email failed:", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
