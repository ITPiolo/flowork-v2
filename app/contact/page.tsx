import { Phone, Mail, MapPin } from "lucide-react";
import Reveal from "@/components/Reveal";
import EnquiryForm from "@/components/EnquiryForm";

export const metadata = {
  title: "Contact flowork | Dubai Business Centres",
  description: "Get in touch with flowork — Dubai Hills Business Park and Vision Tower, Business Bay.",
};

export default function ContactPage() {
  return (
    <section className="max-w-content mx-auto px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-16">
      <Reveal>
        <span className="eyebrow">Get in touch</span>
        <h1 className="font-display text-4xl md:text-5xl mt-2 mb-8">
          Let&rsquo;s talk about your workspace
        </h1>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-sage-500 mt-0.5 shrink-0" />
            <p className="text-charcoal/70">
              Dubai Hills Estate, Business Park, Building 4, 7th Floor,
              Dubai, United Arab Emirates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-sage-500 shrink-0" />
            <a href="tel:+97145608200" className="text-charcoal/70 hover:text-sage-600">
              +971 4 560 8200
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-sage-500 shrink-0" />
            <a href="mailto:connect@flowork.ae" className="text-charcoal/70 hover:text-sage-600">
              connect@flowork.ae
            </a>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <EnquiryForm />
      </Reveal>
    </section>
  );
}