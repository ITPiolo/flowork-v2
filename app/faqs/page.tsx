"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";

const FAQS = [
  {
    q: "What is coworking?",
    a: "Coworking spaces offer flexibility by allowing workers to adjust their work environment and choose from various membership options to fit their needs. These spaces enhance professional identities by fostering a sense of belonging and providing environments conducive to networking and making positive impressions on clients. Research shows that coworking spaces improve employee well-being, with many members feeling healthier, more focused, and more productive compared to traditional office or home settings. They also support job-crafting, enabling workers to build relationships outside their organization and engage in a communal environment with social activities. Ultimately, coworking spaces create a sense of community, which is crucial for engagement and retention, especially in remote work scenarios, with community managers organizing workshops and networking events.",
  },
  {
    q: "Why flowork?",
    a: "\"flowork offers modern serviced offices and coworking spaces with IT infrastructure, fast and secure internet, and access to in-house IT experts.\" Benefit from a dedicated telephone number and receptionist to answer your calls, access to photocopiers, printers, scanners, and other office equipment, bookable meeting rooms and boardrooms, a professional team of secretaries to take calls and process mail, and fully stocked photo and recording studio rentals.",
  },
  {
    q: "Can I book a meeting room or event space without being a member?",
    a: "Yes, you can book our meeting rooms and event spaces even if you're not a member. We offer flexible booking options for individuals and businesses who need a professional space for meetings, workshops, or events. Please contact us or visit our website for more information on booking options.",
  },
  {
    q: "Can I bring guests or clients to the coworking space?",
    a: "Absolutely! You are welcome to bring guests or clients to our coworking spaces. We understand the importance of collaboration and networking, and we encourage interactions among members and their guests. Please check with our staff regarding any specific policies or guidelines for hosting guests.",
  },
  {
    q: "Can I customize my private office or workspace?",
    a: "We provide offices of all sizes, offering flexibility in personalizing your private office or workspace to meet your needs. We strive to accommodate customization requests whenever possible. Please reach out to our team to discuss your specific requirements.",
  },
  {
    q: "Are there networking events or community activities at flowork?",
    a: "Yes, we regularly host networking events, workshops, and community activities to foster connections and collaboration among our members. These events provide opportunities to network, learn from industry experts, and engage with like-minded professionals. Stay updated on our upcoming events by subscribing to our newsletter or checking our event calendar.",
  },
  {
    q: "What safety measures do you have in place?",
    a: "The safety and well-being of our members are our top priorities. We have implemented various safety measures, including secure access systems, CCTV surveillance, regular cleaning and sanitization, and adherence to health and safety guidelines. We continuously monitor and update our protocols to ensure a safe and comfortable workspace for everyone.",
  },
];

export default function FAQsPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="max-w-content mx-auto px-6 lg:px-8 py-16 max-w-3xl">
      <Reveal>
        <span className="eyebrow">Support</span>
        <h1 className="font-display text-4xl md:text-5xl mt-2 mb-4">
          Frequently asked questions
        </h1>
        <p className="text-charcoal/60 mb-12">
          Browse helpful answers to common questions about flowork.
        </p>
      </Reveal>

      <div className="divide-y divide-charcoal/10 border-t border-b border-charcoal/10">
        {FAQS.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="font-display text-lg pr-4">{item.q}</span>
              <motion.span
                animate={{ rotate: open === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 text-sage-500"
              >
                <ChevronDown size={20} />
              </motion.span>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-charcoal/60 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}