"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

const DEFAULT_SIGNATURE = `
Best regards,

The flowork Team
Dubai Hills Estate, Business Park, Building 4, 7th Floor, Dubai, UAE
+971 4 560 8200 | connect@flowork.ae
`.trim();

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
  const [signature, setSignature] = useState(DEFAULT_SIGNATURE);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSend() {
    setSending(true);
    setResult(null);

    const html = `${body.replace(/\n/g, "<br/>")}<br/><br/>${signature.replace(/\n/g, "<br/>")}`;

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, cc, bcc, subject, html }),
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
          <Field label="To">
            <input value={to} onChange={(e) => setTo(e.target.value)} className="input" placeholder="recipient@company.com" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CC">
              <input value={cc} onChange={(e) => setCc(e.target.value)} className="input" placeholder="optional" />
            </Field>
            <Field label="BCC">
              <input value={bcc} onChange={(e) => setBcc(e.target.value)} className="input" placeholder="optional" />
            </Field>
          </div>
          <Field label="Subject">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input" />
          </Field>
          <Field label="Message">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="input" placeholder="Write your message..." />
          </Field>
          <Field label="Signature">
            <textarea value={signature} onChange={(e) => setSignature(e.target.value)} rows={5} className="input text-charcoal/60" />
          </Field>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-charcoal/50 mb-1">{label}</span>
      {children}
    </label>
  );
}