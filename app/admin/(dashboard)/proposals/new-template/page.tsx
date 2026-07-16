import ProposalRedactor from "@/components/admin/ProposalRedactor";

export default function NewTemplatePage() {
  return (
    <div>
      <h1 className="font-display text-2xl mb-2">Create Template</h1>
      <p className="text-sm text-charcoal/50 mb-6">
        Turn an already-sent proposal into a reusable, redacted template.
      </p>
      <ProposalRedactor />
    </div>
  );
}