"use client";

// Infinite horizontal scrolling text band — a bold, high-visibility
// signature element common on award-tier sites. Pure CSS animation
// (no JS per-frame work), duplicated content so the loop is seamless.
export default function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const content = items.join("   •   ") + "   •   ";

  return (
    <div className={`relative overflow-hidden bg-charcoal py-6 ${className}`}>
      <div className="flex whitespace-nowrap marquee-track">
        <span className="font-display text-3xl md:text-4xl text-cream/90 italic pr-4">{content}</span>
        <span className="font-display text-3xl md:text-4xl text-cream/90 italic pr-4" aria-hidden="true">
          {content}
        </span>
      </div>
    </div>
  );
}
