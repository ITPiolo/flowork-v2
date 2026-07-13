import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Privacy Policy",
  description: "How flowork collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
      <Reveal>
        <span className="eyebrow">Legal</span>
        <h1 className="font-display text-4xl md:text-5xl mt-2 mb-10">
          Privacy Policy
        </h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="prose prose-neutral max-w-none space-y-6 text-charcoal/70 leading-relaxed">
          <p className="text-sm text-charcoal/40">Last updated: [insert date]</p>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Information we collect</h2>
            <p>
              When you submit an enquiry or subscribe to our newsletter, we
              collect information such as your name, email address, phone
              number, company name, and details about the workspace you're
              interested in. This information is used solely to respond to
              your enquiry and provide the services you've requested.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">How we use your information</h2>
            <p>
              We use the information you provide to respond to enquiries,
              schedule tours, process membership applications, and — where
              you've opted in — send updates about flowork's services,
              locations, and offers. We do not sell or share your personal
              information with third parties for their own marketing
              purposes.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Data storage and security</h2>
            <p>
              Your information is stored securely using industry-standard
              practices. We retain enquiry and membership data only as long
              as necessary to provide our services or as required by law.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your
              personal information at any time by contacting us at{" "}
              <a href="mailto:connect@flowork.ae" className="text-sage-600 underline">
                connect@flowork.ae
              </a>.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Contact us</h2>
            <p>
              If you have questions about this policy, reach us at{" "}
              <a href="mailto:connect@flowork.ae" className="text-sage-600 underline">
                connect@flowork.ae
              </a>{" "}
              or +971 4 560 8200.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}