"use client";

import { use, useState } from "react";
import SharedFloorplanViewer from "@/components/shared/SharedFloorplanViewer";

export default function SharedOccupancyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ location: never; units: never[] } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/occupancy-share/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const json = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(json.error || "Something went wrong.");
      return;
    }
    setData(json);
  }

  if (data) {
    return (
      <div className="min-h-screen bg-cream px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <SharedFloorplanViewer location={data.location} units={data.units} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-cream rounded-2xl w-full max-w-sm p-6">
        <h1 className="font-display text-xl mb-1">flowork floor plan</h1>
        <p className="text-sm text-charcoal/60 mb-4">Enter the password to view.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full border border-charcoal/15 rounded-lg px-3 py-2.5 text-sm mb-3 outline-none focus:border-sage-500"
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-full bg-sage-500 text-cream py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Checking..." : "View floor plan"}
        </button>
      </form>
    </div>
  );
}
