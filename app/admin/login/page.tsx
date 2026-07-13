"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get("email") as string,
      password: form.get("password") as string,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-cream rounded-2xl p-8"
      >
        <h1 className="font-display text-2xl mb-1">flowork admin</h1>
        <p className="text-sm text-charcoal/60 mb-6">Sign in to manage the site.</p>
        <label className="block text-xs text-charcoal/50 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full border-b border-charcoal/20 bg-transparent py-2 mb-4 outline-none focus:border-sage-500"
        />
        <label className="block text-xs text-charcoal/50 mb-1">Password</label>
        <input
          name="password"
          type="password"
          required
          className="w-full border-b border-charcoal/20 bg-transparent py-2 mb-6 outline-none focus:border-sage-500"
        />
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-full bg-sage-500 text-cream py-3 text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
