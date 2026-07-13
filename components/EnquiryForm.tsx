"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
}: {
  defaultService?: string;
  defaultLocation?: string;
  heading?: string;
  ctaLabel?: string;
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

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-sage-300 bg-sage-50 p-8 text-center"
      >
        <p className="font-display text-2xl text-sage-700">Thank you</p>
        <p className="mt-2 text-sm text-charcoal/70">
          A member of the flowork team will be in touch shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <div id="enquire">
      <h3 className="font-display text-2xl md:text-3xl">{heading}</h3>
      <p className="mt-2 text-sm text-charcoal/60 max-w-md">
        Fill out the form and a member of the flowork team will contact you
        soon.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Field label="Service">
          <select name="service" defaultValue={defaultService} className="form-input">
            {SERVICES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Full Name">
          <input name="full_name" required className="form-input" />
        </Field>

        <Field label="Email">
          <input type="email" name="email" required className="form-input" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Number of people">
            <select name="people_count" defaultValue="1-4" className="form-input">
              <option>1-4</option>
              <option>5-10</option>
              <option>11-20</option>
              <option>20+</option>
            </select>
          </Field>
          <Field label="Phone number">
            <input name="phone" required className="form-input" />
          </Field>
        </div>

        <Field label="Company Name">
          <input name="company_name" className="form-input" />
        </Field>

        <Field label="Location">
          <select name="location" defaultValue={defaultLocation} className="form-input">
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-sage-500 text-cream py-3.5 text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "Sending..." : ctaLabel}
        </button>

        <AnimatePresence>
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-600"
            >
              Something went wrong. Please try again or WhatsApp us directly.
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      <style jsx>{`
        .form-input {
          width: 100%;
          border: none;
          border-bottom: 1px solid rgba(26, 29, 24, 0.15);
          background: transparent;
          padding: 0.5rem 0;
          font-size: 0.9rem;
          outline: none;
        }
        .form-input:focus {
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