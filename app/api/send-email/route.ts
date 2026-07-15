import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

// Sends emails (proposals, follow-ups, etc.) via your Microsoft 365 mailbox
// using SMTP. Safely returns a clear error until these env vars are set:
//   SMTP_HOST     e.g. smtp.office365.com
//   SMTP_PORT     e.g. 587
//   SMTP_USER     the M365 mailbox address sending these emails
//   SMTP_PASS     the app password generated from that M365 account

export async function POST(req: Request) {
  // Require a logged-in admin session — this endpoint sends real emails
  // on the company's behalf, so it must never be publicly callable.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json(
      { error: "Email sending isn't configured yet. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to your environment variables." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { to, cc, bcc, subject, html } = body;

  if (!to || !subject || !html) {
    return NextResponse.json({ error: "Missing to, subject, or body" }, { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Email send failed:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}