"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

const TEXT_SIGNATURE = `Best regards,

The flowork Team
Dubai Hills Estate, Business Park, Building 4, 7th Floor, Dubai, UAE
+971 4 560 8200 | connect@flowork.ae`;

const HTML_SIGNATURE = `
<table style="font-family: sans-serif; font-size: 13px; color: #333;">
  <tr>
    <td style="padding-right: 16px;">
      <img src="https://flowork.ae/images/flowork-logo-black.png" alt="flowork" width="90" />
    </td>
    <td style="border-left: 2px solid #7C8A6D; padding-left: 16px;">
      <strong>The flowork Team</strong><br/>
      Dubai Hills Estate, Business Park, Building 4, 7th Floor, Dubai, UAE<br/>
      +971 4 560 8200 &nbsp;|&nbsp; connect@flowork.ae
    </td>
  </tr>
</table>
`.trim();

function normalizeEmails(input: string) {
  return input
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .join(", ");
}

export default function EmailComposer({
  defaultTo = "",
  defaultSubject = "",
  onClose,
}: {
  defaultTo?: string;
  defaultSubject?: string;
  onClose: () => void;
}) {
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [useHtmlSignature, setUseHtmlSignature] = useState(true);
  const [signature, setSignature] = useState(HTML_SIGNATURE);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  function toggleSignatureMode(useHtml: boolean) {
    setUseHtmlSignature(useHtml);
    setSignature(useHtml ? HTML_SIGNATURE : TEXT_SIGNATURE);
  }

  async function handleSend() {
    setSending(true);
    setResult(null);

    const bodyHtml = body.replace(/\n/g, "<br/>");
    const signatureHtml = useHtmlSignature ? signature : signature.replace(/\n/g, "<br/>");
    const html = `${bodyHtml}<br/><br/>${signatureHtml}`;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: normalizeEmails(to),
          cc: normalizeEmails(cc),
          bcc: normalizeEmails(bcc),
          subject,
          html,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error || "Failed to send." });
      } else {
        setResult({ ok: true, message: "Email sent." });
      }
    } catch {
      setResult({ ok: false, message: "Something went wrong." });
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-[200] bg-charcoal/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-charcoal/10">
          <h2 className="font-display text-xl">Compose email</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="To" hint="Separate multiple addresses with commas">
            <input value={to} onChange={(e) => setTo(e.target.value)} className="input" placeholder="recipient@company.com, another@company.com" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CC" hint="Comma-separated">
              <input value={cc} onChange={(e) => setCc(e.target.value)} className="input" placeholder="optional" />
            </Field>
            <Field label="BCC" hint="Comma-separated">
              <input value={bcc} onChange={(e) => setBcc(e.target.value)} className="input" placeholder="optional" />
            </Field>
          </div>
          <Field label="Subject">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input" />
          </Field>
          <Field label="Message">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="input" placeholder="Write your message..." />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="block text-xs text-charcoal/50">Signature</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => toggleSignatureMode(false)}
                  className={`text-xs px-2 py-1 rounded ${!useHtmlSignature ? "bg-sage-500 text-cream" : "bg-charcoal/5 text-charcoal/50"}`}
                >
                  Plain text
                </button>
                <button
                  type="button"
                  onClick={() => toggleSignatureMode(true)}
                  className={`text-xs px-2 py-1 rounded ${useHtmlSignature ? "bg-sage-500 text-cream" : "bg-charcoal/5 text-charcoal/50"}`}
                >
                  HTML (with logo)
                </button>
              </div>
            </div>
            {useHtmlSignature ? (
              <>
                <textarea
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  rows={6}
                  className="input font-mono text-xs"
                />
                <p className="text-xs text-charcoal/40 mt-1">
                  Raw HTML — edit the image URL to point at your logo in the{" "}
                  <a href="/admin/media" target="_blank" className="text-sage-600 underline">Media Library</a>.
                </p>
                <div className="mt-2 border border-charcoal/10 rounded-lg p-3 bg-charcoal/[0.02]">
                  <p className="text-xs text-charcoal/40 mb-2">Preview:</p>
                  <div dangerouslySetInnerHTML={{ __html: signature }} />
                </div>
              </>
            ) : (
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={5}
                className="input text-charcoal/60"
              />
            )}
          </div>

          {result && (
            <p className={`text-sm ${result.ok ? "text-sage-600" : "text-red-600"}`}>{result.message}</p>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !to || !subject}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-sage-500 text-cream py-3 text-sm font-medium disabled:opacity-60"
          >
            <Send size={16} />
            {sending ? "Sending..." : "Send email"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgba(26, 29, 24, 0.12);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #7c8a6d;
        }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-charcoal/50 mb-1">
        {label}
        {hint && <span className="text-charcoal/30"> — {hint}</span>}
      </span>
      {children}
    </label>
  );
}