import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using flowork's services and website.",
};

export default function TermsPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
      <Reveal>
        <span className="eyebrow">Legal</span>
        <h1 className="font-display text-4xl md:text-5xl mt-2 mb-10">
          Terms of Service
        </h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="prose prose-neutral max-w-none space-y-6 text-charcoal/70 leading-relaxed">
          <p className="text-sm text-charcoal/40">Last updated: [insert date]</p>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Acceptance of terms</h2>
            <p>
              By accessing this website or enquiring about flowork's
              workspace services, you agree to these terms. If you do not
              agree, please do not use this site or our services.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Services</h2>
            <p>
              flowork provides serviced office space, coworking, meeting
              rooms, virtual offices, and podcast room facilities across our
              Dubai Hills and Business Bay (Vision Tower) locations.
              Availability, pricing, and package inclusions are subject to
              change and confirmed at the time of booking.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Enquiries and bookings</h2>
            <p>
              Submitting an enquiry through this website does not constitute
              a confirmed booking or membership. All bookings are subject to
              availability and confirmation by a member of the flowork team.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Website use</h2>
            <p>
              You agree not to misuse this website, including attempting to
              disrupt its operation, submitting false information through
              our forms, or using automated tools to scrape or spam our
              systems.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Limitation of liability</h2>
            <p>
              flowork is not liable for any indirect or consequential loss
              arising from use of this website. Nothing in these terms
              limits liability for matters that cannot be excluded under
              UAE law.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-charcoal mb-2">Contact us</h2>
            <p>
              Questions about these terms can be directed to{" "}
              <a href="mailto:connect@flowork.ae" className="text-sage-600 underline">
                connect@flowork.ae
              </a>.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}