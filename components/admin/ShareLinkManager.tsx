"use client";

import { useEffect, useState } from "react";
import { Link2, X, Copy, Ban } from "lucide-react";

type ShareLink = {
  id: string;
  token: string;
  label: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export default function ShareLinkManager({ locationId }: { locationId: string }) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [expiryOption, setExpiryOption] = useState("none");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  useEffect(() => {
    if (open) loadLinks();
  }, [open, locationId]);

  async function loadLinks() {
    const res = await fetch(`/api/occupancy-share?locationId=${locationId}`);
    const json = await res.json();
    if (res.ok) setLinks(json.links);
  }

  function expiresAtFromOption(): string | null {
    if (expiryOption === "none") return null;
    const days = { "7": 7, "30": 30, "90": 90 }[expiryOption];
    if (!days) return null;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  async function handleCreate() {
    setError("");
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/occupancy-share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId,
        password,
        label: label || null,
        expiresAt: expiresAtFromOption(),
      }),
    });
    const json = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(json.error || "Failed to create link.");
      return;
    }

    setNewLinkUrl(`${window.location.origin}/shared/occupancy/${json.token}`);
    setLabel("");
    setPassword("");
    setExpiryOption("none");
    loadLinks();
  }

  async function handleRevoke(id: string) {
    const confirmed = window.confirm("Revoke this link? Anyone using it will immediately lose access.");
    if (!confirmed) return;
    await fetch(`/api/occupancy-share/${id}/revoke`, { method: "POST" });
    loadLinks();
  }

  function linkStatus(link: ShareLink): { label: string; color: string } {
    if (link.revoked_at) return { label: "Revoked", color: "text-red-600" };
    if (link.expires_at && new Date(link.expires_at) < new Date()) return { label: "Expired", color: "text-charcoal/40" };
    return { label: "Active", color: "text-sage-600" };
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm border border-charcoal/15 rounded-lg px-3 py-2 hover:bg-sage-50"
      >
        <Link2 size={15} />
        Share
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] bg-charcoal/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">Share floor plan</h2>
              <button onClick={() => { setOpen(false); setNewLinkUrl(""); }}><X size={20} /></button>
            </div>

            <p className="text-sm text-charcoal/60 mb-4">
              Anyone with the link will need this password to view a
              read-only floor plan (availability status only — no company
              names, rent, or contract details). Revoke anytime to cut off
              access instantly.
            </p>

            {newLinkUrl ? (
              <div className="rounded-lg bg-sage-50 border border-sage-200 p-4 mb-4">
                <p className="text-sm font-medium text-charcoal mb-2">Link created — share this with them:</p>
                <div className="flex items-center gap-2">
                  <input readOnly value={newLinkUrl} className="input flex-1 text-xs" />
                  <button
                    onClick={() => navigator.clipboard.writeText(newLinkUrl)}
                    className="rounded-lg border border-charcoal/15 p-2 hover:bg-white"
                    title="Copy link"
                  >
                    <Copy size={15} />
                  </button>
                </div>
                <p className="text-xs text-charcoal/50 mt-2">
                  Share the password with them separately (not in the same message as the link).
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-5">
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Label (e.g. &quot;For Abir&quot;) — optional"
                  className="input"
                />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password"
                  className="input"
                />
                <select value={expiryOption} onChange={(e) => setExpiryOption(e.target.value)} className="input">
                  <option value="none">No expiration</option>
                  <option value="7">Expires in 7 days</option>
                  <option value="30">Expires in 30 days</option>
                  <option value="90">Expires in 90 days</option>
                </select>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={handleCreate}
                  disabled={creating || !password}
                  className="w-full rounded-lg bg-sage-500 text-cream py-2.5 text-sm font-medium disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create link"}
                </button>
              </div>
            )}

            <div className="border-t border-charcoal/10 pt-4">
              <p className="text-xs text-charcoal/40 uppercase tracking-wide mb-3">Existing links</p>
              {links.length === 0 ? (
                <p className="text-sm text-charcoal/40">No share links yet.</p>
              ) : (
                <div className="space-y-2">
                  {links.map((link) => {
                    const status = linkStatus(link);
                    return (
                      <div key={link.id} className="flex items-center justify-between text-sm border border-charcoal/10 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-charcoal/80">{link.label || "Untitled link"}</p>
                          <p className={`text-xs ${status.color}`}>
                            {status.label}
                            {link.expires_at && !link.revoked_at ? ` · expires ${new Date(link.expires_at).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                        {!link.revoked_at && (
                          <button
                            onClick={() => handleRevoke(link.id)}
                            className="flex items-center gap-1 text-xs text-red-600 border border-red-200 rounded-lg px-2 py-1.5 hover:bg-red-50"
                          >
                            <Ban size={13} />
                            Revoke
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgba(26,29,24,0.12);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-color: #7C8A6D; }
      `}</style>
    </>
  );
}
