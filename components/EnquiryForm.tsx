"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Mail, ArrowRight } from "lucide-react";

const SERVICES = [
  "Private Office",
  "Coworking",
  "Meeting Room",
  "Virtual Office",
  "Podcast Room",
  "Business Address with Ejari",
  "Virtual Office with Ejari",
  "Flexi Desk with Ejari",
];

const LOCATIONS = ["Dubai Hills Business Park", "Vision Tower Business Bay"];

export default function EnquiryForm({
  defaultService = "Private Office",
  defaultLocation = "Vision Tower Business Bay",
  heading = "Let us find your ideal workspace",
  ctaLabel = "Enquire Now",
  anchorId = "enquire",
}: {
  defaultService?: string;
  defaultLocation?: string;
  heading?: string;
  ctaLabel?: string;
  anchorId?: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  // Split heading into a lead line + an italic accent on the final phrase,
  // e.g. "Let us find your" / "ideal workspace." — matches the reference design.
  const words = heading.split(" ");
  const accentWords = words.length > 2 ? words.slice(-2) : words.slice(-1);
  const leadWords = words.slice(0, words.length - accentWords.length);

  return (
    <div
      {...(anchorId ? { id: anchorId } : {})}
      className="rounded-3xl bg-charcoal text-cream p-6 sm:p-8 md:p-10"
    >
      <div className="mb-8">
        <span className="eyebrow text-sage-300">Get in touch</span>
        <h3 className="font-display text-2xl sm:text-3xl mt-3 leading-tight">
          {leadWords.length > 0 && <>{leadWords.join(" ")} </>}
          <span className="italic text-sand">{accentWords.join(" ")}</span>
        </h3>
        <p className="mt-4 text-cream/60 max-w-md text-sm">
          Discover your perfect workspace by filling out the form and a
          member of the flowork team will contact you soon.
        </p>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <a href="tel:+97145608200" className="flex items-center gap-2 text-sm text-cream/80 hover:text-cream">
            <Phone size={15} className="text-sage-300" />
            +971 4 560 8200
          </a>
          <a href="https://wa.me/971504301555" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-cream/80 hover:text-cream">
            <MessageCircle size={15} className="text-sage-300" />
            +971 50 430 1555
          </a>
          <a href="mailto:connect@flowork.ae" className="flex items-center gap-2 text-sm text-cream/80 hover:text-cream">
            <Mail size={15} className="text-sage-300" />
            connect@flowork.ae
          </a>
        </div>
      </div>

      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-sage-500/30 bg-sage-500/10 p-8 text-center"
        >
          <p className="font-display text-2xl text-sage-300">Thank you</p>
          <p className="mt-2 text-sm text-cream/60">
            A member of the flowork team will be in touch shortly.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Service required">
            <select name="service" defaultValue={defaultService} className="form-input">
              {SERVICES.map((s) => (
                <option key={s} value={s} className="bg-charcoal">
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full name">
              <input name="full_name" placeholder="Your name" required className="form-input" />
            </Field>
            <Field label="Email">
              <input type="email" name="email" placeholder="you@company.com" required className="form-input" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Phone number">
              <input name="phone" placeholder="+971 50 000 0000" required className="form-input" />
            </Field>
            <Field label="Company name">
              <input name="company_name" placeholder="Company" className="form-input" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Number of people">
              <select name="people_count" defaultValue="1-4" className="form-input">
                <option className="bg-charcoal">1-4</option>
                <option className="bg-charcoal">5-10</option>
                <option className="bg-charcoal">11-20</option>
                <option className="bg-charcoal">20+</option>
              </select>
            </Field>
            <Field label="Location">
              <select name="location" defaultValue={defaultLocation} className="form-input">
                {LOCATIONS.map((l) => (
                  <option key={l} value={l} className="bg-charcoal">
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-sage-500 text-cream py-4 text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-60"
          >
            {status === "loading" ? "Sending..." : ctaLabel}
            {status !== "loading" && <ArrowRight size={16} />}
          </button>

          <AnimatePresence>
            {status === "error" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-400"
              >
                Something went wrong. Please try again or WhatsApp us directly.
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      )}

      <style jsx>{`
        .form-input {
          width: 100%;
          border: none;
          border-bottom: 1px solid rgba(247, 245, 239, 0.2);
          background: transparent;
          color: #f7f5ef;
          padding: 0.6rem 0;
          font-size: 0.9rem;
          outline: none;
        }
        .form-input::placeholder {
          color: rgba(247, 245, 239, 0.35);
        }
        .form-input:focus {
          border-color: #c9a876;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs tracking-wide uppercase text-cream/50 mb-2">{label}</span>
      {children}
    </label>
  );
}