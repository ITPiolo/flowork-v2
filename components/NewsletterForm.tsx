"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const email = new FormData(e.currentTarget).get("email");
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus("success");
  }

  if (status === "success") {
    return <p className="text-sage-300 text-sm">You're subscribed — thank you.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="email"
        name="email"
        required
        placeholder="Email address"
        className="flex-1 bg-transparent border-b border-cream/30 text-cream placeholder:text-cream/40 text-sm py-2 outline-none focus:border-sage-500"
      />
      <button
        disabled={status === "loading"}
        className="rounded-full bg-sage-500 text-cream px-5 py-2 text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
    </form>
  );
}
