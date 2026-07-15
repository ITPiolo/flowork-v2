import { CheckCircle2, Circle, Copy } from "lucide-react";

const INTEGRATIONS = [
  {
    id: "meta",
    name: "Meta Lead Ads",
    description: "Facebook & Instagram lead form submissions flow directly into your pipeline.",
    connected: false,
    setupNote: "Requires a Meta Business App with a Lead Ads webhook subscription pointing to the URL below. Your marketing team or Meta Business Suite admin sets this up on Meta's side.",
  },
  {
    id: "property-finder",
    name: "Property Finder",
    description: "Enquiries from your Property Finder listings.",
    connected: false,
    setupNote: "Property Finder doesn't offer a public webhook for all account tiers — check with your account manager whether your plan supports CRM integration. If not, leads will need to be forwarded manually or via email parsing (ask us about this later).",
  },
  {
    id: "bayut",
    name: "Bayut",
    description: "Enquiries from your Bayut listings.",
    connected: false,
    setupNote: "Same as Property Finder — check with your Bayut account manager about webhook/API access for your account.",
  },
  {
    id: "email-m365",
    name: "Microsoft 365 Email Notifications",
    description: "Get an email alert in Outlook the moment a new website enquiry comes in.",
    connected: false,
    setupNote: "Requires an SMTP app password generated from your M365 account. Ready to activate whenever you have it.",
  },
];

export default function IntegrationsPage() {
  const webhookBase = "https://flowork.ae/api/leads";

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">Integrations</h1>
      <p className="text-sm text-charcoal/50 mb-8">
        Connect external lead sources so everything lands in one pipeline.
        Nothing here is live yet — this is ready to activate whenever you
        have access/credentials for each platform.
      </p>

      <div className="grid gap-4">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.id}
            className="bg-white rounded-xl border border-charcoal/10 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <CheckCircle2 size={18} className="text-sage-500" />
                  ) : (
                    <Circle size={18} className="text-charcoal/20" />
                  )}
                  <h2 className="font-display text-lg">{integration.name}</h2>
                </div>
                <p className="text-sm text-charcoal/60 mt-1 ml-6">{integration.description}</p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${
                  integration.connected
                    ? "bg-sage-100 text-sage-700"
                    : "bg-charcoal/5 text-charcoal/40"
                }`}
              >
                {integration.connected ? "Connected" : "Not connected"}
              </span>
            </div>

            <div className="ml-6 mt-4 bg-sage-50/50 rounded-lg p-4">
              <p className="text-xs text-charcoal/60 leading-relaxed">{integration.setupNote}</p>
              {integration.id !== "email-m365" && (
                <div className="mt-3 flex items-center gap-2">
                  <code className="text-xs bg-white border border-charcoal/10 rounded px-2 py-1.5 flex-1 overflow-x-auto whitespace-nowrap">
                    {webhookBase}/{integration.id}?token=YOUR_SECRET
                  </code>
                  <Copy size={14} className="text-charcoal/30 shrink-0" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-charcoal text-cream rounded-xl p-6">
        <h2 className="font-display text-lg mb-2">One-time setup needed first</h2>
        <p className="text-sm text-cream/70">
          Before connecting any source above, add a{" "}
          <code className="bg-cream/10 px-1.5 py-0.5 rounded text-xs">LEADS_WEBHOOK_SECRET</code>{" "}
          environment variable (any random string works) in both your local{" "}
          <code className="bg-cream/10 px-1.5 py-0.5 rounded text-xs">.env.local</code> and Vercel's
          Environment Variables — this protects your intake endpoint from
          random internet traffic. Use that same value in place of{" "}
          <code className="bg-cream/10 px-1.5 py-0.5 rounded text-xs">YOUR_SECRET</code> in the URLs above.
        </p>
      </div>
    </div>
  );
}