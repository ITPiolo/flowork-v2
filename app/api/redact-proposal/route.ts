import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import mammoth from "mammoth";

// Extracts text from an uploaded .docx proposal, then asks an AI model to
// suggest which parts look like client-specific details (names, companies,
// prices, dates) that should be turned into placeholders before this
// becomes a reusable template.
//
// IMPORTANT: this only ever *suggests* redactions. A human must review
// and approve every change before it's saved as a template — see the
// review screen in the admin UI. Never wire this to auto-save.
//
// Requires ANTHROPIC_API_KEY in your environment variables to function.

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI redaction isn't configured yet. Add ANTHROPIC_API_KEY to your environment variables." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let originalText: string;
  try {
    const result = await mammoth.extractRawText({ buffer });
    originalText = result.value;
  } catch (err) {
    console.error("Docx extraction failed:", err);
    return NextResponse.json({ error: "Could not read this file. Only .docx is supported." }, { status: 400 });
  }

  if (!originalText.trim()) {
    return NextResponse.json({ error: "No readable text found in this document." }, { status: 400 });
  }

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `Below is the text of a business proposal. Identify anything that is SPECIFIC to the client it was sent to — client name, company name, contact details, specific prices, specific dates, or any other detail that would need to change for a different client. Replace each one with a clear placeholder like [CLIENT_NAME], [COMPANY_NAME], [PRICE], [DATE], etc.

Return ONLY the full text with these replacements made — no commentary, no explanation, just the redacted text.

--- DOCUMENT TEXT ---
${originalText}`,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI redaction request failed:", errText);
      return NextResponse.json({ error: "AI redaction request failed." }, { status: 500 });
    }

    const aiData = await aiRes.json();
    const suggestedText = aiData.content?.[0]?.text ?? "";

    return NextResponse.json({ originalText, suggestedText });
  } catch (err) {
    console.error("Redaction error:", err);
    return NextResponse.json({ error: "Something went wrong during redaction." }, { status: 500 });
  }
}